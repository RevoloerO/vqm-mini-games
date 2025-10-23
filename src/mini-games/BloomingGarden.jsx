import React, { useState, useCallback, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import './BloomingGarden.css';

// --- SVG Icons ---
const InfoIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

// --- Game Constants ---
const GRID_SIZE = 8;
const FLOWERS_TO_MATCH = 5;
const FLOWERS_TO_SPAWN = 3;
const FLOWER_TYPES = 6;
const FLOWER_COLORS = {
    1: 'Rose',
    2: 'Sunflower',
    3: 'Bluebell',
    4: 'Lavender',
    5: 'Zinnia',
    6: 'Marigold'
};


// --- Helper Functions ---
const createEmptyBoard = () => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));

// Pathfinding for flower movement (A* algorithm for better performance)
const findPath = (start, end, board) => {
    const heuristic = (a, b) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c);

    const openSet = [{ ...start, f: heuristic(start, end), g: 0, h: heuristic(start, end), parent: null }];
    const closedSet = new Set();

    while (openSet.length > 0) {
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift();

        if (current.r === end.r && current.c === end.c) {
            const path = [];
            let temp = current;
            while (temp) {
                path.unshift({ r: temp.r, c: temp.c });
                temp = temp.parent;
            }
            return path;
        }

        closedSet.add(`${current.r}-${current.c}`);

        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        for (const [dr, dc] of directions) {
            const newR = current.r + dr;
            const newC = current.c + dc;

            if (newR >= 0 && newR < GRID_SIZE && newC >= 0 && newC < GRID_SIZE && board[newR][newC] === 0 && !closedSet.has(`${newR}-${newC}`)) {
                const g = current.g + 1;
                let neighbor = openSet.find(node => node.r === newR && node.c === newC);

                if (!neighbor || g < neighbor.g) {
                    if (!neighbor) {
                        neighbor = { r: newR, c: newC, h: heuristic({ r: newR, c: newC }, end) };
                        openSet.push(neighbor);
                    }
                    neighbor.parent = current;
                    neighbor.g = g;
                    neighbor.f = g + neighbor.h;
                }
            }
        }
    }
    return null; // No path found
};


// Check for matching lines of flowers
const checkForMatches = (board) => {
    const matchedTiles = new Set();
    const directions = [ { dr: 0, dc: 1 }, { dr: 1, dc: 0 }, { dr: 1, dc: 1 }, { dr: 1, dc: -1 } ];

    for(let r = 0; r < GRID_SIZE; r++) {
        for(let c = 0; c < GRID_SIZE; c++) {
            const flowerType = board[r][c];
            if (flowerType === 0) continue;

            for (const { dr, dc } of directions) {
                const line = [{r, c}];
                for (let i = 1; i < GRID_SIZE; i++) {
                    const newR = r + i * dr;
                    const newC = c + i * dc;
                    if (newR >= 0 && newR < GRID_SIZE && newC >= 0 && newC < GRID_SIZE && board[newR][newC] === flowerType) {
                        line.push({ r: newR, c: newC });
                    } else {
                        break;
                    }
                }
                if (line.length >= FLOWERS_TO_MATCH) {
                    line.forEach(tile => matchedTiles.add(`${tile.r}-${tile.c}`));
                }
            }
        }
    }
    return Array.from(matchedTiles).map(s => { const [r, c] = s.split('-').map(Number); return { r, c }; });
};

