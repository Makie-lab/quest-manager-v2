'use client';

import { useEffect, useState, useRef } from 'react';

interface HeatmapData {
  date: string;
  count: number;
}

interface Props {
  data: HeatmapData[];
}

export default function ActivityHeatmap({ data }: Props) {
  const [grid, setGrid] = useState<{ date: string; count: number; level: number }[]>([]);
  const [cellSize, setCellSize] = useState(16);
  const [weeksToShow, setWeeksToShow] = useState(52);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive: adjust weeks and cell size based on container width
  useEffect(() => {
    function handleResize() {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth - 80; // minus padding + day labels
      if (width < 400) {
        // Mobile: show fewer weeks, smaller cells
        setCellSize(10);
        setWeeksToShow(Math.floor(width / 14));
      } else if (width < 700) {
        setCellSize(12);
        setWeeksToShow(Math.floor(width / 16));
      } else {
        setCellSize(16);
        setWeeksToShow(52);
      }
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const today = new Date();
    const cells: { date: string; count: number; level: number }[] = [];
    const dataMap = new Map(data.map(d => [d.date, d.count]));
    const maxCount = Math.max(1, ...data.map(d => d.count));

    const totalDays = weeksToShow * 7;
    for (let i = totalDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = dataMap.get(dateStr) || 0;
      const level = count === 0 ? 0 : Math.min(4, Math.ceil((count / maxCount) * 4));
      cells.push({ date: dateStr, count, level });
    }

    setGrid(cells);
  }, [data, weeksToShow]);

  // Organize into weeks (columns)
  const weeks: typeof grid[] = [];
  let currentWeek: typeof grid = [];
  grid.forEach((cell, i) => {
    const dayOfWeek = new Date(cell.date).getDay();
    if (i === 0) {
      for (let j = 0; j < dayOfWeek; j++) {
        currentWeek.push({ date: '', count: 0, level: -1 });
      }
    }
    currentWeek.push(cell);
    if (dayOfWeek === 6 || i === grid.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, weekIdx) => {
    const firstValidCell = week.find(c => c.date);
    if (firstValidCell && firstValidCell.date) {
      const month = new Date(firstValidCell.date).getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ label: months[month], col: weekIdx });
        lastMonth = month;
      }
    }
  });

  const totalActivities = data.reduce((sum, d) => sum + d.count, 0);
  const gap = cellSize >= 14 ? 4 : cellSize >= 10 ? 3 : 2;

  return (
    <div className="heatmap-container" ref={containerRef}>
      <div className="heatmap-header">
        <span className="heatmap-title">📊 ACTIVITY</span>
        <span className="heatmap-total">{totalActivities} actions this year</span>
      </div>

      {/* Size adjuster */}
      <div className="heatmap-controls">
        <label className="heatmap-size-label">SIZE:</label>
        <input
          type="range"
          min="8"
          max="24"
          value={cellSize}
          onChange={e => setCellSize(Number(e.target.value))}
          className="heatmap-slider"
        />
        <span className="heatmap-size-value">{cellSize}px</span>
      </div>

      {/* Month labels */}
      <div className="heatmap-months" style={{ paddingLeft: '40px' }}>
        {monthLabels.map((m, i) => (
          <span key={i} className="month-label" style={{ minWidth: `${(cellSize + gap) * 4}px` }}>
            {m.label}
          </span>
        ))}
      </div>

      {/* The graph */}
      <div className="heatmap-grid">
        <div className="heatmap-days" style={{ width: '34px', gap: `${cellSize + gap}px` }}>
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
        </div>
        <div className="heatmap-weeks" style={{ gap: `${gap}px` }}>
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="heatmap-week" style={{ gap: `${gap}px` }}>
              {week.map((cell, dayIdx) => (
                <div
                  key={dayIdx}
                  className={`heatmap-cell level-${cell.level}`}
                  style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                  title={cell.date ? `${cell.date}: ${cell.count} action${cell.count !== 1 ? 's' : ''}` : ''}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend BELOW the graph */}
      <div className="heatmap-footer">
        <div className="heatmap-legend">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className={`heatmap-cell level-${level}`}
              style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
