// Art Brushes — Mathematical pattern generators for Living Canvas.
// Each brush returns an array of {col, row, density} points to place on the grid.
// When dropped on the canvas, different brushes auto-combine via the cellular automata.

/**
 * Circle brush (default) — simple radial falloff.
 */
export function circleBrush(col, row, radius, density) {
    const points = [];
    const r2 = radius * radius;
    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            const d2 = dx * dx + dy * dy;
            if (d2 > r2) continue;
            const falloff = 1 - Math.sqrt(d2) / (radius + 0.5);
            points.push({ col: col + dx, row: row + dy, density: density * falloff });
        }
    }
    return points;
}

/**
 * Spirograph brush — Hypotrochoid curve.
 * R = outer radius, r = inner radius, d = pen distance
 * x = (R-r)cos(t) + d·cos((R-r)t/r)
 * y = (R-r)sin(t) - d·sin((R-r)t/r)
 */
export function spirographBrush(col, row, radius, density, params = {}) {
    const points = [];
    const R = radius;
    const r = params.innerRatio || 0.35;      // ratio of R
    const d = params.penRatio || 0.65;         // ratio of R
    const innerR = R * r;
    const penD = R * d;
    const diff = R - innerR;
    const steps = Math.max(120, Math.round(radius * 25));

    const pointSet = new Set();

    for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * Math.PI * 2 * (1 / gcd(Math.round(R * 10), Math.round(innerR * 10)) * Math.round(innerR * 10));
        const tClamped = Math.min(t, Math.PI * 20); // limit revolutions
        const x = diff * Math.cos(tClamped) + penD * Math.cos(diff * tClamped / innerR);
        const y = diff * Math.sin(tClamped) - penD * Math.sin(diff * tClamped / innerR);

        const pc = Math.round(col + x);
        const pr = Math.round(row + y);
        const key = `${pc},${pr}`;
        if (!pointSet.has(key)) {
            pointSet.add(key);
            // Density varies along the curve for organic feel
            const edgeFade = 0.6 + 0.4 * Math.sin(i * 0.15);
            points.push({ col: pc, row: pr, density: density * edgeFade });
        }
    }
    return points;
}

// GCD helper for spirograph periodicity
function gcd(a, b) {
    a = Math.abs(Math.round(a)) || 1;
    b = Math.abs(Math.round(b)) || 1;
    while (b) { [a, b] = [b, a % b]; }
    return a;
}

/**
 * Golden Spiral brush — Fibonacci spiral using golden angle.
 * Points placed in a sunflower/phyllotaxis arrangement.
 */
export function goldenSpiralBrush(col, row, radius, density) {
    const points = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5°
    const numPoints = Math.max(40, Math.round(radius * radius * 0.8));
    const pointSet = new Set();

    for (let i = 1; i <= numPoints; i++) {
        const r = radius * Math.sqrt(i / numPoints);
        const theta = i * goldenAngle;
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);

        const pc = Math.round(col + x);
        const pr = Math.round(row + y);
        const key = `${pc},${pr}`;
        if (!pointSet.has(key)) {
            pointSet.add(key);
            const dist = Math.sqrt(x * x + y * y);
            const falloff = 1 - dist / (radius + 0.5);
            points.push({ col: pc, row: pr, density: density * Math.max(0.2, falloff) });
        }
    }
    return points;
}

/**
 * Wave Rose brush — Polar rose curve r = cos(k·θ).
 * k=2 → 4 petals, k=3 → 3 petals, k=5/3 → complex flowers.
 */
export function waveRoseBrush(col, row, radius, density, params = {}) {
    const points = [];
    const k = params.petals || 5;  // number of petals (or ratio for complex)
    const steps = Math.max(150, Math.round(radius * 30));
    const pointSet = new Set();

    // For fractional k, we need more revolutions
    const maxTheta = Number.isInteger(k) ? Math.PI * 2 : Math.PI * 6;

    for (let i = 0; i <= steps; i++) {
        const theta = (i / steps) * maxTheta;
        const r = radius * Math.cos(k * theta);
        if (r < 0) continue; // skip negative lobes (they overlap positive)

        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);

        const pc = Math.round(col + x);
        const pr = Math.round(row + y);
        const key = `${pc},${pr}`;
        if (!pointSet.has(key)) {
            pointSet.add(key);
            points.push({ col: pc, row: pr, density: density * (0.5 + 0.5 * (r / radius)) });
        }
    }
    return points;
}

