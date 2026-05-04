export interface OnboardingCompanyCreate {
    userId: number;
    name?: string;
    address?: string;
    city?: string;
    country?: string;
    businessCategory?: string;
    businessType?: string;
    ntnNumber?: string;
    status?: string;
    leadId?: number;
    isLinkSent?: boolean;
    isFirstStepDone?: boolean;
}

export interface OnboardingCompanyUpdate {
    name?: string;
    address?: string;
    city?: string;
    country?: string;
    businessCategory?: string;
    businessType?: string;
    ntnNumber?: string;
    status?: string;
    isApproved?: boolean;
    isLinkSent?: boolean;
    isFirstStepDone?: boolean;
}

export interface OnboardingCompanyObject {
    id?: number;
    userId?: number;
    name?: string;
    address?: string;
    city?: string;
    country?: string;
    businessCategory?: string;
    businessType?: string;
    ntnNumber?: string;
    status?: string;
    isApproved?: boolean;
    isFirstStepDone?: boolean;
    leadId?: number;
    isLinkSent?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface OnboardingCompanyFilters {
    search?: string;
    status?: string | string[];
    userId?: number;
    isApproved?: boolean;
    dateFrom?: Date | string;
    dateTo?: Date | string;
}

export interface OnboardingAttachmentCreate {
    onboardingId: number;
    documentName: string;
    url: string;
    type?: string;
}

export interface OnboardingAttachmentObject {
    id?: number;
    onboardingId?: number;
    documentName?: string;
    url?: string;
    type?: string;
    createdAt?: Date;
}

export interface OnboardingVerificationCreate {
    onboardingId: number;
    columnName: string;
    attachmentUrl?: string;
    reviewDescription?: string;
    status?: string;
    verifiedById?: number;
}

export interface OnboardingVerificationUpdate {
    attachmentUrl?: string;
    reviewDescription?: string;
    status?: string;
    verifiedById?: number;
    verifiedAt?: Date;
}

export interface OnboardingVerificationObject {
    id?: number;
    onboardingId?: number;
    columnName?: string;
    attachmentUrl?: string;
    reviewDescription?: string;
    status?: string;
    verifiedById?: number;
    verifiedAt?: Date;
    createdAt?: Date;
}
