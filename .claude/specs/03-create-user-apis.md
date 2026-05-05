## 1. Users API Specification

**Base URL**: `/api/v1/users`  
**Authentication**: JWT Bearer Token (via Auth Gateway)  
**Content-Type**: `application/json`

---

## 2. Authentication Gateway

All protected routes pass through the `JwtAuthGuard`. The guard validates the Bearer token from the `Authorization` header and attaches the decoded user payload to `req.user`.

### JWT Payload Structure

| Field  | Type   | Description        |
|--------|--------|--------------------|
| sub    | INT    | User ID            |
| email  | STRING | User email         |
| role   | ENUM   | User role          |
| iat    | INT    | Issued at (epoch)  |
| exp    | INT    | Expiry (epoch)     |

### Route Protection Summary

| Endpoint               | Method | Guard         |
|------------------------|--------|---------------|
| `/auth/signup`         | POST   | Public        |
| `/auth/login`          | POST   | Public        |
| `/users/me`            | GET    | JwtAuthGuard  |
| `/users/me`            | PATCH  | JwtAuthGuard  |
| `/users/me/password`   | PATCH  | JwtAuthGuard  |

---

## 3. Swagger Setup

### 3.1 Installation

```bash
npm install --save @nestjs/swagger swagger-ui-express
```

### 3.2 Bootstrap Configuration

In `main.ts`, initialize Swagger after creating the app:

```typescript
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Users API')
    .setDescription('Authentication and User Management API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'access-token', // <-- reference name used in @ApiBearerAuth()
    )
    .addTag('Auth', 'Public authentication endpoints')
    .addTag('Users', 'Protected user profile endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // UI at /api/docs

  await app.listen(3000);
}
bootstrap();
```

### 3.3 Swagger Decorators Reference

| Decorator                        | Scope       | Purpose                                          |
|----------------------------------|-------------|--------------------------------------------------|
| `@ApiTags('name')`               | Controller  | Groups endpoints under a named tag               |
| `@ApiBearerAuth('access-token')` | Controller / Method | Marks route as requiring JWT Bearer     |
| `@ApiOperation({ summary })`     | Method      | Short description shown in Swagger UI            |
| `@ApiBody({ type: Dto })`        | Method      | Explicitly binds request body DTO                |
| `@ApiResponse({ status, type })` | Method      | Documents a specific response shape              |
| `@ApiProperty()`                 | DTO field   | Exposes field in Swagger schema                  |
| `@ApiPropertyOptional()`         | DTO field   | Marks field as optional in Swagger schema        |
| `@ApiExtraModels()`              | Controller  | Registers models not directly used in responses  |

---

## 4. DTOs with Swagger + Validation

### 4.1 `signup.dto.ts`

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer',
}

export class SignUpDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'john@example.com', description: 'Unique email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePass123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.USER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
```

### 4.2 `login.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePass123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
```

### 4.3 `update-user.dto.ts`

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Updated', minLength: 2 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  accessForCC?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  accessForCSR?: boolean;
}
```

