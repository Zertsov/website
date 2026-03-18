# cal.voz.dev Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal productivity dashboard at `~/git/cal` with task tracking, follow-ups, projects, calendar, and analytics — all backed by local SQLite.

**Architecture:** Next.js 15 App Router with server-side route handlers for a REST API, Drizzle ORM over local SQLite (better-sqlite3), and a React frontend using shadcn/ui + Tailwind CSS. All data operations go through `/api/*` routes; the frontend fetches via standard fetch calls.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS 4, shadcn/ui, Drizzle ORM, better-sqlite3, Recharts, Framer Motion, Biome, pnpm

**Spec:** `docs/superpowers/specs/2026-03-17-cal-voz-dev-design.md`

---

## File Structure

```
~/git/cal/
├── app/
│   ├── layout.tsx                    # Root layout: dark theme, nav bar, font
│   ├── page.tsx                      # Dashboard page
│   ├── calendar/
│   │   └── page.tsx                  # Month grid calendar
│   ├── projects/
│   │   └── page.tsx                  # Projects list
│   ├── analytics/
│   │   └── page.tsx                  # Analytics charts
│   ├── archive/
│   │   └── page.tsx                  # Completed/abandoned task history
│   └── api/
│       ├── tasks/
│       │   ├── route.ts              # GET (list + rollover), POST (create)
│       │   └── [id]/
│       │       └── route.ts          # PATCH, DELETE
│       ├── projects/
│       │   ├── route.ts              # GET, POST
│       │   └── [id]/
│       │       └── route.ts          # PATCH
│       ├── follow-ups/
│       │   ├── route.ts              # GET, POST
│       │   └── [id]/
│       │       └── route.ts          # PATCH, DELETE
│       ├── daily-logs/
│       │   ├── route.ts              # POST
│       │   └── [id]/
│       │       └── route.ts          # DELETE
│       ├── calendar/
│       │   ├── route.ts              # GET (date range summary)
│       │   └── [date]/
│       │       └── route.ts          # GET (single date detail)
│       └── analytics/
│           ├── productivity/
│           │   └── route.ts          # GET
│           ├── project-focus/
│           │   └── route.ts          # GET
│           └── follow-through/
│               └── route.ts          # GET
├── components/
│   ├── ui/                           # shadcn/ui primitives (auto-generated)
│   ├── nav-bar.tsx                   # Top navigation bar
│   ├── week-strip.tsx                # Week calendar strip with activity dots
│   ├── quick-stats.tsx               # Completed/active/rolled-over counters
│   ├── task-list.tsx                  # Task column for dashboard
│   ├── task-row.tsx                   # Single task row with status cycling
│   ├── task-quick-add.tsx             # Inline task creation input
│   ├── follow-up-list.tsx             # Follow-up column for dashboard
│   ├── follow-up-row.tsx              # Single follow-up row
│   ├── follow-up-quick-add.tsx        # Inline follow-up creation input
│   ├── project-list.tsx               # Project column for dashboard
│   ├── project-card.tsx               # Single project with progress bar
│   ├── slide-over.tsx                 # Reusable slide-over panel (Framer Motion)
│   ├── task-detail.tsx                # Task detail panel content
│   ├── project-detail.tsx             # Project detail panel content
│   ├── calendar-grid.tsx              # Month grid for /calendar page
│   ├── day-detail.tsx                 # Day detail panel content
│   ├── date-range-filter.tsx          # Reusable date range picker for analytics/archive
│   └── keyboard-shortcuts.tsx         # Global keyboard shortcut handler
├── db/
│   ├── index.ts                      # Database connection (better-sqlite3 + Drizzle)
│   ├── schema.ts                     # Drizzle table definitions
│   ├── seed.ts                       # Development seed data
│   └── migrations/                   # Drizzle migration files (auto-generated)
├── lib/
│   ├── utils.ts                      # cn() helper, date formatting
│   ├── ulid.ts                       # ULID generation helper
│   └── queries/
│       ├── tasks.ts                  # Task queries including rollover logic
│       ├── projects.ts               # Project queries
│       ├── follow-ups.ts             # Follow-up queries
│       ├── daily-logs.ts             # Daily log queries
│       ├── calendar.ts               # Calendar aggregation queries
│       └── analytics.ts              # Analytics aggregation queries
├── __tests__/
│   ├── db/
│   │   └── schema.test.ts           # Schema validation tests
│   ├── queries/
│   │   ├── tasks.test.ts            # Task query tests (rollover logic)
│   │   ├── projects.test.ts         # Project query tests
│   │   ├── follow-ups.test.ts       # Follow-up query tests
│   │   └── analytics.test.ts        # Analytics aggregation tests
│   └── api/
│       ├── tasks.test.ts            # Tasks API integration tests
│       ├── projects.test.ts         # Projects API integration tests
│       ├── follow-ups.test.ts       # Follow-ups API integration tests
│       └── calendar.test.ts         # Calendar API integration tests
├── drizzle.config.ts                 # Drizzle Kit config
├── package.json
├── tsconfig.json
├── next.config.ts
├── biome.json
├── tailwind.config.ts
├── postcss.config.mjs
├── .env.local                        # DATABASE_URL=file:./db/cal.db
└── .gitignore
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `~/git/cal/` (entire project scaffold)
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `biome.json`, `tailwind.config.ts`, `postcss.config.mjs`, `.env.local`, `.gitignore`

- [ ] **Step 1: Create Next.js project**

```bash
cd ~/git
pnpm create next-app@latest cal --typescript --tailwind --app --src-dir=false --import-alias="@/*" --use-pnpm
```

Accept defaults. This gives us the base Next.js 15 + Tailwind + TypeScript + App Router scaffold.

- [ ] **Step 2: Install core dependencies**

```bash
cd ~/git/cal
pnpm add drizzle-orm better-sqlite3 ulid recharts framer-motion lucide-react
pnpm add -D drizzle-kit @types/better-sqlite3 vitest @vitejs/plugin-react
```

- [ ] **Step 3: Install and initialize shadcn/ui**

```bash
pnpm dlx shadcn@latest init
```

Select: New York style, Zinc base color, CSS variables. Then add initial components:

```bash
pnpm dlx shadcn@latest add button input badge scroll-area dropdown-menu dialog popover calendar separator card
```

- [ ] **Step 4: Install and configure Biome**

```bash
pnpm add -D @biomejs/biome
```

Create `biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 80,
    "lineEnding": "lf"
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "asNeeded",
      "trailingCommas": "es5",
      "arrowParentheses": "always"
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "style": {
        "useTemplate": "error",
        "useImportType": "error"
      },
      "suspicious": {
        "noExplicitAny": "off"
      },
      "correctness": {
        "useExhaustiveDependencies": "warn"
      }
    }
  },
  "files": {
    "include": [
      "app/**/*",
      "components/**/*",
      "db/**/*",
      "lib/**/*",
      "__tests__/**/*",
      "*.ts",
      "*.tsx",
      "*.json"
    ]
  }
}
```

Update `package.json` scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "biome lint .",
    "lint:fix": "biome lint --write .",
    "format": "biome format --write .",
    "check": "biome check .",
    "check:fix": "biome check --write .",
    "test": "vitest",
    "test:run": "vitest run",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:seed": "npx tsx db/seed.ts"
  }
}
```

- [ ] **Step 5: Configure Vitest**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 6: Create `.env.local` and update `.gitignore`**

`.env.local`:
```
DATABASE_URL=file:./db/cal.db
```

Append to `.gitignore`:
```
db/cal.db
db/cal.db-journal
db/cal.db-wal
```

- [ ] **Step 7: Remove ESLint (replaced by Biome)**

```bash
rm .eslintrc.json 2>/dev/null; pnpm remove eslint eslint-config-next @eslint/eslintrc 2>/dev/null
```

Remove any eslint config from `next.config.ts` if present.

- [ ] **Step 8: Verify dev server starts**

```bash
pnpm dev
```

Confirm app loads at `http://localhost:3000`. Stop the server.

- [ ] **Step 9: Initialize git and commit**

```bash
cd ~/git/cal
git init
git add -A
git commit -m "chore: scaffold Next.js 15 project with Tailwind, shadcn/ui, Drizzle, Biome"
```

---

## Task 2: Database Schema + Seed Data

**Files:**
- Create: `db/schema.ts`, `db/index.ts`, `db/seed.ts`, `drizzle.config.ts`
- Create: `lib/ulid.ts`
- Test: `__tests__/db/schema.test.ts`

- [ ] **Step 1: Write schema validation test**

Create `__tests__/db/schema.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from '@/db/schema'

describe('database schema', () => {
  let sqlite: Database.Database
  let db: ReturnType<typeof drizzle>

  beforeAll(() => {
    sqlite = new Database(':memory:')
    db = drizzle(sqlite, { schema })
    migrate(db, { migrationsFolder: './db/migrations' })
  })

  afterAll(() => {
    sqlite.close()
  })

  it('creates all four tables', () => {
    const tables = sqlite
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '__drizzle%'"
      )
      .all() as { name: string }[]
    const names = tables.map((t) => t.name).sort()
    expect(names).toEqual([
      'daily_logs',
      'follow_ups',
      'projects',
      'tasks',
    ])
  })

  it('enforces unique constraint on daily_logs (task_id, date)', () => {
    const { ulid } = require('ulid')
    const taskId = ulid()
    const projectId = ulid()
    const now = Date.now()

    sqlite
      .prepare(
        'INSERT INTO projects (id, name, color, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .run(projectId, 'Test', '#14b8a6', 'active', now, now)

    sqlite
      .prepare(
        'INSERT INTO tasks (id, title, status, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .run(taskId, 'Test task', 'pending', 0, now, now)

    sqlite
      .prepare(
        'INSERT INTO daily_logs (id, task_id, date, created_at) VALUES (?, ?, ?, ?)'
      )
      .run(ulid(), taskId, '2026-03-17', now)

    expect(() =>
      sqlite
        .prepare(
          'INSERT INTO daily_logs (id, task_id, date, created_at) VALUES (?, ?, ?, ?)'
        )
        .run(ulid(), taskId, '2026-03-17', now)
    ).toThrow()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test:run __tests__/db/schema.test.ts
```

Expected: FAIL — modules not found.

- [ ] **Step 3: Create ULID helper**

Create `lib/ulid.ts`:

```typescript
import { ulid } from 'ulid'

export function generateId(): string {
  return ulid()
}
```

- [ ] **Step 4: Create Drizzle schema**

Create `db/schema.ts`:

```typescript
import {
  sqliteTable,
  text,
  integer,
  unique,
} from 'drizzle-orm/sqlite-core'

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  status: text('status', { enum: ['active', 'archived'] })
    .notNull()
    .default('active'),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  archivedAt: integer('archived_at', { mode: 'number' }),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
})

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  projectId: text('project_id').references(() => projects.id),
  status: text('status', {
    enum: ['pending', 'in_progress', 'completed', 'abandoned'],
  })
    .notNull()
    .default('pending'),
  sortOrder: integer('sort_order', { mode: 'number' }).notNull().default(0),
  dueDate: text('due_date'),
  completedAt: integer('completed_at', { mode: 'number' }),
  abandonedAt: integer('abandoned_at', { mode: 'number' }),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
})

export const followUps = sqliteTable('follow_ups', {
  id: text('id').primaryKey(),
  taskId: text('task_id').references(() => tasks.id),
  title: text('title').notNull(),
  status: text('status', { enum: ['active', 'resolved', 'dismissed'] })
    .notNull()
    .default('active'),
  triggerType: text('trigger_type', { enum: ['time', 'completion'] }).notNull(),
  triggerDate: text('trigger_date'),
  triggerCondition: text('trigger_condition'),
  resolvedAt: integer('resolved_at', { mode: 'number' }),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
})

export const dailyLogs = sqliteTable(
  'daily_logs',
  {
    id: text('id').primaryKey(),
    taskId: text('task_id')
      .notNull()
      .references(() => tasks.id),
    date: text('date').notNull(),
    note: text('note'),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
  },
  (table) => [unique().on(table.taskId, table.date)]
)
```

- [ ] **Step 5: Create database connection**

Create `db/index.ts`:

```typescript
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import path from 'path'

const dbPath =
  process.env.DATABASE_URL?.replace('file:', '') ||
  path.join(process.cwd(), 'db', 'cal.db')

const sqlite = new Database(dbPath)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })
export { sqlite }
```

- [ ] **Step 6: Create Drizzle config and generate migration**

Create `drizzle.config.ts`:

```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'file:./db/cal.db',
  },
})
```

Run:

```bash
pnpm db:generate
```

- [ ] **Step 7: Run schema test**

```bash
pnpm test:run __tests__/db/schema.test.ts
```

Expected: PASS — all tables created, unique constraint enforced.

- [ ] **Step 8: Create seed script**

Create `db/seed.ts`:

