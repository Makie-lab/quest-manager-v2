'use client';

import { useEffect, useRef, useState } from 'react';

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

// Generate mountain data based on canvas width
function generateMountains(w: number) {
  return [
    // Far mountains (smaller, lighter)
    { peaks: Array.from({ length: 6 }, (_, i) => ({ x: i * (w / 5) - 20, height: 40 + Math.random() * 30 })), color: '#3a5a4a', shadowColor: '#2a4a3a' },
    // Near mountains (taller, darker)
    { peaks: Array.from({ length: 4 }, (_, i) => ({ x: i * (w / 3) + 30, height: 60 + Math.random() * 40 })), color: '#2d4a3d', shadowColor: '#1a3a2d' },
  ];
}

// Generate tree data
function generateTrees(w: number) {
  const trees: { x: number; height: number; type: 'pine' | 'oak' }[] = [];
  for (let i = 0; i < 8; i++) {
    trees.push({
      x: (i * (w / 7)) + Math.random() * 40 - 20,
      height: 30 + Math.random() * 25,
      type: Math.random() > 0.5 ? 'pine' : 'oak',
    });
  }
  return trees;
}

// NPC data
const NPC_GREETINGS = [
  "Welcome, adventurer!",
  "Good day, hero!",
  "May your quests be swift!",
  "The guild awaits you!",
  "Stay determined!",
  "Need a quest? Check the board!",
  "You look stronger today!",
];

