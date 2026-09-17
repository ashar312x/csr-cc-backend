import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ModuleType } from '@app/models/category.model';

export class CategoryResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Technical Support' })
  name: string;

  @ApiPropertyOptional({ example: null, nullable: true })
  parentId: number | null;

  @ApiProperty({ enum: ModuleType, example: ModuleType.CSR })
  moduleType: ModuleType;

  @ApiProperty({ example: false })
  isSpecial: boolean;

  @ApiProperty({ example: 7 })
  userId: number;

  @ApiPropertyOptional({ example: 'Beneficiaries', nullable: true })
  eventLabel?: string | null;

  @ApiPropertyOptional({ example: 'HeartPulse', nullable: true, description: 'lucide-react icon name' })
  iconName?: string | null;

  @ApiPropertyOptional({ example: '#CC0000', nullable: true, description: 'hex color' })
  iconColor?: string | null;

  @ApiProperty({ example: '2026-05-05T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-05-05T10:00:00.000Z' })
  updatedAt: string;

  @ApiPropertyOptional({ type: () => [CategoryResponseDto] })
  children?: CategoryResponseDto[];

  @ApiPropertyOptional({ example: 1, description: 'Present on /descendants endpoint' })
  depth?: number;
}
