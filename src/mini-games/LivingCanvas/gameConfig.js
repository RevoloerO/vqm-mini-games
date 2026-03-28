// Living Canvas — Game Configuration
// Constants, colors, species, simulation parameters for both skins.

// --- Grid resolution ---
export const GRID = {
    cellSize: 3,         // pixels per grid cell (lower = higher detail, slower)
    minCols: 100,
    minRows: 80,
};

// --- Shared simulation defaults ---
export const SIM_DEFAULTS = {
    baseSpreadProb: 0.12,
    moistureWeight: 0.5,
    densityDecay: 0.92,
    settleAge: 150,
    minSpreadDensity: 0.05,
    diffusionRate: 0.02,
    moistureDecay: 0.998,
    noiseScale: 0.15,
    noiseStrength: 0.4,
    velocityDecay: 0.95,
};

// --- Source placement ---
export const SOURCE = {
    baseRadius: 1,       // grid cells — tiny for fine calligraphic lines
    maxRadius: 4,
    baseDensity: 0.7,    // solid strokes, not faint washes
    maxDensity: 1.0,
    holdGrowRate: 0.12,  // radius grows per 100ms of hold
    baseMoisture: 0.4,   // low moisture = less spread = defined edges
    supplyCost: 3,       // cheap for fluid drawing
    cooldown: 30,        // very responsive for continuous strokes
};

// --- Supply (resource) ---
export const SUPPLY = {
    max: 100,
    regenRate: 0.03,     // per frame in zen mode
    regenDelay: 60,      // frames after last use before regen starts
};

// --- Velocity (drag direction bias) ---
export const VELOCITY = {
    dragMultiplier: 0.5,  // stronger directional pull
    brushRadius: 8,       // tighter area of influence
};

// ============================================
//   INK FLOW SKIN
// ============================================
export const INK = {
    name: 'Ink Flow',
    icon: '🖋️',

    // Simulation overrides — calligraphic: minimal spread, strokes stay defined
    sim: {
        ...SIM_DEFAULTS,
        baseSpreadProb: 0.04,     // very low — ink barely spreads on its own
        diffusionRate: 0.008,     // minimal edge bleeding
        moistureDecay: 0.985,     // ink dries fast → stops spreading quickly
        settleAge: 60,            // settles fast for crisp strokes
        noiseStrength: 0.2,       // subtle variation, not chaotic
        densityDecay: 0.85,       // transferred density drops fast
    },

    // Visual
    background: '#f5f0e0',
    paperTexture: true,
    colors: {
        // Density → color mapping
        wetInk: [26, 26, 46],       // #1a1a2e — blue-black
        dryInk: [42, 37, 32],       // #2a2520 — warm brown-black
        ageThreshold: 80,            // frames before wet→dry shift starts
        ageFull: 180,                // frames when fully dry color
    },

    // Color modes (user selectable)
    colorModes: [
        { id: 'sumi', label: 'Sumi', rgb: [26, 26, 26] },
        { id: 'cinnabar', label: 'Cinnabar', rgb: [194, 48, 48] },
        { id: 'indigo', label: 'Indigo', rgb: [26, 35, 126] },
        { id: 'sepia', label: 'Sepia', rgb: [112, 66, 20] },
    ],

    // Cursor
    cursorColor: 'rgba(26, 26, 26, 0.15)',
};

