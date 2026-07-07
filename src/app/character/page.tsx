'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import { UserButton } from '@clerk/nextjs';
import { useUser } from '@clerk/nextjs';
import { getCharacterConfig, updateCharacterConfig } from '@/app/actions';

const DEFAULT_CONFIG = {
  hairColor: '#6b3a1a',
  skinColor: '#e8b87a',
  shirtColor: '#4a8c3f',
  pantsColor: '#3b2d1a',
  bootsColor: '#5c4a2a',
};

const COLOR_PRESETS = {
  hairColor: ['#6b3a1a', '#1a1a2e', '#ffd700', '#e63946', '#2d2d6b', '#ffffff', '#ff8040', '#4a8c3f'],
  skinColor: ['#e8b87a', '#f5d0a9', '#c68642', '#8d5524', '#503020', '#ffe0bd', '#d4a574', '#a67b5b'],
  shirtColor: ['#4a8c3f', '#e63946', '#4a90d9', '#ffd700', '#6b3a9a', '#1a1a2e', '#ff8040', '#ffffff'],
  pantsColor: ['#3b2d1a', '#1a1a4e', '#2d5a27', '#5c4a2a', '#4a4a4a', '#8b6914', '#2d2d6b', '#3a1a5a'],
  bootsColor: ['#5c4a2a', '#1a1a2e', '#8b6914', '#4a4a4a', '#6b3a1a', '#2d2d6b', '#e63946', '#ffffff'],
};

const PIXEL = 4;

export default function CharacterPage() {
  const { user } = useUser();
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const saved = await getCharacterConfig();
        if (saved && Object.keys(saved).length > 0) {
          setConfig({ ...DEFAULT_CONFIG, ...saved });
        }
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  // Render character preview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 200;
    canvas.height = 260;

    ctx.clearRect(0, 0, 200, 260);

    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 200, 260);

    const p = PIXEL;
    const ox = 60; // offset x
    const oy = 20; // offset y

    const drawRect = (col: number, row: number, w: number, h: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(ox + col * p, oy + row * p, w * p, h * p);
    };

    // Hair
    drawRect(4, 0, 8, 3, config.hairColor);
    drawRect(3, 1, 10, 2, config.hairColor);
    // Head
    drawRect(4, 3, 8, 7, config.skinColor);
    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ox + 5 * p, oy + 5 * p, p, p);
    ctx.fillRect(ox + 9 * p, oy + 5 * p, p, p);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(ox + 6 * p, oy + 5 * p, p, p);
    ctx.fillRect(ox + 10 * p, oy + 5 * p, p, p);
    // Body
    drawRect(3, 10, 10, 7, config.shirtColor);
    // Arms
    drawRect(1, 10, 2, 6, config.shirtColor);
    drawRect(1, 15, 2, 2, config.skinColor);
    drawRect(13, 10, 2, 6, config.shirtColor);
    drawRect(13, 15, 2, 2, config.skinColor);
    // Belt
    drawRect(4, 16, 8, 1, config.bootsColor);
    // Pants
    drawRect(4, 17, 3, 6, config.pantsColor);
    drawRect(9, 17, 3, 6, config.pantsColor);
    // Boots
    drawRect(4, 23, 3, 1, config.bootsColor);
    drawRect(9, 23, 3, 1, config.bootsColor);

    // Name
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(user?.firstName || 'Adventurer', 100, 240);
  }, [config, user]);

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      await updateCharacterConfig(config);
      setMessage('✅ Character saved!');
    } catch (err: any) {
      setMessage('❌ ' + (err.message || 'Failed to save'));
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setConfig(DEFAULT_CONFIG);
    setMessage('');
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <header className="top-bar">
          <span className="page-greeting">Character Customization</span>
          <div className="top-bar-right"><UserButton afterSignOutUrl="/sign-in" /></div>
        </header>
        <div className="page-content">
          <h1 className="page-title">🎨 CHARACTER CUSTOMIZATION</h1>

          {message && (
            <div className="panel">
              <div className="panel-body">
                <p style={{ fontSize: '9px', color: message.startsWith('❌') ? '#e63946' : '#4a8c3f' }}>{message}</p>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '16px' }}>
            {/* Preview */}
            <div className="panel">
              <div className="panel-header"><span>👤 PREVIEW</span></div>
              <div className="panel-body" style={{ display: 'flex', justifyContent: 'center' }}>
                <canvas ref={canvasRef} style={{ imageRendering: 'pixelated', width: '200px', height: '260px' }} />
              </div>
            </div>

            {/* Color pickers */}
            <div>
              <div className="panel">
                <div className="panel-header"><span>🎨 COLORS</span></div>
                <div className="panel-body">
                  <ColorPicker label="HAIR" value={config.hairColor} presets={COLOR_PRESETS.hairColor} onChange={v => setConfig(c => ({ ...c, hairColor: v }))} />
                  <ColorPicker label="SKIN" value={config.skinColor} presets={COLOR_PRESETS.skinColor} onChange={v => setConfig(c => ({ ...c, skinColor: v }))} />
                  <ColorPicker label="SHIRT" value={config.shirtColor} presets={COLOR_PRESETS.shirtColor} onChange={v => setConfig(c => ({ ...c, shirtColor: v }))} />
                  <ColorPicker label="PANTS" value={config.pantsColor} presets={COLOR_PRESETS.pantsColor} onChange={v => setConfig(c => ({ ...c, pantsColor: v }))} />
                  <ColorPicker label="BOOTS" value={config.bootsColor} presets={COLOR_PRESETS.bootsColor} onChange={v => setConfig(c => ({ ...c, bootsColor: v }))} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button className="btn-craft" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>
                  {saving ? '💾 SAVING...' : '💾 SAVE CHARACTER'}
                </button>
                <button className="btn-danger" onClick={handleReset} style={{ flex: 0 }}>
                  🔄 RESET
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorPicker({ label, value, presets, onChange }: { label: string; value: string; presets: string[]; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '7px', color: '#7a6b3a', marginBottom: '6px', letterSpacing: '1px', fontFamily: '"Press Start 2P", monospace' }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
        {presets.map(color => (
          <button
            key={color}
            onClick={() => onChange(color)}
            style={{
              width: '24px',
              height: '24px',
              background: color,
              border: value === color ? '3px solid #ffd700' : '2px solid #4d3f2a',
              cursor: 'pointer',
              padding: 0,
            }}
          />
        ))}
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width: '24px', height: '24px', padding: 0, border: '2px solid #4d3f2a', cursor: 'pointer' }}
        />
      </div>
    </div>
  );
}
