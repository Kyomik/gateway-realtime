import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventTransaksiEntity } from 'src/commons/entities/event_transaksi.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            EventTransaksiEntity
        ])],
    providers: [EventService],
    exports: [EventService]
})
export class EventModule {}