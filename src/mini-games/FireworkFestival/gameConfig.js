// ─── Colors ─────────────────────────────────────────────────
export const COLORS = {
  red:    { key: 'red',    name: 'Red',    hex: '#ff3b3b', glow: 'rgba(255,59,59,0.6)' },
  blue:   { key: 'blue',   name: 'Blue',   hex: '#3b8bff', glow: 'rgba(59,139,255,0.6)' },
  yellow: { key: 'yellow', name: 'Yellow', hex: '#ffe03b', glow: 'rgba(255,224,59,0.6)' },
  green:  { key: 'green',  name: 'Green',  hex: '#3bff6e', glow: 'rgba(59,255,110,0.6)' },
  purple: { key: 'purple', name: 'Purple', hex: '#b23bff', glow: 'rgba(178,59,255,0.6)' },
  orange: { key: 'orange', name: 'Orange', hex: '#ff8c3b', glow: 'rgba(255,140,59,0.6)' },
  white:  { key: 'white',  name: 'White',  hex: '#ffffff', glow: 'rgba(255,255,255,0.6)' },
};

export const COLOR_ORDER = ['red', 'blue', 'yellow', 'green', 'purple', 'orange', 'white'];

// ─── Shapes ─────────────────────────────────────────────────
export const SHAPES = {
  circle:   { key: 'circle',   name: 'Circle' },
  square:   { key: 'square',   name: 'Square' },
  triangle: { key: 'triangle', name: 'Triangle' },
};

export const SHAPE_ORDER = ['circle', 'square', 'triangle'];

// ─── Angles ─────────────────────────────────────────────────
export const ANGLES = {
  farLeft:  { key: 'farLeft',  name: 'Far Left',  degrees: -40 },
  left:     { key: 'left',     name: 'Left',       degrees: -20 },
  center:   { key: 'center',   name: 'Straight',   degrees: 0 },
  right:    { key: 'right',    name: 'Right',       degrees: 20 },
  farRight: { key: 'farRight', name: 'Far Right',   degrees: 40 },
};

export const ANGLE_ORDER = ['farLeft', 'left', 'center', 'right', 'farRight'];

