## 1. Database Configuration
- **Engine**: MySQL 8.0+
- **ORM**: Sequelize (NestJS Sequelize-TypeScript)
- **Charset**: utf8mb4

---

## 2. Models (Sequelize-TypeScript)

### A. Category Model
Manages the hierarchical tree and the "Special Switch."
- `id`: Primary Key (Auto-Increment)
- `name`: String
- `parentId`: ForeignKey referencing `id` (Self-referencing)
- `moduleType`: Enum ('CSR', 'CC')
- `isSpecial`: Boolean (Default: false)
- **Associations**: 
  - `hasMany` Sub-Categories
  - `belongsTo` Parent Category
  - `hasMany` MetricLogs

### B. MetricLog Model
Stores the time-series counts.
- `id`: Primary Key
- `categoryId`: ForeignKey referencing `Category.id`
- `value`: Integer (Beneficiaries or Activity Count)
- `entryDate`: Date
- **Associations**: 
  - `belongsTo` Category

---

## 3. Repositories (Data Access Layer)

### A. CategoryRepository
Responsible for recursive data fetching and structure management.
- **findTrees(moduleType)**: Fetches all categories for a specific module and nests them into a tree structure.
- **getLeafNodes(parentId)**: Retrieves only the bottom-tier categories where data entry is permitted.
- **updateSpecialStatus(id, status)**: Toggles the `isSpecial` flag for PDF reporting.

### B. MetricRepository
Handles data persistence and analytical aggregations.
- **saveMetric(dto)**: Validates if the category is a leaf node before saving the count.
- **getComparisonStats(categoryId, startDate, endDate)**: Executes aggregation queries to compare current data against previous months/years.
- **getExportData(filters)**: Joins `MetricLogs` with `Categories` to generate data for PDF (checking `isSpecial`) or Excel.

---

## 4. Core Constraints
- **Leaf-Node Validation**: Business logic in the Repository must prevent saving metrics to parent categories.
- **Recursive Integrity**: `ON DELETE CASCADE` ensures that deleting a parent category removes all sub-categories and associated logs.
- **Aggregation**: Use SQL `SUM()` and `GROUP BY` on `entry_date` for high-performance dashboard loading.

## 4. Add relevant files
- **for each table**: inside /libs/database/src/models (Add all models for all tables)
- **for each table**: inside /libs/database/src/respositories (Add all repositories files with create, single fetch, all fetch, fetch using pagination, update, create bulk)