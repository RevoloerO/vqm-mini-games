import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Gamepad2,
    MousePointer,
    Flower2,
    Globe,
    Settings, // Changed from Menu
    X
} from 'lucide-react';
import './HomePage.css';
import GameCard from './components/GameCard/GameCard';

// --- SidePanel Component ---
const SidePanel = ({ theme, toggleTheme, isOpen, togglePanel }) => {
    useEffect(() => {
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
                
                {/* 6. Empty Side Panel Needs Content Placeholder */}
                <div className="panel-content">
                    <h2 className="panel-title">Settings</h2>
                    
                    <div className="settings-section">
                        <h3>Theme</h3>
                        <div className="theme-switcher">
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

                    <div className="settings-section settings-disabled">
                        <h3>Audio</h3>
                        <p className="settings-placeholder">Coming soon</p>
                    </div>

                    <div className="settings-section settings-disabled">
                        <h3>Difficulty</h3>
                        <p className="settings-placeholder">Coming soon</p>
                    </div>
                </div>
            </aside>
        </>
    );
};

// --- HomePage Component ---
const HomePage = () => {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('vqm-game-theme');
        return savedTheme || 'dark';
    });

    const [isPanelOpen, setIsPanelOpen] = useState(false);

    // 1. Side Panel is Invisible
    const [hasSeenPanel, setHasSeenPanel] = useState(() => {
        return localStorage.getItem('vqm-seen-panel') === 'true';
    });

    // Scroll state for sticky header
    const [isScrolled, setIsScrolled] = useState(false);

    // Mouse position for interactive background
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const navigate = useNavigate();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Scroll event listener for sticky header
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Mouse position tracking for interactive background - Throttled for performance
    useEffect(() => {
        let animationFrameId = null;
        let isThrottled = false;

        const handleMouseMove = (e) => {
            if (isThrottled) return;

            isThrottled = true;
            animationFrameId = requestAnimationFrame(() => {
                setMousePos({
                    x: (e.clientX / window.innerWidth) * 100,
                    y: (e.clientY / window.innerHeight) * 100
                });
                isThrottled = false;
            });
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, []);

    // 1. Side Panel auto-open on first visit - with user interaction cancellation
    useEffect(() => {
        if (!hasSeenPanel) {
            let cancelled = false;

            const openTimer = setTimeout(() => {
                if (!cancelled) {
                    setIsPanelOpen(true);
                }
            }, 500);

            const closeTimer = setTimeout(() => {
                if (!cancelled) {
                    setIsPanelOpen(false);
                    localStorage.setItem('vqm-seen-panel', 'true');
                    setHasSeenPanel(true);
                }
            }, 2500);

            return () => {
                cancelled = true;
                clearTimeout(openTimer);
                clearTimeout(closeTimer);
            };
        }
    }, [hasSeenPanel]);

    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => {
            const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('vqm-game-theme', newTheme);
            return newTheme;
        });
    }, []);

    const togglePanel = useCallback(() => {
        // Mark panel as seen when user manually interacts with it
        if (!hasSeenPanel) {
            localStorage.setItem('vqm-seen-panel', 'true');
            setHasSeenPanel(true);
        }
        setIsPanelOpen(prev => !prev);
    }, [hasSeenPanel]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isPanelOpen) {
                setIsPanelOpen(false);
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isPanelOpen]);

    const handlePlay = (path) => {
        if (!path) return;
        navigate(path);
    };

    // Game List
    const games = [
        {
            title: 'Blooming Garden',
            description: 'Match vibrant flower tiles across an isometric garden. Line up five or more blooms to trigger cascading combos.',
            status: 'Ready',
            icon: <Flower2 size={80} />,
            path: '/vqm-mini-games/blooming-garden',
            featured: true,
            category: 'full-game',
        },
        {
            title: 'Mouse Stalker',
            description: 'A minimalist tracking experiment. Watch a circle follow your cursor with smooth, physics-based motion.',
            status: 'Ready',
            icon: <MousePointer size={40} />,
            path: '/vqm-mini-games/mouse-stalker',
            featured: false,
            category: 'experiment',
        },
        {
            title: '3D Ball',
            description: 'Interactive 3D physics demo. Drag to rotate, scroll to zoom, and watch realistic lighting respond to your input.',
            status: 'Ready',
            icon: <Globe size={40} />,
            path: '/vqm-mini-games/3d-ball',
            featured: false,
            category: 'experiment',
        },
    ];

    // Only use filter state when there are enough games to show the filter UI
    const [filter, setFilter] = useState('all');
    const showFilters = games.length >= 6;
    const displayedGames = showFilters ? games.filter(g => filter === 'all' || g.category === filter) : games;

    return (
        <div
            className={`app-layout ${isPanelOpen ? 'panel-open' : 'panel-closed'}`}
            style={{
                '--mouse-x': `${mousePos.x}%`,
                '--mouse-y': `${mousePos.y}%`
            }}
        >
            <SidePanel
                theme={theme}
                toggleTheme={toggleTheme}
                isOpen={isPanelOpen}
                togglePanel={togglePanel}
            />
            <div className="main-content">
                <header className={`main-header ${isScrolled ? 'scrolled' : ''}`}>
                    <button
                        onClick={togglePanel}
                        className="panel-toggle-btn modern"
                        aria-label={isPanelOpen ? 'Close settings panel' : 'Open settings panel'}
                        aria-expanded={isPanelOpen}
                    >
                        {isPanelOpen ? <X size={26} /> : <Settings size={26} />}
                    </button>
                    <div className="header-title-container">
                        <span className="header-icon" aria-hidden="true">
                            <Gamepad2 />
                        </span>
                        <h1 className="animated-title">VQM's Playground</h1>
                    </div>
                </header>
                <div className="homepage-container">
                    {/* Only show filters when there are 6+ games */}
                    {showFilters && (
                        <div className="game-filters">
                            <button onClick={() => setFilter('all')}
                                    className={filter === 'all' ? 'active' : ''}>
                                All Games
                            </button>
                            <button onClick={() => setFilter('full-game')}
                                    className={filter === 'full-game' ? 'active' : ''}>
                                Full Games
                            </button>
                            <button onClick={() => setFilter('experiment')}
                                    className={filter === 'experiment' ? 'active' : ''}>
                                Experiments
                            </button>
                        </div>
                    )}

                    <main>
                        <div className="game-grid">
                            {displayedGames.map((game, idx) => (
                                <GameCard
                                    key={game.title}
                                    {...game}
                                    onPlay={() => handlePlay(game.path)}
                                    delay={idx * 0.05}
                                />
                            ))}
                        </div>
                    </main>

                    <footer className="homepage-footer">
                        <div className="footer-content">
                            <div className="footer-section">
                                <h3>VQM's Playground</h3>
                                <p>Experimental mini-games and interactive demos</p>
                            </div>
                            <div className="footer-section">
                                <h3>Connect</h3>
                                <a href="https://revoloero.github.io" target="_blank" rel="noopener noreferrer">
                                    GitHub
                                </a>
                                <a href="mailto:vuongquyenmai@gmail.com">
                                    Email
                                </a>
                            </div>
                            <div className="footer-section">
                                <h3>Stats</h3>
                                <p>{games.length} games available</p>
                                <p>Built with React</p>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
