// Stained Glass Renderer — Voronoi-inspired jewel tones with lead-line outlines.
// Ink sources become seed points; density regions glow as translucent colored panels.

import { noise2D } from '../simulation/noiseField';
import { STAINED_GLASS } from '../gameConfig';

/**
 * Create a stained glass color mapper.
 * Each cell gets a jewel tone based on its position, with bright translucent fill.
 */
export function createStainedGlassColorMapper(colorMode) {
    const baseRGB = colorMode?.rgb || [180, 40, 50];
    const palette = STAINED_GLASS.colors.palette;

    return function stainedGlassColorMapper(density, age, moisture, _species, col, row) {
        if (density < 0.008) return null;

        // Use noise to assign each cell region a color from the palette
        const n = noise2D(col * 0.08 + 200, row * 0.08 + 200);
        const colorIdx = Math.abs(Math.floor((n + 1) * palette.length * 0.5)) % palette.length;
        const regionColor = palette[colorIdx];

        // Blend region color with the selected color mode
        const blend = 0.4;
        let r = Math.round(regionColor[0] * (1 - blend) + baseRGB[0] * blend);
        let g = Math.round(regionColor[1] * (1 - blend) + baseRGB[1] * blend);
        let b = Math.round(regionColor[2] * (1 - blend) + baseRGB[2] * blend);

        // Noise for glass texture variation
        const tex = noise2D(col * 0.5 + 500, row * 0.5 + 500);
        const variation = Math.round(tex * 20);
        r = Math.max(0, Math.min(255, r + variation));
        g = Math.max(0, Math.min(255, g + variation));
        b = Math.max(0, Math.min(255, b + variation));

        // Bright, luminous alpha — glass panels are translucent
        const alpha = Math.min(220, Math.round(Math.pow(density, 0.5) * 220));

        return [r, g, b, alpha];
    };
}

/**
 * Stained glass overlay — lead lines at density boundaries + light glow.
 */
export function drawStainedGlassOverlay(ctx, grid, canvasWidth, canvasHeight, frame) {
    const { cols, rows } = grid;
    const cellW = canvasWidth / cols;
    const cellH = canvasHeight / rows;

    ctx.save();

    // Lead lines — dark outlines at edges between filled and empty cells
    ctx.globalCompositeOperation = 'source-over';
    for (let row = 1; row < rows - 1; row += 1) {
        for (let col = 1; col < cols - 1; col += 1) {
            const gi = row * cols + col;
            if (grid.density[gi] < 0.05) continue;

            // Check if this is an edge cell (neighbor has low density or different noise region)
            let isEdge = false;
            const n0 = noise2D(col * 0.08 + 200, row * 0.08 + 200);
            const region0 = Math.floor((n0 + 1) * 4);

            const neighbors = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (const [dx, dy] of neighbors) {
                const nc = col + dx;
                const nr = row + dy;
                const ni = nr * cols + nc;

                if (grid.density[ni] < 0.03) {
                    isEdge = true;
                    break;
                }
                const n1 = noise2D(nc * 0.08 + 200, nr * 0.08 + 200);
                const region1 = Math.floor((n1 + 1) * 4);
                if (region1 !== region0 && grid.density[ni] > 0.05) {
                    isEdge = true;
                    break;
                }
            }

            if (isEdge) {
                const cx = (col + 0.5) * cellW;
                const cy = (row + 0.5) * cellH;
                ctx.fillStyle = `rgba(20, 15, 25, ${0.6 + grid.density[gi] * 0.3})`;
                ctx.fillRect(cx - cellW * 0.6, cy - cellH * 0.6, cellW * 1.2, cellH * 1.2);
            }
        }
    }

    // Light glow through glass — additive bloom
    ctx.globalCompositeOperation = 'screen';
    const glowPhase = frame * 0.008;
    for (let row = 0; row < rows; row += 6) {
        for (let col = 0; col < cols; col += 6) {
            const gi = row * cols + col;
            if (grid.density[gi] < 0.25) continue;

            const shimmer = Math.sin(glowPhase + col * 0.1 + row * 0.12) * 0.5 + 0.5;
            if (shimmer < 0.3) continue;

            const cx = (col + 3) * cellW;
            const cy = (row + 3) * cellH;
            const alpha = (shimmer - 0.3) * STAINED_GLASS.colors.glowIntensity * grid.density[gi] * 0.15;

            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cellW * 5);
            grad.addColorStop(0, `rgba(255, 240, 220, ${alpha})`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, cellW * 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.restore();
}