/**
 * Star Burst brush — Geometric star with radiating lines.
 * Sharp lines radiate from center with tapered density.
 */
export function starBurstBrush(col, row, radius, density, params = {}) {
    const points = [];
    const numRays = params.rays || 8;
    const thickness = params.thickness || 1.5;
    const pointSet = new Set();

    for (let ray = 0; ray < numRays; ray++) {
        const angle = (ray / numRays) * Math.PI * 2;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        // Walk along the ray
        for (let dist = 0; dist <= radius; dist += 0.5) {
            const cx = col + cos * dist;
            const cy = row + sin * dist;

            // Add thickness perpendicular to ray
            const perpX = -sin;
            const perpY = cos;
            const t = Math.max(0.5, thickness * (1 - dist / radius)); // taper

            for (let w = -t; w <= t; w += 0.8) {
                const pc = Math.round(cx + perpX * w);
                const pr = Math.round(cy + perpY * w);
                const key = `${pc},${pr}`;
                if (!pointSet.has(key)) {
                    pointSet.add(key);
                    const distFalloff = 1 - (dist / radius) * 0.6;
                    const widthFalloff = 1 - Math.abs(w) / (t + 0.5);
                    points.push({ col: pc, row: pr, density: density * distFalloff * widthFalloff });
                }
            }
        }
    }
    return points;
}

/**
 * Fractal Tree brush — Recursive branching pattern.
 * Produces natural tree-like structures via L-system-style recursion.
 */
export function fractalTreeBrush(col, row, radius, density, params = {}) {
    const points = [];
    const depth = params.depth || 5;
    const branchAngle = params.angle || Math.PI / 5;
    const lengthRatio = params.shrink || 0.68;
    const pointSet = new Set();

    function branch(x, y, angle, length, d, dens) {
        if (d <= 0 || length < 1) return;

        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;

        // Draw line from (x,y) to (endX,endY)
        const steps = Math.max(2, Math.round(length));
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const px = Math.round(x + (endX - x) * t);
            const py = Math.round(y + (endY - y) * t);
            const key = `${px},${py}`;
            if (!pointSet.has(key)) {
                pointSet.add(key);
                // Thicker at base, thinner at tips
                const thickFalloff = 0.4 + 0.6 * (d / depth);
                points.push({ col: px, row: py, density: dens * thickFalloff });
            }
        }

        // Branch left and right
        const newLen = length * lengthRatio;
        const newDens = dens * 0.9;
        branch(endX, endY, angle - branchAngle, newLen, d - 1, newDens);
        branch(endX, endY, angle + branchAngle, newLen, d - 1, newDens);
        // Center branch (slightly shorter)
        if (d > 2) {
            branch(endX, endY, angle, newLen * 0.85, d - 1, newDens * 0.8);
        }
    }

    const trunkLen = radius * 0.9;
    // Grow upward (angle = -PI/2)
    branch(col, row, -Math.PI / 2, trunkLen, depth, density);

    return points;
}

/**
 * Sacred Ring brush — Nested concentric polygons with connecting lines.
 * Creates mandala-like sacred geometry patterns.
 */