```typescript
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { ulid } from 'ulid'
import * as schema from './schema'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dbPath = path.join(__dirname, 'cal.db')

// Remove existing db for clean seed
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath)

const sqlite = new Database(dbPath)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

const db = drizzle(sqlite, { schema })
migrate(db, { migrationsFolder: path.join(__dirname, 'migrations') })

const now = Date.now()
const day = 86400000

// Projects
const authProject = ulid()
const apiProject = ulid()
const docsProject = ulid()

db.insert(schema.projects)
  .values([
    { id: authProject, name: 'Auth Refactor', color: '#14b8a6', status: 'active', createdAt: now - 14 * day, updatedAt: now },
    { id: apiProject, name: 'API v2', color: '#3b82f6', status: 'active', createdAt: now - 7 * day, updatedAt: now },
    { id: docsProject, name: 'Docs Site', color: '#a855f7', status: 'active', createdAt: now - 3 * day, updatedAt: now },
  ])
  .run()

// Tasks — mix of statuses across several days
const tasks = [
  { id: ulid(), title: 'Set up token validation', projectId: authProject, status: 'completed' as const, sortOrder: 0, createdAt: now - 5 * day, updatedAt: now - 3 * day, completedAt: now - 3 * day },
  { id: ulid(), title: 'Migrate session storage', projectId: authProject, status: 'completed' as const, sortOrder: 1, createdAt: now - 4 * day, updatedAt: now - 2 * day, completedAt: now - 2 * day },
  { id: ulid(), title: 'Add refresh token rotation', projectId: authProject, status: 'in_progress' as const, sortOrder: 2, createdAt: now - 2 * day, updatedAt: now },
  { id: ulid(), title: 'Write auth middleware tests', projectId: authProject, status: 'pending' as const, sortOrder: 3, dueDate: '2026-03-17', createdAt: now - day, updatedAt: now - day },
  { id: ulid(), title: 'Design API v2 endpoints', projectId: apiProject, status: 'completed' as const, sortOrder: 0, createdAt: now - 5 * day, updatedAt: now - 4 * day, completedAt: now - 4 * day },
  { id: ulid(), title: 'Review PR #42', projectId: apiProject, status: 'pending' as const, sortOrder: 1, dueDate: '2026-03-17', createdAt: now - day, updatedAt: now - day },
  { id: ulid(), title: 'Update API docs', projectId: docsProject, status: 'pending' as const, sortOrder: 0, createdAt: now - 2 * day, updatedAt: now - 2 * day },
  { id: ulid(), title: 'Fix broken links in docs', projectId: docsProject, status: 'abandoned' as const, sortOrder: 1, createdAt: now - 6 * day, updatedAt: now - day, abandonedAt: now - day },
]

db.insert(schema.tasks).values(tasks).run()

// Daily logs
const logEntries = [
  { id: ulid(), taskId: tasks[0].id, date: '2026-03-12', createdAt: now - 5 * day },
  { id: ulid(), taskId: tasks[0].id, date: '2026-03-13', createdAt: now - 4 * day },
  { id: ulid(), taskId: tasks[0].id, date: '2026-03-14', note: 'Finished validation logic', createdAt: now - 3 * day },
  { id: ulid(), taskId: tasks[1].id, date: '2026-03-13', createdAt: now - 4 * day },
  { id: ulid(), taskId: tasks[1].id, date: '2026-03-15', note: 'Completed migration', createdAt: now - 2 * day },
  { id: ulid(), taskId: tasks[2].id, date: '2026-03-16', createdAt: now - day },
  { id: ulid(), taskId: tasks[4].id, date: '2026-03-12', createdAt: now - 5 * day },
  { id: ulid(), taskId: tasks[4].id, date: '2026-03-13', createdAt: now - 4 * day },
]

db.insert(schema.dailyLogs).values(logEntries).run()

// Follow-ups
db.insert(schema.followUps)
  .values([
    { id: ulid(), taskId: tasks[2].id, title: 'Check if refresh token rotation works in staging', status: 'active', triggerType: 'time', triggerDate: '2026-03-17', createdAt: now - day, updatedAt: now - day },
    { id: ulid(), title: 'Ping design team about new logo', status: 'active', triggerType: 'time', triggerDate: '2026-03-16', createdAt: now - 2 * day, updatedAt: now - 2 * day },
    { id: ulid(), taskId: tasks[5].id, title: 'Follow up after PR merge', status: 'active', triggerType: 'completion', triggerCondition: 'After PR #42 is merged', createdAt: now - day, updatedAt: now - day },
  ])
  .run()

sqlite.close()
console.log('Seed complete: 3 projects, 8 tasks, 8 daily logs, 3 follow-ups')
```

- [ ] **Step 9: Run seed and verify**

```bash
pnpm db:seed
```

Expected: "Seed complete: 3 projects, 8 tasks, 8 daily logs, 3 follow-ups"

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add database schema, migrations, and seed data"
```

---

## Task 3: Query Layer — Tasks (with Rollover Logic)

**Files:**
- Create: `lib/queries/tasks.ts`
- Test: `__tests__/queries/tasks.test.ts`

- [ ] **Step 1: Write rollover logic tests**

Create `__tests__/queries/tasks.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from '@/db/schema'
import { ulid } from 'ulid'
import {
  getTasksForDate,
  createTask,
  updateTask,
  deleteTask,
} from '@/lib/queries/tasks'

function createTestDb() {
  const sqlite = new Database(':memory:')
  sqlite.pragma('foreign_keys = ON')
  const db = drizzle(sqlite, { schema })
  migrate(db, { migrationsFolder: './db/migrations' })
  return { sqlite, db }
}

describe('getTasksForDate', () => {
  let sqlite: Database.Database
  let db: ReturnType<typeof drizzle>

  beforeEach(() => {
    const result = createTestDb()
    sqlite = result.sqlite
    db = result.db
  })

  afterEach(() => sqlite.close())

  it('returns tasks with due_date on the given date', () => {
    const now = Date.now()
    const taskId = ulid()
    db.insert(schema.tasks)
      .values({
        id: taskId,
        title: 'Due today',
        status: 'pending',
        sortOrder: 0,
        dueDate: '2026-03-17',
        createdAt: now,
        updatedAt: now,
      })
      .run()

    const tasks = getTasksForDate(db, '2026-03-17')
    expect(tasks).toHaveLength(1)
    expect(tasks[0].title).toBe('Due today')
  })

  it('rolls over tasks with past due dates', () => {
    const now = Date.now()
    db.insert(schema.tasks)
      .values({
        id: ulid(),
        title: 'Overdue',
        status: 'pending',
        sortOrder: 0,
        dueDate: '2026-03-15',
        createdAt: now,
        updatedAt: now,
      })
      .run()

    const tasks = getTasksForDate(db, '2026-03-17')
    expect(tasks).toHaveLength(1)
    expect(tasks[0].title).toBe('Overdue')
    expect(tasks[0].isRolledOver).toBe(true)
  })

  it('includes tasks with no due date that are pending or in_progress', () => {
    const now = Date.now()
    db.insert(schema.tasks)
      .values({
        id: ulid(),
        title: 'No due date',
        status: 'in_progress',
        sortOrder: 0,
        createdAt: now,
        updatedAt: now,
      })
      .run()

    const tasks = getTasksForDate(db, '2026-03-17')
    expect(tasks).toHaveLength(1)
    expect(tasks[0].isRolledOver).toBe(false)
  })

  it('excludes completed and abandoned tasks from default view', () => {
    const now = Date.now()
    db.insert(schema.tasks)
      .values([
        { id: ulid(), title: 'Done', status: 'completed', sortOrder: 0, dueDate: '2026-03-17', createdAt: now, updatedAt: now, completedAt: now },
        { id: ulid(), title: 'Abandoned', status: 'abandoned', sortOrder: 1, dueDate: '2026-03-17', createdAt: now, updatedAt: now, abandonedAt: now },
      ])
      .run()

    const tasks = getTasksForDate(db, '2026-03-17')
    expect(tasks).toHaveLength(0)
  })

  it('includes tasks with recent daily_log activity that are still open', () => {
    const now = Date.now()
    const taskId = ulid()
    db.insert(schema.tasks)
      .values({
        id: taskId,
        title: 'Worked on yesterday',
        status: 'in_progress',
        sortOrder: 0,
        createdAt: now,
        updatedAt: now,
      })
      .run()

    db.insert(schema.dailyLogs)
      .values({
        id: ulid(),
        taskId,
        date: '2026-03-16',
        createdAt: now,
      })
      .run()

    const tasks = getTasksForDate(db, '2026-03-17')
    expect(tasks.some((t) => t.title === 'Worked on yesterday')).toBe(true)
  })

  it('filters by status when provided', () => {
    const now = Date.now()
    db.insert(schema.tasks)
      .values([
        { id: ulid(), title: 'Done', status: 'completed', sortOrder: 0, createdAt: now, updatedAt: now, completedAt: now },
        { id: ulid(), title: 'Active', status: 'pending', sortOrder: 1, createdAt: now, updatedAt: now },
      ])
      .run()

    const tasks = getTasksForDate(db, '2026-03-17', {
      statuses: ['completed'],
    })
    expect(tasks).toHaveLength(1)
    expect(tasks[0].title).toBe('Done')
  })

  it('filters by project_id when provided', () => {
    const now = Date.now()
    const projId = ulid()
    db.insert(schema.projects)
      .values({ id: projId, name: 'Test', color: '#fff', status: 'active', createdAt: now, updatedAt: now })
      .run()

    db.insert(schema.tasks)
      .values([
        { id: ulid(), title: 'In project', status: 'pending', sortOrder: 0, projectId: projId, createdAt: now, updatedAt: now },
        { id: ulid(), title: 'No project', status: 'pending', sortOrder: 1, createdAt: now, updatedAt: now },
      ])
      .run()

    const tasks = getTasksForDate(db, '2026-03-17', { projectId: projId })
    expect(tasks).toHaveLength(1)
    expect(tasks[0].title).toBe('In project')
  })
})

describe('createTask', () => {
  let sqlite: Database.Database
  let db: ReturnType<typeof drizzle>

  beforeEach(() => {
    const result = createTestDb()
    sqlite = result.sqlite
    db = result.db
  })

  afterEach(() => sqlite.close())

  it('creates a task and returns it', () => {
    const task = createTask(db, { title: 'New task' })
    expect(task.title).toBe('New task')
    expect(task.status).toBe('pending')
    expect(task.id).toBeDefined()
  })
})

describe('updateTask', () => {
  let sqlite: Database.Database
  let db: ReturnType<typeof drizzle>

  beforeEach(() => {
    const result = createTestDb()
    sqlite = result.sqlite
    db = result.db
  })

  afterEach(() => sqlite.close())

  it('updates status and sets completedAt when completing', () => {
    const task = createTask(db, { title: 'To complete' })
    const updated = updateTask(db, task.id, { status: 'completed' })
    expect(updated.status).toBe('completed')
    expect(updated.completedAt).toBeDefined()
  })

  it('sets abandonedAt when abandoning', () => {
    const task = createTask(db, { title: 'To abandon' })
    const updated = updateTask(db, task.id, { status: 'abandoned' })
    expect(updated.status).toBe('abandoned')
    expect(updated.abandonedAt).toBeDefined()
  })
})

