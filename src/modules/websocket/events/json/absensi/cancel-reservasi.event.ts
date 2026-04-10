import { DeviceUser } from 'src/commons/schemas/device.principal';
import { BaseAbsensiEvent } from './base-absensi.event';
import { Injectable, Inject } from '@nestjs/common';
import { WsSession } from 'src/modules/websocket/schema/websocket.session';
import { AbsensiApiService } from 'src/modules/webhook/services/absensi-api.service';
import { CancelReservasiDto } from './dto/cancel-reservasi.dto';
import { ReservasiResponse } from './response/cancel-reservasi.response';
import { WebSocketSessionRegistry } from 'src/modules/websocket/services/websocket-registry.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SuccessCancelReservasiResponseDto } from 'src/modules/webhook/dto/absensi/cancel-reservasi-response.dto';
import { BrowserUser } from 'src/commons/schemas/browser.principal';

@Injectable()
export class CancelReservasiEvent extends BaseAbsensiEvent<CancelReservasiDto, ReservasiResponse> {
  @Inject(WebSocketSessionRegistry)
  protected readonly wsRegistry: WebSocketSessionRegistry;

  constructor(
    private readonly absensiApiService: AbsensiApiService,
    private readonly eventEmitter: EventEmitter2
  ) {
    super();
  }

  readonly qos = 2;
  readonly notifySender: boolean = false;

  readonly labelEvent = 'cancel-reservasi';
  readonly labelEventToReceiver: string = 'cancel-reservasi';
  readonly type = 'device';
  readonly receiverType = 'self'; // hanya dikirim ke pengirim sendiri
  readonly dto = CancelReservasiDto;
  readonly allowedEvent = ['cancel-reservasi'];

  validatePayload(payload: CancelReservasiDto): boolean {
    return true;
  }

  /**
   * Modified payload – memanggil API cancel reservasi
   */
  async modifiedPayload(
    session: WsSession,
    payload: CancelReservasiDto,
  ): Promise<ReservasiResponse> {
    const user = session.principal as DeviceUser;
    const product = user.getProduct(this.productName);
    const productDomain = product.domain;
    const productSecret = product.secret;

    const result =  await this.absensiApiService.cancelReservasi(productDomain, payload, productSecret);
    if (result.isSuccess !== true) return result;
    
    const successResult = result as unknown as SuccessCancelReservasiResponseDto

    this.eventEmitter.emit('absensi.reservasi.cancel', { 
      clientId: user.clientId, 
      data: successResult.data
    });

    return result
  }

  /**
   * Side effect – kirim notifikasi ke semua browser yang terhubung
   */
  async sideEffectEvent(
    session: WsSession,
    modifiedPayload: ReservasiResponse,
    event: string,
  ): Promise<void> {
    // Dapatkan semua sesi browser dalam satu tenant
    const browser = session.principal as BrowserUser;
    const browserSessions = this.wsRegistry.getBrowsersByTenant(
      session.principal.clientId,
      (session) => 
        session.isActive() && 
        (browser.role_product == this.productName)
    );
    
    this.qossing(session, browserSessions, modifiedPayload, 'browser');
  }
}