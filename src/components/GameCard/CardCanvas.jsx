import React, { useRef, useEffect } from 'react';

/**
 * Theme-specific color configurations
 */
const THEME_COLORS = {
    arcade: {
        primary: 'rgba(255, 0, 255, 0.6)',
        secondary: 'rgba(0, 255, 255, 0.5)',
        accent: 'rgba(255, 215, 0, 0.6)',
        neonPink: '#ff00ff',
        neonCyan: '#00ffff',
        neonYellow: '#ffd700',
    },
    'floating-islands': {
        primary: 'rgba(124, 179, 66, 0.5)',
        secondary: 'rgba(255, 255, 255, 0.7)',
        accent: 'rgba(255, 183, 77, 0.5)',
        grassGreen: '#7CB342',
        cloudWhite: 'rgba(255, 255, 255, 0.8)',
        skyBlue: 'rgba(135, 206, 235, 0.6)',
    },
    'edo-map': {
        primary: 'rgba(192, 57, 43, 0.45)',
        secondary: 'rgba(201, 168, 76, 0.5)',
        accent: 'rgba(74, 127, 181, 0.4)',
        torii: '#C0392B',
        gold: '#C9A84C',
        water: 'rgba(74, 127, 181, 0.6)',
    },
    'night-fair': {
        primary: 'rgba(255, 179, 0, 0.5)',
        secondary: 'rgba(156, 39, 176, 0.5)',
        accent: 'rgba(233, 30, 99, 0.6)',
        tertiary: 'rgba(0, 188, 212, 0.5)',
        amber: '#FFB300',
        purple: '#9C27B0',
        magenta: '#E91E63',
        cyan: '#00BCD4',
    },
};

/**
 * Canvas background animation for specific game cards
 * Theme-aware with distinct visual styles
 */
