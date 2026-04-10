import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientEntity, ClientStatus } from '../../commons/entities/client.entity';
import { SecretEntity } from '../../commons/entities/secret.entity';
import { RoleTransaksiEntity } from 'src/commons/entities/role_transaksi.entity';
import { ExactResult } from './types/client-result'
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(ClientEntity)
    private readonly clientRepo: Repository<ClientEntity>,

    @InjectRepository(SecretEntity)
    private readonly secretRepo: Repository<SecretEntity>,

    @InjectRepository(RoleTransaksiEntity)
    private readonly roleRepo: Repository<RoleTransaksiEntity>,

    private configService: ConfigService,
  ) {}

  async findByClientId(clientId: string): Promise<ClientEntity | null> {
    return this.clientRepo.findOne({ where: { client_id: clientId } });
  }

  async exists(clientId: string, secretKey: string, role: string): Promise<ExactResult> {
    const client = await this.clientRepo.findOne({
      where: { 
        client_id: clientId, 
        status: ClientStatus.ACTIVE
      }
    });

    if (!client) return { client: undefined, secretValid: false, roleValid: false };

    const secret = await this.secretRepo.findOne({
      where: { id_client: client },
      order: { id: 'DESC' }
    });

    if (!secret || secret.key_service !== secretKey)
      return { client, secretValid: false, roleValid: false };

    const roles = await this.roleRepo.find({ where: { id_client: client } });
    const roleValid = roles.some(r => r.label_role === role);

    return { client, secretValid: true, roleValid };
  }
}
