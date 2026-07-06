'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', icon: '🏠', label: 'Dashboard' },
  { href: '/quests', icon: '⚔️', label: 'Quests' },
  { href: '/posts', icon: '💬', label: 'Tavern' },
  { href: '/activity', icon: '📊', label: 'Activity' },
  { href: '/members', icon: '👥', label: 'Members' },
  { href: '/analytics', icon: '📈', label: 'Analytics' },
];

const teamItems = [
  { href: '/team/settings', icon: '⚙️', label: 'Team Settings' },
  { href: '/team/collab', icon: '🤝', label: 'Organizations' },
  { href: '/team/calendar', icon: '📅', label: 'Calendar' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">⛏️</span>
        <span className="sidebar-title">QUEST MGR</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-section-label">MAIN</span>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="nav-section">
          <span className="nav-section-label">TEAM</span>
          {teamItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <span className="nav-section-label">v2.0</span>
      </div>
    </aside>
  );
}
