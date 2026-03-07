import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Circle, Square, Triangle, Play, RotateCcw, Home, Flame, Coffee, Zap } from 'lucide-react';
import { useFireworkGame, getShapePoints } from './useFireworkGame';
import { COLORS, SHAPE_ORDER, LEVELS, GAME_PHASES, QUEST_TYPES } from './gameConfig';
import './FireworkFestival.css';

/* ────────────────────────────────────────────
   QuestPreviewCanvas — animated mini firework
   Shows a looping explosion so the player must
   observe and identify the color + shape.
   ──────────────────────────────────────────── */
const QuestPreviewCanvas = ({ color, shape, size = 110, matched = false, memoryMode = false, memoryFadeMs = 3000 }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef(null);
  const [faded, setFaded] = useState(false);

  // Memory mode: fade quest preview after delay
  useEffect(() => {
    if (!memoryMode || matched) { setFaded(false); return; }
    setFaded(false);
    const timer = setTimeout(() => setFaded(true), memoryFadeMs);
    return () => clearTimeout(timer);
  }, [memoryMode, memoryFadeMs, color, shape, matched]);

  const initExplosion = useCallback(() => {
    const cx = size / 2;
    const cy = size / 2;
    const colorData = COLORS[color] || COLORS.red;
    const points = getShapePoints(shape, 50);
    const particles = points.map(p => {
      const speed = p.r * 2.8 * (0.8 + Math.random() * 0.4);
      return {
        x: cx, y: cy,
        vx: Math.cos(p.angle) * speed,
        vy: Math.sin(p.angle) * speed,
        life: 70 * (0.7 + Math.random() * 0.3),
        maxLife: 70,
        size: 1.5 + Math.random() * 2,
        color: colorData.hex,
        glow: colorData.glow,
      };
    });
    // Add some inner sparkles for extra beauty
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.2;
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 50 * (0.6 + Math.random() * 0.4),
        maxLife: 50,
        size: 1 + Math.random() * 1.5,
        color: '#fff',
        glow: 'rgba(255,255,255,0.5)',
      });
    }
    return { particles, age: 0, phase: 'exploding' };
  }, [color, shape, size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    stateRef.current = initExplosion();
    let waitFrames = 0;

    const loop = () => {
      ctx.clearRect(0, 0, size, size);

      // Dark sky circle background
      const bgGrad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      bgGrad.addColorStop(0, 'rgba(8,8,30,0.95)');
      bgGrad.addColorStop(0.7, 'rgba(8,8,30,0.8)');
      bgGrad.addColorStop(1, 'rgba(8,8,30,0)');
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();

      // Tiny stars
      const starSeed = 42;
      for (let i = 0; i < 8; i++) {
        const sx = ((starSeed * (i + 1) * 17) % (size - 10)) + 5;
        const sy = ((starSeed * (i + 1) * 31) % (size - 10)) + 5;
        const sa = 0.15 + Math.sin(Date.now() * 0.002 + i) * 0.1;
        ctx.fillStyle = `rgba(255,255,240,${sa})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      const st = stateRef.current;

      if (st.phase === 'exploding') {
        st.age++;
        let alive = 0;
        st.particles.forEach(ep => {
          ep.vx *= 0.96;
          ep.vy *= 0.96;
          ep.vy += 0.015;
          ep.x += ep.vx;
          ep.y += ep.vy;
          ep.life--;
          if (ep.life <= 0) return;
          alive++;
          const progress = 1 - ep.life / ep.maxLife;
          const alpha = progress > 0.45
            ? 1 - (progress - 0.45) / 0.55
            : 1;
          ctx.save();
          ctx.globalAlpha = Math.max(0, alpha);
          ctx.shadowBlur = 6;
          ctx.shadowColor = ep.glow;
          ctx.fillStyle = ep.color;
          ctx.beginPath();
          ctx.arc(ep.x, ep.y, ep.size * (0.4 + 0.6 * alpha), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        if (alive === 0) {
          st.phase = 'waiting';
          waitFrames = 0;
        }
      } else if (st.phase === 'waiting') {
        waitFrames++;
        if (waitFrames > 40) {
          stateRef.current = initExplosion();
        }
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [color, shape, size, initExplosion]);

  return (
    <div className={`quest-preview-wrap ${faded ? 'memory-faded' : ''}`}>
      <canvas
        ref={canvasRef}
        className={`quest-preview-canvas ${matched ? 'matched' : ''}`}
        style={{ width: size, height: size }}
      />
    </div>
  );
};

/* ────────────────────────────────────────────
   Shape button icon (outline)
   ──────────────────────────────────────────── */
const ShapeBtnIcon = ({ shape }) => {
  switch (shape) {
    case 'circle':   return <Circle size={18} />;
    case 'square':   return <Square size={18} />;
    case 'triangle': return <Triangle size={18} />;
    default:         return null;
  }
};

/* ════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════ */
const FireworkFestival = () => {
  const {
    canvasRef,
    gamePhase, currentLevel, score, questsCompleted, timeRemaining,
    currentQuest, cannonSelections, lastMatchResult,
    showHowToPlay, setShowHowToPlay, crowdMood, levelSummary,
    unlockedColor, unlockedCannon,
    chillMode, toggleChillMode,
    quickMatch, questStartTime, levelIntro,
    levelConfig, totalLevels,
    startGame, fireCannon, selectColor, selectShape,
    advanceLevel, restartLevel, restartGame,
  } = useFireworkGame();

  const isPlaying = gamePhase === GAME_PHASES.PLAYING;

  // Timer bar style
  const timerPercent = levelConfig ? (timeRemaining / levelConfig.timeLimit) * 100 : 100;
  const timerColor = timerPercent > 50 ? '#3bff6e'
    : timerPercent > 25 ? '#ffe03b'
    : '#ff3b3b';
  const timerGlow = timerPercent > 50 ? 'rgba(59,255,110,0.4)'
    : timerPercent > 25 ? 'rgba(255,224,59,0.4)'
    : 'rgba(255,59,59,0.4)';

  return (
    <div className="firework-container">
      {/* ── Canvas ──────────────────────── */}
      <canvas ref={canvasRef} />

      {/* ── Top Bar ─────────────────────── */}
      {isPlaying && (
        <>
          <div className="firework-top-bar">
            <Link to="/vqm-mini-games/" className="firework-back-btn">
              <ArrowLeft size={16} />
              <span>Back</span>
            </Link>
            <span className="firework-title">
              Firework Festival
              {chillMode && <span className="chill-badge">☕ Chill</span>}
            </span>
            <button className="firework-help-btn" onClick={() => setShowHowToPlay(true)}>
              <HelpCircle size={16} />
            </button>
          </div>

          {/* ── Timer Bar (hidden in chill mode) ── */}
          {!chillMode && (
            <div className="firework-timer-wrap">
              <div
                className="firework-timer-bar"
                style={{
                  width: `${timerPercent}%`,
                  backgroundColor: timerColor,
                  '--timer-glow': timerGlow,
                }}
              />
            </div>
          )}

          {/* ── Stats ────────────────────── */}
          <div className="firework-stats">
            <div className="firework-stat">
              <span>Level</span>
              <span className="firework-stat-value">{levelConfig.level}/{totalLevels}</span>
            </div>
            <div className="firework-stat">
              <span>Quests</span>
              <span className="firework-stat-value">{questsCompleted}/{levelConfig.questCount}</span>
            </div>
            <div className="firework-stat">
              <span>Score</span>
              <span className="firework-stat-value score-val">{score}</span>
            </div>
            {!chillMode && (
              <div className="firework-stat">
                <span>Time</span>
                <span className="firework-stat-value">{timeRemaining}s</span>
              </div>
            )}
          </div>

          {/* ── Quest Panel — Animated Preview ── */}
          {currentQuest && (
            <div className="firework-quest" key={`q-${questsCompleted}-${currentQuest.type}`}>
              <span className="quest-label">
                {currentQuest.type === QUEST_TYPES.SINGLE && 'Recreate this firework'}
                {currentQuest.type === QUEST_TYPES.DUAL && 'Both cannons must match'}
                {currentQuest.type === QUEST_TYPES.SEQUENCE && `Sequence ${(currentQuest.sequenceIndex || 0) + 1} of ${currentQuest.requirements.length}`}
              </span>
              <div className="quest-previews">
                {currentQuest.type === QUEST_TYPES.SEQUENCE ? (
                  currentQuest.requirements.map((req, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <span className="quest-arrow">→</span>}
                      <div className={`quest-preview-slot ${currentQuest.matched[i] ? 'matched' : ''} ${i === (currentQuest.sequenceIndex || 0) ? 'active' : ''}`}>
                        <span className="quest-step-num">{i + 1}</span>
                        <QuestPreviewCanvas
                          color={req.color}
                          shape={req.shape}
                          size={80}
                          matched={currentQuest.matched[i]}
                          memoryMode={levelConfig.memoryMode}
                          memoryFadeMs={levelConfig.memoryFadeMs}
                        />
                      </div>
                    </React.Fragment>
                  ))
                ) : (
                  currentQuest.requirements.map((req, i) => (
                    <div key={i} className={`quest-preview-slot ${currentQuest.matched[i] ? 'matched' : ''}`}>
                      {currentQuest.type === QUEST_TYPES.DUAL && (
                        <span className="quest-cannon-label">{req.cannonId === 0 ? 'Left' : 'Right'}</span>
                      )}
                      <QuestPreviewCanvas
                        color={req.color}
                        shape={req.shape}
                        size={currentQuest.type === QUEST_TYPES.DUAL ? 95 : 110}
                        matched={currentQuest.matched[i]}
                        memoryMode={levelConfig.memoryMode}
                        memoryFadeMs={levelConfig.memoryFadeMs}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── Cannon Controls ──────────── */}
          <div className="firework-controls-wrap">
            {cannonSelections.map((sel) => {
              const colorData = COLORS[sel.color] || COLORS.red;
              return (
                <div key={sel.id} className="cannon-control-group">
                  {levelConfig.cannonCount > 1 && (
                    <span className="cannon-label">
                      {sel.id === 0 ? 'Left' : 'Right'}
                    </span>
                  )}

                  {/* Cannon Visual — shows loaded color + shape */}
                  <div className="cannon-visual">
                    <div className="cannon-muzzle-ring" />
                    <div
                      className="cannon-barrel"
                      style={{
                        backgroundColor: colorData.hex,
                        '--cannon-glow': colorData.glow,
                      }}
                    >
                      <div className="cannon-shell" key={`${sel.id}-${sel.color}-${sel.shape}`}>
                        <ShapeBtnIcon shape={sel.shape} />
                      </div>
                    </div>
                    <div className="cannon-base">
                      <div className="cannon-wheel" />
                      <div className="cannon-wheel" />
                    </div>
                  </div>

                  {/* Color selector — only unlocked colors */}
                  <div className="selector-row">
                    {levelConfig.availableColors.map(colorKey => {
                      const c = COLORS[colorKey];
                      return (
                        <button
                          key={colorKey}
                          className={`color-btn ${sel.color === colorKey ? 'active' : ''}`}
                          style={{
                            backgroundColor: c.hex,
                            '--btn-glow': c.glow,
                          }}
                          onClick={() => selectColor(sel.id, colorKey)}
                          title={c.name}
                          aria-label={`Select ${c.name}`}
                        />
                      );
                    })}
                  </div>

                  {/* Shape selector */}
                  <div className="selector-row">
                    {SHAPE_ORDER.map(shapeKey => (
                      <button
                        key={shapeKey}
                        className={`shape-btn ${sel.shape === shapeKey ? 'active' : ''}`}
                        onClick={() => selectShape(sel.id, shapeKey)}
                        title={shapeKey.charAt(0).toUpperCase() + shapeKey.slice(1)}
                        aria-label={`Select ${shapeKey}`}
                      >
                        <ShapeBtnIcon shape={shapeKey} />
                      </button>
                    ))}
                  </div>

                  {/* Fire button */}
                  <button
                    className="fire-btn"
                    onClick={() => fireCannon(sel.id)}
                    aria-label={`Fire ${levelConfig.cannonCount > 1 ? (sel.id === 0 ? 'left' : 'right') + ' cannon' : 'cannon'}`}
                  >
                    <Flame size={20} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* ── Match Feedback ────────────── */}
          {lastMatchResult && (
            <div className={`match-feedback ${lastMatchResult}`}>
              {lastMatchResult === 'correct' ? 'MATCH!' : 'MISS!'}
            </div>
          )}

          {/* ── Crowd Mood ───────────────── */}
          {crowdMood !== 'neutral' && (
            <div className={`crowd-indicator ${crowdMood}`}>
              {crowdMood === 'cheer' ? '👏 The crowd cheers!' : '😮 Aww...'}
            </div>
          )}

          {/* ── Quick-Match Flash ─────────── */}
          {quickMatch && (
            <div className="quick-match-feedback">⚡ QUICK!</div>
          )}

          {/* ── Level Intro ──────────────── */}
          {levelIntro && (
            <div className="level-intro-overlay">
              <div className="level-intro-content">
                <span className="level-intro-num">Level {levelIntro.level}</span>
                <span className="level-intro-title">{levelIntro.title}</span>
                {levelIntro.newMechanic && (
                  <span className="level-intro-new">{levelIntro.newMechanic}</span>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Unlock Notifications ─────────── */}
      {unlockedColor && (
        <div className="unlock-notification">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              backgroundColor: COLORS[unlockedColor]?.hex,
              boxShadow: `0 0 16px ${COLORS[unlockedColor]?.glow}`,
            }} />
            <span>{COLORS[unlockedColor]?.name} Unlocked!</span>
          </div>
          <div className="unlock-sub">New color added to your palette</div>
        </div>
      )}

      {unlockedCannon && (
        <div className="unlock-notification">
          🎯 Second Cannon Unlocked!
          <div className="unlock-sub">Manage two cannons at once</div>
        </div>
      )}

      {/* ══ MENU ═════════════════════════════ */}
      {gamePhase === GAME_PHASES.MENU && (
        <div className="firework-overlay">
          <div className="firework-modal">
            <div className="modal-emoji">🎆</div>
            <h2>Firework Festival</h2>
            <p className="modal-sub">
              Observe the firework and recreate its color and shape!
            </p>

            {/* Chill mode toggle */}
            <div className="mode-toggle-wrap">
              <button
                className={`mode-toggle-btn ${!chillMode ? 'active' : ''}`}
                onClick={() => chillMode && toggleChillMode()}
              >
                <Zap size={16} />
                <span>Timed</span>
              </button>
              <button
                className={`mode-toggle-btn ${chillMode ? 'active' : ''}`}
                onClick={() => !chillMode && toggleChillMode()}
              >
                <Coffee size={16} />
                <span>Chill</span>
              </button>
            </div>
            <p className="mode-description">
              {chillMode
                ? 'No timer. Take your time and enjoy the show.'
                : 'Beat the clock! Earn time bonuses for fast completions.'}
            </p>

            <div className="menu-level-info">
              10 levels · 7 colors · 3 shapes · Crowd cheering
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button className="modal-btn modal-btn-primary" onClick={startGame}>
                <Play size={18} /> Start Game
              </button>
              <button className="modal-btn modal-btn-secondary" onClick={() => setShowHowToPlay(true)}>
                <HelpCircle size={16} /> How to Play
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ LEVEL COMPLETE ═══════════════════ */}
      {gamePhase === GAME_PHASES.LEVEL_COMPLETE && levelSummary && (
        <div className="firework-overlay">
          <div className="firework-modal">
            <div className="modal-emoji">
              {levelSummary.timedOut ? '⏰' : '🎉'}
            </div>
            <h2>
              {levelSummary.timedOut ? "Time's Up!" : `Level ${levelSummary.level} Complete!`}
            </h2>
            <p className="modal-sub">
              {levelSummary.timedOut
                ? `You completed ${levelSummary.questsCompleted} of ${levelSummary.totalQuests} quests`
                : LEVELS[currentLevel]?.description || 'Great work!'
              }
            </p>

            <div className="modal-stats">
              <div className="modal-stat-box">
                <div className="stat-label">Quests</div>
                <div className="stat-value">{levelSummary.questsCompleted}/{levelSummary.totalQuests}</div>
              </div>
              {!levelSummary.chillMode && (
                <>
                  <div className="modal-stat-box">
                    <div className="stat-label">Time Left</div>
                    <div className="stat-value">{levelSummary.timeRemaining}s</div>
                  </div>
                  <div className="modal-stat-box">
                    <div className="stat-label">Time Bonus</div>
                    <div className="stat-value gold">+{levelSummary.timeBonus}</div>
                  </div>
                </>
              )}
              <div className="modal-stat-box">
                <div className="stat-label">Score</div>
                <div className="stat-value gold">{levelSummary.score}</div>
              </div>
            </div>

            {/* Next level preview */}
            {currentLevel < totalLevels - 1 && LEVELS[currentLevel + 1] && (
              <p className="modal-sub" style={{ marginBottom: 16, fontSize: 12, opacity: 0.7 }}>
                Next: Level {LEVELS[currentLevel + 1].level} — {LEVELS[currentLevel + 1].description}
              </p>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {!levelSummary.timedOut && currentLevel < totalLevels - 1 && (
                <button className="modal-btn modal-btn-primary" onClick={advanceLevel}>
                  <Play size={18} /> Next Level
                </button>
              )}
              <button className="modal-btn modal-btn-secondary" onClick={restartLevel}>
                <RotateCcw size={16} /> Retry
              </button>
              <Link to="/vqm-mini-games/" className="modal-btn modal-btn-secondary" style={{ textDecoration: 'none' }}>
                <Home size={16} /> Home
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ══ GAME COMPLETE ════════════════════ */}
      {gamePhase === GAME_PHASES.GAME_COMPLETE && levelSummary && (
        <div className="firework-overlay">
          <div className="firework-modal">
            <div className="modal-emoji">🏆</div>
            <h2>Grand Finale Complete!</h2>
            <p className="modal-sub">
              You've mastered the Firework Festival!
            </p>

            <div className="modal-stats">
              <div className="modal-stat-box" style={{ gridColumn: '1 / -1' }}>
                <div className="stat-label">Final Score</div>
                <div className="stat-value gold" style={{ fontSize: 32 }}>{levelSummary.score}</div>
              </div>
              <div className="modal-stat-box">
                <div className="stat-label">Levels</div>
                <div className="stat-value">{totalLevels}/{totalLevels}</div>
              </div>
              <div className="modal-stat-box">
                <div className="stat-label">Colors Used</div>
                <div className="stat-value">7</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="modal-btn modal-btn-primary" onClick={restartGame}>
                <RotateCcw size={18} /> Play Again
              </button>
              <Link to="/vqm-mini-games/" className="modal-btn modal-btn-secondary" style={{ textDecoration: 'none' }}>
                <Home size={16} /> Home
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ══ HOW TO PLAY ══════════════════════ */}
      {showHowToPlay && (
        <div className="firework-overlay" onClick={() => setShowHowToPlay(false)}>
          <div className="firework-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <h2>🎆 How to Play</h2>
            <div className="htp-content">
              <h3>🎯 Goal</h3>
              <p>
                Watch the firework preview closely — observe the explosion's color and shape,
                then recreate it by selecting the right combination on your cannon and firing!
              </p>

              <h3>🕹️ Controls</h3>
              <ul>
                <li><strong>Color buttons</strong> — Pick the firework color</li>
                <li><strong>Shape buttons</strong> — Pick the explosion shape (Circle, Square, Triangle)</li>
                <li><strong>Fire button</strong> — Launch the firework!</li>
              </ul>

              <h3>📈 10 Unique Levels</h3>
              <ul>
                <li><strong>L1 "First Spark"</strong> — Tutorial: 1 cannon, 3 colors</li>
                <li><strong>L2 "Quick Match"</strong> — ⚡ Quick-match bonus for fast matches!</li>
                <li><strong>L3 "Double Trouble"</strong> — 🎯 Second cannon unlocks!</li>
                <li><strong>L4 "Color Splash"</strong> — 🎨 Green & Purple join the palette</li>
                <li><strong>L5 "Fading Lights"</strong> — 🧠 Memory mode: previews fade!</li>
                <li><strong>L6 "Rapid Fire"</strong> — 🔥 Orange + blitz pacing</li>
                <li><strong>L7 "Full Spectrum"</strong> — 🌈 All 7 colors unlocked</li>
                <li><strong>L8 "Chain Reaction"</strong> — 🔗 Sequence quests: fire in order</li>
                <li><strong>L9 "Crowd Pleaser"</strong> — 😤 Memory + speed combined!</li>
                <li><strong>L10 "Grand Finale"</strong> — 🏆 Everything at once, 4× score!</li>
              </ul>

              <h3>🎭 Quest Types</h3>
              <ul>
                <li><strong>Single:</strong> One firework preview — match it with any cannon</li>
                <li><strong>Dual:</strong> Two previews — each cannon must match its target</li>
                <li><strong>Sequence:</strong> Fire fireworks in the correct order</li>
              </ul>

              <h3>⚡ Special Mechanics</h3>
              <ul>
                <li><strong>Quick-match bonus:</strong> Match within the time window for +50 pts</li>
                <li><strong>Memory mode:</strong> Quest preview fades — remember what you saw!</li>
                <li><strong>Sequences:</strong> Fire 2–3 fireworks in exact order</li>
              </ul>

              <h3>☕ Chill Mode</h3>
              <p>
                Toggle Chill Mode in the menu to play without any time pressure.
                Perfect for learning the patterns at your own pace!
              </p>

              <h3>👏 Crowd</h3>
              <p>
                The crowd cheers for correct matches and reacts when you miss.
                Build combos for louder cheers and bonus points!
              </p>

              <h3>⭐ Scoring</h3>
              <ul>
                <li>Base: 100 points per correct match</li>
                <li>Combo bonus: +25 per consecutive match</li>
                <li>Quick-match bonus: +50 for fast completions</li>
                <li>Time bonus at level end (timed mode only)</li>
                <li>Higher levels have score multipliers (up to 4×!)</li>
              </ul>
            </div>
            <button
              className="modal-btn modal-btn-secondary htp-close-btn"
              onClick={() => setShowHowToPlay(false)}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FireworkFestival;
