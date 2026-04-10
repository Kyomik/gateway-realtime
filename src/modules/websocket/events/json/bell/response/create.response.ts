import { ServiceResponse } from "src/modules/webhook/type/service-response.type"
import { SuccessCreateResponseDto } from "src/modules/webhook/dto/bell/create-contex.dto"
import { ErrorBusinesDto } from "src/modules/webhook/dto/bell/error-busines-response.dto"

export type CreateResponse = ServiceResponse<SuccessCreateResponseDto, ErrorBusinesDto>