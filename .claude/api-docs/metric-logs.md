# Metric Log APIs

Base URL: `http://localhost:3000/api/v1`

All endpoints require authentication.

**Headers (all requests)**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Important rules:**
- Metric logs can only be created on **leaf categories** (categories with no children).
- The category must belong to the authenticated user.
- `categoryId` cannot be changed after a log is created.

---

## Metric Log Object

```json
{
  "id": 1,
  "categoryId": 4,
  "title": "Morning run",
  "value": 42,
  "entryDate": "2026-05-07",
  "category": {
    "id": 4,
    "name": "Laptops",
    "parentId": 2,
    "moduleType": "CSR",
    "isSpecial": false,
    "userId": 7,
    "createdAt": "2026-05-07T10:03:00.000Z",
    "updatedAt": "2026-05-07T10:03:00.000Z"
  },
  "createdAt": "2026-05-07T10:00:00.000Z",
  "updatedAt": "2026-05-07T10:00:00.000Z"
}
```

---

## POST /metric-logs

Create a single metric log entry.

**Request Body**
```json
{
  "categoryId": 4,
  "title": "Morning run",
  "value": 42,
  "entryDate": "2026-05-07"
}
```

| Field      | Type   | Required | Rules                                   |
|------------|--------|----------|-----------------------------------------|
| categoryId | number | yes      | Must be a leaf category owned by user   |
| title      | string | yes      | max 255 characters                      |
| value      | number | yes      | integer                                 |
| entryDate  | string | no       | YYYY-MM-DD format; defaults to today    |

**Success Response — 201**
```json
{
  "success": true,
  "message": "Metric log created successfully",
  "data": {
    "id": 1,
    "categoryId": 4,
    "title": "Morning run",
    "value": 42,
    "entryDate": "2026-05-07",
    "category": {
      "id": 4,
      "name": "Laptops",
      "parentId": 2,
      "moduleType": "CSR",
      "isSpecial": false,
      "userId": 7,
      "createdAt": "2026-05-07T10:03:00.000Z",
      "updatedAt": "2026-05-07T10:03:00.000Z"
    },
    "createdAt": "2026-05-07T10:00:00.000Z",
    "updatedAt": "2026-05-07T10:00:00.000Z"
  },
  "timestamp": "2026-05-07T10:00:00.000Z",
  "statusCode": 201
}
```

**Error Responses**

| Status | When                                     |
|--------|------------------------------------------|
| 400    | Validation error or category is not a leaf |
| 401    | Unauthorized                             |
| 403    | Category belongs to another user         |
| 404    | Category not found                       |

---

## POST /metric-logs/bulk

Create up to 100 metric log entries in a single request. Mixed category IDs are allowed.

**Request Body**
```json
{
  "entries": [
    {
      "categoryId": 4,
      "title": "Morning run",
      "value": 42,
      "entryDate": "2026-05-07"
    },
    {
      "categoryId": 4,
      "title": "Evening walk",
      "value": 18,
      "entryDate": "2026-05-07"
    },
    {
      "categoryId": 5,
      "title": "Cycling session",
      "value": 60
    }
  ]
}
```

| Field          | Type  | Required | Rules                      |
|----------------|-------|----------|----------------------------|
| entries        | array | yes      | 1–100 items                |
| entries[].categoryId | number | yes | Leaf category owned by user |
| entries[].title | string | yes | max 255 characters        |
| entries[].value | number | yes | integer                   |
| entries[].entryDate | string | no | YYYY-MM-DD; defaults to today |

**Success Response — 201**
```json
{
  "success": true,
  "message": "Metric logs created successfully",
  "data": {
    "created": 3
  },
  "timestamp": "2026-05-07T10:00:00.000Z",
  "statusCode": 201
}
```

**Error Responses**

| Status | When                                           |
|--------|------------------------------------------------|
| 400    | Any entry's category is not a leaf or entries is empty |
| 403    | Any category belongs to another user           |
| 404    | Any category not found                         |

---

## GET /metric-logs

Get all metric logs for the authenticated user, paginated.

**Query Params**

| Param      | Type   | Required | Default | Description                      |
|------------|--------|----------|---------|----------------------------------|
| categoryId | number | no       | —       | Filter to a specific category    |
| from       | string | no       | —       | Start date, YYYY-MM-DD inclusive |
| to         | string | no       | —       | End date, YYYY-MM-DD inclusive   |
| page       | number | no       | 1       | Page number (min 1)              |
| limit      | number | no       | 20      | Items per page (1–100)           |

**Example:** `GET /metric-logs?categoryId=4&from=2026-05-01&to=2026-05-31&page=1&limit=20`

