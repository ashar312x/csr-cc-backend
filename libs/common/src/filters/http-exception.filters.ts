import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response, Request } from 'express';
// Import your translations dictionary
import { LANGUAGES } from '../language'; 

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        const exceptionResponse: any = exception.getResponse();

        // 1. Get language from header
        const rawLang = request.headers['accept-language'] || 'en';
        const lang = rawLang.split(',')[0].split('-')[0].toLowerCase();

        // 2. Extract the raw message/key
        // NestJS validation errors often return an array of strings in .message
        const rawMessage = Array.isArray(exceptionResponse.message) 
            ? exceptionResponse.message[0] 
            : exceptionResponse.message || exception.message;

        // 3. Translate the message
        const translatedMessage = LANGUAGES[lang]?.[rawMessage] || rawMessage;

        response.status(status).json({
            success: false,
            message: translatedMessage,
            data: null,
            error: LANGUAGES[lang][exceptionResponse.error] || LANGUAGES[lang]['INTERNAL_SERVER_ERROR'],
            timestamp: new Date().toISOString(),
            statusCode: status
        });
    }
}






// import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
// import { Response } from 'express';

// @Catch(HttpException)
// export class HttpExceptionFilter implements ExceptionFilter {
//     catch(exception: HttpException, host: ArgumentsHost) {
//         const ctx = host.switchToHttp();
//         const response = ctx.getResponse<Response>();
//         const status = exception.getStatus();
//         const exceptionResponse: any = exception.getResponse();

//         response.status(status).json({
//             success: false,
//             message: exceptionResponse.message || exception.message,
//             data: null,
//             error: exceptionResponse.error || 'Internal Server Error',
//             timestamp: new Date().toISOString(),
//             statusCode: status
//         });
//     }
// }