export function sacredRingBrush(col, row, radius, density, params = {}) {
    const points = [];
    const rings = params.rings || 3;
    const sides = params.sides || 6;  // hexagonal by default
    const pointSet = new Set();

    function addLine(x1, y1, x2, y2, dens) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.max(2, Math.round(dist));

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const pc = Math.round(x1 + dx * t);
            const pr = Math.round(y1 + dy * t);
            const key = `${pc},${pr}`;
            if (!pointSet.has(key)) {
                pointSet.add(key);
                points.push({ col: pc, row: pr, density: dens });
            }
        }
    }

    for (let ring = 1; ring <= rings; ring++) {
        const r = (radius / rings) * ring;
        const rotation = (ring % 2 === 0) ? Math.PI / sides : 0; // alternate rotation
        const dens = density * (0.6 + 0.4 * (ring / rings));

        // Draw polygon vertices and edges
        const vertices = [];
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2 + rotation;
            vertices.push({
                x: col + r * Math.cos(angle),
                y: row + r * Math.sin(angle),
            });
        }

        // Connect polygon edges
        for (let i = 0; i < sides; i++) {
            const next = (i + 1) % sides;
            addLine(vertices[i].x, vertices[i].y, vertices[next].x, vertices[next].y, dens);
        }

        // Connect to center (inner star lines)
        if (ring === 1) {
            for (const v of vertices) {
                addLine(col, row, v.x, v.y, dens * 0.8);
            }
        }

        // Connect to previous ring vertices
        if (ring > 1) {
            const prevR = (radius / rings) * (ring - 1);
            const prevRotation = ((ring - 1) % 2 === 0) ? Math.PI / sides : 0;
            for (let i = 0; i < sides; i++) {
                const prevAngle = (i / sides) * Math.PI * 2 + prevRotation;
                const px = col + prevR * Math.cos(prevAngle);
                const py = row + prevR * Math.sin(prevAngle);
                addLine(px, py, vertices[i].x, vertices[i].y, dens * 0.5);
            }
        }
    }

    // Outer circle
    const circleSteps = Math.max(60, Math.round(radius * 6));
    for (let i = 0; i < circleSteps; i++) {
        const angle = (i / circleSteps) * Math.PI * 2;
        const pc = Math.round(col + radius * Math.cos(angle));
        const pr = Math.round(row + radius * Math.sin(angle));
        const key = `${pc},${pr}`;
        if (!pointSet.has(key)) {
            pointSet.add(key);
            points.push({ col: pc, row: pr, density: density * 0.7 });
        }
    }

    return points;
}

/**
 * Lissajous brush — Lissajous curve: x = A·sin(at+δ), y = B·sin(bt).
 */
export function lissajousBrush(col, row, radius, density, params = {}) {
    const points = [];
    const a = params.a || 3;
    const b = params.b || 2;
    const delta = params.delta || Math.PI / 4;
    const steps = Math.max(200, radius * 30);
    const pointSet = new Set();

    for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * Math.PI * 2;
        const x = radius * Math.sin(a * t + delta);
        const y = radius * Math.sin(b * t);

        const pc = Math.round(col + x);
        const pr = Math.round(row + y);
        const key = `${pc},${pr}`;
        if (!pointSet.has(key)) {
            pointSet.add(key);
            const speed = Math.sqrt(
                Math.pow(a * Math.cos(a * t + delta), 2) +
                Math.pow(b * Math.cos(b * t), 2)
            );
            // Slower parts = denser (more ink pooling)
            const speedFactor = 0.4 + 0.6 * (1 - Math.min(1, speed / (a + b)));
            points.push({ col: pc, row: pr, density: density * speedFactor });
        }
    }
    return points;
}

// --- Symmetry transforms ---

/**
 * Apply symmetry transformation to a set of points.
 * Returns new points array with all mirrored/rotated copies.
 */
