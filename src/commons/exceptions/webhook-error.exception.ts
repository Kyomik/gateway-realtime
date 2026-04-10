import { WsException } from '@nestjs/websockets';
import { WsErrorPayload } from 'src/modules/websocket/types/ws-error.type';

export class WebhookError extends WsException {
  constructor(
    public readonly code: string,
    message?: string,
    public readonly status?: number,
    public readonly data?: unknown,
  ) {

    const payload: WsErrorPayload & { status?: number; data?: unknown } = {
      code,
      message,
      status,
      data,
    };

    super(payload);
  }
}
