export const en = {
  INTERNAL_SERVER_ERROR: 'Internal server error',
  REQUEST_SUCCESS: 'Request successful',

  // Login
  LOGIN_EMAIL_AND_PASSWORD_REQUIRED: 'Email and password are required',
  LOGIN_SUCCESS: 'Login successful',
  LOGIN_FAILED: 'Login failed',
  LOGIN_INVALID_CREDENTIALS: 'Invalid credentials',
  LOGIN_INVALID_EMAIL_OR_PASSWORD: 'Invalid email or password',
  LOGIN_INVALID_PASSWORD: 'Invalid password',
  LOGIN_INVALID_USER: 'Invalid user',
  LOGIN_INVALID_USER_TYPE: 'Invalid user type',
  LOGIN_USER_NOT_FOUND: 'User not found',

  // User Management
  CREATE_USER_EMAIL_AND_PASSWORD_REQUIRED: 'Email and password are required',
  CREATE_USER_ALREADY_EXISTS: 'User already exists',
  GET_USER_NOT_FOUND: 'User not found',
  CHANGE_PASSWORD_USER_NOT_FOUND: 'User not found',
  CHANGE_PASSWORD_INVALID_CURRENT_PASSWORD: 'Current password is incorrect',
  PASSWORD_VALIDATION_ERROR: 'Password must be at least 6 characters long',

  // Company Management
  CREATE_COMPANY_NAME_REQUIRED: 'Company name is required',
  GET_COMPANY_NOT_FOUND: 'Company not found',

  // Onboarding Company Management
  CREATE_ONBOARDING_COMPANY_NAME_AND_USER_REQUIRED:
    'Company name and User ID are required',
  GET_ONBOARDING_COMPANY_NOT_FOUND: 'Onboarding company not found',

  // Onboarding Attachment Management
  CREATE_ATTACHMENT_REQUIRED_FIELDS_MISSING:
    'Onboarding ID, document name and URL are required',
  BULK_CREATE_ATTACHMENT_DATA_REQUIRED: 'Attachment data is required',

  // Onboarding Verification Management
  CREATE_VERIFICATION_REQUIRED_FIELDS_MISSING:
    'Onboarding ID and column name are required',
  BULK_CREATE_VERIFICATION_DATA_REQUIRED: 'Verification data is required',

  // Company-User Management
  CREATE_COMPANY_USER_COMPANY_ID_AND_USER_ID_REQUIRED:
    'Company ID and User ID are required',
  GET_COMPANY_USER_NOT_FOUND: 'Company-user mapping not found',
  REMOVE_COMPANY_USER_COMPANY_ID_AND_USER_ID_REQUIRED:
    'Company ID and User ID are required',

  // Permissions Management
  CREATE_PERMISSION_NAME_RESOURCE_AND_ACTION_REQUIRED:
    'Permission name, resource and action are required',
  GET_PERMISSION_NOT_FOUND: 'Permission not found',

  // Roles Management
  CREATE_ROLE_NAME_AND_COMPANY_ID_REQUIRED:
    'Role name and Company ID are required',
  GET_ROLE_NOT_FOUND: 'Role not found',

  // Role-Permissions Management
  ASSIGN_PERMISSION_ROLE_ID_AND_PERMISSION_ID_REQUIRED:
    'Role ID and Permission ID are required',

  // User-Role Management
  ASSIGN_ROLE_COMPANY_USER_ID_AND_ROLE_ID_REQUIRED:
    'Company User ID and Role ID are required',

  // Repository Errors
  REPOSITORY_USER_NOT_FOUND: 'User not found in database',
  REPOSITORY_COMPANY_NOT_FOUND: 'Company not found in database',
  REPOSITORY_COMPANY_USER_NOT_FOUND:
    'Company-user mapping not found in database',
  REPOSITORY_PERMISSION_NOT_FOUND: 'Permission not found in database',
  REPOSITORY_ROLE_NOT_FOUND: 'Role not found in database',
  REPOSITORY_ROLE_PERMISSION_NOT_FOUND:
    'Role-permission mapping not found in database',
  REPOSITORY_USER_ROLE_NOT_FOUND: 'User-role mapping not found in database',
  REPOSITORY_LEAD_NOT_FOUND: 'Lead not found in database',
  REPOSITORY_LOOKUP_NOT_FOUND: 'Lookup not found in database',
  REPOSITORY_NOTIFICATION_NOT_FOUND: 'Notification not found in database',
  REPOSITORY_USER_MAP_NOTIFICATION_NOT_FOUND:
    'User-notification mapping not found in database',
  REPOSITORY_ONBOARDING_COMPANY_NOT_FOUND:
    'Onboarding company not found in database',
  REPOSITORY_ONBOARDING_ATTACHMENT_NOT_FOUND:
    'Onboarding attachment not found in database',
  REPOSITORY_ONBOARDING_VERIFICATION_NOT_FOUND:
    'Onboarding verification not found in database',

  // DTO Validation Messages
  DTO_FIRST_NAME_REQUIRED: 'First name is required',
  DTO_LAST_NAME_REQUIRED: 'Last name is required',
  DTO_EMAIL_REQUIRED: 'Email is required',
  DTO_INVALID_EMAIL: 'Please enter a valid email address',
  DTO_PASSWORD_REQUIRED: 'Password is required',
  DTO_PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters long',
  DTO_PHONE_NUMBER_REQUIRED: 'Phone number is required',
  DTO_INVALID_USER_TYPE: 'User type must be either admin or customer',
  DTO_COMPANY_NAME_REQUIRED: 'Company name is required',
  DTO_DESCRIPTION_REQUIRED: 'Description is required',
  DTO_COMPANY_ID_REQUIRED: 'Company ID is required',
  DTO_USER_ID_REQUIRED: 'User ID is required',
  DTO_ROLE_NAME_REQUIRED: 'Role name is required',
  DTO_ROLE_ID_REQUIRED: 'Role ID is required',
  DTO_PERMISSION_NAME_REQUIRED: 'Permission name is required',
  DTO_RESOURCE_REQUIRED: 'Resource is required',
  DTO_ACTION_REQUIRED: 'Action is required',
  DTO_PERMISSION_ID_REQUIRED: 'Permission ID is required',
  DTO_COMPANY_USER_ID_REQUIRED: 'Company User ID is required',
  DTO_NOTIFICATION_TITLE_REQUIRED: 'Notification title is required',
  DTO_NOTIFICATION_MESSAGE_REQUIRED: 'Notification message is required',
  DTO_NOTIFICATION_TYPE_REQUIRED: 'Notification type is required',
  DTO_BROADCAST_TITLE_REQUIRED: 'Broadcast title is required',
  DTO_BROADCAST_MESSAGE_REQUIRED: 'Broadcast message is required',
  DTO_BROADCAST_TYPE_REQUIRED: 'Broadcast type is required',
  DTO_NOTIFICATION_ID_REQUIRED: 'Notification ID is required',
  DTO_LOOKUP_NAME_REQUIRED: 'Lookup name is required',

  // Leads Service
  CREATE_LEAD_NAME_TITLE_AND_SOURCE_REQUIRED:
    'Lead name, title and source are required',
  GET_LEAD_NOT_FOUND: 'Lead not found',
  UPDATE_LEAD_NOT_FOUND: 'Lead not found',

  // Notification Service
  NOTIFICATION_DATA_REQUIRED: 'Notification data is required',
  NOTIFICATION_NOT_FOUND: 'Notification not found',
  BROADCAST_DATA_REQUIRED: 'Broadcast data is required',
  NOTIFICATIONS_DATA_REQUIRED: 'Notifications data is required',

  // Lookup Service
  LOOKUP_PARENT_ID_NOT_FOUND: 'Lookup parent ID not found',

  // Auth Guard
  AUTH_GUARD_USER_NOT_FOUND: 'User not found',
  AUTH_GUARD_USER_NOT_VERIFIED: 'User not verified',
  AUTH_GUARD_NO_TOKEN_PROVIDED: 'No authentication token provided',
  AUTH_GUARD_INVALID_TOKEN_FORMAT: 'Invalid token format',
  AUTH_GUARD_SESSION_EXPIRED_OR_INVALID_TOKEN:
    'Session expired or invalid token',

  // Controller Messages
  CONTROLLER_USER_ID_REQUIRED: 'User ID is required',
  CONTROLLER_USER_ONBOARD_ERROR: 'Can not onboard user right now',
  CONTROLLER_ADMIN_ID_REQUIRED: 'Admin ID is required',
  CONTROLLER_VENDOR_ID_REQUIRED: 'Vendor ID is required',
  CONTROLLER_BROADCAST_DATA_REQUIRED: 'Broadcast data is required',
  CONTROLLER_NOTIFICATION_DATA_REQUIRED: 'Notification data is required',
  CONTROLLER_NOTIFICATIONS_DATA_REQUIRED: 'Notifications data is required',
  CONTROLLER_FAILED_TO_GET_NOTIFICATIONS: 'Failed to get notifications',
  CONTROLLER_FAILED_TO_GET_UNREAD_NOTIFICATIONS:
    'Failed to get unread notifications',
  CONTROLLER_FAILED_TO_GET_UNREAD_COUNT: 'Failed to get unread count',
  CONTROLLER_FAILED_TO_MARK_AS_READ: 'Failed to mark as read',
  CONTROLLER_FAILED_TO_CREATE_ADMIN_BROADCAST:
    'Failed to create admin broadcast',
  CONTROLLER_FAILED_TO_APPROVE_BROADCAST: 'Failed to approve broadcast',
  CONTROLLER_FAILED_TO_GET_VENDOR_BROADCAST_REQUESTS:
    'Failed to get vendor broadcast requests',
  CONTROLLER_FAILED_TO_GET_ADMIN_BROADCAST_HISTORY:
    'Failed to get admin broadcast history',
  CONTROLLER_FAILED_TO_CREATE_VENDOR_BROADCAST:
    'Failed to create vendor broadcast',
  CONTROLLER_FAILED_TO_GET_VENDOR_CUSTOMERS_COUNT:
    'Failed to get vendor customers count',
  CONTROLLER_FAILED_TO_GET_VENDOR_BROADCAST_HISTORY:
    'Failed to get vendor broadcast history',
  CONTROLLER_FAILED_TO_CREATE_NOTIFICATION: 'Failed to create notification',
  CONTROLLER_FAILED_TO_BULK_CREATE_NOTIFICATIONS:
    'Failed to bulk create notifications',
  BROADCAST_APPROVED_SUCCESS: 'Broadcast approved successfully',

  // Controller Fallback Messages
  CONTROLLER_USER_CANNOT_BE_CREATED: 'User cannot be created',
  CONTROLLER_USER_CANNOT_BE_LOGGED_IN: 'User cannot be logged in',
  CONTROLLER_USER_INFO_CANNOT_BE_FETCHED: 'User information cannot be fetched',
  CONTROLLER_USERS_CANNOT_BE_FETCHED: 'Users cannot be fetched',
  CONTROLLER_COMPANY_CANNOT_BE_CREATED: 'Company cannot be created',
  CONTROLLER_COMPANY_CANNOT_BE_FETCHED: 'Company cannot be fetched',
  CONTROLLER_COMPANIES_CANNOT_BE_FETCHED: 'Companies cannot be fetched',
  CONTROLLER_COMPANY_CANNOT_BE_UPDATED: 'Company cannot be updated',
  CONTROLLER_COMPANY_CANNOT_BE_DELETED: 'Company cannot be deleted',
  CONTROLLER_COMPANY_USER_MAPPING_CANNOT_BE_CREATED:
    'Company-user mapping cannot be created',
  CONTROLLER_COMPANY_USER_MAPPING_CANNOT_BE_FETCHED:
    'Company-user mapping cannot be fetched',
  CONTROLLER_COMPANY_USERS_CANNOT_BE_FETCHED: 'Company users cannot be fetched',
  CONTROLLER_USER_COMPANIES_CANNOT_BE_FETCHED:
    'User companies cannot be fetched',
  CONTROLLER_COMPANY_USER_MAPPING_CANNOT_BE_REMOVED:
    'Company-user mapping cannot be removed',
  CONTROLLER_PERMISSION_CANNOT_BE_CREATED: 'Permission cannot be created',
  CONTROLLER_PERMISSION_CANNOT_BE_FETCHED: 'Permission cannot be fetched',
  CONTROLLER_PERMISSIONS_CANNOT_BE_FETCHED: 'Permissions cannot be fetched',
  CONTROLLER_PERMISSION_CANNOT_BE_UPDATED: 'Permission cannot be updated',
  CONTROLLER_PERMISSION_CANNOT_BE_DELETED: 'Permission cannot be deleted',
  CONTROLLER_ROLE_CANNOT_BE_CREATED: 'Role cannot be created',
  CONTROLLER_ROLE_CANNOT_BE_FETCHED: 'Role cannot be fetched',
  CONTROLLER_ROLES_CANNOT_BE_FETCHED: 'Roles cannot be fetched',
  CONTROLLER_ROLE_CANNOT_BE_UPDATED: 'Role cannot be updated',
  CONTROLLER_ROLE_CANNOT_BE_DELETED: 'Role cannot be deleted',
  CONTROLLER_PERMISSION_CANNOT_BE_ASSIGNED_TO_ROLE:
    'Permission cannot be assigned to role',
  CONTROLLER_PERMISSION_CANNOT_BE_REMOVED_FROM_ROLE:
    'Permission cannot be removed from role',
  CONTROLLER_PERMISSIONS_CANNOT_BE_LISTED_FOR_ROLE:
    'Permissions cannot be listed for role',
  CONTROLLER_ROLE_CANNOT_BE_ASSIGNED_TO_USER: 'Role cannot be assigned to user',
  CONTROLLER_ROLE_CANNOT_BE_REMOVED_FROM_USER:
    'Role cannot be removed from user',
  CONTROLLER_ROLES_CANNOT_BE_LISTED_FOR_USER: 'Roles cannot be listed for user',
  CONTROLLER_LEAD_CANNOT_BE_CREATED: 'Lead cannot be created',
  CONTROLLER_LEAD_CANNOT_BE_FETCHED: 'Lead cannot be fetched',
  CONTROLLER_LEADS_CANNOT_BE_FETCHED: 'Leads cannot be fetched',
  CONTROLLER_LEAD_CANNOT_BE_UPDATED: 'Lead cannot be updated',
  CONTROLLER_LEAD_CANNOT_BE_DELETED: 'Lead cannot be deleted',
  CONTROLLER_LOOKUP_CANNOT_BE_CREATED: 'Lookup cannot be created',
  CONTROLLER_LOOKUP_PARENT_NOT_FOUND: 'Lookup parent not found',
  CONTROLLER_LOOKUP_ROW_CANNOT_BE_DELETED: 'Lookup row cannot be deleted',

  // Onboarding Controller Messages
  CONTROLLER_ONBOARDING_COMPANY_CANNOT_BE_CREATED:
    'Onboarding company cannot be created',
  CONTROLLER_ONBOARDING_COMPANY_CANNOT_BE_FETCHED:
    'Onboarding company cannot be fetched',
  CONTROLLER_ONBOARDING_COMPANIES_CANNOT_BE_FETCHED:
    'Onboarding companies cannot be fetched',
  CONTROLLER_ONBOARDING_COMPANY_CANNOT_BE_UPDATED:
    'Onboarding company cannot be updated',
  CONTROLLER_ONBOARDING_COMPANY_CANNOT_BE_DELETED:
    'Onboarding company cannot be deleted',
  CONTROLLER_ATTACHMENT_CANNOT_BE_CREATED: 'Attachment cannot be created',
  CONTROLLER_ATTACHMENTS_CANNOT_BE_CREATED: 'Attachments cannot be created',
  CONTROLLER_ATTACHMENTS_CANNOT_BE_FETCHED: 'Attachments cannot be fetched',
  CONTROLLER_ATTACHMENT_CANNOT_BE_DELETED: 'Attachment cannot be deleted',
  CONTROLLER_VERIFICATION_CANNOT_BE_CREATED: 'Verification cannot be created',
  CONTROLLER_VERIFICATIONS_CANNOT_BE_CREATED: 'Verifications cannot be created',
  CONTROLLER_VERIFICATIONS_CANNOT_BE_FETCHED: 'Verifications cannot be fetched',
  CONTROLLER_VERIFICATION_CANNOT_BE_UPDATED: 'Verification cannot be updated',
  CONTROLLER_VERIFICATION_CANNOT_BE_DELETED: 'Verification cannot be deleted',

  // Categories
  CATEGORY_CREATED: 'Category created successfully',
  CATEGORIES_FETCHED: 'Categories retrieved successfully',
  CATEGORY_FETCHED: 'Category retrieved successfully',
  CATEGORY_CHILDREN_FETCHED: 'Category children retrieved successfully',
  CATEGORY_DESCENDANTS_FETCHED: 'Category descendants retrieved successfully',
  CATEGORY_UPDATED: 'Category updated successfully',
  CATEGORY_SPECIAL_UPDATED: 'Category special status updated successfully',
  CATEGORY_DELETED: 'Category deleted successfully',
  SPECIAL_CATEGORIES_FETCHED: 'Special categories retrieved successfully',
  CATEGORY_NOT_FOUND: 'Category not found',
  CATEGORY_UPDATE_FORBIDDEN: 'You do not have permission to update this category',
  CATEGORY_DELETE_FORBIDDEN: 'You do not have permission to delete this category',
  CATEGORY_HAS_CHILDREN: 'Category has children. Pass force=true to cascade delete',

  // Metric Logs
  METRIC_LOG_CREATED: 'Metric log created successfully',
  METRIC_LOG_BULK_CREATED: 'Metric logs created successfully',
  METRIC_LOG_LIST: 'Metric logs retrieved successfully',
  METRIC_LOG_SUMMARY: 'Metric log summary retrieved successfully',
  METRIC_LOG_DETAIL: 'Metric log retrieved successfully',
  METRIC_LOG_UPDATED: 'Metric log updated successfully',
  METRIC_LOG_DELETED: 'Metric log deleted successfully',
  METRIC_LOG_NOT_FOUND: 'Metric log not found',
  METRIC_LOG_FORBIDDEN: 'You do not have access to this metric log',

  // User Auth & Profile
  SIGNUP_SUCCESS: 'User registered successfully',
  GET_ME_SUCCESS: 'User profile retrieved',
  UPDATE_ME_SUCCESS: 'User profile updated',
  UPDATE_PASSWORD_SUCCESS: 'Password updated successfully',
  USER_EMAIL_ALREADY_EXISTS: 'Email address is already registered',
  USER_NOT_FOUND: 'User not found',
  PASSWORD_MISMATCH: 'New password and confirm password do not match',
};
