import { IsNotEmpty, IsNumber } from 'class-validator';

export class AssignRoleDto {
  @IsNumber()
  @IsNotEmpty({ message: 'DTO_COMPANY_USER_ID_REQUIRED' })
  companyUserId: number;

  @IsNumber()
  @IsNotEmpty({ message: 'DTO_ROLE_ID_REQUIRED' })
  roleId: number;
}

export class RemoveRoleDto {
  @IsNumber()
  @IsNotEmpty({ message: 'DTO_COMPANY_USER_ID_REQUIRED' })
  companyUserId: number;

  @IsNumber()
  @IsNotEmpty({ message: 'DTO_ROLE_ID_REQUIRED' })
  roleId: number;
}
