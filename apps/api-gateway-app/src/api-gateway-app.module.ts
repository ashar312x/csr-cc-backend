import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { MetricLogsModule } from './modules/metric-logs/metric-logs.module';
import { LogViewerModule } from './modules/log-viewer/log-viewer.module';
import { CommonConfigModule } from '../../../libs/common/src/config/config.module';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { FileUploadService } from '@app/common/services/file-upload.service';

@Module({
  imports: [CommonConfigModule, UsersModule, AuthModule, CategoriesModule, MetricLogsModule, LogViewerModule],
  controllers: [],
  providers: [JwtService, ConfigService, FileUploadService],
})
export class AppModule {}
