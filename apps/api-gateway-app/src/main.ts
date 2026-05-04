import { NestFactory } from '@nestjs/core';
import { AppModule } from './api-gateway-app.module';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { TransformInterceptor, HttpExceptionFilter, LoggingInterceptor } from '@app/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // 1. Create a temporary context to read configurations
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get(ConfigService);

  const protocol = configService.get<string>('PROTOCOL') || 'http';
  let httpsOptions: any = null;
  console.log({ protocol })
  // 2. Load SSL files if protocol is set to https
  if (protocol === 'https') {
    try {
      httpsOptions = {
        key: fs.readFileSync(path.resolve(configService.get<string>('SSL_KEY_PATH') || '')),
        cert: fs.readFileSync(path.resolve(configService.get<string>('SSL_CERT_PATH') || '')),
        ca: fs.readFileSync(path.resolve(configService.get<string>('SSL_CA_PATH') || '')),
        requestCert: false,
        rejectUnauthorized: false,
      };
    } catch (error) {
      console.error('❌ Failed to load SSL certificates:', error.message);
      // Fallback to http or exit if SSL is mandatory
    }
  }

  // Close the temp context to free up memory
  await appContext.close();

  // 3. Create the real app with httpsOptions (if any)

  // const app = await NestFactory.create(AppModule, { httpsOptions });
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    { httpsOptions }
  );

  app.enableCors({
    origin: (origin, callback) => {
      const configuredOrigin = configService.get<string>('CORS_ORIGIN') || '*';

      if (configuredOrigin === '*') {
        callback(null, true);
        return;
      }

      const whitelist = configuredOrigin.split(',').map((o) => o.trim());
      if (!origin || whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    credentials: true,
    maxAge: 86400,
  });
  app.useStaticAssets(path.join(process.cwd(), 'uploads'), {
    prefix: '/uploads/', // This matches the start of your URL
  });
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.set('query parser', 'extended'); // This enables nested object parsing
  const port = configService.get<number>('API_GATEWAY_SERVICE_PORT') || 3000;

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,               // Strips extra fields not in DTO
    forbidNonWhitelisted: true,    // Errors if extra fields are sent
    transform: true,               // Automatically converts types
  }));

  await app.listen(port);

  console.log(`🚀 API Gateway is running on: ${protocol}://localhost:${port}`);
}
bootstrap();