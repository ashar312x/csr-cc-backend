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

  @ApiProperty({ example: 42, description: 'Integer metric value' })
  @IsInt()
  value: number;

  @ApiPropertyOptional({ example: '2026-05-05', description: 'ISO 8601 YYYY-MM-DD; defaults to today if omitted' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'entryDate must be in YYYY-MM-DD format' })
  entryDate?: string;
}
