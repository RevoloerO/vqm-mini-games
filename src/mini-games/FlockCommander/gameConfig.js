// ─── Game Phases ────────────────────────────────────────────
export const GAME_PHASES = {
  MENU: 'menu',
  PLANNING: 'planning',
  SIMULATING: 'simulating',
  LEVEL_COMPLETE: 'level_complete',
  GAME_COMPLETE: 'game_complete',
};

// ─── Reference Resolution ───────────────────────────────────
export const REF_W = 1200;
export const REF_H = 700;

// ─── Beacon Types ───────────────────────────────────────────
export const BEACON_TYPES = {
  magnet: {
    key: 'magnet',
    name: 'Magnet',
    desc: 'Attracts boids',
    color: '#3bff6e',
    glow: 'rgba(59,255,110,0.35)',
    radius: 120,
  },
  repeller: {
    key: 'repeller',
    name: 'Repeller',
    desc: 'Pushes boids away',
    color: '#ff3b3b',
    glow: 'rgba(255,59,59,0.35)',
    radius: 100,
  },
  vortex: {
    key: 'vortex',
    name: 'Vortex',
    desc: 'Splits flock into two streams',
    color: '#ffe03b',
    glow: 'rgba(255,224,59,0.35)',
    radius: 90,
  },
  shelter: {
    key: 'shelter',
    name: 'Shelter',
    desc: 'Safe zone — predators blocked',
    color: '#3b8bff',
    glow: 'rgba(59,139,255,0.35)',
    radius: 100,
  },
  stream: {
    key: 'stream',
    name: 'Stream',
    desc: 'Pushes boids in a direction',
    color: '#b23bff',
    glow: 'rgba(178,59,255,0.35)',
    radius: 100,
  },
};

// ─── Boid Config ────────────────────────────────────────────
export const BOID_CONFIG = {
  maxSpeed: 3.2,
  minSpeed: 0.6,
  perceptionRadius: 70,
  separationDist: 28,
  separationWeight: 1.8,
  alignmentWeight: 1.0,
  cohesionWeight: 1.0,
  beaconWeight: 2.8,
  obstacleAvoidDist: 50,
  obstacleWeight: 4.0,
  predatorFleeDist: 120,
  predatorWeight: 5.0,
  boundaryMargin: 40,
  boundaryWeight: 0.8,
  goalPullWeight: 0.15,
  trailLength: 8,
  size: 5,
};

// ─── Predator Config ────────────────────────────────────────
export const PREDATOR_CONFIG = {
  speed: 1.8,
  size: 10,
  chaseSpeed: 2.5,
  chaseRadius: 150,
};

// ─── Star Thresholds (% of boids saved) ─────────────────────
export const STAR_THRESHOLDS = [0.5, 0.75, 0.92];

