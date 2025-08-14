import React, { useState, useEffect, useCallback } from 'react';
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
    1: 'Red',
    2: 'Yellow',
    3: 'Blue',
    4: 'Purple',
    5: 'Green',
    6: 'Orange'
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

// --- Flower Component ---
const Flower = ({ type, isSelected, isBursting, isSpawning }) => {
    const classNames = `flower flower-${type} ${isSelected ? 'selected' : ''} ${isBursting ? 'burst' : ''} ${isSpawning ? 'spawn' : ''}`;
    return (
        <div className={classNames}>
            <div className="flower-petal flower-petal-1"></div>
            <div className="flower-petal flower-petal-2"></div>
            <div className="flower-petal flower-petal-3"></div>
            <div className="flower-petal flower-petal-4"></div>
            <div className="flower-center"></div>
        </div>
    );
};


// --- Main Game Component ---
const BloomingGarden = () => {
  // --- State ---
  const [board, setBoard] = useState(createEmptyBoard);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => localStorage.getItem('bloomingGardenHighScore') || 0);
  const [nextFlowers, setNextFlowers] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [burstingCells, setBurstingCells] = useState([]);
  const [spawningCells, setSpawningCells] = useState([]);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);


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
        setTimeout(() => setSpawningCells([]), 500);

        return newBoard;
    }, []);

  // --- Match Processing ---
    const processMatches = useCallback(async (boardWithMatches, turnMade = false) => {
        const matches = checkForMatches(boardWithMatches);

        if (matches.length === 0) {
            if (!turnMade) {
                const spawnedBoard = spawnFlowers(boardWithMatches, nextFlowers);
                const newMatches = checkForMatches(spawnedBoard);
                setBoard(spawnedBoard);
                generateNextFlowers();
                if (newMatches.length > 0) {
                   await processMatches(spawnedBoard, true);
                }
            }
            return;
        }

        setScore(s => s + matches.length * 10 + (matches.length - FLOWERS_TO_MATCH) * 5);
        setBurstingCells(matches);

        await new Promise(res => setTimeout(res, 500));

        let clearedBoard = boardWithMatches.map(row => [...row]);
        matches.forEach(({ r, c }) => clearedBoard[r][c] = 0);
        
        setBoard(clearedBoard);
        setBurstingCells([]);

        // Recursive call to handle chain reactions
        await processMatches(clearedBoard, true);
    }, [nextFlowers, generateNextFlowers, spawnFlowers]);


  // --- Tile Click Handler ---
  const handleTileClick = useCallback(async (r, c) => {
    if (isProcessing || isGameOver) return;

    // If a flower is clicked
    if (board[r][c] > 0) {
      if (selected && selected.r === r && selected.c === c) {
        setSelected(null); // Deselect if clicking the same flower
      } else {
        setSelected({ r, c });
      }
    } else if (selected) { // If an empty tile is clicked and a flower is selected
      setIsProcessing(true);
      const startPos = selected;
      const endPos = { r, c };
      
      const path = findPath(startPos, endPos, board);

      if (path) {
        // Animate movement
        let tempBoard = board.map(row => [...row]);
        const flowerType = tempBoard[startPos.r][startPos.c];
        tempBoard[startPos.r][startPos.c] = 0;
        
        setBoard(tempBoard);
        await new Promise(res => setTimeout(res, 50)); 

        tempBoard[endPos.r][endPos.c] = flowerType;
        setBoard(tempBoard);
        setSelected(null);
        
        await new Promise(res => setTimeout(res, 200));
        
        await processMatches(tempBoard, false);

      } else {
         setSelected(null);
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
            localStorage.setItem('bloomingGardenHighScore', score);
        }

        setScore(0);
        setSelected(null);
        setIsGameOver(false);
        setIsProcessing(false);
        setBurstingCells([]);
    }, [spawnFlowers, generateNextFlowers, score, highScore]);

  // --- Initial Game Setup ---
  useEffect(() => {
    resetGame();
  }, []); 

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
                <div className="score-label">SCORE</div>
                <div className="score-value">{score}</div>
            </div>
            <button onClick={resetGame} className="garden-button" aria-label="Reset Game">
                <RefreshCw size={24} />
            </button>
        </header>

        {/* Game Board */}
        <div className="game-board-perspective-wrapper">
            <main className="garden-board">
                {board.map((row, r) =>
                    row.map((cellValue, c) => (
                        <div className="garden-tile" key={`${r}-${c}`} onClick={() => handleTileClick(r, c)}>
                            {cellValue > 0 && (
                                <Flower
                                    type={cellValue}
                                    isSelected={selected && selected.r === r && selected.c === c}
                                    isBursting={burstingCells.some(cell => cell.r === r && cell.c === c)}
                                    isSpawning={spawningCells.some(cell => cell.r === r && cell.c === c)}
                                />
                            )}
                        </div>
                    ))
                )}
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

      {/* Game Over Overlay */}
      {isGameOver && (
          <div className="game-over-overlay">
              <div className="game-over-box">
                  <h2>Garden Full!</h2>
                  <p>Final Score: <span className="final-score">{score}</span></p>
                  <p style={{fontSize: '0.9rem', opacity: 0.7}}>High Score: {highScore}</p>
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
                      The goal is to clear flowers by lining up <strong>5 or more</strong> of the same color.
                  </p>
                  <ul>
                      <li>Select a flower to move.</li>
                      <li>Select an empty tile to move it to.</li>
                      <li>A path must be clear for the flower to move.</li>
                      <li>After each move, 3 new flowers will appear.</li>
                  </ul>
                  <h3>Flower Colors</h3>
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
