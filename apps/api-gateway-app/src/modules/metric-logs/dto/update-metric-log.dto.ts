import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMetricLogDto {
  @ApiPropertyOptional({ example: 'Evening walk', maxLength: 255 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @IsInt()
  value?: number;

  @ApiPropertyOptional({ example: '2026-05-04' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'entryDate must be in YYYY-MM-DD format' })
  entryDate?: string;
}
