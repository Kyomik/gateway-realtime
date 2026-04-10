import { WsSession } from '../../schema/websocket.session';
import { AppWsException } from '../../../../commons/exceptions/ws-error.exception';
import { validateDtoSafe } from 'src/commons/helpers/validation-dto-inout';
import { BaseWsEvent } from '../base-ws.event';
import { EventStoreService } from '../../services/event-store.service';
import { Inject } from '@nestjs/common';
import { TypeEnduser } from 'src/commons/enums/type-enduser.enum';

export abstract class BaseWsEventJSON<
  TDto extends object,
  TResult = unknown,
> extends BaseWsEvent<TDto, TResult> {

  @Inject(EventStoreService)
  protected readonly eventStore: EventStoreService

  abstract readonly dto: new () => TDto;
  abstract readonly qos: 0 | 1 | 2;

  protected notifySender: boolean = true;
  protected ttl: number = 30000

  protected abstract validatePayload(payload: TDto): boolean;
 
  protected async validateStructurePayload<T extends object>(
    payload: TDto,
    dto: new () => T,
  ): Promise<void> {
    
    if (!dto) throw new AppWsException('EVENT_ERROR', 'DTO class is required');
    if (!payload) throw new AppWsException('EVENT_ERROR', 'Payload is empty');

    const { valid, errors } = await validateDtoSafe(payload, dto);
    if (!valid) {
      throw new AppWsException('EVENT_ERROR', errors);
    }
  }

  protected async sideEffectEvent(
    session: WsSession,
    modifiedPayload: TResult,
    event: string,
  ): Promise<void> {
    // kosong, dapat di-override
  }

  private async getAllReceiversIds(
    session: WsSession,
    receivers: WsSession[], 
    receiverTypeDefault: TypeEnduser = this.receiverType
  ): Promise<{ onlineIds: number[], offlineIds: number[] }> {
    
    const allTargetIds = await this.wsManager.getIdEnduserByType(session, receiverTypeDefault, this.productName);
    const onlineIds = receivers.filter(r => r.isActive()).map(r => r.sessionId);
    const offlineIds = allTargetIds.filter(id => !onlineIds.includes(id));
    
    return { onlineIds, offlineIds };
  }

  async dispatch(
    receivers: WsSession[],
    payload: TResult,
    sender: WsSession,
  ): Promise<void> {

    if (this.receiverType === 'server' || this.receiverType === 'self') {
      for (const r of receivers) 
        r.socket!.send(
          JSON.stringify({ 
            event: this.labelEventToReceiver, 
            ...payload 
          }));
      return;
    }
    
    this.qossing(sender, receivers, payload);
  }

  protected async modifiedPayload(
    session: WsSession, 
    payload: TDto
  ): Promise<TResult> {
    return {data: payload} as unknown as TResult
  }

  async executeBase(session: WsSession, payload: TDto): Promise<void> {
    await this.validateStructurePayload(payload, this.dto);
    
    if (!this.validatePayload(payload)) {
      throw new AppWsException('EVENT_ERROR', 'Payload Tidak tepat');
    }
    
    const eventLabel = this.getEventMessage(payload);
    const modifiedPayload = await this.modifiedPayload(session, payload);
    const receivers = await this.getReceivers(session, eventLabel, payload);

    await this.dispatch(receivers, modifiedPayload, session);
    await this.sideEffectEvent(session, modifiedPayload, eventLabel);
  }

  protected async qossing(
    sender: WsSession, 
    receivers: WsSession[], 
    payload: TResult,
    receiverType: TypeEnduser = this.receiverType
  ): Promise<void> {

    let onlineIds: number[] = [], offlineIds: number[] = [];
    
    if (this.qos > 0) {
      const ids = await this.getAllReceiversIds(sender, receivers, receiverType);
      onlineIds = ids.onlineIds;
      offlineIds = ids.offlineIds;
    }

    if (this.qos === 0) {
      for (const r of receivers) 
        r.socket!.send(
          JSON.stringify({ 
            event: this.labelEventToReceiver, 
            ...payload 
          })
        );
    } else if (this.qos === 1) {
      for (const r of receivers) 
        r.socket!.send(
          JSON.stringify({ 
            event: this.labelEventToReceiver, 
            ...payload 
          })
        );
      if (offlineIds.length) {
        this.eventStore.create(
          offlineIds, 
          this.labelEventToReceiver, 
          payload, 
          this.qos,
          { 
            ttl: this.ttl,
            senderEventName: this.labelEvent   // <-- tambahkan
          }
        );
      }
    } else if (this.qos === 2) {
      const allTargets = [...onlineIds, ...offlineIds];
      if (allTargets.length) {
        const eventId = this.eventStore.create(
          allTargets,
          this.labelEventToReceiver,   // nama untuk receiver
          payload,
          this.qos,
          {
            senderId: sender.sessionId,
            notifySender: this.notifySender,
            ttl: this.ttl,
            senderEventName: this.labelEvent,   // <-- tambahkan
          }
        );
        const message = JSON.stringify({ 
          event: this.labelEventToReceiver, 
          ...payload, 
          meta: { eventId } 
        });
        for (const r of receivers) 
          r.socket!.send(message);
        for (const uid of onlineIds) 
          this.eventStore.markDelivered(uid, eventId);
      }
    }
  }
}