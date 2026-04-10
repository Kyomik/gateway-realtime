import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientEntity } from 'src/commons/entities/client.entity';
import { WhitelistRoleGetEventEntity } from 'src/commons/entities/whitelist_role_get_event.entity';
import { WhitelistRoleSendEventEntity } from 'src/commons/entities/whitelist_role_send_event.entity';
import { RoleTransaksiEntity } from 'src/commons/entities/role_transaksi.entity';
import { Repository } from 'typeorm';
import { AuthBase, AuthBrowser, AuthWhitelist } from '../types/auth-browser.type';
import { AppWsException } from '../../../commons/exceptions/ws-error.exception';
import { IEnduserStrategy } from '../interfaces/enduser-strategy.interface';

@Injectable()
export class BrowserService implements IEnduserStrategy<AuthBrowser>{
  constructor(
    @InjectRepository(ClientEntity)
    private readonly clientRepo: Repository<ClientEntity>,

    @InjectRepository(WhitelistRoleSendEventEntity)
    private readonly whitelistSendRepo: Repository<WhitelistRoleSendEventEntity>,

    @InjectRepository(WhitelistRoleGetEventEntity)
    private readonly whitelistGetRepo: Repository<WhitelistRoleGetEventEntity>,
    
    @InjectRepository(RoleTransaksiEntity)
    private readonly roleRepo: Repository<RoleTransaksiEntity>
  ) {}

  async getAuth(clientId: string, role: string): Promise<AuthBrowser> {
    const base = await this.getBaseRole(clientId, role);

    if (!base) {
      throw new AppWsException(
        'UNAUTHENTICATED',
        'Penyusup lu?',
      );
    }

    const whitelist = await this.getWhitelist(base.roleId);
    return {
      id_enduser: base.id_enduser,
      clientId: base.clientId,
      role: base.role,
      roleId: base.roleId,
      product: base.product,
      products: base.products,
      ...whitelist,
    };
  }

  private async getBaseRole(
    clientId: string,
    role: string,
  ): Promise<AuthBase | undefined> {
    
    const rows = await this.clientRepo
      .createQueryBuilder('client')
      .innerJoin('client.roles', 'role')
      .innerJoin('role.enduser', 'enduser')
      .innerJoin('role.product', 'product_one')
      .innerJoin('client.hosts', 'h')
      .innerJoin('h.product', 'p')
      .innerJoin('client.secrets', 's')
      .select([
        'client.client_id AS clientId',
        'role.id AS roleId',
        'role.label_role AS role',
        'enduser.id AS id_enduser',
        'p.nama_product AS nama_product',
        'product_one.nama_product AS role_product',
        'h.domain AS domain',
        'h.api_secret AS secret',
      ])
      .where('client.client_id = :clientId', { clientId })
      .andWhere('role.label_role = :role', { role })
      .getRawMany();

    if (!rows.length) return undefined;

    return this.mapAuth(rows);
  }

  private mapAuth(rows: any[]): AuthBase {
    const first = rows[0];
    const products: Record<string, { domain: string; secret: string }> =
      Object.create(null);

    for (const r of rows) {
      products[r.nama_product] = {
        domain: r.domain,
        secret: r.secret,
      };
    }

    return {
      id_enduser: Number(first.id_enduser),
      product: first.role_product,
      roleId: first.roleId,
      clientId: first.clientId,
      role: first.role,
      products,
    };
  }

  private async getWhitelist(roleId: string): Promise<AuthWhitelist> {
    const [send, get] = await Promise.all([
      this.whitelistSendRepo
        .createQueryBuilder('w')
        .innerJoin('w.event_transaksi', 'm')
        .select('m.id', 'id')
        .where('w.id_role = :roleId', { roleId })
        .getRawMany(),

      this.whitelistGetRepo
        .createQueryBuilder('w')
        .innerJoin('w.event_transaksi', 'm')
        .select('m.id', 'id')
        .where('w.id_role = :roleId', { roleId })
        .getRawMany(),
    ]);

    return {
      whiteListSend: [...new Set(send.map(s => s.id))],
      whiteListGet: [...new Set(get.map(g => g.id))],
    };
  }

  async getRoles(client: ClientEntity): Promise<string[]> {
    const roles = await this.roleRepo.find({
      where: { id_client: client },
    });
    return roles.map(r => r.label_role);
  }

  async getIdsByTenantAndProduct(
    clientId: string,
    product: string
  ): Promise<number[]> {
    
    const qb = this.clientRepo
      .createQueryBuilder('client')
      .innerJoin('client.roles', 'r')
      .innerJoin('r.product', 'product')
      .innerJoin('r.enduser', 'enduser')
      .select([
        'enduser.id AS id',
      ])
      .where('client.client_id = :clientId', { clientId })
      .andWhere('product.nama_product = :product', { product })
    const rows = await qb.getRawMany();

    return rows.map(r => Number(r.id));
  }
}

