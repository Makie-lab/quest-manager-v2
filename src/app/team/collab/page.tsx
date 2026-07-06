import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ensureUser } from '@/app/actions';
import Sidebar from '@/components/Sidebar';
import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { teams, teamMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function TeamCollabPage() {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');
  await ensureUser();
  const user = await currentUser();

  const userTeams = await db
    .select({ team: teams, membership: teamMembers })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, userId));

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <header className="top-bar">
          <span className="page-greeting">Welcome, {user?.firstName || 'Adventurer'}</span>
          <div className="top-bar-right"><UserButton afterSignOutUrl="/sign-in" /></div>
        </header>
        <div className="page-content">
          <h1 className="page-title">🤝 ORGANIZATIONS</h1>
          {userTeams.length === 0 ? (
            <div className="panel">
              <div className="panel-body">
                <div className="empty-state">
                  <p>🏰 No organizations yet</p>
                  <p className="sub">Create a team in Team Settings or get invited by an ally!</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="org-grid">
              {userTeams.map(({ team, membership }) => (
                <div key={team.id} className="org-card">
                  <div className="org-header">
                    <span className="org-icon">🏰</span>
                    <span className="org-name">{team.name}</span>
                  </div>
                  <div className="org-meta">
                    <span className="org-role">{membership.role.toUpperCase()}</span>
                    <span className="org-date">Since {new Date(membership.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
