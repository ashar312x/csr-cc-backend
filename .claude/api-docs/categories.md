# Categories APIs

Base URL: `http://localhost:3000/api/v1`

All endpoints require authentication.

**Headers (all requests)**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**moduleType values:** `"CSR"` or `"CC"`

---

## Category Object

```json
{
  "id": 1,
  "name": "Technical Support",
  "parentId": null,
  "moduleType": "CSR",
  "isSpecial": false,
  "userId": 7,
  "createdAt": "2026-05-07T10:00:00.000Z",
  "updatedAt": "2026-05-07T10:00:00.000Z"
}
```

When loaded with children (`includeChildren=true`), each category has a `children` array:
```json
{
  "id": 1,
  "name": "Technical Support",
  "parentId": null,
  "moduleType": "CSR",
  "isSpecial": false,
  "userId": 7,
  "createdAt": "2026-05-07T10:00:00.000Z",
  "updatedAt": "2026-05-07T10:00:00.000Z",
  "children": [
    {
      "id": 2,
      "name": "Hardware",
      "parentId": 1,
      "moduleType": "CSR",
      "isSpecial": false,
      "userId": 7,
      "createdAt": "2026-05-07T10:01:00.000Z",
      "updatedAt": "2026-05-07T10:01:00.000Z",
      "children": []
    }
  ]
}
```

---

## POST /categories

Create a new category. To create a root category, omit `parentId`. To create a child, provide the parent's `id`.

> A child's `moduleType` must match its parent's `moduleType`.

**Request Body**
```json
{
  "name": "Technical Support",
  "moduleType": "CSR",
  "parentId": null,
  "isSpecial": false
}
```

| Field      | Type    | Required | Rules                                     |
|------------|---------|----------|-------------------------------------------|
| name       | string  | yes      | max 255 characters                        |
| moduleType | string  | yes      | "CSR" or "CC"                             |
| parentId   | number  | no       | ID of an existing category; omit for root |
| isSpecial  | boolean | no       | defaults to false                         |

**Success Response — 201**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": 1,
    "name": "Technical Support",
    "parentId": null,
    "moduleType": "CSR",
    "isSpecial": false,
    "userId": 7,
    "createdAt": "2026-05-07T10:00:00.000Z",
    "updatedAt": "2026-05-07T10:00:00.000Z"
  },
  "timestamp": "2026-05-07T10:00:00.000Z",
  "statusCode": 201
}
```

**Error Responses**

| Status | When                                    |
|--------|-----------------------------------------|
| 400    | Validation error                        |
| 401    | Unauthorized                            |
| 404    | parentId does not exist                 |
| 422    | Child moduleType does not match parent  |

---

## GET /categories

Get all root categories (parentId is null). Optionally load the full nested tree.

**Query Params**

| Param           | Type    | Required | Description                                |
|-----------------|---------|----------|--------------------------------------------|
| includeChildren | boolean | no       | `true` to load full subtree recursively    |
| moduleType      | string  | no       | Filter by "CSR" or "CC"                   |

**Example:** `GET /categories?moduleType=CSR&includeChildren=true`

**Success Response — 200**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Technical Support",
      "parentId": null,
      "moduleType": "CSR",
      "isSpecial": false,
      "userId": 7,
      "createdAt": "2026-05-07T10:00:00.000Z",
      "updatedAt": "2026-05-07T10:00:00.000Z",
      "children": [
        {
          "id": 2,
          "name": "Hardware",
          "parentId": 1,
          "moduleType": "CSR",
          "isSpecial": false,
          "userId": 7,
          "createdAt": "2026-05-07T10:01:00.000Z",
          "updatedAt": "2026-05-07T10:01:00.000Z",
          "children": []
        }
      ]
    }
  ],
  "timestamp": "2026-05-07T10:00:00.000Z",
  "statusCode": 200
}
```

---

## GET /categories/special

Get all categories where `isSpecial = true`.

**Query Params**

| Param      | Type   | Required | Description          |
|------------|--------|----------|----------------------|
| moduleType | string | no       | Filter by "CSR" or "CC" |

**Example:** `GET /categories/special?moduleType=CC`

**Success Response — 200**
```json
{
  "success": true,
  "message": "Special categories retrieved successfully",
  "data": [
    {
      "id": 3,
      "name": "VIP Support",
      "parentId": 1,
      "moduleType": "CSR",
      "isSpecial": true,
      "userId": 7,
      "createdAt": "2026-05-07T10:02:00.000Z",
      "updatedAt": "2026-05-07T10:02:00.000Z"
    }
  ],
  "timestamp": "2026-05-07T10:00:00.000Z",
  "statusCode": 200
}
```

---

## GET /categories/:id

Get a single category by its ID.

**Query Params**

| Param           | Type    | Required | Description                          |
|-----------------|---------|----------|--------------------------------------|
| includeChildren | boolean | no       | `true` to load full subtree from here |

**Example:** `GET /categories/1?includeChildren=true`

**Success Response — 200**
```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "id": 1,
    "name": "Technical Support",
    "parentId": null,
    "moduleType": "CSR",
    "isSpecial": false,
    "userId": 7,
    "createdAt": "2026-05-07T10:00:00.000Z",
    "updatedAt": "2026-05-07T10:00:00.000Z",
    "children": [
      {
        "id": 2,
        "name": "Hardware",
        "parentId": 1,
        "moduleType": "CSR",
        "isSpecial": false,
        "userId": 7,
        "createdAt": "2026-05-07T10:01:00.000Z",
        "updatedAt": "2026-05-07T10:01:00.000Z",
        "children": []
      }
    ]
  },
  "timestamp": "2026-05-07T10:00:00.000Z",
  "statusCode": 200
}
```

