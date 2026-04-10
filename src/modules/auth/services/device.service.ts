import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlacklistDeviceGetEventEntity } from 'src/commons/entities/blacklist_device_get_event.entity';
import { BlacklistDeviceSendEventEntity
  
 } from 'src/commons/entities/blacklist_device_send_evententity';
import { ClientEntity } from 'src/commons/entities/client.entity';
import { Repository } from 'typeorm';
import { AuthBase, AuthBlacklist, AuthDevice, DeviceInfo} from 'src/modules/auth/types/auth-device.type';
import { AppWsException } from '../../../commons/exceptions/ws-error.exception';
import { IEnduserStrategy } from '../interfaces/enduser-strategy.interface';

@Injectable()
export class DeviceService implements IEnduserStrategy<AuthBase> {
  constructor(
    @InjectRepository(ClientEntity)
    private readonly clientRepo: Repository<ClientEntity>,

    @InjectRepository(BlacklistDeviceGetEventEntity)
    private readonly blacklistGetRepo: Repository<BlacklistDeviceGetEventEntity>,

    @InjectRepository(BlacklistDeviceSendEventEntity
      
    )
    private readonly blacklistSendRepo: Repository<BlacklistDeviceSendEventEntity
    >,
  ){}

  async getAuth(clientId: string, deviceId: string): Promise<AuthDevice> {
    const base = await this.getDevice(clientId, deviceId);
    if (!base) {
      throw new AppWsException(
        'UNAUTHENTICATED',
        'Penyusup lu?',
      );
    }

    const blacklist = await this.getBlacklist(base.id_device)
    
    return {
      id_enduser: base.id_enduser,
      product: base.product,
      id_device: base.id_device,
      key_device: base.key_device,
      clientId: base.clientId,
      deviceId: base.deviceId,
      products: base.products,
      ...blacklist
    }
  }

  async getBlacklist(id_device: string): Promise<AuthBlacklist>{
    const [send, get] = await Promise.all([
      this.blacklistSendRepo
        .createQueryBuilder('b')
        .innerJoin('b.event_transaksi', 'm')
        .select('m.id', 'id')
        .where('b.id_device_transaksi = :id_device', { id_device })
        .getRawMany(),

      this.blacklistGetRepo
        .createQueryBuilder('b')
        .innerJoin('b.event_transaksi', 'm')
        .select('m.id', 'id')
        .where('b.id_device_transaksi = :id_device', { id_device })
        .getRawMany()
    ]);

    return {
      blackListSend: [...new Set(send.map(s => s.id))],
      blackListGet: [...new Set(get.map(g => g.id))],
    };
  }

  async getDevice(
    clientId: string,
    deviceId: string
  ): Promise<AuthBase | undefined> {

    const rows = await this.clientRepo
      .createQueryBuilder('client')
      .innerJoin('client.devices', 'd')
      .innerJoin('d.enduser', 'enduser')
      .innerJoin('d.id_jenis_device', 'j')
      .innerJoin('j.product', 'product_one')
      .innerJoin('client.hosts', 'h')
      .innerJoin('h.product', 'p')
      .innerJoin('client.secrets', 's')
      .select([
        'client.client_id AS clientId',
        'd.id AS id_device',
        'd.device_id AS deviceId',
        'enduser.id AS id_enduser',
        's.key_device AS keyDevice',
        'p.nama_product AS nama_product',
        'product_one.nama_product AS device_product',
        'h.domain AS domain',
        'h.api_secret AS secret',
      ])
      .where('client.client_id = :clientId', { clientId })
      .andWhere('d.device_id = :deviceId', { deviceId })
      .andWhere('d.status = :status', { status: 'active' })
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
      product: first.device_product,
      id_device: first.id_device,
      clientId: first.clientId,
      deviceId: first.deviceId,
      key_device: first.keyDevice,
      products,
    };
  }
  
  async getDevicesWithInfoByTenant(
    clientId: string,
    product?: string,
  ): Promise<DeviceInfo[]> {

    const qb = this.clientRepo
      .createQueryBuilder('client')
      .innerJoin('client.devices', 'd')
      .innerJoin('d.id_jenis_device', 'j')
      .innerJoin('j.product', 'product')
      .select([
        'd.id AS id',
        'd.device_id AS deviceId',
        'product.nama_product AS product',
      ])
      .where('client.client_id = :clientId', { clientId })
      .andWhere('d.status = :status', { status: 'active' });

    if (product) {
      qb.andWhere('product.nama_product = :product', { product });
    }

    const rows = await qb.getRawMany();

    return rows.map(r => ({
      id: Number(r.id),
      deviceId: r.deviceId,
      product: r.product,
    }));
  }

  async getIdsByTenantAndProduct(
    clientId: string,
    product: string
  ): Promise<number[]> {
    
    const qb = this.clientRepo
      .createQueryBuilder('client')
      .innerJoin('client.devices', 'd')
      .innerJoin('d.id_jenis_device', 'j')
      .innerJoin('j.product', 'product')
      .innerJoin('d.enduser', 'enduser')
      .select([
        'enduser.id AS id',
      ])
      .where('client.client_id = :clientId', { clientId })
      .andWhere('product.nama_product = :product', { product })
      .andWhere('d.status = :status', { status: 'active' });
    const rows = await qb.getRawMany();
    return rows.map(r => Number(r.id));
  }
}
