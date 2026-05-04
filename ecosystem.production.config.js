module.exports = {
    apps: [
        {
            name: 'api-gateway',
            script: './dist/apps/api-gateway-app/main.js',
            env: {
                NODE_ENV: 'production',
                SERVICE_NAME: 'api-gateway-app'
            }
        },
        {
            name: 'common-services',
            script: './dist/apps/common-services-app/main.js',
            env: {
                NODE_ENV: 'production',
                SERVICE_NAME: 'common-services-app'
            }
        },
        {
            name: 'user-service',
            script: './dist/apps/user-services-app/main.js',
            env: {
                NODE_ENV: 'production',
                SERVICE_NAME: 'user-services-app'
            }
        },
        {
            name: 'calling-service',
            script: './dist/apps/calling-service-app/main.js',
            env: {
                NODE_ENV: 'production',
                SERVICE_NAME: 'calling-service-app'
            }
        }
    ]
};