export const AUDIT_TABLE_NAMES = {
    LEADS: 'leads',
    ONBOARDING_COMPANY: 'onboarding_company',
    ONBOARDING_ATTACHMENTS: 'onboarding_attachments',
    ONBOARDING_VERIFICATION: 'onboarding_verification',
};

export const GLOBAL_EXCLUDED_FIELDS = ['userId', 'id', 'user_id'];

export const TABLE_SPECIFIC_EXCLUSIONS: Record<string, string[]> = {
    // [AUDIT_TABLE_NAMES.LEADS]: ['name'],
    // [AUDIT_TABLE_NAMES.ONBOARDING_COMPANY]: ['status'],
};

export const AUDIT_OPERATIONS = {
    CREATE: 'create',
    DELETE: 'delete',
    STATUS: 'status',
};
