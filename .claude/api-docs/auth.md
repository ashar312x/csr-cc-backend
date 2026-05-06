# Auth APIs

Base URL: `http://localhost:3000/api/v1`

No authentication token required for these endpoints.

---

## POST /auth/signup

Register a new user account.

**Headers**
```
Content-Type: application/json
```

**Request Body**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePass123"
}
```

| Field    | Type   | Required | Rules              |
|----------|--------|----------|--------------------|
| name     | string | yes      | min 2 characters   |
| email    | string | yes      | valid email format |
| password | string | yes      | min 8 characters   |
| role     | string | no       | "user" or "admin" (defaults to "user") |

**Success Response — 201**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "accessForCC": false,
    "accessForCSR": false
  },
  "timestamp": "2026-05-07T10:00:00.000Z",
  "statusCode": 201
}
```

**Error Responses**

| Status | When                    |
|--------|-------------------------|
| 400    | Validation error        |
| 409    | Email already registered|

```json
{
  "success": false,
  "message": "Email address is already registered",
  "statusCode": 409
}
```

---

## POST /auth/login

Authenticate and receive a JWT access token.

**Headers**
```
Content-Type: application/json
```

**Request Body**
```json
{
  "email": "john@example.com",
  "password": "securePass123"
}
```

| Field    | Type   | Required |
|----------|--------|----------|
| email    | string | yes      |
| password | string | yes      |

**Success Response — 200**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIn0.abc123",
    "expiresIn": 3600,
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "accessForCC": false,
      "accessForCSR": false
    }
  },
  "timestamp": "2026-05-07T10:00:00.000Z",
  "statusCode": 200
}
```

**Error Responses**

| Status | When                        |
|--------|-----------------------------|
| 400    | Missing fields              |
| 401    | Wrong email or password     |

```json
{
  "success": false,
  "message": "Invalid email or password",
  "statusCode": 401
}
```

---

## How to Use the Token

Store `data.accessToken` from login. Pass it on every protected request:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token expires in 1 hour. Re-login to get a fresh token.