describe('deleteTask', () => {
  let sqlite: Database.Database
  let db: ReturnType<typeof drizzle>

  beforeEach(() => {
    const result = createTestDb()
    sqlite = result.sqlite
    db = result.db
  })

  afterEach(() => sqlite.close())

  it('deletes a task by id', () => {
    const task = createTask(db, { title: 'To delete' })
    deleteTask(db, task.id)
    const tasks = getTasksForDate(db, '2026-03-17')
    expect(tasks.find((t) => t.id === task.id)).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test:run __tests__/queries/tasks.test.ts
```

Expected: FAIL — module `@/lib/queries/tasks` not found.

- [ ] **Step 3: Implement task queries**

Create `lib/queries/tasks.ts`:

```typescript
import { eq, and, or, lte, inArray, sql } from 'drizzle-orm'
import { tasks, dailyLogs, projects } from '@/db/schema'
import { generateId } from '@/lib/ulid'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import type * as schema from '@/db/schema'

type DB = BetterSQLite3Database<typeof schema>

export type TaskWithMeta = typeof tasks.$inferSelect & {
  isRolledOver: boolean
  projectName?: string | null
  projectColor?: string | null
}

interface GetTasksOptions {
  statuses?: string[]
  projectId?: string
}

export function getTasksForDate(
  db: DB,
  date: string,
  options?: GetTasksOptions
): TaskWithMeta[] {
  const { statuses, projectId } = options ?? {}

  // If filtering by specific statuses, return those directly (for archive)
  if (statuses?.length) {
    const conditions = [inArray(tasks.status, statuses)]
    if (projectId) conditions.push(eq(tasks.projectId, projectId))

    const result = db
      .select({
        task: tasks,
        projectName: projects.name,
        projectColor: projects.color,
      })
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .where(and(...conditions))
      .orderBy(tasks.sortOrder)
      .all()

    return result.map((r) => ({
      ...r.task,
      isRolledOver: false,
      projectName: r.projectName,
      projectColor: r.projectColor,
    }))
  }

  // Default: get active tasks for this date using rollover rules
  const allActive = db
    .select({
      task: tasks,
      projectName: projects.name,
      projectColor: projects.color,
      hasRecentLog: sql<number>`EXISTS (
        SELECT 1 FROM daily_logs
        WHERE daily_logs.task_id = tasks.id
        AND daily_logs.date >= date(${date}, '-7 days')
        AND daily_logs.date < ${date}
      )`.as('has_recent_log'),
    })
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .where(
      and(
        inArray(tasks.status, ['pending', 'in_progress']),
        ...(projectId ? [eq(tasks.projectId, projectId)] : []),
        or(
          // Rule 1: due today or overdue
          lte(tasks.dueDate, date),
          // Rule 2: has recent daily_log activity
          sql`EXISTS (
            SELECT 1 FROM daily_logs
            WHERE daily_logs.task_id = tasks.id
            AND daily_logs.date >= date(${date}, '-7 days')
            AND daily_logs.date < ${date}
          )`,
          // Rule 3: no due date (always shows)
          sql`${tasks.dueDate} IS NULL`
        )
      )
    )
    .orderBy(tasks.sortOrder)
    .all()

  return allActive.map((r) => {
    const isOverdue =
      r.task.dueDate !== null && r.task.dueDate < date
    const hasRecentLog = r.hasRecentLog === 1
    const isRolledOver = isOverdue || hasRecentLog

    return {
      ...r.task,
      isRolledOver,
      projectName: r.projectName,
      projectColor: r.projectColor,
    }
  })
}

export function createTask(
  db: DB,
  data: {
    title: string
    description?: string
    projectId?: string
    dueDate?: string
  }
) {
  const now = Date.now()
  const id = generateId()

  db.insert(tasks)
    .values({
      id,
      title: data.title,
      description: data.description ?? null,
      projectId: data.projectId ?? null,
      dueDate: data.dueDate ?? null,
      status: 'pending',
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
    })
    .run()

  return db.select().from(tasks).where(eq(tasks.id, id)).get()!
}

export function updateTask(
  db: DB,
  id: string,
  data: {
    title?: string
    description?: string
    status?: string
    projectId?: string
    dueDate?: string
    sortOrder?: number
  }
) {
  const now = Date.now()
  const updates: Record<string, any> = { updatedAt: now }

  if (data.title !== undefined) updates.title = data.title
  if (data.description !== undefined) updates.description = data.description
  if (data.projectId !== undefined) updates.projectId = data.projectId
  if (data.dueDate !== undefined) updates.dueDate = data.dueDate
  if (data.sortOrder !== undefined) updates.sortOrder = data.sortOrder

  if (data.status !== undefined) {
    updates.status = data.status
    if (data.status === 'completed') updates.completedAt = now
    if (data.status === 'abandoned') updates.abandonedAt = now
  }

  db.update(tasks).set(updates).where(eq(tasks.id, id)).run()
  return db.select().from(tasks).where(eq(tasks.id, id)).get()!
}

export function deleteTask(db: DB, id: string) {
  db.delete(tasks).where(eq(tasks.id, id)).run()
}
```

- [ ] **Step 4: Run tests**

```bash
pnpm test:run __tests__/queries/tasks.test.ts
```

Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/queries/tasks.ts __tests__/queries/tasks.test.ts
git commit -m "feat: add task query layer with rollover logic and tests"
```

---

## Task 4: Query Layer — Projects, Follow-ups, Daily Logs

**Files:**
- Create: `lib/queries/projects.ts`, `lib/queries/follow-ups.ts`, `lib/queries/daily-logs.ts`
- Test: `__tests__/queries/projects.test.ts`, `__tests__/queries/follow-ups.test.ts`

- [ ] **Step 1: Write project query tests**

Create `__tests__/queries/projects.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from '@/db/schema'
import {
  getProjects,
  createProject,
  updateProject,
  getProjectWithStats,
} from '@/lib/queries/projects'

function createTestDb() {
  const sqlite = new Database(':memory:')
  sqlite.pragma('foreign_keys = ON')
  const db = drizzle(sqlite, { schema })
  migrate(db, { migrationsFolder: './db/migrations' })
  return { sqlite, db }
}

describe('projects', () => {
  let sqlite: Database.Database
  let db: ReturnType<typeof drizzle>

  beforeEach(() => {
    const result = createTestDb()
    sqlite = result.sqlite
    db = result.db
  })

  afterEach(() => sqlite.close())

  it('creates and lists projects', () => {
    createProject(db, { name: 'Test', color: '#14b8a6' })
    const projects = getProjects(db)
    expect(projects).toHaveLength(1)
    expect(projects[0].name).toBe('Test')
  })

  it('filters by status', () => {
    createProject(db, { name: 'Active', color: '#14b8a6' })
    const p = createProject(db, { name: 'Archived', color: '#3b82f6' })
    updateProject(db, p.id, { status: 'archived' })

    expect(getProjects(db, 'active')).toHaveLength(1)
    expect(getProjects(db, 'archived')).toHaveLength(1)
  })

  it('gets project with task stats', () => {
    const project = createProject(db, { name: 'Test', color: '#14b8a6' })
    const { createTask } = require('@/lib/queries/tasks')
    createTask(db, { title: 'T1', projectId: project.id })
    const t2 = createTask(db, { title: 'T2', projectId: project.id })
    const { updateTask } = require('@/lib/queries/tasks')
    updateTask(db, t2.id, { status: 'completed' })

    const stats = getProjectWithStats(db, project.id)
    expect(stats?.totalTasks).toBe(2)
    expect(stats?.completedTasks).toBe(1)
  })
})
```

- [ ] **Step 2: Write follow-up query tests**

Create `__tests__/queries/follow-ups.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from '@/db/schema'
import {
  getFollowUps,
  createFollowUp,
  updateFollowUp,
  deleteFollowUp,
} from '@/lib/queries/follow-ups'

function createTestDb() {
  const sqlite = new Database(':memory:')
  sqlite.pragma('foreign_keys = ON')
  const db = drizzle(sqlite, { schema })
  migrate(db, { migrationsFolder: './db/migrations' })
  return { sqlite, db }
}

describe('follow-ups', () => {
  let sqlite: Database.Database
  let db: ReturnType<typeof drizzle>

  beforeEach(() => {
    const result = createTestDb()
    sqlite = result.sqlite
    db = result.db
  })

  afterEach(() => sqlite.close())

  it('creates a time-based follow-up', () => {
    const fu = createFollowUp(db, {
      title: 'Check deploy',
      triggerType: 'time',
      triggerDate: '2026-03-17',
    })
    expect(fu.triggerType).toBe('time')
    expect(fu.status).toBe('active')
  })

  it('lists active follow-ups for a date (includes overdue)', () => {
    createFollowUp(db, {
      title: 'Due today',
      triggerType: 'time',
      triggerDate: '2026-03-17',
    })
    createFollowUp(db, {
      title: 'Overdue',
      triggerType: 'time',
      triggerDate: '2026-03-15',
    })
    createFollowUp(db, {
      title: 'Future',
      triggerType: 'time',
      triggerDate: '2026-03-20',
    })

    const fus = getFollowUps(db, { date: '2026-03-17' })
    expect(fus.filter((f) => f.isDueOrOverdue)).toHaveLength(2)
  })

  it('resolves a follow-up', () => {
    const fu = createFollowUp(db, {
      title: 'To resolve',
      triggerType: 'time',
      triggerDate: '2026-03-17',
    })
    const updated = updateFollowUp(db, fu.id, { status: 'resolved' })
    expect(updated.status).toBe('resolved')
    expect(updated.resolvedAt).toBeDefined()
  })

  it('dismisses a follow-up', () => {
    const fu = createFollowUp(db, {
      title: 'To dismiss',
      triggerType: 'time',
      triggerDate: '2026-03-17',
    })
    const updated = updateFollowUp(db, fu.id, { status: 'dismissed' })
    expect(updated.status).toBe('dismissed')
  })

  it('snoozes by updating trigger_date', () => {
    const fu = createFollowUp(db, {
      title: 'Snooze me',
      triggerType: 'time',
      triggerDate: '2026-03-17',
    })
    const updated = updateFollowUp(db, fu.id, {
      triggerDate: '2026-03-20',
    })
    expect(updated.triggerDate).toBe('2026-03-20')
  })

  it('deletes a follow-up', () => {
    const fu = createFollowUp(db, {
      title: 'Delete me',
      triggerType: 'time',
      triggerDate: '2026-03-17',
    })
    deleteFollowUp(db, fu.id)
    const fus = getFollowUps(db)
    expect(fus).toHaveLength(0)
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
pnpm test:run __tests__/queries/projects.test.ts __tests__/queries/follow-ups.test.ts
```

Expected: FAIL — modules not found.

- [ ] **Step 4: Implement project queries**

Create `lib/queries/projects.ts`:

```typescript
import { eq, sql } from 'drizzle-orm'
import { projects, tasks } from '@/db/schema'
import { generateId } from '@/lib/ulid'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import type * as schema from '@/db/schema'

type DB = BetterSQLite3Database<typeof schema>

export function getProjects(db: DB, status?: string) {
  if (status) {
    return db
      .select()
      .from(projects)
      .where(eq(projects.status, status))
      .all()
  }
  return db.select().from(projects).all()
}

export function createProject(
  db: DB,
  data: { name: string; color: string }
) {
  const now = Date.now()
  const id = generateId()

  db.insert(projects)
    .values({
      id,
      name: data.name,
      color: data.color,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    })
    .run()

  return db.select().from(projects).where(eq(projects.id, id)).get()!
}

export function updateProject(
  db: DB,
  id: string,
  data: { name?: string; color?: string; status?: string }
) {
  const now = Date.now()
  const updates: Record<string, any> = { updatedAt: now }

  if (data.name !== undefined) updates.name = data.name
  if (data.color !== undefined) updates.color = data.color
  if (data.status !== undefined) {
    updates.status = data.status
    if (data.status === 'archived') updates.archivedAt = now
  }

  db.update(projects).set(updates).where(eq(projects.id, id)).run()
  return db.select().from(projects).where(eq(projects.id, id)).get()!
}

export function getProjectWithStats(db: DB, id: string) {
  const project = db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .get()

  if (!project) return null

  const stats = db
    .select({
      totalTasks: sql<number>`count(*)`,
      completedTasks: sql<number>`sum(case when ${tasks.status} = 'completed' then 1 else 0 end)`,
    })
    .from(tasks)
    .where(eq(tasks.projectId, id))
    .get()!

  return {
    ...project,
    totalTasks: stats.totalTasks,
    completedTasks: stats.completedTasks ?? 0,
  }
}

export function getProjectsWithStats(db: DB, status?: string) {
  const projectList = getProjects(db, status)
  return projectList.map((p) => {
    const stats = db
      .select({
        totalTasks: sql<number>`count(*)`,
        completedTasks: sql<number>`sum(case when ${tasks.status} = 'completed' then 1 else 0 end)`,
      })
      .from(tasks)
      .where(eq(tasks.projectId, p.id))
      .get()!

    return {
      ...p,
      totalTasks: stats.totalTasks,
      completedTasks: stats.completedTasks ?? 0,
    }
  })
}
```

- [ ] **Step 5: Implement follow-up queries**

Create `lib/queries/follow-ups.ts`:

```typescript
import { eq, and, lte, or } from 'drizzle-orm'
import { followUps, tasks } from '@/db/schema'
import { generateId } from '@/lib/ulid'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import type * as schema from '@/db/schema'

type DB = BetterSQLite3Database<typeof schema>

export type FollowUpWithMeta = typeof followUps.$inferSelect & {
  isDueOrOverdue: boolean
  taskTitle?: string | null
}

interface GetFollowUpsOptions {
  date?: string
  taskId?: string
  status?: string
}

export function getFollowUps(db: DB, options?: GetFollowUpsOptions): FollowUpWithMeta[] {
  const conditions: any[] = []

  if (options?.status) {
    conditions.push(eq(followUps.status, options.status))
  }
  if (options?.taskId) {
    conditions.push(eq(followUps.taskId, options.taskId))
  }

  const result = db
    .select({
      followUp: followUps,
      taskTitle: tasks.title,
    })
    .from(followUps)
    .leftJoin(tasks, eq(followUps.taskId, tasks.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .all()

  return result.map((r) => ({
    ...r.followUp,
    taskTitle: r.taskTitle,
    isDueOrOverdue:
      r.followUp.status === 'active' &&
      r.followUp.triggerType === 'time' &&
      r.followUp.triggerDate !== null &&
      options?.date !== undefined &&
      r.followUp.triggerDate <= options.date,
  }))
}

export function createFollowUp(
  db: DB,
  data: {
    title: string
    taskId?: string
    triggerType: 'time' | 'completion'
    triggerDate?: string
    triggerCondition?: string
  }
) {
  const now = Date.now()
  const id = generateId()

  db.insert(followUps)
    .values({
      id,
      title: data.title,
      taskId: data.taskId ?? null,
      status: 'active',
      triggerType: data.triggerType,
      triggerDate: data.triggerDate ?? null,
      triggerCondition: data.triggerCondition ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .run()

  return db.select().from(followUps).where(eq(followUps.id, id)).get()!
}

export function updateFollowUp(
  db: DB,
  id: string,
  data: { status?: string; triggerDate?: string; title?: string }
) {
  const now = Date.now()
  const updates: Record<string, any> = { updatedAt: now }

  if (data.title !== undefined) updates.title = data.title
  if (data.triggerDate !== undefined) updates.triggerDate = data.triggerDate
  if (data.status !== undefined) {
    updates.status = data.status
    if (data.status === 'resolved' || data.status === 'dismissed') {
      updates.resolvedAt = now
    }
  }

  db.update(followUps).set(updates).where(eq(followUps.id, id)).run()
  return db.select().from(followUps).where(eq(followUps.id, id)).get()!
}

export function deleteFollowUp(db: DB, id: string) {
  db.delete(followUps).where(eq(followUps.id, id)).run()
}
```

- [ ] **Step 6: Implement daily log queries**

Create `lib/queries/daily-logs.ts`:

```typescript
import { eq } from 'drizzle-orm'
import { dailyLogs } from '@/db/schema'
import { generateId } from '@/lib/ulid'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import type * as schema from '@/db/schema'

type DB = BetterSQLite3Database<typeof schema>

export function createDailyLog(
  db: DB,
  data: { taskId: string; date?: string; note?: string }
) {
  const now = Date.now()
  const id = generateId()
  const date = data.date ?? new Date().toISOString().split('T')[0]

  db.insert(dailyLogs)
    .values({
      id,
      taskId: data.taskId,
      date,
      note: data.note ?? null,
      createdAt: now,
    })
    .run()

  return db.select().from(dailyLogs).where(eq(dailyLogs.id, id)).get()!
}

export function deleteDailyLog(db: DB, id: string) {
  db.delete(dailyLogs).where(eq(dailyLogs.id, id)).run()
}
```

- [ ] **Step 7: Run all query tests**

```bash
pnpm test:run __tests__/queries/
```

Expected: All PASS.

- [ ] **Step 8: Commit**

```bash
git add lib/queries/ __tests__/queries/
git commit -m "feat: add query layers for projects, follow-ups, and daily logs"
```

---

## Task 5: API Route Handlers — Tasks, Projects, Follow-ups, Daily Logs

**Files:**
- Create: `app/api/tasks/route.ts`, `app/api/tasks/[id]/route.ts`
- Create: `app/api/projects/route.ts`, `app/api/projects/[id]/route.ts`
- Create: `app/api/follow-ups/route.ts`, `app/api/follow-ups/[id]/route.ts`
- Create: `app/api/daily-logs/route.ts`, `app/api/daily-logs/[id]/route.ts`
- Test: `__tests__/api/tasks.test.ts`, `__tests__/api/projects.test.ts`

- [ ] **Step 1: Write tasks API integration tests**

Create `__tests__/api/tasks.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from '@/db/schema'
import { createTask, getTasksForDate, updateTask } from '@/lib/queries/tasks'

// NOTE: API route handlers import `db` from '@/db'. For integration tests,
// we test the query layer directly (which the API routes delegate to).
// E2E tests via fetch against the dev server can be added later.

describe('tasks API integration', () => {
  let sqlite: Database.Database
  let db: ReturnType<typeof drizzle>

  beforeEach(() => {
    sqlite = new Database(':memory:')
    sqlite.pragma('foreign_keys = ON')
    db = drizzle(sqlite, { schema })
    migrate(db, { migrationsFolder: './db/migrations' })
  })

  afterEach(() => sqlite.close())

  it('full lifecycle: create, list, update status, complete', () => {
    const task = createTask(db, { title: 'API test task', dueDate: '2026-03-17' })
    expect(task.status).toBe('pending')

    let tasks = getTasksForDate(db, '2026-03-17')
    expect(tasks).toHaveLength(1)

    const updated = updateTask(db, task.id, { status: 'in_progress' })
    expect(updated.status).toBe('in_progress')

    const completed = updateTask(db, task.id, { status: 'completed' })
    expect(completed.status).toBe('completed')
    expect(completed.completedAt).toBeDefined()

    tasks = getTasksForDate(db, '2026-03-17')
    expect(tasks).toHaveLength(0) // completed tasks excluded from default view
  })
})
```

- [ ] **Step 2: Run test to verify it passes (query layer already works)**

```bash
pnpm test:run __tests__/api/tasks.test.ts
```

Expected: PASS.

- [ ] **Step 3: Implement tasks API routes**

Create `app/api/tasks/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { getTasksForDate, createTask } from '@/lib/queries/tasks'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]
  const projectId = searchParams.get('project_id') ?? undefined
  const statusParam = searchParams.get('status')
  const statuses = statusParam?.split(',').filter(Boolean)

  const tasks = getTasksForDate(db, date, { statuses, projectId })
  return NextResponse.json(tasks)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const task = createTask(db, {
    title: body.title,
    description: body.description,
    projectId: body.project_id,
    dueDate: body.due_date,
  })
  return NextResponse.json(task, { status: 201 })
}
```

Create `app/api/tasks/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { updateTask, deleteTask } from '@/lib/queries/tasks'
import { tasks } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const task = db.select().from(tasks).where(eq(tasks.id, id)).get()
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(task)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const task = updateTask(db, id, {
    title: body.title,
    description: body.description,
    status: body.status,
    projectId: body.project_id,
    dueDate: body.due_date,
    sortOrder: body.sort_order,
  })
  return NextResponse.json(task)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  deleteTask(db, id)
  return new NextResponse(null, { status: 204 })
}
```

- [ ] **Step 4: Implement projects API routes**

Create `app/api/projects/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { getProjectsWithStats, createProject } from '@/lib/queries/projects'

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get('status') ?? undefined
  const projects = getProjectsWithStats(db, status)
  return NextResponse.json(projects)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const project = createProject(db, {
    name: body.name,
    color: body.color,
  })
  return NextResponse.json(project, { status: 201 })
}
```

Create `app/api/projects/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { updateProject, getProjectWithStats } from '@/lib/queries/projects'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const project = updateProject(db, id, {
    name: body.name,
    color: body.color,
    status: body.status,
  })
  return NextResponse.json(project)
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const project = getProjectWithStats(db, id)
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(project)
}
```

- [ ] **Step 5: Implement follow-ups API routes**

Create `app/api/follow-ups/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { getFollowUps, createFollowUp } from '@/lib/queries/follow-ups'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const date = searchParams.get('date') ?? undefined
  const taskId = searchParams.get('task_id') ?? undefined
  const status = searchParams.get('status') ?? undefined

  const followUps = getFollowUps(db, { date, taskId, status })
  return NextResponse.json(followUps)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const followUp = createFollowUp(db, {
    title: body.title,
    taskId: body.task_id,
    triggerType: body.trigger_type,
    triggerDate: body.trigger_date,
    triggerCondition: body.trigger_condition,
  })
  return NextResponse.json(followUp, { status: 201 })
}
```

Create `app/api/follow-ups/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { updateFollowUp, deleteFollowUp } from '@/lib/queries/follow-ups'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const followUp = updateFollowUp(db, id, {
    status: body.status,
    triggerDate: body.trigger_date,
    title: body.title,
  })
  return NextResponse.json(followUp)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  deleteFollowUp(db, id)
  return new NextResponse(null, { status: 204 })
}
```

- [ ] **Step 6: Implement daily logs API routes**

Create `app/api/daily-logs/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { createDailyLog } from '@/lib/queries/daily-logs'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const log = createDailyLog(db, {
    taskId: body.task_id,
    date: body.date,
    note: body.note,
  })
  return NextResponse.json(log, { status: 201 })
}
```

Create `app/api/daily-logs/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { deleteDailyLog } from '@/lib/queries/daily-logs'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  deleteDailyLog(db, id)
  return new NextResponse(null, { status: 204 })
}
```

- [ ] **Step 7: Verify dev server starts with API routes**

```bash
pnpm dev
```

Test in another terminal:

```bash
curl http://localhost:3000/api/tasks
curl http://localhost:3000/api/projects
curl http://localhost:3000/api/follow-ups
```

Expected: JSON arrays returned for each. Stop the server.

- [ ] **Step 8: Commit**

```bash
git add app/api/
git commit -m "feat: add REST API route handlers for tasks, projects, follow-ups, daily logs"
```

---

## Task 6: Calendar and Analytics API Routes

**Files:**
- Create: `lib/queries/calendar.ts`, `lib/queries/analytics.ts`
- Create: `app/api/calendar/route.ts`, `app/api/calendar/[date]/route.ts`
- Create: `app/api/analytics/productivity/route.ts`, `app/api/analytics/project-focus/route.ts`, `app/api/analytics/follow-through/route.ts`
- Test: `__tests__/queries/analytics.test.ts`

- [ ] **Step 1: Write analytics tests**

Create `__tests__/queries/analytics.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from '@/db/schema'
import { createTask, updateTask } from '@/lib/queries/tasks'
import { createProject } from '@/lib/queries/projects'
import { createDailyLog } from '@/lib/queries/daily-logs'
import {
  getProductivityStats,
  getProjectFocusStats,
  getFollowThroughStats,
} from '@/lib/queries/analytics'

function createTestDb() {
  const sqlite = new Database(':memory:')
  sqlite.pragma('foreign_keys = ON')
  const db = drizzle(sqlite, { schema })
  migrate(db, { migrationsFolder: './db/migrations' })
  return { sqlite, db }
}

describe('analytics', () => {
  let sqlite: Database.Database
  let db: ReturnType<typeof drizzle>

  beforeEach(() => {
    const result = createTestDb()
    sqlite = result.sqlite
    db = result.db
  })

  afterEach(() => sqlite.close())

  it('calculates productivity stats', () => {
    const task = createTask(db, { title: 'Done', dueDate: '2026-03-17' })
    updateTask(db, task.id, { status: 'completed' })

    const stats = getProductivityStats(db, {
      from: '2026-03-01',
      to: '2026-03-31',
    })
    expect(stats.completedByDay.length).toBeGreaterThan(0)
  })

  it('calculates project focus stats', () => {
    const project = createProject(db, { name: 'P1', color: '#14b8a6' })
    const task = createTask(db, { title: 'T1', projectId: project.id })
    createDailyLog(db, { taskId: task.id, date: '2026-03-17' })

    const stats = getProjectFocusStats(db, {
      from: '2026-03-01',
      to: '2026-03-31',
    })
    expect(stats.logsByProject.length).toBeGreaterThan(0)
  })

  it('calculates follow-through stats', () => {
    const task = createTask(db, { title: 'T1' })
    createDailyLog(db, { taskId: task.id, date: '2026-03-15' })
    createDailyLog(db, { taskId: task.id, date: '2026-03-16' })
    createDailyLog(db, { taskId: task.id, date: '2026-03-17' })
    updateTask(db, task.id, { status: 'completed' })

    const stats = getFollowThroughStats(db, {
      from: '2026-03-01',
      to: '2026-03-31',
    })
    expect(stats.avgRolloverCount).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test:run __tests__/queries/analytics.test.ts
```

Expected: FAIL — modules not found.

- [ ] **Step 3: Implement calendar queries**

Create `lib/queries/calendar.ts`:

```typescript
import { eq, and, between, sql } from 'drizzle-orm'
import { tasks, dailyLogs, projects } from '@/db/schema'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import type * as schema from '@/db/schema'

type DB = BetterSQLite3Database<typeof schema>

export function getCalendarDateDetail(db: DB, date: string) {
  const logs = db
    .select({
      log: dailyLogs,
      taskTitle: tasks.title,
      taskStatus: tasks.status,
      projectName: projects.name,
      projectColor: projects.color,
    })
    .from(dailyLogs)
    .innerJoin(tasks, eq(dailyLogs.taskId, tasks.id))
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .where(eq(dailyLogs.date, date))
    .all()

  return logs
}

export function getCalendarRangeSummary(
  db: DB,
  from: string,
  to: string
) {
  const summary = db
    .select({
      date: dailyLogs.date,
      taskCount: sql<number>`count(distinct ${dailyLogs.taskId})`,
      projectIds: sql<string>`group_concat(distinct ${tasks.projectId})`,
      hasCompletions: sql<number>`max(case when ${tasks.status} = 'completed' then 1 else 0 end)`,
    })
    .from(dailyLogs)
    .innerJoin(tasks, eq(dailyLogs.taskId, tasks.id))
    .where(between(dailyLogs.date, from, to))
    .groupBy(dailyLogs.date)
    .all()

  return summary.map((s) => ({
    date: s.date,
    taskCount: s.taskCount,
    projectIds: s.projectIds?.split(',').filter(Boolean) ?? [],
    hasCompletions: s.hasCompletions === 1,
  }))
}
```

- [ ] **Step 4: Implement analytics queries**

Create `lib/queries/analytics.ts`:

```typescript
import { eq, and, between, sql, inArray } from 'drizzle-orm'
import { tasks, dailyLogs, projects, followUps } from '@/db/schema'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import type * as schema from '@/db/schema'

type DB = BetterSQLite3Database<typeof schema>

interface DateRange {
  from: string
  to: string
  projectId?: string
}

export function getProductivityStats(db: DB, range: DateRange) {
  const conditions = [
    inArray(tasks.status, ['completed']),
    sql`date(${tasks.completedAt} / 1000, 'unixepoch') BETWEEN ${range.from} AND ${range.to}`,
  ]
  if (range.projectId) {
    conditions.push(eq(tasks.projectId, range.projectId))
  }

  const completedByDay = db
    .select({
      date: sql<string>`date(${tasks.completedAt} / 1000, 'unixepoch')`.as('completion_date'),
      count: sql<number>`count(*)`,
    })
    .from(tasks)
    .where(and(...conditions))
    .groupBy(sql`completion_date`)
    .all()

  // Busiest day of week
  const busiestDay = db
    .select({
      dayOfWeek: sql<number>`cast(strftime('%w', date(${tasks.completedAt} / 1000, 'unixepoch')) as integer)`,
      count: sql<number>`count(*)`,
    })
    .from(tasks)
    .where(and(...conditions))
    .groupBy(sql`dayOfWeek`)
    .all()

  // Completion streak (consecutive days with completions)
  const allDates = completedByDay.map((d) => d.date).sort()
  let maxStreak = 0
  let currentStreak = 0
  for (let i = 0; i < allDates.length; i++) {
    if (i === 0) {
      currentStreak = 1
    } else {
      const prev = new Date(allDates[i - 1])
      const curr = new Date(allDates[i])
      const diffDays = (curr.getTime() - prev.getTime()) / 86400000
      currentStreak = diffDays === 1 ? currentStreak + 1 : 1
    }
    maxStreak = Math.max(maxStreak, currentStreak)
  }

  return { completedByDay, busiestDay, maxStreak, currentStreak }
}

export function getProjectFocusStats(db: DB, range: DateRange) {
  const logsByProject = db
    .select({
      projectId: tasks.projectId,
      projectName: projects.name,
      projectColor: projects.color,
      logCount: sql<number>`count(*)`,
    })
    .from(dailyLogs)
    .innerJoin(tasks, eq(dailyLogs.taskId, tasks.id))
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .where(between(dailyLogs.date, range.from, range.to))
    .groupBy(tasks.projectId)
    .all()

  // Project durations
  const projectDurations = db
    .select({
      projectId: tasks.projectId,
      projectName: projects.name,
      firstTask: sql<number>`min(${tasks.createdAt})`,
      lastCompletion: sql<number>`max(${tasks.completedAt})`,
    })
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .where(sql`${tasks.projectId} IS NOT NULL`)
    .groupBy(tasks.projectId)
    .all()

  return { logsByProject, projectDurations }
}

export function getFollowThroughStats(db: DB, range: DateRange) {
  const conditions = [
    eq(tasks.status, 'completed'),
    sql`date(${tasks.completedAt} / 1000, 'unixepoch') BETWEEN ${range.from} AND ${range.to}`,
  ]
  if (range.projectId) {
    conditions.push(eq(tasks.projectId, range.projectId))
  }

  // Rollover count per completed task = number of daily_log entries
  const rolloverData = db
    .select({
      taskId: tasks.id,
      title: tasks.title,
      logDays: sql<number>`(SELECT count(*) FROM daily_logs WHERE daily_logs.task_id = tasks.id)`,
      createdAt: tasks.createdAt,
      completedAt: tasks.completedAt,
    })
    .from(tasks)
    .where(and(...conditions))
    .all()

  const rolloverCounts = rolloverData.map((t) => t.logDays)
  const avgRolloverCount =
    rolloverCounts.length > 0
      ? rolloverCounts.reduce((a, b) => a + b, 0) / rolloverCounts.length
      : 0

  const stuckTasks = rolloverData.filter((t) => t.logDays >= 3)

  // Average time from creation to completion (in days)
  const durations = rolloverData
    .filter((t) => t.completedAt)
    .map((t) => (t.completedAt! - t.createdAt) / 86400000)
  const avgDaysToComplete =
    durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0

  // Abandonment rate
  const abandonedCount = db
    .select({ count: sql<number>`count(*)` })
    .from(tasks)
    .where(
      and(
        eq(tasks.status, 'abandoned'),
        sql`date(${tasks.abandonedAt} / 1000, 'unixepoch') BETWEEN ${range.from} AND ${range.to}`
      )
    )
    .get()!

  const totalFinished = rolloverData.length + (abandonedCount.count ?? 0)
  const abandonmentRate =
    totalFinished > 0 ? (abandonedCount.count ?? 0) / totalFinished : 0

  return {
    avgRolloverCount,
    stuckTasks,
    avgDaysToComplete,
    abandonmentRate,
    totalCompleted: rolloverData.length,
    totalAbandoned: abandonedCount.count ?? 0,
  }
}
```

- [ ] **Step 5: Run analytics tests**

```bash
pnpm test:run __tests__/queries/analytics.test.ts
```

Expected: All PASS.

- [ ] **Step 6: Implement calendar API routes**

Create `app/api/calendar/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { getCalendarRangeSummary } from '@/lib/queries/calendar'

export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get('from')
  const to = request.nextUrl.searchParams.get('to')

  if (!from || !to) {
    return NextResponse.json(
      { error: 'from and to query params required' },
      { status: 400 }
    )
  }

  const summary = getCalendarRangeSummary(db, from, to)
  return NextResponse.json(summary)
}
```

Create `app/api/calendar/[date]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { getCalendarDateDetail } from '@/lib/queries/calendar'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params
  const detail = getCalendarDateDetail(db, date)
  return NextResponse.json(detail)
}
```

- [ ] **Step 7: Implement analytics API routes**

Create `app/api/analytics/productivity/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { getProductivityStats } from '@/lib/queries/analytics'

export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get('from') ?? new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  const to = request.nextUrl.searchParams.get('to') ?? new Date().toISOString().split('T')[0]
  const projectId = request.nextUrl.searchParams.get('project_id') ?? undefined

  const stats = getProductivityStats(db, { from, to, projectId })
  return NextResponse.json(stats)
}
```

Create `app/api/analytics/project-focus/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { getProjectFocusStats } from '@/lib/queries/analytics'

export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get('from') ?? new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  const to = request.nextUrl.searchParams.get('to') ?? new Date().toISOString().split('T')[0]

  const stats = getProjectFocusStats(db, { from, to })
  return NextResponse.json(stats)
}
```

Create `app/api/analytics/follow-through/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { getFollowThroughStats } from '@/lib/queries/analytics'

export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get('from') ?? new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  const to = request.nextUrl.searchParams.get('to') ?? new Date().toISOString().split('T')[0]
  const projectId = request.nextUrl.searchParams.get('project_id') ?? undefined

  const stats = getFollowThroughStats(db, { from, to, projectId })
  return NextResponse.json(stats)
}
```

- [ ] **Step 8: Commit**

```bash
git add lib/queries/calendar.ts lib/queries/analytics.ts app/api/calendar/ app/api/analytics/ __tests__/queries/analytics.test.ts
git commit -m "feat: add calendar and analytics API routes with query layer"
```

---

## Task 7: App Shell — Layout, Navigation, Dark Theme

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/nav-bar.tsx`
- Create: `lib/utils.ts` (if not already created by shadcn)
- Modify: `app/globals.css` (or equivalent Tailwind entry)

- [ ] **Step 1: Update root layout with dark theme and nav**

Modify `app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import './globals.css'
import { NavBar } from '@/components/nav-bar'

export const metadata: Metadata = {
  title: 'cal.voz.dev',
  description: 'Personal productivity dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans bg-zinc-950 text-zinc-100 min-h-screen">
        <NavBar />
        <main className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Create NavBar component**

Create `components/nav-bar.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  FolderKanban,
  BarChart3,
  Archive,
} from 'lucide-react'

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/archive', label: 'Archive', icon: Archive },
]

export function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-14 gap-1">
        <Link
          href="/"
          className="text-sm font-semibold text-teal-400 mr-6"
        >
          cal.voz.dev
        </Link>
        {links.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

- [ ] **Step 3: Clean up default page content**

Replace `app/page.tsx` with a placeholder:

```tsx
export default function DashboardPage() {
  return (
    <div className="text-zinc-400 text-sm">
      Dashboard — coming next
    </div>
  )
}
```

- [ ] **Step 4: Create placeholder pages for all routes**

Create `app/calendar/page.tsx`:

```tsx
export default function CalendarPage() {
  return <div className="text-zinc-400 text-sm">Calendar — coming soon</div>
}
```

Create `app/projects/page.tsx`:

```tsx
export default function ProjectsPage() {
  return <div className="text-zinc-400 text-sm">Projects — coming soon</div>
}
```

Create `app/analytics/page.tsx`:

```tsx
export default function AnalyticsPage() {
  return <div className="text-zinc-400 text-sm">Analytics — coming soon</div>
}
```

Create `app/archive/page.tsx`:

```tsx
export default function ArchivePage() {
  return <div className="text-zinc-400 text-sm">Archive — coming soon</div>
}
```

- [ ] **Step 5: Verify navigation works**

```bash
pnpm dev
```

Open `http://localhost:3000`. Verify: dark theme, nav bar with 5 links, each link navigates to its page. Stop server.

- [ ] **Step 6: Commit**

```bash
git add app/ components/nav-bar.tsx
git commit -m "feat: add app shell with dark theme, nav bar, and placeholder pages"
```

---

## Task 8: Dashboard — Tasks Column

**Files:**
- Create: `components/task-list.tsx`, `components/task-row.tsx`, `components/task-quick-add.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create TaskRow component**

Create `components/task-row.tsx`:

```tsx
'use client'

import { cn } from '@/lib/utils'

interface TaskRowProps {
  id: string
  title: string
  status: 'pending' | 'in_progress' | 'completed' | 'abandoned'
  isRolledOver: boolean
  projectName?: string | null
  projectColor?: string | null
  onStatusChange: (id: string, newStatus: string) => void
  onClick: (id: string) => void
}

const statusIcons: Record<string, string> = {
  pending: '○',
  in_progress: '▶',
  completed: '✓',
  abandoned: '✕',
}

const nextStatus: Record<string, string> = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'pending',
}

export function TaskRow({
  id,
  title,
  status,
  isRolledOver,
  projectName,
  projectColor,
  onStatusChange,
  onClick,
}: TaskRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-md bg-zinc-800/50 hover:bg-zinc-800 transition-colors cursor-pointer group',
        isRolledOver && 'border-l-2 border-amber-500',
        status === 'completed' && 'opacity-50'
      )}
      onClick={() => onClick(id)}
    >
      {projectColor && (
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: projectColor }}
        />
      )}
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'text-sm truncate',
            status === 'completed' && 'line-through text-zinc-500'
          )}
        >
          {isRolledOver && (
            <span className="text-amber-400 mr-1">↻</span>
          )}
          {title}
        </div>
        {projectName && (
          <div className="text-xs text-zinc-500 truncate">
            {projectName}
            {status === 'in_progress' && ' · In progress'}
          </div>
        )}
      </div>
      <button
        className={cn(
          'text-xs flex-shrink-0 w-6 h-6 flex items-center justify-center rounded transition-colors',
          status === 'completed'
            ? 'text-green-400 bg-zinc-900'
            : status === 'in_progress'
              ? 'text-teal-400 bg-zinc-900'
              : 'text-zinc-500 bg-zinc-900 hover:text-zinc-300'
        )}
        onClick={(e) => {
          e.stopPropagation()
          const next = nextStatus[status]
          if (next) onStatusChange(id, next)
        }}
      >
        {statusIcons[status]}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Create TaskQuickAdd component**

