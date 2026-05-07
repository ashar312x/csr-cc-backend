# Dashboard API — Technical Specification

**Module:** Category Metric Log Dashboard
**Scope:** `apps/api-gateway-app/src/modules/dashboard/`
**Auth:** All endpoints require `GatewayAuthGuard` (user-scoped data)
**Fiscal Year:** Pakistan FY — Jul 1 to Jun 30

---

## Overview

The dashboard exposes three endpoints that power three UI areas:

| UI Area | Endpoint | Description |
|---|---|---|
| Top-row category cards | `GET /dashboard/category-stats` | Per-card stats for each `isSpecial=true` category |
| Beneficiaries comparison chart | `GET /dashboard/comparison` | Current FY vs previous FY per category |
| Overall Impact Summary panel | `GET /dashboard/overall-impact` | Aggregated totals across all special categories |

---

## Shared Query Parameters

All three endpoints accept the same query DTO (`dashboard-query.dto.ts`):

| Parameter | Type | Validation | Example | Description |
|---|---|---|---|---|
| `moduleType` | `string` | `@IsEnum(['CSR', 'CC'])` | `CSR` | Filters categories by module |
| `fiscalYear` | `number` | `@IsInt() @Min(2000)` | `2027` | Trailing year — FY 2026-2027 |

**Fiscal year resolution:**
- `fiscalYear = 2027` → current FY: `2026-07-01` to `2027-06-30`
- Previous FY: one year earlier, same Jul–Jun window

---

## Endpoints

### 1. `GET /dashboard/category-stats`

Returns one stat card per `isSpecial=true` category for the authenticated user.

**Response type:** `CategoryStatDto[]`

```ts
{
  categoryId: number
  categoryName: string
  eventsCount: number           // COUNT of MetricLog rows in currentFY subtree
  beneficiariesHelped: number   // SUM of MetricLog.value in currentFY subtree
  yoyChange: number | null      // % change vs previousFY; null if previousFY total = 0
  yoyDirection: 'up' | 'down' | 'neutral'
}
```

**Logic:**
1. Resolve current and previous FY date ranges via `getFiscalYearRange(fiscalYear)`.
2. Fetch `isSpecial=true` categories for the user filtered by `moduleType` using `CategoryRepository.findSpecial(moduleType)`.
3. For each special category, retrieve all descendant category IDs via `CategoryRepository.findDescendants(id)`.
4. Call `MetricLogRepository.findSubtreeStats(descendantIds, currentStart, currentEnd, previousStart, previousEnd)` to get `{ currentCount, currentTotal, previousCount, previousTotal }`.
5. Compute `yoyChange`:
   - `previousTotal === 0` → `null`
   - Otherwise → `((currentTotal - previousTotal) / previousTotal) * 100`
6. Set `yoyDirection`:
   - `yoyChange > 0` → `'up'`
   - `yoyChange < 0` → `'down'`
   - `yoyChange === 0 || null` → `'neutral'`

---

### 2. `GET /dashboard/comparison`

Returns grouped bar chart data comparing current FY vs previous FY across all special categories.

**Response type:** `ComparisonResponseDto`

```ts
{
  currentFYLabel: string    // e.g. "FY 2026-2027"
  previousFYLabel: string   // e.g. "FY 2025-2026"
  categories: Array<{
    categoryId: number
    categoryName: string
    currentFYTotal: number    // SUM of MetricLog.value in currentFY
    previousFYTotal: number   // SUM of MetricLog.value in previousFY
    yoyChange: number | null  // % change; null if previousFYTotal = 0
  }>
}
```

**Logic:**
1. Same subtree resolution as endpoint 1.
2. Only the `SUM` (`currentTotal`, `previousTotal`) is needed — `COUNT` is not used.
3. Reuse `findSubtreeStats()` and pluck the total fields.
4. Build FY labels: `"FY ${fy - 1}-${fy}"`.

---

### 3. `GET /dashboard/overall-impact`

Returns aggregated totals across all special categories for the Overall Impact Summary panel.

**Response type:** `OverallImpactDto`

```ts
{
  totalEventsConducted: number      // SUM of eventsCount across all special categories in currentFY
  eventsYoyChange: number | null    // null when previousFY events total is 0
  totalBeneficiaries: number        // SUM of beneficiariesHelped across all special categories
  beneficiariesYoyChange: number | null  // null when previousFY beneficiaries total is 0
  categoriesActive: number          // Count of special categories with ≥ 1 MetricLog in currentFY
  yoyImpactGrowth: number | null    // Same value as beneficiariesYoyChange
  yoyDirection: 'up' | 'down' | 'neutral'
}
```

