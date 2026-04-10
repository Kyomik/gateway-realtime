import { ClientEntity } from '../../commons/entities/client.entity';
import { HostClientEntity } from '../../commons/entities/host_client.entity';
import { SecretEntity } from '../../commons/entities/secret.entity';
import { JenisDeviceEntity } from '../../commons/entities/jenis_device.entity';
import { EventTransaksiEntity } from '../../commons/entities/event_transaksi.entity';
import { DeviceTransaksiEntity } from '../../commons/entities/device_transaksi.entity';
import { BlacklistDeviceSendEventEntity } from '../../commons/entities/blacklist_device_send_evententity';
import { BlacklistDeviceGetEventEntity } from '../../commons/entities/blacklist_device_get_event.entity';
import { RoleTransaksiEntity } from '../../commons/entities/role_transaksi.entity';
import { WhitelistRoleSendEventEntity } from '../../commons/entities/whitelist_role_send_event.entity';
import { WhitelistRoleGetEventEntity } from '../../commons/entities/whitelist_role_get_event.entity';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ProductEntity } from 'src/commons/entities/product.entity';
import { EnduserEntity } from 'src/commons/entities/enduser.entity';
import { RefreshTokenEntity } from 'src/commons/entities/refresh_tokens.entity';
import { FirebaseConfigEntity } from 'src/commons/entities/firebase_config.entity';
import { SmtpConfigEntity } from 'src/commons/entities/smtp_config.entity';
import { NotificationTemplateEntity } from 'src/commons/entities/notification_templates.entity';
import { TemplateContentEntity } from 'src/commons/entities/template_contents.entity';

export const ormConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'mysql',
    host: config.get<string>('DB_HOST'),
    port: config.get<number>('DB_PORT'),
    username: config.get<string>('DB_USER'),
    password: config.get<string>('DB_PASS'),
    database: config.get<string>('DB_NAME'),
    synchronize: false,
    migrationsRun: true,
    logging: false,
    migrations: ['dist/migrations/*.js'],
    entities: [
      ClientEntity,
      HostClientEntity,
      SecretEntity,
      JenisDeviceEntity,
      EventTransaksiEntity,
      DeviceTransaksiEntity,
      BlacklistDeviceSendEventEntity,
      BlacklistDeviceGetEventEntity,
      RoleTransaksiEntity,
      WhitelistRoleSendEventEntity,
      WhitelistRoleGetEventEntity,
      ProductEntity,
      EnduserEntity,
      RefreshTokenEntity,
      FirebaseConfigEntity,
      SmtpConfigEntity,
      NotificationTemplateEntity,
      TemplateContentEntity
    ],
  }),
};