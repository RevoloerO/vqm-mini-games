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
    Anchor,
    Ship,
    Scroll,
    Ticket,
    Share2,
    Sparkles,
    Navigation,
    ChevronUp,
    ChevronDown,
    Droplets
} from 'lucide-react';
import './HomePage.css';
import GameCard from './components/GameCard/GameCard';
import { useExpandableCard } from './hooks/useExpandableCard';

// --- Theme Configuration ---
const VALID_THEMES = ['arcade', 'floating-islands', 'edo-map', 'night-fair'];

const THEMES = [
    { id: 'arcade',           icon: '🕹️', name: 'Arcade',   description: 'Neon Retro' },
    { id: 'floating-islands', icon: '🏝️', name: 'Islands',  description: 'Grand Line' },
    { id: 'edo-map',          icon: '⛩️', name: 'Edo',      description: 'Ink Scroll' },
    { id: 'night-fair',       icon: '🎡', name: 'Carnival', description: 'Night Fair' },
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
            <div className="header-title-container">
                <span className="header-icon islands-icon" aria-hidden="true">
                    <Anchor size={44} />
                </span>
                <h1 className="islands-title-main">Grand Line</h1>
            </div>
        </div>
        <div className="header-subtitle islands-subtitle">
            <Ship size={16} />
            <span>Set Sail to Adventure</span>
            <Ship size={16} />
        </div>
    </header>
);

