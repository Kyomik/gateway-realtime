import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EventTransaksiEntity } from "src/commons/entities/event_transaksi.entity";
import { Repository } from "typeorm";
import { Events } from "../websocket/types/event.type";

@Injectable()
export class EventService {
    constructor(
        @InjectRepository(EventTransaksiEntity)
        private readonly eventRepo: Repository<EventTransaksiEntity>,
    ) {}
    
    async getByProduct(productName?: string): Promise<Events[]> {
        const qb = this.eventRepo
            .createQueryBuilder('event_transaksi')
            .select([
                'event_transaksi.id AS id',
                'event_transaksi.event AS label',
                'event_transaksi.id_jenis_device AS id_device',
            ])
            .innerJoin('event_transaksi.id_jenis_device', 'jd')
            .innerJoin('jd.product', 'p');

        if (productName) {
            qb.where('p.nama_product = :name', { name: productName });
        }

        return qb.getRawMany();
    }
}