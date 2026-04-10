// session.type.ts
import { EndUser } from 'src/commons/schemas/enduser.principal';
import { TypeEnduser } from 'src/commons/enums/type-enduser.enum';
import { TypeProduct } from 'src/commons/enums/type-product.enum';
import { TypeConnectionState } from 'src/commons/enums/type-connection-state.enum';
import { WsClient } from '../types/ws-client.type';

export class WsSession {
  public readonly sessionId: number;        // format: `${id_enduser}:${type}`
  public principal: EndUser;
  public type: TypeEnduser;
  public product?: TypeProduct;
  public state: TypeConnectionState = 'CONNECTING';
  public socket?: WsClient;                // koneksi aktif (jika ONLINE)
  public suspendTimer?: NodeJS.Timeout;
  public lastSeen: number;
  public readonly createdAt: number;

  constructor(params: {
    sessionId: number;
    principal: EndUser;
    type: TypeEnduser;
    product?: TypeProduct;
    socket?: WsClient;
  }) {
    this.sessionId = params.sessionId;
    this.principal = params.principal;
    this.type = params.type;
    this.product = params.product;
    this.socket = params.socket;
    this.lastSeen = Date.now();
    this.createdAt = Date.now();
  }

  isActive(): boolean {
    return this.socket?.readyState === 1; // WebSocket.OPEN
  }
}