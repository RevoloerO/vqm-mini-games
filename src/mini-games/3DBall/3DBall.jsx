// 3DBall.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Paintbrush, X } from 'lucide-react';

// Import consolidated stylesheets
import './styles/index.css';

// Import custom hooks
import { useFireParticleSystem } from './hooks/useFireParticleSystem';
import { useFertilizerSystem } from './hooks/useFertilizerSystem';

// Import components
import SkinSidebar from './components/SkinSidebar';
import { GenesisSphereEffects } from './components/GenesisSphere';
import { FireballEffects } from './components/FireballEffects';

// SVG component for a single star
const DragonBallStar = () => ( <svg viewBox="0 0 100 95"> <path d="M50 0 L61.2 35.5 H97.6 L68.2 57.4 L79.4 92.9 L50 71 L20.6 92.9 L31.8 57.4 L2.4 35.5 H38.8 Z" /> </svg> );
const STAR_POSITIONS = { 1: [{ top: '50%', left: '50%' }], 2: [{ top: '35%', left: '65%' }, { top: '65%', left: '35%' }], 3: [{ top: '35%', left: '35%' }, { top: '50%', left: '68%' }, { top: '65%', left: '35%' }], 4: [{ top: '33%', left: '33%' }, { top: '33%', left: '67%' }, { top: '67%', left: '33%' }, { top: '67%', left: '67%' }], 5: [{ top: '30%', left: '50%' }, { top: '45%', left: '32%' }, { top: '45%', left: '68%' }, { top: '68%', left: '40%' }, { top: '68%', left: '60%' }], 6: [{ top: '33%', left: '33%' }, { top: '33%', left: '67%' }, { top: '50%', left: '33%' }, { top: '50%', left: '67%' }, { top: '67%', left: '33%' }, { top: '67%', left: '67%' }], 7: [{ top: '30%', left: '50%' }, { top: '42%', left: '32%' }, { top: '42%', left: '68%' }, { top: '58%', left: '32%' }, { top: '58%', left: '68%' }, { top: '70%', left: '50%' }, { top: '50%', left: '50%' }], };


/**
 * The main component that renders a "faux 3D" ball and a sidebar for customization.
 */
