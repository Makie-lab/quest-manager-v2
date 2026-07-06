import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ensureUser, getCalendarEvents } from '@/app/actions';
import Sidebar from '@/components/Sidebar';
import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import CalendarClient from '@/components/CalendarClient';

export default async function TeamCalendarPage() {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');
  await ensureUser();
  const user = await currentUser();
  const events = await getCalendarEvents();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <header className="top-bar">
          <span className="page-greeting">Welcome, {user?.firstName || 'Adventurer'}</span>
          <div className="top-bar-right"><UserButton afterSignOutUrl="/sign-in" /></div>
        </header>
        <div className="page-content">
          <h1 className="page-title">📅 TEAM CALENDAR</h1>
          <CalendarClient events={events.map(e => ({
            id: e.id,
            title: e.title,
            startDate: e.startDate.toISOString(),
            endDate: e.endDate.toISOString(),
            color: e.color || '#ffd700',
          }))} />
        </div>
      </div>
    </div>
  );
}
