import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Play, RotateCcw, ChevronRight, Target, Ban, GitFork, Shield, Wind } from 'lucide-react';
import useFlockGame from './useFlockGame';
import { GAME_PHASES, BEACON_TYPES, LEVELS } from './gameConfig';
import './FlockCommander.css';

const BEACON_ICONS = {
  magnet: Target,
  repeller: Ban,
  vortex: GitFork,
  shelter: Shield,
  stream: Wind,
};

const STREAM_LABELS = ['Right', 'Down', 'Left', 'Up'];

export default function FlockCommander() {
  const {
    canvasRef, gamePhase, currentLevel, score, savedCount, timeRemaining,
    selectedBeaconType, beaconBudget, levelStars, totalStars,
    streamDir, beaconColor,
    startGame, releaseFlock, nextLevel, retryLevel,
    setSelectedBeaconType, setStreamDir, setBeaconColor,
    handleCanvasClick, handleCanvasMouseMove, handleCanvasMouseDown, handleCanvasMouseUp,
    level, totalLevels,
  } = useFlockGame();

  const isPlanning = gamePhase === GAME_PHASES.PLANNING;
  const isSimulating = gamePhase === GAME_PHASES.SIMULATING;
  const hasColoredFlocks = level.boidColors.length > 1;

  return (
    <div className="flock-container">
      <canvas
        ref={canvasRef}
        className="flock-canvas"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseDown={handleCanvasMouseDown}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
      />

      {/* ── Top Bar ── */}
      {(isPlanning || isSimulating) && (
        <div className="flock-top-bar">
          <div className="top-bar-left">
            <Link to="/vqm-mini-games" className="flock-back-btn">
              <ArrowLeft size={16} />
            </Link>
          </div>
          <div className="flock-title">
            Level {level.level} — {level.title}
          </div>
          <div className="top-bar-right" />
        </div>
      )}

      {/* ── Stats Panel ── */}
      {isSimulating && (
        <div className="flock-stats">
          <div className="flock-stat">
            <span>Saved</span>
            <span className="flock-stat-value">{savedCount}/{level.boidCount}</span>
          </div>
          <div className="flock-stat">
            <span>Time</span>
            <span className={`flock-stat-value ${timeRemaining <= 10 ? 'danger' : ''}`}>
              {timeRemaining}s
            </span>
          </div>
          <div className="flock-stat">
            <span>Score</span>
            <span className="flock-stat-value score-val">{score}</span>
          </div>
        </div>
      )}

      {/* ── Timer Bar ── */}
      {isSimulating && (
        <div className="flock-timer-wrap">
          <div
            className="flock-timer-bar"
            style={{
              width: `${(timeRemaining / level.timeLimit) * 100}%`,
              backgroundColor: timeRemaining > 10 ? '#3bff6e' : '#ff3b3b',
            }}
          />
        </div>
      )}

      {/* ── Level Intro (during planning) ── */}
      {isPlanning && (
        <div className="flock-level-info">
          <div className="level-desc">{level.description}</div>
          {level.newMechanic && (
            <div className="level-new-mechanic">{level.newMechanic}</div>
          )}
          {level.allowDrag && (
            <div className="level-tag drag-tag">Drag beacons during flight!</div>
          )}
          {level.timedBeacons && (
            <div className="level-tag timer-tag">Beacons expire in {level.beaconDuration}s</div>
          )}
        </div>
      )}

      {/* ── Beacon Toolbar ── */}
      {isPlanning && (
        <div className="flock-toolbar">
          <div className="toolbar-beacons">
            {Object.keys(beaconBudget).map(type => {
              const bt = BEACON_TYPES[type];
              const Icon = BEACON_ICONS[type];
              const count = beaconBudget[type];
              const isActive = selectedBeaconType === type;
              return (
                <button
                  key={type}
                  className={`beacon-btn ${isActive ? 'active' : ''} ${count <= 0 ? 'depleted' : ''}`}
                  style={{ '--beacon-color': bt.color, '--beacon-glow': bt.glow }}
                  onClick={() => count > 0 && setSelectedBeaconType(type)}
                  disabled={count <= 0}
                >
                  <Icon size={18} />
                  <span className="beacon-name">{bt.name}</span>
                  <span className="beacon-count">x{count}</span>
                </button>
              );
            })}
          </div>

          {/* Stream direction selector */}
          {selectedBeaconType === 'stream' && (
            <div className="stream-dir-selector">
              <span className="dir-label">Direction:</span>
              {STREAM_LABELS.map((label, i) => (
                <button
                  key={i}
                  className={`dir-btn ${streamDir === i ? 'active' : ''}`}
                  onClick={() => setStreamDir(i)}
                >
                  {['→', '↓', '←', '↑'][i]}
                </button>
              ))}
            </div>
          )}

          {/* Color selector for colored levels */}
          {hasColoredFlocks && (
            <div className="color-selector">
              <span className="dir-label">Beacon targets:</span>
              <button
                className={`color-target-btn ${beaconColor === null ? 'active' : ''}`}
                onClick={() => setBeaconColor(null)}
              >
                All
              </button>
              {level.boidColors.map(c => (
                <button
                  key={c}
                  className={`color-target-btn ${beaconColor === c ? 'active' : ''}`}
                  style={{ '--target-color': c }}
                  onClick={() => setBeaconColor(c)}
                >
                  <span className="color-dot" style={{ background: c }} />
                </button>
              ))}
            </div>
          )}

          <div className="toolbar-actions">
            <div className="toolbar-hint">Click canvas to place, click beacon to remove</div>
            <button className="release-btn" onClick={releaseFlock}>
              <Play size={18} />
              Release Flock
            </button>
          </div>
        </div>
      )}

      {/* ── Menu Overlay ── */}
      {gamePhase === GAME_PHASES.MENU && (
        <div className="flock-overlay">
          <div className="flock-modal">
            <div className="modal-emoji">🐦</div>
            <h2>Flock Commander</h2>
            <p className="modal-sub">
              Place beacons to guide your flock to safety.
              Each level unlocks new tools and challenges!
            </p>
            <button className="modal-btn modal-btn-primary" onClick={() => startGame(0)}>
              <Play size={18} />
              Start Game
            </button>
          </div>
        </div>
      )}

      {/* ── Level Complete Overlay ── */}
      {gamePhase === GAME_PHASES.LEVEL_COMPLETE && (
        <div className="flock-overlay">
          <div className="flock-modal">
            <div className="modal-emoji">
              {levelStars >= 3 ? '⭐⭐⭐' : levelStars >= 2 ? '⭐⭐' : levelStars >= 1 ? '⭐' : '💨'}
            </div>
            <h2>{levelStars >= 2 ? 'Well Done!' : levelStars >= 1 ? 'Good Effort!' : 'Try Again!'}</h2>
            <p className="modal-sub">Level {level.level} — {level.title}</p>
            <div className="modal-stats">
              <div className="modal-stat-box">
                <div className="stat-label">Saved</div>
                <div className="stat-value">{savedCount}/{level.boidCount}</div>
              </div>
              <div className="modal-stat-box">
                <div className="stat-label">Stars</div>
                <div className="stat-value gold">{'⭐'.repeat(levelStars)}{levelStars === 0 ? '—' : ''}</div>
              </div>
              <div className="modal-stat-box">
                <div className="stat-label">Score</div>
                <div className="stat-value gold">{score}</div>
              </div>
              <div className="modal-stat-box">
                <div className="stat-label">Total Stars</div>
                <div className="stat-value">{totalStars}/{totalLevels * 3}</div>
              </div>
            </div>

            {/* Next level preview */}
            {currentLevel + 1 < totalLevels && LEVELS[currentLevel + 1].newMechanic && (
              <div className="next-level-preview">
                <span className="next-label">Next: {LEVELS[currentLevel + 1].title}</span>
                <span className="next-mechanic">{LEVELS[currentLevel + 1].newMechanic}</span>
              </div>
            )}

            <div className="modal-actions">
              <button className="modal-btn modal-btn-secondary" onClick={retryLevel}>
                <RotateCcw size={16} />
                Retry
              </button>
              <button className="modal-btn modal-btn-primary" onClick={nextLevel}>
                Next Level
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Game Complete Overlay ── */}
      {gamePhase === GAME_PHASES.GAME_COMPLETE && (
        <div className="flock-overlay">
          <div className="flock-modal">
            <div className="modal-emoji">🏆</div>
            <h2>Migration Complete!</h2>
            <p className="modal-sub">You guided your flocks across all {totalLevels} levels!</p>
            <div className="modal-stats">
              <div className="modal-stat-box">
                <div className="stat-label">Final Score</div>
                <div className="stat-value gold">{score}</div>
              </div>
              <div className="modal-stat-box">
                <div className="stat-label">Total Stars</div>
                <div className="stat-value gold">{totalStars}/{totalLevels * 3}</div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="modal-btn modal-btn-secondary" onClick={retryLevel}>
                <RotateCcw size={16} />
                Retry Final
              </button>
              <button className="modal-btn modal-btn-primary" onClick={() => startGame(0)}>
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
