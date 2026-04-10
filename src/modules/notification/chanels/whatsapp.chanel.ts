import { Injectable } from '@nestjs/common';
import { IChannel } from '../interfaces/notification-chanel.interface';
import { StudentDto } from 'src/commons/dtos/student.dto';
import { TemplateContentEntity } from 'src/commons/entities/template_contents.entity';

@Injectable()
export class WhatsappChannel implements IChannel {
  async send(
    context: any, 
    recipients: StudentDto[], 
    clientId: string,
    contents: TemplateContentEntity[]
  ): Promise<void> {
    
  }

  private formatMessage(context: any): string {
    // Buat pesan sesuai event
    return `Notifikasi: ${JSON.stringify(context)}`;
  }
}