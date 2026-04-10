// import * as sgMail from '@sendgrid/mail';
import { IEmailProvider } from '../../interfaces/email.provider.interface';
import { ConfigService } from '@nestjs/config';

export class SendGridEmailProvider implements IEmailProvider {
  constructor(private clientId: string, private configService: ConfigService) {
    // const apiKey = this.client.sendgridApiKey || this.configService.get('SENDGRID_API_KEY');
    // if (!apiKey) {
    //   throw new Error('SendGrid API key missing');
    // }
    // sgMail.setApiKey(apiKey);
  }

  sendMail(options: { to: string; subject: string; html: string; text: string; from?: string }): void {
    // await sgMail.send({
    //   to: options.to,
    //   from: options.from || 'noreply@example.com',
    //   subject: options.subject,
    //   html: options.html,
    // });
  }
}