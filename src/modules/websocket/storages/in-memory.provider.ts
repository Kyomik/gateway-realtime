// import { Injectable } from '@nestjs/common';
// import { IStorageRateLimit } from '../../interfaces/storage.interface';
// import { RateLimitInfo } from '../../types/ratelimit-info.type';

// @Injectable()
// export class InMemoryProvider implements IStorageRateLimit {
//   private sessions = new Map<number, WsSession>();
  
//   private tenantDevices = new Map<string, Set<WsSession>>();
//   private tenantBrowsers = new Map<string, Set<WsSession>>();

//   async get(key: string): Promise<RateLimitInfo | undefined> {
//     return this.store.get(key);
//   }

//   async set(key: string, info: RateLimitInfo): Promise<void> {
//     this.store.set(key, info);
//   }

//   async delete(key: string): Promise<void> {
//     this.store.delete(key);
//   }

// }