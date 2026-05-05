export interface ApiRequest<T> {
  userId: number | string;
  roleId?: number | string;
  roleName?: string;
  data: T;
}
