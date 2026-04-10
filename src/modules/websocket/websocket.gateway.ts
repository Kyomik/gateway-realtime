import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'ws';
import { IncomingMessage } from 'http';
import { WebSocketAuthGuard } from './guards/websocket-auth.guard';
import { WsClient } from './types/ws-client.type';
import { WebSocketSessionManager } from './services/websocket-sesi-manager.service';
import { WebSocketMessageService } from './services/websocket-message.service';
import { LifecycleFactory } from './services/lifecycle-factory.service';
import { normalizeWsError } from './helpers/normalize-error';
import { WebsocketRateLimitGuard } from '../ratelimitters/guards/websocket-ratelimit.guard';

@WebSocketGateway()
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly wsAuthGuard: WebSocketAuthGuard,
    private readonly wsRateLimitGuard: WebsocketRateLimitGuard,
    private readonly wsMessage: WebSocketMessageService,
    private readonly lifecycleFactory: LifecycleFactory,
    private readonly sessionManager: WebSocketSessionManager,
  ) {}

  async handleConnection(client: WsClient, request: IncomingMessage): Promise<void> {
    try {
      console.log('login lu')
      await this.wsRateLimitGuard.validate(request, 'preConnect');

      client.isAlive = false;
      client.missedPongs = 0;
      client._isResume = false;

      const { id_enduser, auth, product, type } = await this.wsAuthGuard.validateConnection(request);
      
      const session = await this.sessionManager.establishSession({
        id_enduser,
        auth,
        product,
        type,
        client,
      });

      const lifecycle = this.lifecycleFactory.resolve(session);
      await lifecycle.onConnect();

      client.on('message', async (raw, isBinary) => {
        if (session.socket !== client) return;
        
        try {
          if (isBinary) await this.wsMessage.onBinary(session, raw as Buffer);
          else await this.wsMessage.onMessage(session, raw.toString());
        } catch (err) {
          const error = this.handleError(err, client);
          if (this.isFatalError(error.code)) {
            client.close(error.code === 'UNAUTHENTICATED' ? 1008 : 1011, error.message);
          }
        }
      });

      client.on('pong', () => {
        client.isAlive = true;
        client.missedPongs = 0;
      });

      client.on('close', async () => {
        await this.handleDisconnect(client);
      });

      client.send(JSON.stringify({ event: 'ready' }));

    } catch (err) {
      const error = this.handleError(err, client);

      let closeCode = 1011;
      let closeReason = error.message || 'Connection rejected';
      if (error.code === 'TOKEN_EXPIRED' 
        || error.code === 'INVALID_TOKEN'
        || error.code === 'UNAUTHENTICATED' 
        || error.code === 'FORBIDDEN'
        || error.code === 'INVALID_SIGNATURE') {
          console.log('woowow')
        closeCode = 1008;
      }
      client.close(closeCode, closeReason);
    }
  }

  async handleDisconnect(client: WsClient): Promise<void> {
    const session = client.session;
    if (!session) return;
    if (session.socket !== client) {
      console.log(`[Disconnect] Old socket diabaikan, session ${session.sessionId} sudah punya socket baru`);
      return;
    }
    const lifecycle = this.lifecycleFactory.resolve(session);
    await lifecycle.onDisconnect();
  }

  private handleError(err: any, client: WsClient): any {
    console.log(err)
    const error = normalizeWsError(err);
    if (client.readyState === 1) 
      client.send(JSON.stringify({ event: 'error', ...error }));
    
    return error;
  }

  private isFatalError(code: string): boolean {
    return ['UNAUTHENTICATED', 'FORBIDDEN'].includes(code);
  }
}