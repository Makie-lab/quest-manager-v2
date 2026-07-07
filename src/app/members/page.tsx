'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import Sidebar from '@/components/Sidebar';
import { getTeamMembers, getMyTeam, kickMember } from '@/app/actions';

export default function MembersPage() {
  const { user, isLoaded } = useUser();
  const [members, setMembers] = useState<any[]>([]);
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isLoaded || !user) return;
    loadData();
  }, [isLoaded, user]);

  async function loadData() {
    try {
      const myTeam = await getMyTeam();
      setTeam(myTeam);
      if (myTeam) {
        const teamMems = await getTeamMembers();
        setMembers(teamMems);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleKick(userId: string, name: string) {
    if (!confirm(`Kick ${name} from the team?`)) return;
    try {
      await kickMember(userId);
      setMessage(`Kicked ${name}`);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to kick');
    }
  }

  const isOwner = team?.myRole === 'owner';

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

          {message && <div className="panel"><div className="panel-body"><p style={{ color: '#4a8c3f', fontSize: '9px' }}>{message}</p></div></div>}

          {loading ? (
            <p className="page-greeting">Loading members...</p>
          ) : !team ? (
            <div className="empty-state">
              <p>🏰 No team yet</p>
              <p className="sub">Go to Team Settings to forge a team!</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '8px', color: '#7a6b3a', marginBottom: '16px' }}>
                Team: <span style={{ color: '#ffd700' }}>{team.name}</span> • {members.length} member{members.length !== 1 ? 's' : ''}
              </p>
              <div className="members-grid">
                {members.map(m => (
                  <div key={m.member.id} className="member-card">
                    <div className="member-avatar">
                      {m.user.imageUrl ? (
                        <img src={m.user.imageUrl} alt={m.user.name} className="avatar-img" />
                      ) : (
                        <span className="avatar-placeholder">{m.user.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="member-info">
                      <span className="member-name">{m.user.name}</span>
                      <span className="member-email">{m.user.email}</span>
                      <span className="member-joined">
                        Joined {new Date(m.member.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                      <span className="member-badge">
                        {m.member.role === 'owner' ? '👑 OWNER' : '⚔️ ALLY'}
                      </span>
                      {isOwner && m.member.role !== 'owner' && (
                        <button
                          className="btn-delete-sm"
                          onClick={() => handleKick(m.user.id, m.user.name)}
                        >
                          KICK
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
