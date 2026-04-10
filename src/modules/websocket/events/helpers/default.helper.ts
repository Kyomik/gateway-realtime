import { Injectable } from "@nestjs/common";
import { WsSession } from "../../schema/websocket.session";
import { Events } from "src/modules/websocket/types/event.type";
import { IEventHelper } from "./helper.interface";

@Injectable()
export class DefaultHelper implements IEventHelper {
  async filterEvents(
    session: WsSession,
    event: string,
    events: Events[]
  ): Promise<Events[]> {
    return events;
  }

  async filterReceivers(
    receivers: WsSession[],
    allowedEvents: Events[],
  ): Promise<WsSession[]> {
    return receivers;
  }
}