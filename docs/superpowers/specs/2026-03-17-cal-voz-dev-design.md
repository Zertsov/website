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
- **Animations:** Framer Motion (slide-over panels, transitions)
- **Deployment:** Local development first; Vercel → `cal.voz.dev` once Turso is integrated
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
| updated_at | integer | Unix timestamp |

### tasks

| Column | Type | Notes |
|--------|------|-------|
| id | text (ULID) | Primary key |
| title | text | Required |
| description | text | Nullable |
| project_id | text | Nullable FK → projects.id |
| status | text | `pending` \| `in_progress` \| `completed` \| `abandoned` |
| sort_order | integer | Position within a day's task list for manual reordering |
| due_date | text | Nullable, ISO date string (YYYY-MM-DD) |
| completed_at | integer | Nullable, Unix timestamp |
| abandoned_at | integer | Nullable, Unix timestamp |
| created_at | integer | Unix timestamp |
| updated_at | integer | Unix timestamp |

### follow_ups

| Column | Type | Notes |
|--------|------|-------|
| id | text (ULID) | Primary key |
| task_id | text | Nullable FK → tasks.id (can be standalone) |
| title | text | Required |
| status | text | `active` \| `resolved` \| `dismissed` |
| trigger_type | text | `time` \| `completion` |
| trigger_date | text | Nullable, ISO date string (for time-based) |
| trigger_condition | text | Nullable, free text description (for completion-based — manually resolved by user, no auto-detection) |
| resolved_at | integer | Nullable, Unix timestamp |
| created_at | integer | Unix timestamp |
| updated_at | integer | Unix timestamp |

### daily_logs

| Column | Type | Notes |
|--------|------|-------|
| id | text (ULID) | Primary key |
| task_id | text | FK → tasks.id |
| date | text | ISO date string (YYYY-MM-DD) |
| note | text | Nullable |
| created_at | integer | Unix timestamp |

Composite unique constraint on (task_id, date) to prevent duplicate logs per day.

## Automatic Rollover Logic

Rollover is query-based, not stored. When fetching today's tasks, the query includes:

1. Any task with `due_date <= today` and status `pending` or `in_progress`
2. Any task that has a daily_log entry for yesterday (or any recent day) but status is not `completed` or `abandoned`
3. Any task with status `pending` or `in_progress` and no `due_date` — these always appear on today's view until completed or abandoned

Rules 1 and 2 produce items with a "rolled over" visual flag (amber accent, ↻ icon). Rule 3 items appear as normal pending tasks. No manual carry-over needed.

A task's **rollover count** (used in analytics) is the number of distinct days it appeared on a daily view before completion, calculated from daily_log entries.

## Pages & Navigation

Navigation via a minimal top nav bar with icon + label links.

### 1. Dashboard (`/`)

The daily command center. Layout: **Top Bar + Three Columns**.

**Top bar:**
- Week strip calendar showing Mon–Sun with activity dots per day (derived from daily_logs, colored by project). Current day highlighted. Clickable — selecting a day loads that day's work in the columns below.
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
- `GET /api/tasks` — general-purpose task list. Query params: `date` (defaults to today, includes rollover logic), `project_id`, `status` (comma-separated, e.g. `completed,abandoned` for archive view). Without `status` filter, returns pending/in_progress tasks for the given date.
- `POST /api/tasks` — create task. Body: `{ title, description?, project_id?, due_date? }`
- `PATCH /api/tasks/[id]` — update task fields. Body: `{ title?, description?, status?, project_id?, due_date?, sort_order? }`
- `DELETE /api/tasks/[id]` — delete task

### Projects
- `GET /api/projects` — list all projects. Query params: `status` (active/archived)
- `POST /api/projects` — create project. Body: `{ name, color }`
- `PATCH /api/projects/[id]` — update project. Body: `{ name?, color?, status? }`
- Projects are archived, not deleted. No DELETE endpoint.

### Follow-ups
- `GET /api/follow-ups` — list follow-ups. Query params: `date`, `task_id`, `status` (active/resolved/dismissed)
- `POST /api/follow-ups` — create follow-up. Body: `{ title, task_id?, trigger_type, trigger_date?, trigger_condition? }`
- `PATCH /api/follow-ups/[id]` — update follow-up. Body: `{ status?, trigger_date?, title? }`. Set `status: "resolved"` to resolve, `status: "dismissed"` to dismiss, update `trigger_date` to snooze.
- `DELETE /api/follow-ups/[id]` — delete follow-up

### Daily Logs
- `POST /api/daily-logs` — log work on a task. Body: `{ task_id, date?, note? }`. Date defaults to today.
- `DELETE /api/daily-logs/[id]` — remove a log entry (corrections)

### Calendar
- `GET /api/calendar/[date]` — returns tasks and daily_logs for a specific date, with project info joined
- `GET /api/calendar?from=...&to=...` — returns per-day summary for a date range: `{ date, task_count, project_ids[], has_completions }` for efficiently rendering month grid activity dots

### Analytics
- `GET /api/analytics/productivity` — tasks completed per day, busiest day of week, completion streaks. Query params: `from`, `to`, `project_id`
- `GET /api/analytics/project-focus` — daily log entries per project, project durations. Query params: `from`, `to`
- `GET /api/analytics/follow-through` — rollover counts, stuck tasks, avg creation-to-completion time, abandonment rate. Query params: `from`, `to`, `project_id`

## Interactions & UX

- **Adding tasks:** Inline quick-add input at top of tasks column. Type and press Enter for fast creation. Click to expand for project, due date, description fields.
- **Status changes:** Click status icon on task row to cycle: pending → in_progress → completed. No modals for common operations. Abandoning a task is available in the slide-over detail panel (not in the quick-cycle) to prevent accidental abandonment.
- **Follow-up creation:** Quick-add with date picker (time-based) or text field (completion-based). Can be standalone or created from a task's detail view.
- **Drill-down:** Click any task, project, or calendar day to open a slide-over detail panel from the right. Keeps context visible.
- **Calendar navigation:** Week strip on dashboard is clickable. Calendar page has full month grid with click-to-drill-down.
- **Rolled-over items:** Amber accent, ↻ icon. One-click dismiss or snooze to future date.
- **Keyboard shortcuts:** `n` new task, `f` new follow-up, `←/→` navigate days on calendar. All shortcuts are global but disabled when a text input is focused.

## Visual Design

- Dark theme (matching voz.dev aesthetic): zinc grays, teal accent for primary actions/active states
- Project colors: user-selectable, used for dots and accents throughout
- Status colors: teal (in progress), blue (pending), green (completed), amber (rolled over/follow-ups), zinc (abandoned/archived)
- Typography: system font stack, clean hierarchy with uppercase micro-labels for sections
- Cards: `#18181b` background, `#27272a` for interactive rows, rounded corners, subtle borders
- Animations: slide-over panels, smooth transitions between calendar days

## Future Considerations (Not in Initial Build)

- **Clerk auth** for hosted version at `cal.voz.dev`
- **Turso** migration for cloud SQLite — required before deploying to Vercel (serverless has no persistent filesystem). Drizzle ORM + libsql makes this a connection string change.
- **Mobile responsiveness** — single-column layout for narrow viewports
- **Notifications** — browser notifications for follow-up reminders
- **Import/export** — CSV or JSON export of task history for external analysis
