# Game Engine (GameCanvas.tsx)

## Overview

Client-side React component using HTML5 Canvas to render a pixel-art character with animations, equipment, bag system, and day/night cycle.

## Character States

| State | Visual | Trigger |
|-------|--------|---------|
| walking | Moving right, legs animating | Any quest is WIP |
| sleeping | Lying horizontal, ZZZ floating | All quests resting |
| standing | Idle at center | Default / done quests |

## Equipment Rendering

- **Sword:** gray blade on right side (col 15, 8px tall) with gold crossguard
- **Shield:** brown/gold rectangle on left side
- **Armor:** gray overlay on torso (cols 4-12, rows 10-16)

All drawn with `fillRect` calls on the pixel grid.

## Bag System

- Bag drawn behind the character (left side)
- Size scales with `questLoad`: width = `min(3 + load, 8)`, height = `min(4 + load, 10)`
- At 5+ quests: items peek out the top
- At 8+ quests: bag overflows with scrolls/gold
- Walking speed: `1.4 / (1 + (questLoad - 1) * 0.15)`

## Day/Night Cycle

Based on real system time:

| Hours | Period | Sky Colors |
|-------|--------|------------|
| 6-8 | Dawn | Purple→orange gradient, sun rising |
| 8-17 | Day | Blue sky, white clouds, sun |
| 17-19 | Dusk | Purple→red gradient, sun setting |
| 19-6 | Night | Dark blue, stars twinkling, moon |

## Drawing Constants

- `PIXEL = 3` (each game pixel = 3x3 real pixels)
- `CHAR_W = 16` game pixels wide
- `CHAR_H = 24` game pixels tall
- Ground: 44px from bottom (grass + dirt layers)

## Props

```typescript
interface Props {
  quests: { id: string; status: string; equipment: string[] }[];
  userName: string;
}
```

Character state is derived from quests array on each render cycle. Equipment is aggregated (unique) from all quests.

## Animation Loop

- Uses `requestAnimationFrame`
- Frame counter for animation timing
- Walking: 4-frame leg/arm cycle (every 8 frames)
- Sleeping: ZZZ text cycles through 3 sizes (every 20 frames)
- Stars: twinkle using `sin(frame * 0.05)`
- Clouds: drift right, wrap at canvas edge
