import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Gamepad2,
    MousePointer,
    Flower2,
    Globe,
    Settings,
    X,
    Volume2,
    VolumeX,
    Zap,
    Cloud,
    Leaf,
    Sun,
    Anchor,
    Ship
} from 'lucide-react';
import './HomePage.css';
import GameCard from './components/GameCard/GameCard';

// --- Theme Configuration ---
const THEMES = [
    { id: 'arcade', icon: '🕹️', name: 'Arcade', description: 'Neon Retro' },
    { id: 'floating-islands', icon: '🏝️', name: 'Islands', description: 'Grand Line' },
];

// --- Arcade Header Component ---
const ArcadeHeader = ({ isScrolled, togglePanel, isPanelOpen }) => (
    <header className={`main-header arcade-header ${isScrolled ? 'scrolled' : ''}`}>
        <button
            onClick={togglePanel}
            className="panel-toggle-btn arcade-btn"
            aria-label={isPanelOpen ? 'Close settings panel' : 'Open settings panel'}
            aria-expanded={isPanelOpen}
        >
            {isPanelOpen ? <X size={26} /> : <Settings size={26} />}
        </button>
        <div className="arcade-marquee">
            <div className="marquee-lights left" aria-hidden="true">
                <span className="light"></span>
                <span className="light"></span>
                <span className="light"></span>
            </div>
            <div className="header-title-container">
                <span className="header-icon" aria-hidden="true">
                    <Gamepad2 size={48} />
                </span>
                <h1 className="arcade-title-main">VQM's ARCADE</h1>
            </div>
            <div className="marquee-lights right" aria-hidden="true">
                <span className="light"></span>
                <span className="light"></span>
                <span className="light"></span>
            </div>
        </div>
        <div className="header-subtitle arcade-subtitle">INSERT COIN TO PLAY</div>
    </header>
);

// --- Floating Islands Header Component ---
const IslandsHeader = ({ isScrolled, togglePanel, isPanelOpen }) => (
    <header className={`main-header islands-header ${isScrolled ? 'scrolled' : ''}`}>
        <button
            onClick={togglePanel}
            className="panel-toggle-btn islands-btn"
            aria-label={isPanelOpen ? 'Close settings panel' : 'Open settings panel'}
            aria-expanded={isPanelOpen}
        >
            {isPanelOpen ? <X size={26} /> : <Settings size={26} />}
        </button>
        <div className="islands-header-content">
            <div className="floating-clouds left" aria-hidden="true">
                <Cloud size={24} className="cloud c1" />
                <Cloud size={18} className="cloud c2" />
            </div>
            <div className="header-title-container">
                <span className="header-icon islands-icon" aria-hidden="true">
                    <Anchor size={44} />
                </span>
                <h1 className="islands-title-main">Grand Line</h1>
            </div>
            <div className="floating-clouds right" aria-hidden="true">
                <Cloud size={20} className="cloud c3" />
                <Cloud size={26} className="cloud c4" />
            </div>
        </div>
        <div className="header-subtitle islands-subtitle">
            <Ship size={16} />
            <span>Set Sail to Adventure</span>
            <Ship size={16} />
        </div>
    </header>
);

