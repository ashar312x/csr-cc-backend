import { Module } from '@nestjs/common';
import { NotificationModule } from './modules/notification/notification.module';
import { UsersModule } from './modules/users/users.module';
import { CommonConfigModule } from '../../../libs/common/src/config/config.module';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { FileUploadService } from '@app/common/services/file-upload.service';

@Module({
  imports: [
    // UsersModule,
  ],
  controllers: [],
  providers: [JwtService, ConfigService, FileUploadService],
})
export class AppModule { }