import { BaseBellEvent } from './base-bell-event';
import { Injectable } from '@nestjs/common';
import { StartUploadDto } from './dto/start-upload.dto';
import { WsSession } from 'src/modules/websocket/schema/websocket.session';

@Injectable()
export class UploadAudioStartEvent 
  extends BaseBellEvent<StartUploadDto> {

  readonly qos = 2;
  protected ttl: number = 3000;
  readonly labelEvent = 'upload-audio-start';
  readonly labelEventToReceiver: string = 'lets-fucking-go';
  readonly type = 'browser';
  readonly receiverType = 'device';
  readonly dto = StartUploadDto;
  readonly allowedEvent: string[];
  
  validatePayload(payload: StartUploadDto): boolean{
    return true;
  }
  
  protected async getReceivers(
    session: WsSession, 
    event: string,
  ): Promise<WsSession[]> {
      
    const receivers = this.wsManager.getActiveScoketsByType(session, this.receiverType);
    
    return receivers;
  }
}