**Success Response — 200**
```json
{
  "success": true,
  "message": "Metric logs retrieved successfully",
  "data": {
    "data": [
      {
        "id": 1,
        "categoryId": 4,
        "title": "Morning run",
        "value": 42,
        "entryDate": "2026-05-07",
        "category": {
          "id": 4,
          "name": "Laptops",
          "parentId": 2,
          "moduleType": "CSR",
          "isSpecial": false,
          "userId": 7,
          "createdAt": "2026-05-07T10:03:00.000Z",
          "updatedAt": "2026-05-07T10:03:00.000Z"
        },
        "createdAt": "2026-05-07T10:00:00.000Z",
        "updatedAt": "2026-05-07T10:00:00.000Z"
      }
    ],
    "page": 1,
    "totalPages": 3,
    "totalItems": 42
  },
  "timestamp": "2026-05-07T10:00:00.000Z",
  "statusCode": 200
}
```

**Error Responses**

| Status | When                      |
|--------|---------------------------|
| 400    | `from` is after `to`     |
| 401    | Unauthorized              |

---

## GET /metric-logs/summary

Get aggregated totals, averages, and counts grouped by category. Use this for charts and dashboard widgets.

**Query Params**

| Param | Type   | Required | Description                       |
|-------|--------|----------|-----------------------------------|
| from  | string | no       | Start date, YYYY-MM-DD inclusive  |
| to    | string | no       | End date, YYYY-MM-DD inclusive    |

**Example:** `GET /metric-logs/summary?from=2026-05-01&to=2026-05-31`

**Success Response — 200**
```json
{
  "success": true,
  "message": "Metric log summary retrieved successfully",
  "data": [
    {
      "categoryId": 4,
      "categoryName": "Laptops",
      "total": 350,
      "average": 43.75,
      "count": 8
    },
    {
      "categoryId": 5,
      "categoryName": "Monitors",
      "total": 120,
      "average": 30.00,
      "count": 4
    }
  ],
  "timestamp": "2026-05-07T10:00:00.000Z",
  "statusCode": 200
}
```

**Error Responses**

| Status | When                  |
|--------|-----------------------|
| 400    | `from` is after `to` |
| 401    | Unauthorized          |

---

## GET /metric-logs/:id

Get a single metric log by ID. The log must belong to the authenticated user.

**Success Response — 200**
```json
{
  "success": true,
  "message": "Metric log retrieved successfully",
  "data": {
    "id": 1,
    "categoryId": 4,
    "title": "Morning run",
    "value": 42,
    "entryDate": "2026-05-07",
    "category": {
      "id": 4,
      "name": "Laptops",
      "parentId": 2,
      "moduleType": "CSR",
      "isSpecial": false,
      "userId": 7,
      "createdAt": "2026-05-07T10:03:00.000Z",
      "updatedAt": "2026-05-07T10:03:00.000Z"
    },
    "createdAt": "2026-05-07T10:00:00.000Z",
    "updatedAt": "2026-05-07T10:00:00.000Z"
  },
  "timestamp": "2026-05-07T10:00:00.000Z",
  "statusCode": 200
}
```

**Error Responses**

| Status | When                              |
|--------|-----------------------------------|
| 401    | Unauthorized                      |
| 403    | Log belongs to a different user   |
| 404    | Log not found                     |

---

## PATCH /metric-logs/:id

Update a metric log entry. The log must belong to the authenticated user.

> `categoryId` cannot be changed.

**Request Body** (all fields optional — send only what changes)
```json
{
  "title": "Evening run",
  "value": 55,
  "entryDate": "2026-05-08"
}
```

| Field     | Type   | Required | Rules                     |
|-----------|--------|----------|---------------------------|
| title     | string | no       | max 255 characters        |
| value     | number | no       | integer                   |
| entryDate | string | no       | YYYY-MM-DD format         |

**Success Response — 200**
```json
{
  "success": true,
  "message": "Metric log updated successfully",
  "data": {
    "id": 1,
    "categoryId": 4,
    "title": "Evening run",
    "value": 55,
    "entryDate": "2026-05-08",
    "category": {
      "id": 4,
      "name": "Laptops",
      "parentId": 2,
      "moduleType": "CSR",
      "isSpecial": false,
      "userId": 7,
      "createdAt": "2026-05-07T10:03:00.000Z",
      "updatedAt": "2026-05-07T10:03:00.000Z"
    },
    "createdAt": "2026-05-07T10:00:00.000Z",
    "updatedAt": "2026-05-07T11:00:00.000Z"
  },
  "timestamp": "2026-05-07T11:00:00.000Z",
  "statusCode": 200
}
```

**Error Responses**

| Status | When                                  |
|--------|---------------------------------------|
| 400    | No updatable fields provided          |
| 401    | Unauthorized                          |
| 403    | Log belongs to a different user       |
| 404    | Log not found                         |

---

## DELETE /metric-logs/:id

Permanently delete a metric log. The log must belong to the authenticated user.

**Success Response — 200**
```json
{
  "success": true,
  "message": "Metric log deleted successfully",
  "data": null,
  "timestamp": "2026-05-07T11:10:00.000Z",
  "statusCode": 200
}
```

**Error Responses**

| Status | When                              |
|--------|-----------------------------------|
| 401    | Unauthorized                      |
| 403    | Log belongs to a different user   |
| 404    | Log not found                     |
