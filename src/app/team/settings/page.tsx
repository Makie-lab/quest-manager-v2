'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { createTeam, getMyTeam, inviteMember, deleteTeam, getTeamMembers, kickMember } from '@/app/actions';

export default function TeamSettingsPage() {
  const [teamName, setTeamName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadTeamData();
  }, []);

  async function loadTeamData() {
    try {
      const myTeam = await getMyTeam();
      setTeam(myTeam);
      if (myTeam) {
        const teamMembers = await getTeamMembers();
        setMembers(teamMembers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!teamName.trim()) { setError('Team name required'); return; }

    try {
      const formData = new FormData();
      formData.set('name', teamName);
      await createTeam(formData);
      setMessage('⚒️ Team forged successfully!');
      setTeamName('');
      await loadTeamData();
    } catch (err: any) {
      setError(err.message || 'Failed to create team');
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!inviteEmail.trim()) { setError('Email required'); return; }

    try {
      await inviteMember(inviteEmail);
      setMessage(`📧 Invited ${inviteEmail} to the team!`);
      setInviteEmail('');
      await loadTeamData();
    } catch (err: any) {
      setError(err.message || 'Failed to invite');
    }
  }

  async function handleKick(userId: string, name: string) {
    if (!confirm(`Are you sure you want to kick ${name} from the team?`)) return;
    setError('');
    setMessage('');

    try {
      await kickMember(userId);
      setMessage(`🦶 Kicked ${name} from the team.`);
      await loadTeamData();
    } catch (err: any) {
      setError(err.message || 'Failed to kick member');
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure? This will delete the team and remove all members.')) return;
    setError('');
    setMessage('');

    try {
      await deleteTeam();
      setMessage('Team deleted.');
      setTeam(null);
      setMembers([]);
    } catch (err: any) {
      setError(err.message || 'Failed to delete team');
    }
  }

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="app-main">
          <header className="top-bar"><span className="page-greeting">Team Settings</span></header>
          <div className="page-content"><p className="page-greeting">Loading...</p></div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <header className="top-bar">
          <span className="page-greeting">Team Settings</span>
        </header>
        <div className="page-content">
          <h1 className="page-title">⚙️ TEAM SETTINGS</h1>

          {message && <div className="panel"><div className="panel-body"><p style={{ color: '#4a8c3f', fontSize: '9px' }}>{message}</p></div></div>}
          {error && <div className="panel panel-danger"><div className="panel-body"><p className="danger-text">{error}</p></div></div>}

          {!team ? (
            <div className="panel">
              <div className="panel-header"><span>🏰 FORGE A TEAM</span></div>
              <div className="panel-body">
                <form onSubmit={handleCreateTeam}>
                  <div className="form-field">
                    <label>TEAM NAME</label>
                    <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Dragon Slayers Guild..." />
                  </div>
                  <button type="submit" className="btn-craft">⚒️ FORGE TEAM</button>
                </form>
              </div>
            </div>
          ) : (
            <>
              <div className="panel">
                <div className="panel-header"><span>🏰 {team.name}</span><span className="member-badge">👑 {team.myRole?.toUpperCase()}</span></div>
                <div className="panel-body">
                  <p style={{ fontSize: '8px', color: '#7a6b3a', marginBottom: '12px' }}>
                    Team created {new Date(team.createdAt).toLocaleDateString()}
                  </p>

                  {/* Members list with kick */}
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '8px', color: '#ffd700', marginBottom: '8px' }}>MEMBERS ({members.length})</p>
                    <div className="event-list">
                      {members.map(m => (
                        <div key={m.member.id} className="event-item">
                          <div className="event-info">
                            <span className="event-title">{m.user.name}</span>
                            <span className="event-dates">{m.user.email} • {m.member.role}</span>
                          </div>
                          {team.myRole === 'owner' && m.member.role !== 'owner' && (
                            <button
                              className="btn-delete-sm"
                              onClick={() => handleKick(m.user.id, m.user.name)}
                            >
                              KICK
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {team.myRole === 'owner' && (
                <div className="panel">
                  <div className="panel-header"><span>📨 INVITE MEMBERS</span></div>
                  <div className="panel-body">
                    <form onSubmit={handleInvite}>
                      <div className="form-field">
                        <label>EMAIL ADDRESS</label>
                        <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="ally@example.com" />
                      </div>
                      <button type="submit" className="btn-craft">📧 ADD ALLY</button>
                      <p className="form-hint">The user must have signed up already.</p>
                    </form>
                  </div>
                </div>
              )}

              {team.myRole === 'owner' && (
                <div className="panel panel-danger">
                  <div className="panel-header"><span>⚠️ DANGER ZONE</span></div>
                  <div className="panel-body">
                    <p className="danger-text">Deleting a team removes all shared quests and calendar events.</p>
                    <button className="btn-danger" onClick={handleDelete}>🗑️ DELETE TEAM</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
