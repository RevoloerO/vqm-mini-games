import React, { useState, useEffect, useCallback, useRef } from 'react';
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

// --- GameCard Component ---
const GameCard = ({ title, description, status, icon, onPlay, delay, featured = false }) => {
    const [tiltX, setTiltX] = useState(0);
    const [tiltY, setTiltY] = useState(0);
    const canvasRef = useRef(null);

    const handleClick = () => {
        if (status === 'Ready') onPlay();
    };

    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (status === 'Ready') onPlay();
        }
    }, [status, onPlay]);

    const handleMouseMove = (e) => {
        if (status !== 'Ready') return;
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        setTiltX(rotateX);
        setTiltY(rotateY);
    };

    const handleMouseLeave = () => {
        setTiltX(0);
        setTiltY(0);
    };

    // Canvas animations
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Mouse Stalker animation
        if (title === 'Mouse Stalker') {
            let mouseX = canvas.width / 2;
            let mouseY = canvas.height / 2;
            let targetX = mouseX;
            let targetY = mouseY;
            let animationId;

            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                mouseX += (targetX - mouseX) * 0.1;
                mouseY += (targetY - mouseY) * 0.1;

                ctx.beginPath();
                ctx.arc(mouseX, mouseY, 30, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(127, 183, 126, 0.5)';
                ctx.fill();

                animationId = requestAnimationFrame(animate);
            };

            const handleMove = (e) => {
                const rect = canvas.getBoundingClientRect();
                targetX = e.clientX - rect.left;
                targetY = e.clientY - rect.top;
            };

            canvas.addEventListener('mousemove', handleMove);
            animate();

            return () => {
                cancelAnimationFrame(animationId);
                canvas.removeEventListener('mousemove', handleMove);
            };
        }

        // Blooming Garden animation
        if (title === 'Blooming Garden') {
            const petals = Array.from({ length: 15 }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 10 + 5,
                speed: Math.random() * 1 + 0.5,
                rotation: Math.random() * Math.PI * 2
            }));

            let animationId;

            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                petals.forEach(petal => {
                    petal.y += petal.speed;
                    petal.rotation += 0.02;

                    if (petal.y > canvas.height) {
                        petal.y = -petal.size;
                        petal.x = Math.random() * canvas.width;
                    }

                    ctx.save();
                    ctx.translate(petal.x, petal.y);
                    ctx.rotate(petal.rotation);
                    ctx.fillStyle = 'rgba(127, 183, 126, 0.4)';
                    ctx.fillRect(-petal.size / 2, -petal.size / 2, petal.size, petal.size);
                    ctx.restore();
                });

                animationId = requestAnimationFrame(animate);
            };

            animate();

            return () => {
                cancelAnimationFrame(animationId);
            };
        }
    }, [title]);

    return (
        <div
            className="game-card"
            style={{
                animationDelay: `${delay}s`,
                cursor: status === 'Ready' ? 'pointer' : 'default',
                transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
            }}
            data-featured={featured}
            tabIndex={status === 'Ready' ? 0 : -1}
            onClick={handleClick}
            onKeyPress={handleKeyPress}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            role="button"
            aria-label={`Play ${title}`}
        >
            <canvas ref={canvasRef} className="card-background-canvas" />
            <div className="game-card-icon" aria-hidden="true">{icon}</div>
            <h3 className="game-card-title">{title}</h3>
            <p className="game-card-description">{description}</p>
        </div>
    );
};

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

    // 11. Prepare for Scalability (Filter)
    const [filter, setFilter] = useState('all');

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

    // Mouse position tracking for interactive background
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // 1. Side Panel is Invisible - Logic
    useEffect(() => {
        if (!hasSeenPanel) {
            const timer = setTimeout(() => {
                setIsPanelOpen(true);
            }, 500); // Open panel briefly

            const timer2 = setTimeout(() => {
                setIsPanelOpen(false);
                localStorage.setItem('vqm-seen-panel', 'true');
                setHasSeenPanel(true);
            }, 2500); // Close it

            return () => {
                clearTimeout(timer);
                clearTimeout(timer2);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => {
            const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('vqm-game-theme', newTheme);
            return newTheme;
        });
    }, []);

    const togglePanel = useCallback(() => {
        setIsPanelOpen(prev => !prev);
    }, []);

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

    const filteredGames = games.filter(g => filter === 'all' || g.category === filter);

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
                        <h1>
                            {'VQM\'s Playground'.split('').map((char, i) => (
                                <span key={i} style={{
                                    display: 'inline-block',
                                    animation: `letterSlide 0.5s ease forwards ${i * 0.03}s`,
                                    opacity: 0
                                }}>
                                    {char === ' ' ? '\u00A0' : char}
                                </span>
                            ))}
                        </h1>
                    </div>
                </header>
                <div className="homepage-container">
                    {/* Only show filters when there are 6+ games */}
                    {games.length >= 6 && (
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
                            {filteredGames.map((game, idx) => (
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
