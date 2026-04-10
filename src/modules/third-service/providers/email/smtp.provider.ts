import * as nodemailer from 'nodemailer';
import { IEmailProvider } from '../../interfaces/email.provider.interface';

export class SmtpEmailProvider implements IEmailProvider {
  private transporter: nodemailer.Transporter;
  private fromAddress: string;

  constructor(config: {
    address: string;
    host: string;
    port: number;
    user: string;
    pass: string;
    secure?: boolean;
  }) {
    const { address, host, port, user, pass, secure } = config;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: secure ?? port === 465,
      auth: { user, pass },
      pool: true, 
    });

    this.transporter.on('error', (err) => {
      console.error('SMTP Transporter Error:', err.message);
    });

    this.fromAddress = address;
  }

  async sendMail(options: { 
    to: string; 
    subject: string; 
    html: string; 
    text: string;
    from?: string; 
  }): Promise<void> {
    try {
      const { to, subject, html, text, from } = options;
      await this.transporter.sendMail({
        from: from || this.fromAddress,
        to,
        subject,
        text,
        html,
      });
    } catch (err) {
      console.error(`[Nodemailer Internal Error] ${err.message}`);
    }
  }
}