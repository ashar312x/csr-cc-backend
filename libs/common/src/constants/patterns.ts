export const USER_SERVICES_PATTERN = {
  USER: {
    GET_EMAILS: { cmd: 'user_get_email' },
    CREATE_USER: { cmd: 'user_create' },
    LOGIN_USER: { cmd: 'user_login' },
    LOGIN_ADMIN: { cmd: 'user_admin' },
    GET_USER_INFO: { cmd: 'user_get_info' },
    GET_ALL_USERS: { cmd: 'user_get_all' },
    CREATE_ONBOARD_USER: { cmd: 'user_create_onboard' },
    SEND_ONBOARD_EMAIL: { cmd: 'user_send_onboard_email' },
    ADMIN_CREATE_USER: { cmd: 'admin_create_user' },
    ADMIN_UPDATE_USER: { cmd: 'admin_update_user' },
    GET_ME: { cmd: 'user_get_me' },
    CHANGE_PASSWORD: { cmd: 'user_change_password' },
    ONBOARD_LOGIN: { cmd: 'user_onboard_login' },
  },
};
