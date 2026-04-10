import { Injectable } from '@nestjs/common';
import { NotificationChannel } from '../enums/notification-chanel.enum';
import { MailChannel } from '../chanels/mail.chanel';
import { WhatsappChannel } from '../chanels/whatsapp.chanel';
import { IChannel } from '../interfaces/notification-chanel.interface';
import { BaseNotificationDto } from '../dto/base-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationTemplateEntity } from 'src/commons/entities/notification_templates.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  private readonly channelMap: Record<NotificationChannel, IChannel>;

  constructor(
    @InjectRepository(NotificationTemplateEntity)
    private readonly templateRepo: Repository<NotificationTemplateEntity>,
    private readonly mailChannel: MailChannel,
    private readonly whatsappChannel: WhatsappChannel
  ) {
    this.channelMap = {
      [NotificationChannel.MAIL]: this.mailChannel,
      [NotificationChannel.WHATSAPP]: this.whatsappChannel,
    };
  }

  async send(dto: BaseNotificationDto, clientId: string): Promise<void> {
    const template = await this.templateRepo.findOne({
      where: { 
        client: { 
          client_id: clientId // Ini akan merujuk ke kolom 'client_id' di database
        },
        event_name: dto.event 
      },
      relations: ['contents'],
    });

    if (!template || template.contents.length === 0) {
      console.warn(`Template atau isi konten tidak ditemukan untuk event: ${dto.event}`);
      // Gunakan fallback kodingan di sini
      return;
    }
    
    dto.channels.forEach(channelType => {
      const channel = this.channelMap[channelType];
      const specificContents = template.contents.filter(c => c.channel === channelType);
      
      if (channel && specificContents.length > 0) {
        // Kirim data yang sudah siap ke channel (Fire & Forget)
        channel.send( dto.context, dto.recipients, clientId, specificContents)
          .catch(err => console.error(`[Error] ${channelType} failed:`, err.message));
      }
    });
  }
}