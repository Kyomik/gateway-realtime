import { HttpException, HttpStatus } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { WsErrorPayload } from "../types/ws-error.type";

export function normalizeWsError(err: unknown): WsErrorPayload {
  if (err instanceof WsException) {
    const error = err.getError();
    if (typeof error === 'object' && error !== null && 'code' in error) {
      return error as WsErrorPayload;
    }
    return { code: 'WS_EXCEPTION', message: String(error) };
  }

  if (err instanceof HttpException) {
    const response = err.getResponse();
    let message: string;
    if (typeof response === 'string') {
      message = response;
    } else if (typeof response === 'object' && response !== null && 'message' in response) {
      message = (response as any).message;
    } else {
      message = err.message;
    }
    return { code: 'HTTP_ERROR', message };
  }

  if (err instanceof Error) {
    return { code: 'INTERNAL_ERROR', message: err.message };
  }

  return { code: 'INTERNAL_ERROR', message: 'Unknown error' };
}