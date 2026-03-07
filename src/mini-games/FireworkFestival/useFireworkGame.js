import { useRef, useState, useCallback, useEffect } from 'react';
import {
  COLORS, COLOR_ORDER, SHAPES, SHAPE_ORDER,
  LEVELS, CANNON_CONFIG, FIREWORK_CONFIG, STAR_CONFIG,
  GAME_PHASES, QUEST_TYPES, CROWD_CONFIG, SCORE_CONFIG,
} from './gameConfig';

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */
let _uid = 0;
const uid = () => ++_uid;

const rand = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

/* ────────────────────────────────────────────
   Shape drawing helpers (for explosions + UI)
   ──────────────────────────────────────────── */
export function getShapePoints(shape, count) {
  const points = [];
  switch (shape) {
    case 'circle':
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + rand(-0.15, 0.15);
        const r = rand(0.85, 1.15);
        points.push({ angle, r });
      }
      break;
    case 'square': {
      const perSide = Math.floor(count / 4);
      const sides = [
        { sx: -1, sy: -1, dx: 2, dy: 0 },
        { sx: 1, sy: -1, dx: 0, dy: 2 },
        { sx: 1, sy: 1, dx: -2, dy: 0 },
        { sx: -1, sy: 1, dx: 0, dy: -2 },
      ];
      for (const side of sides) {
        for (let i = 0; i < perSide; i++) {
          const t = i / perSide + rand(-0.02, 0.02);
          const x = side.sx + side.dx * t;
          const y = side.sy + side.dy * t;
          const angle = Math.atan2(y, x);
          const r = Math.sqrt(x * x + y * y) * rand(0.85, 1.1);
          points.push({ angle, r });
        }
      }
      // fill remaining with random edge points
      while (points.length < count) {
        const side = pick(sides);
        const t = Math.random();
        const x = side.sx + side.dx * t;
        const y = side.sy + side.dy * t;
        points.push({ angle: Math.atan2(y, x), r: Math.sqrt(x * x + y * y) * rand(0.9, 1.05) });
      }
      break;
    }
    case 'triangle': {
      const vertices = [
        { x: 0, y: -1.2 },
        { x: -1.1, y: 0.9 },
        { x: 1.1, y: 0.9 },
      ];
      const perEdge = Math.floor(count / 3);
      for (let e = 0; e < 3; e++) {
        const a = vertices[e];
        const b = vertices[(e + 1) % 3];
        for (let i = 0; i < perEdge; i++) {
          const t = i / perEdge + rand(-0.02, 0.02);
          const x = a.x + (b.x - a.x) * t;
          const y = a.y + (b.y - a.y) * t;
          const angle = Math.atan2(y, x);
          const r = Math.sqrt(x * x + y * y) * rand(0.85, 1.1);
          points.push({ angle, r });
        }
      }
      while (points.length < count) {
        const e = randInt(0, 2);
        const a = vertices[e];
        const b = vertices[(e + 1) % 3];
        const t = Math.random();
        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t;
        points.push({ angle: Math.atan2(y, x), r: Math.sqrt(x * x + y * y) * rand(0.9, 1.05) });
      }
      break;
    }
    default:
      for (let i = 0; i < count; i++) {
        points.push({ angle: (Math.PI * 2 * i) / count, r: rand(0.85, 1.15) });
      }
  }
  return points;
}

/* ────────────────────────────────────────────
   Draw a small shape icon on canvas
   ──────────────────────────────────────────── */
export function drawShapeIcon(ctx, shape, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  switch (shape) {
    case 'circle':
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'square':
      ctx.rect(x - size, y - size, size * 2, size * 2);
      ctx.fill();
      break;
    case 'triangle':
      ctx.moveTo(x, y - size * 1.15);
      ctx.lineTo(x - size, y + size * 0.75);
      ctx.lineTo(x + size, y + size * 0.75);
      ctx.closePath();
      ctx.fill();
      break;
    default:
      break;
  }
}

