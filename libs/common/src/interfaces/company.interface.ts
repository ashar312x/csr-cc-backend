export interface CompanyCreate {
    name: string;
    description: string;
    status?: string;
    logo?: string;
}

export interface CompanyUpdate {
    name?: string;
    description?: string;
    status?: string;
    logo?: string;
}

export interface CompanyObject {
    id?: number;
    name?: string;
    description?: string;
    status?: string;
    logo?: string;
    createdAt?: Date;
}

export interface CompanyFilters {
    search?: string;
    status?: string | string[];
    dateFrom?: Date | string;
    dateTo?: Date | string;
}