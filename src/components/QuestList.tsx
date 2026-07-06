'use client';

import { useState } from 'react';
import { updateQuestStatus, deleteQuest } from '@/app/actions';
import type { Quest } from '@/db/schema';

interface Props {
  quests: Quest[];
}

export default function QuestList({ quests }: Props) {
  const [sort, setSort] = useState<'deadline' | 'priority'>('deadline');

  const sorted = [...quests].sort((a, b) => {
    // Done tasks to bottom
    if (a.status === 'done' && b.status !== 'done') return 1;
    if (b.status === 'done' && a.status !== 'done') return -1;
    if (sort === 'priority') {
      if (b.priority !== a.priority) return b.priority - a.priority;
    }
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  function formatDeadline(deadline: Date) {
    return new Date(deadline).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  function getTimeRemaining(deadline: Date) {
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff <= 0) return 'OVERDUE!';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }

  const equipmentIcons: Record<string, string> = {
    sword: '⚔️',
    shield: '🛡️',
    armor: '🦺',
  };

  return (
    <div className="panel panel-log">
      <div className="panel-header">
        <span>🎒 QUEST LOG</span>
        <div className="sort-tabs">
          <button
            className={`sort-tab ${sort === 'deadline' ? 'active' : ''}`}
            onClick={() => setSort('deadline')}
          >
            ⏰ DEADLINE
          </button>
          <button
            className={`sort-tab ${sort === 'priority' ? 'active' : ''}`}
            onClick={() => setSort('priority')}
          >
            ⚡ PRIORITY
          </button>
        </div>
      </div>
      <div className="panel-body quest-log-body">
        {sorted.length === 0 ? (
          <div className="empty-state">
            <p>🗡️ NO QUESTS</p>
            <p className="sub">Forge a quest to begin your adventure!</p>
          </div>
        ) : (
          <div className="quest-list">
            {sorted.map(quest => {
              const isOverdue = quest.status !== 'done' && new Date(quest.deadline) < new Date();
              const equipment = JSON.parse(quest.equipment || '[]') as string[];

              return (
                <div
                  key={quest.id}
                  className={`quest-item ${quest.status === 'done' ? 'done' : ''} ${quest.status === 'resting' ? 'resting' : ''}`}
                >
                  <div className={`quest-priority-bar p${quest.priority}`} />
                  <div className="quest-content">
                    <div className="quest-name">{quest.name}</div>
                    <div className="quest-meta">
                      <span className={`deadline ${isOverdue ? 'overdue' : ''}`}>
                        ⏰ {formatDeadline(quest.deadline)} ({getTimeRemaining(quest.deadline)})
                      </span>
                      <span className={`priority p${quest.priority}`}>
                        P{quest.priority} {['', 'EASY', 'MEDIUM', 'URGENT'][quest.priority]}
                      </span>
                    </div>
                    <div className="quest-footer">
                      <span className="quest-equip">
                        {equipment.map(e => equipmentIcons[e] || '').join(' ')}
                      </span>
                    </div>
                  </div>
                  <div className="quest-actions">
                    <button
                      className={`btn-wip ${quest.status === 'wip' ? 'active' : ''}`}
                      onClick={() => updateQuestStatus(quest.id, 'wip')}
                    >
                      ⚒️ WIP
                    </button>
                    <button
                      className={`btn-done ${quest.status === 'done' ? 'active' : ''}`}
                      onClick={() => updateQuestStatus(quest.id, 'done')}
                    >
                      ✓ DONE
                    </button>
                    <button
                      className={`btn-rest ${quest.status === 'resting' ? 'active' : ''}`}
                      onClick={() => updateQuestStatus(quest.id, 'resting')}
                    >
                      💤 REST
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => deleteQuest(quest.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
