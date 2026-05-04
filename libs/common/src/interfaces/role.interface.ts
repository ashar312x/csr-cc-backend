export interface RoleObject {
  id?: number;
  companyId: number;
  name: string;
  description?: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateRole {
  companyId: number;
  name: string;
  description?: string;
}

export interface UpdateRole {
  name?: string;
  description?: string;
}

export interface RoleFilters {
  companyId?: number;
  name?: string;
  search?: string;
  isDeleted?: boolean;
}
