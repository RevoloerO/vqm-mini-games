import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './MouseStalker.css';

const MouseStalker = () => {
  const canvasRef = useRef(null);
  const mousePosition = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const segments = useRef([{ x: window.innerWidth / 2, y: window.innerHeight / 2, size: 8 }]);
  const fruits = useRef([]);
  // Use a ref for the animation frame to cancel it on unmount
  const animationFrameId = useRef(null); 

  // Game configuration
  const config = {
    numInitialSegments: 15,
    initialSize: 8,
    maxSize: 25,
    easeFactor: 0.15,
    fruitSize: 10,
    fruitSpawnRate: 3000, // ms
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let lastFruitSpawn = Date.now();

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Re-center mouse position on resize to prevent dragon from jumping
      mousePosition.current = { x: canvas.width / 2, y: canvas.height / 2 };
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize dragon body
    segments.current = Array.from({ length: config.numInitialSegments }, (_, i) => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      size: config.initialSize,
    }));

    const handleMouseMove = (e) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    const gameLoop = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- Update and Draw Dragon ---
      let leader = mousePosition.current;
      segments.current.forEach((segment, index) => {
        // Move segment towards its leader (mouse or segment in front)
        const dx = leader.x - segment.x;
        const dy = leader.y - segment.y;
        segment.x += dx * (config.easeFactor - (segments.current.length * 0.0001)); // Lag increases with length
        segment.y += dy * (config.easeFactor - (segments.current.length * 0.0001));

        // Draw segment
        const percent = (segments.current.length - index) / segments.current.length;
        const colorLightness = 50 + percent * 20;
        ctx.fillStyle = `hsl(130, 70%, ${colorLightness}%)`;
        
        ctx.beginPath();
        ctx.arc(segment.x, segment.y, segment.size, 0, Math.PI * 2);
        ctx.fill();

        // The current segment is the next one's leader
        leader = segment;
      });

      // Draw head details (eyes)
      const head = segments.current[0];
      const angle = Math.atan2(mousePosition.current.y - head.y, mousePosition.current.x - head.x);
      const eyeOffset = head.size * 0.3;
      const eyeX1 = head.x + Math.cos(angle + 0.8) * eyeOffset;
      const eyeY1 = head.y + Math.sin(angle + 0.8) * eyeOffset;
      const eyeX2 = head.x + Math.cos(angle - 0.8) * eyeOffset;
      const eyeY2 = head.y + Math.sin(angle - 0.8) * eyeOffset;
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(eyeX1, eyeY1, head.size * 0.1, 0, Math.PI * 2);
      ctx.arc(eyeX2, eyeY2, head.size * 0.1, 0, Math.PI * 2);
      ctx.fill();

      // --- Spawn and Draw Fruits ---
      if (Date.now() - lastFruitSpawn > config.fruitSpawnRate && fruits.current.length < 5) {
        fruits.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: config.fruitSize,
        });
        lastFruitSpawn = Date.now();
      }

      fruits.current.forEach((fruit, fruitIndex) => {
        // Draw fruit glow
        ctx.shadowColor = 'gold';
        ctx.shadowBlur = 20;
        
        // Draw fruit body
        ctx.fillStyle = 'gold';
        ctx.beginPath();
        ctx.arc(fruit.x, fruit.y, fruit.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Reset shadow
        ctx.shadowBlur = 0;
      });

      // --- Check Collisions ---
      const dragonHead = segments.current[0];
      fruits.current.forEach((fruit, fruitIndex) => {
        const dist = Math.hypot(dragonHead.x - fruit.x, dragonHead.y - fruit.y);
        if (dist < dragonHead.size + fruit.size) {
          // Eat fruit
          fruits.current.splice(fruitIndex, 1);

          // Grow longer
          const lastSegment = segments.current[segments.current.length - 1];
          segments.current.push({ ...lastSegment });

          // Grow plumper
          segments.current.forEach(seg => {
            if(seg.size < config.maxSize) {
                seg.size += 0.2;
            }
          });
        }
      });
      
      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    // Cleanup function
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="stalker-container">
      <canvas ref={canvasRef} className="stalker-canvas" />
      <div className="stalker-ui">
        <Link to="/vqm-mini-games" className="back-button">
          <ArrowLeft size={20} />
          <span>Back to Playground</span>
        </Link>
      </div>
    </div>
  );
};

export default MouseStalker;