export default function GameCanvas({ quests, userName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const charRef = useRef({ x: 0, y: 0, jumpProgress: 0, jumpTriggered: false });
  const [npcGreeting, setNpcGreeting] = useState('');
  const [showGreeting, setShowGreeting] = useState(true);

  useEffect(() => {
    // Pick a random NPC greeting on mount
    const greeting = NPC_GREETINGS[Math.floor(Math.random() * NPC_GREETINGS.length)];
    setNpcGreeting(greeting);
    setShowGreeting(true);
    const timer = setTimeout(() => setShowGreeting(false), 6000);
    return () => clearTimeout(timer);
  }, []);

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

    // Generate landscape
    let mountains = generateMountains(canvas.width);
    let trees = generateTrees(canvas.width);

    const char = charRef.current;
    char.x = canvas.width / 2;

    // NPC position (stands on the right side)
    const npcX = canvas.width * 0.78;

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

      // Regenerate landscape if canvas width changed
      if (mountains[0].peaks.length < 3) {
        mountains = generateMountains(w);
        trees = generateTrees(w);
      }

      // Sky gradient
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
        ctx.beginPath();
        ctx.ellipse(c.x + c.w / 2, c.y, c.w / 2, c.w * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(c.x + c.w * 0.3, c.y + 5, c.w * 0.3, c.w * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Mountains (far)
      drawMountains(ctx, mountains[0], groundY, w);
      // Mountains (near)
      drawMountains(ctx, mountains[1], groundY, w);

      // Trees (behind ground)
      drawTrees(ctx, trees, groundY);

      // Ground layers
      ctx.fillStyle = '#5a9e4a';
      ctx.fillRect(0, groundY, w, 4);
      ctx.fillStyle = '#4a8c3f';
      ctx.fillRect(0, groundY + 4, w, 4);
      ctx.fillStyle = '#6b5a3a';
      ctx.fillRect(0, groundY + 8, w, 36);
      // Dirt texture
      for (let dx = 0; dx < w; dx += 12) {
        ctx.fillStyle = '#5c4a32';
        ctx.fillRect(dx + (frame * 0) % 6, groundY + 14, 4, 4);
        ctx.fillStyle = '#7a6b4a';
        ctx.fillRect(dx + 6, groundY + 22, 3, 3);
      }

      // NPC character (guide)
      drawNPC(ctx, npcX, baseY, frame);

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

      // Draw player character
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
      {showGreeting && npcGreeting && (
        <div className="npc-speech-bubble">
          <span className="npc-name">Guide</span>
          <p className="npc-message">{npcGreeting}</p>
        </div>
      )}
    </section>
  );
}

function drawMountains(
  ctx: CanvasRenderingContext2D,
  layer: { peaks: { x: number; height: number }[]; color: string; shadowColor: string },
  groundY: number,
  canvasW: number
) {
  ctx.fillStyle = layer.color;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  layer.peaks.forEach((peak, i) => {
    const px = peak.x;
    const py = groundY - peak.height;
    if (i === 0) {
      ctx.lineTo(px, groundY);
    }
    // Draw triangle mountain with slight curves
    ctx.lineTo(px + 20, groundY - peak.height * 0.3);
    ctx.lineTo(px + 40, py);
    ctx.lineTo(px + 60, groundY - peak.height * 0.4);
    ctx.lineTo(px + 80, groundY);
  });
  ctx.lineTo(canvasW, groundY);
  ctx.closePath();
  ctx.fill();

  // Snow caps on taller mountains
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  layer.peaks.forEach(peak => {
    if (peak.height > 50) {
      const px = peak.x + 40;
      const py = groundY - peak.height;
      ctx.beginPath();
      ctx.moveTo(px - 8, py + 10);
      ctx.lineTo(px, py);
      ctx.lineTo(px + 8, py + 10);
      ctx.closePath();
      ctx.fill();
    }
  });
}

function drawTrees(
  ctx: CanvasRenderingContext2D,
  trees: { x: number; height: number; type: 'pine' | 'oak' }[],
  groundY: number
) {
  trees.forEach(tree => {
    const tx = tree.x;
    const th = tree.height;

    if (tree.type === 'pine') {
      // Pine tree trunk
      ctx.fillStyle = '#4a3218';
      ctx.fillRect(tx + th * 0.15, groundY - th * 0.4, th * 0.08, th * 0.4);
      // Pine tree layers (3 triangles)
      ctx.fillStyle = '#2d6b2d';
      for (let layer = 0; layer < 3; layer++) {
        const layerY = groundY - th * 0.4 - layer * (th * 0.22);
        const layerW = th * (0.4 - layer * 0.08);
        ctx.beginPath();
        ctx.moveTo(tx + th * 0.19, layerY);
        ctx.lineTo(tx + th * 0.19 - layerW / 2, layerY + th * 0.28);
        ctx.lineTo(tx + th * 0.19 + layerW / 2, layerY + th * 0.28);
        ctx.closePath();
        ctx.fill();
      }
      // Darker shade on one side
      ctx.fillStyle = '#1a5a1a';
      for (let layer = 0; layer < 3; layer++) {
        const layerY = groundY - th * 0.4 - layer * (th * 0.22);
        const layerW = th * (0.4 - layer * 0.08);
        ctx.beginPath();
        ctx.moveTo(tx + th * 0.19, layerY);
        ctx.lineTo(tx + th * 0.19 - layerW / 2, layerY + th * 0.28);
        ctx.lineTo(tx + th * 0.19, layerY + th * 0.28);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      // Oak tree trunk
      ctx.fillStyle = '#5c3a1a';
      ctx.fillRect(tx + th * 0.12, groundY - th * 0.35, th * 0.1, th * 0.35);
      // Oak canopy (rounded)
      ctx.fillStyle = '#3a7a3a';
      ctx.beginPath();
      ctx.arc(tx + th * 0.17, groundY - th * 0.5, th * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(tx + th * 0.08, groundY - th * 0.42, th * 0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(tx + th * 0.26, groundY - th * 0.44, th * 0.17, 0, Math.PI * 2);
      ctx.fill();
      // Highlight
      ctx.fillStyle = '#4a9a4a';
      ctx.beginPath();
      ctx.arc(tx + th * 0.14, groundY - th * 0.55, th * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function drawNPC(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  const p = PIXEL;
  const drawRect = (col: number, row: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + col * p, y + row * p, w * p, h * p);
  };

  // Idle bob
  const bob = Math.floor(frame / 30) % 2 === 0 ? 0 : -1;

  // NPC hat (wizard-style)
  drawRect(4, -2 + bob, 8, 2, '#6b3a8a');
  drawRect(5, -4 + bob, 6, 2, '#6b3a8a');
  drawRect(6, -5 + bob, 4, 1, '#6b3a8a');
  // Hat brim
  drawRect(3, 0 + bob, 10, 1, '#5a2a7a');

  // Head
  drawRect(4, 1 + bob, 8, 7, '#e8b87a');
  // Eyes
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 5 * p, y + (3 + bob) * p, p, p);
  ctx.fillRect(x + 9 * p, y + (3 + bob) * p, p, p);
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(x + 6 * p, y + (3 + bob) * p, p, p);
  ctx.fillRect(x + 10 * p, y + (3 + bob) * p, p, p);
  // Beard
  drawRect(4, 7 + bob, 8, 3, '#8a7a5a');
  drawRect(5, 9 + bob, 6, 2, '#7a6a4a');

  // Robe body
  drawRect(3, 10 + bob, 10, 8, '#5a2a8a');
  drawRect(4, 10 + bob, 8, 8, '#6b3a9a');
  // Belt
  drawRect(4, 15 + bob, 8, 1, '#ffd700');
  // Arms (holding staff)
  drawRect(1, 10 + bob, 2, 7, '#6b3a9a');
  drawRect(13, 10 + bob, 2, 7, '#6b3a9a');
  // Hands
  drawRect(1, 16 + bob, 2, 2, '#e8b87a');
  drawRect(13, 16 + bob, 2, 2, '#e8b87a');

  // Legs/feet
  drawRect(5, 18 + bob, 3, 4, '#3a1a5a');
  drawRect(8, 18 + bob, 3, 4, '#3a1a5a');
  drawRect(5, 22 + bob, 3, 2, '#4a3218');
  drawRect(8, 22 + bob, 3, 2, '#4a3218');

  // Staff
  drawRect(-1, -4 + bob, 1, 28, '#8b6914');
  drawRect(-2, -5 + bob, 3, 1, '#ffd700');
  // Staff orb
  const orbGlow = Math.sin(frame * 0.08) * 0.3 + 0.7;
  ctx.fillStyle = `rgba(100, 200, 255, ${orbGlow})`;
  ctx.beginPath();
  ctx.arc(x + (-0.5) * p, y + (-6 + bob) * p, p * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // NPC label
  ctx.font = '7px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#b8a0ff';
  ctx.fillText('Guide', x + 8 * p, y + (-8 + bob) * p);
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
    drawRect(0, 18, 16, 3, COLORS.shirt);
    drawRect(0, 15, 6, 5, COLORS.skin);
    drawRect(0, 14, 6, 2, COLORS.hair);
    ctx.fillStyle = COLORS.eye;
    ctx.fillRect(x + 2 * p, y + 17 * p, p, p);
    drawRect(10, 18, 6, 3, COLORS.pants);
    drawRect(14, 18, 2, 3, COLORS.boots);
    const zzz = Math.floor(frame / 20) % 3;
    ctx.fillStyle = 'rgba(150,150,255,0.7)';
    ctx.font = `${8 + zzz * 2}px "Press Start 2P"`;
    ctx.textAlign = 'center';
    ctx.fillText('z', x + 8 * p, y + (10 - zzz * 3) * p);
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
