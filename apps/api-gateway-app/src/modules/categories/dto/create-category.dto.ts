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
}
