import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ModuleType } from '@app/models/category.model';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Billing Support' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isSpecial?: boolean;

  @ApiPropertyOptional({ enum: ModuleType })
  @IsOptional()
  @IsEnum(ModuleType)
  moduleType?: ModuleType;

  @ApiPropertyOptional({ example: 'Beneficiaries', maxLength: 255 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  eventLabel?: string;

  @ApiPropertyOptional({ example: 'HeartPulse', maxLength: 100, description: 'lucide-react icon name' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  iconName?: string;

  @ApiPropertyOptional({ example: '#CC0000', maxLength: 20, description: 'hex color' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  iconColor?: string;
}
