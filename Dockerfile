# Use Node 20
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# We use ARG during build time
ARG APP_NAME
# We set an ENV so it persists at runtime
ENV SERVICE_NAME=${APP_NAME}

RUN npx nest build ${SERVICE_NAME}

# Use "sh -c" to ensure the variable is expanded
CMD ["sh", "-c", "node dist/apps/${SERVICE_NAME}/main.js"]