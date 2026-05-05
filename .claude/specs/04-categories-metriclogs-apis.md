You are an orchestrator AI managing 2 specialized sub-agents for 
implementing API specifications. Each sub-agent owns a domain. 
Run both tasks in parallel and compile their output into a single 
merged markdown specification file.

---

## Shared Project Context

NestJS project using:
- Sequelize-TypeScript ORM with MySQL 8.0+
- JWT authentication via Passport.js (@UseGuards(JwtAuthGuard))
- class-validator + class-transformer for DTO validation
- @nestjs/swagger for API documentation
- Modular architecture: /src/categories, /src/metric-logs
- Shared DB layer: /libs/database/src/models, /libs/database/src/repositories

Database schema already defined:
- CATEGORY { id, name, parentId FK→CATEGORY(id), isSpecial, moduleType ENUM, userId FK→USER(id) }
- METRIC_LOG { id, categoryId FK→CATEGORY(id), entryDate DATE, title, value INT }

Auth context:
- All endpoints are protected via JwtAuthGuard unless stated otherwise
- req.user contains { sub: userId, email, role }

---

## Sub-Agent 1 — Categories API

You are a senior NestJS API designer. Produce a complete markdown 
specification for the Categories API. Cover the following:

### Endpoints to Spec

1. POST /categories
   - Create a category
   - parentId is optional (null = root category)
   - userId auto-assigned from req.user.sub (never from body)
   - isSpecial defaults to false

2. GET /categories
   - Fetch all root categories (parentId IS NULL)
   - Include query param ?includeChildren=true to recursively load 
     full nested tree (child of child of child, unlimited depth)
   - Include query param ?moduleType=ENUM_VALUE to filter

3. GET /categories/:id
   - Fetch a single category by ID
   - Include query param ?includeChildren=true to load full subtree 
     from this node downward (recursive, unlimited depth)

4. GET /categories/:id/children
   - Fetch only direct children of a category (depth 1)

5. GET /categories/:id/descendants
   - Fetch all descendants recursively (unlimited depth)
   - Return flat array with a depth field on each node OR nested tree — 
     flag this as a design decision for orchestrator review

6. PATCH /categories/:id
   - Update name, isSpecial, moduleType
   - Cannot change parentId (flag as a separate reparent endpoint decision)
   - Only the owner (userId match) or role=admin can update

7. DELETE /categories/:id
   - Soft approach: flag whether to hard delete or add deletedAt 
     (flag as design decision)
   - If category has children, decide: block deletion or cascade 
     (flag as design decision)
   - Only owner or admin can delete

8. PATCH /categories/:id/special
   - Toggle isSpecial true/false
   - Dedicated endpoint so intent is explicit in audit logs

9. GET /categories/special
   - Fetch all categories where isSpecial = true
   - Support optional ?moduleType= filter

### For Each Endpoint Specify

- Method + URL + Auth guard
- Request body table (field, type, required, validation)
- Query params table if applicable
- Response shape table
- Relevant HTTP status codes and their meanings
- Exact controller method stub with all decorators:
  @ApiTags, @ApiOperation, @ApiResponse, @ApiBearerAuth, 
  @ApiQuery, @ApiParam as appropriate
- Any guard beyond JwtAuthGuard (e.g. ownership check guard)

### Self-Join / Recursive Tree

Explain how the repository layer handles recursive child fetching:
- Describe the findDescendants(id) method approach using either:
  a) Recursive Sequelize calls (loop-based BFS/DFS in service)
  b) MySQL recursive CTE via sequelize.query()
- Flag which approach is recommended and why
- Provide the method signature for both findWithChildren() 
  and findDescendants() in the repository spec

### isSpecial Handling

- Describe the business rules for isSpecial in the service layer:
  - Can a child category be isSpecial if parent is not?
  - Does toggling a parent's isSpecial cascade to children?
  - Flag these as design decisions if not deterministic

### DTO List

List every DTO file needed with all fields, their class-validator 
decorators, and their @ApiProperty / @ApiPropertyOptional decorators.
Do not write full class bodies — use a table per DTO:
| Field | Type | Validators | Swagger Decorator |

### File Structure Table

List every file to create under:
- /src/categories/
- /libs/database/src/models/category.model.ts (additions only)
- /libs/database/src/repositories/category.repository.ts (method list)

---

## Sub-Agent 2 — Metric Logs API

