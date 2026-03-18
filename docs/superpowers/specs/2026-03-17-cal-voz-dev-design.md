# cal.voz.dev — Personal Productivity Dashboard

## Overview

A personal productivity app hosted at `cal.voz.dev` for tracking daily work-in-progress, follow-ups, long-running projects, and retrospective analytics. Designed as a birds-eye command center that's scannable without being overwhelming, with pleasant drill-downs into detail.

Single user, no auth initially (Clerk to be added later for hosted version).

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Database:** Local SQLite via better-sqlite3 or libsql, Drizzle ORM (Turso-ready for production)
- **Charts:** Recharts
- **Deployment:** Vercel → `cal.voz.dev`
- **Package manager:** pnpm
- **Linting:** Biome
- **Repo:** `~/git/cal`

## Data Model

Four core tables in SQLite via Drizzle ORM.

### projects

| Column | Type | Notes |
|--------|------|-------|
| id | text (ULID) | Primary key |
| name | text | Required |
| color | text | Hex color for visual grouping |
| status | text | `active` \| `archived` |
| created_at | integer | Unix timestamp |
| archived_at | integer | Nullable |

### tasks

| Column | Type | Notes |
|--------|------|-------|
| id | text (ULID) | Primary key |
| title | text | Required |
| description | text | Nullable |
| project_id | text | Nullable FK → projects.id |
| status | text | `pending` \| `in_progress` \| `completed` \| `abandoned` |
| due_date | text | Nullable, ISO date string (YYYY-MM-DD) |
| completed_at | integer | Nullable, Unix timestamp |
| abandoned_at | integer | Nullable, Unix timestamp |
| created_at | integer | Unix timestamp |

### follow_ups

| Column | Type | Notes |
|--------|------|-------|
| id | text (ULID) | Primary key |
| task_id | text | Nullable FK → tasks.id (can be standalone) |
| title | text | Required |
| trigger_type | text | `time` \| `completion` |
| trigger_date | text | Nullable, ISO date string (for time-based) |
| trigger_condition | text | Nullable, free text (for completion-based) |
| resolved_at | integer | Nullable, Unix timestamp |
| created_at | integer | Unix timestamp |

### daily_logs

| Column | Type | Notes |
|--------|------|-------|
| id | text (ULID) | Primary key |
| task_id | text | FK → tasks.id |
| date | text | ISO date string (YYYY-MM-DD) |
| note | text | Nullable |

Composite unique constraint on (task_id, date) to prevent duplicate logs per day.

## Automatic Rollover Logic

Rollover is query-based, not stored. When fetching today's tasks, the query includes:

1. Any task with `due_date <= today` and status `pending` or `in_progress`
2. Any task that has a daily_log entry for yesterday (or any recent day) but status is not `completed` or `abandoned`

These surface automatically with a "rolled over" visual flag. No manual carry-over needed.

## Pages & Navigation

Navigation via a minimal top nav bar with icon + label links.

### 1. Dashboard (`/`)

The daily command center. Layout: **Top Bar + Three Columns**.

**Top bar:**
- Week strip calendar showing Mon–Sun with activity dots per day. Current day highlighted. Clickable — selecting a day loads that day's work in the columns below.
- Quick stats: completed today, in progress, rolled over.

**Three columns:**
- **Today's Tasks** — list of tasks for the selected day. Each row shows: project color dot, title, project name, status, and status icon (▶ in progress, ○ pending, ✓ completed). Rolled-over items have amber accent and ↻ icon. Inline quick-add input at top.
- **Follow-ups** — active follow-ups due today or rolled over. Amber left-border accent. Shows title, source context, and due info. Future follow-ups shown dimmed.
- **Projects** — active projects with name, task count (completed/total), and a progress bar.

### 2. Calendar (`/calendar`)

Full month grid view. Each day cell shows activity dots (colored by project) and task count. Click a day to see a detailed breakdown of what was worked on, completed, or rolled over that day. Navigate between months.

