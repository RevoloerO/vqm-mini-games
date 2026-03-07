// useMyceliumGame.js — Core game hook for Mycelium Network.
// All game state lives in refs (performance); only UI counters use useState.

import { useRef, useState, useEffect, useCallback } from 'react';
import {
    COLORS, LIMITS, GROWTH, CONNECTION, NODE, MILESTONES, PARTICLE,
} from './gameConfig';

// ---- helpers ----
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const lerp = (a, b, t) => a + (b - a) * t;
let nextId = 1;
const uid = () => nextId++;

// ---- hook ----
export const useMyceliumGame = () => {
    const canvasRef = useRef(null);

    // game-state refs (never trigger re-renders)
    const nodesRef = useRef([]);
    const tendrilsRef = useRef([]);
    const connectionsRef = useRef([]);
    const pulsesRef = useRef([]);
    const particlesRef = useRef([]);
    const mouseRef = useRef({ x: -999, y: -999 });
    const lastClickRef = useRef(0);
    const nurtureRef = useRef({ active: false, x: 0, y: 0, until: 0 });
    const clickRipplesRef = useRef([]); // visual feedback on click
    const frameRef = useRef(0);
    const timeRef = useRef(0);
    const animIdRef = useRef(null);

    // UI state (rendered in React)
    const [nodeCount, setNodeCount] = useState(0);
    const [connectionCount, setConnectionCount] = useState(0);
    const [longestPath, setLongestPath] = useState(0);
    const [density, setDensity] = useState(0);
    const [achievedMilestones, setAchievedMilestones] = useState(new Set());
    const [milestoneFlash, setMilestoneFlash] = useState(null);

    // --- Node creation ---
    const createNode = useCallback((x, y) => {
        if (nodesRef.current.length >= LIMITS.maxNodes) return;

        const now = performance.now();
        if (now - lastClickRef.current < NODE.cooldown) return;
        lastClickRef.current = now;

        const palette = randomFrom(COLORS.nodePalette);
        const node = {
            id: uid(),
            x,
            y,
            color: palette.core,
            glow: palette.glow,
            glowPhase: Math.random() * Math.PI * 2,
        };
        nodesRef.current.push(node);

        // visual click ripple
        clickRipplesRef.current.push({ x, y, radius: 0, maxRadius: 50, alpha: 0.7, color: palette.core });

        // spawn 2-4 tendrils at evenly-spaced angles
        const count = NODE.tendrilsMin + Math.floor(Math.random() * (NODE.tendrilsMax - NODE.tendrilsMin + 1));
        const baseAngle = Math.random() * Math.PI * 2;
        for (let i = 0; i < count; i++) {
            if (tendrilsRef.current.length >= LIMITS.maxTendrils) break;
            const angle = baseAngle + (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
            tendrilsRef.current.push({
                id: uid(),
                sourceId: node.id,
                sourceColor: palette.core,
                points: [{ x: node.x, y: node.y }],
                angle,
                growing: true,
                speed: GROWTH.speed + (Math.random() - 0.5) * 0.15,
                totalLength: 0,
            });
        }
    }, []);

    // --- Particle burst ---
    const spawnParticles = useCallback((cx, cy, count, color) => {
        for (let i = 0; i < count; i++) {
            if (particlesRef.current.length >= LIMITS.maxParticles) break;
            const angle = Math.random() * Math.PI * 2;
            const speed = PARTICLE.speed * (0.5 + Math.random());
            particlesRef.current.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: PARTICLE.baseLife + Math.floor(Math.random() * 20),
                maxLife: PARTICLE.baseLife + 20,
                color: color || randomFrom(COLORS.particlePalette),
            });
        }
    }, []);

    // --- Connection creation ---
    const createConnection = useCallback((tendril, targetNode) => {
        const sourceNode = nodesRef.current.find(n => n.id === tendril.sourceId);
        if (!sourceNode) return;

        // prevent duplicate connections between same node pair
        const exists = connectionsRef.current.some(
            c => (c.nodeA === tendril.sourceId && c.nodeB === targetNode.id) ||
                 (c.nodeA === targetNode.id && c.nodeB === tendril.sourceId)
        );
        if (exists) { tendril.growing = false; return; }

        // snap tendril tip to target
        tendril.points.push({ x: targetNode.x, y: targetNode.y });
        tendril.growing = false;

        const conn = {
            id: uid(),
            nodeA: tendril.sourceId,
            nodeB: targetNode.id,
            path: [...tendril.points],
            pulseTimer: 0,
            strength: 1,
        };
        connectionsRef.current.push(conn);

        // spawn initial pulse
        pulsesRef.current.push({
            id: uid(),
            connectionId: conn.id,
            t: 0,
            speed: CONNECTION.pulseSpeed * (0.8 + Math.random() * 0.4),
            color: randomFrom(COLORS.pulsePalette),
            forward: true,
        });

        // burst particles at junction
        spawnParticles(targetNode.x, targetNode.y, PARTICLE.spawnCountOnConnect, tendril.sourceColor);
    }, [spawnParticles]);

    // --- Longest path BFS ---
    const computeLongestPath = useCallback(() => {
        const adj = {};
        nodesRef.current.forEach(n => { adj[n.id] = []; });
        connectionsRef.current.forEach(c => {
            if (adj[c.nodeA]) adj[c.nodeA].push(c.nodeB);
            if (adj[c.nodeB]) adj[c.nodeB].push(c.nodeA);
        });

        let maxLen = 0;
        const nodeIds = nodesRef.current.map(n => n.id);
        // BFS from each node (small graph, fine for <=100 nodes)
        for (const startId of nodeIds) {
            const visited = new Set([startId]);
            const queue = [{ id: startId, depth: 0 }];
            while (queue.length) {
                const { id, depth } = queue.shift();
                if (depth > maxLen) maxLen = depth;
                for (const neighbor of (adj[id] || [])) {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        queue.push({ id: neighbor, depth: depth + 1 });
                    }
                }
            }
        }
        return maxLen;
    }, []);

    // --- Milestone check ---
    const checkMilestones = useCallback(() => {
        const nodes = nodesRef.current.length;
        const conns = connectionsRef.current.length;
        let newAchievement = null;

        MILESTONES.forEach(m => {
            if (achievedMilestones.has(m.key)) return;
            const value = m.type === 'nodes' ? nodes : conns;
            if (value >= m.threshold) {
                setAchievedMilestones(prev => {
                    const next = new Set(prev);
                    next.add(m.key);
                    return next;
                });
                newAchievement = m;
            }
        });

        if (newAchievement) {
            // flash + particle burst everywhere
            setMilestoneFlash(newAchievement);
            nodesRef.current.forEach(n => {
                spawnParticles(n.x, n.y, Math.ceil(PARTICLE.spawnCountOnMilestone / nodesRef.current.length), n.color);
            });
            setTimeout(() => setMilestoneFlash(null), 1800);
        }
    }, [achievedMilestones, spawnParticles]);

    // ================================================================
    //  MAIN ANIMATION LOOP
    // ================================================================
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const loop = () => {
            const { width: W, height: H } = canvas;
            frameRef.current++;
            timeRef.current += 0.016; // ~60fps assumption
            const time = timeRef.current;
            const frame = frameRef.current;

            // 1. Background
            ctx.fillStyle = COLORS.background;
            ctx.fillRect(0, 0, W, H);
            // subtle center glow
            const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.6);
            bgGrad.addColorStop(0, COLORS.backgroundGradientInner);
            bgGrad.addColorStop(1, COLORS.backgroundGradientOuter);
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, W, H);

            const mouse = mouseRef.current;
            const nurture = nurtureRef.current;
            const isNurturing = nurture.active && performance.now() < nurture.until;

            // 2. Grow tendrils
            tendrilsRef.current.forEach(t => {
                if (!t.growing) return;
                const tip = t.points[t.points.length - 1];

                // organic noise
                t.angle += Math.sin(time * GROWTH.noiseFrequency + t.id * 1.7) * GROWTH.noiseAmplitude;

                // mouse attraction
                const toMouse = Math.atan2(mouse.y - tip.y, mouse.x - tip.x);
                const angleDiff = toMouse - t.angle;
                t.angle += Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff)) * GROWTH.mouseAttraction;

                // nurture boost
                let speed = t.speed;
                if (isNurturing && dist(tip, nurture) < 120) {
                    speed *= GROWTH.nurtureMultiplier;
                }

                // extend
                const nx = tip.x + Math.cos(t.angle) * speed;
                const ny = tip.y + Math.sin(t.angle) * speed;
                const segLen = dist(tip, { x: nx, y: ny });

                // record point every segmentLength
                if (t.totalLength === 0 || dist(t.points[t.points.length - 1], { x: nx, y: ny }) >= GROWTH.segmentLength) {
                    t.points.push({ x: nx, y: ny });
                }
                t.totalLength += segLen;

                // stop if too long
                if (t.totalLength >= GROWTH.maxLength) {
                    t.growing = false;
                    return;
                }

                // stop if off-screen
                if (nx < -20 || nx > W + 20 || ny < -20 || ny > H + 20) {
                    t.growing = false;
                    return;
                }

                // connection detection
                const tipPos = { x: nx, y: ny };
                for (const node of nodesRef.current) {
                    if (node.id === t.sourceId) continue;
                    if (dist(tipPos, node) < CONNECTION.snapRadius) {
                        createConnection(t, node);
                        break;
                    }
                }

                // tiny growth particle
                if (t.growing && frame % 4 === 0 && particlesRef.current.length < LIMITS.maxParticles) {
                    particlesRef.current.push({
                        x: nx + (Math.random() - 0.5) * 6,
                        y: ny + (Math.random() - 0.5) * 6,
                        vx: (Math.random() - 0.5) * 0.3,
                        vy: (Math.random() - 0.5) * 0.3,
                        life: 25 + Math.floor(Math.random() * 15),
                        maxLife: 40,
                        color: randomFrom(COLORS.particlePalette),
                    });
                }
            });

            // 3. Draw connections
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            connectionsRef.current.forEach(conn => {
                const pts = conn.path;
                if (pts.length < 2) return;

                ctx.save();
                ctx.strokeStyle = COLORS.connectionStroke;
                ctx.lineWidth = CONNECTION.connectionGlowWidth;
                ctx.shadowColor = COLORS.connectionGlow;
                ctx.shadowBlur = CONNECTION.connectionShadowBlur;

                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                for (let i = 1; i < pts.length; i++) {
                    if (i < pts.length - 1) {
                        const mx = (pts[i].x + pts[i + 1].x) / 2;
                        const my = (pts[i].y + pts[i + 1].y) / 2;
                        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
                    } else {
                        ctx.lineTo(pts[i].x, pts[i].y);
                    }
                }
                ctx.stroke();
                ctx.restore();

                // auto-spawn periodic pulses
                conn.pulseTimer += 16;
                if (conn.pulseTimer >= CONNECTION.pulseInterval && pulsesRef.current.length < LIMITS.maxPulses) {
                    conn.pulseTimer = 0;
                    pulsesRef.current.push({
                        id: uid(),
                        connectionId: conn.id,
                        t: 0,
                        speed: CONNECTION.pulseSpeed * (0.7 + Math.random() * 0.6),
                        color: randomFrom(COLORS.pulsePalette),
                        forward: Math.random() > 0.5,
                    });
                }
            });

            // 4. Draw & update pulses
            pulsesRef.current.forEach(pulse => {
                pulse.t += pulse.speed;
                if (pulse.t > 1) { pulse.dead = true; return; }

                const conn = connectionsRef.current.find(c => c.id === pulse.connectionId);
                if (!conn || conn.path.length < 2) { pulse.dead = true; return; }

                // interpolate position along path
                const pts = pulse.forward ? conn.path : [...conn.path].reverse();
                const totalSegs = pts.length - 1;
                const rawIdx = pulse.t * totalSegs;
                const segIdx = Math.floor(rawIdx);
                const segT = rawIdx - segIdx;
                const a = pts[Math.min(segIdx, pts.length - 1)];
                const b = pts[Math.min(segIdx + 1, pts.length - 1)];
                const px = lerp(a.x, b.x, segT);
                const py = lerp(a.y, b.y, segT);

                ctx.save();
                ctx.beginPath();
                ctx.arc(px, py, 5, 0, Math.PI * 2);
                ctx.fillStyle = pulse.color;
                ctx.shadowColor = pulse.color;
                ctx.shadowBlur = 16;
                ctx.fill();
                ctx.restore();
            });
            pulsesRef.current = pulsesRef.current.filter(p => !p.dead);

            // 5. Draw tendrils
            tendrilsRef.current.forEach(t => {
                const pts = t.points;
                if (pts.length < 2) return;

                ctx.save();
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';

                // gradient from source color → transparent
                const last = pts[pts.length - 1];
                const grad = ctx.createLinearGradient(pts[0].x, pts[0].y, last.x, last.y);
                grad.addColorStop(0, t.sourceColor);
                grad.addColorStop(0.7, COLORS.tendrilStroke);
                grad.addColorStop(1, COLORS.tendrilTip);
                ctx.strokeStyle = grad;

                ctx.beginPath();
                ctx.moveTo(pts[0].x, pts[0].y);
                for (let i = 1; i < pts.length; i++) {
                    if (i < pts.length - 1) {
                        const mx = (pts[i].x + pts[i + 1].x) / 2;
                        const my = (pts[i].y + pts[i + 1].y) / 2;
                        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
                    } else {
                        ctx.lineTo(pts[i].x, pts[i].y);
                    }
                }
                ctx.stroke();

                // growing tip glow
                if (t.growing) {
                    ctx.beginPath();
                    ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
                    ctx.fillStyle = t.sourceColor;
                    ctx.shadowColor = t.sourceColor;
                    ctx.shadowBlur = 8;
                    ctx.fill();
                }
                ctx.restore();
            });

            // 6. Draw nodes
            nodesRef.current.forEach(node => {
                node.glowPhase += NODE.glowPulseSpeed;
                const glowScale = 1 + Math.sin(node.glowPhase) * 0.3;
                const glowR = NODE.glowRadius * glowScale;

                // outer halo
                const halo = ctx.createRadialGradient(node.x, node.y, NODE.radius * 0.5, node.x, node.y, glowR);
                halo.addColorStop(0, node.glow);
                halo.addColorStop(1, 'transparent');
                ctx.fillStyle = halo;
                ctx.beginPath();
                ctx.arc(node.x, node.y, glowR, 0, Math.PI * 2);
                ctx.fill();

                // core
                const coreGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, NODE.radius);
                coreGrad.addColorStop(0, '#ffffff');
                coreGrad.addColorStop(0.4, node.color);
                coreGrad.addColorStop(1, node.glow);
                ctx.fillStyle = coreGrad;
                ctx.beginPath();
                ctx.arc(node.x, node.y, NODE.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            // 7. Click ripples
            clickRipplesRef.current.forEach(r => {
                r.radius += 1.8;
                r.alpha -= 0.015;
                if (r.alpha <= 0) return;
                ctx.save();
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                ctx.strokeStyle = r.color.replace(')', `, ${r.alpha})`).replace('rgb', 'rgba');
                ctx.lineWidth = 2;
                ctx.shadowColor = r.color;
                ctx.shadowBlur = 8;
                ctx.stroke();
                ctx.restore();
            });
            clickRipplesRef.current = clickRipplesRef.current.filter(r => r.alpha > 0);

            // 8. Nurture glow indicator
            if (isNurturing) {
                const nr = nurtureRef.current;
                const elapsed = (performance.now() - (nr.until - GROWTH.nurtureDuration)) / GROWTH.nurtureDuration;
                const nAlpha = Math.max(0, 0.15 * (1 - elapsed));
                const nRadius = 120 * (0.8 + Math.sin(time * 3) * 0.2);
                const nGrad = ctx.createRadialGradient(nr.x, nr.y, 0, nr.x, nr.y, nRadius);
                nGrad.addColorStop(0, `rgba(61, 220, 132, ${nAlpha})`);
                nGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = nGrad;
                ctx.beginPath();
                ctx.arc(nr.x, nr.y, nRadius, 0, Math.PI * 2);
                ctx.fill();
            }

            // 9. Particles
            particlesRef.current.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= PARTICLE.friction;
                p.vy *= PARTICLE.friction;
                p.life--;
                const alpha = Math.max(0, p.life / p.maxLife);
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2 * alpha, 0, Math.PI * 2);
                ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${alpha * 0.8})`);
                ctx.fill();
            });
            particlesRef.current = particlesRef.current.filter(p => p.life > 0);

            // 10. Sync UI every 30 frames
            if (frame % 30 === 0) {
                setNodeCount(nodesRef.current.length);
                setConnectionCount(connectionsRef.current.length);

                const n = nodesRef.current.length;
                const possibleConns = n > 1 ? (n * (n - 1)) / 2 : 0;
                const d = possibleConns > 0
                    ? Math.round((connectionsRef.current.length / possibleConns) * 100)
                    : 0;
                setDensity(d);

                setLongestPath(computeLongestPath());
                checkMilestones();
            }

            animIdRef.current = requestAnimationFrame(loop);
        };

        animIdRef.current = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(animIdRef.current);
            window.removeEventListener('resize', resize);
        };
    }, [createConnection, computeLongestPath, checkMilestones]);

    // --- Clear / reset ---
    const clearNetwork = useCallback(() => {
        nodesRef.current = [];
        tendrilsRef.current = [];
        connectionsRef.current = [];
        pulsesRef.current = [];
        particlesRef.current = [];
        setNodeCount(0);
        setConnectionCount(0);
        setLongestPath(0);
        setDensity(0);
        setAchievedMilestones(new Set());
        setMilestoneFlash(null);
    }, []);

    // --- Event handlers (bound in component) ---
    const handleClick = useCallback((e) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        createNode(e.clientX - rect.left, e.clientY - rect.top);
    }, [createNode]);

    const handleDoubleClick = useCallback((e) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        nurtureRef.current = {
            active: true,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            until: performance.now() + GROWTH.nurtureDuration,
        };
    }, []);

    const handleMouseMove = useCallback((e) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }, []);

    // Touch support
    const handleTouchStart = useCallback((e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect || !touch) return;
        createNode(touch.clientX - rect.left, touch.clientY - rect.top);
    }, [createNode]);

    const handleTouchMove = useCallback((e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect || !touch) return;
        mouseRef.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }, []);

    return {
        canvasRef,
        handleClick,
        handleDoubleClick,
        handleMouseMove,
        handleTouchStart,
        handleTouchMove,
        clearNetwork,
        // UI state
        nodeCount,
        connectionCount,
        longestPath,
        density,
        achievedMilestones,
        milestoneFlash,
    };
};
