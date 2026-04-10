import { Injectable } from '@nestjs/common';
import { IncomingMessage } from 'http';
import { AuthService } from '../../auth/services/auth.service';
import { WsQueryPipe } from 'src/modules/websocket/pipes/ws-query.pipe';
import { AppWsException } from 'src/commons/exceptions/ws-error.exception';
import { TypeProduct } from 'src/commons/enums/type-product.enum';
import { TypeEnduser } from 'src/commons/enums/type-enduser.enum';
import { AuthResult } from 'src/modules/auth/types/auth-result.type';

@Injectable()
export class WebSocketAuthGuard {
  constructor(
    private readonly authService: AuthService,
    private readonly wsQueryPipe: WsQueryPipe,
  ) {}

  async validateConnection(request: IncomingMessage): Promise<AuthResult & {product?: TypeProduct, type: TypeEnduser }> {
    const { token, type, product, clientId } = this.wsQueryPipe.transform(request);
    const {auth, id_enduser} = await this.authService.validateToken(token, type, clientId);
    if (!auth) {
      throw new AppWsException(
        'UNAUTHENTICATED',
        'Invalid WS token',
      );
    }

    return {id_enduser, auth, product, type};
  }
}
