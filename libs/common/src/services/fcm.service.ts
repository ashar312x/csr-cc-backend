import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FcmService {
    private readonly logger = new Logger(FcmService.name);
    private admin: any;

    constructor(private configService: ConfigService) {
        // Initialize Firebase Admin SDK
        // Uncomment when firebase-admin is installed
        /*
        const serviceAccount = this.configService.get('FIREBASE_SERVICE_ACCOUNT');
        if (serviceAccount) {
            this.admin = require('firebase-admin');
            this.admin.initializeApp({
                credential: this.admin.credential.cert(JSON.parse(serviceAccount))
            });
        }
        */
    }

    async sendPushNotification(fcmToken: string, title: string, message: string, data?: any): Promise<boolean> {
        try {
            if (!this.admin) {
                this.logger.warn('Firebase Admin not initialized');
                return false;
            }

            const payload = {
                notification: {
                    title,
                    body: message,
                },
                data: data || {},
                token: fcmToken,
            };

            await this.admin.messaging().send(payload);
            this.logger.log(`Push notification sent to ${fcmToken}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to send push notification: ${error.message}`);
            return false;
        }
    }

    async sendBulkPushNotifications(tokens: string[], title: string, message: string, data?: any): Promise<number> {
        try {
            if (!this.admin || !tokens.length) {
                return 0;
            }

            const payload = {
                notification: {
                    title,
                    body: message,
                },
                data: data || {},
                tokens,
            };

            const response = await this.admin.messaging().sendMulticast(payload);
            this.logger.log(`Sent ${response.successCount} notifications out of ${tokens.length}`);
            return response.successCount;
        } catch (error) {
            this.logger.error(`Failed to send bulk push notifications: ${error.message}`);
            return 0;
        }
    }
}
