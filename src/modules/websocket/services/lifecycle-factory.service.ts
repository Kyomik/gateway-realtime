// lifecycle-factory.service.ts
import { Injectable } from '@nestjs/common';
import { WsSession } from '../schema/websocket.session';
import { WebSocketSessionRegistry } from './websocket-registry.service';
import { ILifecycle } from '../lifesycles/lifecycle.interface';
import { DeviceLifecycle } from '../lifesycles/device.lifesycle';
import { BrowserLifecycle } from '../lifesycles/browser.lifesycle';
import { DefaultLifecycle } from '../lifesycles/default.lifesycle';
import { DeviceService } from 'src/modules/auth/services/device.service';
import { EventStoreService } from './event-store.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LifecycleFactory {
  constructor(
    private readonly registry: WebSocketSessionRegistry,
    private readonly deviceService: DeviceService,
    private readonly eventStore: EventStoreService,
    private readonly configService: ConfigService,
  ) {}

  resolve(session: WsSession): ILifecycle {
    if (!session.type) {
      return new DefaultLifecycle();
    }

    const suspendTimeout = this.configService.get('WS_SESSION_SUSPEND_TIMEOUT', 60000);

    switch (session.type) {
      case 'device':
        return new DeviceLifecycle(
          session, 
          this.registry, 
          this.eventStore,
          suspendTimeout
        );
      case 'browser':
        return new BrowserLifecycle(
          session, 
          this.registry, 
          this.deviceService, 
          this.eventStore,
          suspendTimeout
        );
      case 'desktop':
        return new BrowserLifecycle(
          session, 
          this.registry, 
          this.deviceService, 
          this.eventStore,
          suspendTimeout
        );
      default:
        return new DefaultLifecycle();
    }
  }
}