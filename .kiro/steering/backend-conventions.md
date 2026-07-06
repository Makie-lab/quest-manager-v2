# Backend & Data Conventions

## Server Actions

All mutations live in `src/app/actions.ts`. No separate API routes for CRUD (only the cron endpoint).

### Pattern for every action:
1. Authenticate with `auth()` or `ensureUser()`
2. Validate input
3. Perform database operation
4. Log to `activityLog`
5. Send email notification via `notifyAllMembers()`
6. Call `revalidatePath()` for affected pages
7. Return result

## Email Notifications

Every quest action notifies ALL members with `notificationsEnabled: true`.

| Trigger | Subject | Recipients |
|---------|---------|------------|
| Quest created | 🆕 New Quest: {name} | All members |
| Status → WIP | ⚒️ Quest In Progress: {name} | All members |
| Status → Done | ✅ Quest Completed: {name} | All members |
| Status → Rest | 💤 Quest Resting: {name} | All members |
| Quest deleted | 🗑️ Quest Deleted: {name} | All members |
| Deadline approaching | ⏰ Deadline: {name} | Quest owner (cron) |

Email template: dark themed HTML matching the app's pixel aesthetic.
Sender: `Quest Manager <onboarding@resend.dev>` (Resend test domain)

## Database

- **Provider:** Neon PostgreSQL (serverless)
- **ORM:** Drizzle with `drizzle-orm/neon-http`
- **Connection:** `@neondatabase/serverless` neon() driver
- **Schema file:** `src/db/schema.ts`
- **Push schema:** `npm run db:push` (drizzle-kit push)

## Quest Model

```typescript
{
  id: uuid,
  userId: text (Clerk ID),
  name: varchar(500),
  deadline: timestamp,
  priority: integer (1=Easy, 2=Medium, 3=Urgent),
  status: varchar ('resting' | 'wip' | 'done'),
  equipment: text (JSON array: ['sword', 'shield', 'armor']),
  notificationSent: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Equipment Rules

| Status Change | Artifact Gained |
|---------------|-----------------|
| Any → WIP | sword (if not already equipped) |
| Any → Done | shield (if not already equipped) |
| Any → Resting (with existing gear) | armor (if not already equipped) |

Equipment stored as JSON text array on the quest record.

## Post Model

```typescript
{
  id: uuid,
  userId: text (Clerk ID),
  content: text (max 280 chars, enforced client-side),
  likes: integer (default 0),
  createdAt: timestamp
}
```

## Activity Heatmap

- Queries `activity_log` grouped by `DATE(date)` for last 365 days
- Returns `{ date: string, count: number }[]`
- Client renders as adjustable grid (user can resize cells via slider)
- Auto-adjusts columns on mobile based on container width

## Auth Flow

1. Middleware (`src/middleware.ts`) protects all routes except `/sign-in`, `/sign-up`, `/api/cron`
2. On first authenticated page load, `ensureUser()` syncs Clerk user → Neon `users` table
3. All server actions use `auth()` for userId, `currentUser()` for full user data

## Deployment

- **Vercel** with `vercel.json` cron config
- Cron: `/api/cron/notifications` runs every hour (checks deadlines within 24h)
- Env vars set via `vercel env add` CLI
- Redeploy: `npx vercel --prod --yes`
