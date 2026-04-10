import { ServiceResponse } from "src/modules/webhook/type/service-response.type"
import { ErrorBusinesDto } from "src/modules/webhook/dto/bell/error-busines-response.dto"
import { SuccessDestroyResponseDto } from "src/modules/webhook/dto/bell/destroy-context.dto"

export type DestroyResponse = ServiceResponse<SuccessDestroyResponseDto, ErrorBusinesDto>