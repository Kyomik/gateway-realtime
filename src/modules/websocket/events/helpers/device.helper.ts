import { Injectable } from "@nestjs/common";
import { WsSession } from "../../schema/websocket.session";
import { Events } from "src/modules/websocket/types/event.type";
import { DeviceUser } from "src/commons/schemas/device.principal";
import { IEventHelper } from "./helper.interface";

@Injectable()
export class DeviceHelper implements IEventHelper {
  async filterEvents(
    session: WsSession,
    event: string,
    events: Events[]
  ): Promise<Events[]> {
    const user = session.principal as DeviceUser;
    const blacklist = user.blacklistSend ?? [];
    return events.filter(e =>
      !blacklist.includes(e.id) &&
      e.label === event &&
      e.id_device === user.id_device
    );
  }

  async filterReceivers(
    receivers: WsSession[],
    allowedEvents: Events[],
  ): Promise<WsSession[]> {
    return receivers.filter(r => {
      const user = r.principal as DeviceUser;
      const blacklist = user.blacklistGet ?? [];
      return allowedEvents.some(ev =>
        ev.id_device === user.id_device &&
        !blacklist.includes(ev.id)
      );
    });
  }
}