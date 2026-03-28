// Topographic Renderer — Density as elevation, rendered as contour lines.
// Uses marching-squares-style edge detection for contour generation.

import { noise2D } from '../simulation/noiseField';

/**
 * Create a topographic color mapper.
 * Density is elevation; color fills between contour levels.
 */
export function createTopographicColorMapper(colorMode) {
    const baseRGB = colorMode?.rgb || [139, 90, 43];
    const contourInterval = 0.1; // density step per contour line

    return function topographicColorMapper(density, age, moisture, _species, col, row) {
        if (density < 0.01) return null;

        // Which contour band are we in?
        const level = Math.floor(density / contourInterval);
        const fractional = (density % contourInterval) / contourInterval;

        // Check if this cell is near a contour line (edge of a band)
        const isContour = fractional < 0.15 || fractional > 0.85;
        const isBoldContour = level % 5 === 0 && (fractional < 0.2 || fractional > 0.8);

        if (isContour || isBoldContour) {
            // Contour line color
            const boldness = isBoldContour ? 1.0 : 0.6;
            const r = Math.round(baseRGB[0] * boldness * 0.5);
            const g = Math.round(baseRGB[1] * boldness * 0.5);
            const b = Math.round(baseRGB[2] * boldness * 0.5);
            const alpha = Math.round(180 + boldness * 60);
            return [r, g, b, alpha];
        }

        // Fill color — subtle gradient from low to high elevation
        const elevT = Math.min(1, density);
        const n = noise2D(col * 0.2 + 400, row * 0.2 + 400);

        // Low: green-tan → High: brown-dark
        let r, g, b;
        if (baseRGB[0] === 139) { // terrain mode
            r = Math.round(200 - 80 * elevT + n * 10);
            g = Math.round(215 - 120 * elevT + n * 8);
            b = Math.round(175 - 130 * elevT + n * 6);
        } else {
            // Use base color with elevation
            r = Math.round(baseRGB[0] * (0.3 + 0.7 * elevT) + n * 10);
            g = Math.round(baseRGB[1] * (0.3 + 0.7 * elevT) + n * 8);
            b = Math.round(baseRGB[2] * (0.3 + 0.7 * elevT) + n * 6);
        }

        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));

        const alpha = Math.min(180, Math.round(Math.pow(density, 0.7) * 180));
        return [r, g, b, alpha];
    };
}

/**
 * Topographic overlay — hachure marks on steep areas + peak markers.
 */
export function drawTopographicOverlay(ctx, grid, canvasWidth, canvasHeight, frame) {
    const { cols, rows } = grid;
    const cellW = canvasWidth / cols;
    const cellH = canvasHeight / rows;

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';

    // Hachure marks on steep gradients
    ctx.strokeStyle = 'rgba(80, 50, 20, 0.25)';
    ctx.lineWidth = 0.8;
    for (let row = 2; row < rows - 2; row += 3) {
        for (let col = 2; col < cols - 2; col += 3) {
            const gi = row * cols + col;
            if (grid.density[gi] < 0.15) continue;

            // Compute gradient (slope)
            const dRight = grid.density[row * cols + col + 1] || 0;
            const dLeft = grid.density[row * cols + col - 1] || 0;
            const dDown = grid.density[(row + 1) * cols + col] || 0;
            const dUp = grid.density[(row - 1) * cols + col] || 0;

            const gx = dRight - dLeft;
            const gy = dDown - dUp;
            const slope = Math.sqrt(gx * gx + gy * gy);

            if (slope > 0.08) {
                const cx = (col + 0.5) * cellW;
                const cy = (row + 0.5) * cellH;
                const angle = Math.atan2(gy, gx);
                const len = Math.min(cellW * 2, slope * cellW * 15);

                ctx.beginPath();
                ctx.moveTo(cx - Math.cos(angle) * len * 0.5, cy - Math.sin(angle) * len * 0.5);
                ctx.lineTo(cx + Math.cos(angle) * len * 0.5, cy + Math.sin(angle) * len * 0.5);
                ctx.stroke();
            }
        }
    }

    // Peak markers at local maxima
    ctx.fillStyle = 'rgba(80, 50, 20, 0.5)';
    ctx.font = `${Math.round(cellW * 2.5)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let row = 3; row < rows - 3; row += 8) {
        for (let col = 3; col < cols - 3; col += 8) {
            const gi = row * cols + col;
            if (grid.density[gi] < 0.6) continue;

            // Check if local maximum
            let isMax = true;
            for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const ni = (row + dy) * cols + (col + dx);
                    if (ni >= 0 && ni < cols * rows && grid.density[ni] > grid.density[gi]) {
                        isMax = false;
                        break;
                    }
                }
                if (!isMax) break;
            }

            if (isMax) {
                const cx = (col + 0.5) * cellW;
                const cy = (row + 0.5) * cellH;
                // Small triangle peak marker
                ctx.beginPath();
                ctx.moveTo(cx, cy - cellH * 1.5);
                ctx.lineTo(cx - cellW, cy + cellH * 0.5);
                ctx.lineTo(cx + cellW, cy + cellH * 0.5);
                ctx.closePath();
                ctx.fill();
            }
        }
    }

    ctx.restore();
}
