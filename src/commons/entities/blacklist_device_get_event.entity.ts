import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { DeviceTransaksiEntity } from './device_transaksi.entity';
import { EventTransaksiEntity } from './event_transaksi.entity';

@Entity('blacklist_device_get_event')
export class BlacklistDeviceGetEventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DeviceTransaksiEntity)
  @JoinColumn({ name: 'id_device_transaksi' })
  id_device_transaksi: DeviceTransaksiEntity;

  @ManyToOne(() => EventTransaksiEntity)
  @JoinColumn({ name: 'id_event' })
  event_transaksi: EventTransaksiEntity;
}
