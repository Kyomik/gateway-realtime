import { WsSession } from '../schema/websocket.session';
import { WebSocketSessionRegistry } from '../services/websocket-registry.service';
import { ILifecycle } from './lifecycle.interface';
import { EventStoreService } from '../services/event-store.service';

export abstract class BaseLifecycle implements ILifecycle {
  constructor(
    protected readonly session: WsSession,
    protected readonly registry: WebSocketSessionRegistry,
    protected readonly eventStore: EventStoreService,
    protected readonly suspendTimeout: number
  ) {}

  async onConnect(): Promise<void> {
    this.session.lastSeen = Date.now();
    this.session.state = 'ONLINE';  
    
    await this.deliverPendingEvents();

    if (this.session.socket?._isResume) {
      await this.afterResume();
      return;
    }
    await this.afterConnect();
  }

  async onDisconnect(): Promise<void> {
    this.session.lastSeen = Date.now();
    if (this.session.state === 'REPLACE') return;
    if (this.session.state === 'OFFLINE') {
      this.registry.unregister(this.session.sessionId);
      await this.afterDisconnect();
      return;
    }
    await this.onSuspend(); // ✅ async

    this.session.suspendTimer = setTimeout(async () => {
      if (this.session.state === 'SUSPEND') {
        this.session.state = 'OFFLINE';
        this.registry.unregister(this.session.sessionId);
        await this.afterDisconnect(); // ✅ await
      }
    }, this.suspendTimeout);
  }

  async onSuspend(): Promise<void> {
    this.session.state = 'SUSPEND';
    this.session.socket = undefined;
    if (this.session.suspendTimer) {
      clearTimeout(this.session.suspendTimer);
    }
    await this.afterSuspend();
  }

  destroy(): void {
    if (this.session.suspendTimer) {
      clearTimeout(this.session.suspendTimer);
    }
    // lepas referensi
    (this.session as any) = null;
    (this.registry as any) = null;
  }

  private async deliverPendingEvents(): Promise<void> {
    const userId = this.session.sessionId;
    // Gunakan getPending untuk mengambil event yang belum APPLIED dan tidak expired
    const pending = this.eventStore.getPending(userId);
    for (const record of pending) {
      if (!this.session.isActive()) break; // jika tiba-tiba disconnect

      let message;
      if(record.qos > 1){ 
        message = {
          event: record.eventName,
          ...record.payload,
          meta: { eventId: record.eventId }
        };
      }else{
        message = {
          event: record.eventName,
          ...record.payload,
        };
      }

      this.session.socket!.send(JSON.stringify(message));

      if (record.qos === 1) {
        this.eventStore.markApplied(userId, record.eventId);
      } else if (record.qos === 2) {
        this.eventStore.markDelivered(userId, record.eventId);
      }
    }
  }

  protected abstract afterConnect(): void | Promise<void>;
  protected abstract afterDisconnect(): void | Promise<void>;
  protected abstract afterSuspend(): void
  protected abstract afterResume(): void
}