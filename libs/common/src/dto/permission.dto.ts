import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty({ message: 'DTO_PERMISSION_NAME_REQUIRED' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'DTO_RESOURCE_REQUIRED' })
  resource: string;

  @IsString()
  @IsNotEmpty({ message: 'DTO_ACTION_REQUIRED' })
  action: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  resource?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