export function applySymmetry(points, centerCol, centerRow, mode) {
    if (mode === 'none') return points;

    const allPoints = [...points];
    const seen = new Set(points.map(p => `${p.col},${p.row}`));

    function addMirrored(transformFn) {
        for (const p of points) {
            const { col, row } = transformFn(p.col, p.row);
            const rc = Math.round(col);
            const rr = Math.round(row);
            const key = `${rc},${rr}`;
            if (!seen.has(key)) {
                seen.add(key);
                allPoints.push({ col: rc, row: rr, density: p.density });
            }
        }
    }

    if (mode === 'mirrorX') {
        addMirrored((c, r) => ({ col: 2 * centerCol - c, row: r }));
    } else if (mode === 'mirrorY') {
        addMirrored((c, r) => ({ col: c, row: 2 * centerRow - r }));
    } else if (mode === 'mirrorXY') {
        addMirrored((c, r) => ({ col: 2 * centerCol - c, row: r }));
        // Need to re-gather all current points for the second mirror
        const currentPoints = [...allPoints];
        for (const p of currentPoints) {
            const rc = Math.round(p.col);
            const rr = Math.round(2 * centerRow - p.row);
            const key = `${rc},${rr}`;
            if (!seen.has(key)) {
                seen.add(key);
                allPoints.push({ col: rc, row: rr, density: p.density });
            }
        }
    } else {
        // Radial symmetry: 'radial3', 'radial4', 'radial6', 'radial8'
        const n = parseInt(mode.replace('radial', ''), 10) || 4;
        for (let k = 1; k < n; k++) {
            const angle = (k / n) * Math.PI * 2;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            addMirrored((c, r) => {
                const dx = c - centerCol;
                const dy = r - centerRow;
                return {
                    col: centerCol + dx * cos - dy * sin,
                    row: centerRow + dx * sin + dy * cos,
                };
            });
        }
    }

    return allPoints;
}

/**
 * Hilbert Curve brush — Space-filling curve that visits every cell.
 * Creates dense maze-like patterns.
 */
export function hilbertBrush(col, row, radius, density) {
    const points = [];
    const pointSet = new Set();
    const order = Math.max(2, Math.min(5, Math.round(Math.log2(radius + 1)) + 1));
    const n = Math.pow(2, order);
    const scale = (radius * 2) / n;

    function d2xy(n, d) {
        let rx, ry, s, x = 0, y = 0, t = d;
        for (s = 1; s < n; s *= 2) {
            rx = 1 & (t / 2);
            ry = 1 & (t ^ rx);
            if (ry === 0) {
                if (rx === 1) { x = s - 1 - x; y = s - 1 - y; }
                [x, y] = [y, x];
            }
            x += s * rx;
            y += s * ry;
            t = Math.floor(t / 4);
        }
        return { x, y };
    }

    const total = n * n;
    for (let d = 0; d < total; d++) {
        const { x, y } = d2xy(n, d);
        const pc = Math.round(col - radius + x * scale);
        const pr = Math.round(row - radius + y * scale);
        const key = `${pc},${pr}`;
        if (!pointSet.has(key)) {
            pointSet.add(key);
            const t = d / total;
            points.push({ col: pc, row: pr, density: density * (0.5 + 0.5 * Math.sin(t * Math.PI * 6) * 0.3 + 0.7) });
        }
    }
    return points;
}

/**
 * Dragon Curve brush — Recursive fractal folding pattern.
 */
export function dragonCurveBrush(col, row, radius, density) {
    const points = [];
    const pointSet = new Set();
    const iterations = Math.max(8, Math.min(14, Math.round(radius * 1.5) + 6));

    // Generate dragon curve turns
    let turns = [1]; // 1 = right, 0 = left
    for (let i = 1; i < iterations; i++) {
        const copy = [...turns].reverse().map(t => 1 - t);
        turns = [...turns, 1, ...copy];
    }

    // Walk the curve
    let x = 0, y = 0;
    let dir = 0; // 0=right, 1=up, 2=left, 3=down
    const dx = [1, 0, -1, 0];
    const dy = [0, -1, 0, 1];
    const step = radius / Math.sqrt(turns.length) * 1.5;

    const rawPoints = [{ x: 0, y: 0 }];
    for (const turn of turns) {
        dir = (dir + (turn ? 1 : 3)) % 4;
        x += dx[dir] * step;
        y += dy[dir] * step;
        rawPoints.push({ x, y });
    }

    // Center the curve
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of rawPoints) {
        minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const scaleX = maxX - minX > 0 ? (radius * 2) / (maxX - minX) : 1;
    const scaleY = maxY - minY > 0 ? (radius * 2) / (maxY - minY) : 1;
    const s = Math.min(scaleX, scaleY);

    for (let i = 0; i < rawPoints.length; i++) {
        const pc = Math.round(col + (rawPoints[i].x - cx) * s);
        const pr = Math.round(row + (rawPoints[i].y - cy) * s);
        const key = `${pc},${pr}`;
        if (!pointSet.has(key)) {
            pointSet.add(key);
            points.push({ col: pc, row: pr, density: density * (0.6 + 0.4 * (i / rawPoints.length)) });
        }
    }
    return points;
}

