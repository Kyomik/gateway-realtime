import { Injectable } from '@nestjs/common';
import { BaseWsEventBinner } from '../base-ws-binnery.event';

@Injectable()
export class UploadAudioEvent extends BaseWsEventBinner{
    readonly qos = 2;
    
    readonly productName = 'bell';
    readonly labelEvent = 'upload-audio';
    readonly labelEventToReceiver: string = 'get-audio';
    readonly type = 'browser';
    readonly receiverType = 'device';
    readonly allowedEvent = ['upload-audio'];
}
