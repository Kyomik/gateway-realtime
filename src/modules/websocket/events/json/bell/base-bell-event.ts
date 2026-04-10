import { BaseWsEventJSON } from '../base-ws-json.event';

export abstract class BaseBellEvent<
  TInput extends object,
  TOutput = TInput
> extends BaseWsEventJSON<TInput, TOutput> {
  readonly productName = 'bell';
}