Create `components/task-quick-add.tsx`:

```tsx
'use client'

import { useState } from 'react'

interface TaskQuickAddProps {
  onAdd: (title: string) => void
}

export function TaskQuickAdd({ onAdd }: TaskQuickAddProps) {
  const [title, setTitle] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task..."
        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
      />
    </form>
  )
}
```

- [ ] **Step 3: Create TaskList component**

Create `components/task-list.tsx`:

```tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { TaskRow } from './task-row'
import { TaskQuickAdd } from './task-quick-add'

interface Task {
  id: string
  title: string
  status: 'pending' | 'in_progress' | 'completed' | 'abandoned'
  isRolledOver: boolean
  projectName?: string | null
  projectColor?: string | null
}

interface TaskListProps {
  date: string
  onTaskClick: (id: string) => void
}

export function TaskList({ date, onTaskClick }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])

  const fetchTasks = useCallback(async () => {
    const res = await fetch(`/api/tasks?date=${date}`)
    const data = await res.json()
    setTasks(data)
  }, [date])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  async function handleAdd(title: string) {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, due_date: date }),
    })
    fetchTasks()
  }

  async function handleStatusChange(id: string, newStatus: string) {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    fetchTasks()
  }

  const activeTasks = tasks.filter((t) => t.status !== 'completed')
  const completedTasks = tasks.filter((t) => t.status === 'completed')

  return (
    <div className="bg-zinc-900 rounded-lg p-4 flex flex-col h-full">
      <h3 className="text-[10px] uppercase tracking-wider text-zinc-500 mb-3">
        Today's Tasks
      </h3>
      <TaskQuickAdd onAdd={handleAdd} />
      <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
        {activeTasks.map((task) => (
          <TaskRow
            key={task.id}
            {...task}
            onStatusChange={handleStatusChange}
            onClick={onTaskClick}
          />
        ))}
        {completedTasks.length > 0 && (
          <>
            <div className="text-[10px] uppercase tracking-wider text-zinc-600 mt-3 mb-1">
              Completed
            </div>
            {completedTasks.map((task) => (
              <TaskRow
                key={task.id}
                {...task}
                onStatusChange={handleStatusChange}
                onClick={onTaskClick}
              />
            ))}
          </>
        )}
        {tasks.length === 0 && (
          <div className="text-sm text-zinc-600 text-center py-8">
            No tasks for this day
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify TaskList renders**

Update `app/page.tsx` temporarily:

```tsx
'use client'

