import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

// To add real icons later, you could use a library like react-icons
// Example: import { FaSnake, FaTableTennis, FaTrophy } from 'react-icons/fa';

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

const HomePage = () => {
  // Initialize the navigate function from react-router-dom
  const navigate = useNavigate();

  // This is where you'll list all your future games.
  // When a game is ready, change its status to 'Ready' and provide the correct path.
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
    {
      title: 'Tic-Tac-Toe',
      description: 'The ultimate strategy duel. Can you outsmart the AI?',
      status: 'Coming Soon',
      icon: '🕹️',
      path: '/vqm-mini-games/tic-tac-toe',
    },
    {
      title: 'Memory Match',
      description: 'Flip the cards and find the pairs. A test of memory.',
      status: 'Coming Soon',
      icon: '🧠',
      path: '/vqm-mini-games/memory-match',
    },
  ];

  return (
    <div className="homepage-container">
      <header className="homepage-header">
        <h1>VQM's Game Arcade</h1>
        <p>A collection of mini-games built with React and passion.</p>
      </header>
      <main className="game-grid">
        {games.map((game, index) => (
          <GameCard
            key={index}
            title={game.title}
            description={game.description}
            status={game.status}
            icon={game.icon}
            // Pass a function to the onPlay prop that navigates to the game's path
            onPlay={() => game.path && navigate(game.path)}
          />
        ))}
      </main>
      <footer className="homepage-footer">
        <p>&copy; 2025 Vuong Quyen Mai. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
