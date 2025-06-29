// MouseStalker.jsx: Main component for the game.
// Uses the optimized useDragonGame hook and renders the canvas and UI.
// UPDATED: Added FruitInfo panel and adjusted UI layout. Milestones are now 100, 250, 500.

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wand2, Ruler, Trophy, Award, Star, X, Info, Gift } from 'lucide-react';
import { useDragonGame } from './useDragonGame';
import { SKINS, FRUIT_TYPES } from './gameConfig';
import './MouseStalker.css';

// Milestone Tracker Component
const MilestoneTracker = ({ score }) => {
    const milestones = [
        { value: 100, icon: <Star size={16} /> },
        { value: 250, icon: <Award size={16} /> },
        { value: 500, icon: <Trophy size={16} /> }
    ];

    return (
        <div className="milestone-tracker">
            {milestones.map((milestone, index) => {
                const achieved = score >= milestone.value;
                const prevMilestoneValue = index > 0 ? milestones[index - 1].value : 0;
                const progress = Math.min(100, Math.max(0, ((score - prevMilestoneValue) / (milestone.value - prevMilestoneValue)) * 100));

                return (
                    <React.Fragment key={milestone.value}>
                        {index > 0 && (
                            <div className="milestone-connector-wrapper">
                                <div className="milestone-connector-bg"></div>
                                <div className="milestone-connector-progress" style={{ width: `${achieved ? 100 : progress}%` }}></div>
                            </div>
                        )}
                        <div className={`milestone ${achieved ? 'achieved' : ''}`}>
                            {milestone.icon}
                            <span>{milestone.value}</span>
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
};

// Victory Message Component
const VictoryMessage = ({ score, onClose }) => {
    return (
        <div className="victory-overlay">
            <div className="victory-box">
                <button className="victory-close-button" onClick={onClose} aria-label="Close victory message">
                    <X size={24} />
                </button>
                <Trophy size={48} className="victory-trophy" />
                <h2>Victory!</h2>
                <p>You've reached a magnificent length of {score}!</p>
                <p className="victory-subtext">The dragon has reached its ultimate form and will grow no larger. You can continue playing for fun!</p>
                <button className="victory-continue-button" onClick={onClose}>
                    Continue
                </button>
            </div>
        </div>
    );
};

// Fruit Info Component
const FruitInfo = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fruit-info-container">
            <button className="fruit-info-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle fruit rewards list">
                <Info size={22} />
            </button>
            {isOpen && (
                <div className="fruit-info-panel">
                    <div className="fruit-info-header">
                        <h3>Fruit Rewards</h3>
                        <button onClick={() => setIsOpen(false)}><X size={18} /></button>
                    </div>
                    <ul>
                        {Object.values(FRUIT_TYPES).map(fruit => (
                            <li key={fruit.type} className="fruit-info-item">
                                <div className="fruit-icon" style={{ backgroundColor: fruit.color, boxShadow: `0 0 8px ${fruit.color}` }}></div>
                                <div className="fruit-details">
                                    <span className="fruit-name">{fruit.type}</span>
                                    <span className="fruit-reward">
                                        <Gift size={14} /> +{fruit.minBonus} to +{fruit.maxBonus} length
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


const MouseStalker = () => {
  const { canvasRef, score, activeSkin, setActiveSkin, showVictoryModal, setShowVictoryModal } = useDragonGame();

  return (
    <div className="stalker-container">
      <canvas ref={canvasRef} className="stalker-canvas" />
      <div className="stalker-ui">
        <div className="ui-left">
            <Link to="/vqm-mini-games" className="back-button-simple">
              <ArrowLeft size={22} />
            </Link>
            <FruitInfo />
        </div>
        <div className="ui-center">
            <MilestoneTracker score={score} />
        </div>
        <div className="ui-right">
            <div className="score-display">
              <Ruler size={18} />
              <span>{score}</span>
            </div>
            <div className="skin-selector">
              <Wand2 size={18} />
              <select
                className="skin-dropdown"
                value={activeSkin}
                onChange={(e) => setActiveSkin(e.target.value)}
              >
                {Object.keys(SKINS).map((skinName) => (
                  <option key={skinName} value={skinName}>
                    {skinName.replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
        </div>
      </div>
      {showVictoryModal && <VictoryMessage score={score} onClose={() => setShowVictoryModal(false)} />}
    </div>
  );
};

export default MouseStalker;