// --- Edo Map Header Component ---
const EdoHeader = ({ isScrolled, togglePanel, isPanelOpen }) => (
    <header className={`main-header edo-header ${isScrolled ? 'scrolled' : ''}`}>
        <button
            onClick={togglePanel}
            className="panel-toggle-btn edo-btn"
            aria-label={isPanelOpen ? 'Close settings panel' : 'Open settings panel'}
            aria-expanded={isPanelOpen}
        >
            {isPanelOpen ? <X size={26} /> : <Settings size={26} />}
        </button>
        <div className="edo-header-content">
            <div className="edo-gate-marks" aria-hidden="true">
                {[0, 1, 2].map(i => (
                    <div key={i} className="torii-mark">
                        <div className="torii-cap"></div>
                        <div className="torii-lintel"></div>
                        <div className="torii-posts">
                            <div className="torii-post"></div>
                            <div className="torii-post"></div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="header-title-container">
                <span className="header-icon edo-header-icon" aria-hidden="true">
                    <Scroll size={44} />
                </span>
                <h1 className="edo-title-main">江戸の地図</h1>
            </div>
            <div className="edo-gate-marks" aria-hidden="true">
                {[0, 1, 2].map(i => (
                    <div key={i} className="torii-mark">
                        <div className="torii-cap"></div>
                        <div className="torii-lintel"></div>
                        <div className="torii-posts">
                            <div className="torii-post"></div>
                            <div className="torii-post"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div className="header-subtitle edo-subtitle">
            <span className="cherry-blossom" aria-hidden="true">🌸</span>
            <span>Edo Map — Choose Your Destination</span>
            <span className="cherry-blossom" aria-hidden="true">🌸</span>
        </div>
    </header>
);

// --- Carnival Header Component ---
const CarnivalHeader = ({ isScrolled, togglePanel, isPanelOpen }) => (
    <header className={`main-header carnival-header ${isScrolled ? 'scrolled' : ''}`}>
        <button
            onClick={togglePanel}
            className="panel-toggle-btn carnival-btn"
            aria-label={isPanelOpen ? 'Close settings panel' : 'Open settings panel'}
            aria-expanded={isPanelOpen}
        >
            {isPanelOpen ? <X size={26} /> : <Settings size={26} />}
        </button>
        <div className="carnival-header-content">
            <div className="bulb-string" aria-hidden="true">
                {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className="bulb"></div>
                ))}
            </div>
            <div className="header-title-container">
                <span className="header-icon carnival-header-icon" aria-hidden="true">
                    <Ticket size={44} />
                </span>
                <h1 className="carnival-title-main">Night Fair</h1>
            </div>
            <div className="bulb-string" aria-hidden="true">
                {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className="bulb"></div>
                ))}
            </div>
        </div>
        <div className="header-subtitle carnival-subtitle">
            <span aria-hidden="true">🎡</span>
            <span>Step Right Up — Games Await!</span>
            <span aria-hidden="true">🎪</span>
        </div>
    </header>
);

// --- Sea Card Component (Floating Islands theme — clean design) ---
const SeaCard = ({ game, onClick }) => {
    const { isExpanded, cardRef, handlers } = useExpandableCard(onClick);

    return (
        <div
            ref={cardRef}
            className="sea-card"
            data-accent={game.islandTheme}
            data-expanded={isExpanded}
            {...handlers}
            role="button"
            tabIndex={0}
            aria-label={`Play ${game.title} on ${game.islandName}`}
            aria-expanded={isExpanded}
        >
            <div className="sea-card-accent" />
            <div className="sea-card-body">
                <div className="sea-card-icon">{game.icon}</div>
                <div className="sea-card-info">
                    <span className="sea-card-tag">
                        {game.islandEmoji} {game.islandName}
                    </span>
                    <h3 className="sea-card-title">{game.title}</h3>
                    <div className="card-expandable" data-expanded={isExpanded}>
                        <div className="card-expandable-inner">
                            <p className="sea-card-desc">{game.description}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="sea-card-wave" />
        </div>
    );
};

// --- Ocean Waves (Fixed bottom decoration) ---
const OceanWaves = () => (
    <div className="islands-ocean" aria-hidden="true">
        <div className="ocean-wave-line" />
    </div>
);

// --- Koi Fish Component (Edo Map Navigation) ---
const KoiFish = ({ targetPagoda, pagodaPositions }) => {
    const [koiY, setKoiY] = useState(80);
    const prevYRef = useRef(80);

    useEffect(() => {
        if (targetPagoda !== null && pagodaPositions[targetPagoda] !== undefined) {
            const targetY = pagodaPositions[targetPagoda];
            prevYRef.current = targetY;
            setKoiY(targetY);
        }
    }, [targetPagoda, pagodaPositions]);

    return (
        <div
            className="koi-fish"
            style={{ '--koi-y': `${koiY}px` }}
            aria-hidden="true"
        >
            <div className="koi-body">
                <div className="koi-torso">
                    <div className="koi-fin"></div>
                    <div className="koi-eye"></div>
                </div>
                <div className="koi-tail"></div>
            </div>
        </div>
    );
};

// --- Ferris Wheel Component (Night Fair Decoration) ---
const FerrisWheel = () => (
    <div className="ferris-wheel-container" aria-hidden="true">
        <div className="ferris-frame">
            <div className="ferris-rim">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                    <div
                        key={angle}
                        className="ferris-spoke"
                        style={{ '--spoke-angle': `${angle}deg` }}
                    ></div>
                ))}
                {[0, 90, 180, 270].map((angle) => (
                    <div
                        key={angle}
                        className="ferris-gondola"
                        style={{ transform: `rotate(${angle}deg) translateY(-132px) rotate(-${angle}deg)` }}
                    ></div>
                ))}
            </div>
            <div className="ferris-axle"></div>
        </div>
        <div className="ferris-legs">
            <div className="ferris-leg"></div>
            <div className="ferris-leg"></div>
        </div>
    </div>
);

// --- Crowd Silhouettes (Night Fair Background) ---
const CarnivalCrowd = () => (
    <div className="carnival-crowd" aria-hidden="true"></div>
);

