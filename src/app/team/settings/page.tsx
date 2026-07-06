'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function TeamSettingsPage() {
  const [teamName, setTeamName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <header className="top-bar">
          <span className="page-greeting">Team Settings</span>
        </header>
        <div className="page-content">
          <h1 className="page-title">⚙️ TEAM SETTINGS</h1>

          <div className="panel">
            <div className="panel-header"><span>🏰 CREATE TEAM</span></div>
            <div className="panel-body">
              <div className="form-field">
                <label>TEAM NAME</label>
                <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Dragon Slayers Guild..." />
              </div>
              <button className="btn-craft">⚒️ FORGE TEAM</button>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header"><span>📨 INVITE MEMBERS</span></div>
            <div className="panel-body">
              <div className="form-field">
                <label>EMAIL ADDRESS</label>
                <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="ally@example.com" />
              </div>
              <button className="btn-craft">📧 SEND INVITE</button>
              <p className="form-hint">Invited members will receive an email to join your team.</p>
            </div>
          </div>

          <div className="panel panel-danger">
            <div className="panel-header"><span>⚠️ DANGER ZONE</span></div>
            <div className="panel-body">
              <p className="danger-text">Deleting a team removes all shared quests and calendar events.</p>
              <button className="btn-danger">🗑️ DELETE TEAM</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
