import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ClientEntity } from './client.entity';
import { ProductEntity } from './product.entity';

@Entity('host_client')
export class HostClientEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  domain: string;

  @Column({ type: 'varchar', length: 100 })
  api_secret: string;

  @ManyToOne(() => ClientEntity, (client) => client.hosts)
  @JoinColumn({ name: 'id_client' })
  id_client: ClientEntity;

  @ManyToOne(() => ProductEntity, (product) => product.id)
  @JoinColumn({ name: 'id_product' }) // gunakan kolom berbeda
  product: ProductEntity;
}