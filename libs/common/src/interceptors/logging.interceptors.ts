import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private logger: winston.Logger;

    // private maskSensitiveData(data: any) {
    //     if (!data) return data;
    //     const masked = { ...data };
    //     if (masked.password) masked.password = '***';
    //     if (masked.cardNumber) masked.cardNumber = '***';

    //     if (masked?.result?.password) masked.result.password = '***';
    //     return masked;
    // }

    private maskSensitiveData(data: any) {
        if (!data) return data;

        // 1. Create a deep copy so we don't touch the original response reference
        // You can use JSON.parse(JSON.stringify(data)) for a quick deep copy
        const masked = JSON.parse(JSON.stringify(data));

        const sensitiveFields = ['password', 'cardNumber', 'token', 'secret'];

        // 2. Recursive function to find and mask keys anywhere in the object
        const mask = (obj: any) => {
            for (const key in obj) {
                if (sensitiveFields.includes(key)) {
                    obj[key] = '***';
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    mask(obj[key]);
                }
            }
        };

        mask(masked);
        return masked;
    }

    constructor() {
        this.logger = winston.createLogger({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                // Create a new log file every day
                new winston.transports.DailyRotateFile({
                    filename: 'logs/application-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    maxFiles: '14d', // Keep logs for 14 days
                }),
                new winston.transports.Console(),
            ],
        });
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const { method, url, body, query, headers } = request;
        const now = Date.now();

        return next.handle().pipe(
            tap({
                next: (data) => {
                    this.logRequest(method, url, body, query, data, now, null);
                },
                error: (err) => {
                    this.logRequest(method, url, body, query, null, now, err);
                },
            }),
        );
    }

    private logRequest(method: string, url: string, reqData: any, query: any, resData: any, startTime: number, error: any) {
        const duration = `${Date.now() - startTime}ms`;
        const maskedReqData = this.maskSensitiveData(reqData);
        const maskedResData = this.maskSensitiveData(resData);
        const logEntry = {
            timestamp: new Date().toISOString(),
            method,
            url,
            metadata: {
                query,
                duration,
                userAgent: 'system-logger',
            },
            request: maskedReqData,
            response: maskedResData || null,
            error: error ? { message: error.message, stack: error.stack } : null,
        };

        if (error) {
            this.logger.error('Request Failed', logEntry);
        } else {
            this.logger.info('Request Success', logEntry);
        }
    }
}