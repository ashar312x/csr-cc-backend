import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { TransformInterceptor } from './interceptors/transform.interceptors';
import { HttpExceptionFilter } from './filters/http-exception.filters';
import { HyperRpcFilter } from './filters/rpc-exection.filters';
import { ApiException } from './exceptions/api.exeptions';
import { LoggingInterceptor } from './interceptors/logging.interceptors';

@Module({
  providers: [CommonService, TransformInterceptor, HttpExceptionFilter, HyperRpcFilter, ApiException, LoggingInterceptor],
  exports: [CommonService, TransformInterceptor, HttpExceptionFilter, HyperRpcFilter, ApiException, LoggingInterceptor],
})
export class CommonModule { }