// --- Sakura Petal Layer (Edo Map Background) ---
const SakuraLayer = () => {
    const petals = Array.from({ length: 14 }, (_, i) => ({
        x: `${(i * 7.3 + 3) % 100}%`,
        delay: `${(i * 0.61) % 9}s`,
        dur: `${6 + (i * 0.7) % 5}s`,
        sway: `${2.5 + (i * 0.4) % 3}s`,
    }));

    return (
        <div className="sakura-layer" aria-hidden="true">
            {petals.map((p, i) => (
                <div
                    key={i}
                    className="sakura-petal"
                    style={{
                        '--petal-x': p.x,
                        '--petal-delay': p.delay,
                        '--petal-dur': p.dur,
                        '--petal-sway': p.sway,
                    }}
                ></div>
            ))}
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

    const panelClass = {
        'arcade':           'arcade-panel',
        'floating-islands': 'islands-panel',
        'edo-map':          'edo-panel',
        'night-fair':       'carnival-panel',
    }[theme] || 'arcade-panel';

    const titleClass = {
        'arcade':           'arcade-panel-title',
        'floating-islands': 'islands-panel-title',
        'edo-map':          'edo-panel-title',
        'night-fair':       'carnival-panel-title',
    }[theme] || 'arcade-panel-title';

    const toggleClass = {
        'arcade':           'arcade-toggle',
        'floating-islands': 'islands-toggle',
        'edo-map':          'edo-toggle',
        'night-fair':       'carnival-toggle',
    }[theme] || 'arcade-toggle';

    const panelTitleContent = {
        'arcade': (
            <>
                <Zap size={20} className="title-icon" />
                OPTIONS
                <Zap size={20} className="title-icon" />
            </>
        ),
        'floating-islands': (
            <>
                <Anchor size={20} className="title-icon" />
                Captain&apos;s Log
                <Anchor size={20} className="title-icon" />
            </>
        ),
        'edo-map': (
            <>
                <Scroll size={20} className="title-icon" />
                巻物
                <Scroll size={20} className="title-icon" />
            </>
        ),
        'night-fair': (
            <>
                <Ticket size={20} className="title-icon" />
                TICKETS
                <Ticket size={20} className="title-icon" />
            </>
        ),
    }[theme];

    const soundLabel = theme === 'arcade' ? 'SOUND' : 'Sound';
    const difficultyLabel = theme === 'arcade' ? 'DIFFICULTY' : 'Difficulty';
    const comingSoonLabel = theme === 'arcade' ? 'COMING SOON' : 'Coming soon';

    return (
        <>
            <div
                className="panel-overlay"
                onClick={togglePanel}
                aria-hidden={!isOpen}
            />
            <aside
                className={`side-panel ${isOpen ? 'open' : ''} ${panelClass}`}
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
                    <h2 className={`panel-title ${titleClass}`}>
                        {panelTitleContent}
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
                        <h3>{soundLabel}</h3>
                        <button
                            className={`toggle-btn ${toggleClass} ${soundEnabled ? 'active' : ''}`}
                            onClick={() => setSoundEnabled(!soundEnabled)}
                        >
                            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                            <span>{soundEnabled ? 'ON' : 'OFF'}</span>
                        </button>
                    </div>

                    <div className="settings-section settings-disabled">
                        <h3>{difficultyLabel}</h3>
                        <p className="settings-placeholder">{comingSoonLabel}</p>
                    </div>

                    {theme === 'arcade' && (
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

// --- Game Data ---
const GAMES = [
    {
        title: 'Mouse Stalker',
        description:
            'Watch a quirky creature follow your every move! Features smooth animations, playful expressions, and interactive behaviors.',
        status: 'Ready',
        icon: <MousePointer size={40} />,
        path: '/vqm-mini-games/mouse-stalker',
        featured: true,
        // Islands theme
        islandName: 'Cheese Cove',
        islandTheme: 'cheese',
        islandEmoji: '🧀',
        // Edo Map theme
        edoName: '鼠の城',
        edoTheme: 'woodland',
        edoEmoji: '🐭',
        // Night Fair theme
        boothName: 'Mouse Run',
        boothTheme: 'chase',
        boothEmoji: '🎯',
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
        islandTheme: 'garden',
        islandEmoji: '🌸',
        edoName: '花の庭',
        edoTheme: 'sakura',
        edoEmoji: '🌸',
        boothName: 'Garden Toss',
        boothTheme: 'garden',
        boothEmoji: '🌻',
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
        islandTheme: 'crystal',
        islandEmoji: '💎',
        edoName: '水晶の峰',
        edoTheme: 'crystal',
        edoEmoji: '🔮',
        boothName: 'Crystal Ball',
        boothTheme: 'mystic',
        boothEmoji: '🎱',
    },
    {
        title: 'Mycelium Network',
        description:
            'Plant nodes and watch a living network grow. Tendrils seek, connect, and pulse with bioluminescent energy.',
        status: 'Ready',
        icon: <Share2 size={40} />,
        path: '/vqm-mini-games/mycelium-network',
        featured: false,
        islandName: 'Spore Reef',
        islandTheme: 'mycelium',
        islandEmoji: '🍄',
        edoName: '菌糸の森',
        edoTheme: 'fungi',
        edoEmoji: '🌿',
        boothName: 'Glow Web',
        boothTheme: 'glow',
        boothEmoji: '🕸️',
    },
    {
        title: 'Firework Festival',
        description:
            'Match colors and shapes to light up the night sky! 10 unique levels of firework mastery with dual cannons and crowd cheering.',
        status: 'Ready',
        icon: <Sparkles size={40} />,
        path: '/vqm-mini-games/firework-festival',
        featured: false,
        // Islands theme
        islandName: 'Ember Isle',
        islandTheme: 'firework',
        islandEmoji: '🎆',
        // Edo Map theme
        edoName: '花火の祭',
        edoTheme: 'hanabi',
        edoEmoji: '🎇',
        // Night Fair theme
        boothName: 'Sky Blaster',
        boothTheme: 'firework',
        boothEmoji: '🎆',
    },
    {
        title: 'Flock Commander',
        description:
            'Place beacons to guide your flock through obstacles, predators, and portals. 10 levels of evolving strategy!',
        status: 'Ready',
        icon: <Navigation size={40} />,
        path: '/vqm-mini-games/flock-commander',
        featured: false,
        islandName: 'Gale Roost',
        islandTheme: 'flock',
        islandEmoji: '🐦',
        edoName: '鳥の道',
        edoTheme: 'birds',
        edoEmoji: '🦅',
        boothName: 'Bird Guide',
        boothTheme: 'flock',
        boothEmoji: '🐦',
    },
    {
        title: 'Living Canvas',
        description:
            'Guide flowing ink across paper or grow living moss on stone. Two art forms, one meditative experience.',
        status: 'Ready',
        icon: <Droplets size={40} />,
        path: '/vqm-mini-games/living-canvas',
        featured: false,
        islandName: 'Ink Atoll',
        islandTheme: 'ink',
        islandEmoji: '🖌️',
        edoName: '墨の道',
        edoTheme: 'sumi',
        edoEmoji: '🖋️',
        boothName: 'Living Art',
        boothTheme: 'art',
        boothEmoji: '🌿',
    },
];


// --- Pagoda Card Component (Edo Map theme) ---
const PagodaCard = ({ game, index, onHover, onLeave, onClick }) => {
    const { edoName, edoEmoji } = game;
    const { isExpanded, cardRef, handlers } = useExpandableCard(onClick);

    // Compose mouse enter: expand + koi fish positioning
    const handleMouseEnter = (e) => {
        handlers.onMouseEnter(e);
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            const laneEl = cardRef.current.closest('.pagodas-lane');
            const laneRect = laneEl ? laneEl.getBoundingClientRect() : null;
            if (laneRect) {
                const yPosition = rect.top - laneRect.top + rect.height / 2;
                onHover(index, yPosition);
            }
        }
    };

    const handleMouseLeave = (e) => {
        handlers.onMouseLeave(e);
        // Note: koi stays at last position (onLeave keeps it there)
    };

    return (
        <div
            ref={cardRef}
            className="pagoda-card"
            data-expanded={isExpanded}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handlers.onClick}
            onKeyDown={handlers.onKeyDown}
            onFocus={handlers.onFocus}
            onBlur={handlers.onBlur}
            onTouchStart={handlers.onTouchStart}
            role="button"
            tabIndex={0}
            aria-label={`Play ${game.title} — ${edoName}`}
            aria-expanded={isExpanded}
            style={{ animationDelay: `${index * 0.12}s` }}
        >
            {/* Left scroll roller */}
            <div className="scroll-roller"></div>

            {/* Main scroll body */}
            <div className="pagoda-scroll">
                <div className="pagoda-name-banner">
                    <span aria-hidden="true">{edoEmoji}</span>
                    {edoName}
                </div>

                <div className="scroll-inner-content">
                    {/* CSS-only pagoda tower */}
                    <div className="pagoda-tower" aria-hidden="true">
                        <div className="pagoda-tier">
                            <div className="pagoda-roof"></div>
                            <div className="pagoda-floor"></div>
                        </div>
                        <div className="pagoda-tier">
                            <div className="pagoda-roof"></div>
                            <div className="pagoda-floor"></div>
                        </div>
                        <div className="pagoda-tier">
                            <div className="pagoda-roof"></div>
                            <div className="pagoda-floor"></div>
                        </div>
                        <div className="pagoda-base"></div>
                    </div>

                    <div className="pagoda-icon">{game.icon}</div>

                    <div className="pagoda-text">
                        <h3 className="pagoda-title">{game.title}</h3>
                        <div className="card-expandable" data-expanded={isExpanded}>
                            <div className="card-expandable-inner">
                                <p className="pagoda-description">{game.description}</p>
                                <div className="pagoda-play-hint">⛩ Click to enter →</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right scroll roller */}
            <div className="scroll-roller"></div>
        </div>
    );
};

// --- Booth Card Component (Night Fair theme) ---
const BoothCard = ({ game, index, onClick }) => {
    const { isExpanded, cardRef, handlers } = useExpandableCard(onClick);

    return (
        <div
            ref={cardRef}
            className="booth-card"
            data-expanded={isExpanded}
            {...handlers}
            role="button"
            tabIndex={0}
            aria-label={`Play ${game.title} — ${game.boothName}`}
            aria-expanded={isExpanded}
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            {/* Curved tent awning */}
            <div className="booth-awning">
                <div className="awning-lights" aria-hidden="true">
                    <span className="awning-light"></span>
                    <span className="awning-light"></span>
                    <span className="awning-light"></span>
                    <span className="awning-light"></span>
                    <span className="awning-light"></span>
                </div>
            </div>

            {/* Main booth body */}
            <div className="booth-body">
                <div className="booth-window-trim">
                    <div className="booth-bulb"></div>
                    <div className="booth-bulb"></div>
                    <div className="booth-bulb"></div>
                </div>

                <div className="booth-content">
                    <div className="booth-name-tag">
                        <span aria-hidden="true">{game.boothEmoji}</span>
                        {game.boothName}
                    </div>

                    <div className="booth-icon">{game.icon}</div>

                    <h3 className="booth-title">{game.title}</h3>
                    <div className="card-expandable" data-expanded={isExpanded}>
                        <div className="card-expandable-inner">
                            <p className="booth-description">{game.description}</p>
                            <div className="booth-play-hint">🎟 PLAY NOW</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Side poles */}
            <div className="booth-poles" aria-hidden="true">
                <div className="booth-pole left"></div>
                <div className="booth-pole right"></div>
            </div>
        </div>
    );
};

// --- HomePage Component ---
const HomePage = () => {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('vqm-game-theme');
        return VALID_THEMES.includes(savedTheme) ? savedTheme : 'arcade';
    });

    const [isThemeTransitioning, setIsThemeTransitioning] = useState(false);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [hasSeenPanel, setHasSeenPanel] = useState(() => {
        return localStorage.getItem('vqm-seen-panel') === 'true';
    });
    const [isScrolled, setIsScrolled] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isGamesExpanded, setIsGamesExpanded] = useState(false);

    // Edo Map theme state
    const [hoveredPagoda, setHoveredPagoda] = useState(null);
    const [pagodaPositions, setPagodaPositions] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY;
            setIsScrolled(y > 50);
            setShowScrollTop(y > 400);
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
        if (newTheme === theme || isThemeTransitioning) return;
        setIsThemeTransitioning(true);
        // Phase 1: fade out (300ms)
        setTimeout(() => {
            // Phase 2: swap theme at opacity 0
            setTheme(newTheme);
            localStorage.setItem('vqm-game-theme', newTheme);
            // Phase 3: fade in after a frame (let new theme render)
            requestAnimationFrame(() => {
                setIsThemeTransitioning(false);
            });
        }, 300);
    }, [theme, isThemeTransitioning]);

    const togglePanel = useCallback(() => {
        setIsPanelOpen((prev) => {
            if (!prev && !hasSeenPanel) {
                setHasSeenPanel(true);
                localStorage.setItem('vqm-seen-panel', 'true');
            }
            return !prev;
        });
    }, [hasSeenPanel]);

    // Escape key closes settings panel
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isPanelOpen) {
                togglePanel();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPanelOpen, togglePanel]);

    const handlePlay = (path) => {
        if (document.startViewTransition) {
            document.startViewTransition(() => {
                navigate(path);
            });
        } else {
            document.body.classList.add('page-exit');
            setTimeout(() => {
                document.body.classList.remove('page-exit');
                navigate(path);
            }, 300);
        }
    };

    const handlePagodaHover = useCallback((index, yPos) => {
        setPagodaPositions(prev => ({ ...prev, [index]: yPos }));
        setHoveredPagoda(index);
    }, []);

    const handlePagodaLeave = useCallback(() => {
        // Intentional: keep koi at last pagoda
    }, []);

    const displayedGames = GAMES;

    const isArcade   = theme === 'arcade';
    const isIslands  = theme === 'floating-islands';
    const isEdo      = theme === 'edo-map';
    const isCarnival = theme === 'night-fair';

    const mainContentClass = {
        'arcade':           'arcade-content',
        'floating-islands': 'islands-content',
        'edo-map':          'edo-content',
        'night-fair':       'carnival-content',
    }[theme] || 'arcade-content';

    const containerClass = {
        'arcade':           'arcade-container',
        'floating-islands': 'islands-container',
        'edo-map':          'edo-container',
        'night-fair':       'carnival-container',
    }[theme] || 'arcade-container';

    const footerClass = {
        'arcade':           'arcade-footer',
        'floating-islands': 'islands-footer',
        'edo-map':          'edo-footer',
        'night-fair':       'carnival-footer',
    }[theme] || 'arcade-footer';

    const footerAboutLabel = isArcade ? 'ABOUT' : isEdo ? '概要' : isCarnival ? 'ABOUT' : 'About';
    const footerGamesLabel = isArcade ? 'GAMES' : isIslands ? 'Islands' : isEdo ? '目的地' : 'GAMES';
    const footerTechLabel  = isArcade ? 'TECH STACK' : isEdo ? '技術' : isCarnival ? 'TECH STACK' : 'Tech Stack';
    const footerConnectLabel = isArcade ? 'CONNECT' : isEdo ? '連絡' : isCarnival ? 'CONNECT' : 'Connect';
    const footerCopyright = isArcade
        ? '© 2025 VQM ARCADE • ALL RIGHTS RESERVED'
        : isIslands
            ? '© 2025 VQM Playground • Made for fun'
            : isEdo
                ? '© 2025 VQM 江戸地図 • 全権利保有'
                : '© 2025 VQM Night Fair • Step Right Up';

    return (
        <div className={`app-layout ${isPanelOpen ? 'panel-open' : ''}`} data-theme={theme}>
            <a href="#games" className="skip-link">Skip to games</a>
            <SidePanel
                theme={theme}
                onThemeChange={handleThemeChange}
                isOpen={isPanelOpen}
                togglePanel={togglePanel}
            />

            <main className={`main-content ${mainContentClass}${isThemeTransitioning ? ' theme-transitioning' : ''}`}>
                {/* Sakura petals overlay for Edo theme */}
                {isEdo && <SakuraLayer />}

                {/* Ferris wheel + crowd decorations for Carnival theme */}
                {isCarnival && <FerrisWheel />}
                {isCarnival && <CarnivalCrowd />}

                {/* Theme-specific header */}
                {isArcade && (
                    <ArcadeHeader
                        isScrolled={isScrolled}
                        togglePanel={togglePanel}
                        isPanelOpen={isPanelOpen}
                    />
                )}
                {isIslands && (
                    <IslandsHeader
                        isScrolled={isScrolled}
                        togglePanel={togglePanel}
                        isPanelOpen={isPanelOpen}
                    />
                )}
                {isEdo && (
                    <EdoHeader
                        isScrolled={isScrolled}
                        togglePanel={togglePanel}
                        isPanelOpen={isPanelOpen}
                    />
                )}
                {isCarnival && (
                    <CarnivalHeader
                        isScrolled={isScrolled}
                        togglePanel={togglePanel}
                        isPanelOpen={isPanelOpen}
                    />
                )}

                <div id="games" className={`homepage-container ${containerClass}`}>
                    {/* Arcade: game card grid */}
                    {isArcade && (
                        <section className="game-grid arcade-grid" aria-label="Available games">
                            {displayedGames.map((game, idx) => (
                                <GameCard
                                    key={game.title}
                                    {...game}
                                    theme={theme}
                                    onPlay={() => handlePlay(game.path)}
                                    delay={idx * 0.1}
                                />
                            ))}
                        </section>
                    )}

                    {/* Floating Islands: clean sea cards */}
                    {isIslands && (
                        <>
                            <section className="islands-sea" aria-label="Islands — choose a game">
                                {displayedGames.map((game) => (
                                    <SeaCard
                                        key={game.title}
                                        game={game}
                                        onClick={() => handlePlay(game.path)}
                                    />
                                ))}
                            </section>
                            <OceanWaves />
                        </>
                    )}

                    {/* Edo Map: koi lane + pagoda scroll cards */}
                    {isEdo && (
                        <div className="edo-world">
                            <div className="koi-lane">
                                <div className="koi-route">
                                    <div className="koi-ripple"></div>
                                    <div className="koi-ripple"></div>
                                    <div className="koi-ripple"></div>
                                </div>
                                <KoiFish
                                    targetPagoda={hoveredPagoda}
                                    pagodaPositions={pagodaPositions}
                                />
                            </div>
                            <section
                                className="pagodas-lane"
                                aria-label="Destinations — choose a game"
                            >
                                {displayedGames.map((game, idx) => (
                                    <PagodaCard
                                        key={game.title}
                                        game={game}
                                        index={idx}
                                        onHover={handlePagodaHover}
                                        onLeave={handlePagodaLeave}
                                        onClick={() => handlePlay(game.path)}
                                    />
                                ))}
                            </section>
                        </div>
                    )}

                    {/* Night Fair: winding carnival midway */}
                    {isCarnival && (
                        <section className="carnival-midway" aria-label="Carnival booths">
                            {displayedGames.map((game, idx) => (
                                <BoothCard
                                    key={game.title}
                                    game={game}
                                    index={idx}
                                    onClick={() => handlePlay(game.path)}
                                />
                            ))}
                        </section>
                    )}

                    <footer className={`homepage-footer ${footerClass}`}>
                        <div className="footer-content">
                            <div className="footer-section footer-about">
                                <h3>{footerAboutLabel}</h3>
                                <p>A collection of fun mini-games built with React. Created with love for learning and creativity.</p>
                            </div>
                            <div className="footer-section footer-games">
                                <button
                                    className="footer-games-toggle"
                                    onClick={() => setIsGamesExpanded(!isGamesExpanded)}
                                    aria-expanded={isGamesExpanded}
                                >
                                    <h3>{footerGamesLabel}</h3>
                                    <ChevronDown size={16} className={`footer-chevron ${isGamesExpanded ? 'expanded' : ''}`} />
                                </button>
                                <div className={`footer-games-list ${isGamesExpanded ? 'expanded' : ''}`}>
                                    {displayedGames.map((game) => (
                                        <a
                                            key={game.title}
                                            href={game.path}
                                            onClick={(e) => { e.preventDefault(); handlePlay(game.path); }}
                                        >
                                            {game.title}
                                        </a>
                                    ))}
                                </div>
                            </div>
                            <div className="footer-section footer-tech">
                                <h3>{footerTechLabel}</h3>
                                <p>React + Vite</p>
                                <p>CSS Animations</p>
                                <p>Canvas API</p>
                            </div>
                            <div className="footer-section footer-connect">
                                <h3>{footerConnectLabel}</h3>
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
                            <p>{footerCopyright}</p>
                        </div>
                    </footer>
                </div>

                {/* Scroll to top button */}
                <button
                    className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    aria-label="Scroll to top"
                >
                    <ChevronUp size={24} />
                </button>
            </main>
        </div>
    );
};

export default HomePage;
