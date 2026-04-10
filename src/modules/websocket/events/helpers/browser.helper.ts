import { Injectable } from "@nestjs/common";
import { WsSession } from "../../schema/websocket.session";
import { Events } from "src/modules/websocket/types/event.type";
import { BrowserUser } from "src/commons/schemas/browser.principal";
import { IEventHelper } from "./helper.interface";

@Injectable()
export class BrowserHelper implements IEventHelper {
  async filterEvents(
    session: WsSession,
    event: string,
    events: Events[]
  ): Promise<Events[]> {
    const user = session.principal as BrowserUser;
    return events.filter(m => {
      return user.whiteListSend.includes(m.id) && m.label === event;
    });
  }

  async filterReceivers(
    receivers: WsSession[],
    allowedEvents: Events[],
  ): Promise<WsSession[]> {
    return receivers.filter(r => {
      const user = r.principal as BrowserUser;
      const whitelist = user.whiteListGet ?? [];
      return allowedEvents.some(e => whitelist.includes(e.id));
    });
  }
}