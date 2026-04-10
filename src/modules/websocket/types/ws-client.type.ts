import { WebSocket } from 'ws';
import { WsSession } from '../schema/websocket.session';

export type WsClient = WebSocket & {
  _disconnectHandled: boolean
  session?: WsSession;       // sesi yang sedang terikat
  isAlive: boolean;         // untuk heartbeat
  missedPongs: number;
  _isResume?: boolean;     // flag reconnect
};