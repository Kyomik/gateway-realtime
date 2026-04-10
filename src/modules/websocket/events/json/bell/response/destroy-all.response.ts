import { ServiceResponse } from "src/modules/webhook/type/service-response.type"
import { ErrorBusinesDto } from "src/modules/webhook/dto/bell/error-busines-response.dto"
import { SuccessDestroyAllResponseDto } from "src/modules/webhook/dto/bell/destroy-all-contex.dto"

export type DestroyAllResponse = ServiceResponse<SuccessDestroyAllResponseDto, ErrorBusinesDto>