export interface CreatePermission {
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface UpdatePermission {
  name?: string;
  resource?: string;
  action?: string;
  description?: string;
}

export interface PermissionObject {
  id?: number;
  name: string;
  resource: string;
  action: string;
  description?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
