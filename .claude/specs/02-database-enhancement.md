## 1. Database Configuration

| Setting  | Value                        |
|----------|------------------------------|
| Engine   | MySQL 8.0+                   |
| ORM      | Sequelize (Sequelize-TypeScript) |
| Charset  | utf8mb4                      |

---

## 2. Database Tables

### `USER`

| Column        | Type         | Constraints     |
|---------------|--------------|-----------------|
| id            | INT          | PK, Auto Increment |
| name          | VARCHAR      | NOT NULL        |
| email         | VARCHAR      | NOT NULL, UNIQUE |
| password_hash | VARCHAR      | NOT NULL        |
| role          | ENUM         | NOT NULL        |
| accessForCC   | BOOLEAN      | DEFAULT false   |
| accessForCSR  | BOOLEAN      | DEFAULT false   |

---

### `CATEGORY`

| Column     | Type    | Constraints              |
|------------|---------|--------------------------|
| id         | INT     | PK, Auto Increment       |
| name       | VARCHAR | NOT NULL                 |
| parentId   | INT     | FK → CATEGORY(id), NULL  |
| isSpecial  | BOOLEAN | DEFAULT false            |
| moduleType | ENUM    | NOT NULL                 |
| userId     | INT     | FK → USER(id)            |

---

### `METRIC_LOG`

| Column     | Type    | Constraints        |
|------------|---------|--------------------|
| id         | INT     | PK, Auto Increment |
| categoryId | INT     | FK → CATEGORY(id)  |
| entryDate  | DATE    | NOT NULL           |
| title      | VARCHAR | NOT NULL           |
| value      | INT     | NOT NULL           |

---

## 3. Relationships

| Relationship            | Type        | Description                      |
|-------------------------|-------------|----------------------------------|
| USER → CATEGORY         | One-to-Many | A user manages many categories   |
| CATEGORY → CATEGORY     | Self-Join   | Parent/child nesting             |
| CATEGORY → METRIC_LOG   | One-to-Many | A category records many logs     |

---

## 4. File Structure

### Models — `/libs/database/src/models`

| File               | Description             |
|--------------------|-------------------------|
| `user.model.ts`      | Model definition for `USER` table      |
| `category.model.ts`  | Model definition for `CATEGORY` table  |
| `metric-log.model.ts`| Model definition for `METRIC_LOG` table|

### Repositories — `/libs/database/src/repositories`

| File                        | Methods Included |
|-----------------------------|-----------------|
| `user.repository.ts`         | `create`, `findById`, `findAll`, `findWithPagination`, `update`, `bulkCreate` |
| `category.repository.ts`     | `create`, `findById`, `findAll`, `findWithPagination`, `update`, `bulkCreate` |
| `metric-log.repository.ts`   | `create`, `findById`, `findAll`, `findWithPagination`, `update`, `bulkCreate` |