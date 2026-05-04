import { IsNotEmpty, IsNumber, IsArray } from 'class-validator';

export class AssignRolePermissionDto {
  @IsNumber()
  @IsNotEmpty({ message: 'DTO_ROLE_ID_REQUIRED' })
  roleId: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty({ message: 'DTO_PERMISSION_IDS_REQUIRED' })
  permissionIds: number[];
}

export class RemoveRolePermissionDto {
  @IsNumber()
  @IsNotEmpty({ message: 'DTO_ROLE_ID_REQUIRED' })
  roleId: number;

  @IsNumber()
  @IsNotEmpty({ message: 'DTO_PERMISSION_ID_REQUIRED' })
  permissionId: number;
}
