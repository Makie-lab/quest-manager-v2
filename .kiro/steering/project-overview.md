# Quest Manager v2 - Project Overview

## Architecture

Full-stack Next.js 14 (App Router) application deployed on Vercel with Clerk auth, Neon PostgreSQL, and Resend email notifications.

**Project location:** `/Users/marqfiles/quest-manager-v2/`
**Live URL:** https://quest-manager-v2.vercel.app

## Tech Stack

- **Framework:** Next.js 14 (App Router, Server Actions)
- **Auth:** Clerk (@clerk/nextjs 5.3.0)
- **Database:** Neon PostgreSQL via Drizzle ORM
- **Email:** Resend (notifications on all quest actions)
- **Deploy:** Vercel with Cron Jobs
- **Styling:** Global CSS with Press Start 2P pixel font

## File Structure

```
src/
├── app/
│   ├── actions.ts              # All server actions (quests, posts, calendar, activity)
│   ├── globals.css             # Full Terraria-inspired stylesheet
│   ├── layout.tsx              # Root layout with ClerkProvider
│   ├── loading.tsx             # Block-animated loading screen
│   ├── page.tsx                # Dashboard (stats, game canvas, heatmap)
│   ├── quests/page.tsx         # Quest form + quest log
│   ├── posts/page.tsx          # Tavern (Twitter-like feed)
│   ├── activity/page.tsx       # Large heatmap + recent actions below
│   ├── members/page.tsx        # All users with avatars
│   ├── analytics/page.tsx      # Completion rate, priority breakdown, status grid
│   ├── team/settings/page.tsx  # Create team, invite, danger zone
│   ├── team/collab/page.tsx    # Organizations list
│   ├── team/calendar/page.tsx  # Monthly calendar with events
│   ├── sign-in/                # Clerk sign-in
│   ├── sign-up/                # Clerk sign-up
│   └── api/cron/notifications/ # Hourly deadline email cron
├── components/
│   ├── Sidebar.tsx             # Left nav (mobile: bottom tab bar)
│   ├── GameCanvas.tsx          # Pixel character with day/night, bag, equipment
│   ├── QuestForm.tsx           # New quest form
│   ├── QuestList.tsx           # Quest log with status buttons
│   ├── ActivityHeatmap.tsx     # Adjustable GitHub-style heatmap
│   ├── CalendarClient.tsx      # Calendar grid + event form
│   └── PostsFeed.tsx           # Twitter-like post feed
├── db/
│   ├── index.ts                # Drizzle + Neon connection
│   └── schema.ts              # All tables (users, quests, teams, posts, etc.)
└── middleware.ts               # Clerk auth protection
```

## Database Tables

| Table | Purpose |
|-------|---------|
| users | Synced from Clerk (id, email, name, imageUrl, notifications) |
| teams | Organizations (name, description, owner) |
| team_members | User-team relationships with roles |
| quests | Tasks (name, deadline, priority 1-3, status, equipment JSON) |
| activity_log | All actions for heatmap (date-grouped counts) |
| calendar_events | Team/personal events (title, start, end, color) |
| posts | Tavern messages (content max 280 chars, likes) |

## Page Layout Pattern

Every authenticated page follows this pattern:
```tsx
<div className="app-layout">
  <Sidebar />
  <div className="app-main">
    <header className="top-bar">...</header>
    <div className="page-content">
      {/* Page content here */}
    </div>
  </div>
</div>
```

## Navigation

**Main:** Dashboard, Quests, Tavern, Activity, Members, Analytics
**Team:** Team Settings, Organizations, Calendar

On mobile (< 768px): sidebar becomes a horizontal bottom tab bar.

## Key Conventions

- All server mutations are Server Actions in `src/app/actions.ts`
- Every quest action (create, status change, delete) sends email to all members
- Activity logged for every action (feeds the heatmap)
- Fonts: Press Start 2P monospace everywhere
- Colors: earth tones (#2d1f0e, #5c4a2a, #ffd700, #4a8c3f, #e63946)
- No border-radius anywhere — pixel aesthetic
- Equipment system: WIP→sword, Done→shield, Rest (with gear)→armor
