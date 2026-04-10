import { Injectable } from '@nestjs/common';
import { WsSession } from '../schema/websocket.session';

@Injectable()
export class WebSocketSessionRegistry {
  // Primary index: by sessionId
  private sessions = new Map<number, WsSession>();

  // Secondary indexes: by tenantId
  private tenantDevices = new Map<string, Set<WsSession>>();
  private tenantBrowsers = new Map<string, Set<WsSession>>();

  register(session: WsSession): void {
    this.sessions.set(session.sessionId, session);

    const tenantId = session.principal.clientId;
    if (session.type === 'device') {
      if (!this.tenantDevices.has(tenantId)) {
        this.tenantDevices.set(tenantId, new Set());
      }
      this.tenantDevices.get(tenantId)!.add(session);
    } else if (session.type === 'browser'|| session.type === 'desktop') {
      if (!this.tenantBrowsers.has(tenantId)) {
        this.tenantBrowsers.set(tenantId, new Set());
      }
      this.tenantBrowsers.get(tenantId)!.add(session);
    }
  }

  unregister(sessionId: number): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Hapus dari secondary
    const tenantId = session.principal.clientId;
    if (session.type === 'device') {
      const set = this.tenantDevices.get(tenantId);
      if (set) {
        set.delete(session);
        if (set.size === 0) this.tenantDevices.delete(tenantId);
      }
    } else if (session.type === 'browser' || session.type === 'desktop') {
      const set = this.tenantBrowsers.get(tenantId);
      if (set) {
        set.delete(session);
        if (set.size === 0) this.tenantBrowsers.delete(tenantId);
      }
    }

    this.sessions.delete(sessionId);
  }

  find(sessionId: number): WsSession | undefined {
    return this.sessions.get(sessionId);
  }

  getAllSessions(): WsSession[] {
    return Array.from(this.sessions.values());
  }

  getDevicesByTenant(tenantId: string, filter?: (session: WsSession) => boolean): WsSession[] {
    const set = this.tenantDevices.get(tenantId);
    if (!set) return [];
    const sessions = Array.from(set);
    return filter ? sessions.filter(filter) : sessions;
  }

  getBrowsersByTenant(tenantId: string, filter?: (session: WsSession) => boolean): WsSession[] {
    const set = this.tenantBrowsers.get(tenantId);
    if (!set) return [];
    const sessions = Array.from(set);
    return filter ? sessions.filter(filter) : sessions;
  }
}