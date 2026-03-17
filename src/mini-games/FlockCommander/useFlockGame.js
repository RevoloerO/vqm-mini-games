import { useRef, useState, useEffect, useCallback } from 'react';
import {
  GAME_PHASES, REF_W, REF_H, BEACON_TYPES, BOID_CONFIG,
  PREDATOR_CONFIG, STAR_THRESHOLDS, LEVELS,
} from './gameConfig';

// ─── Helpers ────────────────────────────────────────────────
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (lo, hi) => lo + Math.random() * (hi - lo);

let nextId = 1;

// ─── Hook ───────────────────────────────────────────────────
export default function useFlockGame() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const frameRef = useRef(0);

  // Physics state (refs — no re-renders)
  const boidsRef = useRef([]);
  const beaconsRef = useRef([]);
  const predatorsRef = useRef([]);
  const particlesRef = useRef([]);
  const starsRef = useRef([]); // bg stars
  const savedRef = useRef(0);
  const lostRef = useRef(0);
  const timerRef = useRef(0);
  const lastTimeRef = useRef(0);
  const simTimeRef = useRef(0);
  const scaleRef = useRef({ x: 1, y: 1 });

  // Input state
  const mouseRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef(null); // { beaconId } if dragging
  const ghostRef = useRef(null); // follows cursor when placing

  // UI state (triggers re-renders)
  const [gamePhase, setGamePhase] = useState(GAME_PHASES.MENU);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedBeaconType, setSelectedBeaconType] = useState(null);
  const [beaconBudget, setBeaconBudget] = useState({});
  const [levelStars, setLevelStars] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [streamDir, setStreamDir] = useState(0); // 0=right,1=down,2=left,3=up
  const [beaconColor, setBeaconColor] = useState(null); // for colored levels

  // ─── Coordinate Conversion ──────────────────────────────
  const toCanvas = useCallback((rx, ry) => {
    const s = scaleRef.current;
    return { x: rx * s.x, y: ry * s.y };
  }, []);

  const toRef = useCallback((cx, cy) => {
    const s = scaleRef.current;
    return { x: cx / s.x, y: cy / s.y };
  }, []);

  // ─── Background Stars ──────────────────────────────────
  const initBgStars = useCallback((w, h) => {
    const stars = [];
    for (let i = 0; i < 120; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: rand(0.5, 2.5),
        alpha: rand(0.2, 0.8),
        twinkleSpeed: rand(0.008, 0.025),
        phase: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = stars;
  }, []);

  // ─── Spawn Boids ───────────────────────────────────────
  const spawnBoids = useCallback((level) => {
    const boids = [];
    const sz = level.startZone;
    const colorCount = level.boidColors.length;
    for (let i = 0; i < level.boidCount; i++) {
      const angle = rand(0, Math.PI * 2);
      boids.push({
        id: nextId++,
        x: rand(sz.x, sz.x + sz.w),
        y: rand(sz.y, sz.y + sz.h),
        vx: Math.cos(angle) * rand(0.5, 1.5),
        vy: Math.sin(angle) * rand(0.5, 1.5),
        color: level.boidColors[i % colorCount],
        saved: false,
        lost: false,
        trail: [],
        scared: 0,
      });
    }
    boidsRef.current = boids;
  }, []);

  // ─── Init Predators ────────────────────────────────────
  const initPredators = useCallback((levelPredators) => {
    predatorsRef.current = levelPredators.map(p => ({
      ...p,
      x: p.path[0].x,
      y: p.path[0].y,
      pathIndex: 0,
      pathDir: 1,
    }));
  }, []);

  // ─── Boid Physics ─────────────────────────────────────
  const updateBoids = useCallback((level) => {
    const boids = boidsRef.current;
    const beacons = beaconsRef.current;
    const predators = predatorsRef.current;
    const cfg = BOID_CONFIG;
    const alive = boids.filter(b => !b.saved && !b.lost);

    for (const boid of alive) {
      let ax = 0, ay = 0;

      // ── Flocking (separation, alignment, cohesion) ──
      let sepX = 0, sepY = 0;
      let aliX = 0, aliY = 0, aliCount = 0;
      let cohX = 0, cohY = 0, cohCount = 0;

      for (const other of alive) {
        if (other.id === boid.id) continue;
        const d = dist(boid, other);
        if (d < cfg.perceptionRadius && (boid.color === other.color || level.boidColors.length === 1)) {
          // Alignment
          aliX += other.vx; aliY += other.vy; aliCount++;
          // Cohesion
          cohX += other.x; cohY += other.y; cohCount++;
        }
        if (d < cfg.separationDist && d > 0) {
          sepX += (boid.x - other.x) / d;
          sepY += (boid.y - other.y) / d;
        }
      }

      ax += sepX * cfg.separationWeight;
      ay += sepY * cfg.separationWeight;

      if (aliCount > 0) {
        ax += ((aliX / aliCount) - boid.vx) * cfg.alignmentWeight * 0.1;
        ay += ((aliY / aliCount) - boid.vy) * cfg.alignmentWeight * 0.1;
      }
      if (cohCount > 0) {
        const cx = cohX / cohCount, cy = cohY / cohCount;
        ax += (cx - boid.x) * cfg.cohesionWeight * 0.005;
        ay += (cy - boid.y) * cfg.cohesionWeight * 0.005;
      }

      // ── Beacon Forces ──
      for (const beacon of beacons) {
        if (beacon.expired) continue;
        const bt = BEACON_TYPES[beacon.type];
        const d = dist(boid, beacon);
        if (d > bt.radius || d < 1) continue;

        // Color filter for colored levels
        if (beacon.color && boid.color !== beacon.color) continue;

        const strength = (1 - d / bt.radius) * cfg.beaconWeight;
        const dx = beacon.x - boid.x, dy = beacon.y - boid.y;
        const nd = Math.max(d, 1);

        if (beacon.type === 'magnet') {
          ax += (dx / nd) * strength;
          ay += (dy / nd) * strength;
        } else if (beacon.type === 'repeller') {
          ax -= (dx / nd) * strength * 1.2;
          ay -= (dy / nd) * strength * 1.2;
        } else if (beacon.type === 'vortex') {
          // Split: push boids perpendicular to their approach
          const perp = boid.y < beacon.y ? -1 : 1;
          ax += (dx / nd) * strength * 0.3;
          ay += perp * strength * 1.5;
        } else if (beacon.type === 'shelter') {
          // Gently attract + slow down inside
          ax += (dx / nd) * strength * 0.3;
          ay += (dy / nd) * strength * 0.3;
          if (d < bt.radius * 0.7) {
            boid.vx *= 0.96;
            boid.vy *= 0.96;
          }
        } else if (beacon.type === 'stream') {
          // Push in beacon's direction
          const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
          const dir = dirs[beacon.direction || 0];
          ax += dir[0] * strength * 1.8;
          ay += dir[1] * strength * 1.8;
        }
      }

      // ── Wind Currents ──
      for (const c of level.currents) {
        if (boid.x >= c.x && boid.x <= c.x + c.w && boid.y >= c.y && boid.y <= c.y + c.h) {
          ax += c.fx * 0.15;
          ay += c.fy * 0.15;
        }
      }

      // ── Obstacle Avoidance ──
      for (const obs of level.obstacles) {
        const cx = clamp(boid.x, obs.x, obs.x + obs.w);
        const cy = clamp(boid.y, obs.y, obs.y + obs.h);
        const d = dist(boid, { x: cx, y: cy });
        if (d < cfg.obstacleAvoidDist && d > 0) {
          const force = (1 - d / cfg.obstacleAvoidDist) * cfg.obstacleWeight;
          ax += ((boid.x - cx) / d) * force;
          ay += ((boid.y - cy) / d) * force;
        }
      }

      // ── Predator Flee ──
      for (const pred of predators) {
        const d = dist(boid, pred);
        // Check if boid is inside a shelter
        let inShelter = false;
        for (const beacon of beacons) {
          if (beacon.type === 'shelter' && !beacon.expired && dist(boid, beacon) < BEACON_TYPES.shelter.radius * 0.7) {
            inShelter = true;
            break;
          }
        }
        if (!inShelter && d < cfg.predatorFleeDist && d > 0) {
          const force = (1 - d / cfg.predatorFleeDist) * cfg.predatorWeight;
          ax += ((boid.x - pred.x) / d) * force;
          ay += ((boid.y - pred.y) / d) * force;
          boid.scared = 15;
        }
      }

      // ── Weak Goal Pull ──
      for (const goal of level.goals) {
        if (goal.color && goal.color !== boid.color) continue;
        const d = dist(boid, goal);
        if (d > 0) {
          ax += ((goal.x - boid.x) / d) * cfg.goalPullWeight;
          ay += ((goal.y - boid.y) / d) * cfg.goalPullWeight;
        }
      }

      // ── Boundary ──
      const m = cfg.boundaryMargin;
      if (boid.x < m) ax += cfg.boundaryWeight;
      if (boid.x > REF_W - m) ax -= cfg.boundaryWeight;
      if (boid.y < m) ay += cfg.boundaryWeight;
      if (boid.y > REF_H - m) ay -= cfg.boundaryWeight;

      // ── Warp Portals ──
      for (const warp of (level.warps || [])) {
        const d1 = dist(boid, { x: warp.x1, y: warp.y1 });
        const d2 = dist(boid, { x: warp.x2, y: warp.y2 });
        if (d1 < warp.radius) {
          boid.x = warp.x2 + (boid.x - warp.x1);
          boid.y = warp.y2 + (boid.y - warp.y1);
          spawnTeleportParticles(warp.x2, warp.y2);
        } else if (d2 < warp.radius * 0.6) {
          boid.x = warp.x1 + (boid.x - warp.x2);
          boid.y = warp.y1 + (boid.y - warp.y2);
          spawnTeleportParticles(warp.x1, warp.y1);
        }
      }

      // ── Apply ──
      boid.vx += ax * 0.1;
      boid.vy += ay * 0.1;

      const speed = Math.hypot(boid.vx, boid.vy);
      if (speed > cfg.maxSpeed) {
        boid.vx = (boid.vx / speed) * cfg.maxSpeed;
        boid.vy = (boid.vy / speed) * cfg.maxSpeed;
      } else if (speed < cfg.minSpeed && speed > 0) {
        boid.vx = (boid.vx / speed) * cfg.minSpeed;
        boid.vy = (boid.vy / speed) * cfg.minSpeed;
      }

      boid.x += boid.vx;
      boid.y += boid.vy;

      // Clamp to boundaries
      boid.x = clamp(boid.x, 2, REF_W - 2);
      boid.y = clamp(boid.y, 2, REF_H - 2);

      // Trail
      boid.trail.push({ x: boid.x, y: boid.y });
      if (boid.trail.length > cfg.trailLength) boid.trail.shift();

      if (boid.scared > 0) boid.scared--;

      // ── Goal Check ──
      for (const goal of level.goals) {
        if (goal.color && goal.color !== boid.color) continue;
        if (dist(boid, goal) < goal.r * 0.8) {
          boid.saved = true;
          savedRef.current++;
          setSavedCount(savedRef.current);
          spawnGoalParticles(goal.x, goal.y, boid.color);
          break;
        }
      }
    }
  }, []);

  // ─── Predator Update ──────────────────────────────────
  const updatePredators = useCallback(() => {
    for (const pred of predatorsRef.current) {
      const target = pred.path[pred.pathIndex];
      const d = dist(pred, target);
      if (d < 5) {
        pred.pathIndex += pred.pathDir;
        if (pred.pathIndex >= pred.path.length || pred.pathIndex < 0) {
          pred.pathDir *= -1;
          pred.pathIndex += pred.pathDir * 2;
        }
      }
      const t = pred.path[pred.pathIndex] || pred.path[0];
      const dx = t.x - pred.x, dy = t.y - pred.y;
      const nd = Math.max(Math.hypot(dx, dy), 1);

      // Check if predator should avoid shelters
      let inShelterZone = false;
      for (const beacon of beaconsRef.current) {
        if (beacon.type === 'shelter' && !beacon.expired && dist(pred, beacon) < BEACON_TYPES.shelter.radius) {
          inShelterZone = true;
          const sd = dist(pred, beacon);
          pred.x += ((pred.x - beacon.x) / sd) * 2;
          pred.y += ((pred.y - beacon.y) / sd) * 2;
        }
      }

      if (!inShelterZone) {
        pred.x += (dx / nd) * pred.speed;
        pred.y += (dy / nd) * pred.speed;
      }
    }
  }, []);

  // ─── Timed Beacon Expiry ──────────────────────────────
  const updateTimedBeacons = useCallback((level) => {
    if (!level.timedBeacons) return;
    const now = simTimeRef.current;
    for (const b of beaconsRef.current) {
      if (!b.expired && b.placedAt != null) {
        const elapsed = now - b.placedAt;
        b.fadeProgress = clamp(elapsed / level.beaconDuration, 0, 1);
        if (elapsed >= level.beaconDuration) {
          b.expired = true;
        }
      }
    }
  }, []);

  // ─── Particles ────────────────────────────────────────
  const spawnGoalParticles = useCallback((gx, gy, color) => {
    for (let i = 0; i < 12; i++) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(1, 3);
      particlesRef.current.push({
        x: gx, y: gy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 40,
        maxLife: 40,
        color: color || '#3bff6e',
        size: rand(2, 5),
      });
    }
  }, []);

  const spawnTeleportParticles = useCallback((px, py) => {
    for (let i = 0; i < 8; i++) {
      const angle = rand(0, Math.PI * 2);
      particlesRef.current.push({
        x: px, y: py,
        vx: Math.cos(angle) * rand(0.5, 2),
        vy: Math.sin(angle) * rand(0.5, 2),
        life: 25,
        maxLife: 25,
        color: '#ff8c3b',
        size: rand(2, 4),
      });
    }
  }, []);

  const updateParticles = useCallback(() => {
    const ps = particlesRef.current;
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.life--;
      if (p.life <= 0) ps.splice(i, 1);
    }
  }, []);

  // ─── Drawing ──────────────────────────────────────────
  const draw = useCallback((ctx, w, h, level, phase) => {
    const sx = scaleRef.current.x;
    const sy = scaleRef.current.y;
    const frame = frameRef.current;

    // Background
    ctx.fillStyle = '#06081a';
    ctx.fillRect(0, 0, w, h);

    // Stars
    for (const star of starsRef.current) {
      const a = star.alpha + Math.sin(frame * star.twinkleSpeed + star.phase) * 0.3;
      ctx.globalAlpha = clamp(a, 0, 1);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Wind currents
    for (const c of level.currents) {
      ctx.fillStyle = 'rgba(178,59,255,0.06)';
      ctx.fillRect(c.x * sx, c.y * sy, c.w * sx, c.h * sy);

      // Animated arrows
      const arrowCount = Math.floor(c.w / 60);
      const arrowPhase = (frame * 2) % 60;
      ctx.strokeStyle = 'rgba(178,59,255,0.2)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < arrowCount; i++) {
        const ax = (c.x + i * 60 + arrowPhase) * sx;
        const ay = (c.y + c.h / 2) * sy;
        const dir = Math.atan2(c.fy, c.fx);
        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(dir);
        ctx.beginPath();
        ctx.moveTo(-8, -4);
        ctx.lineTo(0, 0);
        ctx.lineTo(-8, 4);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Obstacles
    for (const obs of level.obstacles) {
      const grd = ctx.createLinearGradient(obs.x * sx, obs.y * sy, (obs.x + obs.w) * sx, (obs.y + obs.h) * sy);
      grd.addColorStop(0, 'rgba(80,90,120,0.8)');
      grd.addColorStop(1, 'rgba(50,55,75,0.8)');
      ctx.fillStyle = grd;
      ctx.fillRect(obs.x * sx, obs.y * sy, obs.w * sx, obs.h * sy);
      ctx.strokeStyle = 'rgba(120,140,180,0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(obs.x * sx, obs.y * sy, obs.w * sx, obs.h * sy);
    }

    // Warp portals
    for (const warp of (level.warps || [])) {
      const drawPortal = (px, py) => {
        const cx = px * sx, cy = py * sy, r = warp.radius * sx;
        const pulse = 0.8 + Math.sin(frame * 0.06) * 0.2;
        ctx.beginPath();
        ctx.arc(cx, cy, r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,140,59,0.08)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,140,59,0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Swirl effect
        for (let i = 0; i < 3; i++) {
          const a = frame * 0.04 + (i * Math.PI * 2 / 3);
          const sr = r * 0.6;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * sr, cy + Math.sin(a) * sr, 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,140,59,0.6)';
          ctx.fill();
        }
      };
      drawPortal(warp.x1, warp.y1);
      drawPortal(warp.x2, warp.y2);

      // Connection line
      ctx.setLineDash([4, 8]);
      ctx.strokeStyle = 'rgba(255,140,59,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(warp.x1 * sx, warp.y1 * sy);
      ctx.lineTo(warp.x2 * sx, warp.y2 * sy);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Start zone
    const sz = level.startZone;
    ctx.fillStyle = 'rgba(0,229,255,0.05)';
    ctx.fillRect(sz.x * sx, sz.y * sy, sz.w * sx, sz.h * sy);
    ctx.strokeStyle = 'rgba(0,229,255,0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(sz.x * sx, sz.y * sy, sz.w * sx, sz.h * sy);
    ctx.setLineDash([]);
    if (phase === GAME_PHASES.PLANNING) {
      ctx.fillStyle = 'rgba(0,229,255,0.4)';
      ctx.font = `${12 * sx}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('START', (sz.x + sz.w / 2) * sx, (sz.y + sz.h / 2) * sy);
    }

    // Goal zones
    for (const goal of level.goals) {
      const pulse = 0.85 + Math.sin(frame * 0.04) * 0.15;
      const gColor = goal.color || '#3bff6e';
      const r = goal.r * sx * pulse;

      ctx.beginPath();
      ctx.arc(goal.x * sx, goal.y * sy, r, 0, Math.PI * 2);
      ctx.fillStyle = gColor.replace(')', ',0.08)').replace('rgb', 'rgba').replace('#', '');
      // Convert hex to rgba for fill
      const gc = hexToRgba(gColor, 0.08);
      ctx.fillStyle = gc;
      ctx.fill();

      ctx.strokeStyle = hexToRgba(gColor, 0.5);
      ctx.lineWidth = 2;
      ctx.stroke();

      // Goal label
      ctx.fillStyle = hexToRgba(gColor, 0.5);
      ctx.font = `bold ${11 * sx}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('NEST', goal.x * sx, (goal.y + goal.r + 16) * sy);
    }

    // Beacons
    for (const beacon of beaconsRef.current) {
      drawBeacon(ctx, beacon, sx, sy, frame);
    }

    // Ghost beacon (placement preview)
    if (ghostRef.current && phase === GAME_PHASES.PLANNING) {
      const g = ghostRef.current;
      const bt = BEACON_TYPES[g.type];
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(g.x * sx, g.y * sy, bt.radius * sx, 0, Math.PI * 2);
      ctx.strokeStyle = bt.color;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(g.x * sx, g.y * sy, 8, 0, Math.PI * 2);
      ctx.fillStyle = bt.color;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Boids
    for (const boid of boidsRef.current) {
      if (boid.saved || boid.lost) continue;
      drawBoid(ctx, boid, sx, sy);
    }

    // Predators
    for (const pred of predatorsRef.current) {
      drawPredator(ctx, pred, sx, sy, frame);
    }

    // Particles
    for (const p of particlesRef.current) {
      ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x * sx, p.y * sy, p.size * sx, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }, []);

  // ─── Draw Helpers ─────────────────────────────────────
  function drawBoid(ctx, boid, sx, sy) {
    const angle = Math.atan2(boid.vy, boid.vx);
    const size = BOID_CONFIG.size;

    // Trail
    if (boid.trail.length > 1) {
      for (let i = 0; i < boid.trail.length - 1; i++) {
        const alpha = (i / boid.trail.length) * 0.3;
        ctx.strokeStyle = hexToRgba(boid.color, alpha);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(boid.trail[i].x * sx, boid.trail[i].y * sy);
        ctx.lineTo(boid.trail[i + 1].x * sx, boid.trail[i + 1].y * sy);
        ctx.stroke();
      }
    }

    // Body (triangle)
    ctx.save();
    ctx.translate(boid.x * sx, boid.y * sy);
    ctx.rotate(angle);

    const glow = boid.scared > 0 ? '#ff3b3b' : boid.color;
    ctx.shadowColor = glow;
    ctx.shadowBlur = boid.scared > 0 ? 12 : 6;

    ctx.fillStyle = boid.scared > 0 ? '#ff6b6b' : boid.color;
    ctx.beginPath();
    ctx.moveTo(size * sx * 1.2, 0);
    ctx.lineTo(-size * sx * 0.7, -size * sy * 0.6);
    ctx.lineTo(-size * sx * 0.7, size * sy * 0.6);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  function drawPredator(ctx, pred, sx, sy, frame) {
    const pulse = 1 + Math.sin(frame * 0.08) * 0.15;

    ctx.save();
    ctx.translate(pred.x * sx, pred.y * sy);

    ctx.shadowColor = 'rgba(255,59,59,0.6)';
    ctx.shadowBlur = 15;

    ctx.fillStyle = '#ff3b3b';
    ctx.beginPath();
    const s = PREDATOR_CONFIG.size * sx * pulse;
    ctx.moveTo(0, -s);
    ctx.lineTo(-s * 0.8, s * 0.6);
    ctx.lineTo(0, s * 0.3);
    ctx.lineTo(s * 0.8, s * 0.6);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.restore();

    // Danger radius indicator
    ctx.beginPath();
    ctx.arc(pred.x * sx, pred.y * sy, BOID_CONFIG.predatorFleeDist * sx, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,59,59,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawBeacon(ctx, beacon, sx, sy, frame) {
    const bt = BEACON_TYPES[beacon.type];
    const fadeAlpha = beacon.expired ? 0 : (beacon.fadeProgress != null ? 1 - beacon.fadeProgress : 1);
    if (fadeAlpha <= 0) return;

    ctx.globalAlpha = fadeAlpha;

    // Radius ring
    const pulse = 0.9 + Math.sin(frame * 0.05 + beacon.id) * 0.1;
    ctx.beginPath();
    ctx.arc(beacon.x * sx, beacon.y * sy, bt.radius * sx * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = bt.glow;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = bt.glow.replace('0.35', '0.04');
    ctx.fill();

    // Center dot
    ctx.beginPath();
    ctx.arc(beacon.x * sx, beacon.y * sy, 10 * sx, 0, Math.PI * 2);
    ctx.fillStyle = bt.color;
    ctx.shadowColor = bt.color;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Icon
    ctx.fillStyle = '#06081a';
    ctx.font = `bold ${11 * sx}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const icons = { magnet: '◎', repeller: '✕', vortex: '⟳', shelter: '⛨', stream: '→' };
    let icon = icons[beacon.type] || '•';
    if (beacon.type === 'stream') {
      const arrows = ['→', '↓', '←', '↑'];
      icon = arrows[beacon.direction || 0];
    }
    ctx.fillText(icon, beacon.x * sx, beacon.y * sy);

    // Color indicator for colored beacons
    if (beacon.color) {
      ctx.beginPath();
      ctx.arc(beacon.x * sx, (beacon.y - 16) * sy, 4 * sx, 0, Math.PI * 2);
      ctx.fillStyle = beacon.color;
      ctx.fill();
    }

    // Timer bar for timed beacons
    if (beacon.fadeProgress != null && beacon.fadeProgress > 0) {
      const barW = 30 * sx;
      const barH = 3 * sy;
      const bx = beacon.x * sx - barW / 2;
      const by = (beacon.y + 18) * sy;
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(bx, by, barW, barH);
      ctx.fillStyle = bt.color;
      ctx.fillRect(bx, by, barW * (1 - beacon.fadeProgress), barH);
    }

    ctx.globalAlpha = 1;
    ctx.textBaseline = 'alphabetic';
  }

  function hexToRgba(hex, alpha) {
    if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // ─── Level Management ─────────────────────────────────
  const startGame = useCallback((levelIndex = 0) => {
    setCurrentLevel(levelIndex);
    setScore(0);
    setTotalStars(0);
    initLevel(levelIndex);
  }, []);

  const initLevel = useCallback((levelIndex) => {
    const level = LEVELS[levelIndex];
    beaconsRef.current = [];
    boidsRef.current = [];
    predatorsRef.current = [];
    particlesRef.current = [];
    savedRef.current = 0;
    lostRef.current = 0;
    simTimeRef.current = 0;
    setSavedCount(0);
    setTimeRemaining(level.timeLimit);
    setBeaconBudget({ ...level.beaconBudget });
    setSelectedBeaconType(Object.keys(level.beaconBudget)[0] || null);
    setLevelStars(0);
    setFeedback(null);
    setStreamDir(0);
    setBeaconColor(null);
    initPredators(level.predators);
    setGamePhase(GAME_PHASES.PLANNING);
  }, [initPredators]);

  const releaseFlock = useCallback(() => {
    const level = LEVELS[currentLevel];
    spawnBoids(level);
    lastTimeRef.current = performance.now();
    simTimeRef.current = 0;
    setGamePhase(GAME_PHASES.SIMULATING);

    // Mark beacon placement times for timed beacons
    if (level.timedBeacons) {
      for (const b of beaconsRef.current) {
        b.placedAt = 0;
      }
    }
  }, [currentLevel, spawnBoids]);

  const checkLevelComplete = useCallback(() => {
    const level = LEVELS[currentLevel];
    const boids = boidsRef.current;
    const alive = boids.filter(b => !b.saved && !b.lost);

    // Level ends when all boids saved or timer runs out
    if (alive.length === 0 || timerRef.current <= 0) {
      // Mark remaining as lost
      for (const b of alive) b.lost = true;

      const saved = savedRef.current;
      const total = level.boidCount;
      const pct = saved / total;

      let stars = 0;
      if (pct >= STAR_THRESHOLDS[2]) stars = 3;
      else if (pct >= STAR_THRESHOLDS[1]) stars = 2;
      else if (pct >= STAR_THRESHOLDS[0]) stars = 1;

      const levelScore = saved * 100 + Math.floor(Math.max(timerRef.current, 0)) * 5 + stars * 200;

      setLevelStars(stars);
      setScore(prev => prev + levelScore);
      setTotalStars(prev => prev + stars);

      if (currentLevel >= LEVELS.length - 1) {
        setGamePhase(GAME_PHASES.GAME_COMPLETE);
      } else {
        setGamePhase(GAME_PHASES.LEVEL_COMPLETE);
      }
      return true;
    }
    return false;
  }, [currentLevel]);

  const nextLevel = useCallback(() => {
    const next = currentLevel + 1;
    setCurrentLevel(next);
    initLevel(next);
  }, [currentLevel, initLevel]);

  const retryLevel = useCallback(() => {
    initLevel(currentLevel);
  }, [currentLevel, initLevel]);

  // ─── Beacon Placement ─────────────────────────────────
  const placeBeacon = useCallback((refX, refY) => {
    if (!selectedBeaconType) return;
    const level = LEVELS[currentLevel];
    const budget = { ...beaconBudget };
    if (!budget[selectedBeaconType] || budget[selectedBeaconType] <= 0) return;

    // Don't place on obstacles
    for (const obs of level.obstacles) {
      if (refX >= obs.x - 10 && refX <= obs.x + obs.w + 10 &&
          refY >= obs.y - 10 && refY <= obs.y + obs.h + 10) return;
    }

    const beacon = {
      id: nextId++,
      type: selectedBeaconType,
      x: refX,
      y: refY,
      color: beaconColor,
      direction: selectedBeaconType === 'stream' ? streamDir : 0,
      placedAt: null,
      fadeProgress: null,
      expired: false,
    };
    beaconsRef.current.push(beacon);
    budget[selectedBeaconType]--;
    setBeaconBudget(budget);

    if (budget[selectedBeaconType] <= 0) {
      const next = Object.keys(budget).find(k => budget[k] > 0);
      setSelectedBeaconType(next || null);
    }
  }, [selectedBeaconType, beaconBudget, currentLevel, streamDir, beaconColor]);

  const removeBeacon = useCallback((beaconId) => {
    const idx = beaconsRef.current.findIndex(b => b.id === beaconId);
    if (idx === -1) return;
    const beacon = beaconsRef.current[idx];
    beaconsRef.current.splice(idx, 1);
    setBeaconBudget(prev => ({
      ...prev,
      [beacon.type]: (prev[beacon.type] || 0) + 1,
    }));
  }, []);

  // ─── Input Handlers ───────────────────────────────────
  const handleCanvasClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const cy = (e.clientY - rect.top) * (canvas.height / rect.height);
    const ref = toRef(cx, cy);

    if (gamePhase === GAME_PHASES.PLANNING) {
      // Check if clicking on existing beacon (to select/remove)
      for (const beacon of beaconsRef.current) {
        if (dist(ref, beacon) < 15) {
          removeBeacon(beacon.id);
          return;
        }
      }
      placeBeacon(ref.x, ref.y);
    }
  }, [gamePhase, toRef, placeBeacon, removeBeacon]);

  const handleCanvasMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const cy = (e.clientY - rect.top) * (canvas.height / rect.height);
    const ref = toRef(cx, cy);
    mouseRef.current = ref;

    if (gamePhase === GAME_PHASES.PLANNING && selectedBeaconType) {
      ghostRef.current = { type: selectedBeaconType, x: ref.x, y: ref.y };
    } else {
      ghostRef.current = null;
    }

    // Drag beacon during simulation
    if (dragRef.current) {
      const beacon = beaconsRef.current.find(b => b.id === dragRef.current.beaconId);
      if (beacon) {
        beacon.x = ref.x;
        beacon.y = ref.y;
      }
    }
  }, [gamePhase, selectedBeaconType, toRef]);

  const handleCanvasMouseDown = useCallback((e) => {
    const level = LEVELS[currentLevel];
    if (gamePhase !== GAME_PHASES.SIMULATING || !level.allowDrag) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const cy = (e.clientY - rect.top) * (canvas.height / rect.height);
    const ref = toRef(cx, cy);

    for (const beacon of beaconsRef.current) {
      if (dist(ref, beacon) < 20) {
        dragRef.current = { beaconId: beacon.id };
        return;
      }
    }
  }, [gamePhase, currentLevel, toRef]);

  const handleCanvasMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  // ─── Animation Loop ───────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scaleRef.current = {
        x: window.innerWidth / REF_W,
        y: window.innerHeight / REF_H,
      };
      initBgStars(window.innerWidth, window.innerHeight);
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = (now) => {
      frameRef.current++;
      const level = LEVELS[currentLevel] || LEVELS[0];
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (gamePhase === GAME_PHASES.SIMULATING) {
        const dt = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;
        simTimeRef.current += dt;
        timerRef.current = level.timeLimit - simTimeRef.current;
        setTimeRemaining(Math.max(Math.ceil(timerRef.current), 0));

        updateBoids(level);
        updatePredators();
        updateTimedBeacons(level);
        updateParticles();
        checkLevelComplete();
      }

      draw(ctx, w, h, level, gamePhase);
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [gamePhase, currentLevel, draw, updateBoids, updatePredators,
      updateTimedBeacons, updateParticles, checkLevelComplete, initBgStars]);

  return {
    canvasRef,
    gamePhase,
    currentLevel,
    score,
    savedCount,
    timeRemaining,
    selectedBeaconType,
    beaconBudget,
    levelStars,
    totalStars,
    feedback,
    streamDir,
    beaconColor,
    startGame,
    releaseFlock,
    nextLevel,
    retryLevel,
    setSelectedBeaconType,
    setStreamDir,
    setBeaconColor,
    handleCanvasClick,
    handleCanvasMouseMove,
    handleCanvasMouseDown,
    handleCanvasMouseUp,
    level: LEVELS[currentLevel] || LEVELS[0],
    totalLevels: LEVELS.length,
  };
}
