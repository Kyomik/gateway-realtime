import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import rateLimitConfig from '../rate-limit.config';
import { RatelimitStorageFactory } from './storage.factory';
import { IStorageRateLimit } from '../interfaces/storage.interface';
import { RuleNameType } from '../types/rulename.type';
import { TransportType } from '../types/transport.type';

@Injectable()
export class RateLimitService {
  private storage: IStorageRateLimit;

  constructor(
    private readonly storageFactory: RatelimitStorageFactory,
    @Inject(rateLimitConfig.KEY)
    private readonly config: ConfigType<typeof rateLimitConfig>,
  ) {
    this.storage = this.storageFactory.getStorage();
  }

  private getRule(
    socket: TransportType, 
    ruleName: RuleNameType
  ): { windowMs: number; maxAttempts: number } {
    
    const rule = this.config.rules[socket][ruleName];
    
    if (socket === 'ws') {
      // rule sudah memiliki windowMs dan maxAttempts
      return rule as { windowMs: number; maxAttempts: number };
    } else if (socket === 'rest') {
      // rest: rule memiliki ttl (detik) dan limit
      const restRule = rule as { ttl: number; limit: number };
      return {
        windowMs: restRule.ttl * 1000,
        maxAttempts: restRule.limit,
      };
    }
    
    // Jika socket tidak dikenal, lempar error (tidak mungkin terjadi karena tipe sudah dibatasi)
    throw new Error(`Unknown socket type: ${socket}`);
  }

  async allow(
    key: string,
    socket: TransportType,
    ruleName: RuleNameType,
  ): Promise<boolean> {

    const { windowMs, maxAttempts } = this.getRule(socket, ruleName);
    const result = await this.storage.increment(key, windowMs, maxAttempts);
    
    return !result.blocked;
  }

  async getBlockRemaining(key: string): Promise<number | null> {
    const info = await this.storage.get(key);
    if (!info?.blockedUntil) return null;
    const remaining = info.blockedUntil - Date.now();
    return remaining > 0 ? remaining : null;
  }

  async reset(key: string): Promise<void> {
    await this.storage.delete(key);
  }
}