import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ClientEntity } from './client.entity';

@Entity('smtp_config')
export class SmtpConfigEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'client_id', type: 'bigint', unsigned: true })
  clientId: number;

  @OneToOne(() => ClientEntity, (client) => client.smtpConfig, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'client_id' })
  client: ClientEntity;

  @Column({ name: 'address' })
  address: string;

  @Column({ name: 'smtp_host' })
  smtpHost: string;

  @Column({ name: 'smtp_port', type: 'int' })
  smtpPort: number;

  @Column({ name: 'smtp_username' })
  smtpUsername: string;

  @Column({ name: 'smtp_password' })
  smtpPassword: string;

  @Column({
    type: 'enum',
    enum: ['ssl', 'tls', 'none'],
    default: 'tls',
  })
  encryption: 'ssl' | 'tls' | 'none';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}