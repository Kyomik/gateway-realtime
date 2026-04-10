import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientEntity } from '../../commons/entities/client.entity';
import { ClientService } from './client.service';
import { SecretEntity } from '../../commons/entities/secret.entity';
import { RoleTransaksiEntity } from 'src/commons/entities/role_transaksi.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClientEntity, 
      SecretEntity,
      RoleTransaksiEntity
    ])],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
