import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import Scene from './Scene';
import GlassSphere from './skins/GlassSphere';
import Fireball from './skins/Fireball';
import IceOrb from './skins/IceOrb';
import DragonBall from './skins/DragonBall';
import Palantir from './skins/Palantir';
import EnergyCore from './skins/EnergyCore';
import ArcReactor from './skins/ArcReactor';
import Pokeball from './skins/Pokeball';
import ArcReactorClassic from './skins/ArcReactorClassic';
import GenesisSphere, { PHASE_ORDER } from './skins/GenesisSphere';
import './OrbGallery.css';

const SKIN_CATALOG = [
  { id: 'genesis-sphere', name: 'Genesis Sphere', category: 'Conceptual', icon: '🌍', accent: '#44aa66', description: 'A living world that cycles through creation and destruction', component: GenesisSphere, bloomIntensity: 1.5, bloomThreshold: 0.3 },
  { id: 'sphere', name: 'Glass Sphere', category: 'Normal', icon: '🔮', accent: '#6699cc', description: 'Pure crystal with environment reflections', component: GlassSphere, bloomIntensity: 1, bloomThreshold: 0.4 },
  { id: 'pokeball', name: 'Pokeball', category: 'Normal', icon: '⚪', accent: '#cc3333', description: 'Click the button to capture the light within', component: Pokeball, bloomIntensity: 0.8, bloomThreshold: 0.5 },
  { id: 'fireball', name: 'Fireball', category: 'Magical', icon: '🔥', accent: '#ff6622', description: 'Volatile flame with procedural fire shader', component: Fireball, bloomIntensity: 2.5, bloomThreshold: 0.2 },
  { id: 'ice-orb', name: 'Frozen Heart', category: 'Magical', icon: '❄️', accent: '#66bbee', description: 'Ancient glacial ice with a crystal lattice trapped inside', component: IceOrb, bloomIntensity: 0.6, bloomThreshold: 0.5 },
  { id: 'dragon-ball', name: 'Dragon Ball', category: 'Magical', icon: '⭐', accent: '#ffaa22', description: 'Move your mouse to reveal the stars within', component: DragonBall, bloomIntensity: 1.5, bloomThreshold: 0.3 },
  { id: 'palantir', name: 'Palantir', category: 'Magical', icon: '👁️', accent: '#44cc66', description: 'The seeing stone watches back — beware its gaze', component: Palantir, bloomIntensity: 1.8, bloomThreshold: 0.25 },
  { id: 'energy-core', name: 'Energy Core', category: 'Sci-Fi', icon: '⚡', accent: '#aa66ff', description: 'Unstable plasma contained by magnetic arcs', component: EnergyCore, bloomIntensity: 2, bloomThreshold: 0.2 },
  { id: 'arc-reactor-classic', name: 'Solaris Relic', category: 'Sci-Fi', icon: '☀️', accent: '#ff8844', description: 'Ancient solar energy trapped in a lattice of light', component: ArcReactorClassic, bloomIntensity: 2, bloomThreshold: 0.25 },
  { id: 'arc-reactor', name: 'AI Data Core', category: 'Sci-Fi', icon: '🧠', accent: '#00ccff', description: 'Neural network consciousness pulsing within a containment lattice', component: ArcReactor, bloomIntensity: 2, bloomThreshold: 0.25 },
];

const PHASE_LABELS = {
  seeding: { icon: '🌱', label: 'Seeding' },
  growth: { icon: '🌿', label: 'Growth' },
  destruction: { icon: '🔥', label: 'Destruction' },
  restoration: { icon: '💧', label: 'Restoration' },
};

