import { ServiceResponse } from 'src/modules/webhook/type/service-response.type';
import { SuccessLoginResponseDto } from 'src/modules/webhook/dto/absensi/login-response.dto';
import { SuccessRegisterResponseDto } from 'src/modules/webhook/dto/absensi/register-response.dto';
import { SuccessUpdateResponseDto } from 'src/modules/webhook/dto/absensi/update-response.dto';
import { ErrorBusinesDto } from 'src/modules/webhook/dto/absensi/error-busines-response.dto';

export type ScanResponse =
  | ServiceResponse<SuccessLoginResponseDto, ErrorBusinesDto>
  | ServiceResponse<SuccessRegisterResponseDto, ErrorBusinesDto>
  | ServiceResponse<SuccessUpdateResponseDto, ErrorBusinesDto>