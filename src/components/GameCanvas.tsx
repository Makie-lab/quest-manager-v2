'use client';

import { useEffect, useRef } from 'react';

interface QuestData {
  id: string;
  status: string;
  equipment: string[];
}

interface Props {
  quests: QuestData[];
  userName: string;
}

// Pixel art character drawing engine
const PIXEL = 3;
const CHAR_W = 16;
const CHAR_H = 24;

const COLORS = {
  skin: '#e8b87a',
  hair: '#6b3a1a',
  shirt: '#4a8c3f',
  pants: '#3b2d1a',
  boots: '#5c4a2a',
  eye: '#1a1a2e',
  white: '#ffffff',
};

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 19) return 'dusk';
  return 'night';
}

function getSkyColors() {
  const tod = getTimeOfDay();
  switch (tod) {
    case 'dawn': return { top: '#2a1a3e', mid1: '#6b3a5a', mid2: '#cc7a4a', bottom: '#ffa060', starAlpha: 0.2, cloud: 'rgba(200,150,100,0.4)' };
    case 'day': return { top: '#4a90d9', mid1: '#6ab4f0', mid2: '#87ceeb', bottom: '#b0e0e6', starAlpha: 0, cloud: 'rgba(255,255,255,0.6)' };
    case 'dusk': return { top: '#1a1a4e', mid1: '#6b3a6b', mid2: '#cc6040', bottom: '#ff8040', starAlpha: 0.3, cloud: 'rgba(200,100,80,0.4)' };
    default: return { top: '#0f0f2e', mid1: '#1a1a4e', mid2: '#2d2d6b', bottom: '#4a3a5a', starAlpha: 1, cloud: 'rgba(100,100,140,0.3)' };
  }
}