/**
 * Chladni Pattern brush — Standing wave vibration nodes.
 * sin(m*x)*sin(n*y) - sin(n*x)*sin(m*y) = 0
 */
export function chladniBrush(col, row, radius, density, params = {}) {
    const points = [];
    const pointSet = new Set();
    const m = params.m || 3;
    const n = params.n || 5;
    const threshold = params.threshold || 0.08;

    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            if (dx * dx + dy * dy > radius * radius) continue;
            const nx = (dx / radius) * Math.PI;
            const ny = (dy / radius) * Math.PI;
            const val = Math.sin(m * nx) * Math.sin(n * ny) - Math.sin(n * nx) * Math.sin(m * ny);
            if (Math.abs(val) < threshold) {
                const pc = col + dx;
                const pr = row + dy;
                const key = `${pc},${pr}`;
                if (!pointSet.has(key)) {
                    pointSet.add(key);
                    const edgeDist = 1 - Math.sqrt(dx * dx + dy * dy) / radius;
                    points.push({ col: pc, row: pr, density: density * (0.5 + 0.5 * edgeDist) });
                }
            }
        }
    }
    return points;
}

/**
 * Guilloche brush — Overlapping sinusoidal curves (banknote/currency patterns).
 */
export function guillocheBrush(col, row, radius, density, params = {}) {
    const points = [];
    const pointSet = new Set();
    const waves = params.waves || 5;
    const freq1 = params.freq1 || 7;
    const freq2 = params.freq2 || 13;
    const steps = Math.max(300, radius * 40);

    for (let w = 0; w < waves; w++) {
        const offset = (w / waves) * Math.PI * 2;
        const rScale = 0.3 + 0.7 * (w / (waves - 1));

        for (let i = 0; i <= steps; i++) {
            const t = (i / steps) * Math.PI * 2;
            const r1 = radius * rScale * (0.8 + 0.2 * Math.sin(freq1 * t + offset));
            const r2 = radius * rScale * (0.8 + 0.2 * Math.cos(freq2 * t + offset * 1.5));
            const r = (r1 + r2) / 2;
            const x = r * Math.cos(t);
            const y = r * Math.sin(t);

            const pc = Math.round(col + x);
            const pr = Math.round(row + y);
            const key = `${pc},${pr}`;
            if (!pointSet.has(key)) {
                pointSet.add(key);
                points.push({ col: pc, row: pr, density: density * (0.4 + 0.6 * rScale) });
            }
        }
    }
    return points;
}

/**
 * Penrose Tiling brush — Kite and dart aperiodic tiling.
 * Uses the subdivision method for generation.
 */