### 3. Projects (`/projects`)

List of all projects (active and archived). Each shows name, color, task progress, and date range. Click into a project to see all its tasks, follow-ups, daily activity, and a mini-analytics view (completion rate, average task duration).

### 4. Analytics (`/analytics`)

Three sections, all filterable by date range and project:

- **Productivity patterns** — tasks completed per day (bar chart, default last 30 days), busiest day of week (heatmap), completion streaks.
- **Project focus** — donut chart of daily log entries per project, project duration (first task to last completion).
- **Follow-through** — average rollover count before completion, "stuck" tasks (3+ rollovers) highlighted, average creation-to-completion time, abandonment rate.

### 5. Archive (`/archive`)

Completed and abandoned tasks for retrospective browsing. Filterable by project, date range, and status. Shows completion/abandonment date and total lifespan.

## API Design

Next.js App Router route handlers. No auth middleware initially (Clerk-ready structure).

### Tasks
- `GET /api/tasks` — list tasks for today (includes rollover logic). Query params: `date`, `project_id`, `status`
- `POST /api/tasks` — create task. Body: `{ title, description?, project_id?, due_date? }`
- `PATCH /api/tasks/[id]` — update task fields (title, description, status, project_id, due_date)
- `DELETE /api/tasks/[id]` — delete task

### Projects
- `GET /api/projects` — list all projects. Query params: `status` (active/archived)
- `POST /api/projects` — create project. Body: `{ name, color }`
- `PATCH /api/projects/[id]` — update project (name, color, status)

### Follow-ups
- `GET /api/follow-ups` — list active follow-ups. Query params: `date`, `task_id`
- `POST /api/follow-ups` — create follow-up. Body: `{ title, task_id?, trigger_type, trigger_date?, trigger_condition? }`
- `PATCH /api/follow-ups/[id]` — resolve or snooze follow-up

### Daily Logs
- `POST /api/daily-logs` — log work on a task. Body: `{ task_id, date?, note? }`

### Calendar
- `GET /api/calendar/[date]` — tasks and logs for a specific date
- `GET /api/calendar?from=...&to=...` — task activity across a date range

### Analytics
- `GET /api/analytics` — aggregated stats. Query params: `from`, `to`, `project_id`

## Interactions & UX

- **Adding tasks:** Inline quick-add input at top of tasks column. Type and press Enter for fast creation. Click to expand for project, due date, description fields.
- **Status changes:** Click status icon on task row to cycle: pending → in_progress → completed. No modals for common operations.
- **Follow-up creation:** Quick-add with date picker (time-based) or text field (completion-based). Can be standalone or created from a task's detail view.
- **Drill-down:** Click any task, project, or calendar day to open a slide-over detail panel from the right. Keeps context visible.
- **Calendar navigation:** Week strip on dashboard is clickable. Calendar page has full month grid with click-to-drill-down.
- **Rolled-over items:** Amber accent, ↻ icon. One-click dismiss or snooze to future date.
- **Keyboard shortcuts:** `n` new task, `f` new follow-up, `←/→` navigate days on calendar.

## Visual Design

- Dark theme (matching voz.dev aesthetic): zinc grays, teal accent for primary actions/active states
- Project colors: user-selectable, used for dots and accents throughout
- Status colors: teal (in progress), blue (pending), green (completed), amber (rolled over/follow-ups), zinc (abandoned/archived)
- Typography: system font stack, clean hierarchy with uppercase micro-labels for sections
- Cards: `#18181b` background, `#27272a` for interactive rows, rounded corners, subtle borders
- Animations: Framer Motion for slide-over panels, smooth transitions between calendar days

## Future Considerations (Not in Initial Build)

- **Clerk auth** for hosted version at `cal.voz.dev`
- **Turso** migration for cloud SQLite when moving off local
- **Mobile responsiveness** — single-column layout for narrow viewports
- **Notifications** — browser notifications for follow-up reminders
- **Import/export** — CSV or JSON export of task history for external analysis
