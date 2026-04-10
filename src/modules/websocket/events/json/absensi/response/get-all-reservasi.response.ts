import { ServiceResponse } from "src/modules/webhook/type/service-response.type"
import { ErrorBusinesDto } from "src/modules/webhook/dto/bell/error-busines-response.dto"
import { SuccessGetAllReservasiResponseDto } from "src/modules/webhook/dto/absensi/get-all-reservasi-response.dto"

export type GetAllReservasiResponse = ServiceResponse<SuccessGetAllReservasiResponseDto, ErrorBusinesDto>