import { TaskList } from '@/components/task-list'

export default function DashboardPage() {
  const today = new Date().toISOString().split('T')[0]
  return (
    <div className="max-w-md">
      <TaskList date={today} onTaskClick={(id) => console.log('clicked', id)} />
    </div>
  )
}
```

Run `pnpm dev`, seed the database (`pnpm db:seed`), verify tasks render with status cycling. Stop server.

- [ ] **Step 5: Commit**

```bash
git add components/task-row.tsx components/task-quick-add.tsx components/task-list.tsx app/page.tsx
git commit -m "feat: add task list, task row, and quick-add components for dashboard"
```

---

## Task 9: Dashboard — Follow-ups Column + Projects Column

**Files:**
- Create: `components/follow-up-list.tsx`, `components/follow-up-row.tsx`, `components/follow-up-quick-add.tsx`
- Create: `components/project-list.tsx`, `components/project-card.tsx`

- [ ] **Step 1: Create FollowUpRow component**

Create `components/follow-up-row.tsx`:

```tsx
'use client'

import { cn } from '@/lib/utils'

interface FollowUpRowProps {
  id: string
  title: string
  status: string
  triggerType: string
  triggerDate?: string | null
  triggerCondition?: string | null
  isDueOrOverdue: boolean
  taskTitle?: string | null
  onResolve: (id: string) => void
  onDismiss: (id: string) => void
}