export default function OrbGallery() {
  const routerNavigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(3); // Start on Fireball
  const [genesisPhase, setGenesisPhase] = useState('seeding');
  const [isZenMode, setIsZenMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hudVisible, setHudVisible] = useState(true);
  const hudTimerRef = useRef(null);
  const galleryRef = useRef(null);

  const activeSkin = SKIN_CATALOG[activeIndex];
  const SkinComponent = activeSkin.component;

  // Auto-hide HUD after inactivity
  useEffect(() => {
    if (isZenMode) return;

    const resetTimer = () => {
      setHudVisible(true);
      if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
      hudTimerRef.current = setTimeout(() => setHudVisible(false), 6000);
    };

    resetTimer();
    const el = galleryRef.current;
    if (el) {
      el.addEventListener('mousemove', resetTimer);
      el.addEventListener('click', resetTimer);
      return () => {
        el.removeEventListener('mousemove', resetTimer);
        el.removeEventListener('click', resetTimer);
        if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
      };
    }
  }, [activeIndex, isZenMode]);

  const navigate = useCallback((dir) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveIndex((prev) => {
      const next = prev + dir;
      if (next < 0) return SKIN_CATALOG.length - 1;
      if (next >= SKIN_CATALOG.length) return 0;
      return next;
    });
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning]);

  const handlePhaseChange = useCallback((phase) => {
    setGenesisPhase(phase);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
      if (e.key === 'f' || e.key === 'F') setIsZenMode((z) => !z);
      if (e.key === 'Escape') setIsZenMode(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [navigate]);

  // CSS variable for skin-aware accent color
  const galleryStyle = useMemo(() => ({
    '--accent': activeSkin.accent,
    '--accent-r': parseInt(activeSkin.accent.slice(1, 3), 16),
    '--accent-g': parseInt(activeSkin.accent.slice(3, 5), 16),
    '--accent-b': parseInt(activeSkin.accent.slice(5, 7), 16),
  }), [activeSkin.accent]);

  // Pagination dots grouped by category
  const categories = useMemo(() => {
    const cats = {};
    SKIN_CATALOG.forEach((s, i) => {
      if (!cats[s.category]) cats[s.category] = [];
      cats[s.category].push({ ...s, index: i });
    });
    return cats;
  }, []);

  return (
    <div
      className={`orb-gallery ${isZenMode ? 'zen' : ''} ${hudVisible ? '' : 'hud-hidden'}`}
      style={galleryStyle}
      ref={galleryRef}
    >
      {/* 3D Canvas */}
      <div className={`orb-canvas-container ${isTransitioning ? 'transitioning' : ''}`}>
        <Scene
          skinId={activeSkin.id}
          bloomIntensity={activeSkin.bloomIntensity}
          bloomThreshold={activeSkin.bloomThreshold}
        >
          <SkinComponent
            {...(activeSkin.id === 'genesis-sphere' ? { onPhaseChange: handlePhaseChange } : {})}
          />
        </Scene>
      </div>

      {/* === TOP BAR === */}
      <header className="orb-topbar">
        <div className="orb-topbar-left">
          <button
            className="orb-icon-btn orb-back-btn"
            onClick={() => {
              if (document.startViewTransition) {
                document.startViewTransition(() => routerNavigate('/vqm-mini-games/'));
              } else {
                routerNavigate('/vqm-mini-games/');
              }
            }}
            title="Back to home"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="orb-brand">ORB GALLERY</span>
        </div>
        <div className="orb-topbar-right">
          <button
            className="orb-icon-btn"
            onClick={() => setIsZenMode((z) => !z)}
            title={isZenMode ? 'Exit focus mode (F)' : 'Focus mode (F)'}
          >
            {isZenMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </header>

      {/* === NAVIGATION ARROWS === */}
      <button className="orb-nav orb-nav-prev" onClick={() => navigate(-1)} title="Previous orb">
        <ChevronLeft size={28} strokeWidth={1.5} />
      </button>
      <button className="orb-nav orb-nav-next" onClick={() => navigate(1)} title="Next orb">
        <ChevronRight size={28} strokeWidth={1.5} />
      </button>

      {/* === BOTTOM HUD === */}
      <div className="orb-bottom-hud">
        {/* Skin info card */}
        <div className={`orb-info-card ${isTransitioning ? 'out' : 'in'}`}>
          <div className="orb-info-header">
            <span className="orb-info-icon">{activeSkin.icon}</span>
            <div className="orb-info-text">
              <h2 className="orb-info-name">{activeSkin.name}</h2>
              <span className="orb-info-category">{activeSkin.category}</span>
            </div>
            <span className="orb-info-index">
              {String(activeIndex + 1).padStart(2, '0')}/{String(SKIN_CATALOG.length).padStart(2, '0')}
            </span>
          </div>
          <p className="orb-info-desc">{activeSkin.description}</p>

          {/* Genesis Sphere phase HUD */}
          {activeSkin.id === 'genesis-sphere' && (
            <div className="orb-genesis-hud">
              <div className="orb-phase-track">
                {PHASE_ORDER.map((p, i) => {
                  const phaseIdx = PHASE_ORDER.indexOf(genesisPhase);
                  const isPast = i < phaseIdx;
                  const isCurrent = i === phaseIdx;
                  return (
                    <React.Fragment key={p}>
                      {i > 0 && (
                        <div className={`orb-phase-connector ${isPast ? 'filled' : ''}`} />
                      )}
                      <div
                        className={`orb-phase-node ${isCurrent ? 'active' : ''} ${isPast ? 'past' : ''}`}
                        title={PHASE_LABELS[p].label}
                      >
                        <span className="orb-phase-icon">{PHASE_LABELS[p].icon}</span>
                        <span className="orb-phase-label">{PHASE_LABELS[p].label}</span>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
              {genesisPhase === 'seeding' && (
                <div className="orb-phase-hint">
                  <span className="orb-hint-pulse" />
                  Click the orb to plant seeds
                </div>
              )}
            </div>
          )}

          {/* Dragon Ball hint */}
          {activeSkin.id === 'dragon-ball' && (
            <div className="orb-phase-hint">
              <span className="orb-hint-pulse" />
              Click the ball to change stars (1–7)
            </div>
          )}

          {/* Ice Orb hint */}
          {activeSkin.id === 'ice-orb' && (
            <div className="orb-phase-hint">
              <span className="orb-hint-pulse" />
              Click the orb to crack the ice
            </div>
          )}

          {/* Pokeball hint */}
          {activeSkin.id === 'pokeball' && (
            <div className="orb-phase-hint">
              <span className="orb-hint-pulse" />
              Click the center button to open
            </div>
          )}
        </div>

        {/* Pagination rail */}
        <div className="orb-pagination">
          {Object.entries(categories).map(([cat, skins]) => (
            <div key={cat} className="orb-page-group" title={cat}>
              {skins.map((s) => (
                <button
                  key={s.id}
                  className={`orb-page-dot ${s.index === activeIndex ? 'active' : ''}`}
                  onClick={() => {
                    if (!isTransitioning && s.index !== activeIndex) {
                      setIsTransitioning(true);
                      setActiveIndex(s.index);
                      setTimeout(() => setIsTransitioning(false), 600);
                    }
                  }}
                  title={s.name}
                  aria-label={s.name}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* === KEYBOARD HINT === */}
      <div className="orb-kb-hint">
        <kbd>&larr;</kbd> <kbd>&rarr;</kbd> navigate &nbsp;&middot;&nbsp; <kbd>F</kbd> focus
      </div>
    </div>
  );
}
