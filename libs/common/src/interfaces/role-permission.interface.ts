export interface RolePermissionObject {
  id?: number;
  roleId: number;
  permissionId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AssignRolePermission {
  roleId: number;
  permissionIds: number[];
}

export interface RemoveRolePermission {
  roleId: number;
  permissionId: number;
}
