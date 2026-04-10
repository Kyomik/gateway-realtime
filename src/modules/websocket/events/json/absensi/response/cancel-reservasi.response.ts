import { ServiceResponse } from "src/modules/webhook/type/service-response.type"
import { ErrorBusinesDto } from "src/modules/webhook/dto/bell/error-busines-response.dto"
import { SuccessCancelReservasiResponseDto } from "src/modules/webhook/dto/absensi/cancel-reservasi-response.dto"

export type ReservasiResponse = ServiceResponse<SuccessCancelReservasiResponseDto, ErrorBusinesDto>