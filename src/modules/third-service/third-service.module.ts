// third-service.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmtpConfigEntity } from 'src/commons/entities/smtp_config.entity';
import { FirebaseConfigEntity } from 'src/commons/entities/firebase_config.entity';
import { EmailProviderFactory } from './services/email-provider.factory';
import { AuthProviderFactory } from './services/auth-provider.factory';
import { ProviderFactory } from './services/provider-factory.service';
import { ClientModule } from '../client/client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SmtpConfigEntity, FirebaseConfigEntity]),
    ClientModule
  ],
  providers: [
    EmailProviderFactory,
    AuthProviderFactory,
    ProviderFactory,
  ],
  exports: [ProviderFactory],
})
export class ThirdServiceModule {}