import { Injectable } from "@nestjs/common";
import { ExternalApiService } from "./external-api.service";
import { ServiceResponse } from "../type/service-response.type";
import { WHResPipe } from "../pipes/webhook-response.pipe";
import { CreateSesiDto } from "src/modules/websocket/events/json/bell/dto/create-sesi.dto";
import { DestroySesiDto } from "src/modules/websocket/events/json/bell/dto/destroy-sesi.dto";
import { DestroyAllSesiDto } from "src/modules/websocket/events/json/bell/dto/destroy-all-sesi.dto";
import { SuccessCreateResponseDto } from "../dto/bell/create-contex.dto";
import { SuccessDestroyResponseDto } from "../dto/bell/destroy-context.dto";
import { SuccessDestroyAllResponseDto } from "../dto/bell/destroy-all-contex.dto";
import { ErrorBusinesDto } from "../dto/bell/error-busines-response.dto";

@Injectable()
export class BellApiService {
  constructor(private readonly apiService: ExternalApiService) {}

  async store(baseUrl: string, data: CreateSesiDto, secret?: string) {
    const raw = await this.apiService.call<ServiceResponse<SuccessCreateResponseDto, ErrorBusinesDto>, CreateSesiDto>({
      url: `${baseUrl}/bell`,
      method: 'POST',
      payload: data,
      secret,
    });

    await WHResPipe(raw, SuccessCreateResponseDto, ErrorBusinesDto)

    return raw.data;
  }

  async destroy(baseUrl: string, data: DestroySesiDto, secret?: string) {
    const raw = await this.apiService.call<ServiceResponse<SuccessDestroyResponseDto, ErrorBusinesDto>, DestroySesiDto>({
      url: `${baseUrl}/bell/${data.time}`,
      method: 'DELETE',
      payload: undefined,
      secret,
    });

    await WHResPipe(raw, SuccessDestroyResponseDto, ErrorBusinesDto)
    return raw.data;
  }

  async destroyAll(baseUrl: string, data: DestroyAllSesiDto, secret?: string) {
    const raw = await this.apiService.call<ServiceResponse<SuccessDestroyAllResponseDto, ErrorBusinesDto>, DestroyAllSesiDto>({
      url: `${baseUrl}/bell`,
      method: 'DELETE',
      payload: undefined,
      secret,
    });
    
    await WHResPipe(raw, SuccessDestroyAllResponseDto, ErrorBusinesDto)

    return raw.data;
  }
}
