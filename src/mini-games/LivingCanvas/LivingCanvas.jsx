// LivingCanvas.jsx — UI wrapper for the Living Canvas game.
// Seven art mode skins: Ink Flow, Moss World, Stained Glass, Fractal Growth,
// Topographic, Op Art, Pointillism.
// Art brushes + symmetry system for mathematical pattern creation.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle, X, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLivingCanvasGame } from './useLivingCanvasGame';
import { MOSS, SUPPLY, STAT_LABELS, ALL_SKINS } from './gameConfig';
import { BRUSH_TYPES, SYMMETRY_MODES } from './simulation/artBrushes';
import './LivingCanvas.css';

// --- Skin theme classification ---
function getSkinTheme(skinId) {
    if (['moss', 'stainedGlass', 'fractalGrowth'].includes(skinId)) return 'dark';
    return 'light';
}

function getSkinDisplayInfo(skinId) {
    const info = {
        ink: { title: 'Ink Flow', subtitle: 'Click to drop ink — drag to guide the flow' },
        moss: { title: 'Moss World', subtitle: 'Tap to plant — watch it grow' },
        stainedGlass: { title: 'Stained Glass', subtitle: 'Place light seeds — watch panels form' },
        fractalGrowth: { title: 'Fractal Growth', subtitle: 'Seed crystals — watch them branch' },
        topographic: { title: 'Topographic', subtitle: 'Build terrain — contours emerge' },
        opArt: { title: 'Op Art', subtitle: 'Draw patterns — see them warp' },
        pointillism: { title: 'Pointillism', subtitle: 'Paint with dots — colors blend' },
    };
    return info[skinId] || info.ink;
}

