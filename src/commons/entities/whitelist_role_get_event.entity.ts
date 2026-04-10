import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RoleTransaksiEntity } from './role_transaksi.entity';
import { EventTransaksiEntity } from './event_transaksi.entity';

@Entity('whitelist_role_get_event')
export class WhitelistRoleGetEventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => RoleTransaksiEntity, (role) => role.whitelistGetEvent)
  @JoinColumn({ name: 'id_role' })
  role: RoleTransaksiEntity;

  @ManyToOne(() => EventTransaksiEntity)
  @JoinColumn({ name: 'id_event' })
  event_transaksi: EventTransaksiEntity;
}
