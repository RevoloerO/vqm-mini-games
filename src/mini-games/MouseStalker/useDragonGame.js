// useDragonGame: Custom React hook for the Mouse Stalker mini-game
// Manages dragon state, movement, wandering, fruit spawning, and rendering

import { useState, useRef, useEffect, useCallback } from 'react';
import { SKINS, FRUIT_TYPES, GAME_CONFIG } from './gameConfig';

// --- Hook Definition ---
export const useDragonGame = () => {
  // --- Refs for Canvas and Game State ---
  const canvasRef = useRef(null);
  const mousePosition = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const wanderTarget = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const wanderVelocity = useRef({ vx: 0, vy: 0 });
  const fruits = useRef([]);
  const animationFrameId = useRef(null);
  const idleTimerId = useRef(null);
  const wanderChangeTimerId = useRef(null);

  // --- React State ---
  const [activeSkin, setActiveSkin] = useState('default');
  const [dragonState, setDragonState] = useState({ segments: [] });
  const [isWandering, setIsWandering] = useState(false);

  // --- Wandering Logic ---
  const startWandering = useCallback(() => {
    if (isWandering) return;
    setIsWandering(true);

    // Set wander target to dragon head if available
    if (dragonState.segments.length > 0) {
      wanderTarget.current = { x: dragonState.segments[0].x, y: dragonState.segments[0].y };
    }

    // Randomize wander direction and speed
    const angle = Math.random() * 2 * Math.PI;
    const speed = 1 + Math.random() * 2;
    wanderVelocity.current = { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };

    // Periodically change wander direction
    const changeCourse = () => {
      const angleChange = (Math.random() - 0.5) * 1.5;
      const currentAngle = Math.atan2(wanderVelocity.current.vy, wanderVelocity.current.vx);
      const newAngle = currentAngle + angleChange;
      const speed = 1 + Math.random() * 2;
      wanderVelocity.current = { vx: Math.cos(newAngle) * speed, vy: Math.sin(newAngle) * speed };
      const nextChangeDelay = 3000 + Math.random() * 3000;
      wanderChangeTimerId.current = setTimeout(changeCourse, nextChangeDelay);
    };
    changeCourse();
  }, [dragonState.segments, isWandering]);

  const stopWandering = useCallback(() => {
    setIsWandering(false);
    clearTimeout(wanderChangeTimerId.current);
  }, []);

  // --- Game Initialization ---
  const initGame = useCallback(() => {
    const initialSegments = Array.from({ length: GAME_CONFIG.numInitialSegments }, () => ({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      size: GAME_CONFIG.initialSize,
    }));
    setDragonState({ segments: initialSegments });
    fruits.current = [];
  }, []);

  // --- Main Effect: Handles Game Loop, Events, and Rendering ---
  useEffect(() => {
    // Set theme from localStorage
    const savedTheme = localStorage.getItem('vqm-game-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let lastFruitSpawn = Date.now();

    // Resize canvas to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      mousePosition.current = { x: canvas.width / 2, y: canvas.height / 2 };
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize dragon if not present
    if (dragonState.segments.length === 0) {
      initGame();
    }

    // Mouse movement: update position and reset idle timer
    const handleMouseMove = (e) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
      if (isWandering) stopWandering();

      clearTimeout(idleTimerId.current);
      idleTimerId.current = setTimeout(startWandering, 5000);
    };

    // Start idle timer for wandering
    idleTimerId.current = setTimeout(startWandering, 5000);
    window.addEventListener('mousemove', handleMouseMove);

    // Fruit spawning logic
    const spawnFruit = () => {
      const rand = Math.random();
      let fruitType;
      if (rand < 0.05) fruitType = FRUIT_TYPES.EPIC;
      else if (rand < 0.25) fruitType = FRUIT_TYPES.RARE;
      else fruitType = FRUIT_TYPES.NORMAL;
      fruits.current.push({ ...fruitType, x: Math.random() * canvas.width, y: Math.random() * canvas.height, createdAt: Date.now() });
    };

    // --- Main Game Loop ---
    const gameLoop = (timestamp) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Determine leader (mouse or wander target)
      let leader;
      if (isWandering) {
        wanderTarget.current.x += wanderVelocity.current.vx;
        wanderTarget.current.y += wanderVelocity.current.vy;

        // Bounce off canvas edges
        if (wanderTarget.current.x < 0 || wanderTarget.current.x > canvas.width) {
          wanderVelocity.current.vx *= -1 * (0.9 + Math.random() * 0.2);
        }
        if (wanderTarget.current.y < 0 || wanderTarget.current.y > canvas.height) {
          wanderVelocity.current.vy *= -1 * (0.9 + Math.random() * 0.2);
        }
        leader = wanderTarget.current;
      } else {
        leader = mousePosition.current;
      }

      const currentSegments = dragonState.segments;

      // Move each dragon segment towards the leader
      currentSegments.forEach((segment) => {
        const dx = leader.x - segment.x;
        const dy = leader.y - segment.y;
        segment.x += dx * (GAME_CONFIG.easeFactor - (currentSegments.length * 0.0001));
        segment.y += dy * (GAME_CONFIG.easeFactor - (currentSegments.length * 0.0001));
        leader = segment;
      });

      // Draw dragon using the active skin
      const drawSkin = SKINS[activeSkin];
      if (drawSkin && currentSegments.length > 0) {
        drawSkin(ctx, currentSegments, isWandering ? wanderTarget.current : mousePosition.current);
      }

      // Spawn fruits periodically, limit to 8
      if (Date.now() - lastFruitSpawn > GAME_CONFIG.fruitSpawnRate && fruits.current.length < 8) {
        spawnFruit();
        lastFruitSpawn = Date.now();
      }
      fruits.current = fruits.current.filter(f => Date.now() - f.createdAt < f.lifespan);

      // Draw fruits with effects
      fruits.current.forEach((fruit) => {
        if (fruit.type === 'EPIC') {
          const lifePercent = (Date.now() - fruit.createdAt) / 1000;
          const rippleRadius = fruit.size + (lifePercent * 15) % 20;
          const rippleOpacity = 1 - ((rippleRadius - fruit.size) / 20);
          ctx.strokeStyle = `rgba(255, 159, 243, ${rippleOpacity * 0.7})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(fruit.x, fruit.y, rippleRadius, 0, Math.PI * 2);
          ctx.stroke();
          if (Math.floor(timestamp / 200) % 2) return;
        } else if (fruit.type === 'RARE') {
          ctx.shadowBlur = 15 + (Math.abs(Math.sin(timestamp / 300)) * 10);
          ctx.shadowColor = fruit.color;
        } else {
          ctx.shadowBlur = 15;
          ctx.shadowColor = fruit.color;
        }
        ctx.fillStyle = fruit.color;
        ctx.beginPath();
        ctx.arc(fruit.x, fruit.y, fruit.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Check for fruit collision with dragon head
      fruits.current.forEach((fruit, fruitIndex) => {
        const head = currentSegments[0];
        if (!head) return;
        const dist = Math.hypot(head.x - fruit.x, head.y - fruit.y);
        if (dist < head.size + fruit.size) {
          fruits.current.splice(fruitIndex, 1);
          const bonus = Math.floor(Math.random() * (fruit.maxBonus - fruit.minBonus + 1)) + fruit.minBonus;
          
          // Add new segments for score
          for (let i = 0; i < bonus; i++) {
            currentSegments.push({ ...currentSegments[currentSegments.length - 1] });
          }

          // Determine growth factor based on score (length)
          const score = currentSegments.length;
          let growthFactor;
          if (score < 500) {
            growthFactor = 0.1;
          } else if (score < 1000) {
            growthFactor = 0.05; // Slower growth after 500
          } else {
            growthFactor = 0.02; // Even slower growth after 1000
          }

          // Apply growth to each segment
          currentSegments.forEach(seg => {
            if (seg.size < GAME_CONFIG.maxSize) {
                // Ensure size doesn't exceed maxSize
                seg.size = Math.min(GAME_CONFIG.maxSize, seg.size + bonus * growthFactor);
            }
          });
          
          setDragonState({ segments: [...currentSegments] });
        }
      });

      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);

    // --- Cleanup ---
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
      clearTimeout(idleTimerId.current);
      clearTimeout(wanderChangeTimerId.current);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [activeSkin, dragonState.segments, initGame, isWandering, startWandering, stopWandering]);

  // --- Expose API ---
  return { canvasRef, dragonState, activeSkin, setActiveSkin };
};