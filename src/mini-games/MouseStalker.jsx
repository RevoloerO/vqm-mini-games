import React from 'react';

// To add real icons later, you could use a library like react-icons
// Example: import { FaSnake, FaTableTennis, FaTrophy } from 'react-icons/fa';

const GameCard = ({ title, description, status, icon }) => (
  <div className="game-card">
    <div className="game-card-icon">{icon}</div>
    <h3 className="game-card-title">{title}</h3>
    <p className="game-card-description">{description}</p>
    <div className="card-footer">
      <span className={`status-badge status-${status.toLowerCase().replace(' ', '-')}`}>
        {status}
      </span>
      <button className="play-button" disabled={status !== 'Ready'}>
        Play
      </button>
    </div>
  </div>
);

const MouseStalker = () => {
  // This is where you'll list all your future games.
  // When a game is ready, change its status to 'Ready'.
  const games = [
    {
      title: 'Retro Pong',
      description: 'The timeless classic. A battle of reflexes and precision.',
      status: 'Coming Soon',
      icon: '�', // Placeholder icon
    },
    {
      title: 'Grid Snake',
      description: 'Eat, grow, and avoid yourself. How long can you last?',
      status: 'Coming Soon',
      icon: '🐍', // Placeholder icon
    },
    {
      title: 'Tic-Tac-Toe',
      description: 'The ultimate strategy duel. Can you outsmart the AI?',
      status: 'Coming Soon',
      icon: '🕹️', // Placeholder icon
    },
    {
      title: 'Memory Match',
      description: 'Flip the cards and find the pairs. A test of memory.',
      status: 'Coming Soon',
      icon: '🧠', // Placeholder icon
    },
    {
      title: 'More Games',
      description: 'New challenges and fun projects will appear here.',
      status: 'Planned',
      icon: '✨', // Placeholder icon
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
          />
        ))}
      </main>
      <footer className="homepage-footer">
        <p>&copy; 2025 Vuong Quyen Mai. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MouseStalker;
