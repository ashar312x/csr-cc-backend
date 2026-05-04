export interface Pagination<T> {
    page?: number;
    size?: number;
    limit?: number;
    offset?: number;
    order?: string;
    orderBy?: string;
    filters?: T;
}
export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    totalPages: number;
    totalItems: number;
}

export interface FindAndCountAllOptions<T> {
    rows: T[];
    count: number;
}