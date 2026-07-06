# ⛏️ Quest Manager v2

A Terraria-inspired gamified task manager with pixel-art characters, activity heatmaps, email notifications, and full authentication.

## Features

- **Pixel-art character** that walks (WIP), sleeps (resting), stands (idle), or jumps (done)
- **Equipment system** — characters gain sword/shield/armor as quests progress
- **Bag system** — character slows down and carries a bigger bag with more quests
- **Day/Night cycle** — sky changes based on real time
- **Activity heatmap** — GitHub-style contribution graph tracking all quest activity
- **Email notifications** — get notified when deadlines are within 24 hours
- **Priority sorting** — sort by deadline (nearest) or priority (1-3)
- **Full authentication** — Clerk-powered sign-in/sign-up
- **Persistent database** — Neon PostgreSQL via Drizzle ORM

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Auth**: Clerk
- **Database**: Neon (PostgreSQL)
- **ORM**: Drizzle
- **Email**: Resend
- **Deploy**: Vercel
- **UI**: Terraria pixel-art theme (Press Start 2P font, Canvas API)

## Setup

### 1. Clone and install

```bash
cd quest-manager-v2
npm install
```

### 2. Set up services

#### Neon Database
1. Go to [neon.tech](https://neon.tech) and create a project
2. Copy the connection string

#### Clerk Authentication
1. Go to [clerk.com](https://clerk.com) and create an application
2. Copy the publishable key and secret key

#### Resend (Email)
1. Go to [resend.com](https://resend.com) and create an API key
2. Verify your domain or use the test domain

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in your credentials:
```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
RESEND_API_KEY=re_...
CRON_SECRET=your-random-secret
```

### 4. Push database schema

```bash
npm run db:push
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:5001](http://localhost:5001)

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Quest Manager v2"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables (same as `.env.local`)
4. Deploy

### 3. Configure Clerk

Update Clerk dashboard with your Vercel domain for production.

### 4. Cron Job

The `vercel.json` configures an hourly cron job for email notifications. It hits `/api/cron/notifications` every hour to check for upcoming deadlines.

## Database Schema

| Table | Purpose |
|-------|---------|
| `users` | Synced from Clerk — stores email, name, notification preference |
| `quests` | Tasks with name, deadline, priority, status, equipment |
| `activity_log` | Every action logged for the heatmap |

## Project Structure

```
src/
├── app/
│   ├── actions.ts          # Server actions (CRUD, heatmap data)
│   ├── globals.css         # Terraria-inspired styles
│   ├── layout.tsx          # Root layout with Clerk provider
│   ├── page.tsx            # Main dashboard page
│   ├── sign-in/            # Clerk sign-in page
│   ├── sign-up/            # Clerk sign-up page
│   └── api/cron/           # Email notification cron
├── components/
│   ├── ActivityHeatmap.tsx  # GitHub-style contribution graph
│   ├── GameCanvas.tsx       # Pixel character + day/night canvas
│   ├── QuestForm.tsx        # New quest form
│   └── QuestList.tsx        # Quest log with actions
├── db/
│   ├── index.ts            # Drizzle + Neon connection
│   └── schema.ts           # Database tables
└── middleware.ts            # Clerk auth middleware
```

## Character States

| Status | Character | Visual |
|--------|-----------|--------|
| Resting | Sleeping | Lying down with ZZZ |
| WIP | Walking | Moving across screen |
| Done | Jumping → Standing | Celebration arc |

## Equipment Progression

| Action | Reward |
|--------|--------|
| Set to WIP | ⚔️ Sword |
| Mark Done | 🛡️ Shield |
| Set to Rest (with gear) | 🦺 Armor |
