import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { ClientModule } from '../client/client.module';
import { JwtAuthStrategy } from './strategies/jwt-auth.strategy';
import { HmacAuthStrategy } from './strategies/hmac-auth.strategy';
import { MockAuthStrategy } from './strategies/mock.strategy';
import { FireBaseAuthStrategy } from './strategies/firebase-auth.strategy';
import { DeviceService } from './services/device.service';
import { BrowserService } from './services/browser.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientEntity } from 'src/commons/entities/client.entity';
import { BlacklistDeviceGetEventEntity } from 'src/commons/entities/blacklist_device_get_event.entity';
import { BlacklistDeviceSendEventEntity } from 'src/commons/entities/blacklist_device_send_evententity';
import { WhitelistRoleGetEventEntity } from 'src/commons/entities/whitelist_role_get_event.entity';
import { WhitelistRoleSendEventEntity } from 'src/commons/entities/whitelist_role_send_event.entity';
import { RoleTransaksiEntity } from 'src/commons/entities/role_transaksi.entity';
import { RefreshTokenService } from './services/refresh-token.service';
import { RefreshTokenEntity } from 'src/commons/entities/refresh_tokens.entity';
import { ThirdServiceModule } from '../third-service/third-service.module';
import { ApiAuthGuard } from './guards/api-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClientEntity, 
      BlacklistDeviceGetEventEntity,
      BlacklistDeviceSendEventEntity,
      WhitelistRoleGetEventEntity,
      WhitelistRoleSendEventEntity,
      RoleTransaksiEntity,
      RefreshTokenEntity,
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '30m' },
      }),
    }),
    ClientModule,
    ThirdServiceModule
  ],
  exports: [
    AuthService, 
    DeviceService, 
    BrowserService,
    ApiAuthGuard,
    JwtModule
  ],
  providers: [
    AuthService, 
    DeviceService,
    BrowserService,
    RefreshTokenService,
    ConfigService, 
    JwtAuthStrategy, 
    HmacAuthStrategy, 
    MockAuthStrategy,
    FireBaseAuthStrategy,
    ApiAuthGuard
  ],
  controllers: [AuthController],
})
export class AuthModule {}
