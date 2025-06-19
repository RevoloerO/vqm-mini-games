import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import './BloomingGarden.css';

// --- Game Constants ---
const GRID_SIZE = 9;
const FLOWERS_TO_MATCH = 5;
const FLOWERS_TO_SPAWN = 3;
const FLOWER_TYPES = 6;

// --- Helper Functions ---
const createEmptyBoard = () => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));

const findPath = (start, end, board) => {
  if (board[start.r][start.c] === 0 || board[end.r][end.c] !== 0) return null;
  const queue = [[start]];
  const visited = new Set([`${start.r}-${start.c}`]);

  while (queue.length > 0) {
    const path = queue.shift();
    const { r, c } = path[path.length - 1];
    if (r === end.r && c === end.c) return path;

    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dr, dc] of directions) {
      const newR = r + dr;
      const newC = c + dc;
      const key = `${newR}-${newC}`;
      if (newR >= 0 && newR < GRID_SIZE && newC >= 0 && newC < GRID_SIZE && !visited.has(key) && board[newR][newC] === 0) {
        visited.add(key);
        const newPath = [...path, { r: newR, c: newC }];
        queue.push(newPath);
      }
    }
  }
  return null;
};

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

// --- New Flower Component ---
const Flower = ({ type, isSelected, isBursting }) => {
    const classNames = `flower flower-${type} ${isSelected ? 'selected' : ''} ${isBursting ? 'burst' : ''}`;
    return <div className={classNames}><span></span></div>;
};

// --- Main Game Component ---
const BloomingGarden = () => {
  const [board, setBoard] = useState(createEmptyBoard);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [nextFlowers, setNextFlowers] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  
  // --- ADDED THIS USE EFFECT HOOK ---
  useEffect(() => {
    // Read the theme from localStorage and apply it to the document
    const savedTheme = localStorage.getItem('vqm-game-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []); // The empty array ensures this runs only once when the component loads

  const generateNextFlowers = useCallback(() => {
    const newNext = Array.from({ length: FLOWERS_TO_SPAWN }, () => Math.ceil(Math.random() * FLOWER_TYPES));
    setNextFlowers(newNext);
    return newNext;
  }, []);

  const spawnFlowers = useCallback((currentBoard, flowersToSpawn) => {
    const newBoard = currentBoard.map(row => [...row]);
    const emptyTiles = [];
    newBoard.forEach((row, r) => row.forEach((cell, c) => {
      if (cell === 0) emptyTiles.push({ r, c });
    }));

    if (emptyTiles.length <= flowersToSpawn.length) {
        setIsGameOver(true);
    }
    
    for (let i = 0; i < Math.min(flowersToSpawn.length, emptyTiles.length); i++) {
        const randomIndex = Math.floor(Math.random() * emptyTiles.length);
        const { r, c } = emptyTiles.splice(randomIndex, 1)[0];
        newBoard[r][c] = flowersToSpawn[i];
    }
    return newBoard;
  }, []);
  
  const processMatches = useCallback(async (boardWithMatches) => {
    setIsProcessing(true);
    const matches = checkForMatches(boardWithMatches);
    
    if (matches.length === 0) {
        setIsProcessing(false);
        return boardWithMatches;
    }

    setScore(s => s + matches.length * 10);
    
    let tempBoard = boardWithMatches.map(row => [...row]);
    matches.forEach(({r, c}) => tempBoard[r][c] = 'burst');
    setBoard(tempBoard);
    
    await new Promise(res => setTimeout(res, 500));

    let clearedBoard = boardWithMatches.map(row => [...row]);
    matches.forEach(({r, c}) => clearedBoard[r][c] = 0);
    setBoard(clearedBoard);
    
    return await processMatches(clearedBoard);
  }, []);
  
  const handleTileClick = useCallback(async (r, c) => {
    if (isProcessing || isGameOver) return;

    if (board[r][c] > 0) {
      setSelected({ r, c });
    } else if (selected) {
      setIsProcessing(true);
      const path = findPath(selected, { r, c }, board);
      
      if (path) {
        let newBoard = board.map(row => [...row]);
        newBoard[r][c] = newBoard[selected.r][selected.c];
        newBoard[selected.r][selected.c] = 0;
        setBoard(newBoard);
        setSelected(null);
        await new Promise(res => setTimeout(res, 300));
        
        const matches = checkForMatches(newBoard);

        if (matches.length > 0) {
            await processMatches(newBoard);
        } else {
            const spawnedBoard = spawnFlowers(newBoard, nextFlowers);
            setBoard(spawnedBoard);
            generateNextFlowers();
            await new Promise(res => setTimeout(res, 300));
            await processMatches(spawnedBoard);
        }
      }
      setIsProcessing(false);
    }
  }, [board, isProcessing, isGameOver, selected, spawnFlowers, generateNextFlowers, processMatches, nextFlowers]);
  
  const resetGame = useCallback(() => {
    const initialFlowers = generateNextFlowers();
    const newBoard = spawnFlowers(createEmptyBoard(), initialFlowers);
    setBoard(newBoard);
    generateNextFlowers();
    setScore(0);
    setSelected(null);
    setIsGameOver(false);
    setIsProcessing(false);
  }, [spawnFlowers, generateNextFlowers]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  return (
    <div className="blooming-garden-container">
      <div className="blooming-garden-ui top">
        <Link to="/vqm-mini-games" className="garden-back-button"><ArrowLeft size={16} /> Back</Link>
        <div className="garden-score-box">Score: <span>{score}</span></div>
        <button onClick={resetGame} className="garden-reset-button"><RefreshCw size={16} /></button>
      </div>

      <div className="garden-board-perspective">
        <div className="garden-board">
          {board.map((row, r) => (
            <div className="garden-row" key={r}>
              {row.map((cellValue, c) => (
                <div className="garden-tile" key={c} onClick={() => handleTileClick(r, c)}>
                  {cellValue !== 0 && (
                    <Flower
                      type={cellValue}
                      isSelected={selected && selected.r === r && selected.c === c}
                      isBursting={cellValue === 'burst'}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div className="blooming-garden-ui bottom">
          <div className="next-flowers-box">
              <span>Next:</span>
              <div className="next-flowers-queue">
                  {nextFlowers.map((type, i) => <div key={i} className={`flower-preview flower-${type}`} />)}
              </div>
          </div>
      </div>

      {isGameOver && (
          <div className="game-over-overlay">
              <div className="game-over-box">
                  <h2>Garden Overgrown!</h2>
                  <p>Final Score: {score}</p>
                  <button onClick={resetGame}>Play Again</button>
              </div>
          </div>
      )}
    </div>
  );
};

export default BloomingGarden;
