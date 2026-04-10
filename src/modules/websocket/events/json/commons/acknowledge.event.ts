import { Injectable } from '@nestjs/common';
import { EventAckDto } from './dto/event-ack.dto';
import { WsSession } from 'src/modules/websocket/schema/websocket.session';
import { BrowserUser } from 'src/commons/schemas/browser.principal';
import { DeviceUser } from 'src/commons/schemas/device.principal';
import { BaseCommonEvent } from './base-common.event';

@Injectable()
export class EventAcknowledgmentEvent 
  extends BaseCommonEvent<EventAckDto, { data: EventAckDto }> {
    
  readonly qos = 0;
  
  readonly labelEvent = 'event:ack';
  readonly labelEventToReceiver: string = 'event:delivered';
  readonly dto = EventAckDto;
  readonly receiverType = 'server';

  validatePayload(payload: EventAckDto): boolean {
    return true;
  }

  async sideEffectEvent(
    session: WsSession, 
    modifiedPayload: {data: EventAckDto}, 
    event: string
  ): Promise<void> {
    
    const record = this.eventStore.getEvent(modifiedPayload.data.eventId);
    this.eventStore.markApplied(session.sessionId, modifiedPayload.data.eventId);
    
    if (record?.notifySender && record.senderId && record.senderId !== session.sessionId) {
      const notificationPayload = {
        originalEventId: record.eventId,
        originalEventName: record.eventName,
        deliveredTo: session.type === 'browser' ||'desktop'
          ? (session.principal as BrowserUser).role 
          : (session.principal as DeviceUser).deviceId,
        deliveredAt: Date.now(),
        message: modifiedPayload.data.message
      };

      // Cek apakah pengirim online
      const senderSession = await this.wsManager.getSessionById(record.senderId);
      if (senderSession?.isActive()) {
        // Kirim langsung
        senderSession.socket!.send(JSON.stringify({
          event: this.labelEventToReceiver, // 'event:delivered'
          data: notificationPayload,
        }));
      } else {
        // Simpan ke event store untuk offline
        this.eventStore.create(
          [record.senderId],
          this.labelEventToReceiver,
          notificationPayload,
          1, // QoS 1
          { ttl: 3600000 }
        );
      }
    }
  }
}