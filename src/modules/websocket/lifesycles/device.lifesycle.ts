import { BaseLifecycle } from "./base.lifesycle";
import { DeviceUser } from 'src/commons/schemas/device.principal';

export class DeviceLifecycle extends BaseLifecycle {
  async afterConnect() {
    const device = this.session.principal as DeviceUser;
    const browserSessions = this.registry.getBrowsersByTenant(
      device.clientId,
      (session) => 
        session.isActive() && 
        (session.product == undefined || device.device_product == session.product)
    );
    
    for (const browserSession of browserSessions) {
      browserSession.socket?.send(JSON.stringify({
        event: 'device-connected',
        data: {
          id: device.id_device,
          deviceId: device.deviceId,
          state: this.session.state
        },
      }));
    }
  }

  async afterDisconnect() {
    const device = this.session.principal as DeviceUser;
    const browserSessions = this.registry.getBrowsersByTenant(
      device.clientId,
      (session) => 
        session.isActive() && 
        (session.product == undefined || device.device_product == session.product)
    );

    for (const browserSession of browserSessions) {
      browserSession.socket?.send(JSON.stringify({
        event: 'device-disconnected',
        data: {
          id: device.id_device,
          state: this.session.state
        },
      }));
    }
  }

  async afterSuspend() {
    const device = this.session.principal as DeviceUser;
    const browserSessions = this.registry.getBrowsersByTenant(
      device.clientId,
      (session) => 
        session.isActive() && 
        (session.product == undefined || device.device_product == session.product)
    );

    for (const browserSession of browserSessions) {
      browserSession.socket?.send(JSON.stringify({
        event: 'device-suspend',
        data: {
          id: device.id_device,
          state: this.session.state
        },
      }));
    }
  }

  afterResume(): void {
    const device = this.session.principal as DeviceUser;
    const browserSessions = this.registry.getBrowsersByTenant(
      device.clientId,
      (session) => 
        session.isActive() && 
        (session.product == undefined || device.device_product == session.product)
    );
    
    for (const browserSession of browserSessions) {
      browserSession.socket?.send(JSON.stringify({
        event: 'device-reconnect',
        data: {
          id: device.id_device,
          state: this.session.state,
          deviceId: device.deviceId
        },
      }));
    }
  }
}