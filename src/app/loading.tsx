export default function Loading() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
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
  );
}
