import { ApiProperty } from '@nestjs/swagger';
import { CategoryResponseDto } from '../../categories/dto/category-response.dto';

export class MetricLogResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 3 })
  categoryId: number;

  @ApiProperty({ example: 'Morning run' })
  title: string;

  @ApiProperty({ example: 42 })
  value: number;

  @ApiProperty({ example: '2026-05-05' })
  entryDate: string;

  @ApiProperty({ type: () => CategoryResponseDto })
  category: CategoryResponseDto;

  @ApiProperty({ example: '2026-05-05T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-05-05T10:00:00.000Z' })
  updatedAt: string;
}

export class MetricLogSummaryDto {
  @ApiProperty({ example: 3 })
  categoryId: number;

  @ApiProperty({ example: 'Running' })
  categoryName: string;

  @ApiProperty({ example: 350 })
  total: number;

  @ApiProperty({ example: 43.75 })
  average: number;

  @ApiProperty({ example: 8 })
  count: number;
}
