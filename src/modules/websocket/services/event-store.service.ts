import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { EventRecord } from "../schema/event.record";
import { randomUUID } from "crypto";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EventStoreService {
  private readonly logger = new Logger(EventStoreService.name);
  private events = new Map<string, EventRecord>();
  private userEvents = new Map<number, Set<string>>();

  // Konfigurasi
  private readonly MAX_EVENTS_PER_USER: number;
  private readonly MAX_EVENTS_TOTAL: number;
  private readonly CLEANUP_INTERVAL: number;
  private readonly DELIVERED_TIMEOUT: number;
  private readonly STALE_TIMEOUT: number;
  private readonly MAX_ATTEMPT_PER_EVENT: number;
  private readonly BASE_BACKOFF_EVENT: number

  private stats = {
    totalEventsCreated: 0,
    totalEventsDelivered: 0,
    totalEventsApplied: 0,
    totalEventsFailed: 0,
    totalEventsExpired: 0,
    currentPending: 0,
    maxPendingPerUser: 0,
    currentUsers: 0,
    lastCleanup: Date.now(),
  };

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2, // <-- tambahkan
  ) {
    this.MAX_EVENTS_PER_USER = this.configService.get('EVENT_STORE_MAX_PER_USER', 1000);
    this.MAX_EVENTS_TOTAL = this.configService.get('EVENT_STORE_MAX_TOTAL', 100000);
    this.CLEANUP_INTERVAL = this.configService.get('EVENT_STORE_CLEANUP_INTERVAL', 5 * 60 * 1000);
    this.DELIVERED_TIMEOUT = this.configService.get('EVENT_STORE_DELIVERED_TIMEOUT', 30000);
    this.STALE_TIMEOUT = this.configService.get('EVENT_STORE_STALE_TIMEOUT', 3600000);
    this.MAX_ATTEMPT_PER_EVENT = this.configService.get('EVENT_STORE_MAX_ATTEMPTS', 5);
    this.BASE_BACKOFF_EVENT = this.configService.get('EVENT_BACKOFF_BASE', 1000)

    this.setupCleanupInterval();
  }

  private setupCleanupInterval() {
    setInterval(() => {
      this.cleanupExpiredEvents();
      this.cleanupStaleDelivered();
      this.enforceMemoryLimits();
      this.stats.lastCleanup = Date.now();
      this.logger.debug(`Cleanup completed. Stats: ${JSON.stringify(this.getStats())}`);
    }, this.CLEANUP_INTERVAL);
  }

  private generateEventId(): string {
    return randomUUID();
  }

  getAllUserIds(): number[] {
    return Array.from(this.userEvents.keys());
  }

  create<TResult>(
    targetIds: number[],
    eventName: string,
    payload: TResult,
    qos: 0 | 1 | 2 = 0,
    options?: { 
      ttl?: number; 
      senderId?: number;
      notifySender?: boolean;
      senderEventName?: string;   // <-- tambahkan
    }
  ): string {
    if (this.events.size >= this.MAX_EVENTS_TOTAL) {
      this.logger.warn('Global event limit reached, forcing cleanup');
      this.forceCleanup();
    }

    const eventId = this.generateEventId();
    const now = Date.now();
    const expiresAt = options?.ttl ? now + options.ttl : undefined;

    const record = new EventRecord(
      eventId,
      eventName,
      payload,
      qos,
      now,
      options?.ttl,
      expiresAt,
      options?.senderId,
      options?.notifySender ?? false,
      options?.senderEventName,   // <-- teruskan
    );

    // Simpan event ke map
    for (const userId of targetIds) {
      record.setUserStatus(userId, 'STORED');
      record.setUserSequence(userId, now);
      if (!this.userEvents.has(userId)) {
        this.userEvents.set(userId, new Set());
      }
      this.userEvents.get(userId)!.add(eventId);
    }
    this.events.set(eventId, record);

    // Terapkan limit per user
    for (const userId of targetIds) {
      this.enforcePerUserLimit(userId);
    }

    // Jadwalkan penghapusan jika TTL ditentukan
    if (options?.ttl && options.ttl > 0) {
      const timer = setTimeout(() => {
        const event = this.events.get(eventId);
        // Hapus hanya jika masih ada dan sudah expired
        if (event && event.isExpired) {
          this.removeEvent(eventId, 'expired');
          this.logger.debug(`Scheduled removal for expired event ${eventId}`);
        }
      }, options.ttl);
      record.setExpiryTimer(timer);
    }

    this.stats.totalEventsCreated++;
    this.updateStats();
    this.logger.log(`Event created: ${eventName} for ${targetIds.length} users, eventId ${eventId}`);
    return eventId;
  }

  private enforcePerUserLimit(userId: number) {
    const eventIds = this.userEvents.get(userId);
    if (!eventIds || eventIds.size <= this.MAX_EVENTS_PER_USER) return;

    const userEvents = Array.from(eventIds)
      .map(id => this.events.get(id)!)
      .filter(e => e.getUserStatus(userId) !== 'APPLIED' && !e.isExpired)
      .sort((a, b) => a.createdAt - b.createdAt);

    const toRemove = userEvents.slice(0, userEvents.length - this.MAX_EVENTS_PER_USER);
    for (const event of toRemove) {
      eventIds.delete(event.eventId);
      event.userStatus.delete(userId);
      event.userSequence.delete(userId);
      if (event.userStatus.size === 0) {
        // Hapus event karena limit per user (force)
        this.removeEvent(event.eventId, 'force');
      }
    }
  }

  markDelivered(userId: number, eventId: string) {
    const event = this.events.get(eventId);
    if (!event) return;

    const status = event.getUserStatus(userId);
    if (status === 'APPLIED') {
      this.logger.warn(`Event ${eventId} already APPLIED for user ${userId}`);
      return;
    }

    event.setUserStatus(userId, 'DELIVERED');
    event.incrementDeliveryAttempt(userId); // catat attempt
    this.stats.totalEventsDelivered++;
  }

  markFailed(userId: number, eventId: string, error: string) {
    const event = this.events.get(eventId);
    if (!event) return;

    const status = event.getUserStatus(userId);
    if (status === 'FAILED') return;

    event.setUserStatus(userId, 'FAILED');
    event.incrementDeliveryAttempt(userId);
    event.addDeliveryError(userId, error);
    this.stats.totalEventsFailed++;
  }

  markApplied(userId: number, eventId: string) {
    const event = this.events.get(eventId);
    if (!event) return;

    event.setUserStatus(userId, 'APPLIED');
    this.stats.totalEventsApplied++;

    if (event.isAllApplied()) {
      this.removeEvent(eventId, 'applied');
    }
  }

  getPending(userId: number): EventRecord[] {
    const eventIds = this.userEvents.get(userId);
    if (!eventIds) return [];

    const result: EventRecord[] = [];
    for (const eventId of eventIds) {
      const event = this.events.get(eventId);
      if (!event) continue;
      const status = event.getUserStatus(userId);
      if (status !== 'APPLIED' && !event.isExpired) {
        result.push(event);
      }
    }

    result.sort((a, b) => a.createdAt - b.createdAt);
    return result;
  }

  getEvent(eventId: string): EventRecord | undefined {
    return this.events.get(eventId);
  }

  getPendingWithRetry(userId: number): EventRecord[] {
    const now = Date.now();
    const eventIds = this.userEvents.get(userId);
    if (!eventIds) return [];

    const result: EventRecord[] = [];
    for (const eventId of eventIds) {
      const event = this.events.get(eventId);
      if (!event || event.isExpired) continue;

      if (event.shouldRetry(
        userId, 
        now, 
        this.MAX_ATTEMPT_PER_EVENT, 
        this.DELIVERED_TIMEOUT,
        this.BASE_BACKOFF_EVENT // ← masuk ke function
      )) {
        result.push(event);
      }
    }

    result.sort((a, b) => {
      const aStatus = a.getUserStatus(userId);
      const bStatus = b.getUserStatus(userId);
      const statusOrder = { 'STORED': 1, 'DELIVERED': 2, 'FAILED': 3 };
      if (aStatus !== bStatus) {
        return statusOrder[aStatus] - statusOrder[bStatus];
      }
      return a.createdAt - b.createdAt;
    });
    return result;
  }

  private removeEvent(
    eventId: string, 
    reason: 'applied' | 'expired' | 'force' = 'expired'
  ) {
    const event = this.events.get(eventId);
    if (!event) return;

    // Batalkan timer jika ada
    event.clearExpiryTimer();

    // Kirim feedback jika diperlukan (bukan karena applied)
    if (reason !== 'applied' && event.notifySender && event.senderId) {
      this.eventEmitter.emit('event.expired', {
        eventId: event.eventId,
        eventName: event.eventName,
        senderEventName: event.senderEventName,
        reason: reason,
        senderId: event.senderId,
      });
    }

    // Hapus dari semua user
    for (const userId of event.userStatus.keys()) {
      const userSet = this.userEvents.get(userId);
      if (userSet) {
        userSet.delete(eventId);
        if (userSet.size === 0) this.userEvents.delete(userId);
      }
    }
    this.events.delete(eventId);
  }

  private cleanupExpiredEvents() {
    let expiredCount = 0;
    for (const [eventId, event] of this.events) {
      if (event.isExpired) {
        this.removeEvent(eventId, 'expired'); // <-- beri alasan expired
        expiredCount++;
      }
    }
    this.stats.totalEventsExpired += expiredCount;
    if (expiredCount > 0) {
      this.logger.log(`Cleaned up ${expiredCount} expired events`);
    }
  }

  private enforceMemoryLimits() {
    if (this.events.size > this.MAX_EVENTS_TOTAL) {
      this.logger.warn(`Total events (${this.events.size}) exceeds limit, forcing cleanup`);
      this.forceCleanup();
    }
  }

  private cleanupStaleDelivered() {
    const now = Date.now();
    for (const [eventId, event] of this.events) {
      for (const [userId, status] of event.userStatus) {
        if (status === 'DELIVERED') {
          const last = event.getLastDeliveryAttempt(userId);
          if (last && (now - last) > this.STALE_TIMEOUT) {
            event.setUserStatus(userId, 'FAILED');
            this.stats.totalEventsFailed++;
            this.logger.warn(`Event ${eventId} for user ${userId} is stale delivered, marked as FAILED`);
          }
        }
      }
    }
  }

  private forceCleanup() {
    interface EventWithPriority {
      event: EventRecord;
      priority: number;
    }

    const eventsWithPriority: EventWithPriority[] = [];

    for (const event of this.events.values()) {
      let totalWeight = 0;
      for (const status of event.userStatus.values()) {
        switch (status) {
          case 'FAILED': totalWeight += 4; break;
          case 'DELIVERED': totalWeight += 3; break;
          case 'STORED': totalWeight += 2; break;
          case 'APPLIED': totalWeight += 1; break;
          default: totalWeight += 0;
        }
      }
      eventsWithPriority.push({ event, priority: totalWeight });
    }

    eventsWithPriority.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return a.event.createdAt - b.event.createdAt;
    });

    const toRemove = eventsWithPriority.slice(0, eventsWithPriority.length - this.MAX_EVENTS_TOTAL);
    for (const { event } of toRemove) {
      this.removeEvent(event.eventId, 'force'); // <-- beri alasan force
    }
    this.logger.warn(`Force cleanup removed ${toRemove.length} events`);
  }

  private updateStats() {
    let totalPending = 0;
    let maxPending = 0;
    for (const [userId, eventIds] of this.userEvents) {
      let pendingCount = 0;
      for (const eventId of eventIds) {
        const event = this.events.get(eventId);
        if (event && event.getUserStatus(userId) !== 'APPLIED' && !event.isExpired) {
          pendingCount++;
        }
      }
      totalPending += pendingCount;
      maxPending = Math.max(maxPending, pendingCount);
    }
    this.stats.currentPending = totalPending;
    this.stats.maxPendingPerUser = maxPending;
    this.stats.currentUsers = this.userEvents.size;
  }

  // Statistik
  getStats() {
    let mem = 0;
    for (const event of this.events.values()) {
      // Gunakan replacer untuk menghilangkan expiryTimer dan menangani circular
      const json = JSON.stringify(event, (key, value) => {
        if (key === 'expiryTimer') return undefined; // skip timer
        // Jika value adalah Map, ubah ke objek biasa agar serializable
        if (value instanceof Map) {
          return Object.fromEntries(value);
        }
        return value;
      });
      mem += json.length;
    }
    return {
      ...this.stats,
      estimatedMemoryKB: Math.round(mem / 1024 * 100) / 100,
      totalEventsStored: this.events.size,
      usersWithPending: Array.from(this.userEvents.entries())
        .filter(([uid, ids]) => {
          for (const id of ids) {
            const e = this.events.get(id);
            if (e && e.getUserStatus(uid) !== 'APPLIED' && !e.isExpired) return true;
          }
          return false;
        }).length,
      cleanupInterval: this.CLEANUP_INTERVAL,
      maxEventsPerUser: this.MAX_EVENTS_PER_USER,
      maxEventsTotal: this.MAX_EVENTS_TOTAL,
    };
  }

  getUserStats(userId: number) {
    const eventIds = this.userEvents.get(userId);
    if (!eventIds) return { totalEvents: 0, pendingEvents: 0, byStatus: {}, expired: 0 };

    let total = 0;
    let pending = 0;
    let expired = 0;
    const byStatus: Record<string, number> = {};

    for (const eventId of eventIds) {
      const event = this.events.get(eventId);
      if (!event) continue;
      total++;
      const status = event.getUserStatus(userId);
      byStatus[status] = (byStatus[status] || 0) + 1;
      if (status !== 'APPLIED') {
        if (event.isExpired) expired++;
        else pending++;
      }
    }

    return {
      totalEvents: total,
      pendingEvents: pending,
      byStatus,
      expired,
      oldestPending: null, // bisa dihitung jika perlu
      newestEvent: null,
    };
  }

  // Debug
  dumpStore() {
    const dump: any = {};
    for (const [userId, eventIds] of this.userEvents) {
      dump[userId] = {
        count: eventIds.size,
        events: Array.from(eventIds).map(id => {
          const e = this.events.get(id);
          return {
            eventId: id,
            eventName: e?.eventName,
            status: e?.getUserStatus(userId),
            createdAt: e?.createdAt,
          };
        }),
      };
    }
    return dump;
  }
}