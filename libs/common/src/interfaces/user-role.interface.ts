export interface UserRoleObject {
  id?: number;
  companyUserId: number;
  roleId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AssignRole {
  companyUserId: number;
  roleId: number;
}

export interface RemoveRole {
  companyUserId: number;
  roleId: number;
}

export interface GetRolesByCompanyUser {
  companyUserId: number;
}
