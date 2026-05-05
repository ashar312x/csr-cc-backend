import { Test, TestingModule } from '@nestjs/testing';
import { FcmService } from './fcm.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

beforeEach(() => {
  jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
});
describe('FcmService', () => {
  let service: FcmService;

  const sendMock = jest.fn();
  const sendMulticastMock = jest.fn();

  const mockAdmin = {
    messaging: jest.fn(() => ({
      send: sendMock,
      sendMulticast: sendMulticastMock,
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FcmService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FcmService>(FcmService);

    // Inject mock admin manually (since constructor has it commented)
    (service as any).admin = mockAdmin;

    jest.clearAllMocks();
  });

  describe('sendPushNotification', () => {
    it('should send push notification successfully', async () => {
      sendMock.mockResolvedValue('message-id');

      const result = await service.sendPushNotification(
        'fcm-token',
        'Test Title',
        'Test Message',
        { key: 'value' },
      );

      expect(result).toBe(true);
      expect(sendMock).toHaveBeenCalledWith({
        notification: {
          title: 'Test Title',
          body: 'Test Message',
        },
        data: { key: 'value' },
        token: 'fcm-token',
      });
    });

    it('should return false if admin not initialized', async () => {
      (service as any).admin = null;

      const result = await service.sendPushNotification(
        'fcm-token',
        'Test Title',
        'Test Message',
      );

      expect(result).toBe(false);
    });

    it('should handle error while sending notification', async () => {
      sendMock.mockRejectedValue(new Error('FCM error'));

      const result = await service.sendPushNotification(
        'fcm-token',
        'Test Title',
        'Test Message',
      );

      expect(result).toBe(false);
    });
  });

  describe('sendBulkPushNotifications', () => {
    it('should send bulk notifications successfully', async () => {
      sendMulticastMock.mockResolvedValue({
        successCount: 2,
      });

      const result = await service.sendBulkPushNotifications(
        ['token1', 'token2'],
        'Bulk Title',
        'Bulk Message',
        { key: 'value' },
      );

      expect(result).toBe(2);
      expect(sendMulticastMock).toHaveBeenCalledWith({
        notification: {
          title: 'Bulk Title',
          body: 'Bulk Message',
        },
        data: { key: 'value' },
        tokens: ['token1', 'token2'],
      });
    });

    it('should return 0 if admin not initialized', async () => {
      (service as any).admin = null;

      const result = await service.sendBulkPushNotifications(
        ['token1'],
        'Title',
        'Message',
      );

      expect(result).toBe(0);
    });

    it('should return 0 if tokens array is empty', async () => {
      const result = await service.sendBulkPushNotifications(
        [],
        'Title',
        'Message',
      );

      expect(result).toBe(0);
    });

    it('should handle error in bulk sending', async () => {
      sendMulticastMock.mockRejectedValue(new Error('Bulk error'));

      const result = await service.sendBulkPushNotifications(
        ['token1'],
        'Title',
        'Message',
      );

      expect(result).toBe(0);
    });
  });
});
