import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { JenisDeviceEntity } from './jenis_device.entity';
import { ClientEntity } from './client.entity';
import { EnduserEntity } from './enduser.entity';

export enum DeviceStatus {
  ACTIVE = 'active',
  OFFLINE = 'offline',
}

@Entity('device_transaksi')
export class DeviceTransaksiEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  device_id: string;

  @Column({ type: 'enum', enum: DeviceStatus, default: DeviceStatus.OFFLINE })
  status: DeviceStatus;

  @ManyToOne(() => JenisDeviceEntity, (jenis) => jenis.devices)
  @JoinColumn({ name: 'id_jenis_device' })
  id_jenis_device: JenisDeviceEntity;

  @ManyToOne(() => ClientEntity, (client) => client.devices)
  @JoinColumn({ name: 'id_client' })
  id_client: ClientEntity;

  @ManyToOne(() => EnduserEntity, (enduser) => enduser.id)
  @JoinColumn({ name: 'id_enduser' })
  enduser: EnduserEntity;
}