**Logic:**
1. Run the same subtree stats query across all special categories (same as endpoints 1 & 2).
2. Aggregate per-category results:
   - `totalEventsConducted` = sum of all `currentCount` values
   - `totalBeneficiaries` = sum of all `currentTotal` values
   - `categoriesActive` = count of categories where `currentCount >= 1`
3. Compute YoY changes using the same null-guard formula as endpoint 1.

---

## New Repository Method

**File:** `libs/database/src/repositories/metric-log.repository.ts`

```ts
async findSubtreeStats(
  categoryIds: number[],
  currentStart: string,   // 'YYYY-MM-DD'
  currentEnd: string,
  previousStart: string,
  previousEnd: string,
): Promise<{
  currentCount: number;
  currentTotal: number;
  previousCount: number;
  previousTotal: number;
}>
```

**Implementation — single raw query using CASE WHEN:**

```sql
SELECT
  SUM(CASE WHEN entryDate BETWEEN :cs AND :ce THEN value ELSE 0 END) AS currentTotal,
  COUNT(CASE WHEN entryDate BETWEEN :cs AND :ce THEN id END)          AS currentCount,
  SUM(CASE WHEN entryDate BETWEEN :ps AND :pe THEN value ELSE 0 END) AS previousTotal,
  COUNT(CASE WHEN entryDate BETWEEN :ps AND :pe THEN id END)          AS previousCount
FROM metric_log
WHERE categoryId IN (:categoryIds)
  AND entryDate BETWEEN :ps AND :ce   -- union of both ranges
```

> Using a single query with partitioned aggregates avoids two round-trips per category.

---

## Fiscal Year Helper

**Location:** `dashboard.service.ts` (private method)

```ts
private getFiscalYearRange(fy: number): { start: string; end: string } {
  // fy = 2027 → { start: '2026-07-01', end: '2027-06-30' }
  return { start: `${fy - 1}-07-01`, end: `${fy}-06-30` };
}
```

---

## File Manifest

| Action | File |
|---|---|
| **Create** | `apps/api-gateway-app/src/modules/dashboard/dashboard.module.ts` |
| **Create** | `apps/api-gateway-app/src/modules/dashboard/dashboard.controller.ts` |
| **Create** | `apps/api-gateway-app/src/modules/dashboard/dashboard.service.ts` |
| **Create** | `apps/api-gateway-app/src/modules/dashboard/dto/dashboard-query.dto.ts` |
| **Create** | `apps/api-gateway-app/src/modules/dashboard/dto/category-stat.dto.ts` |
| **Create** | `apps/api-gateway-app/src/modules/dashboard/dto/comparison-response.dto.ts` |
| **Create** | `apps/api-gateway-app/src/modules/dashboard/dto/overall-impact.dto.ts` |
| **Modify** | `libs/database/src/repositories/metric-log.repository.ts` — add `findSubtreeStats()` |
| **Modify** | `apps/api-gateway-app/src/app.module.ts` — register `DashboardModule` |

**Reused without changes:**

- `CategoryRepository.findSpecial(moduleType?)` — returns `isSpecial=true` categories
- `CategoryRepository.findDescendants(id)` — returns flat array with `id` field
- `GatewayAuthGuard` — existing auth guard
- `TransformInterceptor` — existing global response wrapper
- `DatabaseModule` — import into `DashboardModule` for repository access (same pattern as `CategoriesModule`)

---

## YoY Calculation Reference

```
yoyChange = previousTotal === 0
  ? null
  : ((currentTotal - previousTotal) / previousTotal) * 100

yoyDirection = yoyChange > 0  ? 'up'
             : yoyChange < 0  ? 'down'
             : 'neutral'         // covers 0 and null
```

When `yoyChange` is `null`, display as `"N/A"` in the UI.

---

## Verification Checklist

- [ ] Seed ≥ 2 special categories with nested leaf nodes and `MetricLog` entries spanning two fiscal years.
- [ ] `GET /dashboard/category-stats?moduleType=CSR&fiscalYear=2027` — verify each card has correct `eventsCount`, `beneficiariesHelped`, and `yoyChange`.
- [ ] `GET /dashboard/comparison?moduleType=CSR&fiscalYear=2027` — verify per-category `currentFYTotal` and `previousFYTotal` match seeded data.
- [ ] `GET /dashboard/overall-impact?moduleType=CSR&fiscalYear=2027` — verify aggregate totals match the sum of all category cards; verify `categoriesActive` count is correct.
- [ ] Edge case: category with **no** `MetricLog` entries → `yoyChange: null`, `eventsCount: 0`.
- [ ] Edge case: category with logs **only in current FY** → `previousFYTotal: 0`, `yoyChange: null`.