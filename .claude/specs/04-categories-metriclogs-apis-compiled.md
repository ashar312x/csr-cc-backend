# API Specification — Categories & Metric Logs

**Project:** NestJS Monorepo — `api-gateway-app`
**Version:** 1.0.0
**Date:** 2026-05-05
**Status:** Awaiting design decision sign-off on Section 4 before implementation planning begins.

---

## 1. Shared Configuration

### Base URL

```
http://localhost:{API_GATEWAY_SERVICE_PORT}/   (default port: 3000)
```

### Auth Header

All endpoints require:

```
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

JWT is validated against `JWT_ACCESS_SECRET`. Decoded payload attached to `req.user`:

```typescript
{ sub: number /* userId */, email: string, role: string }
```

Guard applied: `GatewayAuthGuard` (located at `apps/api-gateway-app/src/modules/auth/guards/jwt-auth.guards.ts`).

### Content-Type

```
Content-Type: application/json
```

### Uniform Success Response Envelope

Every successful response is wrapped by `TransformInterceptor`:

```json
{
  "success": true,
  "message": "I18N_KEY",
  "data": { },
  "timestamp": "2026-05-05T10:00:00.000Z",
  "statusCode": 200
}
```

Controllers return `{ message: 'I18N_KEY', result: data, statusCode: 200 }` — the interceptor wraps it.

### Global Error Schema

```json
{
  "success": false,
  "message": "Human-readable error message",
  "statusCode": 400
}
```

Common HTTP error codes:

| Code | Meaning |
|---|---|
| `400` | Validation failure or bad request |
| `401` | Missing or invalid JWT |
| `403` | Authenticated but not authorized (ownership or role) |
| `404` | Resource not found |
| `422` | Business rule violation (e.g., moduleType mismatch) |

### Shared Pagination Response Shape

The existing `PaginatedResponse<T>` interface (`libs/common/src/interfaces/pagination.interface.ts`) is used for all paginated endpoints:

| Field | Type | Description |
|---|---|---|
| `data` | `T[]` | Array of items for the current page |
| `page` | `number` | Current page (1-indexed) |
| `totalPages` | `number` | `Math.ceil(totalItems / limit)` |
| `totalItems` | `number` | Total matching records |

### Shared Naming Convention

- i18n keys: `SCREAMING_SNAKE_CASE`, defined in `libs/common/src/language/en.ts`
- Route prefixes: `kebab-case` (e.g., `/metric-logs`)
- DTO files: `kebab-case` (e.g., `create-metric-log.dto.ts`)
- Response DTOs live in their module's `dto/` folder, not in `libs/common/src/dto/` (those are shared cross-module DTOs only)

---

## 2. Categories API

### File Structure

| File Path | Purpose |
|---|---|
| `apps/api-gateway-app/src/modules/categories/categories.controller.ts` | Route handlers; all 9 endpoints; applies guards and pipes |
| `apps/api-gateway-app/src/modules/categories/categories.service.ts` | Business logic; orchestrates repository calls; ownership checks |
| `apps/api-gateway-app/src/modules/categories/categories.module.ts` | Module declaration; imports `DatabaseModule`, registers `JwtService`, `ConfigService` |
| `apps/api-gateway-app/src/modules/categories/dto/create-category.dto.ts` | `CreateCategoryDto` |
| `apps/api-gateway-app/src/modules/categories/dto/update-category.dto.ts` | `UpdateCategoryDto` |
| `apps/api-gateway-app/src/modules/categories/dto/toggle-special.dto.ts` | `ToggleSpecialDto` |
| `apps/api-gateway-app/src/modules/categories/dto/category-query.dto.ts` | `CategoryQueryDto` (shared query params) |
| `apps/api-gateway-app/src/modules/categories/dto/category-response.dto.ts` | `CategoryResponseDto` (Swagger response shape) |
| `libs/database/src/repositories/category.repository.ts` | **ADDITIONS ONLY:** `findWithChildren`, `findDirectChildren`, `findDescendants`, `findSpecial` |

---

### DTOs

#### `CreateCategoryDto`

| Field | Type | Required | Validators | Swagger Decorator |
|---|---|---|---|---|
| `name` | `string` | Yes | `@IsString()`, `@IsNotEmpty()`, `@MaxLength(255)` | `@ApiProperty({ example: 'Technical Support', maxLength: 255 })` |
| `parentId` | `number` | No | `@IsOptional()`, `@IsInt()`, `@Min(1)` | `@ApiPropertyOptional({ example: 5, description: 'Parent category ID; omit for root' })` |
| `moduleType` | `ModuleType` enum | Yes | `@IsEnum(ModuleType)` | `@ApiProperty({ enum: ModuleType, example: ModuleType.CSR })` |
| `isSpecial` | `boolean` | No | `@IsOptional()`, `@IsBoolean()` | `@ApiPropertyOptional({ example: false, default: false })` |

> `userId` is **never** accepted in the body — always assigned from `req.user.sub` in the service.

#### `UpdateCategoryDto` (all optional — PATCH semantics)

| Field | Type | Required | Validators | Swagger Decorator |
|---|---|---|---|---|
| `name` | `string` | No | `@IsOptional()`, `@IsString()`, `@IsNotEmpty()`, `@MaxLength(255)` | `@ApiPropertyOptional({ example: 'Billing Support' })` |
| `isSpecial` | `boolean` | No | `@IsOptional()`, `@IsBoolean()` | `@ApiPropertyOptional({ example: true })` |
| `moduleType` | `ModuleType` enum | No | `@IsOptional()`, `@IsEnum(ModuleType)` | `@ApiPropertyOptional({ enum: ModuleType })` |

> `parentId` is **explicitly excluded**. See Design Decision #C-3.

#### `ToggleSpecialDto`

| Field | Type | Required | Validators | Swagger Decorator |
|---|---|---|---|---|
| `isSpecial` | `boolean` | Yes | `@IsBoolean()` | `@ApiProperty({ example: true, description: 'New isSpecial value' })` |

#### `CategoryQueryDto`

| Field | Type | Required | Validators | Swagger Decorator |
|---|---|---|---|---|
| `includeChildren` | `boolean` | No | `@IsOptional()`, `@IsBoolean()`, `@Transform(({ value }) => value === 'true')` | `@ApiPropertyOptional({ example: true })` |
| `moduleType` | `ModuleType` enum | No | `@IsOptional()`, `@IsEnum(ModuleType)` | `@ApiPropertyOptional({ enum: ModuleType })` |

#### `CategoryResponseDto`

| Field | Type | Always Present | Description |
|---|---|---|---|
| `id` | `number` | Yes | Primary key |
| `name` | `string` | Yes | Category name |
| `parentId` | `number \| null` | Yes | Null for root categories |
| `moduleType` | `ModuleType` | Yes | `'CSR'` or `'CC'` |
| `isSpecial` | `boolean` | Yes | Special flag |
| `userId` | `number` | Yes | Owner user ID |
| `createdAt` | `string` | Yes | ISO 8601 timestamp |
| `updatedAt` | `string` | Yes | ISO 8601 timestamp |
| `children` | `CategoryResponseDto[]` | No | Present when `includeChildren=true` or on tree endpoints |
| `depth` | `number` | No | Present on `/descendants` flat-array response only |

---

### Controller Route Order

```
CRITICAL: Static routes must be declared before parameterized routes.
Register GET /categories/special BEFORE GET /categories/:id.
```

---

### Endpoints

#### 1. POST /categories — Create a Category

**Auth:** `GatewayAuthGuard`

**Request Body:** `CreateCategoryDto`

| Field | Type | Required | Validation |
|---|---|---|---|
| `name` | `string` | Yes | Non-empty, max 255 chars |
| `parentId` | `number` | No | Positive integer; service validates existence |
| `moduleType` | `'CSR' \| 'CC'` | Yes | Valid `ModuleType` enum |
| `isSpecial` | `boolean` | No | Defaults to `false` |

**Response:** `201 Created` — `CategoryResponseDto`

| Code | Meaning |
|---|---|
| `201` | Category created |
| `400` | Validation failure |
| `401` | Invalid JWT |
| `404` | `parentId` not found |
| `422` | `moduleType` mismatch with parent (see Design Decision #C-1) |

```typescript
@ApiTags('Categories')
@ApiBearerAuth()
@ApiOperation({ summary: 'Create a new category' })
@ApiBody({ type: CreateCategoryDto })
@ApiResponse({ status: 201, description: 'Category created', type: CategoryResponseDto })
@ApiResponse({ status: 400, description: 'Validation error' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 404, description: 'Parent category not found' })
@ApiResponse({ status: 422, description: 'moduleType mismatch with parent' })
@UseGuards(GatewayAuthGuard)
@Post()
async createCategory(
  @Body() dto: CreateCategoryDto,
  @Req() req: IRequest,
): Promise<{ message: string; result: CategoryResponseDto; statusCode: number }> {
  const result = await this.categoriesService.create(dto, req.user.sub);
  return { message: 'CATEGORY_CREATED', result, statusCode: 201 };
}
```

---

#### 2. GET /categories — Fetch All Root Categories

**Auth:** `GatewayAuthGuard`

**Query Params:**

| Param | Type | Required | Description |
|---|---|---|---|
| `includeChildren` | `boolean` | No | Recursively load full nested tree |
| `moduleType` | `'CSR' \| 'CC'` | No | Filter by module type |

**Response:** `200 OK` — `CategoryResponseDto[]`

| Code | Meaning |
|---|---|
| `200` | Success (empty array if none) |
| `400` | Invalid query param |
| `401` | Invalid JWT |

```typescript
@ApiTags('Categories')
@ApiBearerAuth()
@ApiOperation({ summary: 'Get all root categories (parentId IS NULL)' })
@ApiQuery({ name: 'includeChildren', required: false, type: Boolean })
@ApiQuery({ name: 'moduleType', required: false, enum: ModuleType })
@ApiResponse({ status: 200, description: 'Root categories returned', type: [CategoryResponseDto] })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@UseGuards(GatewayAuthGuard)
@Get()
async findAllRoots(
  @Query() query: CategoryQueryDto,
): Promise<{ message: string; result: CategoryResponseDto[]; statusCode: number }> {
  const result = await this.categoriesService.findAllRoots(query);
  return { message: 'CATEGORIES_FETCHED', result, statusCode: 200 };
}
```

---

#### 9. GET /categories/special — Fetch All Special Categories

> **Declared FIRST in the controller file (before `:id` routes) to prevent Express routing conflict.**

**Auth:** `GatewayAuthGuard`

**Query Params:**

| Param | Type | Required | Description |
|---|---|---|---|
| `moduleType` | `'CSR' \| 'CC'` | No | Filter special categories |

**Response:** `200 OK` — `CategoryResponseDto[]` where `isSpecial = true`

| Code | Meaning |
|---|---|
| `200` | Success |
| `400` | Invalid `moduleType` |
| `401` | Invalid JWT |

```typescript
@ApiTags('Categories')
@ApiBearerAuth()
@ApiOperation({ summary: 'Get all categories where isSpecial=true' })
@ApiQuery({ name: 'moduleType', required: false, enum: ModuleType })
@ApiResponse({ status: 200, description: 'Special categories returned', type: [CategoryResponseDto] })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@UseGuards(GatewayAuthGuard)
@Get('special') // MUST be above @Get(':id')
async findSpecial(
  @Query('moduleType') moduleType?: ModuleType,
): Promise<{ message: string; result: CategoryResponseDto[]; statusCode: number }> {
  const result = await this.categoriesService.findSpecial(moduleType);
  return { message: 'SPECIAL_CATEGORIES_FETCHED', result, statusCode: 200 };
}
```

---

#### 3. GET /categories/:id — Fetch Single Category

**Auth:** `GatewayAuthGuard`

**Path Params:** `id: number`

**Query Params:**

| Param | Type | Required | Description |
|---|---|---|---|
| `includeChildren` | `boolean` | No | Load full subtree from this node (unlimited depth) |

**Response:** `200 OK` — `CategoryResponseDto`

| Code | Meaning |
|---|---|
| `200` | Found |
| `400` | Invalid `id` |
| `401` | Invalid JWT |
| `404` | Not found |

```typescript
@ApiTags('Categories')
@ApiBearerAuth()
@ApiOperation({ summary: 'Get a single category by ID' })
@ApiParam({ name: 'id', type: Number })
@ApiQuery({ name: 'includeChildren', required: false, type: Boolean })
@ApiResponse({ status: 200, description: 'Category returned', type: CategoryResponseDto })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 404, description: 'Category not found' })
@UseGuards(GatewayAuthGuard)
@Get(':id')
async findOne(
  @Param('id', ParseIntPipe) id: number,
  @Query() query: Pick<CategoryQueryDto, 'includeChildren'>,
): Promise<{ message: string; result: CategoryResponseDto; statusCode: number }> {
  const result = await this.categoriesService.findOne(id, query.includeChildren);
  return { message: 'CATEGORY_FETCHED', result, statusCode: 200 };
}
```

---

#### 4. GET /categories/:id/children — Direct Children (Depth 1)

**Auth:** `GatewayAuthGuard`

**Path Params:** `id: number`

**Response:** `200 OK` — `CategoryResponseDto[]` (immediate children only)

| Code | Meaning |
|---|---|
| `200` | Children returned (empty array if leaf) |
| `401` | Invalid JWT |
| `404` | Parent not found |

```typescript
@ApiTags('Categories')
@ApiBearerAuth()
@ApiOperation({ summary: 'Get direct children of a category (depth 1 only)' })
@ApiParam({ name: 'id', type: Number })
@ApiResponse({ status: 200, description: 'Direct children returned', type: [CategoryResponseDto] })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 404, description: 'Parent category not found' })
@UseGuards(GatewayAuthGuard)
@Get(':id/children')
async findChildren(
  @Param('id', ParseIntPipe) id: number,
): Promise<{ message: string; result: CategoryResponseDto[]; statusCode: number }> {
  const result = await this.categoriesService.findChildren(id);
  return { message: 'CATEGORY_CHILDREN_FETCHED', result, statusCode: 200 };
}
```

---

#### 5. GET /categories/:id/descendants — All Descendants (Recursive)

**Auth:** `GatewayAuthGuard`

**Path Params:** `id: number`

**Response:** `200 OK` — flat `CategoryResponseDto[]` each with `depth` field (Design Decision #C-2 resolved: flat array preferred)

| Code | Meaning |
|---|---|
| `200` | Descendants returned (empty if leaf) |
| `401` | Invalid JWT |
| `404` | Ancestor not found |

```typescript
@ApiTags('Categories')
@ApiBearerAuth()
@ApiOperation({ summary: 'Get all descendants as a flat array with depth field' })
@ApiParam({ name: 'id', type: Number })
@ApiResponse({ status: 200, description: 'Flat descendant list with depth', type: [CategoryResponseDto] })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 404, description: 'Ancestor category not found' })
@UseGuards(GatewayAuthGuard)
@Get(':id/descendants')
async findDescendants(
  @Param('id', ParseIntPipe) id: number,
): Promise<{ message: string; result: CategoryResponseDto[]; statusCode: number }> {
  const result = await this.categoriesService.findDescendants(id);
  return { message: 'CATEGORY_DESCENDANTS_FETCHED', result, statusCode: 200 };
}
```

---

#### 6. PATCH /categories/:id — Update Category

**Auth:** `GatewayAuthGuard` + inline ownership check

**Ownership check (in service):**
1. Fetch category. Throw `NotFoundException` if missing.
2. If `req.user.role !== 'admin'` AND `category.userId !== req.user.sub` → throw `ForbiddenException('CATEGORY_UPDATE_FORBIDDEN')`.

**Request Body:** `UpdateCategoryDto`

| Field | Type | Required | Validation |
|---|---|---|---|
| `name` | `string` | No | Non-empty, max 255 |
| `isSpecial` | `boolean` | No | Boolean |
| `moduleType` | `'CSR' \| 'CC'` | No | Valid enum |

**Response:** `200 OK` — `CategoryResponseDto` (updated record)

| Code | Meaning |
|---|---|
| `200` | Updated |
| `400` | Validation failure or forbidden field (e.g. `parentId` in body) |
| `401` | Invalid JWT |
| `403` | Not owner or admin |
| `404` | Not found |

```typescript
@ApiTags('Categories')
@ApiBearerAuth()
@ApiOperation({ summary: 'Update category name, isSpecial, or moduleType (owner or admin)' })
@ApiParam({ name: 'id', type: Number })
@ApiBody({ type: UpdateCategoryDto })
@ApiResponse({ status: 200, description: 'Category updated', type: CategoryResponseDto })
@ApiResponse({ status: 400, description: 'Validation error or forbidden field' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Not owner or admin' })
@ApiResponse({ status: 404, description: 'Category not found' })
@UseGuards(GatewayAuthGuard)
@Patch(':id')
async updateCategory(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateCategoryDto,
  @Req() req: IRequest,
): Promise<{ message: string; result: CategoryResponseDto; statusCode: number }> {
  const result = await this.categoriesService.update(id, dto, req.user);
  return { message: 'CATEGORY_UPDATED', result, statusCode: 200 };
}
```

---

#### 7. DELETE /categories/:id — Delete Category

**Auth:** `GatewayAuthGuard` + inline ownership check (same as PATCH)

**Query Params:**

| Param | Type | Required | Description |
|---|---|---|---|
| `force` | `boolean` | No | Must be `true` to cascade-delete a category with children |

**Service logic:**
1. Fetch category + count direct children.
2. If children exist AND `force !== true` → throw `BadRequestException('CATEGORY_HAS_CHILDREN')`.
3. If `force === true` → proceed; DB `onDelete: 'CASCADE'` handles subtree.

**Response:** `200 OK` — `data: null`

| Code | Meaning |
|---|---|
| `200` | Deleted (and descendants if `force=true`) |
| `400` | Has children but `force=true` not passed |
| `401` | Invalid JWT |
| `403` | Not owner or admin |
| `404` | Not found |

```typescript
@ApiTags('Categories')
@ApiBearerAuth()
@ApiOperation({ summary: 'Delete a category; pass ?force=true to cascade-delete subtree' })
@ApiParam({ name: 'id', type: Number })
@ApiQuery({ name: 'force', required: false, type: Boolean })
@ApiResponse({ status: 200, description: 'Category deleted' })
@ApiResponse({ status: 400, description: 'Category has children — pass force=true' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Not owner or admin' })
@ApiResponse({ status: 404, description: 'Category not found' })
@UseGuards(GatewayAuthGuard)
@Delete(':id')
async deleteCategory(
  @Param('id', ParseIntPipe) id: number,
  @Query('force', new DefaultValuePipe(false), ParseBoolPipe) force: boolean,
  @Req() req: IRequest,
): Promise<{ message: string; result: null; statusCode: number }> {
  await this.categoriesService.remove(id, force, req.user);
  return { message: 'CATEGORY_DELETED', result: null, statusCode: 200 };
}
```

---

#### 8. PATCH /categories/:id/special — Toggle isSpecial Flag

**Auth:** `GatewayAuthGuard` + inline ownership check

**Request Body:** `ToggleSpecialDto`

| Field | Type | Required | Validation |
|---|---|---|---|
| `isSpecial` | `boolean` | Yes | Explicit boolean (no implicit toggle) |

**Response:** `200 OK` — `CategoryResponseDto` (updated record)

| Code | Meaning |
|---|---|
| `200` | `isSpecial` updated |
| `400` | Validation failure |
| `401` | Invalid JWT |
| `403` | Not owner or admin |
| `404` | Not found |

```typescript
@ApiTags('Categories')
@ApiBearerAuth()
@ApiOperation({ summary: 'Set isSpecial flag (dedicated endpoint for audit intent)' })
@ApiParam({ name: 'id', type: Number })
@ApiBody({ type: ToggleSpecialDto })
@ApiResponse({ status: 200, description: 'isSpecial updated', type: CategoryResponseDto })
@ApiResponse({ status: 400, description: 'Validation error' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Not owner or admin' })
@ApiResponse({ status: 404, description: 'Category not found' })
@UseGuards(GatewayAuthGuard)
@Patch(':id/special')
async toggleSpecial(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: ToggleSpecialDto,
  @Req() req: IRequest,
): Promise<{ message: string; result: CategoryResponseDto; statusCode: number }> {
  const result = await this.categoriesService.toggleSpecial(id, dto.isSpecial, req.user);
  return { message: 'CATEGORY_SPECIAL_UPDATED', result, statusCode: 200 };
}
```

---

### Self-Join / Recursive Tree Strategy

**Recommendation: Recursive Sequelize calls (BFS loop in service layer)**

| Factor | MySQL CTE (`sequelize.query()`) | Recursive Sequelize (BFS) |
|---|---|---|
| Query count | 1 per traversal | 1 per depth level |
| Type safety | None — raw SQL | Full TypeScript + model hydration |
| Existing pattern | Not used in codebase | Consistent with `findTrees()` |
| MySQL version | Requires 8.0+ (confirmed) | No dependency |

Reconsider CTE if tree depth routinely exceeds 5–6 levels with tens of thousands of categories.

**New repository method signatures:**

```typescript
// libs/database/src/repositories/category.repository.ts — ADDITIONS ONLY

async findWithChildren(id: number): Promise<Category | null> {
  return this.categoryModel.findOne({
    where: { id },
    include: [{ model: Category, as: 'children', required: false }],
  });
}

async findDirectChildren(parentId: number): Promise<Category[]> {
  return this.categoryModel.findAll({ where: { parentId } });
}

async findDescendants(id: number): Promise<Array<Category & { depth: number }>> {
  const result: Array<Category & { depth: number }> = [];
  let frontier: number[] = [id];
  let depth = 0;
  while (frontier.length > 0) {
    depth += 1;
    const children = await this.categoryModel.findAll({ where: { parentId: frontier } });
    if (children.length === 0) break;
    children.forEach(child => result.push(Object.assign(child, { depth })));
    frontier = children.map(c => c.id);
  }
  return result;
}

async findSpecial(moduleType?: ModuleType): Promise<Category[]> {
  const where: WhereOptions = { isSpecial: true };
  if (moduleType) where['moduleType'] = moduleType;
  return this.categoryModel.findAll({ where });
}
```

---

### isSpecial Business Rules

**Can a child be `isSpecial` if parent is not?** → **Yes** (see Design Decision #C-6). `isSpecial` is node-local, not inherited.

**Does toggling a parent's `isSpecial` cascade to children?** → **No** (see Design Decision #C-7). Each node is independent. A future `PATCH /categories/:id/special/cascade` endpoint should handle bulk operations explicitly.

---

### i18n Keys for Categories

| Key | Suggested Message |
|---|---|
| `CATEGORY_CREATED` | `'Category created successfully'` |
| `CATEGORIES_FETCHED` | `'Categories retrieved successfully'` |
| `CATEGORY_FETCHED` | `'Category retrieved successfully'` |
| `CATEGORY_CHILDREN_FETCHED` | `'Category children retrieved successfully'` |
| `CATEGORY_DESCENDANTS_FETCHED` | `'Category descendants retrieved successfully'` |
| `CATEGORY_UPDATED` | `'Category updated successfully'` |
| `CATEGORY_SPECIAL_UPDATED` | `'Category special status updated successfully'` |
| `CATEGORY_DELETED` | `'Category deleted successfully'` |
| `SPECIAL_CATEGORIES_FETCHED` | `'Special categories retrieved successfully'` |
| `CATEGORY_NOT_FOUND` | `'Category not found'` |
| `CATEGORY_UPDATE_FORBIDDEN` | `'You do not have permission to update this category'` |
| `CATEGORY_DELETE_FORBIDDEN` | `'You do not have permission to delete this category'` |
| `CATEGORY_HAS_CHILDREN` | `'Category has children. Pass force=true to cascade delete'` |

---

## 3. Metric Logs API

### File Structure

| File Path | Purpose |
|---|---|
| `apps/api-gateway-app/src/modules/metric-logs/metric-logs.controller.ts` | Route handlers, decorators, guard application |
| `apps/api-gateway-app/src/modules/metric-logs/metric-logs.service.ts` | Business logic, ownership verification, orchestration |
| `apps/api-gateway-app/src/modules/metric-logs/metric-logs.module.ts` | Module declaration; imports `DatabaseModule`, `JwtModule`, `ConfigModule` |
| `apps/api-gateway-app/src/modules/metric-logs/dto/create-metric-log.dto.ts` | `CreateMetricLogDto` |
| `apps/api-gateway-app/src/modules/metric-logs/dto/create-bulk-metric-log.dto.ts` | `CreateBulkMetricLogDto` |
| `apps/api-gateway-app/src/modules/metric-logs/dto/update-metric-log.dto.ts` | `UpdateMetricLogDto` |
| `apps/api-gateway-app/src/modules/metric-logs/dto/metric-log-query.dto.ts` | `MetricLogQueryDto` |
| `apps/api-gateway-app/src/modules/metric-logs/dto/metric-log-response.dto.ts` | `MetricLogResponseDto`, `MetricLogSummaryDto` |
| `libs/database/src/repositories/metric-log.repository.ts` | **ADDITIONS ONLY** — `findAllForUser`, `getSummary` |

---

### Domain Constraints

- `MetricLog` has **no `userId` column**. Ownership is established via `MetricLog → Category.userId`. Every ownership check requires this join.
- Logs may only be created on **leaf categories** (categories with no children). `saveMetric()` in the repository enforces this.
- `categoryId` is **immutable** after creation.
- `entryDate` is stored as `'YYYY-MM-DD'` (`DATEONLY`).

---

### DTOs

#### `CreateMetricLogDto`

| Field | Type | Required | Validators | Swagger Decorator |
|---|---|---|---|---|
| `categoryId` | `number` | Yes | `@IsInt()`, `@IsPositive()` | `@ApiProperty({ example: 3, description: 'ID of a leaf category owned by the authenticated user' })` |
| `title` | `string` | Yes | `@IsString()`, `@IsNotEmpty()`, `@MaxLength(255)` | `@ApiProperty({ example: 'Morning run', maxLength: 255 })` |
| `value` | `number` | Yes | `@IsInt()` | `@ApiProperty({ example: 42 })` |
| `entryDate` | `string` | No | `@IsOptional()`, `@IsDateString()`, `@Matches(/^\d{4}-\d{2}-\d{2}$/)` | `@ApiPropertyOptional({ example: '2026-05-05', description: 'ISO 8601 YYYY-MM-DD; defaults to today if omitted' })` |

#### `CreateBulkMetricLogDto`

| Field | Type | Required | Validators | Swagger Decorator |
|---|---|---|---|---|
| `entries` | `CreateMetricLogDto[]` | Yes | `@IsArray()`, `@ValidateNested({ each: true })`, `@ArrayMinSize(1)`, `@ArrayMaxSize(100)`, `@Type(() => CreateMetricLogDto)` | `@ApiProperty({ type: [CreateMetricLogDto] })` |

#### `UpdateMetricLogDto` (all optional — PATCH semantics)

| Field | Type | Required | Validators | Swagger Decorator |
|---|---|---|---|---|
| `title` | `string` | No | `@IsOptional()`, `@IsString()`, `@IsNotEmpty()`, `@MaxLength(255)` | `@ApiPropertyOptional({ example: 'Evening walk' })` |
| `value` | `number` | No | `@IsOptional()`, `@IsInt()` | `@ApiPropertyOptional({ example: 7 })` |
| `entryDate` | `string` | No | `@IsOptional()`, `@IsDateString()`, `@Matches(/^\d{4}-\d{2}-\d{2}$/)` | `@ApiPropertyOptional({ example: '2026-05-04' })` |

> `categoryId` absent from this DTO. Global `ValidationPipe` (`forbidNonWhitelisted: true`) rejects it if sent.

#### `MetricLogQueryDto`

| Field | Type | Required | Validators | Swagger Decorator |
|---|---|---|---|---|
| `categoryId` | `number` | No | `@IsOptional()`, `@Type(() => Number)`, `@IsInt()`, `@IsPositive()` | `@ApiPropertyOptional({ example: 3 })` |
| `from` | `string` | No | `@IsOptional()`, `@IsDateString()`, `@Matches(/^\d{4}-\d{2}-\d{2}$/)` | `@ApiPropertyOptional({ example: '2026-01-01' })` |
| `to` | `string` | No | `@IsOptional()`, `@IsDateString()`, `@Matches(/^\d{4}-\d{2}-\d{2}$/)` | `@ApiPropertyOptional({ example: '2026-12-31' })` |
| `page` | `number` | No | `@IsOptional()`, `@Type(() => Number)`, `@IsInt()`, `@Min(1)` | `@ApiPropertyOptional({ example: 1, default: 1 })` |
| `limit` | `number` | No | `@IsOptional()`, `@Type(() => Number)`, `@IsInt()`, `@Min(1)`, `@Max(100)` | `@ApiPropertyOptional({ example: 20, default: 20 })` |

Date range: `from` and `to` are **inclusive**. `from > to` throws `400`. Missing bound = open-ended.

#### `MetricLogResponseDto`

| Field | Type | Description | Swagger Decorator |
|---|---|---|---|
| `id` | `number` | Primary key | `@ApiProperty({ example: 1 })` |
| `categoryId` | `number` | FK to Category | `@ApiProperty({ example: 3 })` |
| `title` | `string` | Entry title | `@ApiProperty({ example: 'Morning run' })` |
| `value` | `number` | Integer value | `@ApiProperty({ example: 42 })` |
| `entryDate` | `string` | YYYY-MM-DD | `@ApiProperty({ example: '2026-05-05' })` |
| `category` | `CategoryResponseDto` | Nested category (includes `userId`) | `@ApiProperty({ type: () => CategoryResponseDto })` |
| `createdAt` | `string` | ISO timestamp | `@ApiProperty()` |
| `updatedAt` | `string` | ISO timestamp | `@ApiProperty()` |

#### `MetricLogSummaryDto`

| Field | Type | Description | Swagger Decorator |
|---|---|---|---|
| `categoryId` | `number` | Category ID | `@ApiProperty({ example: 3 })` |
| `categoryName` | `string` | Category name (from JOIN) | `@ApiProperty({ example: 'Running' })` |
| `total` | `number` | SUM of `value` | `@ApiProperty({ example: 350 })` |
| `average` | `number` | AVG of `value` (2 decimal places) | `@ApiProperty({ example: 43.75 })` |
| `count` | `number` | COUNT of entries | `@ApiProperty({ example: 8 })` |

---

### Controller Route Order

```
CRITICAL: Declare GET /metric-logs/summary BEFORE GET /metric-logs/:id.
```

Full controller declaration order:
1. `POST /metric-logs`
2. `POST /metric-logs/bulk`
3. `GET /metric-logs`
4. `GET /metric-logs/summary` ← must precede `:id`
5. `GET /metric-logs/:id`
6. `PATCH /metric-logs/:id`
7. `DELETE /metric-logs/:id`

---

### Endpoints

#### 1. POST /metric-logs — Create Single Log Entry

**Auth:** `GatewayAuthGuard`

**Request Body:** `CreateMetricLogDto`

**Service logic:** Resolve today's date if `entryDate` omitted → verify category exists and `category.userId === req.user.sub` → call `metricLogRepository.saveMetric(dto)` (enforces leaf constraint).

**Response:** `201 Created` — `MetricLogResponseDto`

| Code | Meaning |
|---|---|
| `201` | Created |
| `400` | Validation error or category is not a leaf |
| `401` | Invalid JWT |
| `403` | Category does not belong to user |
| `404` | Category not found |

```typescript
@Post()
@ApiTags('Metric Logs')
@ApiBearerAuth()
@ApiOperation({ summary: 'Create a single metric log entry on a leaf category' })
@ApiBody({ type: CreateMetricLogDto })
@ApiResponse({ status: 201, description: 'Metric log created', type: MetricLogResponseDto })
@ApiResponse({ status: 400, description: 'Validation error or not a leaf category' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Category not owned by user' })
@ApiResponse({ status: 404, description: 'Category not found' })
@HttpCode(201)
async create(
  @Body() dto: CreateMetricLogDto,
  @Req() req: RequestWithUser,
): Promise<{ message: string; result: MetricLogResponseDto; statusCode: number }> {
  const result = await this.metricLogsService.create(dto, req.user.sub);
  return { message: 'METRIC_LOG_CREATED', result, statusCode: 201 };
}
```

---

#### 2. POST /metric-logs/bulk — Bulk Create

**Auth:** `GatewayAuthGuard`

**Request Body:** `CreateBulkMetricLogDto`

**Service logic:** Resolve `entryDate` for each entry → collect distinct `categoryId`s → validate each (existence, ownership, leaf status) → call `metricLogRepository.bulkCreate()`. All-or-nothing transaction.

**Response:** `201 Created` — `{ created: number }`

| Code | Meaning |
|---|---|
| `201` | All entries created |
| `400` | Validation failure, non-leaf category, or empty array |
| `401` | Invalid JWT |
| `403` | Any category not owned by user |
| `404` | Any category not found |

```typescript
@Post('bulk')
@ApiTags('Metric Logs')
@ApiBearerAuth()
@ApiOperation({ summary: 'Bulk-create metric log entries (max 100 per request)' })
@ApiBody({ type: CreateBulkMetricLogDto })
@ApiResponse({ status: 201, description: 'All entries created', schema: { example: { created: 5 } } })
@ApiResponse({ status: 400, description: 'Validation error, non-leaf category, or empty entries' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'One or more categories not owned by user' })
@ApiResponse({ status: 404, description: 'One or more categories not found' })
@HttpCode(201)
async bulkCreate(
  @Body() dto: CreateBulkMetricLogDto,
  @Req() req: RequestWithUser,
): Promise<{ message: string; result: { created: number }; statusCode: number }> {
  const result = await this.metricLogsService.bulkCreate(dto, req.user.sub);
  return { message: 'METRIC_LOG_BULK_CREATED', result, statusCode: 201 };
}
```

---

#### 3. GET /metric-logs — List All Logs (Paginated)

**Auth:** `GatewayAuthGuard`

**Query Params:** `MetricLogQueryDto`

| Param | Type | Required | Description |
|---|---|---|---|
| `categoryId` | `number` | No | Filter by category |
| `from` | `string` | No | Start date (inclusive, YYYY-MM-DD) |
| `to` | `string` | No | End date (inclusive, YYYY-MM-DD) |
| `page` | `number` | No | Default: 1 |
| `limit` | `number` | No | Default: 20, max: 100 |

**Response:** `200 OK` — `PaginatedResponse<MetricLogResponseDto>`

| Code | Meaning |
|---|---|
| `200` | Success (empty `data` array if none) |
| `400` | Invalid query params or `from > to` |
| `401` | Invalid JWT |

```typescript
@Get()
@ApiTags('Metric Logs')
@ApiBearerAuth()
@ApiOperation({ summary: 'List all metric logs for the authenticated user (paginated)' })
@ApiQuery({ name: 'categoryId', required: false, type: Number })
@ApiQuery({ name: 'from', required: false, type: String, example: '2026-01-01' })
@ApiQuery({ name: 'to', required: false, type: String, example: '2026-12-31' })
@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
@ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
@ApiResponse({ status: 200, description: 'Paginated list of metric logs' })
@ApiResponse({ status: 400, description: 'Invalid query parameters' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
async findAll(
  @Query() query: MetricLogQueryDto,
  @Req() req: RequestWithUser,
): Promise<{ message: string; result: PaginatedResponse<MetricLogResponseDto>; statusCode: number }> {
  const result = await this.metricLogsService.findAll(query, req.user.sub);
  return { message: 'METRIC_LOG_LIST', result, statusCode: 200 };
}
```

---

#### 4. GET /metric-logs/summary — Aggregate by Category

> **Declared BEFORE `GET /metric-logs/:id` in the controller.**

**Auth:** `GatewayAuthGuard`

**Query Params:**

| Param | Type | Required | Description |
|---|---|---|---|
| `from` | `string` | No | Start date (YYYY-MM-DD) |
| `to` | `string` | No | End date (YYYY-MM-DD) |

**Response:** `200 OK` — `MetricLogSummaryDto[]`

| Code | Meaning |
|---|---|
| `200` | Summary returned (empty array if no logs) |
| `400` | Invalid date params or `from > to` |
| `401` | Invalid JWT |

```typescript
@Get('summary') // MUST precede @Get(':id')
@ApiTags('Metric Logs')
@ApiBearerAuth()
@ApiOperation({ summary: 'Get aggregated totals and averages grouped by category' })
@ApiQuery({ name: 'from', required: false, type: String, example: '2026-01-01' })
@ApiQuery({ name: 'to', required: false, type: String, example: '2026-12-31' })
@ApiResponse({ status: 200, description: 'Summary per category', type: [MetricLogSummaryDto] })
@ApiResponse({ status: 400, description: 'Invalid date parameters' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
async getSummary(
  @Query('from') from: string | undefined,
  @Query('to') to: string | undefined,
  @Req() req: RequestWithUser,
): Promise<{ message: string; result: MetricLogSummaryDto[]; statusCode: number }> {
  const result = await this.metricLogsService.getSummary(req.user.sub, from, to);
  return { message: 'METRIC_LOG_SUMMARY', result, statusCode: 200 };
}
```

---

#### 5. GET /metric-logs/:id — Single Log Entry

**Auth:** `GatewayAuthGuard`

**Path Params:** `id: number`

**Response:** `200 OK` — `MetricLogResponseDto`

| Code | Meaning |
|---|---|
| `200` | Found and owned by user |
| `401` | Invalid JWT |
| `403` | Entry exists but owned by another user |
| `404` | Not found |

```typescript
@Get(':id')
@ApiTags('Metric Logs')
@ApiBearerAuth()
@ApiOperation({ summary: 'Get a single metric log entry by ID' })
@ApiParam({ name: 'id', type: Number })
@ApiResponse({ status: 200, description: 'Metric log found', type: MetricLogResponseDto })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Entry does not belong to user' })
@ApiResponse({ status: 404, description: 'Entry not found' })
async findOne(
  @Param('id', ParseIntPipe) id: number,
  @Req() req: RequestWithUser,
): Promise<{ message: string; result: MetricLogResponseDto; statusCode: number }> {
  const result = await this.metricLogsService.findOne(id, req.user.sub);
  return { message: 'METRIC_LOG_DETAIL', result, statusCode: 200 };
}
```

---

#### 6. PATCH /metric-logs/:id — Update Log Entry

**Auth:** `GatewayAuthGuard`

**Request Body:** `UpdateMetricLogDto` (at least one field required; enforced in service)

**Response:** `200 OK` — `MetricLogResponseDto` (re-fetched after update)

| Code | Meaning |
|---|---|
| `200` | Updated |
| `400` | No updatable fields, or `categoryId` sent |
| `401` | Invalid JWT |
| `403` | Entry not owned by user |
| `404` | Not found |

```typescript
@Patch(':id')
@ApiTags('Metric Logs')
@ApiBearerAuth()
@ApiOperation({ summary: 'Update a metric log entry (categoryId is immutable)' })
@ApiParam({ name: 'id', type: Number })
@ApiBody({ type: UpdateMetricLogDto })
@ApiResponse({ status: 200, description: 'Metric log updated', type: MetricLogResponseDto })
@ApiResponse({ status: 400, description: 'No updatable fields provided' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Entry does not belong to user' })
@ApiResponse({ status: 404, description: 'Entry not found' })
async update(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateMetricLogDto,
  @Req() req: RequestWithUser,
): Promise<{ message: string; result: MetricLogResponseDto; statusCode: number }> {
  const result = await this.metricLogsService.update(id, dto, req.user.sub);
  return { message: 'METRIC_LOG_UPDATED', result, statusCode: 200 };
}
```

---

#### 7. DELETE /metric-logs/:id — Hard Delete

**Auth:** `GatewayAuthGuard`

**Response:** `200 OK` — `data: null` (200 not 204 to preserve `TransformInterceptor` envelope)

| Code | Meaning |
|---|---|
| `200` | Deleted |
| `401` | Invalid JWT |
| `403` | Entry not owned by user |
| `404` | Not found |

```typescript
@Delete(':id')
@ApiTags('Metric Logs')
@ApiBearerAuth()
@ApiOperation({ summary: 'Hard-delete a metric log entry' })
@ApiParam({ name: 'id', type: Number })
@ApiResponse({ status: 200, description: 'Metric log deleted' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Entry does not belong to user' })
@ApiResponse({ status: 404, description: 'Entry not found' })
async remove(
  @Param('id', ParseIntPipe) id: number,
  @Req() req: RequestWithUser,
): Promise<{ message: string; result: null; statusCode: number }> {
  await this.metricLogsService.remove(id, req.user.sub);
  return { message: 'METRIC_LOG_DELETED', result: null, statusCode: 200 };
}
```

---

### Summary / Aggregation — Repository Implementation

**Method signature:**

```typescript
getSummary(userId: number, from?: string, to?: string): Promise<SummaryItem[]>
```

**Sequelize approach:**

```typescript
MetricLog.findAll({
  attributes: [
    'categoryId',
    [fn('SUM', col('MetricLog.value')), 'total'],
    [fn('AVG', col('MetricLog.value')), 'average'],
    [fn('COUNT', col('MetricLog.id')), 'count'],
  ],
  include: [{
    model: Category,
    as: 'category',
    attributes: ['name'],
    where: { userId },   // ownership filter via JOIN
    required: true,
  }],
  where: dateRangeClause,  // Op.between / Op.gte / Op.lte / omitted
  group: ['MetricLog.categoryId', 'category.id'],
  raw: true,
  nest: true,
})
```

Date clause construction: both → `Op.between`; only `from` → `Op.gte`; only `to` → `Op.lte`; neither → omit.

Service post-processing:

```typescript
rawRows.map(row => ({
  categoryId: row.categoryId,
  categoryName: row.category.name,
  total: Number(row.total),
  average: parseFloat(Number(row.average).toFixed(2)),
  count: Number(row.count),
}));
```

---

### Repository Additions (Metric Logs)

New methods only — existing methods unchanged:

| Method | Signature | Purpose |
|---|---|---|
| `findAllForUser` | `(userId: number, filters: { categoryId?, from?, to?, page, limit }): Promise<{ rows: MetricLog[]; count: number }>` | Scoped paginated listing via Category JOIN |
| `getSummary` | `(userId: number, from?, to?): Promise<SummaryItem[]>` | Aggregate query per category |

`findAllForUser` uses `findAndCountAll` with a required JOIN to `Category where: { userId }`. The service converts `{ rows, count }` to `PaginatedResponse<MetricLogResponseDto>`.

---

### Module Definition

```typescript
@Module({
  imports: [DatabaseModule, JwtModule, ConfigModule],
  controllers: [MetricLogsController],
  providers: [MetricLogsService],
})
export class MetricLogsModule {}
```

Register in `apps/api-gateway-app/src/api-gateway-app.module.ts`:

```typescript
imports: [..., CategoriesModule, MetricLogsModule]
```

---

### i18n Keys for Metric Logs

| Key | Suggested Message |
|---|---|
| `METRIC_LOG_CREATED` | `'Metric log created successfully'` |
| `METRIC_LOG_BULK_CREATED` | `'Metric logs created successfully'` |
| `METRIC_LOG_LIST` | `'Metric logs retrieved successfully'` |
| `METRIC_LOG_SUMMARY` | `'Metric log summary retrieved successfully'` |
| `METRIC_LOG_DETAIL` | `'Metric log retrieved successfully'` |
| `METRIC_LOG_UPDATED` | `'Metric log updated successfully'` |
| `METRIC_LOG_DELETED` | `'Metric log deleted successfully'` |
| `METRIC_LOG_NOT_FOUND` | `'Metric log not found'` |
| `METRIC_LOG_FORBIDDEN` | `'You do not have access to this metric log'` |

---

## 4. Cross-Cutting Design Decisions

All flagged decisions compiled from both sub-agents. Each requires developer sign-off before implementation.

| # | Module | Decision | Recommendation |
|---|---|---|---|
| C-1 | Categories | **Cross-moduleType parent enforcement** — should a child's `moduleType` be required to match its parent's? | **Enforce match; throw 422 on mismatch.** Mixing types in one tree creates ambiguous metric queries. If too strict, relax and remove the check. |
| C-2 | Categories | **`/descendants` response shape** — flat array with `depth` field vs. nested tree | **Flat array with `depth` field.** Nested tree is already served by `?includeChildren=true`. Flat array is easier to paginate/filter client-side. |
| C-3 | Categories | **`parentId` immutable via `PATCH /categories/:id`** — block or allow reparenting in the general update endpoint? | **Block in PATCH.** Reparenting affects the entire subtree. Introduce a dedicated `PATCH /categories/:id/parent` endpoint (future iteration) with explicit cascade validation. |
| C-4 | Categories | **Hard delete vs. soft delete** — model has no `deletedAt` currently | **Hard delete now.** Add soft delete (via `@DeletedAt` + `paranoid: true` + schema migration) when audit requirements are confirmed. The `alter: { drop: false }` config makes `deletedAt` addition backwards-compatible. |
| C-5 | Categories | **Block or cascade when deleting a category with children** — DB already has `onDelete: 'CASCADE'` | **Allow cascade but require `?force=true` query param.** Prevents accidental subtree destruction. |
| C-6 | Categories | **Can a child be `isSpecial=true` if its parent is not?** | **Yes — `isSpecial` is node-local, not inherited.** Requiring parent propagation is poor UX and hard to enforce consistently. |
| C-7 | Categories | **Does toggling a parent's `isSpecial` cascade to children?** | **No cascade.** Silent bulk mutation breaks audit trails. Expose a future `PATCH /categories/:id/special/cascade` if bulk operation is needed. |
| ML-1 | Metric Logs | **`entryDate` defaults to today on the server** — introduces server-timezone dependency | **Acceptable for now.** If multi-timezone users are required, mandate explicit `entryDate` on all creates. |
| ML-2 | Metric Logs | **Bulk create — same `categoryId` for all entries, or allow mixed?** | **Allow mixed `categoryId` values.** Maximizes client flexibility. All-or-nothing validation run before any insert. |
| ML-3 | Metric Logs | **Bulk create max entries per request** | **Cap at 100 via `@ArrayMaxSize(100)`.** Adjust if domain requires larger payloads. |
| ML-4 | Metric Logs | **"At least one field" invariant for PATCH** — DTO or service? | **Service layer.** Keeps DTOs clean; the service throws `BadRequestException` when all fields are undefined. |
| ML-5 | Metric Logs | **Date range bounds** — inclusive or exclusive? | **Inclusive both ends.** `from > to` returns `400 Bad Request`. Missing bound = open-ended. |
| ML-6 | Metric Logs | **`category.userId` exposed in `MetricLogResponseDto`** — should it be visible to clients? | **Currently exposed.** Strip in a service mapper if privacy is required. |
| ML-7 | Metric Logs | **Pagination field names** — spec draft said `total`/`limit`, existing interface uses `totalItems`/`totalPages` | **Use `totalItems`/`totalPages`** to match the existing `PaginatedResponse<T>` interface. |
| ML-8 | Metric Logs | **Bulk response** — return created count or full entity array? | **Return `{ created: number }` only.** Full entities add payload; retrieve via `GET /metric-logs`. |

---

## 5. Shared File Structure

All files to create across both modules:

### New Module Files

| File Path | Module | Status |
|---|---|---|
| `apps/api-gateway-app/src/modules/categories/categories.controller.ts` | Categories | Create |
| `apps/api-gateway-app/src/modules/categories/categories.service.ts` | Categories | Create |
| `apps/api-gateway-app/src/modules/categories/categories.module.ts` | Categories | Create |
| `apps/api-gateway-app/src/modules/categories/dto/create-category.dto.ts` | Categories | Create |
| `apps/api-gateway-app/src/modules/categories/dto/update-category.dto.ts` | Categories | Create |
| `apps/api-gateway-app/src/modules/categories/dto/toggle-special.dto.ts` | Categories | Create |
| `apps/api-gateway-app/src/modules/categories/dto/category-query.dto.ts` | Categories | Create |
| `apps/api-gateway-app/src/modules/categories/dto/category-response.dto.ts` | Categories | Create |
| `apps/api-gateway-app/src/modules/metric-logs/metric-logs.controller.ts` | Metric Logs | Create |
| `apps/api-gateway-app/src/modules/metric-logs/metric-logs.service.ts` | Metric Logs | Create |
| `apps/api-gateway-app/src/modules/metric-logs/metric-logs.module.ts` | Metric Logs | Create |
| `apps/api-gateway-app/src/modules/metric-logs/dto/create-metric-log.dto.ts` | Metric Logs | Create |
| `apps/api-gateway-app/src/modules/metric-logs/dto/create-bulk-metric-log.dto.ts` | Metric Logs | Create |
| `apps/api-gateway-app/src/modules/metric-logs/dto/update-metric-log.dto.ts` | Metric Logs | Create |
| `apps/api-gateway-app/src/modules/metric-logs/dto/metric-log-query.dto.ts` | Metric Logs | Create |
| `apps/api-gateway-app/src/modules/metric-logs/dto/metric-log-response.dto.ts` | Metric Logs | Create |

### Modified Existing Files

| File Path | Change |
|---|---|
| `libs/database/src/repositories/category.repository.ts` | Add: `findWithChildren`, `findDirectChildren`, `findDescendants`, `findSpecial` |
| `libs/database/src/repositories/metric-log.repository.ts` | Add: `findAllForUser`, `getSummary` |
| `apps/api-gateway-app/src/api-gateway-app.module.ts` | Register `CategoriesModule` and `MetricLogsModule` in `imports` |
| `libs/common/src/language/en.ts` | Add i18n keys for both modules (listed in Sections 2 and 3) |

### No Changes Required

| File | Reason |
|---|---|
| `libs/database/src/models/category.model.ts` | Model already complete; all associations present |
| `libs/database/src/models/metric-log.model.ts` | Model already complete |
| `libs/database/src/repositories/repository.ts` | Only add if new repos need registering — both repos already exist |

---

## 6. Swagger Tags Summary

| `@ApiTags` Value | Controller |
|---|---|
| `'Categories'` | `CategoriesController` (`apps/api-gateway-app/src/modules/categories/categories.controller.ts`) |
| `'Metric Logs'` | `MetricLogsController` (`apps/api-gateway-app/src/modules/metric-logs/metric-logs.controller.ts`) |

Both controllers apply `@ApiBearerAuth()` at the class level. The Swagger setup in `main.ts` must include:

```typescript
.addBearerAuth(
  { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
  'access-token',
)
```

---

*Awaiting design decision sign-off on Section 4 before implementation planning begins.*
