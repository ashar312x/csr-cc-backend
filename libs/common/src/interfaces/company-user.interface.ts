export interface CompanyUserCreate {
    companyId: number;
    isInitialAdmin?: boolean;
    joinedAt?: Date;
    userId?: number;
}

export interface CompanyUserUpdate {
    companyId?: number;
    userId?: number;
    isInitialAdmin?: boolean;
}

export interface CompanyUserObject {
    id?: number;
    companyId?: number;
    userId?: number;
    isInitialAdmin?: boolean;
    createdAt?: Date;
    joinedAt?: Date;
}

export interface CompanyUserFilters {
    companyId?: number;
    userId?: number;
    isInitialAdmin?: boolean;
    dateFrom?: Date | string;
    dateTo?: Date | string;
}

export interface CompanyUserRemove {
    companyId: number;
    userId: number;
}