**Error Responses**

| Status | When               |
|--------|--------------------|
| 401    | Unauthorized       |
| 404    | Category not found |

---

## GET /categories/:id/children

Get only the **direct** children of a category (depth 1, not recursive).

**No query params.**

**Example:** `GET /categories/1/children`

**Success Response — 200**
```json
{
  "success": true,
  "message": "Category children retrieved successfully",
  "data": [
    {
      "id": 2,
      "name": "Hardware",
      "parentId": 1,
      "moduleType": "CSR",
      "isSpecial": false,
      "userId": 7,
      "createdAt": "2026-05-07T10:01:00.000Z",
      "updatedAt": "2026-05-07T10:01:00.000Z"
    },
    {
      "id": 3,
      "name": "Software",
      "parentId": 1,
      "moduleType": "CSR",
      "isSpecial": false,
      "userId": 7,
      "createdAt": "2026-05-07T10:02:00.000Z",
      "updatedAt": "2026-05-07T10:02:00.000Z"
    }
  ],
  "timestamp": "2026-05-07T10:00:00.000Z",
  "statusCode": 200
}
```

---

## GET /categories/:id/descendants

Get **all** descendants of a category as a flat list. Each item has a `depth` field (1 = direct child, 2 = grandchild, etc.).

**No query params.**

**Example:** `GET /categories/1/descendants`

**Success Response — 200**
```json
{
  "success": true,
  "message": "Category descendants retrieved successfully",
  "data": [
    {
      "id": 2,
      "name": "Hardware",
      "parentId": 1,
      "moduleType": "CSR",
      "isSpecial": false,
      "userId": 7,
      "depth": 1,
      "createdAt": "2026-05-07T10:01:00.000Z",
      "updatedAt": "2026-05-07T10:01:00.000Z"
    },
    {
      "id": 4,
      "name": "Laptops",
      "parentId": 2,
      "moduleType": "CSR",
      "isSpecial": false,
      "userId": 7,
      "depth": 2,
      "createdAt": "2026-05-07T10:03:00.000Z",
      "updatedAt": "2026-05-07T10:03:00.000Z"
    }
  ],
  "timestamp": "2026-05-07T10:00:00.000Z",
  "statusCode": 200
}
```

---

## PATCH /categories/:id

Update a category's name, isSpecial flag, or moduleType. Only the owner or an admin can update.

> `parentId` cannot be changed via this endpoint.

**Request Body** (all fields optional — send only what changes)
```json
{
  "name": "Advanced Technical Support",
  "isSpecial": true,
  "moduleType": "CSR"
}
```

| Field      | Type    | Required | Rules             |
|------------|---------|----------|-------------------|
| name       | string  | no       | max 255 characters|
| isSpecial  | boolean | no       | true or false     |
| moduleType | string  | no       | "CSR" or "CC"    |

**Success Response — 200**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "id": 1,
    "name": "Advanced Technical Support",
    "parentId": null,
    "moduleType": "CSR",
    "isSpecial": true,
    "userId": 7,
    "createdAt": "2026-05-07T10:00:00.000Z",
    "updatedAt": "2026-05-07T11:00:00.000Z"
  },
  "timestamp": "2026-05-07T11:00:00.000Z",
  "statusCode": 200
}
```

**Error Responses**

| Status | When                          |
|--------|-------------------------------|
| 401    | Unauthorized                  |
| 403    | Not the owner and not admin   |
| 404    | Category not found            |

---

## PATCH /categories/:id/special

Dedicated endpoint to toggle the `isSpecial` flag. Only the owner or admin can use this.

**Request Body**
```json
{
  "isSpecial": true
}
```

| Field     | Type    | Required |
|-----------|---------|----------|
| isSpecial | boolean | yes      |

**Success Response — 200**
```json
{
  "success": true,
  "message": "Category special status updated successfully",
  "data": {
    "id": 1,
    "name": "Technical Support",
    "parentId": null,
    "moduleType": "CSR",
    "isSpecial": true,
    "userId": 7,
    "createdAt": "2026-05-07T10:00:00.000Z",
    "updatedAt": "2026-05-07T11:05:00.000Z"
  },
  "timestamp": "2026-05-07T11:05:00.000Z",
  "statusCode": 200
}
```

---

## DELETE /categories/:id

Delete a category. Only the owner or admin can delete.

- If the category has children, the request fails unless `?force=true` is passed.
- `?force=true` deletes the category **and all its descendants**.

**Query Params**

| Param | Type    | Required | Description                             |
|-------|---------|----------|-----------------------------------------|
| force | boolean | no       | `true` to cascade-delete all children   |

**Example:** `DELETE /categories/1?force=true`

**Success Response — 200**
```json
{
  "success": true,
  "message": "Category deleted successfully",
  "data": null,
  "timestamp": "2026-05-07T11:10:00.000Z",
  "statusCode": 200
}
```

**Error Responses**

| Status | When                                              |
|--------|---------------------------------------------------|
| 400    | Category has children and force=true was not sent |
| 401    | Unauthorized                                      |
| 403    | Not the owner and not admin                       |
| 404    | Category not found                                |

```json
{
  "success": false,
  "message": "Category has children. Pass force=true to cascade delete",
  "statusCode": 400
}
```
