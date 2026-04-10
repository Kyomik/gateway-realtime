import { BaseAbsensiEvent } from './base-absensi.event';
import { WsSession } from 'src/modules/websocket/schema/websocket.session';
import { ScandDto } from './dto/scan.dto';
import { DeviceUser } from 'src/commons/schemas/device.principal';
import { Injectable } from '@nestjs/common';
import { AbsensiApiService } from 'src/modules/webhook/services/absensi-api.service';
import { ScanResponse } from './response/scan.response';
import { SuccessLoginResponseDto } from 'src/modules/webhook/dto/absensi/login-response.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class RFIDScanEvent
  extends BaseAbsensiEvent<ScandDto, ScanResponse> {
  
  readonly qos = 1;
  readonly shouldNotifySender: boolean = true;
  readonly labelEvent = 'rfid-scan';
  readonly labelEventToReceiver = 'result-scan';
  readonly type = 'device';
  readonly receiverType = 'browser';
  readonly dto = ScandDto;
  readonly allowedEvent = ['register', 'login', 'update'];

  constructor(
    private readonly absensiApiService: AbsensiApiService,
    private readonly eventEmitter: EventEmitter2
  ) {
    super();
  }

  validatePayload(payload: ScandDto): boolean {
    return this.allowedEvent.includes(payload.mode);
  }

  getEventMessage(payload: ScandDto): string {
    return payload.mode;
  }

  async modifiedPayload(
    session: WsSession,
    payload: ScandDto,
  ): Promise<ScanResponse> {
    const user = session.principal as DeviceUser;
    const product = user.getProduct(this.productName);
    const productDomain = product.domain;
    const productSecret = product.secret;

    switch (payload.mode) {
      case 'login':
        const result =  await this.absensiApiService.login(productDomain, payload.uid, productSecret);
        
        if (result.isSuccess !== true) return result;

        const successResult = result as unknown as SuccessLoginResponseDto;

        this.eventEmitter.emit('absensi.scan.login', { 
          clientId: user.clientId, 
          data: successResult.data
        });

        return result;
      case 'register':
        return await this.absensiApiService.register(productDomain, payload.uid, productSecret);
      case 'update':
        return await this.absensiApiService.update(productDomain, payload.uid, productSecret);
      default:
        throw new Error(`Unsupported mode: ${payload.mode}`);
    }
  }

  async sideEffectEvent(
    session: WsSession,
    modifiedPayload: ScanResponse,
    event: string
  ): Promise<void> {
    // Kirim konfirmasi ke pengirim jika socket masih aktif
    if (session.isActive()) {
      session.socket!.send(JSON.stringify({
        event: `${event}:apply`,
        ...modifiedPayload
      }));
    }
  }
}