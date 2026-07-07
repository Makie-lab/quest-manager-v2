'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import GameCanvas from '@/components/GameCanvas';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import { UserButton } from '@clerk/nextjs';
import { useUser } from '@clerk/nextjs';

interface QuestData {
  id: string;
  status: string;
  equipment: string[];
}

interface HeatmapDay {
  date: string;
  count: number;
}

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [quests, setQuests] = useState<QuestData[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoaded || !user) return;

    async function loadData() {
      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        setQuests(data.quests || []);
        setHeatmapData(data.heatmapData || []);
      } catch (e) {
        setError('Failed to load data. Please refresh.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isLoaded, user]);

  const userName = user?.firstName || 'Adventurer';
  const doneCount = quests.filter(q => q.status === 'done').length;
  const wipCount = quests.filter(q => q.status === 'wip').length;
  const totalQuests = quests.length;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <header className="top-bar">
          <div className="top-bar-left">
            <span className="page-greeting">
              {isLoaded ? `Welcome, ${userName}` : 'Loading...'}
            </span>
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
                <span className="stat-value">{loading ? '—' : totalQuests}</span>
                <span className="stat-label">TOTAL QUESTS</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{loading ? '—' : wipCount}</span>
                <span className="stat-label">IN PROGRESS</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{loading ? '—' : doneCount}</span>
                <span className="stat-label">COMPLETED</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{loading ? '—' : totalQuests - doneCount - wipCount}</span>
                <span className="stat-label">RESTING</span>
              </div>
            </div>

            {/* Game Canvas - always render */}
            <GameCanvas
              quests={quests.map(q => ({
                id: q.id,
                status: q.status,
                equipment: q.equipment || [],
              }))}
              userName={userName}
            />

            {/* Error state */}
            {error && (
              <div className="panel panel-danger">
                <div className="panel-body">
                  <p className="danger-text">{error}</p>
                </div>
              </div>
            )}

            {/* Activity Overview */}
            <ActivityHeatmap data={heatmapData} />
          </div>
        </div>
      </div>
    </div>
  );
}
