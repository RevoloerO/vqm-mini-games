// Grid — Typed-array-based 2D simulation grid for Living Canvas.
// Each cell stores density, moisture, age, state, species, and velocity.

// Cell states
export const EMPTY = 0;
export const SOURCE = 1;
export const SPREADING = 2;
export const SETTLED = 3;
export const DEAD = 4;

/**
 * Create a new simulation grid with typed arrays.
 * @param {number} cols - grid columns
 * @param {number} rows - grid rows
 */
export function createGrid(cols, rows) {
    const size = cols * rows;
    return {
        cols,
        rows,
        density: new Float32Array(size),
        moisture: new Float32Array(size),
        age: new Uint16Array(size),
        state: new Uint8Array(size),
        species: new Uint8Array(size),
        vx: new Float32Array(size),
        vy: new Float32Array(size),
        // Active cell tracking for performance
        activeCells: new Set(),
    };
}

/** Get index from (col, row). */
export function idx(grid, col, row) {
    return row * grid.cols + col;
}

/** Check bounds. */
export function inBounds(grid, col, row) {
    return col >= 0 && col < grid.cols && row >= 0 && row < grid.rows;
}

/**
 * Place a source at (col, row) with given density and species.
 * Also marks surrounding cells based on radius.
 */
export function placeSource(grid, col, row, radius, initialDensity, speciesId, moistureLevel) {
    const r2 = radius * radius;
    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            const c = col + dx;
            const r = row + dy;
            if (!inBounds(grid, c, r)) continue;
            const d2 = dx * dx + dy * dy;
            if (d2 > r2) continue;

            const i = idx(grid, c, r);
            // Density falls off from center
            const falloff = 1 - Math.sqrt(d2) / (radius + 0.5);
            const newDensity = initialDensity * falloff;

            if (newDensity > grid.density[i]) {
                grid.density[i] = Math.min(1, newDensity);
                grid.moisture[i] = Math.max(grid.moisture[i], moistureLevel);
                grid.age[i] = 0;
                grid.state[i] = d2 === 0 ? SOURCE : SPREADING;
                grid.species[i] = speciesId;
                grid.activeCells.add(i);
            }
        }
    }
}

/**
 * Apply a velocity impulse around (col, row) with given radius.
 * Used when player drags to bias flow direction.
 */
export function applyVelocity(grid, col, row, radius, dvx, dvy) {
    const r2 = radius * radius;
    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            const c = col + dx;
            const r = row + dy;
            if (!inBounds(grid, c, r)) continue;
            const d2 = dx * dx + dy * dy;
            if (d2 > r2) continue;

            const i = idx(grid, c, r);
            const falloff = 1 - Math.sqrt(d2) / (radius + 0.5);
            grid.vx[i] += dvx * falloff;
            grid.vy[i] += dvy * falloff;
        }
    }
}

/**
 * Add moisture around (col, row).
 */
export function addMoisture(grid, col, row, radius, amount) {
    const r2 = radius * radius;
    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            const c = col + dx;
            const r = row + dy;
            if (!inBounds(grid, c, r)) continue;
            if (dx * dx + dy * dy > r2) continue;
            const i = idx(grid, c, r);
            grid.moisture[i] = Math.min(1, grid.moisture[i] + amount);
        }
    }
}

/**
 * Clear the entire grid, resetting all arrays.
 */
export function clearGrid(grid) {
    grid.density.fill(0);
    grid.moisture.fill(0);
    grid.age.fill(0);
    grid.state.fill(EMPTY);
    grid.species.fill(0);
    grid.vx.fill(0);
    grid.vy.fill(0);
    grid.activeCells.clear();
}

/**
 * Place an array of {col, row, density} points on the grid.
 * Used by art brushes and symmetry system.
 */
export function placePoints(grid, points, speciesId, moistureLevel) {
    for (const p of points) {
        const c = Math.round(p.col);
        const r = Math.round(p.row);
        if (!inBounds(grid, c, r)) continue;

        const i = idx(grid, c, r);
        const newDensity = Math.min(1, p.density);

        if (newDensity > grid.density[i]) {
            grid.density[i] = newDensity;
            grid.moisture[i] = Math.max(grid.moisture[i], moistureLevel);
            grid.age[i] = 0;
            grid.state[i] = SPREADING;
            grid.species[i] = speciesId;
            grid.activeCells.add(i);
        }
    }
}

/**
 * Remove density in a radius (blot / absorb).
 */
export function removeDensity(grid, col, row, radius) {
    const r2 = radius * radius;
    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            const c = col + dx;
            const r = row + dy;
            if (!inBounds(grid, c, r)) continue;
            if (dx * dx + dy * dy > r2) continue;
            const i = idx(grid, c, r);
            const falloff = 1 - Math.sqrt(dx * dx + dy * dy) / (radius + 0.5);
            grid.density[i] = Math.max(0, grid.density[i] - falloff * 0.5);
            if (grid.density[i] < 0.01) {
                grid.state[i] = EMPTY;
                grid.activeCells.delete(i);
            }
        }
    }
}
