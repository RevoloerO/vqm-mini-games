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

        // Default: No animation for unknown titles
        return () => {
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, [title, theme, colors]);

    return <canvas ref={canvasRef} className="card-background-canvas" />;
};

export default CardCanvas;
