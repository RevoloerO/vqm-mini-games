// Pointillism Renderer — Neo-impressionist dot-based color mixing.
// Density maps to dot size/spacing; colors mix optically via adjacent dots.

import { noise2D } from '../simulation/noiseField';
import { POINTILLISM } from '../gameConfig';

/**
 * Create a pointillism color mapper.
 * Uses a halftone-like approach: dots of primary colors placed in patterns.
 */
export function createPointillismColorMapper(colorMode) {
    const baseRGB = colorMode?.rgb || [220, 50, 47];
    const palette = POINTILLISM.colors.palette;

    return function pointillismColorMapper(density, age, moisture, _species, col, row) {
        if (density < 0.015) return null;

        // Determine dot placement — Poisson-disk-like pattern using noise
        const n1 = noise2D(col * 0.8 + 600, row * 0.8 + 600);
        const n2 = noise2D(col * 1.2 + 700, row * 1.2 + 700);

        // Only render dots at certain positions (creates discrete dot pattern)
        const dotThreshold = 0.3 - density * 0.25; // denser = more dots
        if (Math.abs(n1) > dotThreshold && Math.abs(n2) > dotThreshold) {
            return null; // gap between dots
        }

        // Select dot color from palette based on position noise
        const n3 = noise2D(col * 0.3 + 800, row * 0.3 + 800);
        const colorIdx = Math.abs(Math.floor((n3 + 1) * palette.length * 0.5)) % palette.length;
        const dotColor = palette[colorIdx];

        // Blend with base color mode
        const blend = 0.35;
        let r = Math.round(dotColor[0] * (1 - blend) + baseRGB[0] * blend);
        let g = Math.round(dotColor[1] * (1 - blend) + baseRGB[1] * blend);
        let b = Math.round(dotColor[2] * (1 - blend) + baseRGB[2] * blend);

        // Slight variation per dot
        const variation = Math.round(n1 * 15);
        r = Math.max(0, Math.min(255, r + variation));
        g = Math.max(0, Math.min(255, g + variation));
        b = Math.max(0, Math.min(255, b + variation));

        // Dots are solid when placed
        const alpha = Math.min(230, Math.round(Math.pow(density, 0.5) * 230));

        return [r, g, b, alpha];
    };
}

/**
 * Pointillism overlay — dot shadow depth and highlight shimmer.
 */
export function drawPointillismOverlay(ctx, grid, canvasWidth, canvasHeight, frame) {
    const { cols, rows } = grid;
    const cellW = canvasWidth / cols;
    const cellH = canvasHeight / rows;

    ctx.save();

    // Subtle raised-dot shadow effect
    ctx.globalCompositeOperation = 'multiply';
    for (let row = 1; row < rows; row += 4) {
        for (let col = 1; col < cols; col += 4) {
            const gi = row * cols + col;
            if (grid.density[gi] < 0.25) continue;

            const n = noise2D(col * 0.8 + 600, row * 0.8 + 600);
            if (Math.abs(n) > 0.25) continue; // only at dot positions

            const cx = (col + 0.5) * cellW;
            const cy = (row + 0.5) * cellH;
            const dotR = cellW * (0.3 + grid.density[gi] * 0.5);
            const alpha = 0.08 * grid.density[gi];

            ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            ctx.beginPath();
            ctx.arc(cx + cellW * 0.2, cy + cellH * 0.2, dotR, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Light highlight on dense dot clusters
    ctx.globalCompositeOperation = 'screen';
    for (let row = 0; row < rows; row += 8) {
        for (let col = 0; col < cols; col += 8) {
            const gi = row * cols + col;
            if (grid.density[gi] < 0.4) continue;

            const shimmer = Math.sin(frame * 0.02 + col * 0.2 + row * 0.15) * 0.5 + 0.5;
            if (shimmer < 0.6) continue;

            const cx = (col + 4) * cellW;
            const cy = (row + 4) * cellH;
            const alpha = (shimmer - 0.6) * 0.06 * grid.density[gi];

            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cellW * 5);
            grad.addColorStop(0, `rgba(255, 250, 240, ${alpha})`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, cellW * 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.restore();
}
