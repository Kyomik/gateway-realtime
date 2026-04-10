import { TypeProduct } from 'src/commons/enums/type-product.enum';
import { BaseWsEventJSON } from '../base-ws-json.event';
import { WsSession } from 'src/modules/websocket/schema/websocket.session';
import { TypeEnduser } from 'src/commons/enums/type-enduser.enum';

export abstract class BaseCommonEvent<
  TInput extends object,
  TOutput = TInput
> extends BaseWsEventJSON<TInput, TOutput> {
  
  readonly productName: TypeProduct;
  readonly type: TypeEnduser; 
  readonly allowedEvent: string[];

  async getReceivers(
    ession: WsSession, 
    event: string
  ): Promise<WsSession[]> {
    
    return []
  }
}
