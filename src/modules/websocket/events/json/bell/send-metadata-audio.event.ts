import { BaseBellEvent } from './base-bell-event';
import { Injectable } from '@nestjs/common';
import { SendMetadataAudiosDto } from './dto/send-metadata-audio.dto';

@Injectable()
export class SendMetadataAudioEvent 
extends BaseBellEvent<SendMetadataAudiosDto> {

  readonly qos = 2;

  readonly labelEvent = 'send-metadata-audio';
  readonly labelEventToReceiver: string = 'get-metadata-audio'
  readonly type = 'device';
  readonly receiverType = 'browser';
  readonly dto = SendMetadataAudiosDto;
  readonly allowedEvent = ['send-metadata-audio'];
  
  validatePayload(payload: SendMetadataAudiosDto): boolean{
    return true;
  }
}