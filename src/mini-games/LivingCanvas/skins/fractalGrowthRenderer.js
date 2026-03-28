// Fractal Growth Renderer — DLA-inspired crystalline growth with electric glow.
// Produces branching dendritic structures, snowflakes, and lightning patterns.

import { noise2D } from '../simulation/noiseField';

/**
 * Create a fractal growth color mapper.
 * Tips glow bright white/blue; older branches deepen in color.
 */
export function createFractalGrowthColorMapper(colorMode) {
    const baseRGB = colorMode?.rgb || [120, 200, 255];

    return function fractalGrowthColorMapper(density, age, moisture, _species, col, row) {
        if (density < 0.008) return null;

        // Age determines color: fresh tips are bright, old branches are deeper
        const ageT = Math.min(1, age / 120);

        // Tip color: near-white with a hint of base color
        const tipR = Math.min(255, baseRGB[0] + 100);
        const tipG = Math.min(255, baseRGB[1] + 80);
        const tipB = Math.min(255, baseRGB[2] + 60);

        // Core color: deeper, more saturated
        const coreR = Math.max(0, baseRGB[0] - 40);
        const coreG = Math.max(0, baseRGB[1] - 30);
        const coreB = Math.max(0, baseRGB[2] - 20);

        let r = Math.round(tipR + (coreR - tipR) * ageT);
        let g = Math.round(tipG + (coreG - tipG) * ageT);
        let b = Math.round(tipB + (coreB - tipB) * ageT);

        // Crystal texture noise
        const n = noise2D(col * 0.6 + 300, row * 0.6 + 300);
        r = Math.max(0, Math.min(255, r + Math.round(n * 15)));
        g = Math.max(0, Math.min(255, g + Math.round(n * 12)));
        b = Math.max(0, Math.min(255, b + Math.round(n * 8)));

        // Alpha: strong core, ethereal edges
        const alpha = Math.min(245, Math.round(Math.pow(density, 0.55) * 245));

        return [r, g, b, alpha];
    };
}

/**
 * Fractal growth overlay — electric glow at branch tips + ambient pulse.
 */
export function drawFractalGrowthOverlay(ctx, grid, canvasWidth, canvasHeight, frame) {
    const { cols, rows } = grid;
    const cellW = canvasWidth / cols;
    const cellH = canvasHeight / rows;

    ctx.save();

    // Glow at active growing tips
    ctx.globalCompositeOperation = 'screen';
    for (let row = 0; row < rows; row += 3) {
        for (let col = 0; col < cols; col += 3) {
            const gi = row * cols + col;
            if (grid.density[gi] < 0.15 || grid.age[gi] > 20) continue;

            const cx = (col + 1.5) * cellW;
            const cy = (row + 1.5) * cellH;
            const pulse = Math.sin(frame * 0.06 + col * 0.3 + row * 0.25) * 0.5 + 0.5;
            const alpha = 0.15 * grid.density[gi] * (0.5 + pulse * 0.5);

            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cellW * 4);
            grad.addColorStop(0, `rgba(180, 220, 255, ${alpha})`);
            grad.addColorStop(0.5, `rgba(100, 160, 255, ${alpha * 0.4})`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cx, cy, cellW * 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Ambient background pulse
    ctx.globalCompositeOperation = 'screen';
    const ambientPulse = Math.sin(frame * 0.015) * 0.5 + 0.5;
    const ambientAlpha = 0.02 * ambientPulse;
    ctx.fillStyle = `rgba(60, 100, 160, ${ambientAlpha})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.restore();
}
