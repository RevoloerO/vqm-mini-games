// 3DBall.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Paintbrush, X } from 'lucide-react';
import './3DBall.css';

/**
 * Sidebar component for selecting different ball skins.
 */
const SkinSidebar = ({ isOpen, onSelectSkin, activeSkin }) => {
    const skins = [
        { id: 'sphere', name: 'Sphere' },
        { id: 'fireball', name: 'Fireball Jutsu' },
        { id: 'pokeball', name: 'Pokéball' },
        { id: 'energy-core', name: 'Energy Core' },
        { id: 'ice-orb', name: 'Ice Orb' },
        { id: 'dragon-ball', name: 'Dragon Ball' },
        { id: 'arc-reactor', name: 'Arc Reactor' },
    ];

    return (
        <aside className={`skin-sidebar ${isOpen ? 'open' : ''}`}>
            <h3>Customize Skin</h3>
            <div className="skin-options">
                {skins.map((skin) => (
                    <button
                        key={skin.id}
                        className={`skin-button ${activeSkin === skin.id ? 'active' : ''}`}
                        onClick={() => onSelectSkin(skin.id)}
                    >
                        {skin.name}
                    </button>
                ))}
            </div>
        </aside>
    );
};

// SVG component for a single star
const DragonBallStar = () => (
    <svg viewBox="0 0 100 95">
        <path d="M50 0 L61.2 35.5 H97.6 L68.2 57.4 L79.4 92.9 L50 71 L20.6 92.9 L31.8 57.4 L2.4 35.5 H38.8 Z" />
    </svg>
);

// Pre-defined positions for the stars for each count
const STAR_POSITIONS = {
    1: [{ top: '50%', left: '50%' }],
    2: [{ top: '35%', left: '65%' }, { top: '65%', left: '35%' }],
    3: [{ top: '35%', left: '35%' }, { top: '50%', left: '68%' }, { top: '65%', left: '35%' }],
    4: [{ top: '33%', left: '33%' }, { top: '33%', left: '67%' }, { top: '67%', left: '33%' }, { top: '67%', left: '67%' }],
    5: [{ top: '30%', left: '50%' }, { top: '45%', left: '32%' }, { top: '45%', left: '68%' }, { top: '68%', left: '40%' }, { top: '68%', left: '60%' }],
    6: [{ top: '33%', left: '33%' }, { top: '33%', left: '67%' }, { top: '50%', left: '33%' }, { top: '50%', left: '67%' }, { top: '67%', left: '33%' }, { top: '67%', left: '67%' }],
    7: [{ top: '30%', left: '50%' }, { top: '42%', left: '32%' }, { top: '42%', left: '68%' }, { top: '58%', left: '32%' }, { top: '58%', left: '68%' }, { top: '70%', left: '50%' }, { top: '50%', left: '50%' }],
};


/**
 * The main component that renders a "faux 3D" ball and a sidebar for customization.
 */
