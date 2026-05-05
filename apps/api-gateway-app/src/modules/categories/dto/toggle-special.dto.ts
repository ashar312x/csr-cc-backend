import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleSpecialDto {
  @ApiProperty({ example: true, description: 'New isSpecial value' })
  @IsBoolean()
  isSpecial: boolean;
}
