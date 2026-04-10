import { Inject, Injectable } from '@nestjs/common';
import { WsSession } from '../schema/websocket.session';
import { BaseWsEventJSON } from '../events/json/base-ws-json.event';
import { BaseWsEventBinner } from '../events/binner/base-ws-binnery.event';
import { AppWsException } from '../../../commons/exceptions/ws-error.exception';
import { DeviceUser } from 'src/commons/schemas/device.principal';
import { BrowserUser } from 'src/commons/schemas/browser.principal';
import { TypeProduct } from 'src/commons/enums/type-product.enum';

@Injectable()
export class WebSocketMessageService {
  private jsonHandlers = new Map<string, BaseWsEventJSON<any, any>>();
  private binaryHandlers = new Map<string, BaseWsEventBinner>();

  constructor(
    @Inject('WS_EVENTS_JSON')
    events_json: BaseWsEventJSON<any, any>[],
    @Inject('WS_EVENTS_BINNER')
    events_binner: BaseWsEventBinner[],
  ) {
    for (const h of events_json) {
      this.jsonHandlers.set(h.labelEvent, h);
    }

    for (const h of events_binner) {
      this.binaryHandlers.set(h.productName, h);
    }
  }

  async onMessage(session: WsSession, raw: string) {
    // Pastikan ada socket aktif
    if (!session.socket) {
      throw new AppWsException('SOCKET_UNAVAILABLE', 'No active connection');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new AppWsException('INVALID_JSON', 'Payload must be JSON');
    }
    const { event, data } = parsed;

    if (typeof event !== 'string') {
      throw new AppWsException('INVALID_EVENT', 'Event is required');
    }

    const handler = this.jsonHandlers.get(event);
    if (!handler) {
      throw new AppWsException('INVALID_EVENT', `Unknown event ${event}`);
    }

    // Eksekusi handler dengan socket client
    await handler.execute(session, data);
  }

  async onBinary(session: WsSession, buffer: Buffer) {
    if (!session.socket) {
      throw new AppWsException('SOCKET_UNAVAILABLE', 'No active connection');
    }

    let product: TypeProduct;
    
    switch (session.type) {
      case 'browser':
        const browserUser = session.principal as BrowserUser;
        product = browserUser.role_product;
        break;
      case 'device':
        const deviceUser = session.principal as DeviceUser;
        product = deviceUser.device_product;
        break;
      default:
        // Tidak ada product, throw atau return?
        throw new AppWsException('INVALID_TYPE', 'Cannot determine product for binary event');
    }

    const handler = this.binaryHandlers.get(product);
    if (!handler) {
      throw new AppWsException('INVALID_PRODUCT', 'Binary not supported');
    }

    await handler.execute(session, buffer);
  }
}