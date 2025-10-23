import React, { useState, useCallback, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import './BloomingGarden.css';

// --- SVG Icons ---
const InfoIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
);

const UndoIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 7v6h6"></path>
        <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"></path>
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

// --- Power-Up Constants ---
const POWER_UP_TYPES = {
    BOMB: 100,
    RAINBOW: 101,
    LINE_HORIZONTAL: 102,
    LINE_VERTICAL: 103,
    MULTIPLIER: 104
};

const POWER_UP_SPAWN_CHANCE = 0.08; // 8% chance on regular spawn
const POWER_UP_POINTS_MILESTONE = 200; // Spawn power-up every 200 points
const POWER_UP_COUNTER_GUARANTEE = 50; // Guarantee power-up every 50 normal flowers

const POWER_UP_WEIGHTS = {
    [POWER_UP_TYPES.BOMB]: 0.30,
    [POWER_UP_TYPES.RAINBOW]: 0.25,
    [POWER_UP_TYPES.LINE_HORIZONTAL]: 0.125,
    [POWER_UP_TYPES.LINE_VERTICAL]: 0.125,
    [POWER_UP_TYPES.MULTIPLIER]: 0.20
};

// --- Milestone Constants ---
const MILESTONES = [100, 250, 500, 1000, 2000, 5000, 10000];


// --- Helper Functions ---
const createEmptyBoard = () => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));

// Check if a cell value is a power-up
const isPowerUp = (value) => value >= 100;

// Get random power-up type based on weighted probabilities
const getRandomPowerUp = () => {
    const rand = Math.random();
    let cumulative = 0;

    for (const [type, weight] of Object.entries(POWER_UP_WEIGHTS)) {
        cumulative += weight;
        if (rand <= cumulative) {
            return parseInt(type);
        }
    }
    return POWER_UP_TYPES.BOMB; // Fallback
};

// Get base flower type for power-ups (visual representation)
const getPowerUpBaseType = (powerUpType) => {
    // Cycle through flower types based on power-up type for visual variety
    const mapping = {
        [POWER_UP_TYPES.BOMB]: 1,
        [POWER_UP_TYPES.RAINBOW]: 3,
        [POWER_UP_TYPES.LINE_HORIZONTAL]: 5,
        [POWER_UP_TYPES.LINE_VERTICAL]: 5,
        [POWER_UP_TYPES.MULTIPLIER]: 2
    };
    return mapping[powerUpType] || 1;
};

