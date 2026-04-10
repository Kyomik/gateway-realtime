import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './services/notification.service';
import { MailChannel } from './chanels/mail.chanel';
import { WhatsappChannel } from './chanels/whatsapp.chanel';
import { ThirdServiceModule } from '../third-service/third-service.module';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationTemplateEntity } from 'src/commons/entities/notification_templates.entity';
import { TemplateContentEntity} from 'src/commons/entities/template_contents.entity';
import { NotificationListener } from './services/notification-listener.service';

@Module({
  imports: [
    ThirdServiceModule,
    AuthModule,
    TypeOrmModule.forFeature([
      NotificationTemplateEntity, 
      TemplateContentEntity
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    MailChannel,
    WhatsappChannel,
    NotificationListener
  ],
  exports: [NotificationService],
})
export class NotificationModule {}