const ThreeDBall = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [activeSkin, setActiveSkin] = useState('sphere');
    const [styles, setStyles] = useState({});
    const containerRef = useRef(null);
    const [lightningTick, setLightningTick] = useState(0);
    const [starCount, setStarCount] = useState(4); // Default to 4-star ball

    // This effect handles the mouse tracking for interactive skins.
    useEffect(() => {
        const currentContainer = containerRef.current;
        if (!currentContainer) return;

        const handleMouseMove = (e) => {
            const { width, height, left, top } = currentContainer.getBoundingClientRect();
            const x = e.clientX - left;
            const y = e.clientY - top;

            if (activeSkin === 'pokeball' || activeSkin === 'arc-reactor') {
                const rotateY = (x - width / 2) / (width / 2) * 15;
                const rotateX = -(y - height / 2) / (height / 2) * 15;
                setStyles({
                    ball: { transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`, transition: 'transform 0.05s linear' },
                    shine: { transform: `translateX(${-rotateY * 1.2}px) translateY(${-rotateX * 1.2}px) rotate(30deg)`, transition: 'transform 0.05s linear' }
                });
            }
            else if (activeSkin === 'dragon-ball') {
                const angle = Math.atan2(y - (height / 2), x - (width / 2));
                let degrees = angle * (180 / Math.PI);
                degrees = (degrees + 360) % 360;
                const segmentSize = 360 / 7;
                setStarCount(Math.floor(degrees / segmentSize) + 1);
            }
        };

        const handleMouseLeave = () => {
            if (activeSkin === 'pokeball' || activeSkin === 'arc-reactor') {
                setStyles({
                    ball: { transform: 'rotateX(0deg) rotateY(0deg)', transition: 'transform 0.5s ease-out' },
                    shine: { transform: 'translateX(0px) translateY(0px) rotate(30deg)', transition: 'transform 0.5s ease-out' }
                });
            }
            if (activeSkin === 'dragon-ball') {
                setStarCount(4);
            }
        };
        
        currentContainer.addEventListener('mousemove', handleMouseMove);
        currentContainer.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            currentContainer.removeEventListener('mousemove', handleMouseMove);
            currentContainer.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [activeSkin]);

    // This effect sets up an interval to continuously update the lightning.
    useEffect(() => {
        if (activeSkin === 'energy-core') {
            const interval = setInterval(() => {
                setLightningTick(tick => tick + 1);
            }, 800);
            return () => clearInterval(interval);
        }
    }, [activeSkin]);

    // Generate randomized lightning paths for the energy core
    const lightningBolts = useMemo(() => {
        if (activeSkin !== 'energy-core') return [];
        const createBoltPath = (type) => {
            let path = 'M 125 125';
            let currentX = 125, currentY = 125;
            let baseSegments, segmentLength;
            switch(type) {
                case 'medium': baseSegments = 4; segmentLength = 30 + Math.random() * 20; break;
                case 'full': baseSegments = 5; segmentLength = 40 + Math.random() * 25; break;
                default: baseSegments = 3; segmentLength = 20 + Math.random() * 30; break;
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
    }, [activeSkin, lightningTick]);

    // Generate randomized cracks for the ice orb
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

    return (
        <div className={`three-ball-container ${activeSkin === 'ice-orb' ? 'frost-overlay' : ''} ${activeSkin === 'dragon-ball' ? 'dragon-radar-bg' : ''}`} ref={containerRef}>
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)} aria-label="Toggle skin customizer">
                {isSidebarOpen ? <X size={24} /> : <Paintbrush size={24} />}
            </button>

            <SkinSidebar
                isOpen={isSidebarOpen}
                onSelectSkin={setActiveSkin}
                activeSkin={activeSkin}
            />

            <div className={`ball ${activeSkin}`} style={styles.ball}>
              {activeSkin === 'fireball' && ( <> <div className="flame"></div> <div className="flame"></div> <div className="flame"></div> <div className="flame"></div> <div className="flame"></div> </> )}
              {activeSkin === 'pokeball' && ( <> <div className="pokeball-shine" style={styles.shine}></div> <div className="pokeball-button"></div> </> )}
              {activeSkin === 'energy-core' && ( <> <div className="plasma-tendril"></div> <div className="plasma-tendril"></div> <div className="plasma-tendril"></div> <svg className="lightning-svg" viewBox="0 0 250 250"> {lightningBolts.map(bolt => ( <path key={`${bolt.id}-${lightningTick}`} className="lightning-path" d={bolt.path} style={{ '--dash-length': bolt.dashLength, '--delay': bolt.delay, '--duration': bolt.duration, }} strokeDasharray={bolt.dashLength} /> ))} </svg> </> )}
              {activeSkin === 'ice-orb' && ( <> {iceShards.map(shard => ( <svg key={shard.id} className="ice-shard-svg" viewBox="0 0 250 250" style={{ '--duration': `${shard.duration}s`, '--delay': `${shard.delay}s`, }}> <path className="ice-shard-path" d={shard.path} /> </svg> ))} </> )}
              {activeSkin === 'dragon-ball' && (
                <>
                    <div className="crystal-reflection"></div>
                    <div className="star-container" key={starCount}>
                        {(STAR_POSITIONS[starCount] || []).map((pos, i) => (
                            <div key={i} className="dragon-ball-star" style={{ top: pos.top, left: pos.left }}>
                                <DragonBallStar />
                            </div>
                        ))}
                    </div>
                </>
              )}
              {activeSkin === 'arc-reactor' && (
                <>
                    <div className="arc-reactor-glow"></div>
                    <div className="arc-coil-container">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="arc-coil-holder" style={{ transform: `rotate(${i * 36}deg)` }}>
                                <div className="arc-coil" style={{'--i': i}}></div>
                            </div>
                        ))}
                    </div>
                    <div className="arc-inner-ring"></div>
                    <div className="arc-center-core">
                        <div className="arc-core-glow"></div>
                        <div className="arc-core-mesh"></div>
                    </div>
                </>
              )}
            </div>
        </div>
    );
};

export default ThreeDBall;