export default function GameCanvas({ quests, userName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const charRef = useRef({ x: 0, y: 0, jumpProgress: 0, jumpTriggered: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
    resize();
    window.addEventListener('resize', resize);

    // Determine character state from quests
    const hasWIP = quests.some(q => q.status === 'wip');
    const allResting = quests.length > 0 && quests.every(q => q.status === 'resting');
    const questLoad = quests.length;
    const equipment = [...new Set(quests.flatMap(q => q.equipment))];
    const state = hasWIP ? 'walking' : allResting ? 'sleeping' : 'standing';
    const walkSpeed = 1.4 / (1 + (questLoad - 1) * 0.15);

    // Stars and clouds
    const stars = Array.from({ length: 30 }, () => ({
      x: Math.random() * 1200, y: Math.random() * 120, brightness: Math.random()
    }));
    const clouds = Array.from({ length: 5 }, () => ({
      x: Math.random() * 1200, y: 20 + Math.random() * 60, w: 40 + Math.random() * 60, speed: 0.2 + Math.random() * 0.3
    }));

    const char = charRef.current;
    char.x = canvas.width / 2;

    let animId: number;
    function draw() {
      if (!canvas || !ctx) return;
      frameRef.current++;
      const frame = frameRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const groundY = h - 44;
      const baseY = groundY - CHAR_H * PIXEL;
      const sky = getSkyColors();

      // Sky
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, sky.top);
      grad.addColorStop(0.4, sky.mid1);
      grad.addColorStop(0.7, sky.mid2);
      grad.addColorStop(1, sky.bottom);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Stars
      if (sky.starAlpha > 0) {
        const twinkle = Math.sin(frame * 0.05);
        stars.forEach(s => {
          const a = (0.3 + s.brightness * 0.5 + twinkle * 0.2 * s.brightness) * sky.starAlpha;
          ctx.fillStyle = `rgba(255,255,200,${Math.max(0, a)})`;
          ctx.fillRect(s.x % w, s.y, 2, 2);
        });
      }

      // Clouds
      clouds.forEach(c => {
        c.x += c.speed;
        if (c.x > w + 100) c.x = -c.w;
        ctx.fillStyle = sky.cloud;
        ctx.fillRect(c.x, c.y, c.w, c.w * 0.3);
      });

      // Ground
      ctx.fillStyle = '#4a8c3f';
      ctx.fillRect(0, groundY, w, 8);
      ctx.fillStyle = '#5c4a2a';
      ctx.fillRect(0, groundY + 8, w, 36);

      // Character movement
      if (state === 'walking') {
        char.x += walkSpeed;
        if (char.x > w + CHAR_W * PIXEL) char.x = -CHAR_W * PIXEL;
        char.y = baseY;
      } else if (state === 'sleeping') {
        char.y = baseY + 3 * PIXEL;
      } else {
        char.y = baseY;
        const center = w / 2 - (CHAR_W * PIXEL) / 2;
        char.x += (center - char.x) * 0.02;
      }

      // Draw character
      drawCharacter(ctx, char.x, char.y, frame, state, equipment, questLoad);

      // Name tag
      ctx.font = '8px "Press Start 2P"';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(232,213,183,0.9)';
      ctx.fillText(userName, char.x + (CHAR_W * PIXEL) / 2, char.y - 8);

      // Bag indicator
      if (questLoad > 0) {
        ctx.fillStyle = 'rgba(232,213,183,0.6)';
        ctx.font = '7px "Press Start 2P"';
        ctx.fillText(`${questLoad} quest${questLoad > 1 ? 's' : ''}`, char.x + (CHAR_W * PIXEL) / 2, char.y + CHAR_H * PIXEL + 14);
      }

      // Time indicator
      const tod = getTimeOfDay();
      const icons: Record<string, string> = { dawn: '🌅', day: '☀️', dusk: '🌇', night: '🌙' };
      ctx.font = '8px "Press Start 2P"';
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(232,213,183,0.7)';
      ctx.fillText(`${icons[tod]} ${tod.toUpperCase()}`, w - 10, h - 50);

      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [quests, userName]);

  return (
    <section className="game-scene">
      <canvas ref={canvasRef} className="game-canvas" />
    </section>
  );
}

function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, frame: number,
  state: string, equipment: string[], questLoad: number
) {
  const p = PIXEL;
  const drawRect = (col: number, row: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + col * p, y + row * p, w * p, h * p);
  };

  let legOffset = 0, armOffset = 0, bodyBob = 0;
  if (state === 'walking') {
    const wf = Math.floor(frame / 8) % 4;
    legOffset = [0, 1, 0, -1][wf];
    armOffset = [-1, 0, 1, 0][wf];
    bodyBob = wf % 2 === 0 ? 0 : -1;
  }

  if (state === 'sleeping') {
    // Horizontal character
    drawRect(0, 18, 16, 3, COLORS.shirt);
    drawRect(0, 15, 6, 5, COLORS.skin);
    drawRect(0, 14, 6, 2, COLORS.hair);
    ctx.fillStyle = COLORS.eye;
    ctx.fillRect(x + 2 * p, y + 17 * p, p, p);
    drawRect(10, 18, 6, 3, COLORS.pants);
    drawRect(14, 18, 2, 3, COLORS.boots);
    // ZZZ
    const zzz = Math.floor(frame / 20) % 3;
    ctx.fillStyle = 'rgba(150,150,255,0.7)';
    ctx.font = `${8 + zzz * 2}px "Press Start 2P"`;
    ctx.textAlign = 'center';
    ctx.fillText('z', x + 8 * p, y + (10 - zzz * 3) * p);
    // Bag next to sleeping
    if (questLoad > 0) drawBag(ctx, x - 4 * p, y + 14 * p, questLoad, frame, true);
    return;
  }

  const by = bodyBob;

  // Hair
  drawRect(4, 0 + by, 8, 3, COLORS.hair);
  drawRect(3, 1 + by, 10, 2, COLORS.hair);
  // Head
  drawRect(4, 3 + by, 8, 7, COLORS.skin);
  // Eyes
  ctx.fillStyle = COLORS.white;
  ctx.fillRect(x + 5 * p, y + (5 + by) * p, p, p);
  ctx.fillRect(x + 9 * p, y + (5 + by) * p, p, p);
  ctx.fillStyle = COLORS.eye;
  ctx.fillRect(x + 6 * p, y + (5 + by) * p, p, p);
  ctx.fillRect(x + 10 * p, y + (5 + by) * p, p, p);
  // Body
  drawRect(3, 10 + by, 10, 7, COLORS.shirt);

  // Armor
  if (equipment.includes('armor')) {
    drawRect(4, 10 + by, 8, 6, '#8a8a8a');
    drawRect(5, 11 + by, 6, 4, '#aaaaaa');
  }

  // Arms
  drawRect(1, 10 + by + armOffset, 2, 6, COLORS.shirt);
  drawRect(1, 15 + by + armOffset, 2, 2, COLORS.skin);
  drawRect(13, 10 + by - armOffset, 2, 6, COLORS.shirt);
  drawRect(13, 15 + by - armOffset, 2, 2, COLORS.skin);

  // Shield
  if (equipment.includes('shield')) {
    drawRect(-1, 11 + by + armOffset, 3, 6, '#6b4a00');
    drawRect(0, 12 + by + armOffset, 1, 4, '#ffd700');
  }

  // Sword
  if (equipment.includes('sword')) {
    drawRect(15, 10 + by - armOffset, 1, 8, '#c0c0c0');
    drawRect(14, 10 + by - armOffset, 3, 1, '#ffd700');
    drawRect(15, 8 + by - armOffset, 1, 3, '#e0e0e0');
  }

  // Belt
  drawRect(4, 16 + by, 8, 1, COLORS.boots);
  // Pants + Legs
  drawRect(4, 17 + by, 3, 4, COLORS.pants);
  drawRect(9, 17 + by, 3, 4, COLORS.pants);

  if (state === 'walking') {
    drawRect(4, 21 + by, 3, 3 + legOffset, COLORS.pants);
    drawRect(4, 23 + by + legOffset, 3, 1, COLORS.boots);
    drawRect(9, 21 + by, 3, 3 - legOffset, COLORS.pants);
    drawRect(9, 23 + by - legOffset, 3, 1, COLORS.boots);
  } else {
    drawRect(4, 21 + by, 3, 2, COLORS.pants);
    drawRect(4, 23 + by, 3, 1, COLORS.boots);
    drawRect(9, 21 + by, 3, 2, COLORS.pants);
    drawRect(9, 23 + by, 3, 1, COLORS.boots);
  }

  // Bag
  if (questLoad > 0) {
    drawBag(ctx, x - (3 + Math.min(questLoad, 5)) * p, y + (10 + by) * p, questLoad, frame, false);
  }
}

function drawBag(ctx: CanvasRenderingContext2D, bx: number, by: number, load: number, frame: number, sleeping: boolean) {
  const p = PIXEL;
  const bagW = Math.min(3 + load, 8) * p;
  const bagH = Math.min(4 + load, 10) * p;
  const bob = (!sleeping && Math.floor(frame / 8) % 2 === 0) ? 0 : p;

  ctx.fillStyle = '#6b4a2a';
  ctx.fillRect(bx, by + bob, bagW, bagH);
  ctx.fillStyle = '#4a3218';
  ctx.fillRect(bx, by + bob + bagH - p, bagW, p);
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(bx + Math.floor(bagW / 2) - p / 2, by + bob + Math.floor(bagH / 2), p, p);

  if (load >= 5) {
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(bx + 2 * p, by + bob - p, p, p);
  }
  if (load >= 8) {
    ctx.fillStyle = '#e8d5b7';
    ctx.fillRect(bx + p, by + bob - p, 2 * p, p);
  }
}