// --- Sailing Boat Component (Vertical Navigation) ---
const SailingBoat = ({ targetIsland, islandPositions }) => {
    const [boatPosition, setBoatPosition] = useState({ y: 100 });
    const [isMoving, setIsMoving] = useState(false);
    const [goingDown, setGoingDown] = useState(true);
    const prevYRef = useRef(100);

    useEffect(() => {
        if (targetIsland !== null && islandPositions[targetIsland]) {
            const target = islandPositions[targetIsland];
            setIsMoving(true);
            setGoingDown(target.y > prevYRef.current);
            prevYRef.current = target.y;

            // Smooth transition to target
            setBoatPosition({ y: target.y });

            // Reset moving state after animation
            const timer = setTimeout(() => setIsMoving(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [targetIsland, islandPositions]);

    return (
        <div
            className={`sailing-boat vertical ${isMoving ? 'moving' : ''} ${goingDown ? 'going-down' : 'going-up'}`}
            style={{
                '--boat-y': `${boatPosition.y}px`
            }}
        >
            <div className="boat-body">
                <div className="sail">
                    <div className="sail-fabric"></div>
                    <div className="mast"></div>
                </div>
                <div className="hull">
                    <div className="hull-detail"></div>
                </div>
                <div className="flag">🏴‍☠️</div>
            </div>
            <div className="boat-wake"></div>
        </div>
    );
};

// --- SidePanel Component ---
const SidePanel = ({ theme, onThemeChange, isOpen, togglePanel }) => {
    const [soundEnabled, setSoundEnabled] = useState(false);

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

    const isArcade = theme === 'arcade';

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
                className={`side-panel ${isOpen ? 'open' : ''} ${isArcade ? 'arcade-panel' : 'islands-panel'}`}
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

                <div className="panel-content">
                    <h2 className={`panel-title ${isArcade ? 'arcade-panel-title' : 'islands-panel-title'}`}>
                        {isArcade ? (
                            <>
                                <Zap size={20} className="title-icon" />
                                OPTIONS
                                <Zap size={20} className="title-icon" />
                            </>
                        ) : (
                            <>
                                <Anchor size={20} className="title-icon" />
                                Captain's Log
                                <Anchor size={20} className="title-icon" />
                            </>
                        )}
                    </h2>

                    <div className="settings-section">
                        <h3>Theme</h3>
                        <div className="theme-grid">
                            {THEMES.map((t) => (
                                <button
                                    key={t.id}
                                    className={`theme-option ${theme === t.id ? 'active' : ''}`}
                                    onClick={() => onThemeChange(t.id)}
                                    aria-label={`Switch to ${t.name} theme`}
                                    aria-pressed={theme === t.id}
                                >
                                    <span className="theme-icon" aria-hidden="true">{t.icon}</span>
                                    <span className="theme-name">{t.name}</span>
                                    <span className="theme-description">{t.description}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3>{isArcade ? 'SOUND' : 'Sound'}</h3>
                        <button
                            className={`toggle-btn ${isArcade ? 'arcade-toggle' : 'islands-toggle'} ${soundEnabled ? 'active' : ''}`}
                            onClick={() => setSoundEnabled(!soundEnabled)}
                        >
                            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                            <span>{soundEnabled ? 'ON' : 'OFF'}</span>
                        </button>
                    </div>

                    <div className="settings-section settings-disabled">
                        <h3>{isArcade ? 'DIFFICULTY' : 'Difficulty'}</h3>
                        <p className="settings-placeholder">{isArcade ? 'COMING SOON' : 'Coming soon'}</p>
                    </div>

                    {isArcade && (
                        <div className="arcade-credits">
                            <span className="credit-label">CREDITS</span>
                            <span className="credit-value">∞</span>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

// --- Game Data with unique island themes ---
const GAMES = [
    {
        title: 'Mouse Stalker',
        description:
            'Watch a quirky creature follow your every move! Features smooth animations, playful expressions, and interactive behaviors.',
        status: 'Ready',
        icon: <MousePointer size={40} />,
        path: '/vqm-mini-games/mouse-stalker',
        featured: true,
        islandName: 'Cheese Cove',
        islandTheme: 'cheese', // Yellow cheese island with mouse holes
        islandEmoji: '🧀',
    },
    {
        title: 'Blooming Garden',
        description:
            'Build your dream garden tile by tile. Plant flowers, unlock secret patterns, and enjoy a peaceful creative experience.',
        status: 'Ready',
        icon: <Flower2 size={40} />,
        path: '/vqm-mini-games/blooming-garden',
        featured: false,
        islandName: 'Flora Haven',
        islandTheme: 'garden', // Green garden island with flowers
        islandEmoji: '🌸',
    },
    {
        title: '3D Ball',
        description:
            'Explore beautiful 3D spheres with stunning visual effects. Experience a mesmerizing world of elemental orbs.',
        status: 'Ready',
        icon: <Globe size={40} />,
        path: '/vqm-mini-games/3d-ball',
        featured: false,
        islandName: 'Crystal Peak',
        islandTheme: 'crystal', // Purple crystal island with gems
        islandEmoji: '💎',
    },
];

// --- Island Card Component for Grand Line theme ---
const IslandCard = ({ game, index, onHover, onLeave, onClick }) => {
    const cardRef = useRef(null);
    const { islandTheme, islandEmoji } = game;

    const handleMouseEnter = () => {
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            const containerRect = cardRef.current.closest('.islands-container')?.getBoundingClientRect();
            if (containerRect) {
                // For vertical layout, calculate Y position relative to container
                const yPosition = rect.top - containerRect.top + rect.height / 2;
                onHover(index, { x: 50, y: yPosition });
            }
        }
    };

    // Theme-specific decorations
    const renderDecorations = () => {
        switch (islandTheme) {
            case 'cheese':
                return (
                    <div className="island-decorations cheese-decorations">
                        <div className="cheese-hole hole-1"></div>
                        <div className="cheese-hole hole-2"></div>
                        <div className="cheese-hole hole-3"></div>
                        <div className="mouse-tail"></div>
                    </div>
                );
            case 'garden':
                return (
                    <div className="island-decorations garden-decorations">
                        <div className="flower flower-1">🌷</div>
                        <div className="flower flower-2">🌻</div>
                        <div className="flower flower-3">🌹</div>
                        <div className="butterfly">🦋</div>
                    </div>
                );
            case 'crystal':
                return (
                    <div className="island-decorations crystal-decorations">
                        <div className="crystal crystal-1"></div>
                        <div className="crystal crystal-2"></div>
                        <div className="crystal crystal-3"></div>
                        <div className="sparkle sparkle-1">✨</div>
                        <div className="sparkle sparkle-2">✨</div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div
            ref={cardRef}
            className={`island-card island-${index} island-theme-${islandTheme}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={onLeave}
            onClick={onClick}
            role="button"
            tabIndex={0}
            aria-label={`Sail to ${game.islandName}`}
        >
            {/* Connecting route line to next island */}
            {index < 2 && <div className="route-connector"></div>}

            <div className="island-name-banner">
                <span className="banner-emoji">{islandEmoji}</span>
                {game.islandName}
            </div>

            <div className={`island-platform platform-${islandTheme}`}>
                {renderDecorations()}

                <div className="island-top-decoration">
                    {islandTheme === 'cheese' && (
                        <>
                            <div className="cheese-wedge"></div>
                        </>
                    )}
                    {islandTheme === 'garden' && (
                        <div className="garden-grass">
                            <span className="grass-tuft">🌿</span>
                            <span className="grass-tuft">🌱</span>
                            <span className="grass-tuft">🌿</span>
                        </div>
                    )}
                    {islandTheme === 'crystal' && (
                        <div className="crystal-crown">
                            <span className="crown-gem">💠</span>
                        </div>
                    )}
                </div>

                <div className="island-content">
                    <div className="island-icon">{game.icon}</div>
                    <h3 className="island-title">{game.title}</h3>
                    <p className="island-description">{game.description}</p>
                </div>

                <div className={`island-base base-${islandTheme}`}>
                    <div className="base-layer layer-1"></div>
                    <div className="base-layer layer-2"></div>
                    <div className="base-rocks">
                        <span className="rock r1"></span>
                        <span className="rock r2"></span>
                    </div>
                </div>
            </div>

            <div className="island-shadow"></div>
        </div>
    );
};

// --- HomePage Component ---
const HomePage = () => {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('vqm-game-theme');
        if (savedTheme === 'arcade' || savedTheme === 'floating-islands') {
            return savedTheme;
        }
        return 'arcade';
    });

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [hasSeenPanel, setHasSeenPanel] = useState(() => {
        return localStorage.getItem('vqm-seen-panel') === 'true';
    });
    const [isScrolled, setIsScrolled] = useState(false);
    const [hoveredIsland, setHoveredIsland] = useState(null);
    const [islandPositions, setIslandPositions] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            document.body.style.setProperty('--mouse-x', `${x}%`);
            document.body.style.setProperty('--mouse-y', `${y}%`);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleThemeChange = useCallback((newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('vqm-game-theme', newTheme);
    }, []);

    const togglePanel = useCallback(() => {
        setIsPanelOpen((prev) => {
            if (!prev && !hasSeenPanel) {
                setHasSeenPanel(true);
                localStorage.setItem('vqm-seen-panel', 'true');
            }
            return !prev;
        });
    }, [hasSeenPanel]);

    const handlePlay = (path) => {
        navigate(path);
    };

    const handleIslandHover = useCallback((index, position) => {
        setIslandPositions(prev => ({ ...prev, [index]: position }));
        setHoveredIsland(index);
    }, []);

    const handleIslandLeave = useCallback(() => {
        // Keep the boat at last position, don't reset
    }, []);

    const displayedGames = GAMES;
    const isArcade = theme === 'arcade';

    return (
        <div className={`app-layout ${isPanelOpen ? 'panel-open' : ''}`} data-theme={theme}>
            <SidePanel
                theme={theme}
                onThemeChange={handleThemeChange}
                isOpen={isPanelOpen}
                togglePanel={togglePanel}
            />

            <main className={`main-content ${isArcade ? 'arcade-content' : 'islands-content'}`}>
                {isArcade ? (
                    <ArcadeHeader
                        isScrolled={isScrolled}
                        togglePanel={togglePanel}
                        isPanelOpen={isPanelOpen}
                    />
                ) : (
                    <IslandsHeader
                        isScrolled={isScrolled}
                        togglePanel={togglePanel}
                        isPanelOpen={isPanelOpen}
                    />
                )}

                <div className={`homepage-container ${isArcade ? 'arcade-container' : 'islands-container'}`}>
                    {/* Ocean and Boat for Islands theme */}
                    {!isArcade && (
                        <div className="ocean-scene">
                            <div className="ocean-waves">
                                <div className="wave wave-1"></div>
                                <div className="wave wave-2"></div>
                                <div className="wave wave-3"></div>
                            </div>
                            <SailingBoat
                                targetIsland={hoveredIsland}
                                islandPositions={islandPositions}
                            />
                            <div className="sailing-route">
                                <svg className="route-line" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0,5 Q25,2 50,5 T100,5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" strokeDasharray="2,2"/>
                                </svg>
                            </div>
                        </div>
                    )}

                    <section
                        className={`game-grid ${isArcade ? 'arcade-grid' : 'islands-grid'}`}
                        aria-label="Available games"
                    >
                        {isArcade ? (
                            displayedGames.map((game, idx) => (
                                <GameCard
                                    key={game.title}
                                    {...game}
                                    theme={theme}
                                    onPlay={() => handlePlay(game.path)}
                                    delay={idx * 0.1}
                                />
                            ))
                        ) : (
                            displayedGames.map((game, idx) => (
                                <IslandCard
                                    key={game.title}
                                    game={game}
                                    index={idx}
                                    theme={theme}
                                    onHover={handleIslandHover}
                                    onLeave={handleIslandLeave}
                                    onClick={() => handlePlay(game.path)}
                                />
                            ))
                        )}
                    </section>

                    <footer className={`homepage-footer ${isArcade ? 'arcade-footer' : 'islands-footer'}`}>
                        <div className="footer-content">
                            <div className="footer-section">
                                <h3>{isArcade ? 'ABOUT' : 'About'}</h3>
                                <p>A collection of fun mini-games built with React.</p>
                                <p>Created with love for learning and creativity.</p>
                            </div>
                            <div className="footer-section">
                                <h3>{isArcade ? 'GAMES' : 'Islands'}</h3>
                                <p>Mouse Stalker</p>
                                <p>Blooming Garden</p>
                                <p>3D Ball</p>
                            </div>
                            <div className="footer-section">
                                <h3>{isArcade ? 'TECH STACK' : 'Tech Stack'}</h3>
                                <p>React + Vite</p>
                                <p>CSS Animations</p>
                                <p>Canvas API</p>
                            </div>
                            <div className="footer-section">
                                <h3>{isArcade ? 'CONNECT' : 'Connect'}</h3>
                                <a
                                    href="https://github.com/quyen-hoang"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    GitHub
                                </a>
                            </div>
                        </div>
                        <div className="footer-bottom">
                            <p>{isArcade ? '© 2024 VQM ARCADE • ALL RIGHTS RESERVED' : '© 2024 VQM Playground • Made for fun'}</p>
                        </div>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default HomePage;
