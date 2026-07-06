import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ensureUser } from '@/app/actions';
import Sidebar from '@/components/Sidebar';
import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { quests } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function AnalyticsPage() {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');
  await ensureUser();
  const user = await currentUser();

  const allQuests = await db.select().from(quests).where(eq(quests.userId, userId));
  const totalQuests = allQuests.length;
  const completedQuests = allQuests.filter(q => q.status === 'done').length;
  const wipQuests = allQuests.filter(q => q.status === 'wip').length;
  const overdueQuests = allQuests.filter(q => q.status !== 'done' && new Date(q.deadline) < new Date()).length;
  const completionRate = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;
  const p1 = allQuests.filter(q => q.priority === 1).length;
  const p2 = allQuests.filter(q => q.priority === 2).length;
  const p3 = allQuests.filter(q => q.priority === 3).length;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <header className="top-bar">
          <span className="page-greeting">Welcome, {user?.firstName || 'Adventurer'}</span>
          <div className="top-bar-right"><UserButton afterSignOutUrl="/sign-in" /></div>
        </header>
        <div className="page-content">
          <h1 className="page-title">📈 ANALYTICS</h1>

          <div className="stats-row">
            <div className="stat-card large">
              <span className="stat-value">{completionRate}%</span>
              <span className="stat-label">COMPLETION RATE</span>
              <div className="stat-bar"><div className="stat-bar-fill" style={{ width: `${completionRate}%` }} /></div>
            </div>
            <div className="stat-card">
              <span className="stat-value">{overdueQuests}</span>
              <span className="stat-label">OVERDUE</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{wipQuests}</span>
              <span className="stat-label">ACTIVE</span>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header"><span>⚡ PRIORITY BREAKDOWN</span></div>
            <div className="panel-body">
              <div className="priority-breakdown">
                <div className="priority-row">
                  <span className="priority-label p1">P1 EASY</span>
                  <div className="priority-bar-track"><div className="priority-bar-fill p1" style={{ width: `${totalQuests > 0 ? (p1 / totalQuests) * 100 : 0}%` }} /></div>
                  <span className="priority-count">{p1}</span>
                </div>
                <div className="priority-row">
                  <span className="priority-label p2">P2 MED</span>
                  <div className="priority-bar-track"><div className="priority-bar-fill p2" style={{ width: `${totalQuests > 0 ? (p2 / totalQuests) * 100 : 0}%` }} /></div>
                  <span className="priority-count">{p2}</span>
                </div>
                <div className="priority-row">
                  <span className="priority-label p3">P3 URG</span>
                  <div className="priority-bar-track"><div className="priority-bar-fill p3" style={{ width: `${totalQuests > 0 ? (p3 / totalQuests) * 100 : 0}%` }} /></div>
                  <span className="priority-count">{p3}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header"><span>📋 STATUS SUMMARY</span></div>
            <div className="panel-body">
              <div className="status-grid">
                <div className="status-block resting"><span className="status-count">{totalQuests - completedQuests - wipQuests}</span><span className="status-name">💤 RESTING</span></div>
                <div className="status-block wip"><span className="status-count">{wipQuests}</span><span className="status-name">⚒️ WORKING</span></div>
                <div className="status-block done"><span className="status-count">{completedQuests}</span><span className="status-name">✅ DONE</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
