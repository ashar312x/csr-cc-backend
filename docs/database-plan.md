# Database Plan

Status: **design phase**. Nothing in this document has been applied to the database yet. Scope is limited to schema design, migrations, and seeders. API/frontend integration is a separate, later phase (see [Out of scope](#out-of-scope)).

## 1. Where things stand today

### Backend (`csr-cc-backend`)

Sequelize models, repositories, DTOs, and full CRUD services/controllers already exist for three entities — this is further along than the top-level `CLAUDE.md` suggests:

| Table (current) | Model | Notes |
|---|---|---|
| `user` | `libs/database/src/models/user.model.ts` | `role` enum (`admin`/`user`/`viewer`), `accessForCC` / `accessForCSR` booleans gate which module a user can see |
| `category` | `libs/database/src/models/category.model.ts` | Self-referential tree (`parentId`), `moduleType` enum (`CSR`/`CC`), `isSpecial` flag, **owned by a single `userId`** |
| `metric_log` | `libs/database/src/models/metric-log.model.ts` | `categoryId` (must be a leaf), `title`, `value` (INTEGER NOT NULL), `entryDate` (DATEONLY) |

Key existing behavior worth preserving in the schema design:
- `CategoryRepository`/`CategoriesService` enforce that a child's `moduleType` matches its parent's, that only leaf categories accept metric logs (`saveMetric` checks `childCount === 0`), and that non-admins can only mutate their own categories/logs (`assertOwnership`).
- `MetricLogsService.bulkCreate` already accepts up to 100 entries in one call and validates every `categoryId` is a leaf owned by the requesting user — this is the endpoint the CSR "multi-category-per-date" entry form should target.
- `MetricLogRepository.getSummary` / `getComparisonStats` already do the SUM/AVG/COUNT and date-range aggregation the frontend currently does client-side in `csrData.ts`.

**Gap: there is no migration or seeder tooling wired up yet.** `package.json` already declares the commands (`migrate`, `migrate:undo` → `sequelize-cli`, `seed` → `ts-node libs/database/src/seeders/seed.ts`), but:
- No `.sequelizerc` and no CLI config (`libs/database/src/config/`) exist, so `sequelize-cli` has nothing to point at.
- No `libs/database/src/migrations/` directory exists.
- `libs/database/src/seeders/seed.ts` does not exist — the `seed` script currently points at a missing file.
- The app currently relies entirely on Sequelize's `sync: { alter: { drop: false } }` (`libs/database/database.module.ts`) to keep the schema up to date. This must be turned off once migrations own the schema, or the two will fight each other.

### Frontend (`csr-cc-frontend`)

There is **no API client** — everything is read/written straight to `localStorage` in `src/lib/csrData.ts`, namespaced per module (`toyota_csr_*` vs `toyota_cc_*`). This is the de facto spec for what the database needs to support:

| Frontend concept | Shape | Maps to |
|---|---|---|
| `CSRCategory` | `id, name, eventLabel?, iconName, iconColor, parentId?, isSpecial?` | `category` table — **but `category` has no `eventLabel`, `iconName`, or `iconColor` columns today** |
| `CSRDateEntry` | one date + a map of `{ leafCategoryId: { beneficiaries } }` | one `metric_log` row per leaf category touched, same `entryDate`, via the existing bulk-create endpoint |
| `CSRYearData.categories[catId].events` | a per-category "events" counter | **not actually populated anywhere in the frontend** — `recomputeYearAggregate` only sums `beneficiaries`. Treat as a derivable value (see §4), not a column to migrate as-is |
| `CCPost` | `categoryId, date, title, text?, attachments[], createdAt` | **no equivalent table exists yet.** `attachments` are stored as base64 `dataUrl` directly in `localStorage`, which will not scale and should not be replicated in MySQL |

## 2. Gap analysis

1. **Category display metadata is missing.** `eventLabel`, `iconName`, `iconColor` are used by every category card/chart in the frontend but have no column in `category`.
2. **No content model for CC posts.** `metric_log.value` is `INTEGER NOT NULL`, which fits CSR's "beneficiaries" number but not CC's free-text posts (title + body + files, no number).
3. **No attachment storage.** Nothing persists uploaded files; the frontend keeps them as base64 in `localStorage`, which is a dead end for a real backend (row/payload size, no CDN/caching, no virus scanning).
4. **No migrations or seeders**, despite the tooling already being referenced from `package.json`.
5. **Auto-sync (`alter: true`) is still the only schema-management mechanism** — needs to be retired in favor of migrations before this goes anywhere near production data.

## 3. Proposed schema

Four tables. `user`, `category`, `metric_log` keep their current shape plus the additions below; `metric_log_attachment` is new.

### `user` (existing — no structural change)
| Column | Type | Notes |
|---|---|---|
| `id` | INT PK AI | |
| `name` | VARCHAR(255) NOT NULL | |
| `email` | VARCHAR(255) NOT NULL, UNIQUE | |
| `password_hash` | VARCHAR(255) NOT NULL | bcrypt |
| `role` | ENUM('admin','user','viewer') NOT NULL | |
| `accessForCC` | BOOLEAN NOT NULL DEFAULT false | |
| `accessForCSR` | BOOLEAN NOT NULL DEFAULT false | |
| `createdAt` / `updatedAt` | DATETIME | Sequelize timestamps (already implicit; confirm `timestamps: true` is set) |

### `category` (existing + 3 new columns)
| Column | Type | Notes |
|---|---|---|
| `id` | INT PK AI | |
| `name` | VARCHAR(255) NOT NULL | |
| `parentId` | INT NULL, FK → `category.id` | `ON DELETE CASCADE`, self-referential |
| `moduleType` | ENUM('CSR','CC') NOT NULL | must match parent's `moduleType` (enforced in service today; consider a CHECK/trigger later, not required for launch) |
| `isSpecial` | BOOLEAN NOT NULL DEFAULT false | |
| `userId` | INT NOT NULL, FK → `user.id` | owner; see open question in §5 |
| **`eventLabel`** | VARCHAR(255) NULL | **new** — label used on the frontend's per-entry form |
| **`iconName`** | VARCHAR(100) NULL | **new** — lucide icon name |
| **`iconColor`** | VARCHAR(20) NULL | **new** — hex color |
| `createdAt` / `updatedAt` | DATETIME | |

Indexes: `(moduleType, parentId)`, `(userId)`.

### `metric_log` (existing + relaxed `value`, + `description`)
| Column | Type | Notes |
|---|---|---|
| `id` | INT PK AI | |
| `categoryId` | INT NOT NULL, FK → `category.id` | must reference a leaf category (enforced in service) |
| `title` | VARCHAR(255) NOT NULL | |
| **`value`** | INTEGER **NULL** | changed from NOT NULL — CSR entries set this (beneficiaries), CC posts leave it null |
| **`description`** | TEXT NULL | **new** — CC post body (`CCPost.text`) |
| `entryDate` | DATEONLY NOT NULL | |
| `createdAt` / `updatedAt` | DATETIME | |

Indexes: `(categoryId, entryDate)`, `(entryDate)` (both already effectively needed by `getSummary`/`getComparisonStats`/date-range queries).

Rationale for reusing `metric_log` instead of adding a parallel `post` table: a CC post and a CSR entry are structurally the same thing — "a dated record against a leaf category, owned indirectly via that category's `userId`" — they only differ in whether the numeric or the text field is populated. One table keeps ownership/leaf-validation/date-range-query logic in one place instead of duplicating it. If product direction diverges further (e.g. CC posts need multiple numeric fields, or CSR needs its own attachments), split them then.

### `metric_log_attachment` (new)
| Column | Type | Notes |
|---|---|---|
| `id` | INT PK AI | |
| `metricLogId` | INT NOT NULL, FK → `metric_log.id` | `ON DELETE CASCADE` |
| `fileName` | VARCHAR(255) NOT NULL | original upload name |
| `mimeType` | VARCHAR(100) NOT NULL | validated against a whitelist server-side |
| `sizeBytes` | INTEGER NOT NULL | |
| `storagePath` | VARCHAR(500) NOT NULL | relative path (disk) or object key (S3-compatible) — **not** the file bytes |
| `createdAt` | DATETIME | |

Indexes: `(metricLogId)`.

Files themselves go to disk/object storage, not the database — see §5 for the open decision on where.

### Entity relationships
```
user 1───* category (owner)
category 1───* category (parent/children, self-referential)
category 1───* metric_log (leaf categories only)
metric_log 1───* metric_log_attachment
```

## 4. `events` counter — decided

Not migrated as a stored column (confirmed — see §5.2). It's never actually written by the current frontend logic (`recomputeYearAggregate` only sums `beneficiaries`), so persisting it as-is would just carry the bug forward. Instead, "events" is derived as `COUNT(metric_log rows)` per category/date-range — the same pattern `MetricLogRepository.getSummary` already uses for `count`. No migration or model change needed for this.

## 5. Open questions

1. **Category ownership — RESOLVED.** Staying with per-user ownership: `category.userId` remains `NOT NULL`, no change to `assertOwnership` semantics. No schema impact.
2. **`events` semantics — RESOLVED.** Derived, not stored: "events" = `COUNT(metric_log rows)` per category/date-range, same pattern `getSummary` already uses for `count`. No new column, no migration needed for this.
3. **Attachment storage backend** — defaulting to local disk under `uploads/` via the existing `FileUploadService` (`libs/common/src/services/file-upload.service.ts`), consistent with how every other upload in this codebase works today. This only affects what gets written into `metric_log_attachment.storagePath` (a relative path vs. an object key) — it does not change the schema, so Phase 3 below is not blocked on it. Revisit only if this moves beyond a single VM.
4. **Per-attachment / per-post limits** — not yet pinned down (max file size, max count per `metric_log`, MIME whitelist). Doesn't block schema/migrations either (`sizeBytes` and `mimeType` are just columns); enforce limits in the upload endpoint during the integration phase.

## 6. Implementation phases

Each phase below is sized to be handed to Claude Code as its own session — **clear the chat after each phase completes and its verification step passes**, then start the next phase fresh (point it at this file again; it will re-read the current state of the repo rather than relying on stale conversation memory).

Do not start a phase until the previous one's "Done when" criteria are met.

---

### Phase 1 — Sequelize CLI tooling bootstrap

**Goal:** make `sequelize-cli` runnable against this project. No schema or model changes yet.

**Files to add:**
- `.sequelizerc` (repo root of `csr-cc-backend`) — point `migrations-path`, `seeders-path`, `models-path`, and `config` at `libs/database/src/migrations`, `libs/database/src/seeders`, `libs/database/src/models`, `libs/database/src/config/config.js`.
- `libs/database/src/config/config.js` — a plain JS (not TS — `sequelize-cli` doesn't load TS without extra setup) config exporting `development`/`production` blocks that read `DB_HOST`/`DB_PORT`/`DB_USER`/`DB_PASSWORD`/`DB_NAME` from `process.env` (load `.env.development` via `dotenv` at the top of the file, matching what `database.module.ts` connects to).
- Create the empty directory `libs/database/src/migrations/`.

**Don't touch:** any `.model.ts` file, `database.module.ts`'s `sync` option, or `package.json` scripts (they already exist and point at the right paths).

**Done when:** `npx sequelize-cli db:migrate:status` runs from the `csr-cc-backend` root without config/connection errors (it will report "no migrations" — that's expected, there are none yet).

---

### Phase 2 — Baseline migrations for the existing tables

**Goal:** codify the *current* shape of `user`, `category`, `metric_log` (as they exist today via `sync`) as migrations, so migrations become a faithful starting point before any new columns are layered on.

**Files to add** (in `libs/database/src/migrations/`, timestamp-prefixed, in this order):
1. `xxxx-create-user.js` — matches `user.model.ts` exactly (id, name, email unique, password_hash, role enum, accessForCC, accessForCSR, timestamps).
2. `xxxx-create-category.js` — matches `category.model.ts` exactly (id, name, parentId self-FK `ON DELETE CASCADE`, moduleType enum, isSpecial, userId FK → user, timestamps). Add indexes `(moduleType, parentId)` and `(userId)`.
3. `xxxx-create-metric-log.js` — matches `metric-log.model.ts` exactly (id, categoryId FK → category, title, value INTEGER NOT NULL, entryDate DATEONLY, timestamps). Add indexes `(categoryId, entryDate)` and `(entryDate)`.

**Don't touch:** model files (they already match this shape) or `database.module.ts`.

**Operational note:** the dev database currently has these tables from `sync`. Before running these migrations, drop and recreate the dev schema (there's no real data yet — this is still design phase per the top of this doc) so `db:migrate` is creating tables into a clean database rather than colliding with ones `sync` already made.

**Done when:** starting from an empty dev database, `npm run migrate` creates `user`, `category`, `metric_log` with the same columns/constraints `sync` used to produce, and the app boots and passes existing tests against that freshly-migrated database.

---

### Phase 3 — Schema additions (category display columns, metric_log changes, attachments table)

**Goal:** apply the actual gap-analysis changes from §3 on top of the Phase 2 baseline.

**Files to add:**
- `xxxx-add-category-display-columns.js` — adds `eventLabel` (VARCHAR(255) NULL), `iconName` (VARCHAR(100) NULL), `iconColor` (VARCHAR(20) NULL) to `category`.
- `xxxx-alter-metric-log-value-and-description.js` — changes `metric_log.value` to `INTEGER NULL` (from NOT NULL) and adds `description` (TEXT NULL).
- `xxxx-create-metric-log-attachment.js` — new table per §3 (`id`, `metricLogId` FK → `metric_log` `ON DELETE CASCADE`, `fileName`, `mimeType`, `sizeBytes`, `storagePath`, `createdAt`). Index on `(metricLogId)`.

**Files to change:**
- `libs/database/src/models/category.model.ts` — add the three new columns.
- `libs/database/src/models/metric-log.model.ts` — make `value` nullable, add `description`.
- `libs/database/src/models/metric-log-attachment.model.ts` — **new** model file for the table above.
- `libs/database/src/models/model.ts` — register the new model in `ALL_MODELS`.
- `libs/database/src/repositories/` — add a basic `MetricLogAttachmentRepository` (mirroring the existing repository pattern) and register it in `ALL_REPOSITORY`. No service/controller/upload endpoint yet — that's the out-of-scope integration phase.

**Done when:** `npm run migrate` applies cleanly on top of Phase 2's tables, the three model files compile and match the new columns, and the app still boots (still relying on `sync` at this point — that's turned off in Phase 4, not here).

---

### Phase 4 — Retire `sync`, make migrations the source of truth

**Goal:** stop `database.module.ts` from auto-altering the schema, so `npm run migrate` is the only way schema changes happen from here on.

**Files to change:**
- `libs/database/database.module.ts` — remove/disable the `sync: { alter: { drop: false } } ` option (or set it to `sync: false` if the Sequelize module requires the key to be present).

**Done when:** with `sync` off, the app boots successfully against a database that has only ever been built via `npm run migrate` (Phases 2 + 3), and all existing tests still pass.

---

### Phase 5 — Seeders

**Goal:** implement the `seed` script `package.json` already declares.

**Files to add:**
- `libs/database/src/seeders/seed.ts` — inserts:
  - One `admin` user, with email/password read from environment variables (not hardcoded), password hashed the same way `AuthService` hashes signup passwords.
  - The default category trees currently hardcoded in the frontend as `defaultCategories` (CSR) and `defaultCCCategories` (CC) in `csr-cc-frontend/src/lib/csrData.ts` — port their `name`/`parentId`/`isSpecial`/`eventLabel`/`iconName`/`iconColor` values across, owned by the seeded admin user, with the correct `moduleType` per tree.

**Done when:** `npm run seed` runs against a freshly-migrated (Phases 2–4) database and produces one admin user plus the full default CSR + CC category trees, matching what the frontend currently hardcodes.

## Out of scope

Wiring the frontend up to these tables (replacing `src/lib/csrData.ts`'s `localStorage` calls with real API calls, building the attachment upload endpoint, deciding on the auth token flow end-to-end) is a separate integration phase, planned after the schema/migrations/seeders above are implemented and reviewed.
