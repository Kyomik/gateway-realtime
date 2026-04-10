import { BaseAbsensiEvent } from './base-absensi.event';
import { ChangeModeDto } from './dto/change-mode.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChangeModeEvent extends BaseAbsensiEvent<ChangeModeDto, unknown> {
  readonly qos = 2;

  readonly labelEvent = 'change-mode';
  protected notifySender: boolean = false;
  readonly labelEventToReceiver: string = 'change-mode'
  readonly type = 'browser';
  readonly receiverType = 'device';
  readonly dto = ChangeModeDto;
  readonly allowedEvent = ['register', 'login', 'update'];

  validatePayload(payload: ChangeModeDto): boolean{
    return this.allowedEvent.includes(payload.mode)
  }

  getEventMessage(payload: ChangeModeDto): string {
    return payload.mode
  }
}
