# Dashboard APIs

Base URL: `http://localhost:3000/api/v1`

There is no single `/dashboard` endpoint. A dashboard is composed by calling existing endpoints together. This document shows which calls to make and how to combine the results.

**Headers (all requests)**
```
Authorization: Bearer <accessToken>
```

---

## What a Dashboard Typically Shows

| Widget                          | API Call to Use                                      |
|---------------------------------|------------------------------------------------------|
| Metric totals per category      | `GET /metric-logs/summary`                          |
| Category tree / filter sidebar  | `GET /categories?includeChildren=true`              |
| Recent metric log entries       | `GET /metric-logs?page=1&limit=10`                  |
| Logs for a specific date range  | `GET /metric-logs?from=2026-05-01&to=2026-05-31`    |
| Special/highlighted categories  | `GET /categories/special`                           |
| Log breakdown per leaf category | `GET /metric-logs?categoryId=4`                     |

---

## Call 1 — Summary Totals (main chart data)

**Request**
```
GET /api/v1/metric-logs/summary?from=2026-05-01&to=2026-05-31
Authorization: Bearer <accessToken>
```

**Response**
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
    },
    {
      "categoryId": 6,
      "categoryName": "Cycling",
      "total": 480,
      "average": 60.00,
      "count": 8
    }
  ],
  "timestamp": "2026-05-07T10:00:00.000Z",
  "statusCode": 200
}
```

**How to use:** Render as a bar chart, pie chart, or KPI cards. Each item in `data` is one category's aggregated stats for the date range.

---

## Call 2 — Category Tree (sidebar/filter)

**Request**
```
GET /api/v1/categories?includeChildren=true&moduleType=CSR
Authorization: Bearer <accessToken>
```

**Response**
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
          "children": [
            {
              "id": 4,
              "name": "Laptops",
              "parentId": 2,
              "moduleType": "CSR",
              "isSpecial": false,
              "userId": 7,
              "createdAt": "2026-05-07T10:03:00.000Z",
              "updatedAt": "2026-05-07T10:03:00.000Z",
              "children": []
            }
          ]
        }
      ]
    }
  ],
  "timestamp": "2026-05-07T10:00:00.000Z",
  "statusCode": 200
}
```

**How to use:** Render as a collapsible tree in the sidebar. When user clicks a leaf category, trigger Call 3 filtered by that `categoryId`.

---

## Call 3 — Recent Logs (activity feed / table)

**Request**
```
GET /api/v1/metric-logs?page=1&limit=10
Authorization: Bearer <accessToken>
```

**Response**
```json
{
  "success": true,
  "message": "Metric logs retrieved successfully",
  "data": {
    "data": [
      {
        "id": 5,
        "categoryId": 4,
        "title": "Evening run",
        "value": 55,
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
        "createdAt": "2026-05-07T11:00:00.000Z",
        "updatedAt": "2026-05-07T11:00:00.000Z"
      },
      {
        "id": 4,
        "categoryId": 6,
        "title": "Cycling session",
        "value": 60,
        "entryDate": "2026-05-07",
        "category": {
          "id": 6,
          "name": "Cycling",
          "parentId": 3,
          "moduleType": "CC",
          "isSpecial": true,
          "userId": 7,
          "createdAt": "2026-05-07T10:05:00.000Z",
          "updatedAt": "2026-05-07T10:05:00.000Z"
        },
        "createdAt": "2026-05-07T10:30:00.000Z",
        "updatedAt": "2026-05-07T10:30:00.000Z"
      }
    ],
    "page": 1,
    "totalPages": 5,
    "totalItems": 42
  },
  "timestamp": "2026-05-07T12:00:00.000Z",
  "statusCode": 200
}
```

**Pagination:** Increment `page` to load more. Use `totalPages` to know when to stop. Use `totalItems` for the record count badge.

---

## Call 4 — Logs Filtered by Category and Date Range

**Request**
```
GET /api/v1/metric-logs?categoryId=4&from=2026-05-01&to=2026-05-31&page=1&limit=20
Authorization: Bearer <accessToken>
```

This is Call 3 with filters applied. Response shape is identical. Use when the user selects a category from the sidebar tree (Call 2).

---

## Call 5 — Special Categories Highlight

**Request**
```
GET /api/v1/categories/special
Authorization: Bearer <accessToken>
```

**Response**
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
    },
    {
      "id": 6,
      "name": "Cycling",
      "parentId": 3,
      "moduleType": "CC",
      "isSpecial": true,
      "userId": 7,
      "createdAt": "2026-05-07T10:05:00.000Z",
      "updatedAt": "2026-05-07T10:05:00.000Z"
    }
  ],
  "timestamp": "2026-05-07T12:00:00.000Z",
  "statusCode": 200
}
```

**How to use:** Highlight these categories with a badge or pin them to the top of any list.

---

## Suggested Dashboard Load Sequence

On dashboard page load, fire these three calls in parallel:

```
1. GET /metric-logs/summary?from=<monthStart>&to=<monthEnd>   → charts
2. GET /categories?includeChildren=true                        → sidebar tree
3. GET /metric-logs?page=1&limit=10                           → activity table
```

When user picks a date range:
```
Re-fire:
  GET /metric-logs/summary?from=<from>&to=<to>
  GET /metric-logs?from=<from>&to=<to>&page=1&limit=10
```

When user picks a category from the sidebar:
```
GET /metric-logs?categoryId=<id>&page=1&limit=20
```

---

## Error Handling (All Calls)

All API errors follow this shape:

```json
{
  "success": false,
  "message": "Human-readable error description",
  "statusCode": 401
}
```

| Status | Meaning                                      | Action                              |
|--------|----------------------------------------------|-------------------------------------|
| 400    | Bad request / validation error               | Show field-level error to user      |
| 401    | Token missing, expired, or invalid           | Redirect to login                   |
| 403    | Authenticated but not allowed                | Show "permission denied" message    |
| 404    | Resource does not exist                      | Show "not found" message            |
| 409    | Conflict (e.g. email already exists)         | Show conflict message               |
| 422    | Business rule violation (e.g. moduleType mismatch) | Show specific validation message |
| 500    | Server error                                 | Show generic error, log to console  |
