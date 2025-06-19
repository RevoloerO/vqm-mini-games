import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  MousePointer,
  RectangleHorizontal,
  GitBranch,
  Menu, // modern menu icon
  X // close icon
} from 'lucide-react';
import './HomePage.css';
import logoImage from './assets/mini-games-logo.png'; // Assuming you have a logo image

// --- GameCard Component ---
const GameCard = ({ title, description, status, icon, onPlay, delay }) => (
  <div className="game-card" style={{ animationDelay: `${delay}s` }}>
    <div className="game-card-icon">{icon}</div>
    <h3 className="game-card-title">{title}</h3>
    <p className="game-card-description">{description}</p>
    <div className="card-footer">
      <span className={`status-badge status-${status.toLowerCase().replace(' ', '-')}`}>
        {status}
      </span>
      <button
        className="play-button"
        disabled={status !== 'Ready'}
        onClick={onPlay}
      >
        Play
      </button>
    </div>
  </div>
);

// --- SidePanel Component ---
const SidePanel = ({ theme, toggleTheme, isOpen, togglePanel }) => (
  <aside className={`side-panel ${isOpen ? 'open' : ''}`}>
    <button onClick={togglePanel} className="panel-close-btn">
      <X size={20} />
    </button>
    <div className="theme-switcher">
      <span className="theme-label">Light</span>
      <label className="switch">
        <input
          type="checkbox"
          onChange={toggleTheme}
          checked={theme === 'dark'}
        />
        <span className="slider round"></span>
      </label>
      <span className="theme-label">Dark</span>
    </div>
  </aside>
);

// --- Main HomePage ---
const HomePage = () => {
  const [theme, setTheme] = useState('dark');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  const togglePanel = () => setIsPanelOpen(open => !open);

  const games = [
    {
      title: 'Mouse Stalker',
      description: 'A simple circle that follows your every move. A test of tracking.',
      status: 'Ready',
      icon: <MousePointer size={40} />,
      path: '/vqm-mini-games/mouse-stalker',
    },
    {
      title: 'Retro Pong',
      description: 'The timeless classic. Use a paddle to battle with precision.',
      status: 'Coming Soon',
      icon: <RectangleHorizontal size={40} />,
      path: '/vqm-mini-games/pong',
    },
    {
      title: 'Grid Snake',
      description: 'Eat, grow, and follow the path. How long can you last?',
      status: 'Coming Soon',
      icon: <GitBranch size={40} />,
      path: '/vqm-mini-games/snake',
    },
  ];

  return (
    <div className={`app-layout ${isPanelOpen ? 'panel-open' : 'panel-closed'}`}>
      <SidePanel
        theme={theme}
        toggleTheme={toggleTheme}
        isOpen={isPanelOpen}
        togglePanel={togglePanel}
      />
      <div className="main-content">
        <header className="main-header">
          <button
            onClick={togglePanel}
            className={`panel-toggle-btn modern`}
            aria-label={isPanelOpen ? 'Close panel' : 'Open panel'}
          >
            {isPanelOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
          <img src={logoImage} alt="VQM Mini Games Logo" className="logo-modern" />
          <div className="header-title-container">
            <span className="header-icon">
              <Gamepad2 />
            </span>
            <h1>VQM's Playground</h1>
          </div>
        </header>
        <div className="homepage-container">
          <main className="game-grid">
            {games.map((game, idx) => (
              <GameCard
                key={game.title}
                title={game.title}
                description={game.description}
                status={game.status}
                icon={game.icon}
                onPlay={() => game.path && navigate(game.path)}
                delay={idx * 0.1}
              />
            ))}
          </main>
          <footer className="homepage-footer">
            <p>&copy; 2025 Vuong Quyen Mai. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
