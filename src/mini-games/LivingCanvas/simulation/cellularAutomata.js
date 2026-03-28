// Cellular Automata — Core spread/growth algorithm for Living Canvas.
// Weighted neighbor spreading with directional bias and noise.

import { EMPTY, SPREADING, SETTLED, idx, inBounds } from './grid';
import { noise2D } from './noiseField';

// 8-directional neighbor offsets
const NEIGHBORS = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0],           [1, 0],
    [-1, 1],  [0, 1],  [1, 1],
];

/**
 * Run one simulation step on the grid.
 * @param {object} grid - the simulation grid
 * @param {object} params - skin-specific tuning parameters
 * @param {number} frame - current frame number (for noise animation)
 */
export function stepSimulation(grid, params, frame) {
    const {
        baseSpreadProb = 0.12,
        moistureWeight = 0.5,
        densityDecay = 0.92,
        settleAge = 150,
        minSpreadDensity = 0.05,
        diffusionRate = 0.02,
        moistureDecay = 0.998,
        noiseScale = 0.15,
        noiseStrength = 0.4,
        velocityDecay = 0.95,
        spreadPerSpecies = null, // optional per-species spread rate overrides
    } = params;

    const { cols, rows, density, moisture, age, state, species, vx, vy, activeCells } = grid;
    const newActive = new Set();

    // --- Phase 1: Spread from active cells ---
    const activeList = Array.from(activeCells);

    for (const i of activeList) {
        if (state[i] !== SPREADING) continue;

        const col = i % cols;
        const row = (i - col) / cols;
        const cellDensity = density[i];
        const cellMoisture = moisture[i];

        if (cellDensity < minSpreadDensity) {
            state[i] = SETTLED;
            continue;
        }

        // Age the cell
        age[i]++;
        if (age[i] > settleAge) {
            state[i] = SETTLED;
            continue;
        }

        // Per-species spread rate override
        let spreadProb = baseSpreadProb;
        if (spreadPerSpecies && spreadPerSpecies[species[i]] !== undefined) {
            spreadProb = spreadPerSpecies[species[i]];
        }

        // Cell velocity (from player drag)
        const cvx = vx[i];
        const cvy = vy[i];

        for (const [dx, dy] of NEIGHBORS) {
            const nc = col + dx;
            const nr = row + dy;
            if (!inBounds(grid, nc, nr)) continue;

            const ni = idx(grid, nc, nr);

            // Skip already-dense cells (don't overwrite)
            if (state[ni] !== EMPTY && state[ni] !== SPREADING) continue;

            // --- Compute spread probability ---
            // 1. Moisture factor
            const mFactor = 0.3 + moistureWeight * cellMoisture;

            // 2. Direction bias from velocity — strong for calligraphic strokes
            let dirBias = 1;
            const vmag = Math.sqrt(cvx * cvx + cvy * cvy);
            if (vmag > 0.01) {
                const dot = (dx * cvx + dy * cvy) / (vmag * Math.sqrt(dx * dx + dy * dy));
                // Strong directional: against-direction is nearly blocked
                dirBias = Math.max(0.05, 0.1 + 0.9 * Math.max(0, dot));
            }

            // 3. Noise for organic variation
            const n = noise2D(nc * noiseScale + frame * 0.003, nr * noiseScale);
            const noiseFactor = 1 + n * noiseStrength;

            // 4. Diagonal penalty (diagonal neighbors are further away)
            const diagPenalty = (dx !== 0 && dy !== 0) ? 0.7 : 1.0;

            const prob = spreadProb * mFactor * dirBias * noiseFactor * diagPenalty;

            if (Math.random() < prob) {
                const transferDensity = cellDensity * densityDecay * (0.3 + Math.random() * 0.15);
                if (state[ni] === EMPTY) {
                    density[ni] = transferDensity;
                    moisture[ni] = cellMoisture * 0.85;
                    age[ni] = 0;
                    state[ni] = SPREADING;
                    species[ni] = species[i];
                    // Inherit some velocity
                    vx[ni] = cvx * 0.7;
                    vy[ni] = cvy * 0.7;
                } else {
                    // Already spreading — add density (pooling / wet-on-wet)
                    density[ni] = Math.min(1, density[ni] + transferDensity * 0.5);
                    moisture[ni] = Math.max(moisture[ni], cellMoisture * 0.6);
                }
                newActive.add(ni);
            }
        }

        // Keep this cell active if still spreading
        if (state[i] === SPREADING) {
            newActive.add(i);
        }
    }

    // --- Phase 2: Diffusion pass (bleeding / soft edges) ---
    if (diffusionRate > 0) {
        // Simple box-blur-like diffusion on density
        // We iterate settled+spreading cells and bleed a tiny bit into empty neighbors
        for (const i of activeList) {
            if (density[i] < 0.02) continue;
            const col = i % cols;
            const row = (i - col) / cols;

            for (const [dx, dy] of NEIGHBORS) {
                const nc = col + dx;
                const nr = row + dy;
                if (!inBounds(grid, nc, nr)) continue;
                const ni = idx(grid, nc, nr);

                if (state[ni] === EMPTY && density[ni] < density[i] * 0.3) {
                    const bleed = density[i] * diffusionRate * moisture[i];
                    if (bleed > 0.005) {
                        density[ni] = Math.min(0.15, density[ni] + bleed);
                        // Bleeding doesn't change state — it's just visual softening
                    }
                }
            }
        }
    }

    // --- Phase 3: Decay ---
    // Moisture slowly evaporates, velocity decays
    for (const i of activeList) {
        moisture[i] *= moistureDecay;
        vx[i] *= velocityDecay;
        vy[i] *= velocityDecay;
    }

    // Update active cells
    grid.activeCells = newActive;
}

/**
 * Get total coverage stats.
 */
export function getGridStats(grid) {
    const total = grid.cols * grid.rows;
    let filledCells = 0;
    let totalDensity = 0;
    const speciesCounts = {};

    for (let i = 0; i < total; i++) {
        if (grid.density[i] > 0.02) {
            filledCells++;
            totalDensity += grid.density[i];
            const sp = grid.species[i];
            speciesCounts[sp] = (speciesCounts[sp] || 0) + 1;
        }
    }

    return {
        filledCells,
        coveragePercent: Math.round((filledCells / total) * 100),
        avgDensity: filledCells > 0 ? (totalDensity / filledCells) : 0,
        speciesCounts,
        activeCount: grid.activeCells.size,
    };
}
