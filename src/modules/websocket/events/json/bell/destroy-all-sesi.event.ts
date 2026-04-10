import { BaseBellEvent } from './base-bell-event';
import { Injectable } from '@nestjs/common';
import { BrowserUser } from 'src/commons/schemas/browser.principal';
import { BellApiService } from 'src/modules/webhook/services/bell-api.service';
import { DestroyAllSesiDto } from './dto/destroy-all-sesi.dto';
import { DestroyAllResponse } from './response/destroy-all.response';
import { WsSession } from 'src/modules/websocket/schema/websocket.session';

@Injectable()
export class DestroyAllSesiEvent 
extends BaseBellEvent<DestroyAllSesiDto, DestroyAllResponse> {

  readonly qos = 2;

  readonly labelEvent = 'destroy-all-sesi';
  readonly labelEventToReceiver: string = 'destroy-all-sesi'
  readonly type = 'browser';
  readonly receiverType = 'device';
  readonly dto = DestroyAllSesiDto;
  readonly allowedEvent = ['destroy-all-sesi'];

  constructor(
    private readonly bellApiService: BellApiService
  ) {
    super()
  }

  validatePayload(payload: DestroyAllSesiDto): boolean{
    return true;
  }

  async validateStructurePayload<T extends object>(
    payload: DestroyAllSesiDto, 
    dto: new () => T
  ): Promise<void> {}

  modifiedPayload(
    _client: WsSession, 
    payload: DestroyAllSesiDto
  ): Promise<DestroyAllResponse> {
      const user = _client.principal as BrowserUser;
      const product = user.getProduct(this.productName)
      const productDomain = product.domain
      const productSecret = product.secret

      return this.bellApiService.destroyAll(productDomain, payload, productSecret)
  }
}
