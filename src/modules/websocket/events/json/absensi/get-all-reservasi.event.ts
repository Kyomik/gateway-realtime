import { DeviceUser } from 'src/commons/schemas/device.principal';
import { BaseAbsensiEvent } from './base-absensi.event';
import { Injectable } from '@nestjs/common';
import { AbsensiApiService } from 'src/modules/webhook/services/absensi-api.service';
import { GetAllReservasiDto } from './dto/get-all-reservasi.dto';
import { GetAllReservasiResponse } from './response/get-all-reservasi.response';
import { WsSession } from 'src/modules/websocket/schema/websocket.session';

@Injectable()
export class GetAllReservasiEvent 
    extends BaseAbsensiEvent<GetAllReservasiDto, GetAllReservasiResponse> {

    constructor(
        private readonly absensiApiService: AbsensiApiService
    ) {
        super();
    }

    readonly qos = 1;

    readonly labelEvent = 'get-all-reservasi';
    readonly labelEventToReceiver: string = 'get-all-reservasi'
    readonly type = 'device';
    readonly receiverType = 'self';
    readonly dto = GetAllReservasiDto;
    readonly allowedEvent = ['get-all-reservasi'];

    validatePayload(payload: GetAllReservasiDto): boolean{
        return true;
    }

    async modifiedPayload(
        session: WsSession,
        payload: GetAllReservasiDto,
    ): Promise<GetAllReservasiResponse> {
        const user = session.principal as DeviceUser;
        const product = user.getProduct(this.productName)
        const productDomain = product.domain
        const productSecret = product.secret

        return await this.absensiApiService.getAllReservasi(productDomain, payload, productSecret)
    }
}
