export interface UserCreate {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phNumber: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AdminLogin {
  email: string;
  password: string;
}

export interface UserId {
  id?: string;
}

export interface PermissionItem {
  id: number;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface RoleItem {
  id?: number;
  name: string;
  description?: string;
}

export interface UserObject {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phNumber?: string;
  token?: string;
  userType?: string;
  isAdmin?: boolean;
  companyId?: number;
  companyName?: string;
  companyStatus?: string;
  companyLogo?: string;
  roleId?: number;
  roleName?: string;
  permissions?: PermissionItem[];
  resources?: string[];
  roles?: RoleItem[];
  isFirstLogin?: boolean;
  onboardingDetails?: {
    id: number;
    name?: string;
    city?: string;
    country?: string;
    businessType: string;
  };
}

export interface AdminObject {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  token?: string;
}

export interface OnboardUserObject {
  leadId?: number;
  email?: string;
  name?: string;
  products?: string[];
  company?: string;
}

export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
}

export interface UserFilters {
  search?: string | string[];
  userType?: string | string[];
}

export interface AdminCreateUser {
  firstName: string;
  lastName: string;
  email: string;
  roleId: number;
  companyId: number;
  phNumber?: string;
}

export interface AdminUpdateUser {
  userId: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  roleId?: number;
  userType?: string;
  phNumber?: string;
  isActive?: boolean;
}
