export default function Loading() {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-logo">⛏️</span>
          <span className="sidebar-title">QUEST MGR</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="nav-section-label">MAIN</span>
            <span className="nav-item active">
              <span className="nav-icon">🏠</span>
              <span className="nav-label">Dashboard</span>
            </span>
            <span className="nav-item">
              <span className="nav-icon">⚔️</span>
              <span className="nav-label">Quests</span>
            </span>
            <span className="nav-item">
              <span className="nav-icon">💬</span>
              <span className="nav-label">Tavern</span>
            </span>
            <span className="nav-item">
              <span className="nav-icon">📊</span>
              <span className="nav-label">Activity</span>
            </span>
            <span className="nav-item">
              <span className="nav-icon">👥</span>
              <span className="nav-label">Members</span>
            </span>
            <span className="nav-item">
              <span className="nav-icon">📈</span>
              <span className="nav-label">Analytics</span>
            </span>
          </div>
          <div className="nav-section">
            <span className="nav-section-label">TEAM</span>
            <span className="nav-item">
              <span className="nav-icon">⚙️</span>
              <span className="nav-label">Team Settings</span>
            </span>
            <span className="nav-item">
              <span className="nav-icon">🤝</span>
              <span className="nav-label">Organizations</span>
            </span>
            <span className="nav-item">
              <span className="nav-icon">📅</span>
              <span className="nav-label">Calendar</span>
            </span>
          </div>
        </nav>
        <div className="sidebar-footer">
          <span className="nav-section-label">v2.0</span>
        </div>
      </aside>
      <div className="app-main">
        <header className="top-bar">
          <div className="top-bar-left">
            <span className="page-greeting">Loading adventure...</span>
          </div>
        </header>
        <div className="page-content">
          <div className="dashboard">
            <div className="loading-inline">
              <div className="loading-character">
                <div className="loading-pixel-art">
                  <div className="pixel-row">
                    <span className="px hair"></span><span className="px hair"></span><span className="px hair"></span>
                  </div>
                  <div className="pixel-row">
                    <span className="px skin"></span><span className="px skin"></span><span className="px skin"></span>
                  </div>
                  <div className="pixel-row">
                    <span className="px shirt"></span><span className="px shirt"></span><span className="px shirt"></span>
                  </div>
                  <div className="pixel-row">
                    <span className="px pants"></span><span className="px pants"></span><span className="px pants"></span>
                  </div>
                </div>
              </div>
              <div className="loading-text">
                <h1 className="loading-title">⛏️ QUEST MANAGER</h1>
                <div className="loading-bar-container">
                  <div className="loading-bar">
                    <div className="loading-bar-fill"></div>
                  </div>
                </div>
                <p className="loading-message">Loading your adventure...</p>
              </div>
              <div className="loading-blocks">
                <span className="block b1"></span>
                <span className="block b2"></span>
                <span className="block b3"></span>
                <span className="block b4"></span>
                <span className="block b5"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