export function FollowUpRow({
  id,
  title,
  triggerType,
  triggerDate,
  triggerCondition,
  isDueOrOverdue,
  taskTitle,
  onResolve,
  onDismiss,
}: FollowUpRowProps) {
  return (
    <div
      className={cn(
        'px-3 py-2.5 rounded-md border-l-2 transition-colors',
        isDueOrOverdue
          ? 'border-amber-500 bg-zinc-800/50'
          : 'border-zinc-700 bg-zinc-800/30 opacity-60'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              'text-sm',
              isDueOrOverdue ? 'text-zinc-100' : 'text-zinc-500'
            )}
          >
            {title}
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">
            {taskTitle && <span>{taskTitle} · </span>}
            {triggerType === 'time' && triggerDate}
            {triggerType === 'completion' && triggerCondition}
          </div>
        </div>
        {isDueOrOverdue && (
          <div className="flex gap-1 flex-shrink-0">
            <button
              className="text-xs text-green-400 hover:text-green-300 bg-zinc-900 px-2 py-1 rounded"
              onClick={() => onResolve(id)}
            >
              ✓
            </button>
            <button
              className="text-xs text-zinc-500 hover:text-zinc-300 bg-zinc-900 px-2 py-1 rounded"
              onClick={() => onDismiss(id)}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create FollowUpQuickAdd component**

Create `components/follow-up-quick-add.tsx`:

```tsx
'use client'

import { useState } from 'react'

interface FollowUpQuickAddProps {
  onAdd: (title: string, triggerDate: string) => void
}

export function FollowUpQuickAdd({ onAdd }: FollowUpQuickAddProps) {
  const [title, setTitle] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    const tomorrow = new Date(Date.now() + 86400000)
      .toISOString()
      .split('T')[0]
    onAdd(trimmed, tomorrow)
    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a follow-up..."
        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
      />
    </form>
  )
}
```

- [ ] **Step 3: Create FollowUpList component**

Create `components/follow-up-list.tsx`:

```tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { FollowUpRow } from './follow-up-row'
import { FollowUpQuickAdd } from './follow-up-quick-add'

interface FollowUp {
  id: string
  title: string
  status: string
  triggerType: string
  triggerDate?: string | null
  triggerCondition?: string | null
  isDueOrOverdue: boolean
  taskTitle?: string | null
}

interface FollowUpListProps {
  date: string
}

export function FollowUpList({ date }: FollowUpListProps) {
  const [followUps, setFollowUps] = useState<FollowUp[]>([])

  const fetchFollowUps = useCallback(async () => {
    const res = await fetch(`/api/follow-ups?date=${date}&status=active`)
    const data = await res.json()
    setFollowUps(data)
  }, [date])

  useEffect(() => {
    fetchFollowUps()
  }, [fetchFollowUps])

  async function handleAdd(title: string, triggerDate: string) {
    await fetch('/api/follow-ups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        trigger_type: 'time',
        trigger_date: triggerDate,
      }),
    })
    fetchFollowUps()
  }

  async function handleResolve(id: string) {
    await fetch(`/api/follow-ups/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved' }),
    })
    fetchFollowUps()
  }

  async function handleDismiss(id: string) {
    await fetch(`/api/follow-ups/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'dismissed' }),
    })
    fetchFollowUps()
  }

  const dueFollowUps = followUps.filter((f) => f.isDueOrOverdue)
  const futureFollowUps = followUps.filter((f) => !f.isDueOrOverdue)

  return (
    <div className="bg-zinc-900 rounded-lg p-4 flex flex-col h-full">
      <h3 className="text-[10px] uppercase tracking-wider text-zinc-500 mb-3">
        Follow-ups
      </h3>
      <FollowUpQuickAdd onAdd={handleAdd} />
      <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
        {dueFollowUps.map((fu) => (
          <FollowUpRow
            key={fu.id}
            {...fu}
            onResolve={handleResolve}
            onDismiss={handleDismiss}
          />
        ))}
        {futureFollowUps.length > 0 && (
          <>
            <div className="text-[10px] uppercase tracking-wider text-zinc-600 mt-3 mb-1">
              Upcoming
            </div>
            {futureFollowUps.map((fu) => (
              <FollowUpRow
                key={fu.id}
                {...fu}
                onResolve={handleResolve}
                onDismiss={handleDismiss}
              />
            ))}
          </>
        )}
        {followUps.length === 0 && (
          <div className="text-sm text-zinc-600 text-center py-8">
            No follow-ups
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create ProjectCard component**

Create `components/project-card.tsx`:

```tsx
'use client'

interface ProjectCardProps {
  id: string
  name: string
  color: string
  totalTasks: number
  completedTasks: number
  onClick: (id: string) => void
}

export function ProjectCard({
  id,
  name,
  color,
  totalTasks,
  completedTasks,
  onClick,
}: ProjectCardProps) {
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div
      className="px-3 py-2.5 bg-zinc-800/50 rounded-md cursor-pointer hover:bg-zinc-800 transition-colors"
      onClick={() => onClick(id)}
    >
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span>{name}</span>
        </div>
        <span className="text-zinc-500 text-xs">
          {completedTasks}/{totalTasks}
        </span>
      </div>
      <div className="h-1 bg-zinc-800 rounded-full mt-2">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progress}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create ProjectList component**

Create `components/project-list.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { ProjectCard } from './project-card'

interface Project {
  id: string
  name: string
  color: string
  totalTasks: number
  completedTasks: number
}

interface ProjectListProps {
  onProjectClick: (id: string) => void
}

export function ProjectList({ onProjectClick }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    fetch('/api/projects?status=active')
      .then((res) => res.json())
      .then(setProjects)
  }, [])

  return (
    <div className="bg-zinc-900 rounded-lg p-4 flex flex-col h-full">
      <h3 className="text-[10px] uppercase tracking-wider text-zinc-500 mb-3">
        Projects
      </h3>
      <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            {...project}
            onClick={onProjectClick}
          />
        ))}
        {projects.length === 0 && (
          <div className="text-sm text-zinc-600 text-center py-8">
            No active projects
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add components/follow-up-row.tsx components/follow-up-quick-add.tsx components/follow-up-list.tsx components/project-card.tsx components/project-list.tsx
git commit -m "feat: add follow-up list and project list components for dashboard"
```

---

## Task 10: Dashboard — Week Strip, Quick Stats, Full Assembly

**Files:**
- Create: `components/week-strip.tsx`, `components/quick-stats.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create WeekStrip component**

Create `components/week-strip.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface WeekStripProps {
  selectedDate: string
  onDateSelect: (date: string) => void
}

function getWeekDates(referenceDate: string): string[] {
  const d = new Date(referenceDate + 'T00:00:00')
  const dayOfWeek = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7))

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    return date.toISOString().split('T')[0]
  })
}

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface DaySummary {
  date: string
  taskCount: number
  projectIds: string[]
  hasCompletions: boolean
}

