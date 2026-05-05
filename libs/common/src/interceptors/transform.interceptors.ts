import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/response.interface';
import { LANGUAGES } from '../language';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();

    // 1. Get language from header (e.g., "en-US,en;q=0.9" -> "en")
    const rawLang = request.headers['accept-language'] || 'en';
    const lang = rawLang.split(',')[0].split('-')[0].toLowerCase();
    return next.handle().pipe(
      map((data) => {
        // 2. Determine the raw message (could be a key like 'AUTH_SUCCESS')
        const rawMessage = data?.message || 'REQUEST_SUCCESS';
        // 3. Try to translate. If key doesn't exist, fallback to the raw message.
        const translatedMessage = LANGUAGES[lang]?.[rawMessage] || rawMessage;
        return {
          success: true,
          message: translatedMessage,
          data: data?.result || data,
          timestamp: new Date().toISOString(),
          statusCode: data?.statusCode || 200,
        };
      }),
    );
  }
}

// import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';
// import { ApiResponse } from '../interfaces/response.interface';

// @Injectable()
// export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
//     intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
//         return next.handle().pipe(
//             map((data) => ({
//                 success: true,
//                 message: data?.message || 'Request successful',
//                 data: data?.result || data, // Extract result if nested, else use raw data
//                 timestamp: new Date().toISOString(),
//                 statusCode: data.statusCode || 200
//             })),
//         );
//     }
// }
