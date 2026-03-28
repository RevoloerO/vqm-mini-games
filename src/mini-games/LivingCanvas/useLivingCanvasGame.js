// useLivingCanvasGame.js — Core game hook for Living Canvas.
// Manages simulation grid, animation loop, input handling, skin switching,
// art brushes, and symmetry system.
// All game state lives in refs for performance; only UI counters use useState.

import { useRef, useState, useEffect, useCallback } from 'react';
import { GRID, SOURCE, SUPPLY, VELOCITY, INK, MOSS, STAINED_GLASS, FRACTAL_GROWTH, TOPOGRAPHIC, OP_ART, POINTILLISM, ALL_SKINS } from './gameConfig';
import { createGrid, placePoints, applyVelocity, addMoisture, clearGrid, removeDensity } from './simulation/grid';
import { stepSimulation, getGridStats } from './simulation/cellularAutomata';
import { generateBackground, renderGridArtistic, drawCursor, updateParticles, drawParticles, spawnParticles } from './skins/sharedRenderer';
import { createInkColorMapper, drawInkOverlay } from './skins/inkFlowRenderer';
import { createMossColorMapper, drawMossOverlay } from './skins/mossWorldRenderer';
import { createStainedGlassColorMapper, drawStainedGlassOverlay } from './skins/stainedGlassRenderer';
import { createFractalGrowthColorMapper, drawFractalGrowthOverlay } from './skins/fractalGrowthRenderer';
import { createTopographicColorMapper, drawTopographicOverlay } from './skins/topographicRenderer';
import { createOpArtColorMapper, drawOpArtOverlay } from './skins/opArtRenderer';
import { createPointillismColorMapper, drawPointillismOverlay } from './skins/pointillismRenderer';
import { generateBrushPoints, BRUSH_TYPES, SYMMETRY_MODES } from './simulation/artBrushes';

// Skin config lookup
const SKIN_CONFIGS = {
    ink: INK,
    moss: MOSS,
    stainedGlass: STAINED_GLASS,
    fractalGrowth: FRACTAL_GROWTH,
    topographic: TOPOGRAPHIC,
    opArt: OP_ART,
    pointillism: POINTILLISM,
};

// Color mapper factories per skin
const COLOR_MAPPER_FACTORIES = {
    ink: createInkColorMapper,
    moss: () => createMossColorMapper(),
    stainedGlass: createStainedGlassColorMapper,
    fractalGrowth: createFractalGrowthColorMapper,
    topographic: createTopographicColorMapper,
    opArt: createOpArtColorMapper,
    pointillism: createPointillismColorMapper,
};

// Overlay renderers per skin
const OVERLAY_RENDERERS = {
    ink: drawInkOverlay,
    moss: drawMossOverlay,
    stainedGlass: drawStainedGlassOverlay,
    fractalGrowth: drawFractalGrowthOverlay,
    topographic: drawTopographicOverlay,
    opArt: drawOpArtOverlay,
    pointillism: drawPointillismOverlay,
};

// Background type per skin
function getBgType(skinId) {
    if (skinId === 'ink' || skinId === 'topographic' || skinId === 'pointillism' || skinId === 'opArt') return 'paper';
    if (skinId === 'moss') return 'stone';
    return 'dark'; // stainedGlass, fractalGrowth, opArt
}

