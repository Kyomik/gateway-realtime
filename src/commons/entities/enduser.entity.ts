import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum TypeEnduser {
  DEVICE = 'device',
  BROWSER = 'browser',
}

@Entity('enduser')
export class EnduserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: TypeEnduser })
  type: TypeEnduser;
}