You are a senior NestJS API designer. Produce a complete markdown 
specification for the Metric Logs API. Cover the following:

### Endpoints to Spec

1. POST /metric-logs
   - Create a single metric log entry
   - categoryId must exist and belong to req.user.sub or be accessible
   - entryDate defaults to today if not provided

2. POST /metric-logs/bulk
   - Create multiple metric log entries in one request
   - Uses bulkCreate in repository
   - All entries must share the same categoryId OR allow mixed — 
     flag as design decision

3. GET /metric-logs
   - Fetch all logs for the authenticated user
   - Supports query params:
     ?categoryId= — filter by category
     ?from= and ?to= — date range filter (ISO 8601 dates)
     ?page= and ?limit= — pagination
   - Returns paginated response: { data[], total, page, limit }

4. GET /metric-logs/:id
   - Fetch a single log entry by ID
   - Must belong to the requesting user

5. PATCH /metric-logs/:id
   - Update title, value, entryDate
   - categoryId cannot be changed after creation
   - Must belong to the requesting user

6. DELETE /metric-logs/:id
   - Hard delete
   - Must belong to the requesting user

7. GET /metric-logs/summary
   - Aggregate endpoint: return sum and average of value 
     grouped by categoryId
   - Supports ?from= and ?to= date range
   - Response: [{ categoryId, categoryName, total, average, count }]

### For Each Endpoint Specify

- Method + URL + Auth guard
- Request body table (field, type, required, validation)
- Query params table if applicable
- Response shape table
- Relevant HTTP status codes and their meanings
- Exact controller method stub with all decorators:
  @ApiTags, @ApiOperation, @ApiResponse, @ApiBearerAuth,
  @ApiQuery, @ApiParam as appropriate

### Pagination Response Schema

Define the generic paginated wrapper shape used across GET /metric-logs:
| Field  | Type     | Description              |
|--------|----------|--------------------------|
| data   | array    | Array of MetricLogDto    |
| total  | number   | Total matching records   |
| page   | number   | Current page             |
| limit  | number   | Items per page           |

### Summary / Aggregation

Describe how GET /metric-logs/summary is implemented at the 
repository level:
- Use Sequelize findAll with attributes, fn('SUM'), fn('AVG'), 
  fn('COUNT'), group by categoryId
- Include a JOIN to CATEGORY to resolve categoryName
- Provide the method signature: getSummary(userId, from?, to?)

### DTO List

List every DTO file needed with all fields, their class-validator 
decorators, and their @ApiProperty / @ApiPropertyOptional decorators.
Do not write full class bodies — use a table per DTO:
| Field | Type | Validators | Swagger Decorator |

### File Structure Table

List every file to create under:
- /src/metric-logs/
- /libs/database/src/models/metric-log.model.ts (additions only)
- /libs/database/src/repositories/metric-log.repository.ts (method list)

---

## Orchestrator Final Output Instructions

Once both sub-agents have completed their specs, compile them into 
a single markdown file with this structure:

# API Specification — Categories & Metric Logs

## 1. Shared Configuration
  - Base URL, Auth header, Content-Type, global error schema

## 2. Categories API (Sub-Agent 1 Output)
  - Full spec as produced

## 3. Metric Logs API (Sub-Agent 2 Output)
  - Full spec as produced

## 4. Cross-Cutting Design Decisions
  - Compile ALL flagged design decisions from both sub-agents into 
    a single numbered list requiring orchestrator/developer sign-off:
    1. Categories: descendants response shape (flat vs nested)
    2. Categories: hard delete vs soft delete
    3. Categories: cascade vs block on delete with children
    4. Categories: isSpecial cascade behavior
    5. Categories: allow reparenting via PATCH or dedicated endpoint
    6. Metric Logs: bulk create — same categoryId or mixed
    7. [Any additional flags raised by either sub-agent]

## 5. Shared File Structure
  - Merged table of ALL files to create across both modules

## 6. Swagger Tags Summary
  - List all @ApiTags values and which controllers carry them

---

## Execution Instructions for Orchestrator

1. Dispatch Sub-Agent 1 and Sub-Agent 2 simultaneously
2. Do not let either agent wait for the other
3. Collect both outputs
4. Resolve any naming conflicts between the two specs 
   (e.g. shared response wrapper DTOs)
5. Produce the final merged markdown as the single deliverable
6. End with: "Awaiting design decision sign-off on Section 4 
   before implementation planning begins."
7. Add swagger for all APIs