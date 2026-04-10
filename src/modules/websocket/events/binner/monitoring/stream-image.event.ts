import { Injectable } from '@nestjs/common';
import { BaseWsEventBinner } from '../base-ws-binnery.event';
import { WsSession } from 'src/modules/websocket/schema/websocket.session';
import { DeviceUser } from 'src/commons/schemas/device.principal';

@Injectable()
export class StreamImageEvent extends BaseWsEventBinner{
    readonly qos = 0;

    readonly productName = 'monitoring';
    readonly labelEvent = 'stream-image';
    readonly labelEventToReceiver: string = 'stream-image';
    readonly type = 'device';
    readonly receiverType = 'desktop';
    readonly allowedEvent = ['stream-image'];

    async modifiedPayload(
        session: WsSession, 
        payload: Buffer
    ): Promise<Buffer> {

        // Header: [1 byte tipe] + [4 byte userId] + [1 byte flags]
        const device = session.principal as DeviceUser
        const header = Buffer.alloc(5);
        // header.writeUInt8(session.type === 'device' ? 1 : 2, 0); // tipe pengirim
        header.writeUInt8(1)
        header.writeUInt32BE(Number(device.id_device) ?? 0, 0); // ID user (dari session)
        header.writeUInt8(0x01, 4); // flag (contoh)
        return Buffer.concat([header, payload]);
    }
}