// --- How To Play Panel ---
const HowToPlay = ({ isOpen, onClose, skin }) => {
    if (!isOpen) return null;
    const theme = getSkinTheme(skin);
    const displayInfo = getSkinDisplayInfo(skin);

    return (
        <div className="lc-htp-overlay" onClick={onClose}>
            <div className={`lc-htp-panel lc-htp-${theme}`} onClick={e => e.stopPropagation()}>
                <div className="lc-htp-header">
                    <h2>{displayInfo.title}</h2>
                    <button className="lc-htp-close" onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <div className="lc-htp-body">
                    <section className="lc-htp-section">
                        <h3>Controls</h3>
                        <ul className="lc-htp-list">
                            <li>
                                <span className="lc-htp-key">Click / Tap</span>
                                <span className="lc-htp-desc">Place brush on canvas</span>
                            </li>
                            <li>
                                <span className="lc-htp-key">Hold</span>
                                <span className="lc-htp-desc">Increase pressure (larger, denser)</span>
                            </li>
                            <li>
                                <span className="lc-htp-key">Drag</span>
                                <span className="lc-htp-desc">Guide flow direction</span>
                            </li>
                            <li>
                                <span className="lc-htp-key">Double-click</span>
                                <span className="lc-htp-desc">{skin === 'moss' ? 'Sunburst — boost nearby growth' : 'Blot — absorb excess'}</span>
                            </li>
                        </ul>
                    </section>

                    <section className="lc-htp-section">
                        <h3>Art Brushes</h3>
                        <p>Select mathematical brushes to create unique patterns — spirographs, fractals, Penrose tiles, Chladni waves, and more. Brushes auto-combine through the cellular automata simulation.</p>
                    </section>

                    <section className="lc-htp-section">
                        <h3>Symmetry</h3>
                        <p>Enable symmetry to create mandalas, kaleidoscopes, and mirrored compositions. Your brush strokes are automatically reflected across the chosen axis.</p>
                    </section>

                    <div className="lc-htp-tip">
                        Try: Select a Spirograph brush + Radial 6 symmetry, then click the center of the canvas for instant mandala art!
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Skin Carousel ---
const SkinCarousel = ({ currentSkin, onSwitch }) => {
    const currentIndex = ALL_SKINS.findIndex(s => s.id === currentSkin);
    const theme = getSkinTheme(currentSkin);

    const prev = () => {
        const newIndex = (currentIndex - 1 + ALL_SKINS.length) % ALL_SKINS.length;
        onSwitch(ALL_SKINS[newIndex].id);
    };

    const next = () => {
        const newIndex = (currentIndex + 1) % ALL_SKINS.length;
        onSwitch(ALL_SKINS[newIndex].id);
    };

    const skinConfig = ALL_SKINS[currentIndex]?.config;

    return (
        <div className={`lc-skin-carousel lc-skin-carousel--${theme}`}>
            <button className="lc-carousel-btn" onClick={prev} aria-label="Previous art mode">
                <ChevronLeft size={14} />
            </button>
            <div className="lc-carousel-label">
                <span className="lc-carousel-icon">{skinConfig?.icon || ''}</span>
                <span className="lc-carousel-name">{skinConfig?.name || 'Ink Flow'}</span>
            </div>
            <button className="lc-carousel-btn" onClick={next} aria-label="Next art mode">
                <ChevronRight size={14} />
            </button>
        </div>
    );
};

// --- Brush Selector ---
const BrushSelector = ({ activeBrush, onSelect, skin }) => {
    const [expanded, setExpanded] = useState(false);
    const activeBrushData = BRUSH_TYPES.find(b => b.id === activeBrush);
    const theme = getSkinTheme(skin);

    return (
        <div className={`lc-brush-selector lc-brush-selector--${theme}`}>
            <button
                className="lc-brush-toggle"
                onClick={() => setExpanded(!expanded)}
                title="Select brush"
            >
                <span className="lc-brush-icon">{activeBrushData?.icon || '●'}</span>
                <span className="lc-brush-name">{activeBrushData?.name || 'Circle'}</span>
                <span className={`lc-brush-arrow ${expanded ? 'open' : ''}`}>▾</span>
            </button>
            {expanded && (
                <div className="lc-brush-dropdown">
                    {BRUSH_TYPES.map((brush) => (
                        <button
                            key={brush.id}
                            className={`lc-brush-option ${activeBrush === brush.id ? 'active' : ''}`}
                            onClick={() => { onSelect(brush.id); setExpanded(false); }}
                            title={brush.description}
                        >
                            <span className="lc-brush-option-icon">{brush.icon}</span>
                            <span className="lc-brush-option-name">{brush.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Symmetry Selector ---
const SymmetrySelector = ({ symmetryMode, onSelect, skin }) => {
    const [expanded, setExpanded] = useState(false);
    const activeMode = SYMMETRY_MODES.find(m => m.id === symmetryMode);
    const theme = getSkinTheme(skin);

    return (
        <div className={`lc-symmetry-selector lc-symmetry-selector--${theme}`}>
            <button
                className="lc-symmetry-toggle"
                onClick={() => setExpanded(!expanded)}
                title="Select symmetry"
            >
                <span className="lc-symmetry-icon">{activeMode?.icon || '○'}</span>
                <span className="lc-symmetry-name">{activeMode?.name || 'None'}</span>
                <span className={`lc-symmetry-arrow ${expanded ? 'open' : ''}`}>▾</span>
            </button>
            {expanded && (
                <div className="lc-symmetry-dropdown">
                    {SYMMETRY_MODES.map((mode) => (
                        <button
                            key={mode.id}
                            className={`lc-symmetry-option ${symmetryMode === mode.id ? 'active' : ''}`}
                            onClick={() => { onSelect(mode.id); setExpanded(false); }}
                        >
                            <span className="lc-symmetry-option-icon">{mode.icon}</span>
                            <span className="lc-symmetry-option-name">{mode.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Species Selector (Moss skin) ---
const SpeciesSelector = ({ species, activeSpecies, onSelect }) => {
    return (
        <div className="lc-species-selector">
            {species.map((sp) => (
                <button
                    key={sp.id}
                    className={`lc-species-btn ${activeSpecies === sp.id ? 'active' : ''}`}
                    onClick={() => onSelect(sp.id)}
                    title={sp.name}
                    style={{
                        '--sp-color': `rgb(${sp.colorRange[1].join(',')})`,
                        '--sp-dark': `rgb(${sp.colorRange[0].join(',')})`,
                    }}
                >
                    <span className="lc-species-dot"></span>
                    <span className="lc-species-name">{sp.name}</span>
                </button>
            ))}
        </div>
    );
};

// --- Color Mode Selector (all skins with colorModes) ---
const ColorModeSelector = ({ colorModes, activeMode, onSelect, theme }) => {
    return (
        <div className={`lc-ink-colors lc-ink-colors--${theme}`}>
            {colorModes.map((mode, i) => (
                <button
                    key={mode.id}
                    className={`lc-ink-color-btn ${activeMode === i ? 'active' : ''}`}
                    onClick={() => onSelect(i)}
                    title={mode.label}
                    style={{ '--ink-color': `rgb(${mode.rgb.join(',')})` }}
                >
                    <span className="lc-ink-swatch"></span>
                </button>
            ))}
        </div>
    );
};

// --- Supply Meter ---
const SupplyMeter = ({ value, max, skin }) => {
    const pct = (value / max) * 100;
    const labels = STAT_LABELS[skin] || STAT_LABELS.ink;
    const theme = getSkinTheme(skin);

    return (
        <div className={`lc-supply-meter lc-supply-meter--${theme}`}>
            <span className="lc-supply-label">{labels.supply}</span>
            <div className="lc-supply-bar">
                <div
                    className="lc-supply-fill"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="lc-supply-value">{Math.round(value)}</span>
        </div>
    );
};

// --- Main Component ---
const LivingCanvas = () => {
    const {
        canvasRef,
        skin,
        switchSkin,
        activeSpecies,
        setActiveSpecies,
        inkColorMode,
        setInkColorMode,
        activeBrush,
        setActiveBrush,
        symmetryMode,
        setSymmetryMode,
        coverage,
        activeCount,
        supply,
        resetCanvas,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handleDoubleClick,
    } = useLivingCanvasGame();

    const [showTitle, setShowTitle] = useState(true);
    const [showHelp, setShowHelp] = useState(false);
    const [showConfirmReset, setShowConfirmReset] = useState(false);

    const theme = getSkinTheme(skin);
    const displayInfo = getSkinDisplayInfo(skin);
    const skinConfig = ALL_SKINS.find(s => s.id === skin)?.config;
    const labels = STAT_LABELS[skin] || STAT_LABELS.ink;

    useEffect(() => {
        const timer = setTimeout(() => setShowTitle(false), 4000);
        return () => clearTimeout(timer);
    }, []);

    // Re-show title briefly on skin switch
    useEffect(() => {
        setShowTitle(true);
        const timer = setTimeout(() => setShowTitle(false), 3000);
        return () => clearTimeout(timer);
    }, [skin]);

    const handleReset = () => {
        resetCanvas();
        setShowConfirmReset(false);
    };

    // Get background color for container
    const containerBg = skinConfig?.background || '#f5f0e0';

    return (
        <div
            className={`lc-container lc-container--${theme}`}
            style={{ background: containerBg }}
        >
            {/* Canvas */}
            <canvas
                ref={canvasRef}
                className="lc-canvas"
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
                onDoubleClick={handleDoubleClick}
            />

            {/* === TOP BAR === */}
            <div className="lc-top-bar">
                <div className="lc-top-left">
                    <Link to="/vqm-mini-games/" className="lc-back-btn" aria-label="Back to home">
                        <ArrowLeft size={18} />
                    </Link>
                    <button
                        className="lc-help-btn"
                        onClick={() => setShowHelp(true)}
                        aria-label="How to play"
                    >
                        <HelpCircle size={18} />
                    </button>
                </div>

                <div className="lc-top-center">
                    <span className="lc-top-icon">{skinConfig?.icon || ''}</span>
                    <span className="lc-top-title">{displayInfo.title}</span>
                </div>

                <div className="lc-top-right">
                    <button
                        className="lc-reset-btn"
                        onClick={() => setShowConfirmReset(true)}
                        aria-label="Reset canvas"
                        title="Clear & restart"
                    >
                        <RotateCcw size={16} />
                    </button>
                </div>
            </div>

            {/* Skin Carousel */}
            <div className="lc-skin-toggle-wrap">
                <SkinCarousel currentSkin={skin} onSwitch={switchSkin} />
            </div>

            {/* === ART TOOLS BAR (left side) === */}
            <div className="lc-art-tools">
                <BrushSelector
                    activeBrush={activeBrush}
                    onSelect={setActiveBrush}
                    skin={skin}
                />
                <SymmetrySelector
                    symmetryMode={symmetryMode}
                    onSelect={setSymmetryMode}
                    skin={skin}
                />
            </div>

            {/* Title overlay (fades in/out on skin switch) */}
            <div className={`lc-title-overlay ${showTitle ? 'visible' : ''}`}>
                <h1 style={theme === 'dark' ? { color: 'rgba(200, 200, 220, 0.6)' } : undefined}>
                    {displayInfo.title}
                </h1>
                <p style={theme === 'dark' ? { color: 'rgba(180, 180, 200, 0.4)' } : undefined}>
                    {displayInfo.subtitle}
                </p>
            </div>

            {/* Stats panel */}
            <div className="lc-stats-panel">
                <div className="lc-stat-row">
                    <span className="lc-stat-label">{labels.coverage}</span>
                    <span className="lc-stat-value">{coverage}%</span>
                </div>
                <div className="lc-stat-row">
                    <span className="lc-stat-label">{labels.active}</span>
                    <span className="lc-stat-value">{activeCount}</span>
                </div>
            </div>

            {/* Supply meter */}
            <SupplyMeter value={supply} max={SUPPLY.max} skin={skin} />

            {/* Tool palette (colors / species) */}
            <div className="lc-tool-palette">
                {skin === 'moss' ? (
                    <SpeciesSelector
                        species={MOSS.species}
                        activeSpecies={activeSpecies}
                        onSelect={setActiveSpecies}
                    />
                ) : skinConfig?.colorModes ? (
                    <ColorModeSelector
                        colorModes={skinConfig.colorModes}
                        activeMode={inkColorMode}
                        onSelect={setInkColorMode}
                        theme={theme}
                    />
                ) : null}
            </div>

            {/* How to Play */}
            <HowToPlay isOpen={showHelp} onClose={() => setShowHelp(false)} skin={skin} />

            {/* Reset confirmation */}
            {showConfirmReset && (
                <div className="lc-reset-overlay" onClick={() => setShowConfirmReset(false)}>
                    <div className={`lc-reset-dialog lc-reset-dialog--${theme}`} onClick={e => e.stopPropagation()}>
                        <p>Clear the canvas and start fresh?</p>
                        <div className="lc-reset-actions">
                            <button className="lc-reset-cancel" onClick={() => setShowConfirmReset(false)}>
                                Cancel
                            </button>
                            <button className="lc-reset-confirm" onClick={handleReset}>
                                Clear Canvas
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LivingCanvas;
