import { BaseBellEvent } from './base-bell-event';
import { Injectable } from '@nestjs/common';
import { WsSession } from 'src/modules/websocket/schema/websocket.session';
import { BrowserUser } from 'src/commons/schemas/browser.principal';
import { BellApiService } from 'src/modules/webhook/services/bell-api.service';
import { DestroySesiDto } from './dto/destroy-sesi.dto';
import { DestroyResponse } from './response/destroy.response';

@Injectable()
export class DestroySesiEvent extends BaseBellEvent<DestroySesiDto, DestroyResponse> {
  constructor(private readonly bellApiService: BellApiService) {
    super();
  }

  readonly qos = 2;

  readonly labelEvent = 'destroy-sesi';
  readonly labelEventToReceiver = 'destroy-sesi';
  readonly type = 'browser';
  readonly receiverType = 'device';
  readonly dto = DestroySesiDto;
  readonly allowedEvent: string[] = ['destroy-sesi'];

  validatePayload(payload: DestroySesiDto): boolean {
    return true; // atau logic validasi tambahan
  }

  /**
   * Override modifiedPayload dengan parameter session, bukan client.
   * Method ini dipanggil oleh BaseWsEventJSON.executeBase.
   */
  async modifiedPayload(
    session: WsSession,               // ✅ dari WsClient → WsSession
    payload: DestroySesiDto,
  ): Promise<DestroyResponse> {
    const user = session.principal as BrowserUser; // ✅ akses principal dari session
    const product = user.getProduct(this.productName);
    const productDomain = product.domain;
    const productSecret = product.secret;

    return this.bellApiService.destroy(productDomain, payload, productSecret);
  }
}