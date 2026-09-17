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

# Database migrations (not yet wired up — see Database section below)
npm run migrate
npm run migrate:undo

# Seed database (not yet wired up — see Database section below)
npm run seed
```

## Architecture

This is a **NestJS monorepo** with a single active application (`api-gateway-app`) and two shared libraries.

### Active App

**`apps/api-gateway-app`** — REST API Gateway on port `3000` (env: `API_GATEWAY_SERVICE_PORT`).  
Entry: `apps/api-gateway-app/src/main.ts`. Root module: `api-gateway-app.module.ts`.

Active feature modules (`apps/api-gateway-app/src/modules/`): `auth` (signup/login, JWT), `users` (profile, password change, `accessForCC`/`accessForCSR` module-access flags), `categories` (self-referential CSR/CC category tree), `metric-logs` (dated entries against a leaf category, incl. bulk-create and summary/comparison aggregation), `log-viewer` (reads the Winston log files). All have full controller/service/DTO layers already — this is further along than a first glance at the directory names suggests.

### Shared Libraries (path aliases)

| Alias | Path | Purpose |
|---|---|---|
| `@app/common` | `libs/common/src` | DTOs, interceptors, filters, guards, decorators, services (email, FCM, file upload), i18n |
| `@app/database` | `libs/database/src` | Sequelize `DatabaseModule`, model/repository registration |
| `@app/models` | `libs/database/src/models` | Sequelize model files |
| `@app/repositories` | `libs/database/src/repositories` | Repository classes |

### Database

- **Sequelize + MySQL** via `@nestjs/sequelize`. Models exist for `user`, `category` (self-referential tree, `moduleType` enum `CSR`/`CC`, owned by a `userId`), and `metric_log` (dated entries against a leaf category) — see `libs/database/src/models/`.
- `sync: { alter: { drop: false } }` in `database.module.ts` is currently the **only** schema-management mechanism — schema auto-syncs on app start, never drops columns. There are no migrations or seeders wired up yet, despite `npm run migrate`/`migrate:undo`/`seed` already being declared in `package.json` (no `.sequelizerc`, no `libs/database/src/migrations/`, and `libs/database/src/seeders/seed.ts` doesn't exist).
- The full target schema (including gaps against what the frontend needs — category display metadata, CC post attachments) and the migration/seeder plan are written up in **`docs/database-plan.md`**. Read that before adding models/columns or writing the first migration.
- `freezeTableName: true` — table names are not pluralized
- To add a model: define it in `libs/database/src/models/`, add it to the `ALL_MODELS` array in `libs/database/src/models/model.ts`
- To add a repository: define it in `libs/database/src/repositories/`, add it to `ALL_REPOSITORY` in `libs/database/src/repositories/repository.ts`
- `DatabaseModule` exports all repositories — import `DatabaseModule` in any feature module that needs DB access

### File uploads

`FileUploadService` (`libs/common/src/services/file-upload.service.ts`) writes multer files to local disk under `uploads/<folder>/<uuid><ext>` and returns a public URL built from `BASE_URL`. This is the existing mechanism to reuse for any future attachment upload endpoint (e.g. CC post attachments — see `docs/database-plan.md`) rather than introducing a second storage approach.

### Microservice communication (vestigial, not wired up)

`libs/common/src/constants/patterns.ts` defines TCP message patterns (`USER_SERVICES_PATTERN`) for a planned microservice split, but nothing in `apps/` currently injects a `ClientProxy` or references these patterns — the API gateway handles everything in-process today. Treat this file as unused until a real microservice is introduced.

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