const CardCanvas = ({ title, theme = 'arcade' }) => {
    const canvasRef = useRef(null);
    const colors = THEME_COLORS[theme] || THEME_COLORS.arcade;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        let animationId;

        // Mouse Stalker animation - theme-aware
        if (title === 'Mouse Stalker') {
            let mouseX = canvas.width / 2;
            let mouseY = canvas.height / 2;
            let targetX = mouseX;
            let targetY = mouseY;

            const trail = [];
            const maxTrailLength = theme === 'arcade' ? 10 : 6;

            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                mouseX += (targetX - mouseX) * 0.1;
                mouseY += (targetY - mouseY) * 0.1;

                trail.push({ x: mouseX, y: mouseY });
                if (trail.length > maxTrailLength) trail.shift();

                if (theme === 'arcade') {
                    // Neon trail with alternating colors
                    trail.forEach((pos, i) => {
                        const alpha = (i / trail.length) * 0.6;
                        const size = 12 + (i / trail.length) * 18;

                        ctx.beginPath();
                        ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
                        ctx.fillStyle = i % 2 === 0
                            ? `rgba(255, 0, 255, ${alpha})`
                            : `rgba(0, 255, 255, ${alpha})`;
                        ctx.fill();
                    });

                    // Main circle with neon glow
                    ctx.shadowBlur = 25;
                    ctx.shadowColor = colors.neonPink;
                    ctx.beginPath();
                    ctx.arc(mouseX, mouseY, 30, 0, Math.PI * 2);
                    ctx.fillStyle = colors.primary;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                } else {
                    // Floating Islands: Soft, dreamy cloud-like trail
                    trail.forEach((pos, i) => {
                        const alpha = (i / trail.length) * 0.4;
                        const size = 15 + (i / trail.length) * 20;

                        // Soft white cloud puffs
                        ctx.beginPath();
                        ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                        ctx.fill();
                    });

                    // Main circle - soft green orb
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = 'rgba(124, 179, 66, 0.5)';
                    ctx.beginPath();
                    ctx.arc(mouseX, mouseY, 28, 0, Math.PI * 2);
                    ctx.fillStyle = colors.primary;
                    ctx.fill();

                    // Inner highlight
                    ctx.beginPath();
                    ctx.arc(mouseX - 8, mouseY - 8, 10, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }

                animationId = requestAnimationFrame(animate);
            };

            const handleMouseMove = (e) => {
                const canvasRect = canvas.getBoundingClientRect();
                targetX = e.clientX - canvasRect.left;
                targetY = e.clientY - canvasRect.top;
            };

            canvas.addEventListener('mousemove', handleMouseMove);
            animate();

            return () => {
                cancelAnimationFrame(animationId);
                canvas.removeEventListener('mousemove', handleMouseMove);
            };
        }

        // Blooming Garden animation - theme-aware
        if (title === 'Blooming Garden') {
            const particles = Array.from({ length: theme === 'arcade' ? 18 : 15 }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 10 + 5,
                speed: Math.random() * (theme === 'arcade' ? 1.2 : 0.8) + 0.4,
                rotation: Math.random() * Math.PI * 2,
                colorIndex: Math.floor(Math.random() * 3),
                wobble: Math.random() * Math.PI * 2,
            }));

            const arcadeColors = [colors.primary, colors.secondary, colors.accent];
            const islandsColors = [
                'rgba(244, 143, 177, 0.6)', // flower pink
                'rgba(255, 255, 255, 0.7)', // white petals
                'rgba(255, 183, 77, 0.5)',  // warm yellow
            ];

            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                particles.forEach(particle => {
                    particle.y += particle.speed;
                    particle.rotation += theme === 'arcade' ? 0.03 : 0.02;
                    particle.wobble += 0.02;

                    // Add horizontal wobble for islands theme
                    if (theme === 'floating-islands') {
                        particle.x += Math.sin(particle.wobble) * 0.3;
                    }

                    if (particle.y > canvas.height + particle.size) {
                        particle.y = -particle.size;
                        particle.x = Math.random() * canvas.width;
                    }

                    ctx.save();
                    ctx.translate(particle.x, particle.y);
                    ctx.rotate(particle.rotation);

                    if (theme === 'arcade') {
                        // Pixel-like squares with neon glow
                        ctx.shadowBlur = 10;
                        ctx.shadowColor = arcadeColors[particle.colorIndex];
                        ctx.fillStyle = arcadeColors[particle.colorIndex];
                        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
                        ctx.shadowBlur = 0;
                    } else {
                        // Soft flower petals / leaves
                        ctx.shadowBlur = 5;
                        ctx.shadowColor = 'rgba(124, 179, 66, 0.3)';
                        ctx.fillStyle = islandsColors[particle.colorIndex];

                        // Draw petal shape
                        ctx.beginPath();
                        ctx.ellipse(0, 0, particle.size / 2, particle.size, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    }

                    ctx.restore();
                });

                animationId = requestAnimationFrame(animate);
            };

            animate();

            return () => {
                cancelAnimationFrame(animationId);
            };
        }

        // 3D Ball animation - theme-aware
        if (title === '3D Ball') {
            let time = 0;

            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                time += 0.02;

                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const radius = Math.min(canvas.width, canvas.height) * 0.25;

                if (theme === 'arcade') {
                    // Neon orbiting rings
                    for (let i = 0; i < 3; i++) {
                        const angle = time + (i * Math.PI * 2 / 3);
                        const orbitRadius = radius + 15;

                        ctx.beginPath();
                        ctx.arc(
                            centerX + Math.cos(angle) * orbitRadius * 0.3,
                            centerY + Math.sin(angle) * orbitRadius * 0.5,
                            8,
                            0,
                            Math.PI * 2
                        );
                        ctx.fillStyle = i === 0 ? colors.primary : i === 1 ? colors.secondary : colors.accent;
                        ctx.shadowBlur = 15;
                        ctx.shadowColor = i === 0 ? colors.neonPink : colors.neonCyan;
                        ctx.fill();
                    }

                    // Main sphere with neon gradient
                    const gradient = ctx.createRadialGradient(
                        centerX - radius * 0.3,
                        centerY - radius * 0.3,
                        0,
                        centerX,
                        centerY,
                        radius
                    );
                    gradient.addColorStop(0, 'rgba(0, 255, 255, 0.4)');
                    gradient.addColorStop(0.5, 'rgba(255, 0, 255, 0.3)');
                    gradient.addColorStop(1, 'rgba(255, 0, 255, 0.1)');

                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    ctx.fillStyle = gradient;
                    ctx.shadowBlur = 30;
                    ctx.shadowColor = colors.neonPink;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                } else {
                    // Floating Islands: Soft nature orb with orbiting leaves
                    for (let i = 0; i < 4; i++) {
                        const angle = time * 0.8 + (i * Math.PI / 2);
                        const orbitRadius = radius + 20;
                        const leafX = centerX + Math.cos(angle) * orbitRadius * 0.4;
                        const leafY = centerY + Math.sin(angle) * orbitRadius * 0.6;

                        ctx.save();
                        ctx.translate(leafX, leafY);
                        ctx.rotate(angle);

                        // Leaf shape
                        ctx.beginPath();
                        ctx.ellipse(0, 0, 6, 12, 0, 0, Math.PI * 2);
                        ctx.fillStyle = i % 2 === 0 ? 'rgba(124, 179, 66, 0.6)' : 'rgba(139, 195, 74, 0.5)';
                        ctx.shadowBlur = 8;
                        ctx.shadowColor = 'rgba(124, 179, 66, 0.4)';
                        ctx.fill();
                        ctx.restore();
                    }

                    // Main sphere - soft earth/nature feel
                    const gradient = ctx.createRadialGradient(
                        centerX - radius * 0.3,
                        centerY - radius * 0.3,
                        0,
                        centerX,
                        centerY,
                        radius
                    );
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
                    gradient.addColorStop(0.4, 'rgba(135, 206, 235, 0.4)');
                    gradient.addColorStop(0.7, 'rgba(124, 179, 66, 0.3)');
                    gradient.addColorStop(1, 'rgba(124, 179, 66, 0.1)');

                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    ctx.fillStyle = gradient;
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = 'rgba(124, 179, 66, 0.4)';
                    ctx.fill();

                    // Cloud highlight
                    ctx.beginPath();
                    ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.4, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }

                animationId = requestAnimationFrame(animate);
            };

            animate();

            return () => {
                cancelAnimationFrame(animationId);
            };
        }

        // Mycelium Network — organic tendril + node preview
        if (title === 'Mycelium Network') {
            let time = 0;
            const nodes = Array.from({ length: 5 }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 3 + 4,
                phase: Math.random() * Math.PI * 2,
            }));
            // pre-computed bezier tendrils between some nodes
            const tendrils = [];
            for (let i = 0; i < nodes.length - 1; i++) {
                tendrils.push({
                    a: nodes[i],
                    b: nodes[i + 1],
                    cx: (nodes[i].x + nodes[i + 1].x) / 2 + (Math.random() - 0.5) * 40,
                    cy: (nodes[i].y + nodes[i + 1].y) / 2 + (Math.random() - 0.5) * 40,
                });
            }

            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                time += 0.016;

                // draw tendrils
                tendrils.forEach(t => {
                    ctx.save();
                    ctx.strokeStyle = 'rgba(61, 220, 132, 0.18)';
                    ctx.lineWidth = 1.5;
                    ctx.shadowColor = 'rgba(61, 220, 132, 0.15)';
                    ctx.shadowBlur = 6;
                    ctx.beginPath();
                    ctx.moveTo(t.a.x, t.a.y);
                    ctx.quadraticCurveTo(t.cx + Math.sin(time * 0.5) * 4, t.cy + Math.cos(time * 0.4) * 4, t.b.x, t.b.y);
                    ctx.stroke();
                    ctx.restore();
                });

                // draw nodes
                nodes.forEach(n => {
                    const glow = 1 + Math.sin(time * 1.5 + n.phase) * 0.35;
                    const r = n.r * glow;
                    const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 2.5);
                    grad.addColorStop(0, 'rgba(61, 220, 132, 0.25)');
                    grad.addColorStop(1, 'rgba(61, 220, 132, 0)');
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, r * 2.5, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(61, 220, 132, 0.35)';
                    ctx.fill();
                });

                animationId = requestAnimationFrame(animate);
            };

            animate();
            return () => cancelAnimationFrame(animationId);
        }

        if (title === 'Firework Festival') {
            let time = 0;
            const fwColors = ['#ff3b3b', '#3b8bff', '#ffe03b', '#3bff6e', '#b23bff', '#ff8c3b'];
            const shapeTypes = ['circle', 'square', 'triangle'];

            const createMiniFirework = () => ({
                x: Math.random() * canvas.width,
                y: canvas.height * 0.85,
                targetY: Math.random() * canvas.height * 0.4 + canvas.height * 0.1,
                color: fwColors[Math.floor(Math.random() * fwColors.length)],
                shape: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
                phase: 'launch',
                age: 0,
                speed: 1.5 + Math.random() * 1.5,
                particles: [],
            });

            const fireworks = [createMiniFirework()];
            let spawnTimer = 0;

            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                time += 0.016;
                spawnTimer += 0.016;

                if (spawnTimer > 1.2 + Math.random() * 0.8 && fireworks.length < 3) {
                    fireworks.push(createMiniFirework());
                    spawnTimer = 0;
                }

                fireworks.forEach((fw, idx) => {
                    fw.age += 0.016;

                    if (fw.phase === 'launch') {
                        fw.y -= fw.speed;
                        // Trail
                        ctx.beginPath();
                        ctx.arc(fw.x, fw.y, 1.5, 0, Math.PI * 2);
                        ctx.fillStyle = fw.color;
                        ctx.shadowBlur = 6;
                        ctx.shadowColor = fw.color;
                        ctx.fill();
                        ctx.shadowBlur = 0;

                        if (fw.y <= fw.targetY) {
                            fw.phase = 'explode';
                            fw.age = 0;
                            const count = 16;
                            for (let p = 0; p < count; p++) {
                                let angle, r;
                                if (fw.shape === 'circle') {
                                    angle = (Math.PI * 2 * p) / count;
                                    r = 1;
                                } else if (fw.shape === 'square') {
                                    const side = Math.floor(p / 4);
                                    const t = (p % 4) / 4;
                                    const pts = [[-1,-1,2,0],[1,-1,0,2],[1,1,-2,0],[-1,1,0,-2]];
                                    const s = pts[side] || pts[0];
                                    const sx = s[0] + s[2] * t, sy = s[1] + s[3] * t;
                                    angle = Math.atan2(sy, sx);
                                    r = Math.sqrt(sx*sx + sy*sy);
                                } else {
                                    const verts = [[0,-1.2],[-1.1,0.9],[1.1,0.9]];
                                    const edge = p % 3;
                                    const t = Math.floor(p / 3) / Math.ceil(count / 3);
                                    const a = verts[edge], b = verts[(edge+1)%3];
                                    const sx = a[0]+(b[0]-a[0])*t, sy = a[1]+(b[1]-a[1])*t;
                                    angle = Math.atan2(sy, sx);
                                    r = Math.sqrt(sx*sx + sy*sy);
                                }
                                fw.particles.push({
                                    angle,
                                    speed: r * (1.2 + Math.random() * 0.5),
                                    size: 1.5 + Math.random(),
                                });
                            }
                        }
                    }

                    if (fw.phase === 'explode') {
                        const progress = fw.age / 1.8;
                        if (progress > 1) {
                            fireworks[idx] = createMiniFirework();
                            return;
                        }
                        const fadeOut = Math.max(0, 1 - progress * 1.1);
                        fw.particles.forEach(p => {
                            const dist = p.speed * fw.age * 20;
                            const px = fw.x + Math.cos(p.angle) * dist;
                            const py = fw.y + Math.sin(p.angle) * dist + fw.age * fw.age * 8;
                            if (fadeOut <= 0) return;
                            ctx.beginPath();
                            ctx.arc(px, py, p.size * (1 - progress * 0.4), 0, Math.PI * 2);
                            ctx.fillStyle = fw.color;
                            ctx.globalAlpha = fadeOut * 0.7;
                            ctx.shadowBlur = 5;
                            ctx.shadowColor = fw.color;
                            ctx.fill();
                            ctx.shadowBlur = 0;
                            ctx.globalAlpha = 1;
                        });
                    }
                });

                animationId = requestAnimationFrame(animate);
            };

            animate();
            return () => cancelAnimationFrame(animationId);
        }

        // For Edo Map and Night Fair themes with any title: add a soft ink/light ambient animation
        if (theme === 'edo-map') {
            let time = 0;
            const inkDots = Array.from({ length: 6 }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 18 + 8,
                speed: Math.random() * 0.004 + 0.002,
                offset: Math.random() * Math.PI * 2,
            }));

            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                time += 0.016;

                inkDots.forEach(dot => {
                    const alpha = 0.03 + Math.sin(time * dot.speed * 100 + dot.offset) * 0.02;
                    ctx.beginPath();
                    ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(192, 57, 43, ${alpha})`;
                    ctx.fill();
                });

                // Subtle brushstroke horizontal lines
                for (let i = 0; i < 3; i++) {
                    const y = canvas.height * (0.25 + i * 0.25);
                    const alpha = 0.025 + Math.sin(time * 0.5 + i) * 0.015;
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(canvas.width, y + Math.sin(time * 0.3 + i) * 3);
                    ctx.strokeStyle = `rgba(44, 31, 20, ${alpha})`;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }

                animationId = requestAnimationFrame(animate);
            };

            animate();
            return () => cancelAnimationFrame(animationId);
        }

        if (theme === 'night-fair') {
            const sparkColors = [
                colors.primary,
                colors.secondary,
                colors.accent,
                colors.tertiary || 'rgba(0, 188, 212, 0.5)',
            ];

            const createFirework = () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height * 0.7,
                particles: Array.from({ length: 12 }, () => ({
                    angle: Math.random() * Math.PI * 2,
                    speed: Math.random() * 2 + 1,
                    size: Math.random() * 3 + 1.5,
                    colorIdx: Math.floor(Math.random() * 4),
                })),
                age: 0,
                maxAge: 1.5 + Math.random(),
            });

            const fireworks = Array.from({ length: 3 }, () => {
                const fw = createFirework();
                fw.age = Math.random() * fw.maxAge;
                return fw;
            });

            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                fireworks.forEach((fw, fwIdx) => {
                    fw.age += 0.016;

                    if (fw.age > fw.maxAge) {
                        fireworks[fwIdx] = createFirework();
                        return;
                    }

                    const progress = fw.age / fw.maxAge;
                    const fadeOut = Math.max(0, 1 - progress * 1.2);

                    fw.particles.forEach(p => {
                        const dist = p.speed * fw.age * 30;
                        const px = fw.x + Math.cos(p.angle) * dist;
                        const py = fw.y + Math.sin(p.angle) * dist + (fw.age * fw.age * 15);

                        const alpha = fadeOut * 0.6;
                        if (alpha <= 0) return;

                        const color = sparkColors[p.colorIdx];
                        ctx.beginPath();
                        ctx.arc(px, py, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
                        ctx.fillStyle = color.replace(/[\d.]+\)$/, `${alpha})`);
                        ctx.shadowBlur = 8;
                        ctx.shadowColor = color;
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    });
                });

                animationId = requestAnimationFrame(animate);
            };

            animate();
            return () => cancelAnimationFrame(animationId);
        }

        // Default: No animation for unknown titles
        return () => {
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, [title, theme, colors]);

    return <canvas ref={canvasRef} className="card-background-canvas" />;
};

export default CardCanvas;
