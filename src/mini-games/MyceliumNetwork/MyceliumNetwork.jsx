// MyceliumNetwork.jsx — UI wrapper for the Mycelium Network game.
// Canvas rendering + event handling live in useMyceliumGame hook.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle, X, RotateCcw } from 'lucide-react';
import { useMyceliumGame } from './useMyceliumGame';
import { MILESTONES } from './gameConfig';
import './MyceliumNetwork.css';

// --- How To Play Panel ---
const HowToPlay = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="htp-overlay" onClick={onClose}>
            <div className="htp-panel" onClick={e => e.stopPropagation()}>
                <div className="htp-header">
                    <h2>How to Play</h2>
                    <button className="htp-close" onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <div className="htp-body">
                    <section className="htp-section">
                        <h3>🌱 Controls</h3>
                        <ul className="htp-controls-list">
                            <li>
                                <span className="htp-key">Click</span>
                                <span className="htp-desc">Plant a glowing node</span>
                            </li>
                            <li>
                                <span className="htp-key">Move</span>
                                <span className="htp-desc">Guide tendril growth toward cursor</span>
                            </li>
                            <li>
                                <span className="htp-key">Double‑click</span>
                                <span className="htp-desc">Nurture — boost nearby tendril speed</span>
                            </li>
                            <li>
                                <span className="htp-key">Touch</span>
                                <span className="htp-desc">Tap to plant, drag to guide</span>
                            </li>
                        </ul>
                    </section>

                    <section className="htp-section">
                        <h3>🔗 How It Works</h3>
                        <p>Each node sprouts organic tendrils that grow outward. When a tendril reaches another node, they connect — creating a glowing link in your network.</p>
                        <p>Energy pulses travel along connections. The more you plant, the richer the network becomes.</p>
                    </section>

                    <section className="htp-section">
                        <h3>🍄 Milestones</h3>
                        <div className="htp-milestones">
                            {MILESTONES.map(m => (
                                <div key={m.key} className="htp-milestone-row">
                                    <span className="htp-milestone-icon">{m.icon}</span>
                                    <span className="htp-milestone-label">{m.label}</span>
                                    <span className="htp-milestone-req">
                                        {m.threshold} {m.type}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="htp-section">
                        <h3>✨ Features</h3>
                        <ul className="htp-features-list">
                            <li>Bioluminescent color palette — every node is unique</li>
                            <li>Organic tendril growth with natural curves</li>
                            <li>Auto-connecting tendrils seek nearby nodes</li>
                            <li>Energy pulses travel along connected paths</li>
                            <li>Particle effects on connections & milestones</li>
                            <li>No end game — grow your network forever</li>
                        </ul>
                    </section>

                    <div className="htp-tip">
                        💡 Tip: Place nodes strategically so tendrils can reach each other!
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Milestone Tracker ---
const MilestoneTracker = ({ achievedMilestones, nodeCount, connectionCount }) => {
    return (
        <div className="mycelium-milestone-tracker">
            {MILESTONES.map((m, idx) => {
                const achieved = achievedMilestones.has(m.key);

                // connector progress between milestones
                let connectorFill = 0;
                if (idx > 0) {
                    const prev = MILESTONES[idx - 1];
                    const curVal = m.type === 'nodes' ? nodeCount : connectionCount;
                    const prevAchieved = achievedMilestones.has(prev.key);
                    if (achieved) {
                        connectorFill = 100;
                    } else if (prevAchieved) {
                        connectorFill = Math.min(100, Math.max(0, (curVal / m.threshold) * 100));
                    }
                }

                return (
                    <React.Fragment key={m.key}>
                        {idx > 0 && (
                            <div className="milestone-connector">
                                <div
                                    className="milestone-connector-fill"
                                    style={{ width: `${connectorFill}%` }}
                                ></div>
                            </div>
                        )}
                        <div className={`milestone-dot ${achieved ? 'achieved' : ''}`}>
                            <div className="milestone-icon-wrap">
                                {m.icon}
                            </div>
                            <span className="milestone-label">{m.label}</span>
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
};

// --- Main Component ---
const MyceliumNetwork = () => {
    const {
        canvasRef,
        handleClick,
        handleDoubleClick,
        handleMouseMove,
        handleTouchStart,
        handleTouchMove,
        clearNetwork,
        nodeCount,
        connectionCount,
        longestPath,
        density,
        achievedMilestones,
        milestoneFlash,
    } = useMyceliumGame();

    const [showTitle, setShowTitle] = useState(true);
    const [showHelp, setShowHelp] = useState(false);
    const [showConfirmReset, setShowConfirmReset] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowTitle(false), 4500);
        return () => clearTimeout(timer);
    }, []);

    const handleReset = () => {
        clearNetwork();
        setShowConfirmReset(false);
    };

    return (
        <div className="mycelium-container">
            {/* Canvas */}
            <canvas
                ref={canvasRef}
                className="mycelium-canvas"
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
            />

            {/* === TOP BAR === */}
            <div className="mycelium-top-bar">
                {/* Left: Back + Info */}
                <div className="top-bar-left">
                    <Link to="/vqm-mini-games/" className="mycelium-back-btn" aria-label="Back to home">
                        <ArrowLeft size={18} />
                    </Link>
                    <button
                        className="mycelium-help-btn"
                        onClick={() => setShowHelp(true)}
                        aria-label="How to play"
                    >
                        <HelpCircle size={18} />
                    </button>
                </div>

                {/* Center: Game title (persistent) */}
                <div className="top-bar-center">
                    <span className="top-bar-icon" aria-hidden="true">🍄</span>
                    <span className="top-bar-title">Mycelium Network</span>
                </div>

                {/* Right: Reset */}
                <div className="top-bar-right">
                    <button
                        className="mycelium-reset-btn"
                        onClick={() => setShowConfirmReset(true)}
                        aria-label="Reset network"
                        title="Clear & restart"
                    >
                        <RotateCcw size={16} />
                    </button>
                </div>
            </div>

            {/* Title overlay (fades after 4s) — first-time intro */}
            {showTitle && (
                <div className="mycelium-title-overlay">
                    <h1>Mycelium Network</h1>
                    <p>Click to plant — watch it grow</p>
                </div>
            )}

            {/* Stats panel */}
            <div className="mycelium-stats-panel">
                <div className="stats-title">Network</div>
                <div className="stat-row">
                    <span className="stat-label">🌱 Nodes</span>
                    <span className="stat-value">{nodeCount}</span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">🔗 Links</span>
                    <span className="stat-value">{connectionCount}</span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">📏 Path</span>
                    <span className="stat-value">{longestPath}</span>
                </div>
                <div className="stat-row">
                    <span className="stat-label">🕸️ Density</span>
                    <span className="stat-value">{density}%</span>
                </div>
            </div>

            {/* Milestone tracker */}
            <MilestoneTracker
                achievedMilestones={achievedMilestones}
                nodeCount={nodeCount}
                connectionCount={connectionCount}
            />

            {/* Milestone flash overlay */}
            {milestoneFlash && (
                <div className="milestone-flash-overlay">
                    <div className="milestone-flash-label">
                        <span className="flash-icon">{milestoneFlash.icon}</span>
                        <span className="flash-text">{milestoneFlash.label}</span>
                    </div>
                </div>
            )}

            {/* How to Play panel */}
            <HowToPlay isOpen={showHelp} onClose={() => setShowHelp(false)} />

            {/* Reset confirmation */}
            {showConfirmReset && (
                <div className="reset-overlay" onClick={() => setShowConfirmReset(false)}>
                    <div className="reset-dialog" onClick={e => e.stopPropagation()}>
                        <p>Clear the entire network and start fresh?</p>
                        <div className="reset-actions">
                            <button className="reset-cancel" onClick={() => setShowConfirmReset(false)}>
                                Cancel
                            </button>
                            <button className="reset-confirm" onClick={handleReset}>
                                Clear Network
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyceliumNetwork;