/* ════════════════════════════════════════════
   Main Hook
   ════════════════════════════════════════════ */
export function useFireworkGame() {
  /* ── Canvas ref ────────────────────────── */
  const canvasRef = useRef(null);
  const animIdRef = useRef(null);
  const frameRef = useRef(0);

  /* ── Refs (perf-critical state) ────────── */
  const starsRef = useRef([]);
  const cannonsRef = useRef([]);
  const fireworksRef = useRef([]);
  const currentQuestRef = useRef(null);
  const celebrationRef = useRef([]);
  const crowdEmojiRef = useRef([]);
  const shakeRef = useRef({ active: false, intensity: 0, timer: 0 });
  const timerRef = useRef({ start: 0, limit: 0, remaining: 0, running: false });
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const questsDoneRef = useRef(0);
  const levelIdxRef = useRef(0);
  const phaseRef = useRef(GAME_PHASES.MENU);
  const sequenceIdxRef = useRef(0);
  const questStartTimeRef = useRef(0);

  /* ── State (UI re-renders) ─────────────── */
  const [gamePhase, setGamePhase] = useState(GAME_PHASES.MENU);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [questsCompleted, setQuestsCompleted] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentQuest, setCurrentQuest] = useState(null);
  const [cannonSelections, setCannonSelections] = useState([]);
  const [lastMatchResult, setLastMatchResult] = useState(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [crowdMood, setCrowdMood] = useState('neutral');
  const [levelSummary, setLevelSummary] = useState(null);
  const [unlockedColor, setUnlockedColor] = useState(null);
  const [unlockedCannon, setUnlockedCannon] = useState(false);
  const [chillMode, setChillMode] = useState(false);
  const chillModeRef = useRef(false);
  const [quickMatch, setQuickMatch] = useState(null);       // 'quick' flash or null
  const [questStartTime, setQuestStartTime] = useState(0);  // for UI bonus timer ring
  const [levelIntro, setLevelIntro] = useState(null);        // {title, newMechanic} shown briefly

  /* ── Stars ─────────────────────────────── */
  const initStars = useCallback((W, H) => {
    starsRef.current = Array.from({ length: STAR_CONFIG.count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H * 0.75,
      size: rand(STAR_CONFIG.minSize, STAR_CONFIG.maxSize),
      phase: Math.random() * Math.PI * 2,
      speed: rand(STAR_CONFIG.twinkleSpeed * 0.5, STAR_CONFIG.twinkleSpeed * 1.5),
    }));
  }, []);

  /* ── Quest generation ──────────────────── */
  const generateQuest = useCallback((levelCfg) => {
    const { availableColors, availableShapes, dualQuests, dualQuestChance,
            sequenceQuests, sequenceQuestChance, sequenceLength, cannonCount } = levelCfg;

    const now = performance.now();
    questStartTimeRef.current = now;
    setQuestStartTime(now);

    // Sequence quest
    if (sequenceQuests && Math.random() < (sequenceQuestChance || 0)) {
      const len = sequenceLength || 3;
      const requirements = Array.from({ length: len }, () => ({
        color: pick(availableColors),
        shape: pick(availableShapes),
        cannonId: null,
      }));
      const quest = {
        type: QUEST_TYPES.SEQUENCE,
        requirements,
        matched: requirements.map(() => false),
        sequenceIndex: 0,
      };
      currentQuestRef.current = quest;
      sequenceIdxRef.current = 0;
      setCurrentQuest({ ...quest });
      return quest;
    }

    // Dual quest
    if (dualQuests && cannonCount >= 2 && Math.random() < dualQuestChance) {
      const requirements = [
        { color: pick(availableColors), shape: pick(availableShapes), cannonId: 0 },
        { color: pick(availableColors), shape: pick(availableShapes), cannonId: 1 },
      ];
      const quest = {
        type: QUEST_TYPES.DUAL,
        requirements,
        matched: [false, false],
      };
      currentQuestRef.current = quest;
      setCurrentQuest({ ...quest });
      return quest;
    }

    // Single quest
    const quest = {
      type: QUEST_TYPES.SINGLE,
      requirements: [{ color: pick(availableColors), shape: pick(availableShapes), cannonId: null }],
      matched: [false],
    };
    currentQuestRef.current = quest;
    setCurrentQuest({ ...quest });
    return quest;
  }, []);

  /* ── Level init ────────────────────────── */
  const initLevel = useCallback((levelIndex) => {
    const cfg = LEVELS[levelIndex];
    if (!cfg) return;

    levelIdxRef.current = levelIndex;
    setCurrentLevel(levelIndex);

    // Check if unlocking a new color compared to previous level
    if (levelIndex > 0) {
      const prevColors = LEVELS[levelIndex - 1].availableColors;
      const newColor = cfg.availableColors.find(c => !prevColors.includes(c));
      if (newColor) {
        setUnlockedColor(newColor);
        setTimeout(() => setUnlockedColor(null), 2500);
      } else {
        setUnlockedColor(null);
      }

      // Check if unlocking second cannon
      if (LEVELS[levelIndex - 1].cannonCount < cfg.cannonCount) {
        setUnlockedCannon(true);
        setTimeout(() => setUnlockedCannon(false), 2500);
      } else {
        setUnlockedCannon(false);
      }
    } else {
      setUnlockedColor(null);
      setUnlockedCannon(false);
    }

    const canvas = canvasRef.current;
    const W = canvas ? canvas.width : window.innerWidth;
    const H = canvas ? canvas.height : window.innerHeight;

    // Create cannons
    const centerX = W / 2;
    const baseY = H - CANNON_CONFIG.baseYOffset;
    const cannons = [];
    if (cfg.cannonCount === 1) {
      cannons.push({
        id: 0, x: centerX, y: baseY,
        selectedColor: cfg.availableColors[0],
        selectedShape: cfg.availableShapes[0],
      });
    } else {
      const half = CANNON_CONFIG.spacing / 2;
      cannons.push({
        id: 0, x: centerX - half, y: baseY,
        selectedColor: cfg.availableColors[0],
        selectedShape: cfg.availableShapes[0],
      });
      cannons.push({
        id: 1, x: centerX + half, y: baseY,
        selectedColor: cfg.availableColors[1 % cfg.availableColors.length],
        selectedShape: cfg.availableShapes[1 % cfg.availableShapes.length],
      });
    }
    cannonsRef.current = cannons;
    setCannonSelections(cannons.map(c => ({ id: c.id, color: c.selectedColor, shape: c.selectedShape })));

    // Reset state
    fireworksRef.current = [];
    celebrationRef.current = [];
    crowdEmojiRef.current = [];
    shakeRef.current = { active: false, intensity: 0, timer: 0 };
    scoreRef.current = 0;
    comboRef.current = 0;
    questsDoneRef.current = 0;
    sequenceIdxRef.current = 0;
    setScore(0);
    setQuestsCompleted(0);
    setLastMatchResult(null);
    setCrowdMood('neutral');
    setLevelSummary(null);

    // Timer — disabled in chill mode
    if (chillModeRef.current) {
      timerRef.current = { start: 0, limit: Infinity, remaining: Infinity, running: false };
      setTimeRemaining(Infinity);
    } else {
      timerRef.current = { start: performance.now(), limit: cfg.timeLimit, remaining: cfg.timeLimit, running: true };
      setTimeRemaining(cfg.timeLimit);
    }

    // Show level intro briefly
    if (cfg.title) {
      setLevelIntro({ title: cfg.title, level: cfg.level, newMechanic: cfg.newMechanic });
      setTimeout(() => setLevelIntro(null), 2200);
    }

    // Generate first quest
    generateQuest(cfg);

    phaseRef.current = GAME_PHASES.PLAYING;
    setGamePhase(GAME_PHASES.PLAYING);
  }, [generateQuest]);

  /* ── Cannon selection handlers ─────────── */
  const selectColor = useCallback((cannonId, colorKey) => {
    const cannon = cannonsRef.current.find(c => c.id === cannonId);
    if (cannon) {
      cannon.selectedColor = colorKey;
      setCannonSelections(cannonsRef.current.map(c => ({ id: c.id, color: c.selectedColor, shape: c.selectedShape })));
    }
  }, []);

  const selectShape = useCallback((cannonId, shapeKey) => {
    const cannon = cannonsRef.current.find(c => c.id === cannonId);
    if (cannon) {
      cannon.selectedShape = shapeKey;
      setCannonSelections(cannonsRef.current.map(c => ({ id: c.id, color: c.selectedColor, shape: c.selectedShape })));
    }
  }, []);

  /* ── Spawn celebration particles ───────── */
  const spawnCelebration = useCallback((x, y, colorHex, count = 40) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + rand(-0.2, 0.2);
      const speed = rand(2, 6);
      celebrationRef.current.push({
        id: uid(), x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - rand(1, 3),
        life: rand(40, 70),
        maxLife: 70,
        size: rand(2, 5),
        color: colorHex,
      });
    }
  }, []);

  /* ── Spawn crowd emojis ────────────────── */
  const spawnCrowdEmojis = useCallback((mood) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const emojis = mood === 'cheer' ? CROWD_CONFIG.cheerEmojis : CROWD_CONFIG.booEmojis;
    const count = mood === 'cheer'
      ? CROWD_CONFIG.emojiCount + Math.min(comboRef.current, 8)
      : Math.ceil(CROWD_CONFIG.emojiCount / 2);
    for (let i = 0; i < count; i++) {
      crowdEmojiRef.current.push({
        id: uid(),
        x: rand(40, canvas.width - 40),
        y: canvas.height - rand(10, 60),
        vy: -CROWD_CONFIG.emojiRiseSpeed * rand(0.8, 1.5),
        emoji: pick(emojis),
        life: CROWD_CONFIG.emojiLife,
        maxLife: CROWD_CONFIG.emojiLife,
        size: rand(18, 30),
      });
    }
  }, []);

  /* ── Fire cannon ───────────────────────── */
  const fireCannon = useCallback((cannonId) => {
    if (phaseRef.current !== GAME_PHASES.PLAYING) return;
    // Prevent firing if this cannon already has a firework in flight
    const inFlight = fireworksRef.current.some(
      fw => fw.cannonId === cannonId && fw.phase !== 'done'
    );
    if (inFlight) return;

    const cannon = cannonsRef.current.find(c => c.id === cannonId);
    if (!cannon) return;

    const fw = {
      id: uid(),
      cannonId,
      x: cannon.x,
      y: cannon.y - CANNON_CONFIG.barrelLength,
      vx: 0,
      vy: -FIREWORK_CONFIG.launchSpeed,
      color: cannon.selectedColor,
      shape: cannon.selectedShape,
      phase: 'launching',
      trail: [],
      explosionParticles: [],
      explosionAge: 0,
      checked: false,
    };
    fireworksRef.current.push(fw);
  }, []);

  /* ── Check match ───────────────────────── */
  const checkMatch = useCallback((firework) => {
    const quest = currentQuestRef.current;
    if (!quest) return;
    const levelCfg = LEVELS[levelIdxRef.current];

    let matched = false;

    if (quest.type === QUEST_TYPES.SINGLE) {
      const req = quest.requirements[0];
      if (firework.color === req.color && firework.shape === req.shape) {
        quest.matched[0] = true;
        matched = true;
      }
    } else if (quest.type === QUEST_TYPES.DUAL) {
      const reqIdx = quest.requirements.findIndex(
        (req, i) => !quest.matched[i] && req.cannonId === firework.cannonId &&
                     req.color === firework.color && req.shape === firework.shape
      );
      if (reqIdx >= 0) {
        quest.matched[reqIdx] = true;
        // Dual quest complete only when both matched
        matched = quest.matched.every(Boolean);
        if (!matched) {
          // Partial match — celebrate lightly but don't advance quest
          spawnCelebration(firework.x, firework.y, COLORS[firework.color].hex, 15);
          setCurrentQuest({ ...quest });
          return;
        }
      }
    } else if (quest.type === QUEST_TYPES.SEQUENCE) {
      const idx = sequenceIdxRef.current;
      const req = quest.requirements[idx];
      if (firework.color === req.color && firework.shape === req.shape) {
        quest.matched[idx] = true;
        sequenceIdxRef.current = idx + 1;
        if (idx + 1 < quest.requirements.length) {
          // Partial sequence match
          spawnCelebration(firework.x, firework.y, COLORS[firework.color].hex, 15);
          setCurrentQuest({ ...quest, sequenceIndex: idx + 1 });
          return;
        }
        matched = true;
      } else {
        // Sequence broken — reset sequence
        quest.matched = quest.matched.map(() => false);
        sequenceIdxRef.current = 0;
        setCurrentQuest({ ...quest, sequenceIndex: 0 });
      }
    }

    if (matched) {
      comboRef.current += 1;
      const comboBonus = SCORE_CONFIG.comboBonus * (comboRef.current - 1);
      let pts = Math.floor((SCORE_CONFIG.basePoints + comboBonus) * levelCfg.scoreMultiplier);

      // Quick-match bonus — award extra points if matched within bonus window
      const questBonus = levelCfg.questTimeBonus || 0;
      let isQuickMatch = false;
      if (questBonus > 0 && !chillModeRef.current) {
        const elapsed = (performance.now() - questStartTimeRef.current) / 1000;
        if (elapsed <= questBonus) {
          pts += Math.floor(SCORE_CONFIG.quickMatchBonus * levelCfg.scoreMultiplier);
          isQuickMatch = true;
        }
      }
      if (isQuickMatch) {
        setQuickMatch('quick');
        setTimeout(() => setQuickMatch(null), 800);
      }

      scoreRef.current += pts;
      questsDoneRef.current += 1;

      setScore(scoreRef.current);
      setQuestsCompleted(questsDoneRef.current);
      setLastMatchResult('correct');

      // Celebration
      spawnCelebration(firework.x, firework.y, COLORS[firework.color].hex, 50);
      spawnCrowdEmojis('cheer');
      setCrowdMood('cheer');

      // Clear result after a beat
      setTimeout(() => {
        setLastMatchResult(null);
        setCrowdMood('neutral');
      }, CROWD_CONFIG.cheerDuration);

      // Check level completion
      if (questsDoneRef.current >= levelCfg.questCount) {
        // Level complete!
        timerRef.current.running = false;
        const isChill = chillModeRef.current;
        const timeBonus = isChill ? 0 : Math.floor(timerRef.current.remaining * SCORE_CONFIG.timeBonus);
        scoreRef.current += timeBonus;
        setScore(scoreRef.current);

        const summary = {
          level: levelCfg.level,
          questsCompleted: questsDoneRef.current,
          totalQuests: levelCfg.questCount,
          timeRemaining: isChill ? 0 : Math.ceil(timerRef.current.remaining),
          timeBonus,
          score: scoreRef.current,
          chillMode: isChill,
        };
        setLevelSummary(summary);

        if (levelIdxRef.current >= LEVELS.length - 1) {
          phaseRef.current = GAME_PHASES.GAME_COMPLETE;
          setGamePhase(GAME_PHASES.GAME_COMPLETE);
        } else {
          phaseRef.current = GAME_PHASES.LEVEL_COMPLETE;
          setGamePhase(GAME_PHASES.LEVEL_COMPLETE);
        }
      } else {
        // Next quest
        generateQuest(levelCfg);
      }
    } else {
      // Wrong match
      comboRef.current = 0;
      setLastMatchResult('wrong');
      shakeRef.current = { active: true, intensity: 6, timer: 15 };
      spawnCrowdEmojis('boo');
      setCrowdMood('boo');

      setTimeout(() => {
        setLastMatchResult(null);
        setCrowdMood('neutral');
      }, CROWD_CONFIG.booDuration);
    }
  }, [generateQuest, spawnCelebration, spawnCrowdEmojis]);

  /* ── Drawing helpers ───────────────────── */
  const drawStar = (ctx, star, frame) => {
    const alpha = STAR_CONFIG.minAlpha +
      (STAR_CONFIG.maxAlpha - STAR_CONFIG.minAlpha) *
      (0.5 + 0.5 * Math.sin(star.phase + frame * star.speed));
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,240,${alpha})`;
    ctx.fill();
  };

  const drawCannonOnCanvas = (ctx, cannon, levelCfg) => {
    const { x, y } = cannon;
    const { width, height, barrelLength, barrelWidth } = CANNON_CONFIG;
    const colorHex = COLORS[cannon.selectedColor]?.hex || '#fff';
    const glowColor = COLORS[cannon.selectedColor]?.glow || 'rgba(255,255,255,0.5)';

    // Glow behind cannon
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = glowColor;

    // Barrel (straight up)
    ctx.fillStyle = '#555';
    ctx.fillRect(x - barrelWidth / 2, y - barrelLength, barrelWidth, barrelLength);

    // Barrel tip ring
    ctx.fillStyle = colorHex;
    ctx.fillRect(x - barrelWidth / 2 - 2, y - barrelLength - 4, barrelWidth + 4, 6);

    // Base body
    const grad = ctx.createLinearGradient(x - width / 2, y, x + width / 2, y);
    grad.addColorStop(0, '#444');
    grad.addColorStop(0.5, '#666');
    grad.addColorStop(1, '#444');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x - width / 2, y);
    ctx.lineTo(x - width / 2 + 6, y - height / 2);
    ctx.lineTo(x + width / 2 - 6, y - height / 2);
    ctx.lineTo(x + width / 2, y);
    ctx.closePath();
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(x - width / 2 + 6, y + 2, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + width / 2 - 6, y + 2, 8, 0, Math.PI * 2);
    ctx.fill();

    // Color indicator dot on body
    ctx.fillStyle = colorHex;
    ctx.beginPath();
    ctx.arc(x, y - height / 4, 7, 0, Math.PI * 2);
    ctx.fill();

    // Shape indicator on body
    drawShapeIcon(ctx, cannon.selectedShape, x, y - height / 4 + 20, 5, '#ddd');

    ctx.restore();

    // Cannon label
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    if (levelCfg.cannonCount > 1) {
      ctx.fillText(cannon.id === 0 ? 'L' : 'R', x, y + 22);
    }
  };

  /* ── Main render loop ──────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars(canvas.width, canvas.height);
      // Reposition cannons
      const cfg = LEVELS[levelIdxRef.current];
      if (!cfg) return;
      const centerX = canvas.width / 2;
      const baseY = canvas.height - CANNON_CONFIG.baseYOffset;
      cannonsRef.current.forEach((c, i) => {
        if (cfg.cannonCount === 1) {
          c.x = centerX;
        } else {
          c.x = centerX + (i === 0 ? -CANNON_CONFIG.spacing / 2 : CANNON_CONFIG.spacing / 2);
        }
        c.y = baseY;
      });
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = () => {
      const W = canvas.width;
      const H = canvas.height;
      const frame = frameRef.current++;
      const phase = phaseRef.current;
      const levelCfg = LEVELS[levelIdxRef.current] || LEVELS[0];

      // ─ Screen shake offset
      let sx = 0, sy = 0;
      if (shakeRef.current.active) {
        const s = shakeRef.current;
        sx = (Math.random() - 0.5) * s.intensity * 2;
        sy = (Math.random() - 0.5) * s.intensity * 2;
        s.timer--;
        if (s.timer <= 0) s.active = false;
      }

      ctx.save();
      ctx.translate(sx, sy);

      // ─ Background
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#050510');
      bg.addColorStop(0.6, '#0a0a2e');
      bg.addColorStop(1, '#12122a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Ground/horizon line
      ctx.fillStyle = '#0f0f20';
      ctx.fillRect(0, H - 30, W, 30);

      // ─ Stars
      starsRef.current.forEach(s => drawStar(ctx, s, frame));

      // ─ Update & draw fireworks
      fireworksRef.current.forEach(fw => {
        if (fw.phase === 'launching') {
          // Move upward
          fw.vy += FIREWORK_CONFIG.launchDeceleration;
          fw.y += fw.vy;
          fw.x += fw.vx;

          // Trail particles
          for (let i = 0; i < FIREWORK_CONFIG.trailParticlesPerFrame; i++) {
            fw.trail.push({
              x: fw.x + rand(-3, 3),
              y: fw.y + rand(0, 8),
              vx: rand(-0.5, 0.5),
              vy: rand(0.5, 2),
              life: FIREWORK_CONFIG.trailParticleLife,
              size: rand(1, FIREWORK_CONFIG.trailParticleSize),
            });
          }

          // Draw rocket head
          const colorHex = COLORS[fw.color]?.hex || '#fff';
          ctx.fillStyle = colorHex;
          ctx.shadowBlur = 12;
          ctx.shadowColor = colorHex;
          ctx.beginPath();
          ctx.arc(fw.x, fw.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Apex detection
          if (fw.vy >= -1) {
            fw.phase = 'exploding';
            fw.explosionAge = 0;
            // Generate explosion particles in shape
            const points = getShapePoints(fw.shape, FIREWORK_CONFIG.explosionParticleCount);
            const colorData = COLORS[fw.color] || COLORS.red;
            points.forEach(p => {
              const speed = p.r * FIREWORK_CONFIG.explosionSpeed * rand(0.8, 1.2);
              fw.explosionParticles.push({
                x: fw.x, y: fw.y,
                vx: Math.cos(p.angle) * speed,
                vy: Math.sin(p.angle) * speed,
                life: FIREWORK_CONFIG.explosionLife * rand(0.7, 1.0),
                maxLife: FIREWORK_CONFIG.explosionLife,
                size: rand(2, 4.5),
                color: colorData.hex,
                glow: colorData.glow,
              });
            });
          }
        }

        // Draw trail
        fw.trail.forEach(tp => {
          tp.x += tp.vx;
          tp.y += tp.vy;
          tp.life--;
          const a = Math.max(0, tp.life / FIREWORK_CONFIG.trailParticleLife);
          ctx.fillStyle = `rgba(255,200,100,${a * 0.8})`;
          ctx.beginPath();
          ctx.arc(tp.x, tp.y, tp.size * a, 0, Math.PI * 2);
          ctx.fill();
        });
        fw.trail = fw.trail.filter(tp => tp.life > 0);

        if (fw.phase === 'exploding') {
          fw.explosionAge++;
          fw.explosionParticles.forEach(ep => {
            ep.vx *= FIREWORK_CONFIG.explosionFriction;
            ep.vy *= FIREWORK_CONFIG.explosionFriction;
            ep.vy += FIREWORK_CONFIG.explosionGravity;
            ep.x += ep.vx;
            ep.y += ep.vy;
            ep.life--;
            const progress = 1 - ep.life / ep.maxLife;
            const alpha = progress > FIREWORK_CONFIG.explosionFadeStart
              ? 1 - (progress - FIREWORK_CONFIG.explosionFadeStart) / (1 - FIREWORK_CONFIG.explosionFadeStart)
              : 1;
            ctx.save();
            ctx.globalAlpha = Math.max(0, alpha);
            ctx.shadowBlur = 8;
            ctx.shadowColor = ep.glow;
            ctx.fillStyle = ep.color;
            ctx.beginPath();
            ctx.arc(ep.x, ep.y, ep.size * (0.5 + 0.5 * alpha), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });
          fw.explosionParticles = fw.explosionParticles.filter(ep => ep.life > 0);

          // When explosion is done
          if (fw.explosionParticles.length === 0 && fw.trail.length === 0) {
            if (!fw.checked && phase === GAME_PHASES.PLAYING) {
              fw.checked = true;
              checkMatch(fw);
            }
            fw.phase = 'done';
          }
        }
      });

      // Cleanup done fireworks
      fireworksRef.current = fireworksRef.current.filter(fw => fw.phase !== 'done');

      // ─ Celebration particles
      celebrationRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.vx *= 0.98;
        p.life--;
        const a = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      celebrationRef.current = celebrationRef.current.filter(p => p.life > 0);

      // ─ Crowd emojis
      crowdEmojiRef.current.forEach(e => {
        e.y += e.vy;
        e.x += Math.sin(e.life * 0.08) * 0.5;
        e.life--;
        const a = Math.max(0, e.life / e.maxLife);
        ctx.globalAlpha = a;
        ctx.font = `${e.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(e.emoji, e.x, e.y);
        ctx.globalAlpha = 1;
      });
      crowdEmojiRef.current = crowdEmojiRef.current.filter(e => e.life > 0);

      // ─ Draw cannons
      cannonsRef.current.forEach(c => drawCannonOnCanvas(ctx, c, levelCfg));

      ctx.restore(); // end shake translate

      // ─ Timer update (skip in chill mode)
      if (!chillModeRef.current && timerRef.current.running && phase === GAME_PHASES.PLAYING) {
        const elapsed = (performance.now() - timerRef.current.start) / 1000;
        timerRef.current.remaining = Math.max(0, timerRef.current.limit - elapsed);
        if (timerRef.current.remaining <= 0) {
          // Time's up — end level
          timerRef.current.running = false;
          const summary = {
            level: levelCfg.level,
            questsCompleted: questsDoneRef.current,
            totalQuests: levelCfg.questCount,
            timeRemaining: 0,
            timeBonus: 0,
            score: scoreRef.current,
            timedOut: true,
          };
          setLevelSummary(summary);
          phaseRef.current = GAME_PHASES.LEVEL_COMPLETE;
          setGamePhase(GAME_PHASES.LEVEL_COMPLETE);
        }
      }

      // ─ Sync UI every 15 frames
      if (frame % 15 === 0 && !chillModeRef.current) {
        setTimeRemaining(Math.ceil(timerRef.current.remaining));
      }

      animIdRef.current = requestAnimationFrame(loop);
    };

    animIdRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animIdRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [initStars, checkMatch]);

  /* ── Chill mode toggle ──────────────────── */
  const toggleChillMode = useCallback(() => {
    const next = !chillModeRef.current;
    chillModeRef.current = next;
    setChillMode(next);
  }, []);

  /* ── Public API ────────────────────────── */
  const startGame = useCallback(() => initLevel(0), [initLevel]);

  const advanceLevel = useCallback(() => {
    initLevel(levelIdxRef.current + 1);
  }, [initLevel]);

  const restartLevel = useCallback(() => {
    initLevel(levelIdxRef.current);
  }, [initLevel]);

  const restartGame = useCallback(() => {
    initLevel(0);
  }, [initLevel]);

  return {
    canvasRef,
    // State
    gamePhase,
    currentLevel,
    score,
    questsCompleted,
    timeRemaining,
    currentQuest,
    cannonSelections,
    lastMatchResult,
    showHowToPlay, setShowHowToPlay,
    crowdMood,
    levelSummary,
    unlockedColor,
    unlockedCannon,
    chillMode,
    toggleChillMode,
    quickMatch,
    questStartTime,
    levelIntro,
    // Derived
    levelConfig: LEVELS[currentLevel] || LEVELS[0],
    totalLevels: LEVELS.length,
    // Actions
    startGame,
    fireCannon,
    selectColor,
    selectShape,
    advanceLevel,
    restartLevel,
    restartGame,
  };
}
