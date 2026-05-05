import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      // It will look for a file based on NODE_ENV (e.g., .env.dev)
      envFilePath: [
        `.env.${process.env.NODE_ENV}`,
        `./apps/${process.env.SERVICE_NAME}/.env.${process.env.NODE_ENV}`,
      ],
      isGlobal: true, // Makes ConfigModule available everywhere without re-importing
    }),
  ],
})
export class CommonConfigModule {}
