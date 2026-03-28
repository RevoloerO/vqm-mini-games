// Moss World Renderer — Species-aware color mapping with organic texture.
// Multiple moss/lichen species with unique color ranges and natural variation.

import { noise2D } from '../simulation/noiseField';
import { MOSS } from '../gameConfig';

/**
 * Create a moss color mapper function.
 * Returns [r, g, b, a] for each cell.
 */
export function createMossColorMapper() {
    const speciesList = MOSS.species;

    return function mossColorMapper(density, age, moisture, speciesId, col, row) {
        if (density < 0.008) return null;

        const sp = speciesList[speciesId] || speciesList[0];
        const [minColor, maxColor] = sp.colorRange;

        // Density determines color richness
        const t = Math.min(1, density);
        let r = Math.round(minColor[0] + (maxColor[0] - minColor[0]) * t);
        let g = Math.round(minColor[1] + (maxColor[1] - minColor[1]) * t);
        let b = Math.round(minColor[2] + (maxColor[2] - minColor[2]) * t);

        // Organic noise variation
        const n = noise2D(col * 0.4 + speciesId * 50, row * 0.4 + speciesId * 30);
        const variation = Math.round(n * 18);
        r = Math.max(0, Math.min(255, r + variation));
        g = Math.max(0, Math.min(255, g + variation));
        b = Math.max(0, Math.min(255, b + variation));

        // Tip glow for Star Moss (new growth)
        if (sp.tipGlow && age < 25) {
            const glowT = 1 - age / 25;
            r = Math.round(r + (sp.tipGlow[0] - r) * glowT * 0.4);
            g = Math.round(g + (sp.tipGlow[1] - g) * glowT * 0.4);
            b = Math.round(b + (sp.tipGlow[2] - b) * glowT * 0.4);
        }

        // Alpha — sprouting fade-in + density
        let alpha;
        if (age < 12) {
            alpha = Math.round((age / 12) * density * 220);
        } else {
            alpha = Math.min(235, Math.round(Math.pow(density, 0.65) * 235));
        }

        return [r, g, b, alpha];
    };
}

/**
 * Moss overlay effects — depth shadows and moisture shimmer.
 */
export function drawMossOverlay(ctx, grid, canvasWidth, canvasHeight, frame) {
    const { cols, rows } = grid;
    const cellW = canvasWidth / cols;
    const cellH = canvasHeight / rows;

    ctx.save();

    // Depth shadow on bottom-right edges of dense patches
    ctx.globalCompositeOperation = 'multiply';
    for (let row = 2; row < rows; row += 3) {
        for (let col = 2; col < cols; col += 3) {
            const gi = row * cols + col;
            if (grid.density[gi] < 0.35) continue;

            // Edge detection: less dense above-left
            const tlIdx = (row - 1) * cols + (col - 1);
            if (grid.density[tlIdx] > grid.density[gi] * 0.5) continue;

            const cx = (col + 0.5) * cellW;
            const cy = (row + 0.5) * cellH;
            const shadowAlpha = Math.min(0.2, grid.density[gi] * 0.15);

            ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
            ctx.beginPath();
            ctx.arc(cx + cellW * 0.3, cy + cellH * 0.3, cellW * 1.2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Moisture shimmer on wet growing areas
    ctx.globalCompositeOperation = 'screen';
    for (let row = 0; row < rows; row += 5) {
        for (let col = 0; col < cols; col += 5) {
            const gi = row * cols + col;
            if (grid.moisture[gi] < 0.35 || grid.density[gi] < 0.15) continue;

            const shimmer = Math.sin(frame * 0.025 + col * 0.15 + row * 0.2) * 0.5 + 0.5;
            if (shimmer < 0.55) continue;

            const cx = (col + 2.5) * cellW;
            const cy = (row + 2.5) * cellH;
            const alpha = (shimmer - 0.55) * 0.12 * grid.moisture[gi];

            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cellW * 3);
            grad.addColorStop(0, `rgba(180, 220, 200, ${alpha})`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, cellW * 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.restore();
}
