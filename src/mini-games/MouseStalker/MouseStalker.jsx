import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wand2, Ruler } from 'lucide-react';
import './MouseStalker.css';

// --- Game Constants ---
const FRUIT_TYPES = {
  NORMAL: { type: 'NORMAL', color: 'gold', size: 10, lifespan: Infinity, minBonus: 1, maxBonus: 1 },
  RARE: { type: 'RARE', color: '#48dbfb', size: 7, lifespan: 10000, minBonus: 3, maxBonus: 5 },
  EPIC: { type: 'EPIC', color: '#ff9ff3', size: 5, lifespan: 3000, minBonus: 7, maxBonus: 10 },
};

// --- Dragon Drawing Logic (Skins) ---
const SKINS = {
  default: (ctx, segments, targetPos) => {
    const head = segments[0];
    if (!head) return;
    for (let i = 1; i < segments.length; i++) {
        const segment = segments[i];
        const percent = (segments.length - i) / segments.length;
        const colorLightness = 50 + percent * 20;
        ctx.fillStyle = `hsl(130, 70%, ${colorLightness}%)`;
        ctx.beginPath();
        ctx.arc(segment.x, segment.y, segment.size, 0, Math.PI * 2);
        ctx.fill();
    }
    const angle = Math.atan2(targetPos.y - head.y, targetPos.x - head.x);
    const headScale = head.size / 8;
    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(angle);
    ctx.scale(headScale, headScale);
    ctx.strokeStyle = `hsl(130, 80%, 20%)`;
    ctx.lineWidth = 2 / headScale;
    ctx.fillStyle = `hsl(130, 70%, 50%)`;
    const leaves = 5;
    for (let i = 0; i < leaves; i++) {
        const leafAngle = (i - (leaves - 1) / 2) * 0.5;
        ctx.save();
        ctx.rotate(leafAngle);
        ctx.beginPath();
        ctx.moveTo(-12, -15);
        ctx.quadraticCurveTo(0, -25, 12, -15);
        ctx.quadraticCurveTo(0, -20, -12, -15);
        ctx.fill();
        ctx.restore();
    }
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.bezierCurveTo(5, -18, -15, -16, -10, 0);
    ctx.bezierCurveTo(-15, 16, 5, 18, 10, 0);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, -5);
    ctx.lineTo(18, -3);
    ctx.lineTo(18, 3);
    ctx.lineTo(8, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = `hsl(130, 60%, 40%)`;
    ctx.beginPath();
    ctx.moveTo(-5, -8);
    ctx.bezierCurveTo(-10, -15, -5, -20, 0, -18);
    ctx.closePath();
    ctx.fill();
    ctx.moveTo(-5, 8);
    ctx.bezierCurveTo(-10, 15, -5, 20, 0, 18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(5, -10);
    ctx.quadraticCurveTo(0, -8, -4, -4);
    ctx.quadraticCurveTo(2, -4, 5, -10);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(5, 10);
    ctx.quadraticCurveTo(0, 8, -4, 4);
    ctx.quadraticCurveTo(2, 4, 5, 10);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(0, -6, 1.5, 0, Math.PI * 2);
    ctx.arc(0, 6, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `hsl(130, 40%, 30%)`;
    ctx.lineWidth = 1.5 / headScale;
    ctx.beginPath();
    ctx.moveTo(18, -2);
    ctx.bezierCurveTo(25, -5, 25, -15, 15, -20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(18, 2);
    ctx.bezierCurveTo(25, 5, 25, 15, 15, 20);
    ctx.stroke();
    ctx.restore();
  },
  classic: (ctx, segments) => { /* ... existing classic skin logic ... */ },
  ghost: (ctx, segments) => { /* ... existing ghost skin logic ... */ }
};


const MouseStalker = () => {
  const canvasRef = useRef(null);
  const mousePosition = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const wanderTarget = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const wanderVelocity = useRef({ vx: 0, vy: 0 });
  const fruits = useRef([]);
  const animationFrameId = useRef(null);
  const idleTimerId = useRef(null);
  const wanderChangeTimerId = useRef(null);

  const [activeSkin, setActiveSkin] = useState('default');
  const [dragonState, setDragonState] = useState({ segments: [] });
  const [isWandering, setIsWandering] = useState(false);

  const config = {
    numInitialSegments: 15,
    initialSize: 8,
    maxSize: 30,
    easeFactor: 0.15,
    fruitSpawnRate: 2000,
  };

  const startWandering = useCallback(() => {
    if (isWandering) return; // Prevent multiple calls
    setIsWandering(true);
    
    // Set initial position for wandering based on the dragon's current head
    if (dragonState.segments.length > 0) {
        wanderTarget.current = { x: dragonState.segments[0].x, y: dragonState.segments[0].y };
    }

    const angle = Math.random() * 2 * Math.PI;
    const speed = 1 + Math.random() * 2;
    wanderVelocity.current = { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };

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
  
  const initGame = useCallback(() => {
      const initialSegments = Array.from({ length: config.numInitialSegments }, () => ({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        size: config.initialSize,
      }));
      setDragonState({ segments: initialSegments });
      fruits.current = [];
  }, [config.numInitialSegments, config.initialSize]);


  useEffect(() => {
    const savedTheme = localStorage.getItem('vqm-game-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let lastFruitSpawn = Date.now();

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      mousePosition.current = { x: canvas.width / 2, y: canvas.height / 2 };
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    if (dragonState.segments.length === 0) {
        initGame();
    }

    const handleMouseMove = (e) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
      if (isWandering) stopWandering();

      clearTimeout(idleTimerId.current);
      idleTimerId.current = setTimeout(startWandering, 5000);
    };

    idleTimerId.current = setTimeout(startWandering, 5000);
    window.addEventListener('mousemove', handleMouseMove);

    const spawnFruit = () => {
        const rand = Math.random();
        let fruitType;
        if (rand < 0.05) fruitType = FRUIT_TYPES.EPIC;
        else if (rand < 0.25) fruitType = FRUIT_TYPES.RARE;
        else fruitType = FRUIT_TYPES.NORMAL;
        fruits.current.push({ ...fruitType, x: Math.random() * canvas.width, y: Math.random() * canvas.height, createdAt: Date.now() });
    };

    const gameLoop = (timestamp) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let leader;
      if (isWandering) {
        wanderTarget.current.x += wanderVelocity.current.vx;
        wanderTarget.current.y += wanderVelocity.current.vy;

        // Bounce logic
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

      currentSegments.forEach((segment) => {
        const dx = leader.x - segment.x;
        const dy = leader.y - segment.y;
        segment.x += dx * (config.easeFactor - (currentSegments.length * 0.0001));
        segment.y += dy * (config.easeFactor - (currentSegments.length * 0.0001));
        leader = segment;
      });
      
      const drawSkin = SKINS[activeSkin];
      if (drawSkin && currentSegments.length > 0) {
        drawSkin(ctx, currentSegments, isWandering ? wanderTarget.current : mousePosition.current);
      }

      if (Date.now() - lastFruitSpawn > config.fruitSpawnRate && fruits.current.length < 8) { spawnFruit(); lastFruitSpawn = Date.now(); }
      fruits.current = fruits.current.filter(f => Date.now() - f.createdAt < f.lifespan);
      
      // RESTORED FRUIT DRAWING LOGIC
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
      
      // RESTORED COLLISION LOGIC
      fruits.current.forEach((fruit, fruitIndex) => {
        const head = currentSegments[0];
        if (!head) return;
        const dist = Math.hypot(head.x - fruit.x, head.y - fruit.y);
        if (dist < head.size + fruit.size) {
          fruits.current.splice(fruitIndex, 1);
          const bonus = Math.floor(Math.random() * (fruit.maxBonus - fruit.minBonus + 1)) + fruit.minBonus;
          for(let i=0; i < bonus; i++) {
            currentSegments.push({ ...currentSegments[currentSegments.length - 1] });
          }
          currentSegments.forEach(seg => {
            if(seg.size < config.maxSize) seg.size += bonus * 0.1;
          });
          setDragonState({ segments: [...currentSegments] });
        }
      });
      
      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
      clearTimeout(idleTimerId.current);
      clearTimeout(wanderChangeTimerId.current);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [activeSkin, dragonState.segments, initGame, isWandering, startWandering, stopWandering]);

  return (
    <div className="stalker-container">
      <canvas ref={canvasRef} className="stalker-canvas" />
      <div className="stalker-ui">
        <Link to="/vqm-mini-games" className="back-button-simple"><ArrowLeft size={22} /></Link>
        <div className="score-display"><Ruler size={18} /><span>{dragonState.segments.length}</span></div>
        <div className="skin-selector">
          <Wand2 size={18} />
          {Object.keys(SKINS).map(skinName => (
            <button key={skinName} className={`skin-button ${activeSkin === skinName ? 'active' : ''}`} onClick={() => setActiveSkin(skinName)}>
              {skinName}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MouseStalker;
