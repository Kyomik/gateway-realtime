import { Injectable } from "@nestjs/common";
import { ExternalApiService } from "./external-api.service";
import { ServiceResponse } from "../type/service-response.type";
import { SuccessLoginResponseDto } from "../dto/absensi/login-response.dto";
import { SuccessRegisterResponseDto } from "../dto/absensi/register-response.dto";
import { SuccessUpdateResponseDto } from "../dto/absensi/update-response.dto";
import { ErrorBusinesDto } from "../dto/absensi/error-busines-response.dto";
import { WHResPipe } from "../pipes/webhook-response.pipe";
import { SuccessGetAllReservasiResponseDto } from "../dto/absensi/get-all-reservasi-response.dto";
import { GetAllReservasiDto } from "src/modules/websocket/events/json/absensi/dto/get-all-reservasi.dto";
import { CancelReservasiDto } from "src/modules/websocket/events/json/absensi/dto/cancel-reservasi.dto";
import { SuccessCancelReservasiResponseDto } from "../dto/absensi/cancel-reservasi-response.dto";

@Injectable()
export class AbsensiApiService {
  constructor(private readonly apiService: ExternalApiService) {}

  async login(baseUrl: string, uid: string, secret?: string) {
    const raw = await this.apiService.call<ServiceResponse<SuccessLoginResponseDto, ErrorBusinesDto>, { uid: string }>({
      url: `${baseUrl}/scan/login`,
      method: 'POST',
      payload: { uid },
      secret,
    });

    await WHResPipe(raw, SuccessLoginResponseDto, ErrorBusinesDto)
    
    return raw.data;
  }

  async register(baseUrl: string, uid: string, secret?: string) {
    const raw = await this.apiService.call<ServiceResponse<SuccessRegisterResponseDto, ErrorBusinesDto>, { uid: string }>({
      url: `${baseUrl}/scan/register`,
      method: 'POST',
      payload: { uid },
      secret,
    });

    await WHResPipe(raw, SuccessRegisterResponseDto, ErrorBusinesDto)
    
    return raw.data;
  }

  async update(baseUrl: string, uid: string, secret?: string) {
    const raw = await this.apiService.call<ServiceResponse<SuccessUpdateResponseDto, ErrorBusinesDto>, { uid: string }>({
      url: `${baseUrl}/scan/update`,
      method: 'POST',
      payload: { uid },
      secret,
    });
    
    await WHResPipe(raw, SuccessUpdateResponseDto, ErrorBusinesDto)

    return raw.data;
  }

  async getAllReservasi(baseUrl: string, payload: GetAllReservasiDto, secret?: string) {
    const raw = await this.apiService.call<ServiceResponse<SuccessGetAllReservasiResponseDto, ErrorBusinesDto>, GetAllReservasiDto>({
      url: `${baseUrl}/reservasi`,
      method: 'POST',
      payload: payload,
      secret,
    });
    
    await WHResPipe(raw, SuccessGetAllReservasiResponseDto, ErrorBusinesDto)

    return raw.data;
  }

  async cancelReservasi(baseUrl: string, payload: CancelReservasiDto, secret?: string) {
    const raw = await this.apiService.call<ServiceResponse<SuccessCancelReservasiResponseDto, ErrorBusinesDto>, {uid: string}>({
      url: `${baseUrl}/reservasi/${payload.id}`,
      method: 'DELETE',
      payload: {uid: payload.uid},
      secret,
    });
    
    await WHResPipe(raw, SuccessCancelReservasiResponseDto, ErrorBusinesDto)

    return raw.data;
  }
}
