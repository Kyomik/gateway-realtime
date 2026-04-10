import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { JenisDeviceEntity } from './jenis_device.entity';

enum EventTransaksiEnum {
  REGISTER = 'register',
  LOGIN = 'login',
  UPDATE = 'update',
  GET_ALL_RESERVASI = 'get-all-reservasi',
  CANCEL_RESERVASI = 'cancel-reservasi',
  STREAM_IMAGE = 'stream-image',
  CREATE_SESI = 'create-sesi',
  DESTROY_SESI = 'destroy-sesi',
  DESTROY_ALL_SESI = 'destroy-all-sesi',
  SYNC_ALARM = 'sync-alarm',
  SEND_METADATA_AUDIO = 'send-metadata-audio',
  UPLOAD_AUDIO = 'upload-audio',
}

@Entity('event_transaksi')
export class EventTransaksiEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: EventTransaksiEnum })
  event: EventTransaksiEnum;

  @ManyToOne(() => JenisDeviceEntity, (jenis) => jenis.events)
  @JoinColumn({ name: 'id_jenis_device' })
  id_jenis_device: JenisDeviceEntity;
}
