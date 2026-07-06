import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getQuests, getActivityHeatmap, ensureUser } from './actions';
import { currentUser } from '@clerk/nextjs/server';
import Sidebar from '@/components/Sidebar';
import GameCanvas from '@/components/GameCanvas';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import { UserButton } from '@clerk/nextjs';

export default async function HomePage() {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');

  await ensureUser();
  const user = await currentUser();
  const quests = await getQuests();
  const heatmapData = await getActivityHeatmap();

  const doneCount = quests.filter(q => q.status === 'done').length;
  const wipCount = quests.filter(q => q.status === 'wip').length;
  const totalQuests = quests.length;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <header className="top-bar">
          <div className="top-bar-left">
            <span className="page-greeting">Welcome, {user?.firstName || 'Adventurer'}</span>
          </div>
          <div className="top-bar-right">
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </header>
        <div className="page-content">
          <div className="dashboard">
            {/* Stats Row */}
            <div className="stats-row">
              <div className="stat-card">
                <span className="stat-value">{totalQuests}</span>
                <span className="stat-label">TOTAL QUESTS</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{wipCount}</span>
                <span className="stat-label">IN PROGRESS</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{doneCount}</span>
                <span className="stat-label">COMPLETED</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{totalQuests - doneCount - wipCount}</span>
                <span className="stat-label">RESTING</span>
              </div>
            </div>

            {/* Game Canvas */}
            <GameCanvas quests={quests.map(q => ({
              id: q.id,
              status: q.status,
              equipment: JSON.parse(q.equipment || '[]'),
            }))} userName={user?.firstName || 'Adventurer'} />

            {/* Activity Overview */}
            <ActivityHeatmap data={heatmapData} />
          </div>
        </div>
      </div>
    </div>
  );
}