// ─── Levels ─────────────────────────────────────────────────
// Each level introduces ONE new twist to keep the player engaged.
// Difficulty follows a wave pattern (tension → breather → higher tension).
export const LEVELS = [
  // ── Act 1: Foundation ───────────────────────
  // Level 1 — "First Spark" (Tutorial)
  {
    level: 1,
    title: 'First Spark',
    cannonCount: 1,
    availableColors: ['red', 'blue', 'yellow'],
    availableShapes: ['circle', 'square', 'triangle'],
    angleMode: false,
    availableAngles: ['center'],
    questCount: 3,
    timeLimit: 60,
    dualQuests: false,
    dualQuestChance: 0,
    sequenceQuests: false,
    questTimeBonus: 0,
    memoryMode: false,
    memoryFadeMs: 0,
    scoreMultiplier: 1,
    description: 'Welcome to the festival!',
    newMechanic: null,
  },
  // Level 2 — "Quick Match" (Speed introduction)
  {
    level: 2,
    title: 'Quick Match',
    cannonCount: 1,
    availableColors: ['red', 'blue', 'yellow'],
    availableShapes: ['circle', 'square', 'triangle'],
    angleMode: false,
    availableAngles: ['center'],
    questCount: 6,
    timeLimit: 50,
    dualQuests: false,
    dualQuestChance: 0,
    sequenceQuests: false,
    questTimeBonus: 4,
    memoryMode: false,
    memoryFadeMs: 0,
    scoreMultiplier: 1.2,
    description: 'Speed matters — match fast for bonus!',
    newMechanic: '⚡ Quick-match bonus!',
  },
  // Level 3 — "Double Trouble" (2nd cannon)
  {
    level: 3,
    title: 'Double Trouble',
    cannonCount: 2,
    availableColors: ['red', 'blue', 'yellow'],
    availableShapes: ['circle', 'square', 'triangle'],
    angleMode: false,
    availableAngles: ['center'],
    questCount: 5,
    timeLimit: 55,
    dualQuests: true,
    dualQuestChance: 0.3,
    sequenceQuests: false,
    questTimeBonus: 4,
    memoryMode: false,
    memoryFadeMs: 0,
    scoreMultiplier: 1.5,
    description: 'Two cannons! Manage both wisely.',
    newMechanic: '🎯 Second cannon!',
  },

  // ── Act 2: Dual-Cannon Practice ─────────────
  // Level 4 — "Color Splash" (+Green, practice dual)
  {
    level: 4,
    title: 'Color Splash',
    cannonCount: 2,
    availableColors: ['red', 'blue', 'yellow', 'green'],
    availableShapes: ['circle', 'square', 'triangle'],
    angleMode: false,
    availableAngles: ['center'],
    questCount: 6,
    timeLimit: 55,
    dualQuests: true,
    dualQuestChance: 0.35,
    sequenceQuests: false,
    questTimeBonus: 4,
    memoryMode: false,
    memoryFadeMs: 0,
    scoreMultiplier: 1.8,
    description: 'Green joins — juggle both cannons!',
    newMechanic: '🎨 New color!',
  },
  // Level 5 — "Dual Mastery" (+Purple, more dual quests)
  {
    level: 5,
    title: 'Dual Mastery',
    cannonCount: 2,
    availableColors: ['red', 'blue', 'yellow', 'green', 'purple'],
    availableShapes: ['circle', 'square', 'triangle'],
    angleMode: false,
    availableAngles: ['center'],
    questCount: 7,
    timeLimit: 50,
    dualQuests: true,
    dualQuestChance: 0.5,
    sequenceQuests: false,
    questTimeBonus: 4,
    memoryMode: false,
    memoryFadeMs: 0,
    scoreMultiplier: 2.0,
    description: 'Purple arrives — dual quests ramp up!',
    newMechanic: '🎨 Purple unlocked!',
  },

  // ── Act 3: Angles & Complexity ─────────────
  // Level 6 — "Aim High" (Angle introduced!)
  {
    level: 6,
    title: 'Aim High',
    cannonCount: 2,
    availableColors: ['red', 'blue', 'yellow', 'green', 'purple'],
    availableShapes: ['circle', 'square', 'triangle'],
    angleMode: true,
    availableAngles: ['left', 'center', 'right'],
    questCount: 6,
    timeLimit: 60,
    dualQuests: true,
    dualQuestChance: 0.3,
    sequenceQuests: false,
    questTimeBonus: 4,
    memoryMode: false,
    memoryFadeMs: 0,
    scoreMultiplier: 2.2,
    description: 'Aim your cannon — position matters!',
    newMechanic: '📐 Cannon aiming!',
  },
  // Level 7 — "Fading Lights" (Memory challenge)
  {
    level: 7,
    title: 'Fading Lights',
    cannonCount: 2,
    availableColors: ['red', 'blue', 'yellow', 'green', 'purple'],
    availableShapes: ['circle', 'square', 'triangle'],
    angleMode: true,
    availableAngles: ['left', 'center', 'right'],
    questCount: 6,
    timeLimit: 60,
    dualQuests: true,
    dualQuestChance: 0.35,
    sequenceQuests: false,
    questTimeBonus: 0,
    memoryMode: true,
    memoryFadeMs: 3000,
    scoreMultiplier: 2.5,
    description: 'Watch closely — the firework fades!',
    newMechanic: '🧠 Memory mode!',
  },

  // ── Act 4: Mastery ──────────────────────────
  // Level 8 — "Full Arsenal" (All angles + all colors)
  {
    level: 8,
    title: 'Full Arsenal',
    cannonCount: 2,
    availableColors: ['red', 'blue', 'yellow', 'green', 'purple', 'orange', 'white'],
    availableShapes: ['circle', 'square', 'triangle'],
    angleMode: true,
    availableAngles: ['farLeft', 'left', 'center', 'right', 'farRight'],
    questCount: 8,
    timeLimit: 50,
    dualQuests: true,
    dualQuestChance: 0.45,
    sequenceQuests: false,
    questTimeBonus: 4,
    memoryMode: false,
    memoryFadeMs: 0,
    scoreMultiplier: 2.8,
    description: 'All 7 colors & full aim range!',
    newMechanic: '🌈 Full arsenal!',
  },
  // Level 9 — "Chain Reaction" (Sequences + Memory)
  {
    level: 9,
    title: 'Chain Reaction',
    cannonCount: 2,
    availableColors: ['red', 'blue', 'yellow', 'green', 'purple', 'orange', 'white'],
    availableShapes: ['circle', 'square', 'triangle'],
    angleMode: true,
    availableAngles: ['farLeft', 'left', 'center', 'right', 'farRight'],
    questCount: 8,
    timeLimit: 45,
    dualQuests: true,
    dualQuestChance: 0.4,
    sequenceQuests: true,
    sequenceQuestChance: 0.35,
    sequenceLength: 2,
    questTimeBonus: 3,
    memoryMode: true,
    memoryFadeMs: 2500,
    scoreMultiplier: 3.2,
    description: 'Sequences & memory — stay sharp!',
    newMechanic: '🔗 Sequence quests!',
  },

  // ── Grand Finale ──────────────────────────
  // Level 10 — "Grand Finale" (Everything)
  {
    level: 10,
    title: 'Grand Finale',
    cannonCount: 2,
    availableColors: ['red', 'blue', 'yellow', 'green', 'purple', 'orange', 'white'],
    availableShapes: ['circle', 'square', 'triangle'],
    angleMode: true,
    availableAngles: ['farLeft', 'left', 'center', 'right', 'farRight'],
    questCount: 12,
    timeLimit: 35,
    dualQuests: true,
    dualQuestChance: 0.6,
    sequenceQuests: true,
    sequenceQuestChance: 0.3,
    sequenceLength: 3,
    questTimeBonus: 3,
    memoryMode: false,
    memoryFadeMs: 0,
    scoreMultiplier: 4.0,
    description: 'The Grand Finale!',
    newMechanic: '🏆 All mechanics!',
  },
];

