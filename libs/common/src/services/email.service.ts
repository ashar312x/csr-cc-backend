import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: any;

  constructor(private configService: ConfigService) {
    // Initialize nodemailer
    try {
      const nodemailer = require('nodemailer');

      const smtpHost = this.configService.get('SMTP_HOST');
      const smtpPort = this.configService.get('SMTP_PORT');
      const smtpUser = this.configService.get('SMTP_USER');
      const smtpPass = this.configService.get('SMTP_PASS');

      this.logger.log(
        `Initializing email service with host: ${smtpHost}:${smtpPort}`,
      );

      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: parseInt(smtpPort) === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      // Verify connection
      this.transporter.verify((error: any) => {
        if (error) {
          this.logger.error(`SMTP connection failed: ${error.message}`);
        } else {
          this.logger.log('SMTP server is ready to send emails');
        }
      });
    } catch (error) {
      this.logger.error(`Failed to initialize email service: ${error.message}`);
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.logger.warn('Email transporter not initialized');
        return false;
      }

      this.logger.log(
        `Attempting to send email to ${to} with subject: ${subject}`,
      );

      const mailOptions = {
        from: this.configService.get('SMTP_FROM'),
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Email sent successfully to ${to}. MessageId: ${info.messageId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      this.logger.error(`Error details: ${JSON.stringify(error)}`);
      return false;
    }
  }

  async sendBulkEmails(
    recipients: { email: string; subject: string; html: string }[],
  ): Promise<number> {
    let successCount = 0;
    for (const recipient of recipients) {
      const success = await this.sendEmail(
        recipient.email,
        recipient.subject,
        recipient.html,
      );
      if (success) successCount++;
    }
    return successCount;
  }
}
