// useDragonGame.js: Custom React hook for the Mouse Stalker mini-game
// Manages game state efficiently using useRef for animations and useState for UI updates.
// UPDATED: Reworked audio manager and implemented unique, particle-based visual effects for each skin's click event.

import { useState, useRef, useEffect, useCallback } from 'react';
import { SKINS, FRUIT_TYPES, GAME_CONFIG } from './gameConfig';

// --- NEW: A simple audio manager to preload and play sounds ---
const audioManager = {
  clips: {},
  isInitialized: false,
  
  // Initialize and load all audio files once.
  init() {
    if (this.isInitialized) return;
    // NOTE: Using more reliable sound sources.
    this.clips = {
      'click_dragon': new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_7028c8052a.mp3'), // Radar ping
      'click_fire-wyrm': new Audio('https://cdn.pixabay.com/audio/2021/08/04/audio_a64e083984.mp3'), // Fire whoosh
      'click_nagini': new Audio('https://cdn.pixabay.com/audio/2022/03/23/audio_a8c98c09d3.mp3'), // Poison splash
      'click_snake': new Audio('https://cdn.pixabay.com/audio/2022/03/10/audio_a6822d2c1c.mp3'), // Water splash
      'click_ghost': new Audio('https://cdn.pixabay.com/audio/2022/01/18/audio_458b43350a.mp3'), // Electric discharge
      'eat_NORMAL': new Audio('https://actions.google.com/sounds/v1/switches/switch_on.ogg'),
      'eat_RARE': new Audio('https://actions.google.com/sounds/v1/magical/magic_chime.ogg'),
      'eat_EPIC': new Audio('https://actions.google.com/sounds/v1/magical/sparkle.ogg'),
      'eat_LEGENDARY': new Audio('https://actions.google.com/sounds/v1/magical/spell_cast_blast.ogg'),
      'milestone': new Audio('https://actions.google.com/sounds/v1/achievements/achievement_simple.ogg'),
      'victory': new Audio('https://actions.google.com/sounds/v1/achievements/achievement_fanfare.ogg'),
    };
    // Set a default volume for all clips.
    Object.values(this.clips).forEach(clip => clip.volume = 0.5);
    this.clips.victory.volume = 0.7;
    this.isInitialized = true;
  },

  // Play a sound by name.
  play(name) {
    if (this.clips[name]) {
      this.clips[name].currentTime = 0; // Rewind to start
      this.clips[name].play().catch(e => console.error(`Audio play failed for "${name}": ${e}`));
    }
  }
};


