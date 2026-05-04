import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsNumber()
  @IsNotEmpty({ message: 'DTO_COMPANY_ID_REQUIRED' })
  companyId: number;

  @IsString()
  @IsNotEmpty({ message: 'DTO_ROLE_NAME_REQUIRED' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