// ============================================
//   MOSS WORLD SKIN
// ============================================
export const MOSS = {
    name: 'Moss World',
    icon: '🌿',

    // Simulation overrides
    sim: {
        ...SIM_DEFAULTS,
        baseSpreadProb: 0.11,       // slightly slower than ink
        diffusionRate: 0.008,        // minimal bleeding
        moistureDecay: 0.996,        // moisture evaporates moderately
        settleAge: 300,              // moss lives longer
        noiseStrength: 0.55,         // more organic randomness
    },

    // Visual
    background: '#2a2a28',
    stoneTexture: true,
    colors: {
        stoneBase: [42, 42, 40],
        stoneHighlight: [55, 55, 50],
    },

    // Species definitions
    species: [
        {
            id: 0,
            name: 'Emerald Moss',
            emoji: '🌿',
            colorRange: [[45, 90, 39], [74, 139, 63]],
            spreadRate: 0.09,
            clusterBias: 0.7,
        },
        {
            id: 1,
            name: 'Silver Lichen',
            emoji: '🪨',
            colorRange: [[138, 154, 138], [176, 192, 168]],
            spreadRate: 0.12,
            clusterBias: 0.3,
        },
        {
            id: 2,
            name: 'Rust Lichen',
            emoji: '🍂',
            colorRange: [[139, 90, 43], [196, 122, 58]],
            spreadRate: 0.07,
            clusterBias: 0.5,
        },
        {
            id: 3,
            name: 'Star Moss',
            emoji: '✨',
            colorRange: [[58, 106, 58], [90, 170, 90]],
            spreadRate: 0.10,
            clusterBias: 0.4,
            tipGlow: [144, 255, 144],
        },
    ],

    // Cursor
    cursorColor: 'rgba(74, 139, 63, 0.2)',
};

// ============================================
//   STAINED GLASS SKIN
// ============================================
export const STAINED_GLASS = {
    name: 'Stained Glass',
    icon: '🔮',

    sim: {
        ...SIM_DEFAULTS,
        baseSpreadProb: 0.08,
        diffusionRate: 0.003,
        moistureDecay: 0.990,
        settleAge: 100,
        noiseStrength: 0.15,
        densityDecay: 0.88,
    },

    background: '#1a1520',
    paperTexture: false,
    colors: {
        palette: [
            [180, 40, 50],    // ruby
            [30, 80, 180],    // sapphire
            [50, 160, 80],    // emerald
            [200, 160, 40],   // amber
            [140, 50, 160],   // amethyst
            [30, 150, 180],   // teal
            [200, 100, 30],   // copper
            [180, 60, 120],   // rose
        ],
        leadWidth: 2,
        glowIntensity: 0.4,
    },

    colorModes: [
        { id: 'jewel', label: 'Jewel', rgb: [180, 40, 50] },
        { id: 'ocean', label: 'Ocean', rgb: [30, 80, 180] },
        { id: 'forest', label: 'Forest', rgb: [50, 160, 80] },
        { id: 'amber', label: 'Amber', rgb: [200, 160, 40] },
    ],

    cursorColor: 'rgba(200, 160, 40, 0.2)',
};

// ============================================
//   FRACTAL GROWTH SKIN (DLA)
// ============================================
export const FRACTAL_GROWTH = {
    name: 'Fractal Growth',
    icon: '❄',

    sim: {
        ...SIM_DEFAULTS,
        baseSpreadProb: 0.025,
        diffusionRate: 0.002,
        moistureDecay: 0.992,
        settleAge: 200,
        noiseStrength: 0.6,
        densityDecay: 0.95,
        velocityDecay: 0.8,
    },

    background: '#0a0a12',
    paperTexture: false,
    colors: {
        core: [120, 200, 255],
        tip: [255, 255, 255],
        glow: [80, 140, 220],
    },

    colorModes: [
        { id: 'ice', label: 'Ice', rgb: [120, 200, 255] },
        { id: 'lightning', label: 'Lightning', rgb: [200, 150, 255] },
        { id: 'coral', label: 'Coral', rgb: [255, 120, 100] },
        { id: 'gold', label: 'Gold', rgb: [255, 200, 80] },
    ],

    cursorColor: 'rgba(120, 200, 255, 0.2)',
};

// ============================================
//   TOPOGRAPHIC MAP SKIN
// ============================================
export const TOPOGRAPHIC = {
    name: 'Topographic',
    icon: '🗺',

    sim: {
        ...SIM_DEFAULTS,
        baseSpreadProb: 0.10,
        diffusionRate: 0.025,
        moistureDecay: 0.995,
        settleAge: 120,
        noiseStrength: 0.35,
        densityDecay: 0.90,
    },

    background: '#f8f4e8',
    paperTexture: true,
    colors: {
        contourLight: [139, 90, 43],
        contourBold: [80, 50, 20],
        fillLow: [200, 220, 180],
        fillHigh: [120, 80, 40],
    },

    colorModes: [
        { id: 'terrain', label: 'Terrain', rgb: [139, 90, 43] },
        { id: 'ocean', label: 'Ocean', rgb: [30, 80, 160] },
        { id: 'heat', label: 'Heat', rgb: [200, 60, 30] },
        { id: 'forest', label: 'Forest', rgb: [40, 100, 50] },
    ],

    cursorColor: 'rgba(139, 90, 43, 0.15)',
};

