import { BaseBellEvent } from './base-bell-event';
import { Injectable } from '@nestjs/common';
import { WsSession } from 'src/modules/websocket/schema/websocket.session';
import { EndUploadDto } from './dto/end-upload-dto';

@Injectable()
export class UploadAudioEndEvent 
  extends BaseBellEvent<EndUploadDto> {

  readonly qos = 2;

  readonly labelEvent = 'upload-audio-end';
  readonly labelEventToReceiver: string = 'thats-it-b1tch';
  readonly type = 'browser';
  readonly receiverType = 'device';
  readonly dto = EndUploadDto;
  readonly allowedEvent: string[];
  
  validatePayload(payload: EndUploadDto): boolean{
    return true;
  }

  async validateStructurePayload<T extends object>(
      payload: EndUploadDto, 
      dto: new () => T
    ): Promise<void> {}
  
  protected async getReceivers(
    session: WsSession, 
    event: string,
  ): Promise<WsSession[]> {
      
    const receivers = this.wsManager.getActiveScoketsByType(session, this.receiverType);
    
    return receivers;
  }
}