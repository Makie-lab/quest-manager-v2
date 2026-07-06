# Features Guide

## Pages

### 🏠 Dashboard (/)
- Stats row: total quests, in progress, completed, resting
- Game canvas with pixel character
- Activity heatmap (adjustable size)

### ⚔️ Quests (/quests)
- Left: new quest form (name, deadline, priority)
- Right: quest log with sort tabs (deadline/priority)
- Each quest card: priority bar, name, deadline, time remaining, equipment icons
- Action buttons: ⚒️ WIP, ✓ Done, 💤 Rest, ✕ Delete

### 💬 Tavern (/posts)
- Twitter-like feed for all members
- 280 character limit with live counter
- Posts show: author, avatar, time ago, content
- Like (❤️) and delete (🗑️) actions
- Newest posts first

### 📊 Activity (/activity)
- Large adjustable heatmap (slider to resize cells 8-24px)
- Auto-responsive to screen width
- Recent actions list below with icons and timestamps
- Legend (Less → More) centered below graph

### 👥 Members (/members)
- Grid of all registered users
- Shows avatar, name, email, join date
- "👑 YOU" badge for current user, "⚔️ ALLY" for others

### 📈 Analytics (/analytics)
- Completion rate with progress bar
- Overdue count, active count
- Priority breakdown (horizontal bars: P1/P2/P3)
- Status summary blocks (resting/working/done)

### ⚙️ Team Settings (/team/settings)
- Create team form
- Invite members by email
- Danger zone: delete team

### 🤝 Organizations (/team/collab)
- List of teams user belongs to
- Shows role (owner/admin/member) and join date

### 📅 Calendar (/team/calendar)
- Monthly grid with navigation (◀ ▶)
- Events displayed as colored blocks on matching days
- Add event form (title, start date, end date)
- Event list with delete button

## Loading Screen

Shows on initial page load while server data fetches:
- Pixel character blocks animation
- Gold title "⛏️ QUEST MANAGER"
- Animated green progress bar
- Blinking "Loading your adventure..." text
- 5 colored blocks pulsing in sequence

## Mobile Experience

- Sidebar collapses into bottom tab bar
- Quest cards stack vertically (priority bar on top, actions as horizontal row)
- Calendar cells shrink
- Heatmap auto-reduces weeks shown
- All panels full-width
- Stats grid: 2 columns → 1 column on small screens
