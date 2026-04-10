import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { NotificationService } from "./notification.service";
import { ScanDto } from "src/commons/dtos/scan.dto";
import { NotificationEvent } from "../enums/notification-event.enum";
import { NotificationChannel } from "../enums/notification-chanel.enum";
import { BaseNotificationDto } from "../dto/base-notification.dto";
import { ReservasiDto } from "src/commons/dtos/reservasi.dto";

@Injectable()
export class NotificationListener {
    constructor(private readonly notificationService: NotificationService) {}

    @OnEvent('absensi.scan.login')
    async handleRfidLogin(payload: { clientId: string; data: ScanDto }) {
        const { clientId, data } = payload;

        await this.notificationService.send({
            event: NotificationEvent.LOGIN_ABSENSI,
            channels: [NotificationChannel.MAIL],
            recipients: [{
                nama: data.nama,
                email: data.email,
                metadata: data.metadata
            }],
            context: {
                uid: data.uid,
                status: data.status,
                keterangan: data.keterangan
            }
        }, clientId);
    }

    @OnEvent('absensi.reservasi.cancel')
    async handleReservasiCancel(payload: { clientId: string; data: ReservasiDto }) {
        const { clientId, data } = payload;

        await this.notificationService.send({
            event: NotificationEvent.CANCEL_RESERVASI,
            channels: [NotificationChannel.MAIL],
            recipients: [{
                nama: data.nama,
                email: data.email,
                metadata: data.metadata
            }],
            context: {
                keterangan: data.keterangan,
                waktu_mulai: data.waktu_mulai,
                waktu_akhir: data.waktu_akhir,
            }
        }, clientId);
    }

    @OnEvent('notification.requested')
    async handleNotificationRequest(payload: { clientId: string, dto: BaseNotificationDto }) {
        await this.notificationService.send(payload.dto, payload.clientId);
    }
}