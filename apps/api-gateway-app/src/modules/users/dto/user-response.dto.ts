import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@app/models/user.model';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role: UserRole;

  @ApiProperty({ example: false })
  accessForCC: boolean;

  @ApiProperty({ example: false })
  accessForCSR: boolean;
}
