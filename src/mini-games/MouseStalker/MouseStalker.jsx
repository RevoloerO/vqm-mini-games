// MouseStalker.jsx: Main component for the game.
// Uses the optimized useDragonGame hook and renders the canvas and UI.

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wand2, Ruler } from 'lucide-react';
import { useDragonGame } from './useDragonGame';
import { SKINS } from './gameConfig';
import './MouseStalker.css';

const MouseStalker = () => {
  // The hook now returns 'score' directly.
  const { canvasRef, score, activeSkin, setActiveSkin } = useDragonGame();

  return (
    <div className="stalker-container">
      <canvas ref={canvasRef} className="stalker-canvas" />
      <div className="stalker-ui">
        <Link to="/vqm-mini-games" className="back-button-simple">
          <ArrowLeft size={22} />
        </Link>
        <div className="score-display">
          <Ruler size={18} />
          {/* The UI now uses the 'score' state variable. */}
          <span>{score}</span>
        </div>
        <div className="skin-selector">
          <Wand2 size={18} />
          {Object.keys(SKINS).map((skinName) => (
            <button
              key={skinName}
              className={`skin-button ${activeSkin === skinName ? 'active' : ''}`}
              onClick={() => setActiveSkin(skinName)}
            >
              {skinName}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MouseStalker;
