import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

// --- Reusable GameCard Component ---
const GameCard = ({ title, description, status, icon, onPlay }) => (
  <div className="game-card">
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

// --- Side Panel Component (Cleaned Up) ---
const SidePanel = ({ theme, toggleTheme, isOpen }) => (
  <aside className={`side-panel ${isOpen ? 'open' : ''}`}>
    {/* The only content is now the theme switcher, centered by the new CSS */}
    <div className="theme-switcher">
      <span className="theme-label">Light</span>
      <label className="switch">
        <input type="checkbox" onChange={toggleTheme} checked={theme === 'dark'} />
        <span className="slider round"></span>
      </label>
      <span className="theme-label">Dark</span>
    </div>
  </aside>
);


const HomePage = () => {
  const [theme, setTheme] = useState('dark');
  const [isPanelOpen, setIsPanelOpen] = useState(true); 
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  const games = [
     {
      title: 'Mouse Stalker',
      description: 'A simple circle that follows your every move. A test of tracking.',
      status: 'Ready',
      icon: '🖱️',
      path: '/vqm-mini-games/mouse-stalker',
    },
    {
      title: 'Retro Pong',
      description: 'The timeless classic. A battle of reflexes and precision.',
      status: 'Coming Soon',
      icon: '🏓',
      path: '/vqm-mini-games/pong',
    },
    {
      title: 'Grid Snake',
      description: 'Eat, grow, and avoid yourself. How long can you last?',
      status: 'Coming Soon',
      icon: '🐍',
      path: '/vqm-mini-games/snake',
    },
  ];

  return (
    <div className={`app-layout ${isPanelOpen ? 'panel-open' : 'panel-closed'}`}>
      <SidePanel theme={theme} toggleTheme={toggleTheme} isOpen={isPanelOpen} />
      <div className="main-content">
        <header className="main-header">
           <button onClick={togglePanel} className="panel-toggle-btn">
             {/* Dynamically change the icon based on the panel's state */}
             {isPanelOpen ? '<' : '>'}
           </button>
          <h1>Game Arcade</h1>
        </header>
        <div className="homepage-container">
          <main className="game-grid">
            {games.map((game, index) => (
              <GameCard
                key={index}
                title={game.title}
                description={game.description}
                status={game.status}
                icon={game.icon}
                onPlay={() => game.path && navigate(game.path)}
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
