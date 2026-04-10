import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { AuthModule } from '../auth/auth.module';
import { WebhookModule } from '../webhook/webhook.module';
import { WsQueryPipe } from './pipes/ws-query.pipe';
import { WebSocketSessionRegistry } from './services/websocket-registry.service';
import { WebSocketMessageService } from './services/websocket-message.service';
import { WebSocketSessionManager } from './services/websocket-sesi-manager.service';
import { WebSocketHeartbeatService } from './services/websocket-hearbeat.service';
import { WS_EVENT_JSON_CLASSES } from './events/json';
import { WS_EVENT_BINNER_CLASSES } from './events/binner';
import { EventModule } from '../event/event.module';
import { LifecycleFactory } from './services/lifecycle-factory.service';
import { DefaultLifecycle } from './lifesycles/default.lifesycle';
import { BrowserHelper } from './events/helpers/browser.helper';
import { DeviceHelper } from './events/helpers/device.helper';
import { EventHelperFactory } from './events/helpers/helper.factory';
import { DefaultHelper } from './events/helpers/default.helper';
import { EventStoreService } from './services/event-store.service';
import { EventRetryService } from './services/event-retry-heartbeat.service';
import { WebSocketAuthGuard } from './guards/websocket-auth.guard';

@Module({
  imports: [
    AuthModule, 
    EventModule, 
    WebhookModule,
  ],
  providers: [
    WebSocketSessionRegistry, 
    WebSocketMessageService,
    WebsocketGateway, 
    WebSocketSessionManager,
    WsQueryPipe,
    WebSocketAuthGuard,
    LifecycleFactory,
    DefaultLifecycle,
    EventHelperFactory,
    BrowserHelper,
    DeviceHelper,
    DefaultHelper,
    EventStoreService,
    WebSocketHeartbeatService,
    EventRetryService,
    ...WS_EVENT_JSON_CLASSES,
    {
      provide: 'WS_EVENTS_JSON',
      useFactory: (...events) => events,
      inject: WS_EVENT_JSON_CLASSES,
    },
    ...WS_EVENT_BINNER_CLASSES,
    {
      provide: 'WS_EVENTS_BINNER',
      useFactory: (...events) => events,
      inject: WS_EVENT_BINNER_CLASSES
    },
  ], 
})
export class WebSocketModule {}