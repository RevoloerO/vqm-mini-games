// 3DBall.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Paintbrush, X } from 'lucide-react';

// Import all the stylesheets
import './3DBall.css';
import './normal_skins.css';
import './magical_skins.css';
import './scifi_skins.css';

/**
 * Sidebar component for selecting different ball skins.
 */
const SkinSidebar = ({ isOpen, onSelectSkin, activeSkin }) => {
    const categorizedSkins = {
        'Normal Objects': [ { id: 'sphere', name: 'Sphere' }, { id: 'pokeball', name: 'Pokéball' } ],
        'Magical': [ { id: 'fireball', name: 'Fireball Jutsu' }, { id: 'ice-orb', name: 'Ice Orb' }, { id: 'dragon-ball', name: 'Dragon Ball' } ],
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
 * This uses a requestAnimationFrame loop for smooth, physics-based animation.
 */
const useFireParticleSystem = (isActive, ballRef, mousePosRef) => {
    const [particles, setParticles] = useState([]);
    const animationFrameRef = useRef();

    useEffect(() => {
        if (!isActive) {
            setParticles([]); // Clear particles if not active
            return;
        }

        // The main animation loop
        const animationLoop = () => {
            setParticles(currentParticles => {
                const now = Date.now();
                // Filter out old particles and update the positions of active ones
                return currentParticles.map(p => {
                    const age = now - p.spawnTime;
                    if (age >= p.duration) return null; // Mark for removal

                    const progress = age / p.duration;

                    // Update the particle's destination to the current mouse position
                    const currentEndX = mousePosRef.current.x;
                    const currentEndY = mousePosRef.current.y;

                    // Linear interpolation for the base path
                    const linearX = p.startX + (currentEndX - p.startX) * progress;
                    const linearY = p.startY + (currentEndY - p.startY) * progress;

                    // Calculate a perpendicular angle for the wave
                    const angle = Math.atan2(currentEndY - p.startY, currentEndX - p.startX) + Math.PI / 2;
                    // Calculate the wave offset using a sine function
                    const waveOffset = Math.sin(progress * p.waveFrequency * Math.PI) * p.waveAmplitude * (1 - progress);

                    // Apply the wave offset perpendicular to the direction of travel
                    const x = linearX + Math.cos(angle) * waveOffset;
                    const y = linearY + Math.sin(angle) * waveOffset;

                    // Fade out towards the end of the particle's life
                    const opacity = 1 - progress;

                    return { ...p, x, y, opacity };
                }).filter(Boolean); // Remove all null (completed) particles
            });

            animationFrameRef.current = requestAnimationFrame(animationLoop);
        };
        
        // Start the animation loop
        animationFrameRef.current = requestAnimationFrame(animationLoop);

        // Start spawning particles
        const spawnInterval = setInterval(() => {
            const ballEl = ballRef.current;
            if (!ballEl) return;

            const ballRect = ballEl.getBoundingClientRect();
            const containerRect = ballEl.closest('.three-ball-container').getBoundingClientRect();

            const angle = Math.random() * 2 * Math.PI;
            // By taking the square root of Math.random(), we bias the distribution of values
            // towards 1, making particles much more likely to spawn near the outer edge.
            const radius = Math.sqrt(Math.random()) * (ballRect.width / 2);

            const startX = (ballRect.left - containerRect.left + ballRect.width / 2) + Math.cos(angle) * radius;
            const startY = (ballRect.top - containerRect.top + ballRect.height / 2) + Math.sin(angle) * radius;

            const newParticle = {
                id: Math.random() + Date.now(),
                spawnTime: Date.now(),
                startX,
                startY,
                x: startX,
                y: startY,
                opacity: 1,
                size: 8 + Math.random() * 12,
                duration: 1500 + Math.random() * 1500,
                waveAmplitude: 15 + Math.random() * 20, // How wide the wave is
                waveFrequency: 2 + Math.random() * 3, // How many waves
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
    const [activeSkin, setActiveSkin] = useState('fireball');
    const [styles, setStyles] = useState({});
    const containerRef = useRef(null);
    const ballRef = useRef(null);
    const mousePosRef = useRef({ x: 0, y: 0 });
    const [lightningTick, setLightningTick] = useState(0);
    const [starCount, setStarCount] = useState(4);
    
    // Use the custom hook to manage the particle system
    const fireParticles = useFireParticleSystem(activeSkin === 'fireball', ballRef, mousePosRef);

    // General mouse move handler for all skins
    useEffect(() => {
        const currentContainer = containerRef.current;
        if (!currentContainer) return;

        const handleMouseMove = (e) => {
            const { left, top } = currentContainer.getBoundingClientRect();
            const x = e.clientX - left;
            const y = e.clientY - top;
            mousePosRef.current = { x, y }; // Update mouse position ref for particle system

            if (activeSkin === 'pokeball' || activeSkin === 'arc-reactor') {
                const { width, height } = currentContainer.getBoundingClientRect();
                const rotateY = (x - width / 2) / (width / 2) * 15;
                const rotateX = -(y - height / 2) / (height / 2) * 15;
                setStyles({
                    ball: { transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`, transition: 'transform 0.05s linear' },
                    shine: { transform: `translateX(${-rotateY * 1.2}px) translateY(${-rotateX * 1.2}px) rotate(30deg)`, transition: 'transform 0.05s linear' }
                });
            } else if (activeSkin === 'dragon-ball') {
                const { width, height } = currentContainer.getBoundingClientRect();
                const angle = Math.atan2(y - (height / 2), x - (width / 2));
                let degrees = angle * (180 / Math.PI);
                degrees = (degrees + 360) % 360;
                const segmentSize = 360 / 7;
                setStarCount(Math.floor(degrees / segmentSize) + 1);
            }
        };

        const handleMouseLeave = () => {
            if (activeSkin === 'pokeball' || activeSkin === 'arc-reactor') {
                setStyles({ ball: { transform: 'rotateX(0deg) rotateY(0deg)', transition: 'transform 0.5s ease-out' }, shine: { transform: 'translateX(0px) translateY(0px) rotate(30deg)', transition: 'transform 0.5s ease-out' } });
            }
            if (activeSkin === 'dragon-ball') { setStarCount(4); }
        };
        
        currentContainer.addEventListener('mousemove', handleMouseMove);
        currentContainer.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            currentContainer.removeEventListener('mousemove', handleMouseMove);
            currentContainer.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [activeSkin]);

    // Memoized lightning/spark generation
    const lightningBolts = useMemo(() => { if (activeSkin !== 'energy-core') return []; const createBoltPath = (type) => { let path = 'M 125 125'; let currentX = 125, currentY = 125; let baseSegments, segmentLength; switch(type) { case 'medium': baseSegments = 4; segmentLength = 30 + Math.random() * 20; break; case 'full': baseSegments = 5; segmentLength = 40 + Math.random() * 25; break; default: baseSegments = 3; segmentLength = 20 + Math.random() * 30; break; } const segments = baseSegments + Math.floor(Math.random() * 3); const angle = Math.random() * 2 * Math.PI; for (let i = 0; i < segments; i++) { const angleOffset = (Math.random() - 0.5) * (Math.PI / 2); currentX += Math.cos(angle + angleOffset) * segmentLength; currentY += Math.sin(angle + angleOffset) * segmentLength; path += ` L ${currentX.toFixed(2)} ${currentY.toFixed(2)}`; } return path; }; const boltTypes = ['short', 'short', 'short', 'short', 'medium', 'medium', 'medium', 'medium', 'full', 'full', 'full', 'full']; return boltTypes.map((type, i) => ({ id: i, path: createBoltPath(type), dashLength: 300 + Math.random() * 200, delay: `${Math.random() * 0.2}s`, duration: `${0.4 + Math.random() * 0.4}s`, })); }, [activeSkin, lightningTick]);
    const plasmaSparks = useMemo(() => { if (activeSkin !== 'arc-reactor') return []; const createSparkPath = () => { const startX = 50 + (Math.random() - 0.5) * 50; const startY = 50 + (Math.random() - 0.5) * 50; let path = `M ${startX.toFixed(2)} ${startY.toFixed(2)}`; let currentX = startX; let currentY = startY; const segments = 2 + Math.floor(Math.random() * 4); const angle = Math.random() * Math.PI * 2; const totalLength = 20 + Math.random() * 45; for (let i = 0; i < segments; i++) { const angleOffset = (Math.random() - 0.5) * (Math.PI / 2); const segmentLength = totalLength / segments; currentX += Math.cos(angle + angleOffset) * segmentLength; currentY += Math.sin(angle + angleOffset) * segmentLength; path += ` L ${currentX.toFixed(2)} ${currentY.toFixed(2)}`; } return path; }; return Array.from({ length: 50 }).map((_, i) => ({ id: i, path: createSparkPath(), dashLength: 100 + Math.random() * 50, delay: `${Math.random() * 0.1}s`, duration: `${0.05 + Math.random() * 0.15}s`, strokeWidth: `${(1 + Math.random() * 1.5).toFixed(2)}px` })); }, [activeSkin, lightningTick]);
    const iceShards = useMemo(() => { if (activeSkin !== 'ice-orb') return []; const createShardPath = () => { let path = ''; const branches = 4 + Math.floor(Math.random() * 4); const angleStep = (Math.PI * 2) / branches; for (let i = 0; i < branches; i++) { const angle = angleStep * i + (Math.random() - 0.5) * 0.5; const length = 30 + Math.random() * 60; const endX = 125 + Math.cos(angle) * length; const endY = 125 + Math.sin(angle) * length; path += `M 125 125 L ${endX.toFixed(2)} ${endY.toFixed(2)}`; const subBranches = 1 + Math.floor(Math.random() * 2); for (let j = 0; j < subBranches; j++) { const subAngle = angle + (Math.random() - 0.5) * (Math.PI / 4); const subLength = 15 + Math.random() * 20; const subStartX = 125 + Math.cos(angle) * (length * (0.3 + Math.random() * 0.4)); const subStartY = 125 + Math.sin(angle) * (length * (0.3 + Math.random() * 0.4)); const subEndX = subStartX + Math.cos(subAngle) * subLength; const subEndY = subStartY + Math.sin(subAngle) * subLength; path += ` M ${subStartX.toFixed(2)} ${subStartY.toFixed(2)} L ${subEndX.toFixed(2)} ${subEndY.toFixed(2)}`; } } return path; }; return Array.from({ length: 3 }).map((_, i) => ({ id: i, path: createShardPath(), duration: 25 + Math.random() * 20, delay: i * -15, })); }, [activeSkin]);
    useEffect(() => { if (activeSkin === 'energy-core' || activeSkin === 'arc-reactor') { const interval = setInterval(() => { setLightningTick(tick => tick + 1); }, 200); return () => clearInterval(interval); } }, [activeSkin]);


    return (
        <div className={`three-ball-container ${activeSkin === 'ice-orb' ? 'frost-overlay' : ''} ${activeSkin === 'dragon-ball' ? 'dragon-radar-bg' : ''}`} ref={containerRef}>
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)} aria-label="Toggle skin customizer">
                {isSidebarOpen ? <X size={24} /> : <Paintbrush size={24} />}
            </button>

            <SkinSidebar isOpen={isSidebarOpen} onSelectSkin={setActiveSkin} activeSkin={activeSkin} />

            <div className={`ball ${activeSkin}`} style={styles.ball} ref={ballRef}>
              {activeSkin === 'fireball' && (
                <>
                  <div className="flame"></div> <div className="flame"></div> <div className="flame"></div> <div className="flame"></div> <div className="flame"></div>
                </>
              )}
              {activeSkin === 'pokeball' && ( <> <div className="pokeball-shine" style={styles.shine}></div> <div className="pokeball-button"></div> </> )}
              {activeSkin === 'energy-core' && ( <> <div className="plasma-tendril"></div> <div className="plasma-tendril"></div> <div className="plasma-tendril"></div> <svg className="lightning-svg" viewBox="0 0 250 250"> {lightningBolts.map(bolt => ( <path key={`${bolt.id}-${lightningTick}`} className="lightning-path" d={bolt.path} style={{ '--dash-length': bolt.dashLength, '--delay': bolt.delay, '--duration': bolt.duration, }} strokeDasharray={bolt.dashLength} /> ))} </svg> </> )}
              {activeSkin === 'ice-orb' && ( <> {iceShards.map(shard => ( <svg key={shard.id} className="ice-shard-svg" viewBox="0 0 250 250" style={{ '--duration': `${shard.duration}s`, '--delay': `${shard.delay}s`, }}> <path className="ice-shard-path" d={shard.path} /> </svg> ))} </> )}
              {activeSkin === 'dragon-ball' && ( <> <div className="crystal-reflection"></div> <div className="star-container" key={starCount}> {(STAR_POSITIONS[starCount] || []).map((pos, i) => ( <div key={i} className="dragon-ball-star" style={{ top: pos.top, left: pos.left }}> <DragonBallStar /> </div> ))} </div> </> )}
              {activeSkin === 'arc-reactor' && ( <> <div className="arc-light-ring"></div> <div className="arc-cross-lines-container"> {Array.from({ length: 9 }).map((_, i) => ( <div key={i} className="arc-cross-line-holder" style={{ transform: `rotate(${i * 20}deg)`}}> <div className={`arc-cross-line-bg ${i % 2 === 0 ? 'odd' : 'even'}`}></div> <div className={`arc-cross-line ${i % 2 === 0 ? 'odd' : 'even'}`}></div> </div> ))} </div> <div className="arc-center-core"> <div className="arc-core-mesh"> <div className="arc-line" style={{ transform: 'rotate(0deg)' }}></div> <div className="arc-line" style={{ transform: 'rotate(120deg)' }}></div> <div className="arc-line" style={{ transform: 'rotate(240deg)' }}></div> </div> <div className="plasma-core-container"> <div className="plasma-core"></div> <svg className="plasma-sparks-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"> {plasmaSparks.map(spark => ( <path key={`${spark.id}-${lightningTick}`} className="plasma-spark-path" d={spark.path} style={{ '--dash-length': spark.dashLength, '--delay': spark.delay, '--duration': spark.duration, '--stroke-width': spark.strokeWidth }} strokeDasharray={spark.dashLength} /> ))} </svg> </div> </div> </> )}
            </div>
            
            {/* Particle container is now outside the ball, relative to the main container */}
            <div className="fire-particle-container">
                {fireParticles.map(p => <FireParticle key={p.id} {...p} />)}
            </div>
        </div>
    );
};

export default ThreeDBall;