// ─── Levels ─────────────────────────────────────────────────
export const LEVELS = [
  // ── Level 1: "First Flight" ── Tutorial
  {
    level: 1,
    title: 'First Flight',
    description: 'Guide your flock to the glowing nest.',
    newMechanic: null,
    boidCount: 15,
    boidColors: ['#00e5ff'],
    timeLimit: 35,
    allowDrag: false,
    timedBeacons: false,
    beaconDuration: 0,
    beaconBudget: { magnet: 2 },
    startZone: { x: 50, y: 220, w: 80, h: 260 },
    goals: [{ x: 1080, y: 350, r: 70, color: null, minBoids: 8 }],
    obstacles: [],
    predators: [],
    currents: [],
    warps: [],
  },

  // ── Level 2: "The Wall" ── Repeller introduction
  {
    level: 2,
    title: 'The Wall',
    description: 'A barrier blocks the way. Push around it!',
    newMechanic: '🔴 Repeller beacon — pushes boids away!',
    boidCount: 20,
    boidColors: ['#00e5ff'],
    timeLimit: 40,
    allowDrag: false,
    timedBeacons: false,
    beaconDuration: 0,
    beaconBudget: { magnet: 1, repeller: 2 },
    startZone: { x: 50, y: 220, w: 80, h: 260 },
    goals: [{ x: 1080, y: 350, r: 70, color: null, minBoids: 12 }],
    obstacles: [{ x: 540, y: 120, w: 30, h: 460 }],
    predators: [],
    currents: [],
    warps: [],
  },

  // ── Level 3: "Fork in the Road" ── Vortex + multi-goal
  {
    level: 3,
    title: 'Fork in the Road',
    description: 'Split the flock — two nests need filling!',
    newMechanic: '🌀 Vortex beacon — splits the flock!',
    boidCount: 28,
    boidColors: ['#00e5ff'],
    timeLimit: 45,
    allowDrag: false,
    timedBeacons: false,
    beaconDuration: 0,
    beaconBudget: { magnet: 2, repeller: 1, vortex: 1 },
    startZone: { x: 50, y: 250, w: 80, h: 200 },
    goals: [
      { x: 1060, y: 170, r: 65, color: null, minBoids: 8 },
      { x: 1060, y: 530, r: 65, color: null, minBoids: 8 },
    ],
    obstacles: [
      { x: 480, y: 300, w: 240, h: 28 },
    ],
    predators: [],
    currents: [],
    warps: [],
  },

  // ── Level 4: "Predator's Shadow" ── Predator + Shelter
  {
    level: 4,
    title: "Predator's Shadow",
    description: 'A hawk patrols the sky. Use shelter to hide!',
    newMechanic: '🛡️ Shelter beacon — safe zone from predators!',
    boidCount: 20,
    boidColors: ['#00e5ff'],
    timeLimit: 45,
    allowDrag: false,
    timedBeacons: false,
    beaconDuration: 0,
    beaconBudget: { magnet: 2, repeller: 1, shelter: 1 },
    startZone: { x: 50, y: 250, w: 80, h: 200 },
    goals: [{ x: 1080, y: 350, r: 70, color: null, minBoids: 12 }],
    obstacles: [],
    predators: [
      { path: [{ x: 580, y: 80 }, { x: 580, y: 620 }], speed: 1.6 },
    ],
    currents: [],
    warps: [],
  },

  // ── Level 5: "Hands On" ── Real-time beacon dragging
  {
    level: 5,
    title: 'Hands On',
    description: 'Drag beacons in real-time through the maze!',
    newMechanic: '✋ Live control — drag beacons during flight!',
    boidCount: 25,
    boidColors: ['#00e5ff'],
    timeLimit: 50,
    allowDrag: true,
    timedBeacons: false,
    beaconDuration: 0,
    beaconBudget: { magnet: 2 },
    startZone: { x: 50, y: 50, w: 80, h: 140 },
    goals: [{ x: 1080, y: 560, r: 70, color: null, minBoids: 15 }],
    obstacles: [
      { x: 240, y: 0, w: 28, h: 480 },
      { x: 460, y: 220, w: 28, h: 480 },
      { x: 680, y: 0, w: 28, h: 480 },
      { x: 900, y: 220, w: 28, h: 480 },
    ],
    predators: [],
    currents: [],
    warps: [],
  },

  // ── Level 6: "Two Tribes" ── Colored flocks + color-tuned beacons
  {
    level: 6,
    title: 'Two Tribes',
    description: 'Route each color to its matching nest!',
    newMechanic: '🎨 Colored beacons — only affect matching boids!',
    boidCount: 30,
    boidColors: ['#00e5ff', '#ff8c3b'],
    timeLimit: 50,
    allowDrag: false,
    timedBeacons: false,
    beaconDuration: 0,
    beaconBudget: { magnet: 3, repeller: 2 },
    startZone: { x: 50, y: 200, w: 80, h: 300 },
    goals: [
      { x: 1060, y: 170, r: 65, color: '#00e5ff', minBoids: 8 },
      { x: 1060, y: 530, r: 65, color: '#ff8c3b', minBoids: 8 },
    ],
    obstacles: [
      { x: 500, y: 280, w: 200, h: 28 },
      { x: 500, y: 392, w: 200, h: 28 },
    ],
    predators: [],
    currents: [],
    warps: [],
  },

  // ── Level 7: "Fade Away" ── Timed beacons
  {
    level: 7,
    title: 'Fade Away',
    description: 'Beacons expire! Chain them along the path.',
    newMechanic: '⏳ Timed beacons — they fade after 6 seconds!',
    boidCount: 25,
    boidColors: ['#00e5ff'],
    timeLimit: 50,
    allowDrag: false,
    timedBeacons: true,
    beaconDuration: 6,
    beaconBudget: { magnet: 6 },
    startZone: { x: 50, y: 300, w: 80, h: 150 },
    goals: [{ x: 1080, y: 350, r: 70, color: null, minBoids: 15 }],
    obstacles: [
      { x: 280, y: 0, w: 28, h: 320 },
      { x: 280, y: 420, w: 28, h: 280 },
      { x: 560, y: 200, w: 28, h: 500 },
      { x: 840, y: 0, w: 28, h: 480 },
    ],
    predators: [],
    currents: [],
    warps: [],
  },

  // ── Level 8: "Jet Stream" ── Wind currents + Stream beacon
  {
    level: 8,
    title: 'Jet Stream',
    description: 'Ride the currents — or fight them!',
    newMechanic: '💨 Stream beacon + wind currents!',
    boidCount: 30,
    boidColors: ['#00e5ff'],
    timeLimit: 45,
    allowDrag: false,
    timedBeacons: false,
    beaconDuration: 0,
    beaconBudget: { magnet: 2, repeller: 1, stream: 2 },
    startZone: { x: 50, y: 300, w: 80, h: 150 },
    goals: [{ x: 1080, y: 350, r: 70, color: null, minBoids: 18 }],
    obstacles: [
      { x: 400, y: 260, w: 28, h: 180 },
      { x: 700, y: 260, w: 28, h: 180 },
    ],
    predators: [],
    currents: [
      { x: 200, y: 80, w: 400, h: 120, fx: 2.0, fy: 0 },
      { x: 200, y: 500, w: 400, h: 120, fx: -1.5, fy: 0 },
      { x: 700, y: 80, w: 350, h: 120, fx: 0, fy: 1.5 },
    ],
    warps: [],
  },

  // ── Level 9: "The Gauntlet" ── Warp portals + everything
  {
    level: 9,
    title: 'The Gauntlet',
    description: 'Portals, predators, walls — use everything!',
    newMechanic: '🌀 Warp portals — teleport through space!',
    boidCount: 30,
    boidColors: ['#00e5ff'],
    timeLimit: 55,
    allowDrag: true,
    timedBeacons: false,
    beaconDuration: 0,
    beaconBudget: { magnet: 2, repeller: 2, shelter: 1, stream: 1 },
    startZone: { x: 50, y: 280, w: 80, h: 180 },
    goals: [{ x: 1080, y: 350, r: 70, color: null, minBoids: 18 }],
    obstacles: [
      { x: 350, y: 0, w: 28, h: 300 },
      { x: 350, y: 400, w: 28, h: 300 },
      { x: 750, y: 150, w: 28, h: 400 },
    ],
    predators: [
      { path: [{ x: 550, y: 120 }, { x: 550, y: 580 }], speed: 1.8 },
    ],
    currents: [],
    warps: [{ x1: 420, y1: 350, x2: 830, y2: 350, radius: 40 }],
  },

  // ── Level 10: "Grand Migration" ── Everything combined
  {
    level: 10,
    title: 'Grand Migration',
    description: 'The ultimate test — guide all tribes home!',
    newMechanic: '🏆 All mechanics combined!',
    boidCount: 50,
    boidColors: ['#00e5ff', '#ff8c3b'],
    timeLimit: 60,
    allowDrag: true,
    timedBeacons: true,
    beaconDuration: 8,
    beaconBudget: { magnet: 3, repeller: 2, vortex: 1, shelter: 1, stream: 1 },
    startZone: { x: 50, y: 200, w: 80, h: 300 },
    goals: [
      { x: 1060, y: 170, r: 65, color: '#00e5ff', minBoids: 12 },
      { x: 1060, y: 530, r: 65, color: '#ff8c3b', minBoids: 12 },
    ],
    obstacles: [
      { x: 350, y: 0, w: 28, h: 260 },
      { x: 350, y: 380, w: 28, h: 320 },
      { x: 650, y: 150, w: 28, h: 200 },
      { x: 650, y: 450, w: 28, h: 250 },
    ],
    predators: [
      { path: [{ x: 500, y: 150 }, { x: 500, y: 550 }], speed: 1.6 },
      { path: [{ x: 800, y: 550 }, { x: 800, y: 150 }], speed: 1.4 },
    ],
    currents: [
      { x: 350, y: 260, w: 300, h: 120, fx: 1.5, fy: 0 },
    ],
    warps: [{ x1: 420, y1: 150, x2: 720, y2: 580, radius: 35 }],
  },
];
