import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Gamepad2,
    MousePointer,
    Flower2,
    GitBranch,
    Menu,
    X
} from 'lucide-react';
import './HomePage.css';

// --- GameCard Component ---
// Displays a single game card with icon, title, description, status badge, and play button.
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
// Renders the side panel with theme switcher and close button.
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

// --- Main HomePage Component ---
// Handles theme, panel state, and renders the main layout, header, game grid, and footer.
const HomePage = () => {
    // Theme state, loaded from localStorage if available
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('vqm-game-theme');
        return savedTheme || 'dark';
    });

    // Side panel open/close state
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const navigate = useNavigate();

    // Apply theme to document root on change
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Toggle theme and persist to localStorage
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('vqm-game-theme', newTheme);
    };

    // Toggle side panel open/close
    const togglePanel = () => setIsPanelOpen(open => !open);

    // List of games to display
    const games = [
        {
            title: 'Mouse Stalker',
            description: 'A simple circle that follows your every move. A test of tracking.',
            status: 'Ready',
            icon: <MousePointer size={40} />,
            path: '/vqm-mini-games/mouse-stalker',
        },
        {
            title: 'Blooming Garden',
            description: 'Slide and match vibrant flower tiles across a lush 2.5D isometric garden—line up five or more blooms to trigger enchanting floral crescendos and watch your garden come to life.',
            status: 'Ready',
            icon: <Flower2 size={40} />,
            path: '/vqm-mini-games/blooming-garden',
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
        // Main layout with side panel and content
        <div className={`app-layout ${isPanelOpen ? 'panel-open' : 'panel-closed'}`}>
            {/* Side navigation panel */}
            <SidePanel
                theme={theme}
                toggleTheme={toggleTheme}
                isOpen={isPanelOpen}
                togglePanel={togglePanel}
            />
            <div className="main-content">
                {/* Header with toggle button and title */}
                <header className="main-header">
                    <button
                        onClick={togglePanel}
                        className={`panel-toggle-btn modern`}
                        aria-label={isPanelOpen ? 'Close panel' : 'Open panel'}
                    >
                        {isPanelOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                    <div className="header-title-container">
                        <span className="header-icon">
                            <Gamepad2 />
                        </span>
                        <h1>VQM's Playground</h1>
                    </div>
                </header>
                <div className="homepage-container">
                    {/* Game cards grid */}
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
                    {/* Footer */}
                    <footer className="homepage-footer">
                        <p>&copy; 2025 Vuong Quyen Mai. All rights reserved.</p>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