// ─── Cannon Config ──────────────────────────────────────────
export const CANNON_CONFIG = {
  width: 44,
  height: 60,
  barrelLength: 40,
  barrelWidth: 14,
  baseYOffset: 60,        // pixels from bottom of canvas
  spacing: 240,            // horizontal distance between cannons
};

// ─── Firework Config ────────────────────────────────────────
export const FIREWORK_CONFIG = {
  launchSpeed: 10,
  launchDeceleration: 0.18,
  horizontalDrag: 0.985,    // subtle drag on vx to limit horizontal spread
  trailParticlesPerFrame: 3,
  trailParticleLife: 35,
  trailParticleSize: 3,
  explosionParticleCount: 100,
  explosionSpeed: 5,
  explosionLife: 70,
  explosionFriction: 0.965,
  explosionGravity: 0.025,
  explosionFadeStart: 0.5,   // start fading at 50% lifetime
};

// ─── Star Config ────────────────────────────────────────────
export const STAR_CONFIG = {
  count: 140,
  twinkleSpeed: 0.02,
  minSize: 0.5,
  maxSize: 2.5,
  minAlpha: 0.3,
  maxAlpha: 1.0,
};

// ─── Game Phases ────────────────────────────────────────────
export const GAME_PHASES = {
  MENU: 'menu',
  PLAYING: 'playing',
  LEVEL_COMPLETE: 'level_complete',
  GAME_COMPLETE: 'game_complete',
};

// ─── Quest Types ────────────────────────────────────────────
export const QUEST_TYPES = {
  SINGLE: 'single',
  DUAL: 'dual',
  SEQUENCE: 'sequence',
};

// ─── Crowd Config ───────────────────────────────────────────
export const CROWD_CONFIG = {
  cheerDuration: 1500,
  booDuration: 1200,
  comboThresholds: [3, 5, 8],  // combo counts where intensity increases
  maxIntensity: 3,
  cheerEmojis: ['🎉', '🥳', '👏', '⭐', '✨', '🔥'],
  booEmojis: ['😮', '💨', '😬'],
  emojiCount: 8,
  emojiRiseSpeed: 1.5,
  emojiLife: 60,
};

// ─── Score Config ───────────────────────────────────────────
export const SCORE_CONFIG = {
  basePoints: 100,
  comboBonus: 25,           // extra per combo level
  timeBonus: 2,             // points per second remaining at level end
  sequenceBonus: 50,        // extra per step completed in sequence
  quickMatchBonus: 50,      // bonus for matching within questTimeBonus seconds
};
