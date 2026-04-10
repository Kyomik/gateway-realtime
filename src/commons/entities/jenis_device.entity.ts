import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { EventTransaksiEntity } from './event_transaksi.entity';
import { DeviceTransaksiEntity } from './device_transaksi.entity';
import { ProductEntity } from './product.entity';

export enum DeviceType {
  LED = 'led',
  CONTROLLER = 'controller',
}

@Entity('jenis_device')
export class JenisDeviceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: DeviceType })
  type: DeviceType;

  @OneToMany(() => EventTransaksiEntity, (event) => event.id_jenis_device)
  events: EventTransaksiEntity[];

  @OneToMany(() => DeviceTransaksiEntity, (device) => device.id_jenis_device)
  devices: DeviceTransaksiEntity[];

  @ManyToOne(() => ProductEntity, p => p.jenisDevice)
  @JoinColumn({ name: 'id_product' })
  product: ProductEntity;
}