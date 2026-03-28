// Op Art Renderer — High-contrast optical illusion patterns.
// Density modulates stripe frequency and distortion for mesmerizing moire effects.

import { noise2D } from '../simulation/noiseField';

/**
 * Create an op art color mapper.
 * Uses density to modulate black/white stripe patterns.
 */
export function createOpArtColorMapper(colorMode) {
    const primaryRGB = colorMode?.rgb || [0, 0, 0];

    return function opArtColorMapper(density, age, moisture, _species, col, row) {
        if (density < 0.008) return null;

        // Stripe frequency increases with density
        const freq = 0.2 + density * 0.6;
        // Density distorts the wave — creates moire-like warping
        const distortion = density * 3;

        // Concentric + radial stripe interference
        const wave1 = Math.sin((col * freq + Math.sin(row * 0.1) * distortion) * Math.PI);
        const wave2 = Math.sin((row * freq + Math.cos(col * 0.1) * distortion) * Math.PI);
        const combined = (wave1 + wave2) * 0.5;

        // Threshold to black or white (with smooth edge)
        const threshold = Math.min(1, Math.max(0, combined * 0.5 + 0.5));

        let r, g, b;
        if (threshold > 0.5) {
            // Primary color (black/colored)
            const t = (threshold - 0.5) * 2;
            r = Math.round(primaryRGB[0] * t);
            g = Math.round(primaryRGB[1] * t);
            b = Math.round(primaryRGB[2] * t);
        } else {
            // White/light
            const t = threshold * 2;
            r = Math.round(255 - (255 - primaryRGB[0]) * (1 - t));
            g = Math.round(255 - (255 - primaryRGB[1]) * (1 - t));
            b = Math.round(255 - (255 - primaryRGB[2]) * (1 - t));
        }

        // Sharp, high-contrast alpha
        const alpha = Math.min(240, Math.round(Math.pow(density, 0.4) * 240));

        return [r, g, b, alpha];
    };
}

/**
 * Op art overlay — animated phase shift for movement illusion.
 */
export function drawOpArtOverlay(ctx, grid, canvasWidth, canvasHeight, frame) {
    const { cols, rows } = grid;
    const cellW = canvasWidth / cols;
    const cellH = canvasHeight / rows;

    ctx.save();

    // Subtle phase-shift animation on dense areas (creates motion illusion)
    ctx.globalCompositeOperation = 'overlay';
    const phase = frame * 0.02;

    for (let row = 0; row < rows; row += 5) {
        for (let col = 0; col < cols; col += 5) {
            const gi = row * cols + col;
            if (grid.density[gi] < 0.3) continue;

            const cx = (col + 2.5) * cellW;
            const cy = (row + 2.5) * cellH;
            const pulse = Math.sin(phase + col * 0.05 + row * 0.07);
            const alpha = Math.abs(pulse) * 0.08 * grid.density[gi];

            if (alpha > 0.01) {
                ctx.fillStyle = pulse > 0
                    ? `rgba(0, 0, 0, ${alpha})`
                    : `rgba(255, 255, 255, ${alpha})`;
                ctx.fillRect(cx - cellW * 2.5, cy - cellH * 2.5, cellW * 5, cellH * 5);
            }
        }
    }

    ctx.restore();
}
