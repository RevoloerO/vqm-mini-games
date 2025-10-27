import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to manage the entire fire particle animation system.
 * Optimized: Reduced spawn rate from 83/sec to 20/sec, capped max particles
 */
export const useFireParticleSystem = (isActive, ballRef, mousePosRef) => {
    const [particles, setParticles] = useState([]);
    const animationFrameRef = useRef();
    const lastSpawnTimeRef = useRef(0);
    const MAX_PARTICLES = 30; // Cap the maximum number of particles

    useEffect(() => {
        if (!isActive) {
            setParticles([]); // Clear particles if not active
            return;
        }

        const SPAWN_INTERVAL = 50; // Reduced from 12ms to 50ms (20 particles/sec instead of 83)

        const animationLoop = () => {
            const now = Date.now();

            // Spawn new particle if enough time has passed and under the cap
            if (now - lastSpawnTimeRef.current >= SPAWN_INTERVAL) {
                setParticles(currentParticles => {
                    // Only spawn if under the cap
                    if (currentParticles.length >= MAX_PARTICLES) {
                        return currentParticles.map(p => {
                            const age = now - p.spawnTime;
                            if (age >= p.duration) return null;

                            const progress = age / p.duration;
                            const currentEndX = mousePosRef.current.x;
                            const currentEndY = mousePosRef.current.y;
                            const linearX = p.startX + (currentEndX - p.startX) * progress;
                            const linearY = p.startY + (currentEndY - p.startY) * progress;
                            const angle = Math.atan2(currentEndY - p.startY, currentEndX - p.startX) + Math.PI / 2;
                            const waveOffset = Math.sin(progress * p.waveFrequency * Math.PI) * p.waveAmplitude * (1 - progress);
                            const x = linearX + Math.cos(angle) * waveOffset;
                            const y = linearY + Math.sin(angle) * waveOffset;
                            const opacity = 1 - progress;

                            return { ...p, x, y, opacity };
                        }).filter(Boolean);
                    }

                    const ballEl = ballRef.current;
                    if (!ballEl) {
                        return currentParticles.map(p => {
                            const age = now - p.spawnTime;
                            if (age >= p.duration) return null;

                            const progress = age / p.duration;
                            const currentEndX = mousePosRef.current.x;
                            const currentEndY = mousePosRef.current.y;
                            const linearX = p.startX + (currentEndX - p.startX) * progress;
                            const linearY = p.startY + (currentEndY - p.startY) * progress;
                            const angle = Math.atan2(currentEndY - p.startY, currentEndX - p.startX) + Math.PI / 2;
                            const waveOffset = Math.sin(progress * p.waveFrequency * Math.PI) * p.waveAmplitude * (1 - progress);
                            const x = linearX + Math.cos(angle) * waveOffset;
                            const y = linearY + Math.sin(angle) * waveOffset;
                            const opacity = 1 - progress;

                            return { ...p, x, y, opacity };
                        }).filter(Boolean);
                    }

                    const ballRect = ballEl.getBoundingClientRect();
                    const containerRect = ballEl.closest('.three-ball-container').getBoundingClientRect();
                    const angle = Math.random() * 2 * Math.PI;
                    const radius = Math.sqrt(Math.random()) * (ballRect.width / 2);
                    const startX = (ballRect.left - containerRect.left + ballRect.width / 2) + Math.cos(angle) * radius;
                    const startY = (ballRect.top - containerRect.top + ballRect.height / 2) + Math.sin(angle) * radius;

                    const newParticle = {
                        id: Math.random() + Date.now(),
                        spawnTime: now,
                        startX, startY, x: startX, y: startY, opacity: 1,
                        size: 8 + Math.random() * 12,
                        duration: 1500 + Math.random() * 1500,
                        waveAmplitude: 15 + Math.random() * 20,
                        waveFrequency: 2 + Math.random() * 3,
                    };

                    const updated = currentParticles.map(p => {
                        const age = now - p.spawnTime;
                        if (age >= p.duration) return null;

                        const progress = age / p.duration;
                        const currentEndX = mousePosRef.current.x;
                        const currentEndY = mousePosRef.current.y;
                        const linearX = p.startX + (currentEndX - p.startX) * progress;
                        const linearY = p.startY + (currentEndY - p.startY) * progress;
                        const angle = Math.atan2(currentEndY - p.startY, currentEndX - p.startX) + Math.PI / 2;
                        const waveOffset = Math.sin(progress * p.waveFrequency * Math.PI) * p.waveAmplitude * (1 - progress);
                        const x = linearX + Math.cos(angle) * waveOffset;
                        const y = linearY + Math.sin(angle) * waveOffset;
                        const opacity = 1 - progress;

                        return { ...p, x, y, opacity };
                    }).filter(Boolean);

                    return [...updated, newParticle];
                });

                lastSpawnTimeRef.current = now;
            } else {
                // Just update existing particles
                setParticles(currentParticles => {
                    return currentParticles.map(p => {
                        const age = now - p.spawnTime;
                        if (age >= p.duration) return null;

                        const progress = age / p.duration;
                        const currentEndX = mousePosRef.current.x;
                        const currentEndY = mousePosRef.current.y;
                        const linearX = p.startX + (currentEndX - p.startX) * progress;
                        const linearY = p.startY + (currentEndY - p.startY) * progress;
                        const angle = Math.atan2(currentEndY - p.startY, currentEndX - p.startX) + Math.PI / 2;
                        const waveOffset = Math.sin(progress * p.waveFrequency * Math.PI) * p.waveAmplitude * (1 - progress);
                        const x = linearX + Math.cos(angle) * waveOffset;
                        const y = linearY + Math.sin(angle) * waveOffset;
                        const opacity = 1 - progress;

                        return { ...p, x, y, opacity };
                    }).filter(Boolean);
                });
            }

            animationFrameRef.current = requestAnimationFrame(animationLoop);
        };

        animationFrameRef.current = requestAnimationFrame(animationLoop);

        return () => {
            cancelAnimationFrame(animationFrameRef.current);
        };
    }, [isActive, ballRef, mousePosRef]);

    return particles;
};
