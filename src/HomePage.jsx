import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Gamepad2,
    MousePointer,
    Flower2,
    Globe,
    Menu,
    X
} from 'lucide-react';
import './HomePage.css';

// --- GameCard Component ---
const GameCard = ({ title, description, status, icon, onPlay, delay }) => {
    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (status === 'Ready') onPlay();
        }
    }, [status, onPlay]);

    return (
        <div 
            className="game-card" 
            style={{ animationDelay: `${delay}s` }}
            tabIndex={status === 'Ready' ? 0 : -1}
            onKeyPress={handleKeyPress}
            role="article"
            aria-label={`${title} game card`}
        >
            <div className="game-card-icon" aria-hidden="true">{icon}</div>
            <h3 className="game-card-title">{title}</h3>
            <p className="game-card-description">{description}</p>
            <div className="card-footer">
                <span 
                    className={`status-badge status-${status.toLowerCase().replace(' ', '-')}`}
                    aria-label={`Status: ${status}`}
                >
                    {status}
                </span>
                <button
                    className="play-button"
                    disabled={status !== 'Ready'}
                    onClick={onPlay}
                    aria-label={`Play ${title}`}
                >
                    Play
                </button>
            </div>
        </div>
    );
};

// --- SidePanel Component ---
const SidePanel = ({ theme, toggleTheme, isOpen, togglePanel }) => {
    useEffect(() => {
        // Prevent body scroll when panel is open on mobile
        if (isOpen && window.innerWidth < 768) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div 
                    className="panel-overlay"
                    onClick={togglePanel}
                    aria-hidden="true"
                />
            )}
            <aside 
                className={`side-panel ${isOpen ? 'open' : ''}`}
                aria-label="Settings panel"
                aria-hidden={!isOpen}
            >
                <button 
                    onClick={togglePanel} 
                    className="panel-close-btn"
                    aria-label="Close settings panel"
                >
                    <X size={20} />
                </button>
                <div className="theme-switcher">
                    <div className="theme-switcher-wrapper">
                        <span className="theme-label" id="theme-light-label">Light</span>
                        <label className="switch" aria-labelledby="theme-light-label theme-dark-label">
                            <input
                                type="checkbox"
                                onChange={toggleTheme}
                                checked={theme === 'dark'}
                                aria-label="Toggle dark mode"
                            />
                            <span className="slider round"></span>
                        </label>
                        <span className="theme-label" id="theme-dark-label">Dark</span>
                    </div>
                </div>
            </aside>
        </>
    );
};

// --- HomePage Component ---
const HomePage = () => {
    // Initialize theme from localStorage before first render
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('vqm-game-theme');
        return savedTheme || 'dark';
    });

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const navigate = useNavigate();

    // Apply theme immediately on mount and changes
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Theme Toggle Handler
    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => {
            const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('vqm-game-theme', newTheme);
            return newTheme;
        });
    }, []);

    // Panel Toggle Handler
    const togglePanel = useCallback(() => {
        setIsPanelOpen(prev => !prev);
    }, []);

    // Close panel on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isPanelOpen) {
                setIsPanelOpen(false);
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isPanelOpen]);

    // Game List
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
            title: '3D Ball',
            description: 'A simple interactive 3D ball. Drag to rotate and zoom.',
            status: 'Ready',
            icon: <Globe size={40} />,
            path: '/vqm-mini-games/3d-ball',
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
                        className="panel-toggle-btn modern"
                        aria-label={isPanelOpen ? 'Close settings panel' : 'Open settings panel'}
                        aria-expanded={isPanelOpen}
                    >
                        {isPanelOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                    <div className="header-title-container">
                        <span className="header-icon" aria-hidden="true">
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