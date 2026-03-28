// Shared rendering utilities for Living Canvas.
// High-performance artistic rendering using offscreen canvas + StackBlur + compositing.

import { fbm } from '../simulation/noiseField';

/**
 * Generate a static background texture as ImageData.
 */
export function generateBackground(width, height, type) {
    const imageData = new ImageData(width, height);
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const n = fbm(x * 0.02, y * 0.02, 3);
            const fine = fbm(x * 0.08, y * 0.08, 2);

            if (type === 'paper') {
                const base = 235 + n * 8 + fine * 4;
                data[i] = Math.min(255, base + 5);
                data[i + 1] = Math.min(255, base);
                data[i + 2] = Math.min(255, base - 12);
                data[i + 3] = 255;
            } else if (type === 'dark') {
                // Deep dark background for stained glass, fractal, etc.
                const base = 12 + n * 4 + fine * 2;
                data[i] = Math.max(0, base);
                data[i + 1] = Math.max(0, base - 1);
                data[i + 2] = Math.max(0, base + 3);
                data[i + 3] = 255;
            } else {
                const base = 38 + n * 6 + fine * 3;
                data[i] = base;
                data[i + 1] = base;
                data[i + 2] = base - 2;
                data[i + 3] = 255;
            }
        }
    }

    return imageData;
}

// --- Offscreen canvases (cached between frames) ---
let _gridCanvas = null;
let _gridCtx = null;
let _blurCanvas = null;
let _blurCtx = null;

/**
 * Fast box blur on ImageData (horizontal + vertical pass).
 * Blurs only the alpha channel for performance, then applies to RGB.
 */
function boxBlurImageData(imgData, radius) {
    const { width, height, data } = imgData;
    if (radius < 1) return;

    const r = Math.round(radius);
    const div = 2 * r + 1;
    const temp = new Uint8ClampedArray(data.length);

    // Horizontal pass
    for (let y = 0; y < height; y++) {
        for (let ch = 0; ch < 4; ch++) {
            let sum = 0;
            // Initialize sum for first pixel
            for (let k = -r; k <= r; k++) {
                const x = Math.max(0, Math.min(width - 1, k));
                sum += data[(y * width + x) * 4 + ch];
            }
            for (let x = 0; x < width; x++) {
                temp[(y * width + x) * 4 + ch] = Math.round(sum / div);
                // Slide window
                const left = Math.max(0, x - r);
                const right = Math.min(width - 1, x + r + 1);
                sum -= data[(y * width + left) * 4 + ch];
                sum += data[(y * width + right) * 4 + ch];
            }
        }
    }

    // Vertical pass
    for (let x = 0; x < width; x++) {
        for (let ch = 0; ch < 4; ch++) {
            let sum = 0;
            for (let k = -r; k <= r; k++) {
                const y = Math.max(0, Math.min(height - 1, k));
                sum += temp[(y * width + x) * 4 + ch];
            }
            for (let y = 0; y < height; y++) {
                data[(y * width + x) * 4 + ch] = Math.round(sum / div);
                const top = Math.max(0, y - r);
                const bot = Math.min(height - 1, y + r + 1);
                sum -= temp[(top * width + x) * 4 + ch];
                sum += temp[(bot * width + x) * 4 + ch];
            }
        }
    }
}

/**
 * Artistic grid rendering — fast pipeline:
 * 1. Render 1px-per-cell to tiny offscreen canvas
 * 2. Scale up to intermediate canvas (2x grid size) with bilinear smoothing
 * 3. Apply fast box blur for soft watercolor/ink wash edges
 * 4. Draw onto main canvas with multiply compositing for paper interaction
 */
export function renderGridArtistic(ctx, grid, colorMapper, bgImageData, skinType) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const { cols, rows } = grid;

    // 1. Draw background
    ctx.putImageData(bgImageData, 0, 0);

    // 2. Ensure offscreen canvases exist
    if (!_gridCanvas || _gridCanvas.width !== cols || _gridCanvas.height !== rows) {
        _gridCanvas = document.createElement('canvas');
        _gridCanvas.width = cols;
        _gridCanvas.height = rows;
        _gridCtx = _gridCanvas.getContext('2d');
    }

    // Intermediate blur canvas at 2x grid resolution
    const blurW = cols * 2;
    const blurH = rows * 2;
    if (!_blurCanvas || _blurCanvas.width !== blurW || _blurCanvas.height !== blurH) {
        _blurCanvas = document.createElement('canvas');
        _blurCanvas.width = blurW;
        _blurCanvas.height = blurH;
        _blurCtx = _blurCanvas.getContext('2d');
    }

    // 3. Render grid at 1px per cell
    const imgData = _gridCtx.createImageData(cols, rows);
    const out = imgData.data;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const gi = row * cols + col;
            const d = grid.density[gi];
            if (d < 0.008) continue;

            const color = colorMapper(d, grid.age[gi], grid.moisture[gi], grid.species[gi], col, row);
            if (!color || color[3] < 1) continue;

            const pi = gi * 4;
            out[pi] = color[0];
            out[pi + 1] = color[1];
            out[pi + 2] = color[2];
            out[pi + 3] = color[3];
        }
    }

    _gridCtx.putImageData(imgData, 0, 0);

    // 4. Scale up to blur canvas with bilinear interpolation
    _blurCtx.imageSmoothingEnabled = true;
    _blurCtx.imageSmoothingQuality = 'high';
    _blurCtx.clearRect(0, 0, blurW, blurH);
    _blurCtx.drawImage(_gridCanvas, 0, 0, cols, rows, 0, 0, blurW, blurH);

    // 5. Apply gentle blur — just enough to smooth pixel edges, not wash out detail
    const blurData = _blurCtx.getImageData(0, 0, blurW, blurH);
    boxBlurImageData(blurData, skinType === 'ink' ? 1 : 2); // ink: crisp strokes, moss: softer organic
    _blurCtx.putImageData(blurData, 0, 0);

    // 6. Draw blurred grid onto main canvas
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (skinType === 'ink') {
        // Multiply: ink darkens the paper naturally
        ctx.globalCompositeOperation = 'multiply';
        ctx.drawImage(_blurCanvas, 0, 0, blurW, blurH, 0, 0, width, height);
        ctx.restore();

        // Reinforce dense ink centers
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(_gridCanvas, 0, 0, cols, rows, 0, 0, width, height);
        ctx.restore();
    } else {
        // Source-over for moss on dark stone (multiply would darken too much)
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(_blurCanvas, 0, 0, blurW, blurH, 0, 0, width, height);
        ctx.restore();

        // Lighter overlay for glow effect on dense moss
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.12;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(_gridCanvas, 0, 0, cols, rows, 0, 0, width, height);
        ctx.restore();
    }
}

/**
 * Draw a soft circular cursor.
 */
export function drawCursor(ctx, x, y, radius, color) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.6, color);
    gradient.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
}

/**
 * Simple particle system.
 */
export function updateParticles(particles) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.02;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

export function drawParticles(ctx, particles) {
    for (const p of particles) {
        const alpha = Math.min(1, p.life / p.maxLife);
        ctx.globalAlpha = alpha * 0.7;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * alpha, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

export function spawnParticles(particles, x, y, count, color, maxParticles = 100) {
    for (let i = 0; i < count; i++) {
        if (particles.length >= maxParticles) break;
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.3 + Math.random() * 0.8;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.5,
            life: 40 + Math.random() * 30,
            maxLife: 70,
            radius: 1.5 + Math.random() * 2,
            color,
        });
    }
}