export function WeekStrip({ selectedDate, onDateSelect }: WeekStripProps) {
  const [summaries, setSummaries] = useState<DaySummary[]>([])
  const [projectColors, setProjectColors] = useState<Record<string, string>>({})
  const weekDates = getWeekDates(selectedDate)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const from = weekDates[0]
    const to = weekDates[6]
    fetch(`/api/calendar?from=${from}&to=${to}`)
      .then((res) => res.json())
      .then(setSummaries)

    fetch('/api/projects')
      .then((res) => res.json())
      .then((projects: { id: string; color: string }[]) => {
        const colors: Record<string, string> = {}
        for (const p of projects) colors[p.id] = p.color
        setProjectColors(colors)
      })
  }, [selectedDate])

  return (
    <div className="bg-zinc-900 rounded-lg p-3 flex gap-1">
      {weekDates.map((date, i) => {
        const day = new Date(date + 'T00:00:00').getDate()
        const summary = summaries.find((s) => s.date === date)
        const isSelected = date === selectedDate
        const isToday = date === today

        return (
          <button
            key={date}
            onClick={() => onDateSelect(date)}
            className={cn(
              'flex-1 flex flex-col items-center py-2 rounded-md transition-colors',
              isSelected && 'bg-teal-500/20',
              !isSelected && 'hover:bg-zinc-800'
            )}
          >
            <span
              className={cn(
                'text-[10px]',
                isToday ? 'text-teal-400 font-semibold' : 'text-zinc-500'
              )}
            >
              {dayLabels[i]}
            </span>
            <span
              className={cn(
                'text-sm',
                isToday ? 'text-teal-400 font-semibold' : 'text-zinc-300'
              )}
            >
              {day}
            </span>
            {summary && summary.projectIds.length > 0 && (
              <div className="flex gap-0.5 mt-1">
                {summary.projectIds.slice(0, 3).map((pid) => (
                  <div
                    key={pid}
                    className="w-1 h-1 rounded-full"
                    style={{
                      backgroundColor: projectColors[pid] ?? '#71717a',
                    }}
                  />
                ))}
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Create QuickStats component**

Create `components/quick-stats.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'

interface QuickStatsProps {
  date: string
}

export function QuickStats({ date }: QuickStatsProps) {
  const [stats, setStats] = useState({ completed: 0, inProgress: 0, rolledOver: 0 })

  useEffect(() => {
    fetch(`/api/tasks?date=${date}`)
      .then((res) => res.json())
      .then((tasks: any[]) => {
        setStats({
          completed: tasks.filter((t) => t.status === 'completed').length,
          inProgress: tasks.filter((t) => t.status === 'in_progress').length,
          rolledOver: tasks.filter((t) => t.isRolledOver).length,
        })
      })
  }, [date])

  // Also fetch completed tasks for count
  useEffect(() => {
    fetch(`/api/tasks?date=${date}&status=completed`)
      .then((res) => res.json())
      .then((tasks: any[]) => {
        setStats((prev) => ({ ...prev, completed: tasks.length }))
      })
  }, [date])

  return (
    <div className="flex gap-2">
      <div className="bg-zinc-900 rounded-lg px-4 py-3 text-center flex-1">
        <div className="text-lg font-semibold text-teal-400">
          {stats.completed}
        </div>
        <div className="text-[10px] text-zinc-500">Completed</div>
      </div>
      <div className="bg-zinc-900 rounded-lg px-4 py-3 text-center flex-1">
        <div className="text-lg font-semibold text-blue-400">
          {stats.inProgress}
        </div>
        <div className="text-[10px] text-zinc-500">In Progress</div>
      </div>
      <div className="bg-zinc-900 rounded-lg px-4 py-3 text-center flex-1">
        <div className="text-lg font-semibold text-amber-400">
          {stats.rolledOver}
        </div>
        <div className="text-[10px] text-zinc-500">Rolled Over</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Assemble full Dashboard page**

Update `app/page.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { WeekStrip } from '@/components/week-strip'
import { QuickStats } from '@/components/quick-stats'
import { TaskList } from '@/components/task-list'
import { FollowUpList } from '@/components/follow-up-list'
import { ProjectList } from '@/components/project-list'

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  // Listen for arrow key navigation from keyboard shortcuts
  useEffect(() => {
    function handleNavigateDay(e: CustomEvent<number>) {
      setSelectedDate((prev) => {
        const d = new Date(prev + 'T00:00:00')
        d.setDate(d.getDate() + e.detail)
        return d.toISOString().split('T')[0]
      })
    }
    window.addEventListener('navigate-day', handleNavigateDay as EventListener)
    return () => window.removeEventListener('navigate-day', handleNavigateDay as EventListener)
  }, [])

  return (
    <div className="space-y-4">
      {/* Top bar: week strip + stats */}
      <div className="flex gap-4 items-stretch">
        <div className="flex-1">
          <WeekStrip
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </div>
        <QuickStats date={selectedDate} />
      </div>

      {/* Three columns */}
      <div className="grid grid-cols-3 gap-4" style={{ minHeight: '60vh' }}>
        <TaskList
          date={selectedDate}
          onTaskClick={(id) => console.log('task', id)}
        />
        <FollowUpList date={selectedDate} />
        <ProjectList
          onProjectClick={(id) => console.log('project', id)}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify full dashboard**

```bash
pnpm db:seed && pnpm dev
```

Open `http://localhost:3000`. Verify: week strip with activity dots, quick stats, three columns with tasks/follow-ups/projects. Click status icons to cycle tasks. Navigate days via week strip. Stop server.

- [ ] **Step 5: Commit**

```bash
git add components/week-strip.tsx components/quick-stats.tsx app/page.tsx
git commit -m "feat: assemble full dashboard with week strip, stats, and three columns"
```

---

## Task 11: Slide-Over Detail Panel

**Files:**
- Create: `components/slide-over.tsx`, `components/task-detail.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create SlideOver component**

Create `components/slide-over.tsx`:

```tsx
'use client'

import { AnimatePresence, motion } from 'framer-motion'

interface SlideOverProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function SlideOver({ isOpen, onClose, children }: SlideOverProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-[480px] bg-zinc-900 border-l border-zinc-800 z-50 overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="p-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 text-sm"
              >
                ✕
              </button>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 2: Create TaskDetail component**

Create `components/task-detail.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'

interface TaskDetailProps {
  taskId: string
  onUpdate: () => void
}

interface TaskData {
  id: string
  title: string
  description?: string | null
  status: string
  projectId?: string | null
  projectName?: string | null
  projectColor?: string | null
  dueDate?: string | null
  createdAt: number
  completedAt?: number | null
  abandonedAt?: number | null
}

export function TaskDetail({ taskId, onUpdate }: TaskDetailProps) {
  const [task, setTask] = useState<TaskData | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    fetch(`/api/tasks/${taskId}`)
      .then((res) => res.json())
      .then((data: TaskData) => {
        setTask(data)
        setTitle(data.title)
        setDescription(data.description ?? '')
      })
  }, [taskId])

  async function handleSave() {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    })
    onUpdate()
  }

  async function handleAbandon() {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'abandoned' }),
    })
    onUpdate()
  }

  if (!task) return <div className="text-zinc-500">Loading...</div>

  return (
    <div className="space-y-4">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleSave}
        className="w-full bg-transparent text-lg font-medium text-zinc-100 border-none outline-none"
      />
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        {task.projectName && (
          <span className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: task.projectColor ?? '#71717a' }}
            />
            {task.projectName}
          </span>
        )}
        <span>·</span>
        <span>{task.status.replace('_', ' ')}</span>
        {task.dueDate && (
          <>
            <span>·</span>
            <span>Due {task.dueDate}</span>
          </>
        )}
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={handleSave}
        placeholder="Add a description..."
        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-teal-500 min-h-[100px] resize-y"
      />
      <div className="text-xs text-zinc-600">
        Created {new Date(task.createdAt).toLocaleDateString()}
        {task.completedAt &&
          ` · Completed ${new Date(task.completedAt).toLocaleDateString()}`}
      </div>
      {task.status !== 'abandoned' && task.status !== 'completed' && (
        <button
          onClick={handleAbandon}
          className="text-xs text-red-400 hover:text-red-300 bg-zinc-800 px-3 py-1.5 rounded-md"
        >
          Abandon task
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Wire slide-over into Dashboard**

Update `app/page.tsx` to add slide-over state:

Add imports at top:

```tsx
import { SlideOver } from '@/components/slide-over'
import { TaskDetail } from '@/components/task-detail'
```

Add state and handlers inside `DashboardPage`:

```tsx
const [slideOverTaskId, setSlideOverTaskId] = useState<string | null>(null)
const [refreshKey, setRefreshKey] = useState(0)

function handleTaskClick(id: string) {
  setSlideOverTaskId(id)
}

function handleSlideOverClose() {
  setSlideOverTaskId(null)
}

function handleTaskUpdate() {
  setRefreshKey((k) => k + 1)
  setSlideOverTaskId(null)
}
```

Add slide-over at the end of the JSX, pass `refreshKey` as key to TaskList, and use `handleTaskClick` as the onTaskClick callback.

- [ ] **Step 4: Verify slide-over works**

```bash
pnpm dev
```

Click a task row — slide-over opens from right. Edit title, add description, click "Abandon task." Close with ✕ or backdrop click. Stop server.

- [ ] **Step 5: Commit**

```bash
git add components/slide-over.tsx components/task-detail.tsx app/page.tsx
git commit -m "feat: add slide-over detail panel for tasks with edit and abandon"
```

---

## Task 12: Calendar Page

**Files:**
- Create: `components/calendar-grid.tsx`, `components/day-detail.tsx`
- Modify: `app/calendar/page.tsx`

- [ ] **Step 1: Create CalendarGrid component**

Create `components/calendar-grid.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface CalendarGridProps {
  onDayClick: (date: string) => void
}

interface DaySummary {
  date: string
  taskCount: number
  projectIds: string[]
  hasCompletions: boolean
}

export function CalendarGrid({ onDayClick }: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [summaries, setSummaries] = useState<DaySummary[]>([])
  const [projectColors, setProjectColors] = useState<Record<string, string>>({})

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const from = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}-01`
    const lastDay = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate()
    const to = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}-${lastDay}`

    fetch(`/api/calendar?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then(setSummaries)

    fetch('/api/projects')
      .then((r) => r.json())
      .then((ps: { id: string; color: string }[]) => {
        const colors: Record<string, string> = {}
        for (const p of ps) colors[p.id] = p.color
        setProjectColors(colors)
      })
  }, [currentMonth.year, currentMonth.month])

  const firstDayOfMonth = new Date(currentMonth.year, currentMonth.month, 1)
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7 // Monday = 0
  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate()

  const cells: (string | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1
      return `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    }),
  ]

  const monthLabel = new Date(currentMonth.year, currentMonth.month).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  })

  function prevMonth() {
    setCurrentMonth((m) => {
      const d = new Date(m.year, m.month - 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  function nextMonth() {
    setCurrentMonth((m) => {
      const d = new Date(m.year, m.month + 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="text-zinc-400 hover:text-zinc-200 px-3 py-1">
          ←
        </button>
        <h2 className="text-sm font-medium text-zinc-300">{monthLabel}</h2>
        <button onClick={nextMonth} className="text-zinc-400 hover:text-zinc-200 px-3 py-1">
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="text-[10px] text-zinc-500 text-center py-1">
            {d}
          </div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />
          const summary = summaries.find((s) => s.date === date)
          const day = new Date(date + 'T00:00:00').getDate()
          const isToday = date === today

          return (
            <button
              key={date}
              onClick={() => onDayClick(date)}
              className={cn(
                'aspect-square rounded-md flex flex-col items-center justify-center gap-1 transition-colors',
                isToday ? 'bg-teal-500/20 text-teal-400' : 'hover:bg-zinc-800 text-zinc-400',
                summary && summary.taskCount > 0 && 'text-zinc-200'
              )}
            >
              <span className="text-sm">{day}</span>
              {summary && summary.projectIds.length > 0 && (
                <div className="flex gap-0.5">
                  {summary.projectIds.slice(0, 4).map((pid) => (
                    <div
                      key={pid}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: projectColors[pid] ?? '#71717a' }}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create DayDetail component**

Create `components/day-detail.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'

interface LogEntry {
  log: { id: string; date: string; note?: string | null }
  taskTitle: string
  taskStatus: string
  projectName?: string | null
  projectColor?: string | null
}

interface DayDetailProps {
  date: string
}

export function DayDetail({ date }: DayDetailProps) {
  const [entries, setEntries] = useState<LogEntry[]>([])

  useEffect(() => {
    fetch(`/api/calendar/${date}`)
      .then((r) => r.json())
      .then(setEntries)
  }, [date])

  return (
    <div>
      <h3 className="text-sm font-medium text-zinc-300 mb-3">
        {new Date(date + 'T00:00:00').toLocaleDateString('default', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })}
      </h3>
      {entries.length === 0 ? (
        <div className="text-sm text-zinc-600">No activity this day</div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.log.id}
              className="flex items-center gap-3 px-3 py-2 bg-zinc-800/50 rounded-md"
            >
              {entry.projectColor && (
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.projectColor }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-zinc-200 truncate">
                  {entry.taskTitle}
                </div>
                {entry.log.note && (
                  <div className="text-xs text-zinc-500">{entry.log.note}</div>
                )}
              </div>
              <span className="text-xs text-zinc-500">
                {entry.taskStatus.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Assemble Calendar page**

Update `app/calendar/page.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { CalendarGrid } from '@/components/calendar-grid'
import { DayDetail } from '@/components/day-detail'
import { SlideOver } from '@/components/slide-over'

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  return (
    <div className="max-w-3xl mx-auto">
      <CalendarGrid onDayClick={setSelectedDate} />
      <SlideOver
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
      >
        {selectedDate && <DayDetail date={selectedDate} />}
      </SlideOver>
    </div>
  )
}
```

- [ ] **Step 4: Verify calendar page**

```bash
pnpm dev
```

Navigate to `/calendar`. Verify month grid renders with activity dots. Click a day — slide-over shows day detail. Navigate months with arrows. Stop server.

- [ ] **Step 5: Commit**

```bash
git add components/calendar-grid.tsx components/day-detail.tsx app/calendar/page.tsx
git commit -m "feat: add calendar page with month grid and day detail slide-over"
```

---

## Task 13: Projects Page

**Files:**
- Create: `components/project-detail.tsx`
- Modify: `app/projects/page.tsx`

- [ ] **Step 1: Create ProjectDetail component**

Create `components/project-detail.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'

interface ProjectData {
  id: string
  name: string
  color: string
  status: string
  totalTasks: number
  completedTasks: number
}

interface ProjectDetailProps {
  projectId: string
}

export function ProjectDetail({ projectId }: ProjectDetailProps) {
  const [project, setProject] = useState<ProjectData | null>(null)
  const [tasks, setTasks] = useState<any[]>([])

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((r) => r.json())
      .then(setProject)

    fetch(`/api/tasks?date=2000-01-01&status=pending,in_progress,completed,abandoned&project_id=${projectId}`)
      .then((r) => r.json())
      .then(setTasks)
  }, [projectId])

  if (!project) return <div className="text-zinc-500">Loading...</div>

  const progress =
    project.totalTasks > 0
      ? Math.round((project.completedTasks / project.totalTasks) * 100)
      : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: project.color }}
        />
        <h3 className="text-lg font-medium">{project.name}</h3>
      </div>
      <div className="text-sm text-zinc-400">
        {project.completedTasks}/{project.totalTasks} tasks completed ({progress}
        %)
      </div>
      <div className="h-2 bg-zinc-800 rounded-full">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${progress}%`,
            backgroundColor: project.color,
          }}
        />
      </div>
      {/* Mini-analytics */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="bg-zinc-800/50 rounded-md p-3 text-center">
          <div className="text-lg font-semibold text-teal-400">{progress}%</div>
          <div className="text-[10px] text-zinc-500">Completion rate</div>
        </div>
        <div className="bg-zinc-800/50 rounded-md p-3 text-center">
          <div className="text-lg font-semibold text-zinc-300">
            {tasks.filter((t) => t.completedAt).length > 0
              ? `${Math.round(
                  tasks
                    .filter((t) => t.completedAt)
                    .reduce(
                      (sum, t) => sum + (t.completedAt - t.createdAt) / 86400000,
                      0
                    ) / tasks.filter((t) => t.completedAt).length
                )}d`
              : '—'}
          </div>
          <div className="text-[10px] text-zinc-500">Avg task duration</div>
        </div>
      </div>
      <div className="space-y-1.5 mt-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 px-3 py-2 bg-zinc-800/50 rounded-md text-sm"
          >
            <span className={task.status === 'completed' ? 'text-green-400' : task.status === 'abandoned' ? 'text-zinc-500' : 'text-zinc-300'}>
              {task.status === 'completed' ? '✓' : task.status === 'in_progress' ? '▶' : task.status === 'abandoned' ? '✕' : '○'}
            </span>
            <span className={task.status === 'completed' ? 'line-through text-zinc-500' : ''}>
              {task.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Assemble Projects page**

Update `app/projects/page.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { ProjectCard } from '@/components/project-card'
import { SlideOver } from '@/components/slide-over'
import { ProjectDetail } from '@/components/project-detail'

interface Project {
  id: string
  name: string
  color: string
  status: string
  totalTasks: number
  completedTasks: number
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then(setProjects)
  }, [])

  const active = projects.filter((p) => p.status === 'active')
  const archived = projects.filter((p) => p.status === 'archived')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-lg font-medium">Projects</h1>
      <div className="space-y-2">
        {active.map((p) => (
          <ProjectCard key={p.id} {...p} onClick={setSelectedId} />
        ))}
      </div>
      {archived.length > 0 && (
        <>
          <h2 className="text-[10px] uppercase tracking-wider text-zinc-500 mt-6">
            Archived
          </h2>
          <div className="space-y-2 opacity-60">
            {archived.map((p) => (
              <ProjectCard key={p.id} {...p} onClick={setSelectedId} />
            ))}
          </div>
        </>
      )}
      <SlideOver isOpen={!!selectedId} onClose={() => setSelectedId(null)}>
        {selectedId && <ProjectDetail projectId={selectedId} />}
      </SlideOver>
    </div>
  )
}
```

- [ ] **Step 3: Verify and commit**

```bash
pnpm dev
```

Navigate to `/projects`. Verify project list with progress bars. Click a project — slide-over shows detail with task list. Stop server.

```bash
git add components/project-detail.tsx app/projects/page.tsx
git commit -m "feat: add projects page with detail slide-over"
```

---

## Task 14: Archive Page

**Files:**
- Create: `components/date-range-filter.tsx`
- Modify: `app/archive/page.tsx`

- [ ] **Step 1: Create DateRangeFilter component**

Create `components/date-range-filter.tsx`:

```tsx
'use client'

interface DateRangeFilterProps {
  from: string
  to: string
  onFromChange: (date: string) => void
  onToChange: (date: string) => void
}

export function DateRangeFilter({
  from,
  to,
  onFromChange,
  onToChange,
}: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <input
        type="date"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-zinc-300 text-xs"
      />
      <span className="text-zinc-500">to</span>
      <input
        type="date"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-zinc-300 text-xs"
      />
    </div>
  )
}
```

- [ ] **Step 2: Assemble Archive page**

Update `app/archive/page.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { DateRangeFilter } from '@/components/date-range-filter'

interface ArchivedTask {
  id: string
  title: string
  status: string
  projectName?: string | null
  projectColor?: string | null
  completedAt?: number | null
  abandonedAt?: number | null
  createdAt: number
}

export default function ArchivePage() {
  const [from, setFrom] = useState(() => {
    const d = new Date(Date.now() - 30 * 86400000)
    return d.toISOString().split('T')[0]
  })
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0])
  const [tasks, setTasks] = useState<ArchivedTask[]>([])
  const [projects, setProjects] = useState<{ id: string; name: string; color: string }[]>([])
  const [filterProjectId, setFilterProjectId] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('completed,abandoned')

  useEffect(() => {
    fetch('/api/projects').then((r) => r.json()).then(setProjects)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams({ status: filterStatus })
    if (filterProjectId) params.set('project_id', filterProjectId)
    fetch(`/api/tasks?${params}`)
      .then((r) => r.json())
      .then((allTasks: ArchivedTask[]) => {
        // Client-side date range filter (completedAt/abandonedAt within range)
        const fromMs = new Date(from).getTime()
        const toMs = new Date(to + 'T23:59:59').getTime()
        setTasks(
          allTasks.filter((t) => {
            const endMs = t.completedAt ?? t.abandonedAt ?? 0
            return endMs >= fromMs && endMs <= toMs
          })
        )
      })
  }, [from, to, filterProjectId, filterStatus])

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-lg font-medium">Archive</h1>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-zinc-300 text-xs"
          >
            <option value="completed,abandoned">All</option>
            <option value="completed">Completed</option>
            <option value="abandoned">Abandoned</option>
          </select>
          <select
            value={filterProjectId}
            onChange={(e) => setFilterProjectId(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-zinc-300 text-xs"
          >
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <DateRangeFilter
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
        />
      </div>
      <div className="space-y-1.5">
        {tasks.map((task) => {
          const endDate = task.completedAt ?? task.abandonedAt
          const lifespan = endDate
            ? Math.ceil((endDate - task.createdAt) / 86400000)
            : 0

          return (
            <div
              key={task.id}
              className="flex items-center gap-3 px-3 py-2.5 bg-zinc-900 rounded-md"
            >
              {task.projectColor && (
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: task.projectColor }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-zinc-300 truncate">{task.title}</div>
                <div className="text-xs text-zinc-500">
                  {task.projectName && `${task.projectName} · `}
                  {task.status === 'completed' ? 'Completed' : 'Abandoned'}
                  {endDate && ` ${new Date(endDate).toLocaleDateString()}`}
                  {lifespan > 0 && ` · ${lifespan}d lifespan`}
                </div>
              </div>
              <span
                className={`text-xs ${task.status === 'completed' ? 'text-green-400' : 'text-zinc-500'}`}
              >
                {task.status === 'completed' ? '✓' : '✕'}
              </span>
            </div>
          )
        })}
        {tasks.length === 0 && (
          <div className="text-sm text-zinc-600 text-center py-12">
            No archived tasks in this range
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify and commit**

```bash
pnpm dev
```

Navigate to `/archive`. Verify completed and abandoned tasks show with lifespan. Date range filter renders. Stop server.

```bash
git add components/date-range-filter.tsx app/archive/page.tsx
git commit -m "feat: add archive page with date range filtering"
```

---

## Task 15: Analytics Page

**Files:**
- Modify: `app/analytics/page.tsx`

- [ ] **Step 1: Implement Analytics page with Recharts**

Update `app/analytics/page.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { DateRangeFilter } from '@/components/date-range-filter'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

export default function AnalyticsPage() {
  const [from, setFrom] = useState(() => {
    const d = new Date(Date.now() - 30 * 86400000)
    return d.toISOString().split('T')[0]
  })
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0])
  const [productivity, setProductivity] = useState<any>(null)
  const [projectFocus, setProjectFocus] = useState<any>(null)
  const [followThrough, setFollowThrough] = useState<any>(null)

  useEffect(() => {
    const params = `from=${from}&to=${to}`
    fetch(`/api/analytics/productivity?${params}`)
      .then((r) => r.json())
      .then(setProductivity)
    fetch(`/api/analytics/project-focus?${params}`)
      .then((r) => r.json())
      .then(setProjectFocus)
    fetch(`/api/analytics/follow-through?${params}`)
      .then((r) => r.json())
      .then(setFollowThrough)
  }, [from, to])

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium">Analytics</h1>
        <DateRangeFilter
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
        />
      </div>

      {/* Productivity Patterns */}
      <section className="bg-zinc-900 rounded-lg p-6">
        <h2 className="text-[10px] uppercase tracking-wider text-zinc-500 mb-4">
          Productivity Patterns
        </h2>
        {productivity && (
          <div className="space-y-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productivity.completedByDay}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#71717a' }}
                    tickFormatter={(d: string) => d.slice(5)}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#71717a' }} />
                  <Tooltip
                    contentStyle={{
                      background: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="#14b8a6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Busiest day of week heatmap */}
            <div className="flex gap-1 mt-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label, i) => {
                const dayData = productivity.busiestDay.find((d: any) => d.dayOfWeek === i)
                const count = dayData?.count ?? 0
                const maxCount = Math.max(...productivity.busiestDay.map((d: any) => d.count), 1)
                const opacity = count > 0 ? 0.2 + (count / maxCount) * 0.8 : 0.05
                return (
                  <div key={label} className="flex-1 text-center">
                    <div
                      className="aspect-square rounded-md mb-1 flex items-center justify-center text-xs text-zinc-300"
                      style={{ backgroundColor: `rgba(20, 184, 166, ${opacity})` }}
                    >
                      {count > 0 ? count : ''}
                    </div>
                    <div className="text-[9px] text-zinc-500">{label}</div>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-6 text-sm mt-4">
              <div>
                <span className="text-zinc-500">Max streak: </span>
                <span className="text-teal-400 font-medium">
                  {productivity.maxStreak} days
                </span>
              </div>
              <div>
                <span className="text-zinc-500">Current streak: </span>
                <span className="text-teal-400 font-medium">
                  {productivity.currentStreak} days
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Project Focus */}
      <section className="bg-zinc-900 rounded-lg p-6">
        <h2 className="text-[10px] uppercase tracking-wider text-zinc-500 mb-4">
          Project Focus
        </h2>
        {projectFocus && projectFocus.logsByProject.length > 0 && (
          <div className="flex items-center gap-8">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectFocus.logsByProject}
                    dataKey="logCount"
                    nameKey="projectName"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                  >
                    {projectFocus.logsByProject.map(
                      (entry: any, i: number) => (
                        <Cell
                          key={i}
                          fill={entry.projectColor ?? '#71717a'}
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {projectFocus.logsByProject.map((p: any) => (
                <div key={p.projectId} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: p.projectColor ?? '#71717a' }}
                  />
                  <span className="text-zinc-300">
                    {p.projectName ?? 'No project'}
                  </span>
                  <span className="text-zinc-500">{p.logCount} logs</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Follow-through */}
      <section className="bg-zinc-900 rounded-lg p-6">
        <h2 className="text-[10px] uppercase tracking-wider text-zinc-500 mb-4">
          Follow-through
        </h2>
        {followThrough && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-800/50 rounded-md p-4">
              <div className="text-2xl font-semibold text-teal-400">
                {followThrough.avgDaysToComplete.toFixed(1)}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                Avg days to complete
              </div>
            </div>
            <div className="bg-zinc-800/50 rounded-md p-4">
              <div className="text-2xl font-semibold text-amber-400">
                {followThrough.avgRolloverCount.toFixed(1)}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                Avg rollover count
              </div>
            </div>
            <div className="bg-zinc-800/50 rounded-md p-4">
              <div className="text-2xl font-semibold text-zinc-300">
                {followThrough.totalCompleted}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                Tasks completed
              </div>
            </div>
            <div className="bg-zinc-800/50 rounded-md p-4">
              <div className="text-2xl font-semibold text-red-400">
                {(followThrough.abandonmentRate * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                Abandonment rate
              </div>
            </div>
            {followThrough.stuckTasks.length > 0 && (
              <div className="col-span-2 mt-2">
                <div className="text-xs text-zinc-500 mb-2">
                  Stuck tasks (3+ rollovers)
                </div>
                {followThrough.stuckTasks.map((t: any) => (
                  <div
                    key={t.taskId}
                    className="text-sm text-amber-300 py-1"
                  >
                    {t.title} ({t.logDays} days)
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Verify and commit**

```bash
pnpm dev
```

Navigate to `/analytics`. Verify bar chart, donut chart, and follow-through stats render with seed data. Adjust date range. Stop server.

```bash
git add app/analytics/page.tsx
git commit -m "feat: add analytics page with productivity, project focus, and follow-through charts"
```

---

## Task 16: Keyboard Shortcuts

**Files:**
- Create: `components/keyboard-shortcuts.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create keyboard shortcuts handler**

Create `components/keyboard-shortcuts.tsx`:

```tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function KeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Skip if user is in an input
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      switch (e.key) {
        case 'n':
          // Focus the task quick-add input
          document
            .querySelector<HTMLInputElement>(
              '[placeholder="Add a task..."]'
            )
            ?.focus()
          e.preventDefault()
          break
        case 'f':
          document
            .querySelector<HTMLInputElement>(
              '[placeholder="Add a follow-up..."]'
            )
            ?.focus()
          e.preventDefault()
          break
        case 'ArrowLeft':
          // Navigate to previous day (dispatches custom event for dashboard/calendar)
          window.dispatchEvent(new CustomEvent('navigate-day', { detail: -1 }))
          e.preventDefault()
          break
        case 'ArrowRight':
          // Navigate to next day
          window.dispatchEvent(new CustomEvent('navigate-day', { detail: 1 }))
          e.preventDefault()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  return null
}
```

- [ ] **Step 2: Add to layout**

Add `<KeyboardShortcuts />` inside the `<body>` in `app/layout.tsx`:

```tsx
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts'
// ...inside body:
<KeyboardShortcuts />
```

- [ ] **Step 3: Verify and commit**

```bash
pnpm dev
```

On dashboard, press `n` — task input focuses. Press `f` — follow-up input focuses. Type in inputs — shortcuts don't fire. Stop server.

```bash
git add components/keyboard-shortcuts.tsx app/layout.tsx
git commit -m "feat: add global keyboard shortcuts (n for task, f for follow-up)"
```

---

## Task 17: Final Polish and Run All Tests

**Files:**
- All existing files

- [ ] **Step 1: Run full test suite**

```bash
pnpm test:run
```

Expected: All tests pass.

- [ ] **Step 2: Run Biome check**

```bash
pnpm check
```

Fix any issues:

```bash
pnpm check:fix
```

- [ ] **Step 3: Run production build**

```bash
pnpm build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Verify full app with seed data**

```bash
pnpm db:seed && pnpm dev
```

Walk through all pages:
- Dashboard: week strip, stats, three columns, status cycling, quick-add, slide-over
- Calendar: month grid, day detail slide-over
- Projects: project list, project detail
- Analytics: all three chart sections
- Archive: filtered task list
- Keyboard shortcuts: `n` and `f`

- [ ] **Step 5: Final commit**

```bash
pnpm check:fix
git add -A
git commit -m "chore: lint fixes and final polish"
```
