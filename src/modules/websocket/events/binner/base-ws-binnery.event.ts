import { BaseWsEvent } from '../base-ws.event';
import { WsSession } from '../../schema/websocket.session';
import { AppWsException } from '../../../../commons/exceptions/ws-error.exception';

export abstract class BaseWsEventBinner extends BaseWsEvent<Buffer, Buffer> {
  /**
   * Validasi buffer binary
   */
  protected validatePayload(buffer: Buffer): void {
    if (!Buffer.isBuffer(buffer)) {
      throw new AppWsException('INVALID_BINARY', 'Payload is not binary');
    }
    if (buffer.length === 0) {
      throw new AppWsException('INVALID_BINARY', 'Empty buffer');
    }
  }

  /**
   * Dispatch binary ke semua penerima (dalam bentuk sesi)
   */
  async dispatch(
    receivers: WsSession[],
    payload: Buffer,
    sender: WsSession,
  ): Promise<void> {
    for (const receiver of receivers) {
      receiver.socket!.send(payload);
    }
  }

  /**
   * Eksekusi utama event binary
   */
  async executeBase(session: WsSession, payload: Buffer): Promise<void> {
    this.validatePayload(payload);
    const receivers = await this.getReceivers(session, this.labelEvent);
    const modifiedPayload = await this.modifiedPayload(session, payload);
    await this.dispatch(receivers, modifiedPayload, session);
  }

  /**
   * Modifikasi payload binary sebelum dikirim (default: tambahkan header)
   */
  async modifiedPayload(
    session: WsSession, 
    payload: Buffer
  ): Promise<Buffer> {
    return payload
  }
}