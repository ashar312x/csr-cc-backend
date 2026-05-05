import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseModule } from '@app/database/database.module';
import { MetricLogsController } from './metric-logs.controller';
import { MetricLogsService } from './metric-logs.service';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [MetricLogsService, ConfigService],
  controllers: [MetricLogsController],
})
export class MetricLogsModule {}
