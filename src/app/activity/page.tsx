import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getActivityHeatmap, getRecentActivity, ensureUser } from '@/app/actions';
import Sidebar from '@/components/Sidebar';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';

export default async function ActivityPage() {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');
  await ensureUser();
  const user = await currentUser();
  const heatmapData = await getActivityHeatmap();
  const recentActivity = await getRecentActivity(20);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <header className="top-bar">
          <span className="page-greeting">Welcome, {user?.firstName || 'Adventurer'}</span>
          <div className="top-bar-right"><UserButton afterSignOutUrl="/sign-in" /></div>
        </header>
        <div className="page-content">
          <h1 className="page-title">📊 ACTIVITY</h1>

          <div className="activity-heatmap-large">
            <ActivityHeatmap data={heatmapData} />
          </div>

          <div className="activity-details">
            <div className="panel">
              <div className="panel-header"><span>📜 RECENT ACTIONS</span></div>
              <div className="panel-body">
                {recentActivity.length === 0 ? (
                  <div className="empty-state">
                    <p>No activity yet</p>
                    <p className="sub">Start forging quests to see your history!</p>
                  </div>
                ) : (
                  <div className="activity-list">
                    {recentActivity.map(entry => (
                      <div key={entry.id} className="activity-entry">
                        <span className="activity-icon">
                          {entry.action === 'created' && '🆕'}
                          {entry.action === 'completed' && '✅'}
                          {entry.action === 'status_changed' && '🔄'}
                          {entry.action === 'deleted' && '🗑️'}
                        </span>
                        <div className="activity-info">
                          <span className="activity-action">{entry.action.replace('_', ' ').toUpperCase()}</span>
                          <span className="activity-date">
                            {new Date(entry.date).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
