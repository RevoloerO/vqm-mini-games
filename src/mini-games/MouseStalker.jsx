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
  default: (ctx, segments, mousePos) => {
    // --- Heavily Reworked Asian Dragon Head Design ---
    const head = segments[0];
    if (!head) return;

    // Body Segments
    for (let i = 1; i < segments.length; i++) {
        const segment = segments[i];
        const percent = (segments.length - i) / segments.length;
        const colorLightness = 50 + percent * 20;
        ctx.fillStyle = `hsl(130, 70%, ${colorLightness}%)`;
        ctx.beginPath();
        ctx.arc(segment.x, segment.y, segment.size, 0, Math.PI * 2);
        ctx.fill();
    }

    const angle = Math.atan2(mousePos.y - head.y, mousePos.x - head.x);
    const headScale = head.size / 8; // Scale the entire head design

    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(angle);
    ctx.scale(headScale, headScale);

    // Set drawing styles
    ctx.strokeStyle = `hsl(130, 80%, 20%)`;
    ctx.lineWidth = 2 / headScale; // Keep line width consistent
    ctx.fillStyle = `hsl(130, 70%, 50%)`;

    // Leafy Mane
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
    
    // Main Head Shape
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.bezierCurveTo(5, -18, -15, -16, -10, 0);
    ctx.bezierCurveTo(-15, 16, 5, 18, 10, 0);
    ctx.fill();
    ctx.stroke();

    // Snout
    ctx.beginPath();
    ctx.moveTo(8, -5);
    ctx.lineTo(18, -3);
    ctx.lineTo(18, 3);
    ctx.lineTo(8, 5);
    ctx.fill();
    ctx.stroke();
    
    // Horns
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

    // Eyes
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

    // Pupils
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(0, -6, 1.5, 0, Math.PI * 2);
    ctx.arc(0, 6, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Whiskers
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
  classic: (ctx, segments) => {
    segments.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#f0f0f0' : '#a0a0a0';
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(segment.x, segment.y, segment.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  },
  ghost: (ctx, segments) => {
    segments.forEach((segment) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(segment.x, segment.y, segment.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }
};


const MouseStalker = () => {
  const canvasRef = useRef(null);
  const mousePosition = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const fruits = useRef([]);
  const animationFrameId = useRef(null); 
  const [activeSkin, setActiveSkin] = useState('default');
  
  const [dragonState, setDragonState] = useState({
    segments: [],
  });

  const config = {
    numInitialSegments: 15,
    initialSize: 8,
    maxSize: 30,
    easeFactor: 0.15,
    fruitSpawnRate: 2000,
  };
  
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
    };
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

      let leader = mousePosition.current;
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
        drawSkin(ctx, currentSegments, mousePosition.current);
      }

      if (Date.now() - lastFruitSpawn > config.fruitSpawnRate && fruits.current.length < 8) {
        spawnFruit();
        lastFruitSpawn = Date.now();
      }

      fruits.current = fruits.current.filter(fruit => Date.now() - fruit.createdAt < fruit.lifespan);

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
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [activeSkin, dragonState.segments, initGame]);

  return (
    <div className="stalker-container">
      <canvas ref={canvasRef} className="stalker-canvas" />
      <div className="stalker-ui">
        <Link to="/vqm-mini-games" className="back-button-simple">
          <ArrowLeft size={22} />
        </Link>
        <div className="score-display">
          <Ruler size={18} />
          <span>{dragonState.segments.length}</span>
        </div>
        <div className="skin-selector">
          <Wand2 size={18} />
          {Object.keys(SKINS).map(skinName => (
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