### 4.4 `update-password.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({ example: 'securePass123' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'newSecurePass456', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({ example: 'newSecurePass456' })
  @IsString()
  confirmPassword: string;
}
```

---

## 5. Endpoints

---

### 5.1 Sign Up

| Field  | Value          |
|--------|----------------|
| Method | POST           |
| URL    | `/auth/signup` |
| Auth   | Public         |
| Tag    | Auth           |

**Controller Method**

```typescript
@Post('signup')
@ApiTags('Auth')
@ApiOperation({ summary: 'Register a new user' })
@ApiBody({ type: SignUpDto })
@ApiResponse({ status: 201, description: 'User successfully created', type: UserResponseDto })
@ApiResponse({ status: 400, description: 'Validation error' })
@ApiResponse({ status: 409, description: 'Email already exists' })
async signUp(@Body() dto: SignUpDto) {}
```

**Request Body**

| Field    | Type   | Required | Validation                              |
|----------|--------|----------|-----------------------------------------|
| name     | string | Yes      | Min 2 chars                             |
| email    | string | Yes      | Valid email format                      |
| password | string | Yes      | Min 8 chars                             |
| role     | enum   | No       | `admin` \| `user` \| `viewer` — defaults to `user` |

**Responses**

| Status | Meaning           | Body                        |
|--------|-------------------|-----------------------------|
| 201    | User created      | `{ id, name, email, role }` |
| 400    | Validation error  | `{ message, errors[] }`     |
| 409    | Email exists      | `{ message }`               |

---

### 5.2 Login

| Field  | Value         |
|--------|---------------|
| Method | POST          |
| URL    | `/auth/login` |
| Auth   | Public        |
| Tag    | Auth          |

**Controller Method**

```typescript
@Post('login')
@ApiTags('Auth')
@ApiOperation({ summary: 'Authenticate user and return JWT' })
@ApiBody({ type: LoginDto })
@ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
@ApiResponse({ status: 400, description: 'Validation error' })
@ApiResponse({ status: 401, description: 'Invalid credentials' })
async login(@Body() dto: LoginDto) {}
```

**Request Body**

| Field    | Type   | Required | Validation         |
|----------|--------|----------|--------------------|
| email    | string | Yes      | Valid email format |
| password | string | Yes      | Min 8 chars        |

**Responses**

| Status | Meaning             | Body                                                     |
|--------|---------------------|----------------------------------------------------------|
| 200    | Login successful    | `{ accessToken, expiresIn, user: { id, name, email, role } }` |
| 400    | Validation error    | `{ message, errors[] }`                                  |
| 401    | Invalid credentials | `{ message }`                                            |

---

### 5.3 Get User Information

| Field  | Value           |
|--------|-----------------|
| Method | GET             |
| URL    | `/users/me`     |
| Auth   | JwtAuthGuard    |
| Tag    | Users           |

**Controller Method**

```typescript
@Get('me')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiOperation({ summary: 'Get current authenticated user profile' })
@ApiResponse({ status: 200, description: 'User profile returned', type: UserResponseDto })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 404, description: 'User not found' })
async getMe(@Request() req) {}
```

**Headers**

| Key           | Value                   |
|---------------|-------------------------|
| Authorization | `Bearer <access_token>` |

**Responses**

| Status | Meaning        | Body                                                   |
|--------|----------------|--------------------------------------------------------|
| 200    | Success        | `{ id, name, email, role, accessForCC, accessForCSR }` |
| 401    | Unauthorized   | `{ message }`                                          |
| 404    | User not found | `{ message }`                                          |

---

### 5.4 Update User Information

| Field  | Value        |
|--------|--------------|
| Method | PATCH        |
| URL    | `/users/me`  |
| Auth   | JwtAuthGuard |
| Tag    | Users        |

**Controller Method**

```typescript
@Patch('me')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiOperation({ summary: 'Update current user name or access flags' })
@ApiBody({ type: UpdateUserDto })
@ApiResponse({ status: 200, description: 'User updated', type: UserResponseDto })
@ApiResponse({ status: 400, description: 'Validation error' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
async updateMe(@Request() req, @Body() dto: UpdateUserDto) {}
```

**Request Body** *(all fields optional)*

| Field        | Type    | Validation  |
|--------------|---------|-------------|
| name         | string  | Min 2 chars |
| accessForCC  | boolean | —           |
| accessForCSR | boolean | —           |

**Responses**

| Status | Meaning          | Body                                                   |
|--------|------------------|--------------------------------------------------------|
| 200    | Updated          | `{ id, name, email, role, accessForCC, accessForCSR }` |
| 400    | Validation error | `{ message, errors[] }`                                |
| 401    | Unauthorized     | `{ message }`                                          |

---

### 5.5 Update Password

| Field  | Value                |
|--------|----------------------|
| Method | PATCH                |
| URL    | `/users/me/password` |
| Auth   | JwtAuthGuard         |
| Tag    | Users                |

**Controller Method**

```typescript
@Patch('me/password')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiOperation({ summary: 'Update password for the current user' })
@ApiBody({ type: UpdatePasswordDto })
@ApiResponse({ status: 200, description: 'Password updated successfully' })
@ApiResponse({ status: 400, description: 'Validation error or passwords do not match' })
@ApiResponse({ status: 401, description: 'Wrong current password or unauthorized' })
async updatePassword(@Request() req, @Body() dto: UpdatePasswordDto) {}
```

**Request Body**

| Field           | Type   | Required | Validation              |
|-----------------|--------|----------|-------------------------|
| currentPassword | string | Yes      | Must match DB hash      |
| newPassword     | string | Yes      | Min 8 chars             |
| confirmPassword | string | Yes      | Must match newPassword  |

**Responses**

| Status | Meaning                | Body          |
|--------|------------------------|---------------|
| 200    | Password updated       | `{ message }` |
| 400    | Mismatch / validation  | `{ message }` |
| 401    | Wrong current password | `{ message }` |

---

## 6. Response DTOs (for Swagger Schema)

### `user-response.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from './signup.dto';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role: UserRole;

  @ApiProperty({ example: false })
  accessForCC: boolean;

  @ApiProperty({ example: false })
  accessForCSR: boolean;
}
```

### `auth-response.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 3600 })
  expiresIn: number;

  @ApiProperty({ type: () => UserResponseDto })
  user: UserResponseDto;
}
```

---

## 7. File Structure

### Module — `/src/users` & `/src/auth`

| File                                  | Description                                           |
|---------------------------------------|-------------------------------------------------------|
| `main.ts`                             | Swagger bootstrap config (`DocumentBuilder` setup)    |
| `auth/auth.module.ts`                 | Registers AuthService, JwtModule, PassportModule      |
| `auth/auth.controller.ts`             | Handles `/auth/signup` and `/auth/login` with Swagger |
| `auth/auth.service.ts`                | Business logic: register, validateUser, login         |
| `auth/strategies/jwt.strategy.ts`     | Passport JWT strategy — validates token & payload     |
| `auth/guards/jwt-auth.guard.ts`       | Guard applied to protected routes                     |
| `auth/dto/signup.dto.ts`              | DTO: class-validator + `@ApiProperty`                 |
| `auth/dto/login.dto.ts`               | DTO: class-validator + `@ApiProperty`                 |
| `auth/dto/auth-response.dto.ts`       | Response shape for login — used in `@ApiResponse`     |
| `users/users.module.ts`               | Registers UsersService, imports DatabaseModule        |
| `users/users.controller.ts`           | Handles `/users/me` with `@ApiBearerAuth` guards      |
| `users/users.service.ts`              | Business logic: getMe, updateInfo, updatePassword     |
| `users/dto/update-user.dto.ts`        | DTO: class-validator + `@ApiPropertyOptional`         |
| `users/dto/update-password.dto.ts`    | DTO: class-validator + `@ApiProperty`                 |
| `users/dto/user-response.dto.ts`      | Response shape for user — used in `@ApiResponse`      |

---

## 8. Error Response Schema

All errors follow a consistent structure:

| Field      | Type   | Description                          |
|------------|--------|--------------------------------------|
| statusCode | number | HTTP status code                     |
| message    | string | Human-readable error description     |
| errors     | array  | Field-level validation errors (400 only) |
| timestamp  | string | ISO 8601 datetime                    |
| path       | string | Request path                         |

**Example**

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "must be a valid email" },
    { "field": "password", "message": "must be at least 8 characters" }
  ],
  "timestamp": "2025-01-01T12:00:00.000Z",
  "path": "/auth/signup"
}
```