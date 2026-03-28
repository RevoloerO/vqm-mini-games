// Ink Flow Renderer — Artistic sumi-e ink color mapping and overlay effects.
// Produces watercolor-like washes with wet/dry aging and paper interaction.

import { noise2D } from '../simulation/noiseField';

/**
 * Create an ink color mapper function.
 * Returns [r, g, b, a] for each cell — alpha drives brush opacity.
 */
export function createInkColorMapper(colorMode) {
    const baseRGB = colorMode?.rgb || [26, 26, 26];

    // Wet ink: cooler, darker
    const wetR = Math.max(0, baseRGB[0] - 8);
    const wetG = Math.max(0, baseRGB[1] - 8);
    const wetB = Math.min(255, baseRGB[2] + 25);

    // Dry ink: warmer, lighter
    const dryR = Math.min(255, baseRGB[0] + 18);
    const dryG = Math.min(255, baseRGB[1] + 12);
    const dryB = Math.max(0, baseRGB[2] - 8);

    return function inkColorMapper(density, age, moisture, _species, col, row) {
        if (density < 0.008) return null;

        // Age factor: 0 = wet, 1 = fully dry
        const ageT = Math.min(1, Math.max(0, (age - 30) / 120));

        // Interpolate wet → dry color
        let r = Math.round(wetR + (dryR - wetR) * ageT);
        let g = Math.round(wetG + (dryG - wetG) * ageT);
        let b = Math.round(wetB + (dryB - wetB) * ageT);

        // Noise for organic texture variation
        const n = noise2D(col * 0.35 + 100, row * 0.35 + 100);
        const variation = Math.round(n * 10);
        r = Math.max(0, Math.min(255, r + variation));
        g = Math.max(0, Math.min(255, g + variation));
        b = Math.max(0, Math.min(255, b + variation));

        // Alpha: crisp calligraphic strokes — opaque core, clean edges
        // density 0.1 → ~30, density 0.3 → ~100, density 0.5 → ~160, density 1.0 → ~240
        const alpha = Math.min(240, Math.round(Math.pow(density, 0.65) * 240));

        return [r, g, b, alpha];
    };
}

/**
 * Ink overlay effects — wet shimmer and paper grain interaction.
 */
export function drawInkOverlay(ctx, grid, canvasWidth, canvasHeight, frame) {
    const { cols, rows } = grid;
    const cellW = canvasWidth / cols;
    const cellH = canvasHeight / rows;

    ctx.save();

    // Wet-area shimmer (light reflection on wet ink)
    ctx.globalCompositeOperation = 'screen';
    for (let row = 0; row < rows; row += 4) {
        for (let col = 0; col < cols; col += 4) {
            const gi = row * cols + col;
            if (grid.density[gi] < 0.3 || grid.age[gi] > 50) continue;

            const shimmer = Math.sin(frame * 0.04 + col * 0.2 + row * 0.25) * 0.5 + 0.5;
            if (shimmer < 0.5) continue;

            const cx = (col + 2) * cellW;
            const cy = (row + 2) * cellH;
            const alpha = (shimmer - 0.5) * 0.08 * grid.moisture[gi];

            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cellW * 3);
            grad.addColorStop(0, `rgba(220, 230, 245, ${alpha})`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, cellW * 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.restore();
}