// ============================================
//   OP ART SKIN
// ============================================
export const OP_ART = {
    name: 'Op Art',
    icon: '👁',

    sim: {
        ...SIM_DEFAULTS,
        baseSpreadProb: 0.06,
        diffusionRate: 0.015,
        moistureDecay: 0.988,
        settleAge: 80,
        noiseStrength: 0.25,
        densityDecay: 0.90,
    },

    background: '#ffffff',
    paperTexture: false,
    colors: {
        primary: [0, 0, 0],
        secondary: [255, 255, 255],
        stripeFreq: 0.3,
    },

    colorModes: [
        { id: 'bw', label: 'B&W', rgb: [0, 0, 0] },
        { id: 'red', label: 'Red', rgb: [200, 30, 30] },
        { id: 'blue', label: 'Blue', rgb: [30, 30, 200] },
        { id: 'neon', label: 'Neon', rgb: [0, 255, 128] },
    ],

    cursorColor: 'rgba(0, 0, 0, 0.1)',
};

// ============================================
//   POINTILLISM SKIN
// ============================================
export const POINTILLISM = {
    name: 'Pointillism',
    icon: '🎨',

    sim: {
        ...SIM_DEFAULTS,
        baseSpreadProb: 0.07,
        diffusionRate: 0.010,
        moistureDecay: 0.990,
        settleAge: 90,
        noiseStrength: 0.3,
        densityDecay: 0.88,
    },

    background: '#f5f0e5',
    paperTexture: true,
    colors: {
        palette: [
            [220, 50, 47],     // red
            [38, 139, 210],    // blue
            [255, 200, 0],     // yellow
            [42, 161, 152],    // cyan
            [211, 54, 130],    // magenta
            [133, 153, 0],     // green
        ],
    },

    colorModes: [
        { id: 'warm', label: 'Warm', rgb: [220, 50, 47] },
        { id: 'cool', label: 'Cool', rgb: [38, 139, 210] },
        { id: 'sunset', label: 'Sunset', rgb: [255, 140, 0] },
        { id: 'garden', label: 'Garden', rgb: [133, 153, 0] },
    ],

    cursorColor: 'rgba(100, 80, 60, 0.15)',
};

// ============================================
//   ALL SKINS REGISTRY
// ============================================
export const ALL_SKINS = [
    { id: 'ink', config: INK },
    { id: 'moss', config: MOSS },
    { id: 'stainedGlass', config: STAINED_GLASS },
    { id: 'fractalGrowth', config: FRACTAL_GROWTH },
    { id: 'topographic', config: TOPOGRAPHIC },
    { id: 'opArt', config: OP_ART },
    { id: 'pointillism', config: POINTILLISM },
];

// --- Stats display labels per skin ---
export const STAT_LABELS = {
    ink: {
        coverage: '🖋️ Coverage',
        active: '💧 Flowing',
        supply: '🏺 Ink',
    },
    moss: {
        coverage: '🌿 Coverage',
        active: '🌱 Growing',
        supply: '💧 Moisture',
    },
    stainedGlass: {
        coverage: '🔮 Coverage',
        active: '✨ Glowing',
        supply: '🔮 Light',
    },
    fractalGrowth: {
        coverage: '❄ Coverage',
        active: '⚡ Growing',
        supply: '❄ Energy',
    },
    topographic: {
        coverage: '🗺 Coverage',
        active: '📐 Forming',
        supply: '🗺 Terrain',
    },
    opArt: {
        coverage: '👁 Coverage',
        active: '〰 Warping',
        supply: '👁 Pattern',
    },
    pointillism: {
        coverage: '🎨 Coverage',
        active: '🖌 Dotting',
        supply: '🎨 Paint',
    },
};
