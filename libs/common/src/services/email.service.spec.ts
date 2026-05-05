import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

beforeEach(() => {
  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
});
// Mock nodemailer
const sendMailMock = jest.fn();
const verifyMock = jest.fn((cb) => cb(null));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: sendMailMock,
    verify: verifyMock,
  })),
}));

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                SMTP_HOST: 'smtp.test.com',
                SMTP_PORT: '587',
                SMTP_USER: 'test@test.com',
                SMTP_PASS: 'password',
                SMTP_FROM: 'no-reply@test.com',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      sendMailMock.mockResolvedValue({ messageId: '123' });

      const result = await service.sendEmail(
        'user@test.com',
        'Test Subject',
        '<p>Hello</p>',
      );

      expect(result).toBe(true);
      expect(sendMailMock).toHaveBeenCalledWith({
        from: 'no-reply@test.com',
        to: 'user@test.com',
        subject: 'Test Subject',
        html: '<p>Hello</p>',
      });
    });

    it('should return false if transporter is not initialized', async () => {
      (service as any).transporter = null;

      const result = await service.sendEmail(
        'user@test.com',
        'Test Subject',
        '<p>Hello</p>',
      );

      expect(result).toBe(false);
    });

    it('should handle sendMail error', async () => {
      sendMailMock.mockRejectedValue(new Error('SMTP error'));

      const result = await service.sendEmail(
        'user@test.com',
        'Test Subject',
        '<p>Hello</p>',
      );

      expect(result).toBe(false);
    });
  });

  describe('sendBulkEmails', () => {
    it('should send multiple emails and return success count', async () => {
      sendMailMock.mockResolvedValue({ messageId: '123' });

      const recipients = [
        {
          email: 'user1@test.com',
          subject: 'Hello 1',
          html: '<p>Hi 1</p>',
        },
        {
          email: 'user2@test.com',
          subject: 'Hello 2',
          html: '<p>Hi 2</p>',
        },
      ];

      const result = await service.sendBulkEmails(recipients);

      expect(result).toBe(2);
      expect(sendMailMock).toHaveBeenCalledTimes(2);
    });

    it('should count only successful emails', async () => {
      sendMailMock
        .mockResolvedValueOnce({ messageId: '123' })
        .mockRejectedValueOnce(new Error('Fail'));

      const recipients = [
        {
          email: 'user1@test.com',
          subject: 'Hello 1',
          html: '<p>Hi 1</p>',
        },
        {
          email: 'user2@test.com',
          subject: 'Hello 2',
          html: '<p>Hi 2</p>',
        },
      ];

      const result = await service.sendBulkEmails(recipients);

      expect(result).toBe(1);
    });
  });
});
