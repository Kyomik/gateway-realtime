import { Injectable, Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config'; // <-- pakai import type
import rateLimitConfig from '../rate-limit.config';
import { IStorageRateLimit } from '../interfaces/storage.interface';
import { InMemoryProvider } from '../providers/storage/in-memory.provider';
// import { RedisRateLimitStorage } from './providers/redis-rate-limit.storage';

@Injectable()
export class RatelimitStorageFactory {
  private readonly storageMap: Record<string, IStorageRateLimit>;

  constructor(
    @Inject(rateLimitConfig.KEY)
    private readonly config: ConfigType<typeof rateLimitConfig>,
    private readonly inMemoryProvider: InMemoryProvider,
    // private readonly redisStorage: RedisRateLimitStorage,
  ) {
    this.storageMap = {
      memory: this.inMemoryProvider,
      // redis: this.redisStorage,
    };
  }

  getStorage(): IStorageRateLimit {
    const storage = this.storageMap[this.config.storage];
    if (!storage) {
      throw new Error(`Unsupported rate limit storage: ${this.config.storage}`);
    }
    
    return storage;
  }
}