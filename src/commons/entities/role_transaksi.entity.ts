import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';
import { ClientEntity } from './client.entity';
import { WhitelistRoleSendEventEntity } from './whitelist_role_send_event.entity';
import { WhitelistRoleGetEventEntity } from './whitelist_role_get_event.entity';
import { ProductEntity } from './product.entity';
import { EnduserEntity } from './enduser.entity';

@Entity('role_transaksi')
export class RoleTransaksiEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 15 })
  label_role: string;

  @ManyToOne(() => ClientEntity, (client) => client.roles)
  @JoinColumn({ name: 'id_client' })
  id_client: ClientEntity;

  @OneToMany(() => WhitelistRoleSendEventEntity, (w) => w.role)
  whitelistSendEvent: WhitelistRoleSendEventEntity[];

  @OneToMany(() => WhitelistRoleGetEventEntity, (w) => w.role)
  whitelistGetEvent: WhitelistRoleGetEventEntity[];

  @ManyToOne(() => ProductEntity, p => p.jenisDevice)
  @JoinColumn({ name: 'id_product' })
  product: ProductEntity;

  @ManyToOne(() => EnduserEntity, (enduser) => enduser.id)
  @JoinColumn({ name: 'id_enduser' })
  enduser: EnduserEntity;
}
