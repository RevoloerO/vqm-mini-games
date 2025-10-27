# VQM's Playground

<div align="center">

**A curated collection of interactive mini-games and experimental demos**

[Live Demo](https://revoloero.github.io/vqm-mini-games/) • [Report Bug](https://github.com/revoloero/vqm-mini-games/issues) • [Request Feature](https://github.com/revoloero/vqm-mini-games/issues)

</div>

---

## 🎮 About

VQM's Playground is a showcase of interactive web experiences built with React, featuring everything from fully-playable puzzle games to experimental physics demos. Each project demonstrates different aspects of web development, from complex game logic to creative CSS animations.

## ✨ Featured Projects

### 🌸 Blooming Garden
**A match-3 puzzle game with an isometric garden theme**

- Match 5+ flowers to create cascading combos
- Strategic power-ups: Undo moves, clear rows/columns, or detonate bombs
- Progressive difficulty with milestone-based level system
- Smooth SVG animations and particle effects

### 🎯 Mouse Stalker
**A minimalist physics experiment**

- Smooth cursor-following animation using easing functions
- Demonstrates requestAnimationFrame optimization
- Clean, minimal design focused on motion

### 🔮 3D Ball
**Interactive 3D showcase with multiple themed skins**

- **8 unique skins** spanning conceptual, normal, magical, and sci-fi themes
- Real-time mouse tracking with dynamic lighting effects
- Particle systems with optimized RAF loops
- Custom physics simulations per skin (Genesis Sphere, Fireball Jutsu, etc.)

## 🛠️ Tech Stack

- **Framework**: React 18 with Hooks
- **Routing**: React Router v6
- **Styling**: Modular CSS with custom properties
- **Icons**: Lucide React
- **Build Tool**: Create React App
- **Deployment**: GitHub Pages

## 🏗️ Architecture Highlights

### Performance Optimizations
- **Throttled event listeners** with requestAnimationFrame
- **Particle system caps** to prevent memory leaks
- **Conditional rendering** for canvas animations
- **Memoized calculations** for expensive operations

### Code Organization
- **Modular component structure** with single responsibility
- **Custom hooks** for reusable logic (useCardTilt, useFireParticleSystem, useFertilizerSystem)
- **Separated concerns**: UI components, business logic, and styling
- **Consolidated CSS imports** for better maintainability

### Accessibility
- **Keyboard navigation** support for all interactive elements
- **ARIA labels** for screen readers
- **Focus management** with visible focus indicators
- **Reduced motion** support via prefers-reduced-motion

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/revoloero/vqm-mini-games.git

# Navigate to project directory
cd vqm-mini-games

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
npm start       # Start development server
npm test        # Run test suite
npm run build   # Create production build
npm run deploy  # Deploy to GitHub Pages
```

## 📁 Project Structure

```
src/
├── components/
│   └── GameCard/          # Reusable card component with tilt effects
├── mini-games/
│   ├── BloomingGarden/    # Match-3 puzzle game
│   ├── MouseStalker/      # Physics experiment
│   └── 3DBall/
│       ├── components/    # Ball skin UI components
│       ├── hooks/         # Particle system hooks
│       └── styles/        # Organized skin stylesheets
├── HomePage.jsx           # Landing page with game grid
└── App.jsx               # Main app with routing
```

## 🎨 Features

- **Theme System**: Light/Dark mode with persistent storage
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Smooth Animations**: CSS animations with hardware acceleration
- **Interactive Effects**: Tilt effects, particle systems, and dynamic backgrounds
- **Progressive Enhancement**: Works without JavaScript for basic content

## 🧪 Development Notes

### State Management
- **Refs vs State**: Uses refs for high-frequency updates (mouse position) and state for UI updates
- **Effect Dependencies**: Carefully managed to prevent unnecessary re-renders
- **Memoization**: Applied strategically to expensive calculations

### Performance Patterns
- **Throttling**: Mouse events throttled via RAF
- **Debouncing**: Window resize events debounced
- **Lazy Loading**: Routes split for code splitting
- **Animation Budgets**: Capped particle counts and limited concurrent animations

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Vuong Quyen Mai**
- GitHub: [@revoloero](https://github.com/revoloero)
- Email: vuongquyenmai@gmail.com

## 🙏 Acknowledgments

- Built with Create React App
- Icons by [Lucide](https://lucide.dev/)
- Inspired by classic puzzle games and physics experiments

---

<div align="center">
Made with ❤️ by Vuong Quyen Mai
</div>