export const useLivingCanvasGame = () => {
    const canvasRef = useRef(null);

    // --- Skin state (React-controlled for UI updates) ---
    const [skin, setSkin] = useState('ink');
    const [activeSpecies, setActiveSpecies] = useState(0);
    const [inkColorMode, setInkColorMode] = useState(0);

    // --- Art brush + symmetry state ---
    const [activeBrush, setActiveBrush] = useState('circle');
    const [symmetryMode, setSymmetryMode] = useState('none');

    // --- UI state ---
    const [coverage, setCoverage] = useState(0);
    const [activeCount, setActiveCount] = useState(0);
    const [supply, setSupply] = useState(SUPPLY.max);

    // --- Refs for game state ---
    const gridRef = useRef(null);
    const bgImageDataRef = useRef(null);
    const frameRef = useRef(0);
    const animIdRef = useRef(null);
    const particlesRef = useRef([]);
    const supplyRef = useRef(SUPPLY.max);
    const lastPlaceRef = useRef(0);
    const supplyIdleRef = useRef(0);

    // Mouse/touch tracking
    const mouseRef = useRef({ x: -999, y: -999, down: false, dragging: false });
    const prevMouseRef = useRef({ x: -999, y: -999 });
    const holdStartRef = useRef(0);
    const dragSpeedRef = useRef(0);
    const lastMoveTimeRef = useRef(0);
    const skinRef = useRef('ink');
    const activeSpeciesRef = useRef(0);
    const inkColorModeRef = useRef(0);
    const activeBrushRef = useRef('circle');
    const symmetryModeRef = useRef('none');

    // Keep refs in sync with state
    useEffect(() => { skinRef.current = skin; }, [skin]);
    useEffect(() => { activeSpeciesRef.current = activeSpecies; }, [activeSpecies]);
    useEffect(() => { inkColorModeRef.current = inkColorMode; }, [inkColorMode]);
    useEffect(() => { activeBrushRef.current = activeBrush; }, [activeBrush]);
    useEffect(() => { symmetryModeRef.current = symmetryMode; }, [symmetryMode]);

    // --- Initialize grid (only once, or on explicit reset) ---
    const initGrid = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const parent = canvas.parentElement;
        const width = parent.clientWidth;
        const height = parent.clientHeight;

        const cols = Math.max(GRID.minCols, Math.floor(width / GRID.cellSize));
        const rows = Math.max(GRID.minRows, Math.floor(height / GRID.cellSize));

        gridRef.current = createGrid(cols, rows);

        // Pre-fill moisture
        const grid = gridRef.current;
        for (let i = 0; i < cols * rows; i++) {
            grid.moisture[i] = 0.15;
        }

        supplyRef.current = SUPPLY.max;
        setSupply(SUPPLY.max);
        particlesRef.current = [];
    }, []);

    // --- Resize canvas + regenerate background (preserves grid) ---
    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const parent = canvas.parentElement;
        const width = parent.clientWidth;
        const height = parent.clientHeight;
        canvas.width = width;
        canvas.height = height;

        // Regenerate background texture at new size
        const bgType = getBgType(skinRef.current);
        bgImageDataRef.current = generateBackground(width, height, bgType);
    }, []);

    // --- Convert screen coords to grid coords ---
    const screenToGrid = useCallback((screenX, screenY) => {
        const canvas = canvasRef.current;
        const grid = gridRef.current;
        if (!canvas || !grid) return { col: 0, row: 0, px: 0, py: 0 };
        const rect = canvas.getBoundingClientRect();
        const px = (screenX - rect.left) * (canvas.width / rect.width);
        const py = (screenY - rect.top) * (canvas.height / rect.height);
        const col = Math.floor((px / canvas.width) * grid.cols);
        const row = Math.floor((py / canvas.height) * grid.rows);
        return { col, row, px, py };
    }, []);

    // --- Place art brush at grid position ---
    const doPlace = useCallback((col, row, px, py) => {
        const grid = gridRef.current;
        if (!grid) return;

        const now = performance.now();
        if (now - lastPlaceRef.current < SOURCE.cooldown) return;
        if (supplyRef.current < SOURCE.supplyCost) return;

        lastPlaceRef.current = now;
        supplyRef.current = Math.max(0, supplyRef.current - SOURCE.supplyCost);
        supplyIdleRef.current = 0;

        // Pressure from hold duration
        const holdDuration = mouseRef.current.down ? (now - holdStartRef.current) : 0;
        const pressureFactor = Math.min(1, holdDuration / 800);

        // --- Drag speed affects line quality ---
        const speed = dragSpeedRef.current;
        const isDragging = mouseRef.current.dragging;
        let speedFactor;
        if (isDragging && speed > 0) {
            speedFactor = Math.min(1, speed / 20);
        } else {
            speedFactor = 0;
        }

        // Radius: smaller when fast, larger when slow/holding
        const baseR = SOURCE.baseRadius + (SOURCE.maxRadius - SOURCE.baseRadius) * pressureFactor;
        const speedRadiusScale = isDragging ? (1 - speedFactor * 0.6) : 1;
        const radius = Math.max(1, Math.round(baseR * speedRadiusScale));

        // Density: lighter when fast, heavier when slow/holding
        const baseDens = SOURCE.baseDensity + (SOURCE.maxDensity - SOURCE.baseDensity) * pressureFactor;
        const speedDensityScale = isDragging ? (0.35 + 0.65 * (1 - speedFactor)) : 1;
        const density = baseDens * speedDensityScale;

        const currentSkin = skinRef.current;
        const speciesId = currentSkin === 'moss' ? activeSpeciesRef.current : 0;
        const brushId = activeBrushRef.current;
        const symMode = symmetryModeRef.current;

        // Grid center for symmetry
        const centerCol = Math.floor(grid.cols / 2);
        const centerRow = Math.floor(grid.rows / 2);

        // Generate brush points with symmetry
        const points = generateBrushPoints(
            brushId, col, row, radius, density,
            symMode, centerCol, centerRow
        );

        // Place all points on the grid
        placePoints(grid, points, speciesId, SOURCE.baseMoisture);

        // Spawn particles at screen position
        const skinConfig = SKIN_CONFIGS[currentSkin];
        const particleColor = getParticleColor(currentSkin, skinConfig, speciesId);
        const particleCount = Math.min(20, 5 + Math.round(pressureFactor * 8) + (brushId !== 'circle' ? 5 : 0));
        spawnParticles(particlesRef.current, px, py, particleCount, particleColor);

        // For symmetry — also spawn particles at mirrored screen positions
        if (symMode !== 'none') {
            const canvas = canvasRef.current;
            if (canvas) {
                const screenCenterX = canvas.width / 2;
                const screenCenterY = canvas.height / 2;
                const mirrorPx = 2 * screenCenterX - px;
                const mirrorPy = 2 * screenCenterY - py;
                if (symMode === 'mirrorX' || symMode === 'mirrorXY') {
                    spawnParticles(particlesRef.current, mirrorPx, py, 3, particleColor);
                }
                if (symMode === 'mirrorY' || symMode === 'mirrorXY') {
                    spawnParticles(particlesRef.current, px, mirrorPy, 3, particleColor);
                }
                if (symMode.startsWith('radial')) {
                    const n = parseInt(symMode.replace('radial', ''), 10) || 4;
                    for (let k = 1; k < Math.min(n, 4); k++) {
                        const angle = (k / n) * Math.PI * 2;
                        const dx = px - screenCenterX;
                        const dy = py - screenCenterY;
                        const rpx = screenCenterX + dx * Math.cos(angle) - dy * Math.sin(angle);
                        const rpy = screenCenterY + dx * Math.sin(angle) + dy * Math.cos(angle);
                        spawnParticles(particlesRef.current, rpx, rpy, 2, particleColor);
                    }
                }
            }
        }
    }, []);

    // --- Event handlers ---
    const handlePointerDown = useCallback((e) => {
        e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const { col, row, px, py } = screenToGrid(clientX, clientY);

        mouseRef.current = { x: px, y: py, down: true, dragging: false };
        prevMouseRef.current = { x: px, y: py };
        holdStartRef.current = performance.now();
        dragSpeedRef.current = 0;
        lastMoveTimeRef.current = performance.now();

        doPlace(col, row, px, py);
    }, [screenToGrid, doPlace]);

    const handlePointerMove = useCallback((e) => {
        e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const { col, row, px, py } = screenToGrid(clientX, clientY);

        const prev = prevMouseRef.current;
        const dx = px - prev.x;
        const dy = py - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Track drag speed
        const now = performance.now();
        const dt = now - lastMoveTimeRef.current;
        if (dt > 0 && dist > 0) {
            const instantSpeed = dist / Math.max(dt, 1);
            dragSpeedRef.current = dragSpeedRef.current * 0.6 + instantSpeed * 40 * 0.4;
        }
        lastMoveTimeRef.current = now;

        mouseRef.current.x = px;
        mouseRef.current.y = py;

        if (mouseRef.current.down) {
            mouseRef.current.dragging = true;

            // Apply velocity to grid cells for directional bias
            if (dist > 2 && gridRef.current) {
                const nvx = (dx / dist) * VELOCITY.dragMultiplier;
                const nvy = (dy / dist) * VELOCITY.dragMultiplier;
                applyVelocity(gridRef.current, col, row, VELOCITY.brushRadius, nvx, nvy);
                addMoisture(gridRef.current, col, row, VELOCITY.brushRadius, 0.08);
            }

            // Continuous placement
            const speed = dragSpeedRef.current;
            const baseSpacing = activeBrushRef.current === 'circle' ? GRID.cellSize * 0.8 : GRID.cellSize * 2;
            const speedSpacing = speed > 10 ? baseSpacing * 0.5 : baseSpacing;
            if (dist > speedSpacing) {
                const steps = Math.max(1, Math.floor(dist / speedSpacing));
                for (let s = 0; s < steps; s++) {
                    const t = (s + 1) / steps;
                    const interpX = prev.x + dx * t;
                    const interpY = prev.y + dy * t;
                    const interpCol = Math.floor(interpX / (canvasRef.current?.width || 1) * (gridRef.current?.cols || 1));
                    const interpRow = Math.floor(interpY / (canvasRef.current?.height || 1) * (gridRef.current?.rows || 1));
                    doPlace(interpCol, interpRow, interpX, interpY);
                }
                prevMouseRef.current = { x: px, y: py };
            }
        } else {
            prevMouseRef.current = { x: px, y: py };
        }
    }, [screenToGrid, doPlace]);

    const handlePointerUp = useCallback(() => {
        mouseRef.current.down = false;
        mouseRef.current.dragging = false;
        dragSpeedRef.current = 0;
    }, []);

    const handleDoubleClick = useCallback((e) => {
        const { col, row } = screenToGrid(e.clientX, e.clientY);
        if (gridRef.current) {
            const currentSkin = skinRef.current;
            if (currentSkin === 'moss') {
                addMoisture(gridRef.current, col, row, 10, 0.6);
                spawnParticles(particlesRef.current, mouseRef.current.x, mouseRef.current.y, 15, 'rgba(255, 255, 180, 0.6)');
            } else {
                // All other skins: blot/absorb
                removeDensity(gridRef.current, col, row, 5);
            }
        }
    }, [screenToGrid]);

    // --- Clear / Reset ---
    const resetCanvas = useCallback(() => {
        if (gridRef.current) {
            clearGrid(gridRef.current);
            const grid = gridRef.current;
            for (let i = 0; i < grid.cols * grid.rows; i++) {
                grid.moisture[i] = 0.15;
            }
        }
        supplyRef.current = SUPPLY.max;
        supplyIdleRef.current = 0;
        particlesRef.current = [];
        setSupply(SUPPLY.max);
        setCoverage(0);
        setActiveCount(0);
    }, []);

    // --- Skin switching ---
    const switchSkin = useCallback((newSkin) => {
        setSkin(newSkin);
        skinRef.current = newSkin;
        setInkColorMode(0);
        inkColorModeRef.current = 0;

        const canvas = canvasRef.current;
        if (canvas) {
            const bgType = getBgType(newSkin);
            bgImageDataRef.current = generateBackground(canvas.width, canvas.height, bgType);
        }
        resetCanvas();
    }, [resetCanvas]);

    // --- Animation loop ---
    useEffect(() => {
        initGrid();
        resizeCanvas();

        const loop = () => {
            const canvas = canvasRef.current;
            const grid = gridRef.current;
            const bg = bgImageDataRef.current;
            if (!canvas || !grid || !bg) {
                animIdRef.current = requestAnimationFrame(loop);
                return;
            }

            const ctx = canvas.getContext('2d');
            const frame = frameRef.current++;
            const currentSkin = skinRef.current;
            const skinConfig = SKIN_CONFIGS[currentSkin];

            // --- Simulation step ---
            const simParams = currentSkin === 'moss' ? {
                ...MOSS.sim,
                spreadPerSpecies: MOSS.species.reduce((acc, sp) => {
                    acc[sp.id] = sp.spreadRate;
                    return acc;
                }, {}),
            } : skinConfig.sim;
            stepSimulation(grid, simParams, frame);

            // --- Supply regen ---
            supplyIdleRef.current++;
            if (supplyIdleRef.current > SUPPLY.regenDelay && supplyRef.current < SUPPLY.max) {
                supplyRef.current = Math.min(SUPPLY.max, supplyRef.current + SUPPLY.regenRate);
            }

            // --- Render ---
            const colorModes = skinConfig.colorModes;
            const currentColorMode = colorModes ? colorModes[inkColorModeRef.current % colorModes.length] : null;

            const mapperFactory = COLOR_MAPPER_FACTORIES[currentSkin];
            const colorMapper = currentSkin === 'moss'
                ? mapperFactory()
                : mapperFactory(currentColorMode);

            // Determine rendering composite mode
            const renderSkinType = getRenderSkinType(currentSkin);
            renderGridArtistic(ctx, grid, colorMapper, bg, renderSkinType);

            // Overlay effects
            const overlayRenderer = OVERLAY_RENDERERS[currentSkin];
            if (overlayRenderer) {
                overlayRenderer(ctx, grid, canvas.width, canvas.height, frame);
            }

            // Draw symmetry guide lines
            const symMode = symmetryModeRef.current;
            if (symMode !== 'none') {
                drawSymmetryGuides(ctx, canvas.width, canvas.height, symMode, currentSkin);
            }

            // Particles
            updateParticles(particlesRef.current);
            drawParticles(ctx, particlesRef.current);

            // Cursor
            const m = mouseRef.current;
            if (m.x > 0 && m.y > 0) {
                const holdDuration = m.down ? (performance.now() - holdStartRef.current) : 0;
                const pressureFactor = Math.min(1, holdDuration / 800);
                const cursorRadius = (SOURCE.baseRadius + (SOURCE.maxRadius - SOURCE.baseRadius) * pressureFactor) * GRID.cellSize;
                const cursorColor = skinConfig.cursorColor || INK.cursorColor;
                drawCursor(ctx, m.x, m.y, cursorRadius, cursorColor);
            }

            // --- Sync UI state every 20 frames ---
            if (frame % 20 === 0) {
                const stats = getGridStats(grid);
                setCoverage(stats.coveragePercent);
                setActiveCount(stats.activeCount);
                setSupply(Math.round(supplyRef.current));
            }

            animIdRef.current = requestAnimationFrame(loop);
        };

        animIdRef.current = requestAnimationFrame(loop);

        return () => {
            if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
        };
    }, [initGrid, resizeCanvas]);

    // --- Resize handler (preserves grid!) ---
    useEffect(() => {
        const handleResize = () => {
            resizeCanvas();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [resizeCanvas]);

    return {
        canvasRef,
        skin,
        switchSkin,
        activeSpecies,
        setActiveSpecies,
        inkColorMode,
        setInkColorMode,
        activeBrush,
        setActiveBrush,
        symmetryMode,
        setSymmetryMode,
        coverage,
        activeCount,
        supply,
        resetCanvas,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handleDoubleClick,
    };
};

// --- Helper: Get particle color for a skin ---
function getParticleColor(skinId, skinConfig, speciesId) {
    switch (skinId) {
        case 'ink': return 'rgba(40, 40, 60, 0.5)';
        case 'moss': {
            const sp = MOSS.species[speciesId];
            return sp ? `rgba(${sp.colorRange[1].join(',')}, 0.6)` : 'rgba(74, 139, 63, 0.6)';
        }
        case 'stainedGlass': return 'rgba(200, 160, 40, 0.5)';
        case 'fractalGrowth': return 'rgba(120, 200, 255, 0.5)';
        case 'topographic': return 'rgba(139, 90, 43, 0.4)';
        case 'opArt': return 'rgba(0, 0, 0, 0.4)';
        case 'pointillism': return 'rgba(200, 80, 60, 0.5)';
        default: return 'rgba(100, 100, 100, 0.4)';
    }
}

// --- Helper: Map skin to render composite type for sharedRenderer ---
function getRenderSkinType(skinId) {
    // 'ink' uses multiply compositing; 'moss' uses source-over + screen glow
    // New skins choose based on their background
    switch (skinId) {
        case 'ink':
        case 'topographic':
        case 'pointillism':
            return 'ink'; // multiply on light paper
        case 'moss':
        case 'stainedGlass':
        case 'fractalGrowth':
            return 'moss'; // source-over on dark background
        case 'opArt':
            return 'ink'; // multiply on white
        default:
            return 'ink';
    }
}

// --- Symmetry guide line renderer ---
function drawSymmetryGuides(ctx, width, height, mode, skinId) {
    ctx.save();
    const isDark = ['moss', 'stainedGlass', 'fractalGrowth'].includes(skinId);
    const color = isDark ? 'rgba(200, 200, 200, 0.12)' : 'rgba(100, 80, 60, 0.12)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);

    const cx = width / 2;
    const cy = height / 2;

    if (mode === 'mirrorX' || mode === 'mirrorXY') {
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, height);
        ctx.stroke();
    }

    if (mode === 'mirrorY' || mode === 'mirrorXY') {
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(width, cy);
        ctx.stroke();
    }

    if (mode.startsWith('radial')) {
        const n = parseInt(mode.replace('radial', ''), 10) || 4;
        const maxR = Math.max(width, height);
        for (let i = 0; i < n; i++) {
            const angle = (i / n) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
            ctx.stroke();
        }
    }

    ctx.setLineDash([]);
    ctx.restore();
}
