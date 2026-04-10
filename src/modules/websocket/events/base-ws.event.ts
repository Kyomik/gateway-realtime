import { Inject } from '@nestjs/common';
import { WsSession } from '../schema/websocket.session';
import { AppWsException } from '../../../commons/exceptions/ws-error.exception';
import { TypeEnduser } from 'src/commons/enums/type-enduser.enum';
import { Events } from 'src/modules/websocket/types/event.type';
import { EventService } from 'src/modules/event/event.service';
import { EventHelperFactory } from './helpers/helper.factory';
import { WebSocketSessionManager } from '../services/websocket-sesi-manager.service';
import { TypeProduct } from 'src/commons/enums/type-product.enum';
import { ConfigService } from '@nestjs/config';

export abstract class BaseWsEvent<TInput, TResult = unknown> {
  @Inject(WebSocketSessionManager)
  protected wsManager: WebSocketSessionManager

  @Inject(EventService)
  protected eventService: EventService;

  @Inject(EventHelperFactory)
  protected helperFactory: EventHelperFactory;

  @Inject(ConfigService)
  protected configService: ConfigService;

  protected events: Events[];
  private lastUpdate: number = 0;

  abstract readonly productName: TypeProduct;
  abstract readonly labelEvent: string;
  abstract readonly labelEventToReceiver: string;
  abstract readonly type: TypeEnduser;
  abstract readonly receiverType: TypeEnduser;
  abstract readonly allowedEvent: Array<string>;

  private get CACHE_TTL(): number {
    return this.configService.get('EVENT_CACHE_TTL', 60000);
  }

  /**
   * Validasi bahwa sesi memiliki principal
   */
  protected async validateBase(session: WsSession): Promise<void> {
    if (!session.principal) {
      throw new AppWsException('UNAUTHENTICATED', 'Penyusup lu?');
    }
  }

  /**
   * Validasi tipe pengirim sesuai dengan yang diizinkan event
   */
  protected async validateAccess(session: WsSession): Promise<void> {
    if (!this.type) return;
    if (session.type !== this.type) {
      throw new AppWsException('UNAUTHENTICATED', 'Akses event ditolak');
    }
  }

  /**
   * Mengambil daftar event yang terdaftar untuk produk ini (dengan cache)
   */
  protected async getEventsProduct(): Promise<Events[]> {
    const now = Date.now();
    if (!this.events || now - this.lastUpdate > this.CACHE_TTL) {
      this.events = await this.eventService.getByProduct(this.productName);
      this.lastUpdate = now;
    }
    return this.events;
  }

  /**
   * Menyaring penerima berdasarkan event dan aturan bisnis
   */
  protected async getReceivers(
    session: WsSession,
    event: string,
    payload?: TInput
  ): Promise<WsSession[]> {

    const helperSender = this.helperFactory.getHelper(session.type);
    const helperReceiver = this.helperFactory.getHelper(this.receiverType);

    const verifiedEvents = await this.getEventsProduct();
    const receivers = this.wsManager.getActiveScoketsByType(session, this.receiverType);
    const filteredEvents = await helperSender.filterEvents(
      session, 
      event, 
      verifiedEvents
    );

    if (filteredEvents.length === 0) {
      throw new AppWsException(
        'FORBIDDEN_EVENT',
        'Akses event ditolak',
      );
    }

    return await helperReceiver.filterReceivers(receivers, filteredEvents);
  }

  /**
   * Menentukan nama event yang akan dikirim ke penerima
   */
  protected getEventMessage(payload: TInput): string {
    return this.labelEvent;
  }

  /**
   * Eksekusi utama event – dipanggil oleh WebSocketMessageService
   */
  async execute(session: WsSession, payload: TInput): Promise<void> {
    await this.validateBase(session);
    await this.validateAccess(session);
    await this.executeBase(session, payload);
  }

  /**
   * Logika spesifik event (harus diimplementasikan turunan)
   */
  abstract executeBase(
    session: WsSession,
    payload: TInput,
  ): Promise<void>;

  /**
   * Mengirimkan event ke para penerima
   */
  abstract dispatch(
    receivers: WsSession[],
    payload: TResult,
    sender: WsSession,
  ): Promise<void>;

  /**
   * Memodifikasi payload sebelum dikirim ke penerima
   */
  protected abstract modifiedPayload(
    session: WsSession,
    payload: TInput,
  ): Promise<TResult>
}