import { Events } from "src/modules/websocket/types/event.type";
import { WsSession } from "../../schema/websocket.session";

export interface IEventHelper {
  filterEvents(session: WsSession, event: string, events: Events[]): Promise<Events[]>;
  filterReceivers(receivers: WsSession[], allowedEvents: Events[]): Promise<WsSession[]>;
}