export function penroseBrush(col, row, radius, density) {
    const points = [];
    const pointSet = new Set();
    const phi = (1 + Math.sqrt(5)) / 2;

    // Start with a decagon of triangles
    let triangles = [];
    for (let i = 0; i < 10; i++) {
        const a0 = (2 * i - 1) * Math.PI / 10;
        const a1 = (2 * i + 1) * Math.PI / 10;
        const B = { x: radius * Math.cos(a0), y: radius * Math.sin(a0) };
        const C = { x: radius * Math.cos(a1), y: radius * Math.sin(a1) };
        triangles.push(i % 2 === 0
            ? { type: 0, A: { x: 0, y: 0 }, B: C, C: B }
            : { type: 0, A: { x: 0, y: 0 }, B, C });
    }

    // Subdivide 3 times
    for (let gen = 0; gen < 3; gen++) {
        const next = [];
        for (const t of triangles) {
            if (t.type === 0) {
                const P = { x: t.A.x + (t.B.x - t.A.x) / phi, y: t.A.y + (t.B.y - t.A.y) / phi };
                next.push({ type: 0, A: t.C, B: P, C: t.A });
                next.push({ type: 1, A: t.C, B: t.B, C: P });
            } else {
                const Q = { x: t.B.x + (t.A.x - t.B.x) / phi, y: t.B.y + (t.A.y - t.B.y) / phi };
                const R = { x: t.B.x + (t.C.x - t.B.x) / phi, y: t.B.y + (t.C.y - t.B.y) / phi };
                next.push({ type: 1, A: R, B: t.C, C: t.A });
                next.push({ type: 1, A: Q, B: R, C: t.B });
                next.push({ type: 0, A: R, B: Q, C: t.A });
            }
        }
        triangles = next;
    }

    // Draw edges of all triangles
    function addLine(x1, y1, x2, y2, dens) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.max(1, Math.round(dist));
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const pc = Math.round(col + x1 + dx * t);
            const pr = Math.round(row + y1 + dy * t);
            const key = `${pc},${pr}`;
            if (!pointSet.has(key)) {
                pointSet.add(key);
                points.push({ col: pc, row: pr, density: dens });
            }
        }
    }

    for (const t of triangles) {
        const d = density * (t.type === 0 ? 0.8 : 0.6);
        addLine(t.A.x, t.A.y, t.B.x, t.B.y, d);
        addLine(t.B.x, t.B.y, t.C.x, t.C.y, d);
    }

    return points;
}

/**
 * Truchet Tile brush — Random tile rotation creating interlocking arc patterns.
 */
export function truchetBrush(col, row, radius, density) {
    const points = [];
    const pointSet = new Set();
    const tileSize = Math.max(2, Math.round(radius / 3));
    const gridSize = Math.ceil(radius * 2 / tileSize);

    for (let ty = 0; ty < gridSize; ty++) {
        for (let tx = 0; tx < gridSize; tx++) {
            const ox = -radius + tx * tileSize;
            const oy = -radius + ty * tileSize;
            if (ox * ox + oy * oy > radius * radius * 1.5) continue;

            // Random tile orientation
            const flip = ((tx * 7 + ty * 13 + tx * ty * 3) % 3) > 0;
            const arcSteps = Math.max(8, tileSize * 3);

            // Draw two quarter-circle arcs per tile
            for (let arc = 0; arc < 2; arc++) {
                let cx, cy;
                if (flip) {
                    cx = arc === 0 ? ox : ox + tileSize;
                    cy = arc === 0 ? oy : oy + tileSize;
                } else {
                    cx = arc === 0 ? ox + tileSize : ox;
                    cy = arc === 0 ? oy : oy + tileSize;
                }

                const startAngle = flip
                    ? (arc === 0 ? 0 : Math.PI)
                    : (arc === 0 ? Math.PI / 2 : -Math.PI / 2);

                for (let i = 0; i <= arcSteps; i++) {
                    const a = startAngle + (i / arcSteps) * Math.PI / 2;
                    const px = cx + tileSize * 0.5 * Math.cos(a);
                    const py = cy + tileSize * 0.5 * Math.sin(a);
                    const pc = Math.round(col + px);
                    const pr = Math.round(row + py);
                    const key = `${pc},${pr}`;
                    if (!pointSet.has(key)) {
                        pointSet.add(key);
                        const dist = Math.sqrt(px * px + py * py);
                        const fade = dist < radius ? 1 : Math.max(0, 1 - (dist - radius) / tileSize);
                        points.push({ col: pc, row: pr, density: density * 0.7 * fade });
                    }
                }
            }
        }
    }
    return points;
}

// --- Brush registry ---