// Pathfinding for flower movement (A* algorithm for better performance)
// Rainbow flowers don't block paths - they're treated as empty for pathfinding
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

            // Allow movement through empty tiles (Rainbow wildcards don't block)
            const cellValue = board[newR]?.[newC];
            const isPassable = cellValue === 0;

            if (newR >= 0 && newR < GRID_SIZE && newC >= 0 && newC < GRID_SIZE && isPassable && !closedSet.has(`${newR}-${newC}`)) {
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


// Get the base type of a flower (ignoring power-up status for matching)
const getFlowerBaseType = (value) => {
    if (value === 0) return 0;
    if (isPowerUp(value)) {
        // Power-ups match with their base flower type
        return getPowerUpBaseType(value);
    }
    return value;
};

// Check if two flowers can match (including Rainbow wildcard logic)
const canMatch = (type1, type2) => {
    if (type1 === 0 || type2 === 0) return false;
    if (type1 === POWER_UP_TYPES.RAINBOW || type2 === POWER_UP_TYPES.RAINBOW) return true;
    return getFlowerBaseType(type1) === getFlowerBaseType(type2);
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
                const line = [{r, c, type: flowerType}];
                const baseType = getFlowerBaseType(flowerType);

                for (let i = 1; i < GRID_SIZE; i++) {
                    const newR = r + i * dr;
                    const newC = c + i * dc;
                    if (newR >= 0 && newR < GRID_SIZE && newC >= 0 && newC < GRID_SIZE) {
                        const nextType = board[newR][newC];
                        // Match if same base type OR if either is a Rainbow
                        if (canMatch(flowerType, nextType) &&
                            (getFlowerBaseType(nextType) === baseType ||
                             nextType === POWER_UP_TYPES.RAINBOW ||
                             flowerType === POWER_UP_TYPES.RAINBOW)) {
                            line.push({ r: newR, c: newC, type: nextType });
                        } else {
                            break;
                        }
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
    const powerUpType = isPowerUp(type) ? type : null;
    const baseType = powerUpType ? getPowerUpBaseType(powerUpType) : type;
    const classNames = `flower flower-${baseType} ${powerUpType ? 'power-up' : ''} ${isSelected ? 'selected' : ''} ${isBursting ? 'burst' : ''} ${isSpawning ? 'spawn' : ''} ${isInvalid ? 'invalid' : ''}`;

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

    const shape = shapes[baseType] || shapes[1];

    // Power-up icon overlays
    const renderPowerUpIcon = () => {
        if (!powerUpType) return null;

        switch (powerUpType) {
            case POWER_UP_TYPES.BOMB:
                return (
                    <svg className="power-up-icon" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="14" r="6" fill="#2c3e50"/>
                        <path d="M12 5 L14 8 M18 8 L15 10 M19 5 C19 5 18 4 17 5" stroke="#e74c3c" strokeWidth="1.5" fill="none"/>
                        <circle cx="10" cy="12" r="1.5" fill="#fff" opacity="0.6"/>
                    </svg>
                );
            case POWER_UP_TYPES.RAINBOW:
                return (
                    <svg className="power-up-icon rainbow-icon" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="8" fill="url(#rainbow-gradient)"/>
                        <defs>
                            <linearGradient id="rainbow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#ff0080"/>
                                <stop offset="25%" stopColor="#ff8c00"/>
                                <stop offset="50%" stopColor="#ffd700"/>
                                <stop offset="75%" stopColor="#00ff00"/>
                                <stop offset="100%" stopColor="#00bfff"/>
                            </linearGradient>
                        </defs>
                    </svg>
                );
            case POWER_UP_TYPES.LINE_HORIZONTAL:
                return (
                    <svg className="power-up-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4 12 L20 12 M20 12 L17 9 M20 12 L17 15" stroke="#e67e22" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                    </svg>
                );
            case POWER_UP_TYPES.LINE_VERTICAL:
                return (
                    <svg className="power-up-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4 L12 20 M12 20 L9 17 M12 20 L15 17" stroke="#e67e22" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                    </svg>
                );
            case POWER_UP_TYPES.MULTIPLIER:
                return (
                    <svg className="power-up-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2 L14.5 9 L22 9.5 L16.5 14.5 L18.5 22 L12 18 L5.5 22 L7.5 14.5 L2 9.5 L9.5 9 Z" fill="#f39c12"/>
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className={classNames}>
            <svg viewBox={shape.viewBox} className="flower-svg">
                <defs>
                    <linearGradient id={`grad-${baseType}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" className="gradient-start" />
                        <stop offset="100%" className="gradient-end" />
                    </linearGradient>
                </defs>
                <path d={shape.path} fill={`url(#grad-${baseType})`} className="flower-shape" />
            </svg>
            {renderPowerUpIcon()}
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

  // --- Power-Up State ---
  const [normalFlowerCounter, setNormalFlowerCounter] = useState(0);
  const [lastPowerUpScore, setLastPowerUpScore] = useState(0);

  // --- Undo State ---
  const [undoHistory, setUndoHistory] = useState(null);
  const [undoAvailable, setUndoAvailable] = useState(false);
  const [showUndoFeedback, setShowUndoFeedback] = useState(false);

  // --- Milestone State ---
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState(0);
  const [milestonesReached, setMilestonesReached] = useState(0);
  const [showMilestoneCelebration, setShowMilestoneCelebration] = useState(false);
  const [celebrationMilestone, setCelebrationMilestone] = useState(0);


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
    const newNext = Array.from({ length: FLOWERS_TO_SPAWN }, () => {
      // Check if we should spawn a power-up
      const shouldSpawnPowerUp =
        Math.random() < POWER_UP_SPAWN_CHANCE ||
        normalFlowerCounter >= POWER_UP_COUNTER_GUARANTEE ||
        (score - lastPowerUpScore >= POWER_UP_POINTS_MILESTONE && score > 0);

      if (shouldSpawnPowerUp) {
        // Reset counters
        setNormalFlowerCounter(0);
        setLastPowerUpScore(score);
        return getRandomPowerUp();
      } else {
        setNormalFlowerCounter(c => c + 1);
        return Math.ceil(Math.random() * FLOWER_TYPES);
      }
    });
    setNextFlowers(newNext);
    return newNext;
  }, [normalFlowerCounter, score, lastPowerUpScore]);

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

  // --- Milestone Functions ---
  const getMilestoneProgress = useCallback(() => {
    if (currentMilestoneIndex >= MILESTONES.length) {
      // Max level reached
      return { percentage: 100, current: score, target: MILESTONES[MILESTONES.length - 1], isMaxLevel: true };
    }

    const previousMilestone = currentMilestoneIndex === 0 ? 0 : MILESTONES[currentMilestoneIndex - 1];
    const currentTarget = MILESTONES[currentMilestoneIndex];
    const progress = score - previousMilestone;
    const range = currentTarget - previousMilestone;
    const percentage = Math.min(100, (progress / range) * 100);

    return { percentage, current: score, target: currentTarget, isMaxLevel: false };
  }, [score, currentMilestoneIndex]);

  const checkMilestone = useCallback((newScore) => {
    if (currentMilestoneIndex >= MILESTONES.length) return;

    const currentTarget = MILESTONES[currentMilestoneIndex];

    if (newScore >= currentTarget) {
      // Milestone reached!
      setMilestonesReached(prev => prev + 1);
      setCelebrationMilestone(currentTarget);
      setShowMilestoneCelebration(true);

      // Move to next milestone
      setCurrentMilestoneIndex(prev => prev + 1);

      // Hide celebration after animation
      setTimeout(() => {
        setShowMilestoneCelebration(false);
      }, 2000);

      // Check if we hit multiple milestones (rare but possible with big combos)
      if (currentMilestoneIndex + 1 < MILESTONES.length && newScore >= MILESTONES[currentMilestoneIndex + 1]) {
        setTimeout(() => {
          checkMilestone(newScore);
        }, 2100);
      }
    }
  }, [currentMilestoneIndex]);

  // --- Undo Functions ---
  const saveUndoHistory = useCallback((currentBoard, currentScore, currentNextFlowers, selectedPosition) => {
    setUndoHistory({
      board: currentBoard.map(row => [...row]),
      score: currentScore,
      nextFlowers: [...currentNextFlowers],
      selected: selectedPosition ? { ...selectedPosition } : null,
      timestamp: Date.now()
    });
    setUndoAvailable(true);
  }, []);

  const executeUndo = useCallback(() => {
    if (!undoHistory || !undoAvailable || isProcessing) return;

    // Restore previous state
    setBoard(undoHistory.board.map(row => [...row]));
    setScore(undoHistory.score);
    setNextFlowers([...undoHistory.nextFlowers]);
    setSelected(null);
    setIsGameOver(false);

    // Mark undo as used
    setUndoAvailable(false);
    setUndoHistory(null);

    // Show feedback
    setShowUndoFeedback(true);
    setTimeout(() => setShowUndoFeedback(false), 500);
  }, [undoHistory, undoAvailable, isProcessing]);

  // --- Power-Up Activation Functions ---
  const activatePowerUps = useCallback((matches, boardState) => {
    let additionalTiles = [];
    let multiplierCount = 0;
    let activatedPowerUps = [];

    // First pass: Check for multipliers and collect power-ups
    matches.forEach(({ r, c }) => {
      const cellValue = boardState[r][c];
      if (cellValue === POWER_UP_TYPES.MULTIPLIER) {
        multiplierCount++;
        activatedPowerUps.push({ type: POWER_UP_TYPES.MULTIPLIER, r, c });
      } else if (isPowerUp(cellValue)) {
        activatedPowerUps.push({ type: cellValue, r, c });
      }
    });

    // Second pass: Activate special effects (Bomb, Line Clearer)
    activatedPowerUps.forEach(({ type, r, c }) => {
      switch (type) {
        case POWER_UP_TYPES.BOMB:
          // Clear 3x3 area
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const newR = r + dr;
              const newC = c + dc;
              if (newR >= 0 && newR < GRID_SIZE && newC >= 0 && newC < GRID_SIZE) {
                if (boardState[newR][newC] !== 0 && !matches.some(m => m.r === newR && m.c === newC)) {
                  additionalTiles.push({ r: newR, c: newC });
                }
              }
            }
          }
          break;

        case POWER_UP_TYPES.LINE_HORIZONTAL:
          // Clear entire row
          for (let col = 0; col < GRID_SIZE; col++) {
            if (boardState[r][col] !== 0 && !matches.some(m => m.r === r && m.c === col)) {
              additionalTiles.push({ r, c: col });
            }
          }
          break;

        case POWER_UP_TYPES.LINE_VERTICAL:
          // Clear entire column
          for (let row = 0; row < GRID_SIZE; row++) {
            if (boardState[row][c] !== 0 && !matches.some(m => m.r === row && m.c === c)) {
              additionalTiles.push({ r: row, c });
            }
          }
          break;

        case POWER_UP_TYPES.RAINBOW:
          // Rainbow is handled in match detection, no special activation
          break;

        default:
          break;
      }
    });

    // Remove duplicates from additional tiles
    const uniqueAdditional = additionalTiles.filter((tile, index, self) =>
      index === self.findIndex(t => t.r === tile.r && t.c === tile.c)
    );

    return {
      additionalTiles: uniqueAdditional,
      multiplier: Math.pow(2, multiplierCount) // 2^n for n multipliers
    };
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

        // Activate power-ups and get additional tiles + multiplier
        const powerUpResult = activatePowerUps(matches, boardWithMatches);
        const allClearedTiles = [...matches, ...powerUpResult.additionalTiles];

        // Calculate base points (including bonus tiles from power-ups)
        const basePoints = allClearedTiles.length * 10 + (matches.length - FLOWERS_TO_MATCH) * 5;

        // Apply combo multiplier (minimum 1x) and power-up multiplier
        const comboMultiplier = Math.max(1, newCombo);
        const finalMultiplier = comboMultiplier * powerUpResult.multiplier;
        const pointsEarned = Math.floor(basePoints * finalMultiplier);

        // Calculate center position of matched flowers
        const avgRow = allClearedTiles.reduce((sum, m) => sum + m.r, 0) / allClearedTiles.length;
        const avgCol = allClearedTiles.reduce((sum, m) => sum + m.c, 0) / allClearedTiles.length;

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

        // Update score and check for milestones
        const newScore = score + pointsEarned;
        setScore(newScore);
        checkMilestone(newScore);
        setBurstingCells(allClearedTiles);

        await new Promise(res => setTimeout(res, 250));

        let clearedBoard = boardWithMatches.map(row => [...row]);
        allClearedTiles.forEach(({ r, c }) => clearedBoard[r][c] = 0);

        setBoard(clearedBoard);
        setBurstingCells([]);

        // Recursive call to handle chain reactions
        await processMatches(clearedBoard, true, newCombo);
    }, [nextFlowers, generateNextFlowers, spawnFlowers, activatePowerUps, score, checkMilestone]);


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
        // Save undo history BEFORE making the move
        saveUndoHistory(board, score, nextFlowers, startPos);

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
  }, [board, isProcessing, isGameOver, selected, processMatches, saveUndoHistory, score, nextFlowers]);

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
        setNormalFlowerCounter(0);
        setLastPowerUpScore(0);
        setUndoHistory(null);
        setUndoAvailable(false);
        setCurrentMilestoneIndex(0);
        setMilestonesReached(0);
    }, [spawnFlowers, generateNextFlowers, score, highScore]); 

  // --- Render ---
  return (
    <div className="blooming-garden-container">
      {/* Back Button */}
      <Link to="/vqm-mini-games" className="back-button-simple">
        ← Back
      </Link>

      {/* Animated Background Elements */}
      <div className="cloud cloud-1"></div>
      <div className="cloud cloud-2"></div>

      {/* Main Game Content */}
      <div className="game-content">
        {/* Top UI: Score, Reset */}
        <header className="blooming-garden-header">
            <div className="header-left-buttons">
                <button onClick={() => setIsInfoModalOpen(true)} className="garden-button info-button" aria-label="Game Information">
                    <InfoIcon />
                </button>
                <button
                    onClick={executeUndo}
                    className={`garden-button undo-button ${!undoAvailable || isProcessing || isGameOver ? 'disabled' : ''}`}
                    disabled={!undoAvailable || isProcessing || isGameOver}
                    aria-label="Undo Last Move"
                    title={undoAvailable ? "Undo Last Move" : "No moves to undo"}
                >
                    <UndoIcon />
                </button>
            </div>
            <div className="garden-score-box">
                {highScore > 0 && (
                    <div className="session-best">Best: {highScore}</div>
                )}
                <div className="score-label">SCORE</div>
                <div className={`score-value ${scorePulse ? 'pulse' : ''}`}>{score}</div>

                {/* Progress Bar to Next Milestone - Inside Score Box */}
                {(() => {
                    const progress = getMilestoneProgress();
                    return (
                        <div className="milestone-progress-container">
                            <div className="milestone-labels">
                                <span className="progress-label">Progress</span>
                                <span className="milestone-target">
                                    {progress.isMaxLevel ? "MAX!" : `→ ${progress.target}`}
                                </span>
                            </div>
                            <div className="progress-bar-track">
                                <div
                                    className={`progress-bar-fill ${progress.isMaxLevel ? 'max-level' : ''} ${progress.percentage >= 90 ? 'near-complete' : ''}`}
                                    style={{ width: `${progress.percentage}%` }}
                                >
                                </div>
                            </div>
                        </div>
                    );
                })()}
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

      {/* Undo Feedback Overlay */}
      {showUndoFeedback && (
          <div className="undo-feedback-overlay">
              <div className="undo-feedback-text">
                  Move Undone
              </div>
          </div>
      )}

      {/* Milestone Celebration Overlay */}
      {showMilestoneCelebration && (
          <div className="milestone-celebration-overlay">
              <div className="milestone-celebration-content">
                  <div className="milestone-icon">🏆</div>
                  <div className="milestone-text">
                      <div className="milestone-reached-label">MILESTONE REACHED!</div>
                      <div className="milestone-value">{celebrationMilestone}</div>
                  </div>
                  <div className="milestone-confetti">
                      {Array.from({ length: 20 }).map((_, i) => (
                          <div key={i} className="confetti-piece" style={{
                              left: `${Math.random() * 100}%`,
                              animationDelay: `${Math.random() * 0.5}s`,
                              backgroundColor: ['#ff6b9d', '#ffd93d', '#74b9ff', '#a29bfe', '#55efc4', '#fdcb6e'][Math.floor(Math.random() * 6)]
                          }}></div>
                      ))}
                  </div>
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
                  {milestonesReached > 0 && (
                      <p style={{fontSize: '0.9rem', marginTop: '0.5rem'}}>
                          🏆 Milestones Reached: <strong>{milestonesReached}</strong>
                      </p>
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
                      <li><strong>Undo button</strong> lets you reverse your last move (one undo per turn).</li>
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

                  <h3>Power-Up Flowers</h3>
                  <p style={{fontSize: '0.9rem', marginTop: '0.5rem'}}>
                      Special flowers that spawn randomly with unique abilities!
                  </p>
                  <div className="power-up-legend">
                      <div className="power-up-legend-item">
                          <div className="flower-preview">
                              <Flower type={POWER_UP_TYPES.BOMB} />
                          </div>
                          <div className="power-up-info">
                              <strong>Bomb</strong>
                              <span>Explodes in 3x3 area</span>
                          </div>
                      </div>
                      <div className="power-up-legend-item">
                          <div className="flower-preview">
                              <Flower type={POWER_UP_TYPES.RAINBOW} />
                          </div>
                          <div className="power-up-info">
                              <strong>Rainbow</strong>
                              <span>Matches any color</span>
                          </div>
                      </div>
                      <div className="power-up-legend-item">
                          <div className="flower-preview">
                              <Flower type={POWER_UP_TYPES.LINE_HORIZONTAL} />
                          </div>
                          <div className="power-up-info">
                              <strong>Line Clear</strong>
                              <span>Clears entire row/column</span>
                          </div>
                      </div>
                      <div className="power-up-legend-item">
                          <div className="flower-preview">
                              <Flower type={POWER_UP_TYPES.MULTIPLIER} />
                          </div>
                          <div className="power-up-info">
                              <strong>Multiplier</strong>
                              <span>Doubles match points (stacks!)</span>
                          </div>
                      </div>
                  </div>

                  <button onClick={() => setIsInfoModalOpen(false)}>Got it!</button>
              </div>
          </div>
      )}
    </div>
  );
};

export default BloomingGarden;
