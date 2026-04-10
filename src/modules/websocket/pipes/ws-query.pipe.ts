import { Injectable } from '@nestjs/common';
import { IncomingMessage } from 'http';
import { TypeEnduser } from 'src/commons/enums/type-enduser.enum';
import { TypeProduct } from 'src/commons/enums/type-product.enum';
import { AppWsException } from 'src/commons/exceptions/ws-error.exception';

@Injectable()
export class WsQueryPipe {
  transform(req: IncomingMessage): {
    token: string;
    type: TypeEnduser;
    product?: TypeProduct;
    clientId?: string;
  } {
    const url = new URL(req.url!, 'http://localhost');

    const token = url.searchParams.get('token');
    const type = url.searchParams.get('type');
    const product = url.searchParams.get('product') ?? undefined;
    const clientId = url.searchParams.get('clientId') ?? undefined;

    if (!token || !type) {
      throw new AppWsException(
        'INVALID_QUERY',
        'Missing token or type',
      );
    }

    return {
      token,
      type: type as TypeEnduser,
      product: product as TypeProduct | undefined,
      clientId,
    };
  }
}