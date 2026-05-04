import { NestFactory } from '@nestjs/core';
import { AppModule } from './api-gateway-app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // 1. Get the ConfigService instance from the app container
    const configService = app.get(ConfigService);

    // 2. Retrieve the Port (default to 3000 if not found)
    const port = configService.get<number>('API_GATEWAY_SERVICE_PORT') || 3000;

    // 3. Start listening
    await app.listen(port);

    console.log(`🚀 API Gateway is running on: http://localhost:${port}`);
}
bootstrap();
