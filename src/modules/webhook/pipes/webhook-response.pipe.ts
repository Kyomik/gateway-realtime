import { ClassConstructor } from 'class-transformer';
import { AppWsException } from '../../../commons/exceptions/ws-error.exception';
import { validateDtoSafe } from 'src/commons/helpers/validation-dto-inout';

export async function WHResPipe<
  TSuccess extends object,
  TError extends object
>(
  raw: { 
    data: unknown; 
    headers: Record<string, string | string[] | undefined>; // tipe aman
  },
  successDto: ClassConstructor<TSuccess>,
  errorDto: ClassConstructor<TError>,
): Promise<TSuccess | TError> {

  const base = raw.data as { isSuccess?: unknown };

  if (base.isSuccess === true) {
    const { valid, instance, errors } = await validateDtoSafe(raw.data, successDto);
    if (!valid) throw new AppWsException('INVALID RESPONSE WEBHOOK', errors);
    return instance!;
  }

  if (base.isSuccess === false) {
    const { valid, instance, errors } = await validateDtoSafe(raw.data, errorDto);
    if (!valid) throw new AppWsException('INVALID RESPONSE WEBHOOK', errors);
    return instance!;
  }

  throw new AppWsException('INVALID RESPONSE SHAPE', 'Response dari client tidak valid');
}
