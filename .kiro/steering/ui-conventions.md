# UI & CSS Conventions

## Design System

Terraria-inspired pixel-art aesthetic across all pages.

- Font: `'Press Start 2P', monospace` for ALL text
- No border-radius — all sharp corners
- Borders: 3-4px solid with earth tones
- Box shadows: offset (4px 4px 0), no blur
- Transitions: 0.1-0.2s, snappy

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Body bg | `#1a1a2e` | Page background |
| Panel bg | `#2d1f0e` | Cards, panels, sidebar |
| Panel header bg | `#3b2d1a` | Panel title bars |
| Input bg | `#1a1008` | Form fields, dark slots |
| Border | `#5c4a2a` | Primary borders |
| Text primary | `#e8d5b7` | Main text |
| Text secondary | `#7a6b3a` | Labels, muted text |
| Text muted | `#5c4a2a` | Placeholders, timestamps |
| Gold | `#ffd700` | Titles, active states, highlights |
| Gold dark | `#8b6914` | Gold shadows |
| Green | `#4a8c3f` | Success, P1, grass, done |
| Dark green | `#2d5a27` | Green shadows |
| Red | `#e63946` | Danger, P3, overdue, delete |
| Purple | `#6b6baa` | Rest/sleep indicators |

## Font Sizes

| Element | Size |
|---------|------|
| Page titles | 14px |
| Panel headers | 10px |
| Stat values | 20px |
| Nav items | 8px |
| Quest names | 9px |
| Meta/labels | 7px |
| Form inputs | 9px |
| Buttons | 8-10px |
| Posts content | 9px |

## Layout

- Sidebar: 220px fixed left, sticky
- Mobile (< 768px): sidebar → bottom tab bar
- Max content width: determined by page
- Grid gaps: 12-16px
- Panel padding: 16px body, 12px header

## Button Patterns

### Primary (gold craft button)
```css
background: linear-gradient(180deg, #ffd700 0%, #cc9900 100%);
border: 3px solid #8b6914;
box-shadow: 0 4px 0 #6b4a00;
```

### Status buttons
- WIP: yellow bg `#ffd700` when active
- Done: green bg `#4a8c3f` when active
- Rest: purple bg `#6b6baa` when active
- Delete: red bg `#e63946`

## Responsive Breakpoints

| Breakpoint | Behavior |
|-----------|----------|
| > 900px | Full sidebar + 2-column layouts |
| 768-900px | Sidebar visible, single column |
| < 768px | Bottom tab bar, stacked everything |
| < 400px | Stats single column, compressed nav |

## Loading Screen

- Full-screen overlay on `#0f0f2e`
- Pixel character made of colored `<span>` blocks
- Animated green progress bar
- Blinking "Loading..." text
- 5 colored blocks pulsing in sequence