// --- Hook Definition ---
export const useDragonGame = () => {
  // --- Refs for Canvas and Game State ---
  const canvasRef = useRef(null);
  const segmentsRef = useRef([]);
  const scoreRef = useRef(0);
  const mousePosition = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const wanderTarget = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const wanderVelocity = useRef({ vx: 0, vy: 0 });
  const fruits = useRef([]);
  const particles = useRef([]);
  const dragonSpores = useRef([]);
  const ghostWisps = useRef([]);
  const naginiSparks = useRef([]);
  const clouds = useRef([]);
  const clickEffects = useRef([]); // NEW: Stores active click visual effects
  const animationFrameId = useRef(null);
  const idleTimerId = useRef(null);
  const wanderChangeTimerId = useRef(null);
  const announcedMilestones = useRef(new Set());

  // --- React State (for UI that needs to re-render) ---
  const [score, setScore] = useState(0);
  const [activeSkin, setActiveSkin] = useState('dragon');
  const [isWandering, setIsWandering] = useState(false);
  const [victoryAchieved, setVictoryAchieved] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  // --- Wandering Logic (unchanged) ---
  const startWandering = useCallback(() => {
    if (isWandering) return;
    setIsWandering(true);
    if (segmentsRef.current.length > 0) {
      wanderTarget.current = { x: segmentsRef.current[0].x, y: segmentsRef.current[0].y };
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
  }, [isWandering]);

  const stopWandering = useCallback(() => {
    setIsWandering(false);
    clearTimeout(wanderChangeTimerId.current);
  }, []);
  
  // --- Game Initialization ---
  const initGame = useCallback(() => {
    segmentsRef.current = Array.from({ length: GAME_CONFIG.numInitialSegments }, () => ({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      size: GAME_CONFIG.initialSize,
    }));
    scoreRef.current = segmentsRef.current.length;
    setScore(scoreRef.current);
    fruits.current = [];
    particles.current = [];
    dragonSpores.current = [];
    ghostWisps.current = [];
    naginiSparks.current = [];
    clickEffects.current = []; // NEW: Initialize click effects array
    const canvas = canvasRef.current;
    if (canvas) {
        clouds.current = Array.from({ length: 20 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: 60 + Math.random() * 120,
            speed: 0.05 + Math.random() * 0.1
        }));
    }
  }, []);

  // --- Tiered Particle Creation (unchanged) ---
  const createParticleBurst = (x, y, color, type) => {
    let numParticles = 30;
    let particleConfig = {};

    switch (type) {
        case 'NORMAL':
            numParticles = 20;
            particleConfig = { speedRange: 4, sizeRange: 2, decayRange: 0.01, friction: 0.98 };
            break;
        case 'RARE':
            numParticles = 50;
            particleConfig = { speedRange: 6, sizeRange: 3, decayRange: 0.015, friction: 0.97 };
            break;
        case 'EPIC':
            numParticles = 100;
            particleConfig = { speedRange: 8, sizeRange: 4, decayRange: 0.02, friction: 0.96 };
            break;
        case 'LEGENDARY':
            numParticles = 250;
            particleConfig = { speedRange: 12, sizeRange: 5, decayRange: 0.025, friction: 0.95 };
            break;
        case 'MILESTONE':
            numParticles = 300;
            particleConfig = { speedRange: 15, sizeRange: 6, decayRange: 0.015, friction: 0.96 };
            break;
        default:
             particleConfig = { speedRange: 4, sizeRange: 2, decayRange: 0.01, friction: 0.98 };
    }

    for (let i = 0; i < numParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * particleConfig.speedRange;
        let particleColor = color;
        
        if (type === 'LEGENDARY' || type === 'MILESTONE') {
            particleColor = `hsl(${Math.random() * 360}, 100%, 70%)`;
        }

        particles.current.push({
            x, y,
            vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            color: particleColor,
            size: 2 + Math.random() * particleConfig.sizeRange,
            alpha: 1,
            decay: 0.015 + Math.random() * particleConfig.decayRange,
            friction: particleConfig.friction
        });
    }
  };

  // --- Main Effect: Handles Game Loop, Events, and Rendering ---
  useEffect(() => {
    // --- NEW: Initialize Audio Manager on component mount ---
    audioManager.init();

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

    if (segmentsRef.current.length === 0) {
      initGame();
    }

    const handlePointerMove = (e) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
      if (isWandering) {
        stopWandering();
      }
      clearTimeout(idleTimerId.current);
      idleTimerId.current = setTimeout(startWandering, 5000);
    };

    // --- NEW: Click handler for visual and sound effects ---
    const handlePointerDown = (e) => {
        const effect = {
            x: e.clientX,
            y: e.clientY,
            skin: activeSkin,
            createdAt: Date.now(),
            duration: (activeSkin === 'fire-wyrm' || activeSkin === 'nagini' || activeSkin === 'ghost') ? 1200 : 800,
            particles: [],
            angle: 0,
        };

        // --- Generate particles based on skin type ---
        switch (activeSkin) {
            case 'fire-wyrm': { // Dragon blow fire
                const head = segmentsRef.current[0] || { x: e.clientX - 1, y: e.clientY };
                effect.angle = Math.atan2(e.clientY - head.y, e.clientX - head.x);
                for (let i = 0; i < 60; i++) {
                    const angle = (Math.random() - 0.5) * 0.8; // Cone shape
                    const speed = 5 + Math.random() * 10;
                    effect.particles.push({
                        x: 0, y: 0,
                        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                        size: 2 + Math.random() * 4,
                        alpha: 1,
                        decay: 0.01 + Math.random() * 0.01, // Slower decay
                        hue: 10 + Math.random() * 40
                    });
                }
                break;
            }
            case 'nagini': { // Poison / Venom
                for (let i = 0; i < 40; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 1 + Math.random() * 4;
                    effect.particles.push({
                        x: (Math.random() - 0.5) * 10, y: (Math.random() - 0.5) * 10,
                        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                        gravity: 0.1,
                        size: 3 + Math.random() * 5,
                        alpha: 1,
                        decay: 0.01 + Math.random() * 0.005, // Slower decay
                        hue: 100 + Math.random() * 40
                    });
                }
                break;
            }
            case 'ghost': { // Discharge / Voltage release
                for (let i = 0; i < 5; i++) { // 5 main bolts
                    const bolt = { points: [{x:0, y:0}], angle: Math.random() * Math.PI * 2, alpha: 1 };
                    let lastX = 0, lastY = 0;
                    const len = 40 + Math.random() * 40;
                    for (let j = 0; j < 10; j++) {
                        lastX += Math.cos(bolt.angle) * (len/10) + (Math.random() - 0.5) * 20;
                        lastY += Math.sin(bolt.angle) * (len/10) + (Math.random() - 0.5) * 20;
                        bolt.points.push({ x: lastX, y: lastY });
                    }
                    effect.particles.push(bolt);
                }
                break;
            }
            // Dragon and Snake effects are handled directly in the draw loop
        }

        clickEffects.current.push(effect);
        audioManager.play(`click_${activeSkin}`);
        handlePointerMove(e);
    };

    idleTimerId.current = setTimeout(startWandering, 5000);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);

    const spawnFruit = () => {
      const rand = Math.random();
      let fruitType;
      if (rand < 0.01) fruitType = FRUIT_TYPES.LEGENDARY;
      else if (rand < 0.05) fruitType = FRUIT_TYPES.EPIC;
      else if (rand < 0.25) fruitType = FRUIT_TYPES.RARE;
      else fruitType = FRUIT_TYPES.NORMAL;
      fruits.current.push({ ...fruitType, x: Math.random() * canvas.width, y: Math.random() * canvas.height, createdAt: Date.now() });
    };

    const gameLoop = (timestamp) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- 1. Draw Dynamic Background (unchanged) ---
      clouds.current.forEach(cloud => {
          cloud.x += cloud.speed;
          if (isWandering) {
              cloud.x += wanderVelocity.current.vx * 0.05;
              cloud.y += wanderVelocity.current.vy * 0.05;
          }
          if (cloud.x - cloud.size > canvas.width) cloud.x = -cloud.size;
          if (cloud.x + cloud.size < 0) cloud.x = canvas.width + cloud.size;
          if (cloud.y - cloud.size > canvas.height) cloud.y = -cloud.size;
          if (cloud.y + cloud.size < 0) cloud.y = canvas.height + cloud.size;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
          ctx.beginPath();
          ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
          ctx.fill();
      });

      // --- 2. Update and Draw Dragon (unchanged) ---
      let leader = isWandering ? wanderTarget.current : mousePosition.current;
      if (isWandering) {
        wanderTarget.current.x += wanderVelocity.current.vx;
        wanderTarget.current.y += wanderVelocity.current.vy;
        if (wanderTarget.current.x < 0 || wanderTarget.current.x > canvas.width) wanderVelocity.current.vx *= -1;
        if (wanderTarget.current.y < 0 || wanderTarget.current.y > canvas.height) wanderVelocity.current.vy *= -1;
      }
      const currentSegments = segmentsRef.current;
      currentSegments.forEach((segment) => {
        const dx = leader.x - segment.x;
        const dy = leader.y - segment.y;
        segment.x += dx * (GAME_CONFIG.easeFactor - (currentSegments.length * 0.0001));
        segment.y += dy * (GAME_CONFIG.easeFactor - (currentSegments.length * 0.0001));
        leader = segment;
      });
      const drawSkin = SKINS[activeSkin];
      if (drawSkin && currentSegments.length > 0) {
        drawSkin(ctx, currentSegments, isWandering ? wanderTarget.current : mousePosition.current, timestamp, isWandering);
      }

      // --- 3. Update and Draw Fruits (unchanged) ---
      if (Date.now() - lastFruitSpawn > GAME_CONFIG.fruitSpawnRate && fruits.current.length < 8) {
        spawnFruit();
        lastFruitSpawn = Date.now();
      }
      fruits.current = fruits.current.filter(f => Date.now() - f.createdAt < f.lifespan);
      fruits.current.forEach((fruit) => {
        ctx.shadowBlur = 0;
        if (fruit.type === 'LEGENDARY') {
            const pulse = Math.abs(Math.sin(timestamp / 200)) * 5;
            const grad = ctx.createRadialGradient(fruit.x, fruit.y, 0, fruit.x, fruit.y, fruit.size + pulse);
            grad.addColorStop(0, 'white');
            grad.addColorStop(0.7, `hsl(${timestamp / 20 % 360}, 100%, 80%)`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(fruit.x, fruit.y, fruit.size + pulse, 0, Math.PI * 2);
            ctx.fill();
        } else {
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
        }
      });
      
      // --- 4. Handle Fruit Collision (with new sound effects) ---
      fruits.current.forEach((fruit, fruitIndex) => {
        const head = currentSegments[0];
        if (!head) return;
        const dist = Math.hypot(head.x - fruit.x, head.y - fruit.y);
        if (dist < head.size + fruit.size) {
          createParticleBurst(fruit.x, fruit.y, fruit.color, fruit.type);
          audioManager.play(`eat_${fruit.type}`);
          fruits.current.splice(fruitIndex, 1);
          const bonus = Math.floor(Math.random() * (fruit.maxBonus - fruit.minBonus + 1)) + fruit.minBonus;
          for (let i = 0; i < bonus; i++) {
            currentSegments.push({ ...currentSegments[currentSegments.length - 1] });
          }
          const oldScore = scoreRef.current;
          scoreRef.current = currentSegments.length;
          setScore(scoreRef.current);
          const currentScore = scoreRef.current;
          if (oldScore < 500) {
            let growthFactor = (currentScore < 100) ? 0.1 : (currentScore < 250) ? 0.05 : 0.02;
            currentSegments.forEach(seg => {
              if (seg.size < GAME_CONFIG.maxSize) {
                  seg.size = Math.min(GAME_CONFIG.maxSize, seg.size + bonus * growthFactor);
              }
            });
          }
          const milestones = { 100: 'MILESTONE_1', 250: 'MILESTONE_2', 500: 'VICTORY' };
          for (const [milestoneScore, key] of Object.entries(milestones)) {
              if (currentScore >= milestoneScore && !announcedMilestones.current.has(key)) {
                  announcedMilestones.current.add(key);
                  createParticleBurst(head.x, head.y, 'white', 'MILESTONE');
                  if (key === 'VICTORY') {
                      setVictoryAchieved(true);
                      setShowVictoryModal(true);
                      audioManager.play('victory');
                  } else {
                      audioManager.play('milestone');
                  }
              }
          }
        }
      });

      // --- 5. Update and Draw Particle Systems (unchanged) ---
      particles.current = particles.current.filter(p => p.alpha > 0);
      particles.current.forEach(p => {
          p.x += p.vx; p.y += p.vy; p.alpha -= p.decay;
          p.vx *= p.friction; p.vy *= p.friction;
          ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      });
      if (activeSkin === 'dragon' && segmentsRef.current.length > 0) {
        if (timestamp % 150 < 16.6) {
            const tail = segmentsRef.current[segmentsRef.current.length - 1];
            dragonSpores.current.push({
                x: tail.x, y: tail.y,
                vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5 - 0.2,
                alpha: 1, size: 1 + Math.random() * 2, decay: 0.01 + Math.random() * 0.01
            });
        }
      }
      dragonSpores.current = dragonSpores.current.filter(s => s.alpha > 0);
      dragonSpores.current.forEach(spore => {
          spore.x += spore.vx; spore.y += spore.vy; spore.alpha -= spore.decay;
          ctx.globalAlpha = spore.alpha;
          ctx.fillStyle = `hsl(85, 100%, ${70 + spore.alpha * 30}%)`;
          ctx.beginPath(); ctx.arc(spore.x, spore.y, spore.size, 0, Math.PI * 2); ctx.fill();
      });
      if (activeSkin === 'ghost' && segmentsRef.current.length > 0) {
          const head = segmentsRef.current[0];
          if (timestamp % 100 < 16.6) {
              ghostWisps.current.push({
                  x: head.x, y: head.y,
                  vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
                  alpha: 0.8, size: 1 + Math.random() * 2.5,
                  decay: 0.02 + Math.random() * 0.02,
                  color: `hsl(270, 100%, ${85 + Math.random() * 15}%)`
              });
          }
      }
      ghostWisps.current = ghostWisps.current.filter(w => w.alpha > 0);
      ghostWisps.current.forEach(wisp => {
          wisp.x += wisp.vx; wisp.y += wisp.vy; wisp.alpha -= wisp.decay;
          ctx.globalAlpha = wisp.alpha;
          ctx.fillStyle = wisp.color;
          ctx.beginPath(); ctx.arc(wisp.x, wisp.y, wisp.size, 0, Math.PI * 2); ctx.fill();
      });
      if (activeSkin === 'nagini' && segmentsRef.current.length > 0 && !isWandering) {
        const head = segmentsRef.current[0];
        const timeInCycle = timestamp % 2500;
        if (timeInCycle > 100 && timeInCycle < 250) {
          if (Math.random() > 0.4) {
            const angle = Math.atan2(mousePosition.current.y - head.y, mousePosition.current.x - head.x);
            const tongueTipLength = head.size * 2.8;
            const sparkX = head.x + Math.cos(angle) * tongueTipLength;
            const sparkY = head.y + Math.sin(angle) * tongueTipLength;
            naginiSparks.current.push({
              x: sparkX, y: sparkY,
              vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3,
              alpha: 1, size: 1 + Math.random() * 2,
              decay: 0.04 + Math.random() * 0.02,
              color: `hsl(175, 100%, ${70 + Math.random() * 30}%)`
            });
          }
        }
      }
      naginiSparks.current = naginiSparks.current.filter(s => s.alpha > 0);
      naginiSparks.current.forEach(spark => {
          spark.x += spark.vx; spark.y += spark.vy; spark.alpha -= spark.decay;
          ctx.globalAlpha = spark.alpha;
          ctx.strokeStyle = spark.color;
          ctx.lineWidth = spark.size;
          ctx.beginPath();
          ctx.moveTo(spark.x, spark.y);
          ctx.lineTo(spark.x - spark.vx * 2, spark.y - spark.vy * 2);
          ctx.stroke();
      });


      // --- NEW: 6. Draw Click Visual Effects ---
      clickEffects.current = clickEffects.current.filter(effect => {
          const age = Date.now() - effect.createdAt;
          return age < effect.duration;
      });
      
      clickEffects.current.forEach(effect => {
          ctx.save();
          ctx.translate(effect.x, effect.y);
          const age = Date.now() - effect.createdAt;
          const progress = age / effect.duration;

          switch (effect.skin) {
              case 'dragon': { // Radar Scan
                  const alpha = Math.sin(progress * Math.PI);
                  ctx.globalAlpha = alpha;
                  for(let i=1; i<=3; i++){
                    const radius = (progress * 100 + i*30) % 120;
                    ctx.strokeStyle = `hsla(130, 80%, 70%, ${alpha * (1 - radius/120)})`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(0, 0, radius, 0, Math.PI * 2);
                    ctx.stroke();
                  }
                  const sweepAngle = progress * Math.PI * 4;
                  ctx.rotate(sweepAngle);
                  const grad = ctx.createLinearGradient(0, 0, 120, 0);
                  grad.addColorStop(0, `hsla(130, 80%, 70%, ${alpha * 0.5})`);
                  grad.addColorStop(1, `hsla(130, 80%, 70%, 0)`);
                  ctx.strokeStyle = grad;
                  ctx.beginPath();
                  ctx.moveTo(0,0);
                  ctx.lineTo(120, 0);
                  ctx.stroke();
                  break;
              }
              case 'fire-wyrm': { // Fire Breath
                  ctx.rotate(effect.angle);
                  effect.particles.forEach(p => {
                      if (p.alpha > 0) {
                          p.alpha -= p.decay;
                          p.x += p.vx;
                          p.y += p.vy;
                          ctx.globalAlpha = p.alpha;
                          ctx.fillStyle = `hsl(${p.hue}, 100%, ${60 + p.alpha * 40}%)`;
                          ctx.beginPath();
                          ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2);
                          ctx.fill();
                      }
                  });
                  break;
              }
              case 'nagini': { // Venom Splash
                  effect.particles.forEach(p => {
                      if (p.alpha > 0) {
                          p.alpha -= p.decay;
                          p.vx *= 0.98;
                          p.vy *= 0.98;
                          p.vy += p.gravity;
                          p.x += p.vx;
                          p.y += p.vy;
                          ctx.globalAlpha = p.alpha;
                          ctx.fillStyle = `hsl(${p.hue}, 80%, 60%)`;
                          ctx.beginPath();
                          ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2);
                          ctx.fill();
                      }
                  });
                  break;
              }
              case 'ghost': { // Electric Discharge
                  effect.particles.forEach(p => {
                      p.alpha -= 0.05;
                      if(p.alpha < 0) p.alpha = 0;
                      ctx.strokeStyle = `hsla(180, 100%, 85%, ${p.alpha * (0.5 + Math.random() * 0.5)})`;
                      ctx.lineWidth = 1 + Math.random() * 2;
                      ctx.shadowColor = 'cyan';
                      ctx.shadowBlur = 15;
                      ctx.beginPath();
                      ctx.moveTo(p.points[0].x, p.points[0].y);
                      for(let i=1; i < p.points.length; i++) {
                          ctx.lineTo(p.points[i].x, p.points[i].y);
                      }
                      ctx.stroke();
                  });
                  break;
              }
              case 'snake': { // Water Splash
                  const alpha = Math.sin(progress * Math.PI);
                  const radius = progress * 50;
                  ctx.globalAlpha = alpha;
                  ctx.strokeStyle = `hsla(182, 65%, 60%, ${alpha})`;
                  ctx.lineWidth = 3 * (1 - progress);
                  ctx.beginPath();
                  ctx.arc(0, 0, radius, 0, Math.PI * 2);
                  ctx.stroke();
                  break;
              }
          }
          ctx.restore();
      });

      ctx.globalAlpha = 1; // Reset global alpha
      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);

    // Cleanup function
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', resizeCanvas);
      clearTimeout(idleTimerId.current);
      clearTimeout(wanderChangeTimerId.current);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [activeSkin, initGame, isWandering, startWandering, stopWandering]);

  // Return state and setters for the component to use
  return { canvasRef, score, activeSkin, setActiveSkin, victoryAchieved, showVictoryModal, setShowVictoryModal, announcedMilestones: announcedMilestones.current };
};
