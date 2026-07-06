import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ensureUser } from '@/app/actions';
import Sidebar from '@/components/Sidebar';
import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';

export default async function MembersPage() {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');
  await ensureUser();
  const user = await currentUser();
  const allUsers = await db.select().from(users);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <header className="top-bar">
          <span className="page-greeting">Welcome, {user?.firstName || 'Adventurer'}</span>
          <div className="top-bar-right"><UserButton afterSignOutUrl="/sign-in" /></div>
        </header>
        <div className="page-content">
          <h1 className="page-title">👥 MEMBERS</h1>
          <div className="members-grid">
            {allUsers.map(member => (
              <div key={member.id} className="member-card">
                <div className="member-avatar">
                  {member.imageUrl ? (
                    <img src={member.imageUrl} alt={member.name} className="avatar-img" />
                  ) : (
                    <span className="avatar-placeholder">{member.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="member-info">
                  <span className="member-name">{member.name}</span>
                  <span className="member-email">{member.email}</span>
                  <span className="member-joined">
                    Joined {new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="member-badge">{member.id === userId ? '👑 YOU' : '⚔️ ALLY'}</div>
              </div>
            ))}
          </div>
          {allUsers.length === 0 && (
            <div className="empty-state"><p>🏰 No members yet</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
