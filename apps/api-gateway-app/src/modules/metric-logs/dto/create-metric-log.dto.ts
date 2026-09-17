import {
  IsInt,
  IsPositive,
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMetricLogDto {
  @ApiProperty({ example: 3, description: 'ID of a leaf category owned by the authenticated user' })
  @IsInt()
  @IsPositive()
  categoryId: number;

  @ApiProperty({ example: 'Morning run', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 42, description: 'Integer metric value; omit for text-only entries (e.g. CC posts)' })
  @IsOptional()
  @IsInt()
  value?: number;

  @ApiPropertyOptional({ example: 'Notes, summary, links...', description: 'Free-text body; used by CC posts' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2026-05-05', description: 'ISO 8601 YYYY-MM-DD; defaults to today if omitted' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'entryDate must be in YYYY-MM-DD format' })
  entryDate?: string;
}
