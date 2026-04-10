import { BaseWsEventJSON } from '../base-ws-json.event';

export abstract class BaseAbsensiEvent<
  TInput extends object,
  TOutput = TInput
> extends BaseWsEventJSON<TInput, TOutput> {
  readonly productName = 'absensi';
}