const ThreeDBall = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [activeSkin, setActiveSkin] = useState('genesis-sphere');
    const containerRef = useRef(null);
    const ballRef = useRef(null);
    const mousePosRef = useRef({ x: 0, y: 0 });
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


    // Initialize Genesis Sphere when skin changes
    useEffect(() => {
        if (activeSkin === 'genesis-sphere') {
            isFertilized.current = false;
            fertilizationGrid.current = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
            setFertilizerPatches([]);
            setGenesisCycle('seeding');
        } else {
            setFertilizerPatches([]);
        }
    }, [activeSkin]);

    // Handle Genesis Sphere cycle progression
    useEffect(() => {
        if (activeSkin !== 'genesis-sphere') return;

        const cycleDurations = {
            growth: 20000,
            destruction: 10000,
            restoration: 20000,
        };

        let timeout;

        if (genesisCycle === 'growth') {
            timeout = setTimeout(() => setGenesisCycle('destruction'), cycleDurations.growth);
        } else if (genesisCycle === 'destruction') {
            timeout = setTimeout(() => setGenesisCycle('restoration'), cycleDurations.destruction);
        } else if (genesisCycle === 'restoration') {
            timeout = setTimeout(() => {
                isFertilized.current = false;
                fertilizationGrid.current = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
                setFertilizerPatches([]);
                setGenesisCycle('seeding');
            }, cycleDurations.restoration);
        }

        return () => {
            if (timeout) clearTimeout(timeout);
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
                // Use CSS custom properties instead of state to avoid re-renders
                const rotateY = (x - width / 2) / (width / 2) * 15;
                const rotateX = -(y - height / 2) / (height / 2) * 15;
                currentBall.style.setProperty('--rotate-x', `${rotateX}deg`);
                currentBall.style.setProperty('--rotate-y', `${rotateY}deg`);
                currentBall.style.setProperty('--shine-x', `${-rotateY * 1.2}px`);
                currentBall.style.setProperty('--shine-y', `${-rotateX * 1.2}px`);
            } else if (activeSkin === 'dragon-ball') {
                const angle = Math.atan2(y - (height / 2), x - (width / 2));
                let degrees = angle * (180 / Math.PI);
                degrees = (degrees + 360) % 360;
                const segmentSize = 360 / 7;
                const newStarCount = Math.floor(degrees / segmentSize) + 1;
                // Only update state if the value actually changed
                if (newStarCount !== starCount) {
                    setStarCount(newStarCount);
                }
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
                // Use CSS custom properties instead of state
                currentBall.style.setProperty('--pupil-x', `${moveX}px`);
                currentBall.style.setProperty('--pupil-y', `${moveY}px`);
                currentBall.style.setProperty('--pupil-rotation', `${angleDeg}deg`);

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
            if (activeSkin === 'pokeball' || activeSkin === 'arc-reactor') {
                // Reset CSS custom properties instead of using state
                currentBall.style.setProperty('--rotate-x', '0deg');
                currentBall.style.setProperty('--rotate-y', '0deg');
                currentBall.style.setProperty('--shine-x', '0px');
                currentBall.style.setProperty('--shine-y', '0px');
            }
            if (activeSkin === 'dragon-ball') setStarCount(4);
            if (activeSkin === 'palantir') {
                currentBall.style.setProperty('--glow-opacity', '0');
                currentBall.classList.remove('is-warning', 'is-angry');
                currentContainer.classList.remove('is-warning', 'is-angry');
                currentBall.style.setProperty('--pupil-x', '0px');
                currentBall.style.setProperty('--pupil-y', '0px');
                currentBall.style.setProperty('--pupil-rotation', '0deg');
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

    // Lightning/spark generation - CSS animations handle the visual effects
    // No need to regenerate paths on every tick since CSS animations provide the dynamism
    const lightningBolts = useMemo(() => {
        if (activeSkin !== 'energy-core') return [];
        const createBoltPath = (type) => {
            let path = 'M 125 125';
            let currentX = 125, currentY = 125;
            let baseSegments, segmentLength;
            switch(type) {
                case 'medium':
                    baseSegments = 4;
                    segmentLength = 30 + Math.random() * 20;
                    break;
                case 'full':
                    baseSegments = 5;
                    segmentLength = 40 + Math.random() * 25;
                    break;
                default:
                    baseSegments = 3;
                    segmentLength = 20 + Math.random() * 30;
                    break;
            }
            const segments = baseSegments + Math.floor(Math.random() * 3);
            const angle = Math.random() * 2 * Math.PI;
            for (let i = 0; i < segments; i++) {
                const angleOffset = (Math.random() - 0.5) * (Math.PI / 2);
                currentX += Math.cos(angle + angleOffset) * segmentLength;
                currentY += Math.sin(angle + angleOffset) * segmentLength;
                path += ` L ${currentX.toFixed(2)} ${currentY.toFixed(2)}`;
            }
            return path;
        };
        const boltTypes = ['short', 'short', 'short', 'short', 'medium', 'medium', 'medium', 'medium', 'full', 'full', 'full', 'full'];
        return boltTypes.map((type, i) => ({
            id: i,
            path: createBoltPath(type),
            dashLength: 300 + Math.random() * 200,
            delay: `${Math.random() * 0.2}s`,
            duration: `${0.4 + Math.random() * 0.4}s`,
        }));
    }, [activeSkin]); // Removed lightningTick dependency - only regenerate when skin changes

    const plasmaSparks = useMemo(() => {
        if (activeSkin !== 'arc-reactor') return [];
        const createSparkPath = () => {
            const startX = 50 + (Math.random() - 0.5) * 50;
            const startY = 50 + (Math.random() - 0.5) * 50;
            let path = `M ${startX.toFixed(2)} ${startY.toFixed(2)}`;
            let currentX = startX;
            let currentY = startY;
            const segments = 2 + Math.floor(Math.random() * 4);
            const angle = Math.random() * Math.PI * 2;
            const totalLength = 20 + Math.random() * 45;
            for (let i = 0; i < segments; i++) {
                const angleOffset = (Math.random() - 0.5) * (Math.PI / 2);
                const segmentLength = totalLength / segments;
                currentX += Math.cos(angle + angleOffset) * segmentLength;
                currentY += Math.sin(angle + angleOffset) * segmentLength;
                path += ` L ${currentX.toFixed(2)} ${currentY.toFixed(2)}`;
            }
            return path;
        };
        return Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            path: createSparkPath(),
            dashLength: 100 + Math.random() * 50,
            delay: `${Math.random() * 0.1}s`,
            duration: `${0.05 + Math.random() * 0.15}s`,
            strokeWidth: `${(1 + Math.random() * 1.5).toFixed(2)}px`
        }));
    }, [activeSkin]); // Removed lightningTick dependency - only regenerate when skin changes

    const iceShards = useMemo(() => {
        if (activeSkin !== 'ice-orb') return [];
        const createShardPath = () => {
            let path = '';
            const branches = 4 + Math.floor(Math.random() * 4);
            const angleStep = (Math.PI * 2) / branches;
            for (let i = 0; i < branches; i++) {
                const angle = angleStep * i + (Math.random() - 0.5) * 0.5;
                const length = 30 + Math.random() * 60;
                const endX = 125 + Math.cos(angle) * length;
                const endY = 125 + Math.sin(angle) * length;
                path += `M 125 125 L ${endX.toFixed(2)} ${endY.toFixed(2)}`;
                const subBranches = 1 + Math.floor(Math.random() * 2);
                for (let j = 0; j < subBranches; j++) {
                    const subAngle = angle + (Math.random() - 0.5) * (Math.PI / 4);
                    const subLength = 15 + Math.random() * 20;
                    const subStartX = 125 + Math.cos(angle) * (length * (0.3 + Math.random() * 0.4));
                    const subStartY = 125 + Math.sin(angle) * (length * (0.3 + Math.random() * 0.4));
                    const subEndX = subStartX + Math.cos(subAngle) * subLength;
                    const subEndY = subStartY + Math.sin(subAngle) * subLength;
                    path += ` M ${subStartX.toFixed(2)} ${subStartY.toFixed(2)} L ${subEndX.toFixed(2)} ${subEndY.toFixed(2)}`;
                }
            }
            return path;
        };
        return Array.from({ length: 3 }).map((_, i) => ({
            id: i,
            path: createShardPath(),
            duration: 25 + Math.random() * 20,
            delay: i * -15,
        }));
    }, [activeSkin]);


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

            <div className={`ball ${activeSkin} ${activeSkin === 'genesis-sphere' ? `genesis-${genesisCycle}-ball` : ''}`} ref={ballRef}>
              {/* Other skins' inner elements would go here, conditionally rendered */}
            </div>
            
            {/* Particle containers */}
            {activeSkin === 'fireball' && <FireballEffects particles={fireParticles} />}
            {activeSkin === 'genesis-sphere' && <GenesisSphereEffects projectiles={projectiles} patches={fertilizerPatches} />}
        </div>
    );
};

export default ThreeDBall;