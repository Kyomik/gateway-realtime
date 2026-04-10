import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ClientEntity } from './client.entity';

@Entity('secret')
export class SecretEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  key_service: string;

  @Column({ type: 'varchar', length: 150 })
  key_device: string;

  @ManyToOne(() => ClientEntity, (client) => client.secrets)
  @JoinColumn({ name: 'id_client' })
  id_client: ClientEntity;
}
