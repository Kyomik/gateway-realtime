import { BaseBellEvent } from './base-bell-event';
import { Injectable } from '@nestjs/common';
import { CreateSesiDto } from './dto/create-sesi.dto';
import { BrowserUser } from 'src/commons/schemas/browser.principal';
import { BellApiService } from 'src/modules/webhook/services/bell-api.service';
import { CreateResponse } from './response/create.response';
import { WsSession } from 'src/modules/websocket/schema/websocket.session';

@Injectable()
export class CreateSesiEvent 
extends BaseBellEvent<CreateSesiDto, CreateResponse> {

  readonly qos = 2;

  readonly labelEvent = 'create-sesi';
  readonly labelEventToReceiver: string = 'create-sesi'
  readonly type = 'browser';
  readonly receiverType = 'device';
  readonly dto = CreateSesiDto;
  readonly allowedEvent = ['create-sesi'];

  constructor(
    private readonly bellApiService: BellApiService
  ) {
    super()
  }

  validatePayload(payload: CreateSesiDto): boolean{
    return true;
  }
  
  async modifiedPayload(
    session: WsSession,
    payload: CreateSesiDto,
  ): Promise<CreateResponse> {
      const user = session.principal as BrowserUser;
      const product = user.getProduct(this.productName)
      const productDomain = product.domain
      const productSecret = product.secret

      return await this.bellApiService.store(productDomain, payload, productSecret)
    }
}
