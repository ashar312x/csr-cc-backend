# User APIs

Base URL: `http://localhost:3000/api/v1`

All endpoints require authentication.

**Headers (all requests)**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

---

## GET /users/me

Get the profile of the currently logged-in user.

**No request body or query params.**

**Success Response — 200**
```json
{
  "success": true,
  "message": "User profile retrieved",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "accessForCC": false,
    "accessForCSR": true
  },
  "timestamp": "2026-05-07T10:00:00.000Z",
  "statusCode": 200
}
```

**Error Responses**

| Status | When                    |
|--------|-------------------------|
| 401    | Missing or invalid token|
| 404    | User not found          |

---

## PATCH /users/me

Update the current user's name or module access flags.

All fields are optional — send only what you want to change.

**Request Body**
```json
{
  "name": "John Updated",
  "accessForCC": true,
  "accessForCSR": false
}
```

| Field       | Type    | Required | Rules            |
|-------------|---------|----------|------------------|
| name        | string  | no       | min 2 characters |
| accessForCC | boolean | no       | true or false    |
| accessForCSR| boolean | no       | true or false    |

**Success Response — 200**
```json
{
  "success": true,
  "message": "User profile updated",
  "data": {
    "id": 1,
    "name": "John Updated",
    "email": "john@example.com",
    "role": "user",
    "accessForCC": true,
    "accessForCSR": false
  },
  "timestamp": "2026-05-07T10:05:00.000Z",
  "statusCode": 200
}
```

**Error Responses**

| Status | When                    |
|--------|-------------------------|
| 400    | Validation error        |
| 401    | Missing or invalid token|

---

## PATCH /users/me/password

Change the current user's password.

**Request Body**
```json
{
  "currentPassword": "securePass123",
  "newPassword": "newSecurePass456",
  "confirmPassword": "newSecurePass456"
}
```

| Field           | Type   | Required | Rules            |
|-----------------|--------|----------|------------------|
| currentPassword | string | yes      | current password |
| newPassword     | string | yes      | min 8 characters |
| confirmPassword | string | yes      | must match newPassword |

**Success Response — 200**
```json
{
  "success": true,
  "message": "Password updated successfully",
  "data": null,
  "timestamp": "2026-05-07T10:10:00.000Z",
  "statusCode": 200
}
```

**Error Responses**

| Status | When                               |
|--------|------------------------------------|
| 400    | newPassword and confirmPassword don't match |
| 401    | currentPassword is wrong, or token invalid  |
| 404    | User not found                     |
