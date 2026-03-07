# VQM's Playground

<div align="center">

**A collection of interactive mini-games and creative web experiments**

[Live Demo](https://revoloero.github.io/vqm-mini-games/) • [Report Bug](https://github.com/revoloero/vqm-mini-games/issues) • [Request Feature](https://github.com/revoloero/vqm-mini-games/issues)

</div>

---

## About

VQM's Playground is a personal showcase of interactive web experiences built with React 19. The homepage features a **4-theme skin system** that completely transforms the look and feel of the interface — from neon arcade to feudal Japan ink scroll — while each mini-game demonstrates a distinct area of web development: game logic, physics, procedural animation, and Canvas-based simulation.

---

## Themes

The homepage ships with four switchable visual themes, persisted via `localStorage`:

| Theme | Name | Aesthetic |
|-------|------|-----------|
| 🕹️ | **Arcade** | Neon retro — scanlines, glowing grids, marquee lights |
| 🏝️ | **Grand Line** | Sky-and-ocean — clean floating cards, wave decoration |
| ⛩️ | **Edo** | Feudal Japan ink scroll — torii gates, koi fish, pagoda cards |
| 🎡 | **Night Fair** | Carnival midway — string lights, ferris wheel, booth cards |

Each theme has its own header, card layout, side panel, background, animations, and CSS variable set.

---

## Mini-Games

### 🖱️ Mouse Stalker
A quirky creature that follows your cursor. Demonstrates smooth cursor-tracking via `requestAnimationFrame`, easing functions, and playful sprite expressions that react to movement speed and direction.

### 🌸 Blooming Garden
A match-3 puzzle game with an isometric garden theme. Match 5+ flowers to trigger cascading combos, use power-ups (undo, row/column clear, bomb), and progress through milestone-based difficulty tiers with SVG particle effects.

### 🔮 3D Ball
An interactive 3D sphere viewer with 8 themed skins spanning conceptual, natural, magical, and sci-fi categories. Features real-time mouse tracking, dynamic per-skin lighting, particle systems, and custom physics simulations (Genesis Sphere, Fireball Jutsu, and more).

### 🍄 Mycelium Network
A Canvas-based organic simulation. Click to plant nodes and watch a bioluminescent fungal network grow in real time — tendrils seek targets, form connections, and pulse with living energy. Built with a custom `useMyceliumGame` hook.

### 🎆 Firework Festival
A color-and-shape matching arcade game with 10 unique levels. Observe animated firework previews, load cannons with the right color and shape, then fire to match the quest. Features dual-cannon mechanics, memory mode (fading previews), quick-match speed bonuses, sequence chains, and a crowd cheering system. Includes a relaxed Chill Mode with no timer.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 with Hooks |
| Routing | React Router v7 |
| Styling | Modular CSS with custom properties |
| Icons | Lucide React |
| Build | Vite 6 |
| Deployment | GitHub Pages (`gh-pages`) |

---

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# Clone
git clone https://github.com/revoloero/vqm-mini-games.git
cd vqm-mini-games

# Install
npm install

# Develop
npm run dev       # Vite dev server at http://localhost:5173

# Build & deploy
npm run build     # Production build → dist/
npm run deploy    # Build + publish to GitHub Pages
```

---

## Project Structure

```
src/
├── components/
│   └── GameCard/              # Shared tilt-effect card (Arcade + Edo + Carnival themes)
├── mini-games/
│   ├── MouseStalker/          # Cursor-tracking creature
│   │   ├── MouseStalker.jsx
│   │   ├── useDragonGame.js   # Animation & expression logic
│   │   └── MouseStalker.css
│   ├── BloomingGarden.jsx     # Match-3 puzzle game
│   ├── BloomingGarden.css
│   ├── 3DBall/                # 3D sphere viewer
│   │   ├── 3DBall.jsx
│   │   ├── components/        # Per-skin UI components
│   │   ├── hooks/             # Particle system hooks
│   │   └── styles/            # Per-skin stylesheets
│   ├── MyceliumNetwork/       # Canvas fungal network sim
│   │   ├── MyceliumNetwork.jsx
│   │   ├── useMyceliumGame.js  # Simulation logic
│   │   └── gameConfig.js
│   └── FireworkFestival/      # Color-matching firework arcade
│       ├── FireworkFestival.jsx
│       ├── useFireworkGame.js  # Game loop, scoring, level logic
│       ├── gameConfig.js       # 10 levels, colors, shapes
│       └── FireworkFestival.css
├── HomePage.jsx               # Landing page — theme system + game routing
├── HomePage.css               # All theme styles (~3230 lines)
└── App.jsx                    # Root with React Router
```

---

## Architecture Notes

### Theme System
- Themes are stored as `data-theme` on `:root`, toggled from a slide-in settings panel
- Each theme defines a full set of CSS custom properties (`--primary-text`, `--card-bg`, `--accent-color`, etc.)
- Per-theme card layouts: Arcade uses a `GameCard` grid, Grand Line uses `SeaCard` list, Edo uses `PagodaCard` + animated koi fish, Night Fair uses `BoothCard` carnival booths

### Performance
- High-frequency inputs (mouse position, animation loops) use `useRef` + `requestAnimationFrame`, not `useState`
- Particle systems have capped counts to prevent memory growth
- Canvas simulations are torn down on unmount via cleanup in `useEffect`

### Accessibility
- All interactive cards support keyboard navigation (`Enter`) via `onKeyDown`
- `aria-label`, `aria-expanded`, and `role` attributes throughout
- `prefers-reduced-motion` media query disables all animations

---

## License

MIT — see [LICENSE](LICENSE).

## Author

**Vuong Quyen Mai**
- GitHub: [@revoloero](https://github.com/revoloero)
- Email: vuongquyenmai@gmail.com

---

<div align="center">
Made with ❤️ by Vuong Quyen Mai
</div>
