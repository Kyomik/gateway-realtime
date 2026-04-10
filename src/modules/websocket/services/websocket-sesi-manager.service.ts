import { Injectable } from '@nestjs/common';
import { WebSocketSessionRegistry } from './websocket-registry.service';
import { WsSession } from '../schema/websocket.session';
import { WsClient } from '../types/ws-client.type';
import { EndUser } from 'src/commons/schemas/enduser.principal';
import { TypeEnduser } from 'src/commons/enums/type-enduser.enum';
import { TypeProduct } from 'src/commons/enums/type-product.enum';
import { DeviceService } from 'src/modules/auth/services/device.service';
import { BrowserService } from 'src/modules/auth/services/browser.service';
import { IEnduserStrategy } from '../../auth/interfaces/enduser-strategy.interface';
import { EnduserBase } from 'src/commons/types/enduser.type';
import { AppWsException } from '../../../commons/exceptions/ws-error.exception';

@Injectable()
export class WebSocketSessionManager {
  private readonly strategyMap: Partial<Record<TypeEnduser, IEnduserStrategy<EnduserBase>>>;

  constructor(
    private readonly registry: WebSocketSessionRegistry,
    private readonly device: DeviceService,
    private readonly browser: BrowserService
  ) {
     this.strategyMap = {
      browser: this.browser,
      device: this.device
    };
  }

  async establishSession(params: {
    id_enduser: number;
    auth: EndUser;
    type: TypeEnduser;
    product?: TypeProduct;
    client: WsClient;
  }): Promise<WsSession> {

    const { id_enduser, auth, type, product, client } = params;
    let session = this.registry.find(id_enduser);

    if (session) {
      if (session.state === 'SUSPEND') {
        return this.resumeSession(session, client);
      }
      return this.replaceSession(session, client);
    }

    return this.createSession(id_enduser, auth, type, product, client);
  }

  private resumeSession(session: WsSession, client: WsClient): WsSession {
    if (session.socket?.readyState === 1) {
      session.socket.terminate();
    }
    if (session.suspendTimer) {
      clearTimeout(session.suspendTimer);
      session.suspendTimer = undefined;
    }
    client._isResume = true;
    session.socket = client;
    session.state = 'CONNECTING';
    session.lastSeen = Date.now();
    client.session = session;
    return session;
  }

  private replaceSession(session: WsSession, client: WsClient): WsSession {
    const oldSocket = session.socket;
    if (oldSocket?.readyState === 1) {
        session.state = 'REPLACE';
        if (session.suspendTimer) {
        clearTimeout(session.suspendTimer);
        session.suspendTimer = undefined;
        }
        oldSocket.close(1000, 'REPLACED');
    }

    session.socket = client;
    session.state = 'CONNECTING';
    session.lastSeen = Date.now();
    client.session = session;

    if (session.type === 'browser' || session.type === 'desktop') {
        client._isResume = false;   // ✅ afterConnect() jalan → snapshot terkirim
    } else {
        client._isResume = true;    // ❌ device: asumsikan resume cepat
    }

    return session;
    }

  private createSession(
    id_enduser: number,
    auth: EndUser,
    type: TypeEnduser,
    product: TypeProduct | undefined,
    client: WsClient,
  ): WsSession {
    const session = new WsSession({
      sessionId: id_enduser,
      principal: auth,
      type,
      product,
      socket: client,
    });
    client.session = session;

    this.registry.register(session);
    return session;
  }

  getActiveSockets(): WsClient[] {
    return this.registry.getAllSessions()
      .filter(s => s.isActive())
      .map(s => s.socket!);
  }

  getActiveScoketsByType(session: WsSession, type: TypeEnduser): WsSession[] {
    switch (type) {
      case 'browser':
        return this.registry.getBrowsersByTenant(session.principal.clientId, (session) => session.isActive());
      case 'desktop':
        return this.registry.getBrowsersByTenant(session.principal.clientId, (session) => session.isActive());
      case 'device':
        return this.registry.getDevicesByTenant(session.principal.clientId, (session) => session.isActive());
      case 'self':
        return [session];
      case 'server':
        return [];
      default:
        return [];
    }
  }

  getSessionById(userId: number): WsSession | undefined {
    return this.registry.find(userId);
  }

  async getIdEnduserByType(
    session: WsSession, 
    type: TypeEnduser, 
    product: TypeProduct
  ): Promise<number[]>{

    const strategy = this.strategyMap[type];
    
    if (!strategy) {
      throw new AppWsException(
        'UNSUPPORTED_AUTH_TYPE',
        `Auth type ${type} is not supported`,
      );
    }

    return await strategy.getIdsByTenantAndProduct(session.principal.clientId, product)
  }
}