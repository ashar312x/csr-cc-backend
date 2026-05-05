import { IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateMetricLogDto } from './create-metric-log.dto';

export class CreateBulkMetricLogDto {
  @ApiProperty({ type: [CreateMetricLogDto], description: 'Array of metric log entries (1–100 items)' })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @Type(() => CreateMetricLogDto)
  entries: CreateMetricLogDto[];
}
