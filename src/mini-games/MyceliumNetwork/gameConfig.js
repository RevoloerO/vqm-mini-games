// Mycelium Network — Game Configuration
// All constants, colors, limits, and milestone definitions.

export const COLORS = {
    background: '#080d08',
    backgroundGradientInner: 'rgba(20, 40, 20, 0.25)',
    backgroundGradientOuter: 'rgba(8, 13, 8, 0)',

    // Node glow palette — randomly assigned on creation
    nodePalette: [
        { core: '#3ddc84', glow: 'rgba(61, 220, 132, 0.5)' },   // green
        { core: '#00e5ff', glow: 'rgba(0, 229, 255, 0.45)' },    // cyan
        { core: '#b388ff', glow: 'rgba(179, 136, 255, 0.45)' },  // purple
        { core: '#76ff03', glow: 'rgba(118, 255, 3, 0.4)' },     // lime
        { core: '#18ffff', glow: 'rgba(24, 255, 255, 0.4)' },    // teal
        { core: '#ea80fc', glow: 'rgba(234, 128, 252, 0.4)' },   // pink
    ],

    // Tendril stroke colors (subtle, semi-transparent)
    tendrilStroke: 'rgba(61, 220, 132, 0.35)',
    tendrilTip: 'rgba(61, 220, 132, 0.08)',

    // Connection glow
    connectionStroke: 'rgba(0, 229, 255, 0.6)',
    connectionGlow: 'rgba(0, 229, 255, 0.3)',

    // Pulse colors
    pulsePalette: [
        'rgba(61, 220, 132, 0.9)',
        'rgba(0, 229, 255, 0.9)',
        'rgba(179, 136, 255, 0.85)',
        'rgba(118, 255, 3, 0.85)',
    ],

    // Particle colors
    particlePalette: [
        'rgba(61, 220, 132, 0.7)',
        'rgba(0, 229, 255, 0.6)',
        'rgba(179, 136, 255, 0.6)',
        'rgba(255, 255, 255, 0.4)',
    ],

    // Milestone flash
    milestoneFlash: 'rgba(61, 220, 132, 0.12)',
};

export const LIMITS = {
    maxNodes: 100,
    maxTendrils: 400,
    maxParticles: 200,
    maxPulses: 60,
};

export const GROWTH = {
    speed: 0.55,              // pixels per frame
    segmentLength: 8,         // distance between recorded points
    noiseAmplitude: 0.05,     // sin-based angle perturbation
    noiseFrequency: 0.3,      // how fast the noise oscillates
    mouseAttraction: 0.03,    // how much tendrils lean toward cursor
    maxLength: 250,           // max tendril length before stopping (px)
    nurtureMultiplier: 2.5,   // double-click speed boost
    nurtureDuration: 2000,    // ms
};

export const CONNECTION = {
    snapRadius: 35,           // px — distance for auto-connect
    pulseSpeed: 0.008,        // t moves 0→1 at this rate per frame
    pulseInterval: 3000,      // ms between automatic pulses on a connection
    connectionGlowWidth: 4,
    connectionShadowBlur: 12,
};

export const NODE = {
    radius: 8,
    glowRadius: 28,
    cooldown: 300,            // ms between node placements
    tendrilsMin: 2,
    tendrilsMax: 4,
    glowPulseSpeed: 0.02,    // oscillation speed for halo
};

export const MILESTONES = [
    { key: 'first-sprout',    threshold: 1,   type: 'nodes',       icon: '🌱', label: 'First Sprout' },
    { key: 'first-link',      threshold: 1,   type: 'connections', icon: '🍄', label: 'First Link' },
    { key: 'web-weaver',      threshold: 10,  type: 'connections', icon: '🕸️', label: 'Web Weaver' },
    { key: 'forest-floor',    threshold: 25,  type: 'nodes',       icon: '🌿', label: 'Forest Floor' },
    { key: 'neural-network',  threshold: 50,  type: 'connections', icon: '✨', label: 'Neural Network' },
    { key: 'mycelial-mind',   threshold: 100, type: 'connections', icon: '🌌', label: 'Mycelial Mind' },
];

export const PARTICLE = {
    spawnCountOnConnect: 30,
    spawnCountOnMilestone: 60,
    baseLife: 60,             // frames
    speed: 1.5,
    friction: 0.96,
};
