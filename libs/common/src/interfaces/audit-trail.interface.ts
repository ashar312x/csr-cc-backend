export interface AuditTrailObject {
    id?: number;
    tableName: string;
    createdByUserId: number | null;
    updatedBy: number | null;
    operationName: string;
    operationId: number;
    operationValue: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface AuditTrailCreate {
    tableName: string;
    createdByUserId: number | null;
    updatedBy?: number | null;
    operationName: string;
    operationId: number;
    operationValue: string;
}
