import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to manage the fertilizer projectile system.
 * Optimized: Single RAF loop handles both spawning and animation
 */
export const useFertilizerSystem = (isActive, containerRef, onLand, fertilizationGrid) => {
    const [projectiles, setProjectiles] = useState([]);
    const animationFrameRef = useRef();
    const lastSpawnTimeRef = useRef(0);
    const SPAWN_INTERVAL = 100; // Spawn a projectile every 100ms

    useEffect(() => {
        if (!isActive) {
            setProjectiles([]);
            return;
        }

        const animationLoop = () => {
            const now = Date.now();

            // Check if we need to spawn a new projectile
            const shouldSpawn = now - lastSpawnTimeRef.current >= SPAWN_INTERVAL;

            setProjectiles(currentProjectiles => {
                const updatedProjectiles = [];
                let landedProjectiles = [];

                // Update existing projectiles
                for (const p of currentProjectiles) {
                    const age = now - p.spawnTime;
                    if (age >= p.duration) {
                        landedProjectiles.push(p);
                    } else {
                        const progress = age / p.duration;
                        const x = p.startX + (p.endX - p.startX) * progress;
                        const y = p.startY + (p.endY - p.startY) * progress;
                        const scale = 0.5 + progress * 1.5;
                        const opacity = 1 - progress;
                        updatedProjectiles.push({ ...p, x, y, scale, opacity });
                    }
                }

                // Handle landed projectiles
                landedProjectiles.forEach(p => {
                    // Check if this projectile hit a new cell
                    const container = containerRef.current;
                    const grid = fertilizationGrid.current;
                    if (container && grid) {
                        const rect = container.getBoundingClientRect();
                        const gridX = Math.floor((p.endX / rect.width) * grid[0].length);
                        const gridY = Math.floor((p.endY / rect.height) * grid.length);
                        const isNew = !grid[gridY]?.[gridX];

                        // Update grid
                        if (grid[gridY] && grid[gridY][gridX] !== undefined) {
                            grid[gridY][gridX] = true;
                        }

                        onLand(p.endX, p.endY, isNew);
                    } else {
                        onLand(p.endX, p.endY, false);
                    }
                });

                // Spawn new projectile if needed
                if (shouldSpawn) {
                    const container = containerRef.current;
                    const grid = fertilizationGrid.current;
                    if (container && grid) {
                        const rect = container.getBoundingClientRect();
                        const startX = rect.width / 2;
                        const startY = rect.height / 2;
                        let endX, endY;

                        // Find all unfertilized cells
                        const unfertilizedCells = [];
                        for (let y = 0; y < grid.length; y++) {
                            for (let x = 0; x < grid[y].length; x++) {
                                if (!grid[y][x]) {
                                    unfertilizedCells.push({x, y});
                                }
                            }
                        }

                        // Target an unfertilized cell if available, otherwise target randomly
                        if (unfertilizedCells.length > 0) {
                            const targetCell = unfertilizedCells[Math.floor(Math.random() * unfertilizedCells.length)];
                            const cellWidth = rect.width / grid[0].length;
                            const cellHeight = rect.height / grid.length;

                            endX = (targetCell.x * cellWidth) + (Math.random() * cellWidth);
                            endY = (targetCell.y * cellHeight) + (Math.random() * cellHeight);
                        } else {
                            // Fallback to random shooting if all cells are somehow filled
                            endX = Math.random() * rect.width;
                            endY = Math.random() * rect.height;
                        }

                        const newProjectile = {
                            id: now + Math.random(),
                            startX, startY, endX, endY,
                            spawnTime: now,
                            duration: 500 + Math.random() * 500,
                            x: startX,
                            y: startY,
                            scale: 0.5,
                            opacity: 1,
                        };
                        updatedProjectiles.push(newProjectile);
                        lastSpawnTimeRef.current = now;
                    }
                }

                return updatedProjectiles;
            });

            animationFrameRef.current = requestAnimationFrame(animationLoop);
        };

        animationFrameRef.current = requestAnimationFrame(animationLoop);
        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [isActive, containerRef, fertilizationGrid, onLand]);

    return projectiles;
};
