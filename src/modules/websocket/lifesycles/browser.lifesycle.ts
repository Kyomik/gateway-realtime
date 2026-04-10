import { BaseLifecycle } from './base.lifesycle';
import { DeviceUser } from 'src/commons/schemas/device.principal';
import { DeviceService } from 'src/modules/auth/services/device.service';
import { WsSession } from '../schema/websocket.session';
import { WebSocketSessionRegistry } from '../services/websocket-registry.service';
import { EventStoreService } from '../services/event-store.service';
import { BrowserUser } from 'src/commons/schemas/browser.principal';
import { UnauthorizedException } from '@nestjs/common';

export class BrowserLifecycle extends BaseLifecycle {
  private readonly deviceService: DeviceService;

  constructor(
    session: WsSession,
    registry: WebSocketSessionRegistry,
    deviceService: DeviceService,
    eventStore: EventStoreService,
    suspendTimeout: number
  ) {
    super(session, registry, eventStore, suspendTimeout);
    this.deviceService = deviceService;
  }

  async afterConnect(): Promise<void> {
    try {
      const sesi = this.session.principal as BrowserUser;
      const tenantId = sesi.clientId;
      const productFilter = this.session.product;
      const allowedProduct = sesi.role_product;

      if (productFilter && productFilter !== allowedProduct) return

      const allDevices = await this.deviceService.getDevicesWithInfoByTenant(
        tenantId, 
        productFilter,
      );
      
      const allSessions = this.registry.getDevicesByTenant(tenantId, (s) => {
        const user = s.principal as DeviceUser;
        return productFilter === undefined || user.device_product === productFilter;
      });
      const deviceStates = new Map<number, string>();
      for (const s of allSessions) {
        const user = s.principal as DeviceUser;
        deviceStates.set(
          Number(user.id_device),
          s.state
        );
      }

      const deviceList = allDevices.map(device => ({
        id: device.id,
        deviceId: device.deviceId,
        product: device.product,
        state: deviceStates.get(Number(device.id)) ?? 'OFFLINE'
      }));
      

      this.session.socket?.send(JSON.stringify({
        event: 'device-snapshot',
        data: deviceList,
      }));

    } catch (error) {
      console.error('[BrowserLifecycle] Gagal mengambil snapshot:', error);
      this.session.socket?.send(JSON.stringify({
        event: 'device-snapshot',
        data: [],
      }));
    }
  }

  afterDisconnect(): void {
    // cleanup khusus browser
  }

  afterSuspend(): void {
    
  }

  async afterResume(): Promise<void> {
    // try {
    //   const tenantId = this.session.principal.clientId;
    //   const productFilter = this.session.product;

    //   const allDevices = await this.deviceService.getDevicesWithInfoByTenant(tenantId, productFilter);

    //   const allSessions = this.registry.getDevicesByTenant(tenantId, (s) => {
    //     const user = s.principal as DeviceUser;
    //     return productFilter === undefined || user.device_product === productFilter;
    //   });
    //   const deviceStates = new Map<number, string>();

    //   for (const s of allSessions) {
    //     const user = s.principal as DeviceUser;
    //     deviceStates.set(
    //       Number(user.id_device),
    //       s.state
    //     );
    //   }

    //   const deviceList = allDevices.map(device => ({
    //     id: device.id,
    //     deviceId: device.deviceId,
    //     product: device.product,
    //     state: deviceStates.get(Number(device.id)) ?? 'OFFLINE'
    //   }));

    //   this.session.socket?.send(JSON.stringify({
    //     event: 'device-snapshot',
    //     data: deviceList,
    //   }));

    // } catch (error) {
    //   console.error('[BrowserLifecycle] Gagal mengambil snapshot:', error);
    //   this.session.socket?.send(JSON.stringify({
    //     event: 'device-snapshot',
    //     data: [],
    //   }));
    // }
  }
}