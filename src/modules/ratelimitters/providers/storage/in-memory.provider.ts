import { Injectable } from '@nestjs/common';
import { IStorageRateLimit } from '../../interfaces/storage.interface';
import { RateLimitInfo } from '../../types/ratelimit-info.type';

@Injectable()
export class InMemoryProvider implements IStorageRateLimit {
  private store = new Map<string, RateLimitInfo>();

  async get(key: string): Promise<RateLimitInfo | undefined> {
    return this.store.get(key);
  }

  async set(key: string, info: RateLimitInfo): Promise<void> {
    this.store.set(key, info);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async increment(
    key: string,
    windowMs: number,
    maxAttempts: number,
  ): Promise<{ currentCount: number; blocked: boolean; blockedUntil?: number }> {
    
    const now = Date.now();
    let info = this.store.get(key);
    // Jika tidak ada, buat baru
    if (!info) {
      info = { count: 1, firstAttempt: now };
      this.store.set(key, info);
      
      return { currentCount: 1, blocked: false };
    }

    // Jika sedang diblokir, cek apakah masa blokir sudah habis
    if (info.blockedUntil && info.blockedUntil > now) {
      // Masih diblokir
      return {
        currentCount: info.count,
        blocked: true,
        blockedUntil: info.blockedUntil,
      };
    } else if (info.blockedUntil && info.blockedUntil <= now) {
      // Masa blokir habis, reset
      info = { count: 1, firstAttempt: now };
      this.store.set(key, info);
      return { currentCount: 1, blocked: false };
    }

    // Masih dalam window?
    if (now - info.firstAttempt <= windowMs) {
      info.count++;
      if (info.count >= maxAttempts) {
        info.blockedUntil = now + windowMs; // blokir selama window yang sama
        this.store.set(key, info);
        return {
          currentCount: info.count,
          blocked: true,
          blockedUntil: info.blockedUntil,
        };
      }
      this.store.set(key, info);
      return { currentCount: info.count, blocked: false };
    } else {
      // Window lewat, reset
      info = { count: 1, firstAttempt: now };
      this.store.set(key, info);
      return { currentCount: 1, blocked: false };
    }
  }
}