import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEnum,
  IsBoolean,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ModuleType } from '@app/models/category.model';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Technical Support', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 5, description: 'Parent category ID; omit for root' })
  @IsOptional()
  @IsInt()
  @Min(1)
  parentId?: number;

  @ApiProperty({ enum: ModuleType, example: ModuleType.CSR })
  @IsEnum(ModuleType)
  moduleType: ModuleType;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isSpecial?: boolean;

  @ApiPropertyOptional({ example: 'Beneficiaries', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  eventLabel?: string;

  @ApiPropertyOptional({ example: 'HeartPulse', maxLength: 100, description: 'lucide-react icon name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  iconName?: string;

  @ApiPropertyOptional({ example: '#CC0000', maxLength: 20, description: 'hex color' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  iconColor?: string;
}
