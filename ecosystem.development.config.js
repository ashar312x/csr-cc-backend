module.exports = {
    apps: [
        {
            name: 'api-gateway',
            script: './dist/apps/api-gateway-app/main.js',
            env: {
                NODE_ENV: 'development',
                SERVICE_NAME: 'api-gateway-app'
            }
        }
    ]
};