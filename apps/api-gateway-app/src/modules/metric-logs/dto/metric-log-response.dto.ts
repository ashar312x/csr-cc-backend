import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryResponseDto } from '../../categories/dto/category-response.dto';

export class MetricLogAttachmentResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'quarterly-report.pdf' })
  fileName: string;

  @ApiProperty({ example: 'application/pdf' })
  mimeType: string;

  @ApiProperty({ example: 204800 })
  sizeBytes: number;

  @ApiProperty({ example: 'http://localhost:3000/uploads/metric-log-attachments/abc123.pdf' })
  storagePath: string;

  @ApiProperty({ example: '2026-05-05T10:00:00.000Z' })
  createdAt: string;
}

export class MetricLogResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 3 })
  categoryId: number;

  @ApiProperty({ example: 'Morning run' })
  title: string;

  @ApiPropertyOptional({ example: 42, nullable: true })
  value?: number | null;

  @ApiPropertyOptional({ example: 'Notes, summary, links...', nullable: true })
  description?: string | null;

  @ApiProperty({ example: '2026-05-05' })
  entryDate: string;

  @ApiProperty({ type: () => CategoryResponseDto })
  category: CategoryResponseDto;

  @ApiPropertyOptional({ type: () => [MetricLogAttachmentResponseDto] })
  attachments?: MetricLogAttachmentResponseDto[];

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
