import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({ example: 'securePass123' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'newSecurePass456', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({ example: 'newSecurePass456' })
  @IsString()
  confirmPassword: string;
}
