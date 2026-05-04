// ─── Step Name Constants ──────────────────────────────────────────────────────
// Single source of truth for all EW onboarding step names.
// Use `as const` for full type inference — no enums needed.
// To add a new step: add it here, TypeScript will enforce it everywhere.

export const EW_STEP = {
    // Shared across all onboarding types
    GENERAL_BUSINESS_INFO:      'general_business_info',
    PHYSICAL_REGISTERED_ADDRESS: 'physical_registered_address',
    CONTACT_PERSON:             'contact_person',
    DOCUMENTS:                  'documents',

    // Partnership-specific
    FIRM_DETAILS:               'firm_details',
    PARTNER_KYC:                'partner_kyc',

    // Sole Proprietorship-specific
    BUSINESS_DETAILS:           'business_details',

    // Private Limited-specific
    BUSINESS_IDENTITY:          'business_identity',
    UBO_DIRECTORS:              'ubo_directors',
} as const;

// Derived union type: 'general_business_info' | 'contact_person' | ...
// Use this as the type for any stepName parameter or field.
export type EwStepName = typeof EW_STEP[keyof typeof EW_STEP];

// ─── Step Metadata ────────────────────────────────────────────────────────────
// Centralizes label + tagLine so formDefs in the seeder don't repeat them.
// If you rename a label, change it here — done.

export const EW_STEP_META: Record<EwStepName, { label: string; tagLine: string }> = {
    [EW_STEP.GENERAL_BUSINESS_INFO]:       { label: 'General Business Information',  tagLine: 'Business Info' },
    [EW_STEP.PHYSICAL_REGISTERED_ADDRESS]: { label: 'Physical & Registered Address', tagLine: 'Address Details' },
    [EW_STEP.CONTACT_PERSON]:              { label: 'Primary Contact Person',        tagLine: 'Details of contact person' },
    [EW_STEP.DOCUMENTS]:                   { label: 'Documents',                     tagLine: 'Details of documents' },
    [EW_STEP.FIRM_DETAILS]:                { label: 'Firm Details',                  tagLine: 'Details of firm' },
    [EW_STEP.PARTNER_KYC]:                 { label: 'Partner KYC',                   tagLine: 'Details of Partners' },
    [EW_STEP.BUSINESS_DETAILS]:            { label: 'Business Details',              tagLine: 'Details of business' },
    [EW_STEP.BUSINESS_IDENTITY]:           { label: 'Business Identity',             tagLine: 'Details of business identity' },
    [EW_STEP.UBO_DIRECTORS]:               { label: 'UBO & Directors',               tagLine: 'Details of directors' },
};
