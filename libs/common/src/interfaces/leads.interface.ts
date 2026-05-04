export interface LeadObject {
    id?: number;
    name?: string;
    title?: string;
    source?: string;
    email?: string;
    phone?: string;
    description?: string;
    metadata?: string;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    status?: string;
    comments?: string;
    isLinkSent?: boolean;
    businessType?: string;
}

export interface CreateLead {
    name: string;
    title: string;
    source: string;
    email?: string;
    phone?: string;
    description?: string;
    status?: string;
    metadata?: string;
    userId?: number;
    comments?: string;
    isLinkSent?: boolean;
    businessType?: string;
}

export interface UpdateLead {
    id: number;
    name?: string;
    title?: string;
    source?: string;
    email?: string;
    phone?: string;
    description?: string;
    metadata?: string;
    status?: string;
    userId?: number;
    comments?: string;
    isLinkSent?: boolean;
    country?: string;
    businessType?: string;
}

export interface LeadFilters {
    search?: string;
    source?: string | string[];
    dateFrom?: Date | string;
    dateTo?: Date | string;
}

export interface LeadEvidenceObject {
    id?: number;
    leadId?: number;
    text?: string;
    imageUrl?: string;
    fileUrl?: string;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateLeadEvidence {
    leadId: number;
    text?: string;
    imageUrl?: string;
    fileUrl?: string;
}

export interface UpdateLeadEvidence {
    id: number;
    leadId?: number;
    text?: string;
    imageUrl?: string;
    fileUrl?: string;
}
