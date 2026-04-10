import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import rateLimitConfig from './rate-limit.config';
import { InMemoryProvider } from './providers/storage/in-memory.provider';
import { RateLimitService } from './services/rate-limit.service';
import { RestRateLimitGuard } from './guards/rest-ratelimit.guard';
import { RatelimitStorageFactory } from './services/storage.factory';
import { KeyExtractorFactory } from './services/key-extractor.factory';
import { PreConnectKeyExtractor as PreConnectRest } from './providers/key-extractor/rest/pre-connect.status';
import { PostConnectKeyExtractor as PostconnectRest } from './providers/key-extractor/rest/post-connect.status';
import { PreConnectKeyExtractor as PreConnectWs } from './providers/key-extractor/ws/pre-connect.status';
import { WebsocketRateLimitGuard } from './guards/websocket-ratelimit.guard';

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(rateLimitConfig),
  ],
  providers: [
    InMemoryProvider,
    RatelimitStorageFactory,
    KeyExtractorFactory,
    PreConnectRest,
    PostconnectRest,
    PreConnectWs,
    RestRateLimitGuard,
    WebsocketRateLimitGuard,
    RateLimitService,
    Reflector,
  ],
  exports: [
    RestRateLimitGuard,
    WebsocketRateLimitGuard,
    KeyExtractorFactory,
    RateLimitService
  ]
})
export class RateLimitModule {}