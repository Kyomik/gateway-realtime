import { BaseBellEvent } from './base-bell-event';
import { Injectable } from '@nestjs/common';
import { SyncAlarmDto } from './dto/sync-alarm-dto';

@Injectable()
export class SyncAlarmEvent 
  extends BaseBellEvent<SyncAlarmDto> {

  readonly qos = 2;

  readonly labelEvent = 'sync-alarm';
  readonly labelEventToReceiver: string = 'sync-alarm'
  readonly type = 'browser';
  readonly receiverType = 'device';
  readonly dto = SyncAlarmDto;
  readonly allowedEvent = ['sync-alarm'];
  
  validatePayload(payload: SyncAlarmDto): boolean{
    return true;
  }
}