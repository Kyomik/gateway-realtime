import { Injectable } from '@nestjs/common';
import { IChannel } from '../interfaces/notification-chanel.interface';
import { ProviderFactory } from '../../third-service/services/provider-factory.service';
import { IEmailProvider } from '../../third-service/interfaces/email.provider.interface';
import { StudentDto } from 'src/commons/dtos/student.dto';
import { ReservasiContext } from '../types/reservasi-context.type';
import { TemplateContentEntity } from 'src/commons/entities/template_contents.entity';
import { NotificationParser } from '../helpers/parser.helper';

@Injectable()
export class MailChannel implements IChannel {
  constructor(
    private readonly providerFactory: ProviderFactory,
  ) {}

  async send(
    context: ReservasiContext,
    recipients: StudentDto[],
    clientId: string,
    contents: TemplateContentEntity[]
  ): Promise<void> {

    const mailer = await this.providerFactory.getProvider<IEmailProvider>('email', clientId);

    const tasks = recipients.map(async r => {
      try {
        const subjectContents = contents.filter(c => c.key_name === 'subject');
        const bodyContents = contents.filter(c => c.key_name === 'body');

        const subject = NotificationParser.parse(subjectContents, context, r.nama, r.metadata);

        const parsedBody = NotificationParser.parse(bodyContents, context, r.nama, r.metadata);

        const plainText = parsedBody
          .replace(/<\/p>|<br\s*\/?>|<\/div>/gi, '\n') // Ganti penutup P/Div/BR jadi enter
          .replace(/<[^>]*>?/gm, '')                    // Hapus sisa tag lainnya
          .replace(/\n\s*\n/g, '\n\n')                 // Rapikan enter yang berlebihan
          .trim();
       
        return mailer.sendMail({ 
          to: r.email!, 
          subject, 
          html: parsedBody,
          text: plainText
        });

      } catch (err) {
        console.error(`[SMTP ERROR] Ke: ${r.email} | Pesan: ${err.message}`);
      }
    });

    Promise.all(tasks).catch(err => {
      console.error('Fatal Error in Background Mail Process', err);
    });
  }
}