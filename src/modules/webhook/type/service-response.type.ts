import { SuccessResponseDto } from "src/modules/webhook/dto/success-response.dto";

export type ServiceResponse<T, TError> =
  | SuccessResponseDto<T>
  | TError;