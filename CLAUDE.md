# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run the API Gateway in watch mode (primary dev command)
npm run start:dev:gateway

# Build
npm run build:all

# Lint (auto-fixes)
npm run lint

# Format
npm run format

# Run all tests
npm test

# Run a single test file
npx jest apps/api-gateway-app/src/modules/users/users.controller.spec.ts

# Database migrations
npm run migrate
npm run migrate:undo

# Seed database
npm run seed
```

## Architecture

This is a **NestJS monorepo** with a single active application (`api-gateway-app`) and two shared libraries.

### Active App

**`apps/api-gateway-app`** — REST API Gateway on port `3000` (env: `API_GATEWAY_SERVICE_PORT`).  
Entry: `apps/api-gateway-app/src/main.ts`. Root module: `api-gateway-app.module.ts`.

The app is currently being built out. `UsersModule` is commented out of `AppModule` — re-enable it as modules are implemented.

### Shared Libraries (path aliases)

| Alias | Path | Purpose |
|---|---|---|
| `@app/common` | `libs/common/src` | DTOs, interceptors, filters, guards, decorators, services (email, FCM, file upload), i18n |
| `@app/database` | `libs/database/src` | Sequelize `DatabaseModule`, model/repository registration |
| `@app/models` | `libs/database/src/models` | Sequelize model files |
| `@app/repositories` | `libs/database/src/repositories` | Repository classes |

### Database

- **Sequelize + MySQL** via `@nestjs/sequelize`
- `sync: { alter: { drop: false } }` — schema auto-syncs on app start; never drops columns
- `freezeTableName: true` — table names are not pluralized
- To add a model: define it in `libs/database/src/models/`, add it to the `ALL_MODELS` array in `libs/database/src/models/model.ts`
- To add a repository: define it in `libs/database/src/repositories/`, add it to `ALL_REPOSITORY` in `libs/database/src/repositories/repository.ts`
- `DatabaseModule` exports all repositories — import `DatabaseModule` in any feature module that needs DB access

### Microservice Communication (planned)

Controllers inject a `ClientProxy` via `@Inject('USER_SERVICE')` and send messages using patterns from `libs/common/src/constants/patterns.ts`. The TCP connections to external microservices (`USER_SERVICE`, `CALLING_SERVICE`, `COMMON_SERVICES`) are not yet active — the service layer currently returns stub data.

## Key Conventions

### Response Shape

Every successful response is wrapped by `TransformInterceptor` into:
```json
{ "success": true, "message": "...", "data": {}, "timestamp": "...", "statusCode": 200 }
```
Return `{ message: 'KEY', result: data, statusCode: 200 }` from controllers/services. The `message` value should be an i18n key defined in `libs/common/src/language/en.ts`; if the key is missing it falls back to the raw string.

### Authentication

Apply `@UseGuards(GatewayAuthGuard)` to protected routes. The guard validates a `Bearer` JWT against `JWT_ACCESS_SECRET` and attaches the decoded payload to `request['user']`. `GatewayAuthGuard` requires `JwtService` and `ConfigService` — ensure both are provided in the feature module.

### DTOs

All shared DTOs live in `libs/common/src/dto/` and are barrel-exported from `@app/common`. Use `class-validator` decorators; the global `ValidationPipe` (whitelist + forbidNonWhitelisted + transform) is configured in `main.ts`.

### Error Handling

Throw NestJS built-in HTTP exceptions (`BadRequestException`, `UnauthorizedException`, etc.) or custom exceptions from `@app/common/exceptions/`. `HttpExceptionFilter` (global) catches these and formats them. For microservice errors, `HyperRpcFilter` handles RPC exceptions.

### Logging

`LoggingInterceptor` (Winston, daily rotation) logs all requests/responses to `logs/application-YYYY-MM-DD.log`. Fields named `password`, `token`, `cardNumber`, `secret` are automatically masked.

## Environment

Local dev uses `.env.development`. Required variables:

```
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
JWT_ACCESS_SECRET
API_GATEWAY_SERVICE_PORT   # default 3000
PROTOCOL                   # http or https
CORS_ORIGIN                # * or comma-separated origins
```