export const BRUSH_TYPES = [
    {
        id: 'circle',
        name: 'Circle',
        icon: '●',
        description: 'Simple radial drop',
        generator: circleBrush,
    },
    {
        id: 'spirograph',
        name: 'Spirograph',
        icon: '✿',
        description: 'Hypotrochoid curves',
        generator: spirographBrush,
        params: { innerRatio: 0.35, penRatio: 0.65 },
    },
    {
        id: 'golden',
        name: 'Golden',
        icon: '🌻',
        description: 'Fibonacci sunflower spiral',
        generator: goldenSpiralBrush,
    },
    {
        id: 'rose',
        name: 'Rose',
        icon: '❀',
        description: 'Polar rose petals',
        generator: waveRoseBrush,
        params: { petals: 5 },
    },
    {
        id: 'star',
        name: 'Star',
        icon: '✦',
        description: 'Radiating star burst',
        generator: starBurstBrush,
        params: { rays: 8, thickness: 1.5 },
    },
    {
        id: 'tree',
        name: 'Tree',
        icon: '🌿',
        description: 'Fractal branching',
        generator: fractalTreeBrush,
        params: { depth: 5, angle: Math.PI / 5, shrink: 0.68 },
    },
    {
        id: 'sacred',
        name: 'Sacred',
        icon: '✡',
        description: 'Nested sacred geometry',
        generator: sacredRingBrush,
        params: { rings: 3, sides: 6 },
    },
    {
        id: 'lissajous',
        name: 'Lissajous',
        icon: '∞',
        description: 'Harmonic figure curves',
        generator: lissajousBrush,
        params: { a: 3, b: 2, delta: Math.PI / 4 },
    },
    {
        id: 'hilbert',
        name: 'Hilbert',
        icon: '⊞',
        description: 'Space-filling Hilbert curve',
        generator: hilbertBrush,
    },
    {
        id: 'dragon',
        name: 'Dragon',
        icon: '🐉',
        description: 'Dragon curve fractal',
        generator: dragonCurveBrush,
    },
    {
        id: 'chladni',
        name: 'Chladni',
        icon: '〰',
        description: 'Standing wave vibration patterns',
        generator: chladniBrush,
        params: { m: 3, n: 5, threshold: 0.08 },
    },
    {
        id: 'guilloche',
        name: 'Guilloche',
        icon: '◎',
        description: 'Overlapping sinusoidal curves',
        generator: guillocheBrush,
        params: { waves: 5, freq1: 7, freq2: 13 },
    },
    {
        id: 'penrose',
        name: 'Penrose',
        icon: '⬠',
        description: 'Aperiodic Penrose tiling',
        generator: penroseBrush,
    },
    {
        id: 'truchet',
        name: 'Truchet',
        icon: '◗',
        description: 'Interlocking arc tile pattern',
        generator: truchetBrush,
    },
];

export const SYMMETRY_MODES = [
    { id: 'none', name: 'None', icon: '○' },
    { id: 'mirrorX', name: 'Mirror ↔', icon: '↔' },
    { id: 'mirrorY', name: 'Mirror ↕', icon: '↕' },
    { id: 'mirrorXY', name: 'Mirror ✛', icon: '✛' },
    { id: 'radial3', name: 'Radial 3', icon: '△' },
    { id: 'radial4', name: 'Radial 4', icon: '◇' },
    { id: 'radial6', name: 'Radial 6', icon: '⬡' },
    { id: 'radial8', name: 'Radial 8', icon: '✳' },
];

/**
 * Generate brush points using the specified brush type, then apply symmetry.
 */
export function generateBrushPoints(brushId, col, row, radius, density, symmetryMode, centerCol, centerRow, brushParams) {
    const brush = BRUSH_TYPES.find(b => b.id === brushId);
    if (!brush) return circleBrush(col, row, radius, density);

    const params = { ...brush.params, ...brushParams };
    let points = brush.generator(col, row, radius, density, params);

    // Apply symmetry
    if (symmetryMode && symmetryMode !== 'none') {
        points = applySymmetry(points, centerCol, centerRow, symmetryMode);
    }

    return points;
}
