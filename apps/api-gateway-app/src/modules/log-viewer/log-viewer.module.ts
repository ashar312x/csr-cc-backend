import { Module } from '@nestjs/common';
import { LogViewerController } from './log-viewer.controller';

@Module({
  controllers: [LogViewerController],
})
export class LogViewerModule {}
