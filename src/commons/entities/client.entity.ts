import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, OneToOne } from 'typeorm';
import { HostClientEntity } from './host_client.entity';
import { DeviceTransaksiEntity } from './device_transaksi.entity';
import { RoleTransaksiEntity } from './role_transaksi.entity';
import { SecretEntity } from './secret.entity';
import { FirebaseConfigEntity } from './firebase_config.entity';
import { SmtpConfigEntity } from './smtp_config.entity';
import { NotificationTemplateEntity } from './notification_templates.entity';

export enum ClientStatus {
  ACTIVE = 'active',
  OFFLINE = 'offline',
}

@Entity('client')
export class ClientEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'client_id', type: 'varchar', length: 100 })
  client_id: string;

  @Column({ type: 'enum', enum: ClientStatus, default: ClientStatus.ACTIVE })
  status: ClientStatus;

  @OneToMany(() => HostClientEntity, (host) => host.id_client)
  hosts: HostClientEntity[];

  @OneToMany(() => SecretEntity, (secret) => secret.id_client)
  secrets: SecretEntity[];

  @OneToMany(() => DeviceTransaksiEntity, (device) => device.id_client)
  devices: DeviceTransaksiEntity[];

  @OneToMany(() => RoleTransaksiEntity, (role) => role.id_client)
  roles: RoleTransaksiEntity[];

  @OneToOne(() => FirebaseConfigEntity, (firebase) => firebase.client)
  firebaseConfig: FirebaseConfigEntity;

  @OneToOne(() => SmtpConfigEntity, (firebase) => firebase.client)
  smtpConfig: SmtpConfigEntity;

  @OneToMany(() => NotificationTemplateEntity, (template) => template.client)
  notificationTemplates: NotificationTemplateEntity[];
}
