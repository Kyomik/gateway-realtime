import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmtpConfigEntity } from '../../../commons/entities/smtp_config.entity';
import { IEmailProvider } from '../interfaces/email.provider.interface';
import { SmtpEmailProvider } from '../providers/email/smtp.provider';
import { BaseProviderFactory } from '../providers/base.provider';


@Injectable()
export class EmailProviderFactory extends BaseProviderFactory<IEmailProvider> {
  constructor(
    @InjectRepository(SmtpConfigEntity)
    private readonly smtpConfigRepo: Repository<SmtpConfigEntity>,
  ) {
    super();
  }

  async create(clientId: number, provider?: string): Promise<IEmailProvider> {
    const providerType = provider || this.configService.get('DEFAULT_EMAIL_PROVIDER') || 'smtp';

    switch (providerType) {
      case 'smtp': {
        let config: SmtpConfigEntity | null = null;
        
        try {
          config = await this.smtpConfigRepo.findOne({ where: { clientId } });
        } catch (error) {
          // log error jika perlu
        }

        // Jika tidak ada konfigurasi, gunakan nilai default dari env
        const address = config?.address || this.configService.get('DEFAULT_MAIL_ADDRESS');
        const host = config?.smtpHost || this.configService.get('DEFAULT_MAIL_HOST');
        const port = config?.smtpPort || this.configService.get('DEFAULT_PORT_MAIL');
        const user = config?.smtpUsername || this.configService.get('DEFAULT_MAIL_ADDRESS');
        const pass = config?.smtpPassword || this.configService.get('DEFAULT_MAIL_PASSWORD');
        const secure = config?.encryption === 'ssl' || this.configService.get('DEFAULT_MAIL_SECURE') === 'true';

        // Pastikan semua nilai ada
        if (!address || !host || !port || !user || !pass) {
          throw new Error(`SMTP configuration missing for client ${clientId} and no default values available`);
        }
        
        return new SmtpEmailProvider({
          address,
          host,
          port,
          user,
          pass,
          secure,
        });
      }
      // case 'sendgrid': ...
      default:
        throw new Error(`Unsupported email provider: ${providerType}`);
    }
  }
}