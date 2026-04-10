import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Logger } from "@nestjs/common";
import { WebSocketSessionManager } from "./websocket-sesi-manager.service";
import { EventStoreService } from "./event-store.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EventRetryService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventRetryService.name);
  private retryInterval: NodeJS.Timeout;

  constructor(
    private readonly eventStore: EventStoreService,
    private readonly wsManager: WebSocketSessionManager,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.retryInterval = setInterval(
      () => this.retryPendingEvents(),
      this.configService.get('EVENT_RETRY_INTERVAL', 30000)
    );
  }

  onModuleDestroy() {
    clearInterval(this.retryInterval);
  }

  private async retryPendingEvents() {
    const userIds = this.eventStore.getAllUserIds();
    for (const userId of userIds) {
      const toRetry = this.eventStore.getPendingWithRetry(userId);
      if (toRetry.length === 0) continue;

      const session = await this.wsManager.getSessionById(userId);
      if (!session?.isActive()) continue;

      for (const record of toRetry) {
        session.socket!.send(JSON.stringify({
          event: record.eventName,
          ...record.payload,
          meta: { eventId: record.eventId },
        }));

        if (record.qos === 1) {
          await this.eventStore.markApplied(userId, record.eventId);
        } else if (record.qos === 2) {
          await this.eventStore.markDelivered(userId, record.eventId);
        }
        this.logger.debug(`Retried event ${record.eventId} for user ${userId}`);
      }
    }
  }

  /**
   * Listener untuk event expired. Mengirim feedback ke senderId jika online.
   */
  @OnEvent('event.expired')
  async handleEventExpired(payload: {
    eventId: string;
    eventName: string;
    senderEventName?: string;  // add this
    reason: string;
    senderId?: number;
  }) {
    if (!payload.senderId) return;

    const session = this.wsManager.getSessionById(payload.senderId);
    if (session?.isActive() && session.socket && session.socket.readyState === 1) {
      session.socket.send(JSON.stringify({
        event: 'event_expired',
        eventId: payload.eventId,
        eventName: payload.senderEventName || payload.eventName,
        reason: payload.reason,
      }));
      
      this.logger.debug(`Sent expired feedback for event ${payload.eventId} to user ${payload.senderId}`);
    } else {
      this.logger.warn(`Cannot send expired feedback for event ${payload.eventId} to user ${payload.senderId}: session offline`);
    }
  }
}