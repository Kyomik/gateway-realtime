import { TypeEventStatus } from "src/commons/enums/type-event-status.enum";

export class EventRecord<TResult = any> {
  private expiryTimer?: NodeJS.Timeout;
  
  constructor(
    public readonly eventId: string,
    public readonly eventName: string,
    public readonly payload: TResult,
    public readonly qos: 0 | 1 | 2,
    public readonly createdAt: number = Date.now(),
    public readonly ttl?: number,
    public readonly expiresAt?: number,
    public readonly senderId?: number,               // ← tambah
    public readonly notifySender: boolean = false,   // ← tambah, default false
    public readonly senderEventName?: string,    // <-- tambahkan
    public userStatus: Map<number, TypeEventStatus> = new Map(),
    public userSequence: Map<number, number> = new Map(),
    public deliveryAttempts: Map<number, number> = new Map(),
    public lastDeliveryAttempt: Map<number, number> = new Map(),
    public deliveryErrors: Map<number, string[]> = new Map(),
  ) {}

  get isExpired(): boolean {
    return this.expiresAt ? Date.now() > this.expiresAt : false;
  }

  setExpiryTimer(timer: NodeJS.Timeout) {
    this.expiryTimer = timer;
  }

  clearExpiryTimer() {
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = undefined;
    }
  }

  getUserStatus(userId: number): TypeEventStatus {
    return this.userStatus.get(userId) || 'STORED';
  }

  setUserStatus(userId: number, status: TypeEventStatus) {
    this.userStatus.set(userId, status);
  }

  getUserSequence(userId: number): number {
    return this.userSequence.get(userId) || 0;
  }

  setUserSequence(userId: number, seq: number) {
    this.userSequence.set(userId, seq);
  }

  getDeliveryAttempts(userId: number): number {
    return this.deliveryAttempts.get(userId) || 0;
  }

  incrementDeliveryAttempt(userId: number) {
    this.deliveryAttempts.set(userId, this.getDeliveryAttempts(userId) + 1);
    this.lastDeliveryAttempt.set(userId, Date.now());
  }

  getLastDeliveryAttempt(userId: number): number | undefined {
    return this.lastDeliveryAttempt.get(userId);
  }

  addDeliveryError(userId: number, error: string) {
    if (!this.deliveryErrors.has(userId)) {
      this.deliveryErrors.set(userId, []);
    }
    this.deliveryErrors.get(userId)!.push(error);
  }

  isAllApplied(): boolean {
    for (const status of this.userStatus.values()) {
      if (status !== 'APPLIED') return false;
    }
    return true;
  }

  // Helper untuk menentukan apakah perlu retry untuk user tertentu
  shouldRetry(
    userId: number,
    now: number = Date.now(),
    maxAttempts: number = 5,
    deliveredTimeout: number = 30000,
    backoffBase: number = 1000,
  ): boolean {
    const status = this.getUserStatus(userId);
    if (status === 'APPLIED') return false;
    if (status === 'STORED') return true; // belum pernah dikirim

    if (status === 'DELIVERED') {
      const last = this.getLastDeliveryAttempt(userId);
      if (!last) return true; // seharusnya tidak terjadi
      return (now - last) > deliveredTimeout;
    }

    if (status === 'FAILED') {
      const attempts = this.getDeliveryAttempts(userId);
      if (attempts >= maxAttempts) return false; // max attempts
      const last = this.getLastDeliveryAttempt(userId);
      if (!last) return true;
      
      const backoff = backoffBase * Math.pow(2, attempts) * (0.5 + Math.random());
      return (now - last) > backoff;
    }

    return false;
  }
}