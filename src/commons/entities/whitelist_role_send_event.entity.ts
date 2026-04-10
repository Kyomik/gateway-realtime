import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RoleTransaksiEntity } from './role_transaksi.entity';
import { EventTransaksiEntity } from './event_transaksi.entity';

@Entity('whitelist_role_send_event')
export class WhitelistRoleSendEventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RoleTransaksiEntity, (role) => role.whitelistSendEvent)
  @JoinColumn({ name: 'id_role' })
  role: RoleTransaksiEntity;

  @ManyToOne(() => EventTransaksiEntity)
  @JoinColumn({ name: 'id_event' })
  event_transaksi: EventTransaksiEntity;
}
