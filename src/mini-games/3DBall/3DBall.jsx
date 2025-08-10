// 3DBall.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Paintbrush, X } from 'lucide-react';

// Import all the stylesheets
import './3DBall.css';
import './normal_skins.css';
import './magical_skins.css';
import './scifi_skins.css';
import './genesis_sphere.css'; // Import the new CSS file

/**
 * Sidebar component for selecting different ball skins.
 */
const SkinSidebar = ({ isOpen, onSelectSkin, activeSkin }) => {
    const categorizedSkins = {
        'Conceptual': [ { id: 'genesis-sphere', name: 'Genesis Sphere' } ],
        'Normal Objects': [ { id: 'sphere', name: 'Sphere' }, { id: 'pokeball', name: 'Pokéball' } ],
        'Magical': [ { id: 'fireball', name: 'Fireball Jutsu' }, { id: 'ice-orb', name: 'Ice Orb' }, { id: 'dragon-ball', name: 'Dragon Ball' }, { id: 'palantir', name: 'Palantír Stone' } ],
        'Sci-Fi': [ { id: 'energy-core', name: 'Energy Core' }, { id: 'arc-reactor', name: 'Arc Reactor' } ]
    };
    return (
        <aside className={`skin-sidebar ${isOpen ? 'open' : ''}`}>
            <h3>Customize Skin</h3>
            <div className="skin-options">
                {Object.entries(categorizedSkins).map(([category, skins]) => (
                    <div key={category} className="skin-category">
                        <h4>{category}</h4>
                        <div className="skin-category-buttons">
                            {skins.map((skin) => (
                                <button key={skin.id} className={`skin-button ${activeSkin === skin.id ? 'active' : ''}`} onClick={() => onSelectSkin(skin.id)}>
                                    {skin.name}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};

// --- Genesis Sphere Components & Hooks ---

const FertilizerProjectile = React.memo(({ style }) => <div className="fertilizer-projectile" style={style}></div>);
const FertilizerPatch = React.memo(({ style }) => <div className="fertilizer-patch" style={style}></div>);

/**
 * Custom hook to manage the fertilizer projectile system.
 */
const useFertilizerSystem = (isActive, containerRef, onLand, fertilizationGrid) => {
    const [projectiles, setProjectiles] = useState([]);
    const animationFrameRef = useRef();

    // Projectile spawning logic
    useEffect(() => {
        if (!isActive) {
            setProjectiles([]);
            return;
        }

        const spawnInterval = setInterval(() => {
            const container = containerRef.current;
            const grid = fertilizationGrid.current;
            if (!container || !grid) return;

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
                id: Date.now() + Math.random(),
                startX, startY, endX, endY,
                spawnTime: Date.now(),
                duration: 500 + Math.random() * 500,
            };
            setProjectiles(prev => [...prev, newProjectile]);
        }, 100); // Spawn a projectile every 100ms

        return () => clearInterval(spawnInterval);
    }, [isActive, containerRef, fertilizationGrid]);

    // Animation loop
    useEffect(() => {
        if (!isActive) return;

        const animationLoop = () => {
            setProjectiles(currentProjectiles => {
                const now = Date.now();
                const updatedProjectiles = [];
                for (const p of currentProjectiles) {
                    const age = now - p.spawnTime;
                    if (age >= p.duration) {
                        onLand(p.endX, p.endY); // Projectile lands
                    } else {
                        const progress = age / p.duration;
                        const x = p.startX + (p.endX - p.startX) * progress;
                        const y = p.startY + (p.endY - p.startY) * progress;
                        const scale = 0.5 + progress * 1.5;
                        const opacity = 1 - progress;
                        updatedProjectiles.push({ ...p, x, y, scale, opacity });
                    }
                }
                return updatedProjectiles;
            });
            animationFrameRef.current = requestAnimationFrame(animationLoop);
        };

        animationFrameRef.current = requestAnimationFrame(animationLoop);
        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [isActive, onLand]);

    return projectiles;
};


// SVG component for a single star
const DragonBallStar = () => ( <svg viewBox="0 0 100 95"> <path d="M50 0 L61.2 35.5 H97.6 L68.2 57.4 L79.4 92.9 L50 71 L20.6 92.9 L31.8 57.4 L2.4 35.5 H38.8 Z" /> </svg> );
const STAR_POSITIONS = { 1: [{ top: '50%', left: '50%' }], 2: [{ top: '35%', left: '65%' }, { top: '65%', left: '35%' }], 3: [{ top: '35%', left: '35%' }, { top: '50%', left: '68%' }, { top: '65%', left: '35%' }], 4: [{ top: '33%', left: '33%' }, { top: '33%', left: '67%' }, { top: '67%', left: '33%' }, { top: '67%', left: '67%' }], 5: [{ top: '30%', left: '50%' }, { top: '45%', left: '32%' }, { top: '45%', left: '68%' }, { top: '68%', left: '40%' }, { top: '68%', left: '60%' }], 6: [{ top: '33%', left: '33%' }, { top: '33%', left: '67%' }, { top: '50%', left: '33%' }, { top: '50%', left: '67%' }, { top: '67%', left: '33%' }, { top: '67%', left: '67%' }], 7: [{ top: '30%', left: '50%' }, { top: '42%', left: '32%' }, { top: '42%', left: '68%' }, { top: '58%', left: '32%' }, { top: '58%', left: '68%' }, { top: '70%', left: '50%' }, { top: '50%', left: '50%' }], };

/**
 * A presentational component for a single fire particle. Its position is controlled by the parent.
 */
const FireParticle = React.memo(({ x, y, size, opacity }) => {
    const style = {
        transform: `translate(${x}px, ${y}px)`,
        width: `${size}px`,
        height: `${size}px`,
        opacity: opacity,
        position: 'absolute', // Ensure particles are positioned correctly
        top: 0,
        left: 0,
    };
    return (
        <div className="fire-particle" style={style}>
            <div className={`fire-particle-inner wave-${Math.ceil(Math.random() * 3)}`}></div>
        </div>
    );
});

/**
 * Custom hook to manage the entire fire particle animation system.
 */
const useFireParticleSystem = (isActive, ballRef, mousePosRef) => {
    const [particles, setParticles] = useState([]);
    const animationFrameRef = useRef();

    useEffect(() => {
        if (!isActive) {
            setParticles([]); // Clear particles if not active
            return;
        }

        const animationLoop = () => {
            setParticles(currentParticles => {
                const now = Date.now();
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

            animationFrameRef.current = requestAnimationFrame(animationLoop);
        };
        
        animationFrameRef.current = requestAnimationFrame(animationLoop);

        const spawnInterval = setInterval(() => {
            const ballEl = ballRef.current;
            if (!ballEl) return;

            const ballRect = ballEl.getBoundingClientRect();
            const containerRect = ballEl.closest('.three-ball-container').getBoundingClientRect();
            const angle = Math.random() * 2 * Math.PI;
            const radius = Math.sqrt(Math.random()) * (ballRect.width / 2);
            const startX = (ballRect.left - containerRect.left + ballRect.width / 2) + Math.cos(angle) * radius;
            const startY = (ballRect.top - containerRect.top + ballRect.height / 2) + Math.sin(angle) * radius;

            const newParticle = {
                id: Math.random() + Date.now(),
                spawnTime: Date.now(),
                startX, startY, x: startX, y: startY, opacity: 1,
                size: 8 + Math.random() * 12,
                duration: 1500 + Math.random() * 1500,
                waveAmplitude: 15 + Math.random() * 20,
                waveFrequency: 2 + Math.random() * 3,
            };
            setParticles(prev => [...prev, newParticle]);
        }, 12);

        return () => {
            clearInterval(spawnInterval);
            cancelAnimationFrame(animationFrameRef.current);
        };
    }, [isActive, ballRef, mousePosRef]);

    return particles;
};


/**
 * The main component that renders a "faux 3D" ball and a sidebar for customization.
 */
const ThreeDBall = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [activeSkin, setActiveSkin] = useState('genesis-sphere');
    const [styles, setStyles] = useState({});
    const containerRef = useRef(null);
    const ballRef = useRef(null);
    const mousePosRef = useRef({ x: 0, y: 0 });
    const [lightningTick, setLightningTick] = useState(0);
    const [starCount, setStarCount] = useState(4);
    
    // --- Genesis Sphere State ---
    const [genesisCycle, setGenesisCycle] = useState('seeding');
    const [fertilizerPatches, setFertilizerPatches] = useState([]);
    const fertilizationGrid = useRef(null);
    const isFertilized = useRef(false);
    const GRID_SIZE = 10; // 10x10 grid

    // --- Genesis Sphere Logic ---
    const handleFertilizerLand = useCallback((x, y) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        const newPatch = {
            id: Date.now() + Math.random(),
            top: `${(y / rect.height) * 100}%`,
            left: `${(x / rect.width) * 100}%`,
            size: 150 + Math.random() * 100,
        };
        setFertilizerPatches(prev => [...prev, newPatch]);

        if (isFertilized.current) return;
        const gridX = Math.floor((x / rect.width) * GRID_SIZE);
        const gridY = Math.floor((y / rect.height) * GRID_SIZE);
        if (fertilizationGrid.current && !fertilizationGrid.current[gridY][gridX]) {
            fertilizationGrid.current[gridY][gridX] = true;
            
            if (fertilizationGrid.current.every(row => row.every(cell => cell))) {
                isFertilized.current = true;
                setGenesisCycle('growth');
            }
        }
    }, []);

    // --- Particle System Hooks ---
    const fireParticles = useFireParticleSystem(activeSkin === 'fireball', ballRef, mousePosRef);
    const projectiles = useFertilizerSystem(activeSkin === 'genesis-sphere' && genesisCycle === 'seeding', containerRef, handleFertilizerLand, fertilizationGrid);


    // Effect for managing the Genesis Sphere cycle
    useEffect(() => {
        if (activeSkin !== 'genesis-sphere') {
            setFertilizerPatches([]);
            return;
        }
        
        isFertilized.current = false;
        fertilizationGrid.current = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
        setFertilizerPatches([]);
        setGenesisCycle('seeding');

        const cycleDurations = {
            growth: 20000,
            destruction: 10000,
            restoration: 20000,
        };

        let growthTimeout, destructionTimeout, restorationTimeout;

        if (genesisCycle === 'growth') {
             growthTimeout = setTimeout(() => setGenesisCycle('destruction'), cycleDurations.growth);
        } else if (genesisCycle === 'destruction') {
             destructionTimeout = setTimeout(() => setGenesisCycle('restoration'), cycleDurations.destruction);
        } else if (genesisCycle === 'restoration') {
             restorationTimeout = setTimeout(() => {
                isFertilized.current = false;
                fertilizationGrid.current = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
                setFertilizerPatches([]);
                setGenesisCycle('seeding');
            }, cycleDurations.restoration);
        }

        return () => {
            clearTimeout(growthTimeout);
            clearTimeout(destructionTimeout);
            clearTimeout(restorationTimeout);
        };

    }, [activeSkin, genesisCycle]);


    // General mouse move handler for all skins
    useEffect(() => {
        const currentContainer = containerRef.current;
        const currentBall = ballRef.current;
        if (!currentContainer || !currentBall) return;

        const handleMouseMove = (e) => {
            const { left, top, width, height } = currentContainer.getBoundingClientRect();
            const x = e.clientX - left;
            const y = e.clientY - top;
            mousePosRef.current = { x, y };

            if (activeSkin === 'pokeball' || activeSkin === 'arc-reactor') {
                const rotateY = (x - width / 2) / (width / 2) * 15;
                const rotateX = -(y - height / 2) / (height / 2) * 15;
                setStyles({
                    ball: { transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`, transition: 'transform 0.05s linear' },
                    shine: { transform: `translateX(${-rotateY * 1.2}px) translateY(${-rotateX * 1.2}px) rotate(30deg)`, transition: 'transform 0.05s linear' }
                });
            } else if (activeSkin === 'dragon-ball') {
                const angle = Math.atan2(y - (height / 2), x - (width / 2));
                let degrees = angle * (180 / Math.PI);
                degrees = (degrees + 360) % 360;
                const segmentSize = 360 / 7;
                setStarCount(Math.floor(degrees / segmentSize) + 1);
            } else if (activeSkin === 'palantir') {
                const ballRect = currentBall.getBoundingClientRect();
                const mouseX = e.clientX - ballRect.left;
                const mouseY = e.clientY - ballRect.top;
                
                currentBall.style.setProperty('--mouse-x', `${(mouseX / ballRect.width) * 100}%`);
                currentBall.style.setProperty('--mouse-y', `${(mouseY / ballRect.height) * 100}%`);

                const centerX = ballRect.width / 2;
                const centerY = ballRect.height / 2;
                
                const deltaX = mouseX - centerX;
                const deltaY = mouseY - centerY;
                const angleRad = Math.atan2(deltaY, deltaX);
                const angleDeg = angleRad * (180 / Math.PI);
                const maxMove = 25; 
                const moveX = (deltaX / centerX) * maxMove;
                const moveY = (deltaY / centerY) * maxMove;
                setStyles(prevStyles => ({ ...prevStyles, pupil: { transform: `translate(-50%, -50%) translate(${moveX}px, ${moveY}px) rotate(${angleDeg}deg)` } }));
                
                const angleToCenterDeg = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
                currentBall.style.setProperty('--shield-rotation', `${angleToCenterDeg}deg`);

                const containerCenterX = width / 2;
                const containerCenterY = height / 2;
                const deltaXFromCenter = x - containerCenterX;
                const deltaYFromCenter = y - containerCenterY;
                const distance = Math.sqrt(Math.pow(deltaXFromCenter, 2) + Math.pow(deltaYFromCenter, 2));

                const angryRadius = ballRect.width / 2;
                const warningRadius = angryRadius * 3.0;

                if (distance <= angryRadius) {
                    currentBall.classList.add('is-angry');
                    currentBall.classList.remove('is-warning');
                    currentContainer.classList.add('is-angry');
                    currentContainer.classList.remove('is-warning');
                } else if (distance <= warningRadius) {
                    currentBall.classList.add('is-warning');
                    currentBall.classList.remove('is-angry');
                    currentContainer.classList.add('is-warning');
                    currentContainer.classList.remove('is-angry');
                    
                    const intensity = 1 - ((distance - angryRadius) / (warningRadius - angryRadius));
                    const intensityStr = intensity.toFixed(2);
                    currentBall.style.setProperty('--warning-intensity', intensityStr);
                    currentContainer.style.setProperty('--warning-intensity', intensityStr);
                } else {
                    currentBall.classList.remove('is-angry');
                    currentBall.classList.remove('is-warning');
                    currentContainer.classList.remove('is-angry');
                    currentContainer.classList.remove('is-warning');
                }
            }
        };
        
        const handleMouseEnter = () => { if (activeSkin === 'palantir') currentBall.style.setProperty('--glow-opacity', '1'); }
        const handleMouseLeave = () => {
            if (activeSkin === 'pokeball' || activeSkin === 'arc-reactor') setStyles({ ball: { transform: 'rotateX(0deg) rotateY(0deg)', transition: 'transform 0.5s ease-out' }, shine: { transform: 'translateX(0px) translateY(0px) rotate(30deg)', transition: 'transform 0.5s ease-out' } });
            if (activeSkin === 'dragon-ball') setStarCount(4);
            if (activeSkin === 'palantir') {
                currentBall.style.setProperty('--glow-opacity', '0');
                currentBall.classList.remove('is-warning', 'is-angry');
                currentContainer.classList.remove('is-warning', 'is-angry');
                setStyles(prevStyles => ({ ...prevStyles, pupil: { transform: 'translate(-50%, -50%) translate(0px, 0px) rotate(0deg)' } }));
            }
        };
        
        currentContainer.addEventListener('mousemove', handleMouseMove);
        currentContainer.addEventListener('mouseenter', handleMouseEnter);
        currentContainer.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            currentContainer.removeEventListener('mousemove', handleMouseMove);
            currentContainer.removeEventListener('mouseenter', handleMouseEnter);
            currentContainer.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [activeSkin]);

    // Memoized lightning/spark generation
    const lightningBolts = useMemo(() => { if (activeSkin !== 'energy-core') return []; const createBoltPath = (type) => { let path = 'M 125 125'; let currentX = 125, currentY = 125; let baseSegments, segmentLength; switch(type) { case 'medium': baseSegments = 4; segmentLength = 30 + Math.random() * 20; break; case 'full': baseSegments = 5; segmentLength = 40 + Math.random() * 25; break; default: baseSegments = 3; segmentLength = 20 + Math.random() * 30; break; } const segments = baseSegments + Math.floor(Math.random() * 3); const angle = Math.random() * 2 * Math.PI; for (let i = 0; i < segments; i++) { const angleOffset = (Math.random() - 0.5) * (Math.PI / 2); currentX += Math.cos(angle + angleOffset) * segmentLength; currentY += Math.sin(angle + angleOffset) * segmentLength; path += ` L ${currentX.toFixed(2)} ${currentY.toFixed(2)}`; } return path; }; const boltTypes = ['short', 'short', 'short', 'short', 'medium', 'medium', 'medium', 'medium', 'full', 'full', 'full', 'full']; return boltTypes.map((type, i) => ({ id: i, path: createBoltPath(type), dashLength: 300 + Math.random() * 200, delay: `${Math.random() * 0.2}s`, duration: `${0.4 + Math.random() * 0.4}s`, })); }, [activeSkin, lightningTick]);
    const plasmaSparks = useMemo(() => { if (activeSkin !== 'arc-reactor') return []; const createSparkPath = () => { const startX = 50 + (Math.random() - 0.5) * 50; const startY = 50 + (Math.random() - 0.5) * 50; let path = `M ${startX.toFixed(2)} ${startY.toFixed(2)}`; let currentX = startX; let currentY = startY; const segments = 2 + Math.floor(Math.random() * 4); const angle = Math.random() * Math.PI * 2; const totalLength = 20 + Math.random() * 45; for (let i = 0; i < segments; i++) { const angleOffset = (Math.random() - 0.5) * (Math.PI / 2); const segmentLength = totalLength / segments; currentX += Math.cos(angle + angleOffset) * segmentLength; currentY += Math.sin(angle + angleOffset) * segmentLength; path += ` L ${currentX.toFixed(2)} ${currentY.toFixed(2)}`; } return path; }; return Array.from({ length: 50 }).map((_, i) => ({ id: i, path: createSparkPath(), dashLength: 100 + Math.random() * 50, delay: `${Math.random() * 0.1}s`, duration: `${0.05 + Math.random() * 0.15}s`, strokeWidth: `${(1 + Math.random() * 1.5).toFixed(2)}px` })); }, [activeSkin, lightningTick]);
    const iceShards = useMemo(() => { if (activeSkin !== 'ice-orb') return []; const createShardPath = () => { let path = ''; const branches = 4 + Math.floor(Math.random() * 4); const angleStep = (Math.PI * 2) / branches; for (let i = 0; i < branches; i++) { const angle = angleStep * i + (Math.random() - 0.5) * 0.5; const length = 30 + Math.random() * 60; const endX = 125 + Math.cos(angle) * length; const endY = 125 + Math.sin(angle) * length; path += `M 125 125 L ${endX.toFixed(2)} ${endY.toFixed(2)}`; const subBranches = 1 + Math.floor(Math.random() * 2); for (let j = 0; j < subBranches; j++) { const subAngle = angle + (Math.random() - 0.5) * (Math.PI / 4); const subLength = 15 + Math.random() * 20; const subStartX = 125 + Math.cos(angle) * (length * (0.3 + Math.random() * 0.4)); const subStartY = 125 + Math.sin(angle) * (length * (0.3 + Math.random() * 0.4)); const subEndX = subStartX + Math.cos(subAngle) * subLength; const subEndY = subStartY + Math.sin(subAngle) * subLength; path += ` M ${subStartX.toFixed(2)} ${subStartY.toFixed(2)} L ${subEndX.toFixed(2)} ${subEndY.toFixed(2)}`; } } return path; }; return Array.from({ length: 3 }).map((_, i) => ({ id: i, path: createShardPath(), duration: 25 + Math.random() * 20, delay: i * -15, })); }, [activeSkin]);
    useEffect(() => { if (activeSkin === 'energy-core' || activeSkin === 'arc-reactor') { const interval = setInterval(() => { setLightningTick(tick => tick + 1); }, 200); return () => clearInterval(interval); } }, [activeSkin]);


    // Determine container classes based on active skin and cycle
    const containerClasses = [
        'three-ball-container',
        activeSkin === 'ice-orb' ? 'frost-overlay' : '',
        activeSkin === 'dragon-ball' ? 'dragon-radar-bg' : '',
        activeSkin === 'palantir' ? 'palantir-vortex-bg' : '',
        activeSkin === 'genesis-sphere' ? `genesis-${genesisCycle}` : ''
    ].filter(Boolean).join(' ');


    return (
        <div className={containerClasses} ref={containerRef}>
            
            {activeSkin === 'palantir' && <div className="palantir-vortex-effect"></div>}

            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)} aria-label="Toggle skin customizer">
                {isSidebarOpen ? <X size={24} /> : <Paintbrush size={24} />}
            </button>

            <SkinSidebar isOpen={isSidebarOpen} onSelectSkin={setActiveSkin} activeSkin={activeSkin} />

            <div className={`ball ${activeSkin} ${activeSkin === 'genesis-sphere' ? `genesis-${genesisCycle}-ball` : ''}`} style={styles.ball} ref={ballRef}>
              {/* Other skins' inner elements would go here, conditionally rendered */}
            </div>
            
            {/* Particle containers */}
            {activeSkin === 'fireball' && (
                <div className="fire-particle-container">
                    {fireParticles.map(p => <FireParticle key={p.id} {...p} />)}
                </div>
            )}

            {activeSkin === 'genesis-sphere' && (
                <div className="genesis-effects-container">
                    {projectiles.map(p => (
                        <FertilizerProjectile key={p.id} style={{ transform: `translate(${p.x}px, ${p.y}px) scale(${p.scale})`, opacity: p.opacity }} />
                    ))}
                    {fertilizerPatches.map(p => (
                        <FertilizerPatch key={p.id} style={{ top: p.top, left: p.left, width: `${p.size}px`, height: `${p.size}px` }} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ThreeDBall;