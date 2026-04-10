import { PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Entity } from "typeorm";
import { ClientEntity } from "./client.entity";

@Entity('refresh_tokens')
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string; // hash atau token itu sendiri

  @ManyToOne(() => ClientEntity)
  client: ClientEntity;

  @Column()
  role: string; // atau relasi ke role

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  revoked: boolean;

  @CreateDateColumn()
  createdAt: Date;
}