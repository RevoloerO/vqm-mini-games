// Simplex-inspired 2D noise for organic growth variation.
// Lightweight implementation — no external dependencies.

// Permutation table (shuffled 0-255, doubled for wrapping)
const perm = new Uint8Array(512);
const grad = [
    [1, 1], [-1, 1], [1, -1], [-1, -1],
    [1, 0], [-1, 0], [0, 1], [0, -1],
];

// Seed the permutation table
function seed(s = 42) {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    // Fisher-Yates shuffle with seed
    let v = s;
    for (let i = 255; i > 0; i--) {
        v = (v * 16807 + 0) % 2147483647;
        const j = v % (i + 1);
        [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
}

seed(42);

function dot2(g, x, y) {
    return g[0] * x + g[1] * y;
}

function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * 2D Perlin noise, returns value in [-1, 1].
 */
export function noise2D(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);

    const g00 = grad[perm[perm[X] + Y] & 7];
    const g10 = grad[perm[perm[X + 1] + Y] & 7];
    const g01 = grad[perm[perm[X] + Y + 1] & 7];
    const g11 = grad[perm[perm[X + 1] + Y + 1] & 7];

    const n00 = dot2(g00, xf, yf);
    const n10 = dot2(g10, xf - 1, yf);
    const n01 = dot2(g01, xf, yf - 1);
    const n11 = dot2(g11, xf - 1, yf - 1);

    const nx0 = n00 + u * (n10 - n00);
    const nx1 = n01 + u * (n11 - n01);

    return nx0 + v * (nx1 - nx0);
}

/**
 * Fractal Brownian Motion — layered noise for richer texture.
 * @param {number} x
 * @param {number} y
 * @param {number} octaves - number of layers (2-4 typical)
 * @returns {number} value in roughly [-1, 1]
 */
export function fbm(x, y, octaves = 3) {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxAmp = 0;
    for (let i = 0; i < octaves; i++) {
        value += amplitude * noise2D(x * frequency, y * frequency);
        maxAmp += amplitude;
        amplitude *= 0.5;
        frequency *= 2;
    }
    return value / maxAmp;
}

/**
 * Reseed the noise with a new seed value.
 */
export function reseed(s) {
    seed(s);
}
