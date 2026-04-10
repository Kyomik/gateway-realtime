import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { WebhookError } from 'src/commons/exceptions/webhook-error.exception';
import { ApiResponse } from 'src/modules/webhook/type/api-response.type';

export interface ApiCallOptions<TPayload = unknown> {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  payload?: TPayload;
  headers?: Record<string, string>;
  secret?: string
}

@Injectable()
export class ExternalApiService {
  constructor(private readonly httpService: HttpService) {}

  async call<TResponse, TPayload = unknown>(
    options: ApiCallOptions<TPayload>,
  ): Promise<ApiResponse<TResponse>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (options.secret) {
        headers.Authorization = `Bearer ${options.secret}`;
      }

      const response = await firstValueFrom(
        this.httpService.request({
          url: options.url,
          method: options.method,
          params: options.method === 'GET' ? options.payload : undefined,
          data: options.method !== 'GET' ? options.payload : undefined,
          headers,
          timeout: 5000,
        })
      );

      return {
        data: response.data as TResponse,
        headers: response.headers as Record<string, string | string[] | undefined>, // cast aman
      };

    } catch (err) {
      const error = err as AxiosError;
      
      if (error.response) {
        throw new WebhookError(
          'API_RESPONSE_ERROR',
          error.message,
          error.response.status,
          error.response.data,
        );
      }

      if (error.request) {
        throw new WebhookError('API_NO_RESPONSE', error.message);
      }

      throw new WebhookError('API_UNKNOWN_ERROR', error.message);
    }
  }
}