// --- Flower Component with SVG Shapes ---
const Flower = ({ type, isSelected, isBursting, isSpawning, isInvalid }) => {
    const classNames = `flower flower-${type} ${isSelected ? 'selected' : ''} ${isBursting ? 'burst' : ''} ${isSpawning ? 'spawn' : ''} ${isInvalid ? 'invalid' : ''}`;

    // SVG paths for different flower shapes
    const shapes = {
        1: { // Star (Rose)
            path: "M12 2 L15 8.5 L22 9.5 L17 14.5 L18.5 21.5 L12 18 L5.5 21.5 L7 14.5 L2 9.5 L9 8.5 Z",
            viewBox: "0 0 24 24"
        },
        2: { // Heart (Sunflower)
            path: "M12 21.35 L10.55 20.03 C5.4 15.36 2 12.27 2 8.5 C2 5.41 4.42 3 7.5 3 C9.24 3 10.91 3.81 12 5.08 C13.09 3.81 14.76 3 16.5 3 C19.58 3 22 5.41 22 8.5 C22 12.27 18.6 15.36 13.45 20.03 L12 21.35 Z",
            viewBox: "0 0 24 24"
        },
        3: { // Circle (Bluebell)
            path: "M12 2 C17.52 2 22 6.48 22 12 C22 17.52 17.52 22 12 22 C6.48 22 2 17.52 2 12 C2 6.48 6.48 2 12 2 Z",
            viewBox: "0 0 24 24"
        },
        4: { // Square (Lavender)
            path: "M3 3 L21 3 L21 21 L3 21 Z",
            viewBox: "0 0 24 24"
        },
        5: { // Triangle (Zinnia)
            path: "M12 2 L22 20 L2 20 Z",
            viewBox: "0 0 24 24"
        },
        6: { // Hexagon (Marigold)
            path: "M12 2 L20 7 L20 17 L12 22 L4 17 L4 7 Z",
            viewBox: "0 0 24 24"
        }
    };

    const shape = shapes[type] || shapes[1];

    return (
        <div className={classNames}>
            <svg viewBox={shape.viewBox} className="flower-svg">
                <defs>
                    <linearGradient id={`grad-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" className="gradient-start" />
                        <stop offset="100%" className="gradient-end" />
                    </linearGradient>
                </defs>
                <path d={shape.path} fill={`url(#grad-${type})`} className="flower-shape" />
            </svg>
        </div>
    );
};


// --- Main Game Component ---
const BloomingGarden = () => {
  // --- State Initialization ---
  const initializeGame = () => {
    const initialFlowers = Array.from({ length: FLOWERS_TO_SPAWN }, () => Math.ceil(Math.random() * FLOWER_TYPES));
    const emptyBoard = createEmptyBoard();
    const emptyTiles = [];
    emptyBoard.forEach((row, r) => row.forEach((cell, c) => {
      if (cell === 0) emptyTiles.push({ r, c });
    }));

    let newBoard = emptyBoard.map(row => [...row]);
    for (let i = 0; i < initialFlowers.length; i++) {
      const randomIndex = Math.floor(Math.random() * emptyTiles.length);
      const { r, c } = emptyTiles.splice(randomIndex, 1)[0];
      newBoard[r][c] = initialFlowers[i];
    }

    return newBoard;
  };

  // --- State ---
  const [board, setBoard] = useState(createEmptyBoard);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [nextFlowers, setNextFlowers] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [burstingCells, setBurstingCells] = useState([]);
  const [spawningCells, setSpawningCells] = useState([]);
  const [invalidMove, setInvalidMove] = useState(null);
  const [scorePulse, setScorePulse] = useState(false);
  const [showGetReady, setShowGetReady] = useState(true);
  const [floatingScores, setFloatingScores] = useState([]);
  const [hoveredTile, setHoveredTile] = useState(null);
  const [pathPreview, setPathPreview] = useState(null);
  const [comboCount, setComboCount] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);


  // --- Initial Game Setup ---
  useEffect(() => {
    // Show "Get Ready!" message for 1.5 seconds before starting
    const timer = setTimeout(() => {
      const initialBoard = initializeGame();
      const initialNext = Array.from({ length: FLOWERS_TO_SPAWN }, () => Math.ceil(Math.random() * FLOWER_TYPES));
      setBoard(initialBoard);
      setNextFlowers(initialNext);
      setShowGetReady(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // --- Flower Generation ---
  const generateNextFlowers = useCallback(() => {
    const newNext = Array.from({ length: FLOWERS_TO_SPAWN }, () => Math.ceil(Math.random() * FLOWER_TYPES));
    setNextFlowers(newNext);
    return newNext;
  }, []);

  // --- Flower Spawning ---
    const spawnFlowers = useCallback((currentBoard, flowersToSpawn) => {
        let newBoard = currentBoard.map(row => [...row]);
        const emptyTiles = [];
        newBoard.forEach((row, r) => row.forEach((cell, c) => {
            if (cell === 0) emptyTiles.push({ r, c });
        }));

        if (emptyTiles.length < flowersToSpawn.length) {
            setIsGameOver(true);
            return newBoard;
        }

        const spawned = [];
        for (let i = 0; i < flowersToSpawn.length; i++) {
            const randomIndex = Math.floor(Math.random() * emptyTiles.length);
            const { r, c } = emptyTiles.splice(randomIndex, 1)[0];
            newBoard[r][c] = flowersToSpawn[i];
            spawned.push({r, c});
        }

        setSpawningCells(spawned);
        setTimeout(() => setSpawningCells([]), 250);

        return newBoard;
    }, []);

  // --- Match Processing ---
    const processMatches = useCallback(async (boardWithMatches, turnMade = false, currentCombo = 0) => {
        const matches = checkForMatches(boardWithMatches);

        if (matches.length === 0) {
            // Reset combo when chain ends
            setComboCount(0);
            setShowCombo(false);

            if (!turnMade) {
                const spawnedBoard = spawnFlowers(boardWithMatches, nextFlowers);
                const newMatches = checkForMatches(spawnedBoard);
                setBoard(spawnedBoard);
                generateNextFlowers();
                if (newMatches.length > 0) {
                   // Start combo chain after spawning
                   await processMatches(spawnedBoard, true, 1);
                }
            }
            return;
        }

        // Update combo count
        let newCombo = currentCombo;
        if (turnMade) {
            newCombo = currentCombo + 1;
            setComboCount(newCombo);
            setShowCombo(true);

            // Auto-hide combo text after 2 seconds
            setTimeout(() => setShowCombo(false), 2000);
        } else {
            // Reset combo on player move
            setComboCount(0);
            setShowCombo(false);
        }

        // Calculate base points
        const basePoints = matches.length * 10 + (matches.length - FLOWERS_TO_MATCH) * 5;

        // Apply combo multiplier (minimum 1x)
        const multiplier = Math.max(1, newCombo);
        const pointsEarned = basePoints * multiplier;

        // Calculate center position of matched flowers
        const avgRow = matches.reduce((sum, m) => sum + m.r, 0) / matches.length;
        const avgCol = matches.reduce((sum, m) => sum + m.c, 0) / matches.length;

        // Create floating score popup
        const floatingScore = {
            id: Date.now(),
            value: pointsEarned,
            x: avgCol * 100 / GRID_SIZE, // Convert to percentage
            y: avgRow * 100 / GRID_SIZE,  // Convert to percentage
            matchLength: matches.length
        };

        setFloatingScores(prev => [...prev, floatingScore]);

        // Remove floating score after animation completes
        setTimeout(() => {
            setFloatingScores(prev => prev.filter(fs => fs.id !== floatingScore.id));
        }, 1500);

        // Trigger score pulse animation
        setScorePulse(true);
        setTimeout(() => setScorePulse(false), 300);

        setScore(s => s + pointsEarned);
        setBurstingCells(matches);

        await new Promise(res => setTimeout(res, 250));

        let clearedBoard = boardWithMatches.map(row => [...row]);
        matches.forEach(({ r, c }) => clearedBoard[r][c] = 0);

        setBoard(clearedBoard);
        setBurstingCells([]);

        // Recursive call to handle chain reactions
        await processMatches(clearedBoard, true, newCombo);
    }, [nextFlowers, generateNextFlowers, spawnFlowers]);


  // --- Tile Hover Handler ---
  const handleTileHover = useCallback((r, c) => {
    if (isProcessing || isGameOver || !selected) {
      setPathPreview(null);
      return;
    }

    // Only show path preview for empty tiles
    if (board[r][c] === 0) {
      const path = findPath(selected, { r, c }, board);
      setPathPreview(path);
    } else {
      setPathPreview(null);
    }
  }, [board, selected, isProcessing, isGameOver]);

  // --- Clear Path Preview ---
  const handleBoardLeave = useCallback(() => {
    setPathPreview(null);
  }, []);

  // --- Tile Click Handler ---
  const handleTileClick = useCallback(async (r, c) => {
    if (isProcessing || isGameOver) return;

    // If a flower is clicked
    if (board[r][c] > 0) {
      if (selected && selected.r === r && selected.c === c) {
        setSelected(null); // Deselect if clicking the same flower
        setPathPreview(null); // Clear path preview
      } else {
        setSelected({ r, c });
        setInvalidMove(null); // Clear any previous invalid move indicator
        setPathPreview(null); // Clear path preview when selecting new flower
      }
    } else if (selected) { // If an empty tile is clicked and a flower is selected
      setIsProcessing(true);
      const startPos = selected;
      const endPos = { r, c };

      const path = findPath(startPos, endPos, board);

      if (path) {
        // Move flower instantly
        let tempBoard = board.map(row => [...row]);
        const flowerType = tempBoard[startPos.r][startPos.c];
        tempBoard[startPos.r][startPos.c] = 0;
        tempBoard[endPos.r][endPos.c] = flowerType;

        setBoard(tempBoard);
        setSelected(null);
        setInvalidMove(null);
        setPathPreview(null);

        await new Promise(res => setTimeout(res, 100));

        await processMatches(tempBoard, false);

      } else {
        // Invalid move - show feedback
        setInvalidMove({ r: startPos.r, c: startPos.c });
        setTimeout(() => setInvalidMove(null), 500);
      }
      setIsProcessing(false);
    }
  }, [board, isProcessing, isGameOver, selected, processMatches]);

  // --- Game Reset ---
    const resetGame = useCallback(() => {
        const initialFlowers = Array.from({ length: FLOWERS_TO_SPAWN }, () => Math.ceil(Math.random() * FLOWER_TYPES));
        const newBoard = spawnFlowers(createEmptyBoard(), initialFlowers);
        setBoard(newBoard);
        generateNextFlowers();

        if (score > highScore) {
            setHighScore(score);
        }

        setScore(0);
        setSelected(null);
        setIsGameOver(false);
        setIsProcessing(false);
        setBurstingCells([]);
    }, [spawnFlowers, generateNextFlowers, score, highScore]); 

  // --- Render ---
  return (
    <div className="blooming-garden-container">
      {/* Animated Background Elements */}
      <div className="cloud cloud-1"></div>
      <div className="cloud cloud-2"></div>

      {/* Main Game Content */}
      <div className="game-content">
        {/* Top UI: Score, Reset */}
        <header className="blooming-garden-header">
            <button onClick={() => setIsInfoModalOpen(true)} className="garden-button info-button" aria-label="Game Information">
                <InfoIcon />
            </button>
            <div className="garden-score-box">
                {highScore > 0 && (
                    <div className="session-best">Best This Session: {highScore}</div>
                )}
                <div className="score-label">SCORE</div>
                <div className={`score-value ${scorePulse ? 'pulse' : ''}`}>{score}</div>
            </div>
            <button onClick={resetGame} className="garden-button" aria-label="Reset Game">
                <RefreshCw size={24} />
            </button>
        </header>

        {/* Game Board */}
        <div className="game-board-perspective-wrapper">
            <main className="garden-board" onMouseLeave={handleBoardLeave}>
                {board.map((row, r) =>
                    row.map((cellValue, c) => (
                        <div
                            className="garden-tile"
                            key={`${r}-${c}`}
                            onClick={() => handleTileClick(r, c)}
                            onMouseEnter={() => handleTileHover(r, c)}
                        >
                            {cellValue > 0 && (
                                <Flower
                                    type={cellValue}
                                    isSelected={selected && selected.r === r && selected.c === c}
                                    isBursting={burstingCells.some(cell => cell.r === r && cell.c === c)}
                                    isSpawning={spawningCells.some(cell => cell.r === r && cell.c === c)}
                                    isInvalid={invalidMove && invalidMove.r === r && invalidMove.c === c}
                                />
                            )}
                        </div>
                    ))
                )}

                {/* Path Preview SVG Overlay */}
                {pathPreview && pathPreview.length > 0 && (
                    <svg className="path-preview-overlay" viewBox="0 0 800 800" preserveAspectRatio="none">
                        <defs>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>
                        <polyline
                            points={pathPreview.map(p =>
                                `${(p.c + 0.5) * (800 / GRID_SIZE)},${(p.r + 0.5) * (800 / GRID_SIZE)}`
                            ).join(' ')}
                            className="path-line"
                            filter="url(#glow)"
                        />
                    </svg>
                )}

                {/* Floating Score Popups */}
                {floatingScores.map(fs => (
                    <div
                        key={fs.id}
                        className={`floating-score floating-score-${fs.matchLength >= 7 ? 'mega' : fs.matchLength >= 6 ? 'big' : 'normal'}`}
                        style={{
                            left: `${fs.x}%`,
                            top: `${fs.y}%`
                        }}
                    >
                        +{fs.value}
                    </div>
                ))}
            </main>
        </div>
        
        {/* Bottom UI: Next Flowers */}
        <footer className="blooming-garden-footer">
            <div className="next-flowers-box">
                <span>Next:</span>
                <div className="next-flowers-queue">
                    {nextFlowers.map((type, i) => (
                        <div key={i} className={`flower-preview flower-${type}`}>
                           <Flower type={type} />
                        </div>
                    ))}
                </div>
            </div>
        </footer>
      </div>

      {/* Combo Overlay */}
      {showCombo && comboCount >= 2 && (
          <div className="combo-overlay">
              <div className={`combo-text combo-${comboCount >= 6 ? '6' : comboCount >= 4 ? '4' : '2'}`}>
                  {comboCount}x COMBO!
              </div>
          </div>
      )}

      {/* Get Ready Overlay */}
      {showGetReady && (
          <div className="get-ready-overlay">
              <div className="get-ready-box">
                  <h2>Get Ready!</h2>
                  <div className="flower-icon">🌸</div>
              </div>
          </div>
      )}

      {/* Game Over Overlay */}
      {isGameOver && (
          <div className="game-over-overlay">
              <div className="game-over-box">
                  <h2>Garden Full!</h2>
                  <p>Final Score: <span className="final-score">{score}</span></p>
                  {highScore > 0 && (
                      <p style={{fontSize: '0.9rem', opacity: 0.7}}>Best This Session: {highScore}</p>
                  )}
                  <button onClick={resetGame}>Play Again</button>
              </div>
          </div>
      )}

      {/* Info Modal */}
      {isInfoModalOpen && (
          <div className="info-modal-overlay">
              <div className="info-modal-box">
                  <h2>How to Play</h2>
                  <p>
                      The goal is to clear flowers by lining up <strong>5 or more</strong> of the same type.
                  </p>
                  <ul>
                      <li>Select a flower to move.</li>
                      <li>Select an empty tile to move it to.</li>
                      <li>A path must be clear for the flower to move.</li>
                      <li>After each move, 3 new flowers will appear.</li>
                  </ul>
                  <h3>Flower Types</h3>
                  <div className="color-legend">
                      {Object.entries(FLOWER_COLORS).map(([type, name]) => (
                          <div key={type} className="color-legend-item">
                              <div className={`flower-preview flower-${type}`}>
                                  <Flower type={type} />
                              </div>
                              <span>{name}</span>
                          </div>
                      ))}
                  </div>
                  <button onClick={() => setIsInfoModalOpen(false)}>Got it!</button>
              </div>
          </div>
      )}
    </div>
  );
};

export default BloomingGarden;
