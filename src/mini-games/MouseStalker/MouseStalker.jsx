import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wand2, Ruler } from 'lucide-react';
import { useDragonGame } from './useDragonGame';
import { SKINS } from './gameConfig';
import './MouseStalker.css';

// MouseStalker: Main component for the Mouse Stalker mini-game
const MouseStalker = () => {
  const { canvasRef, dragonState, activeSkin, setActiveSkin } = useDragonGame();

  return (
    <div className="stalker-container">
      {/* Game Canvas */}
      <canvas ref={canvasRef} className="stalker-canvas" />
      {/* UI Overlay */}
      <div className="stalker-ui">
        {/* Back Button */}
        <Link to="/vqm-mini-games" className="back-button-simple">
          <ArrowLeft size={22} />
        </Link>
        {/* Score Display */}
        <div className="score-display">
          <Ruler size={18} />
          <span>{dragonState.segments.length}</span>
        </div>
        {/* Skin Selector */}
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