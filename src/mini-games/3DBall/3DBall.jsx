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
    const [transitionState, setTransitionState] = useState(null); // 'seeding-to-growth', 'growth-to-destruction', etc.
    const [ballState, setBallState] = useState('normal'); // 'cracking', 'igniting', etc.
    const [fertilizerPatches, setFertilizerPatches] = useState([]);
    const [soilParticles, setSoilParticles] = useState([]);
    const [bloomParticles, setBloomParticles] = useState([]);
    const [fertilizationProgress, setFertilizationProgress] = useState(0);

    // Phase 3: Growth state
    const [flowerParticles, setFlowerParticles] = useState([]);
    const [butterflies, setButterflies] = useState([]);
    const [pollenParticles, setPollenParticles] = useState([]);
    const [grassBlades, setGrassBlades] = useState([]);
    const [vines, setVines] = useState([]);

    // Phase 4: Destruction state
    const [weatherState, setWeatherState] = useState('calm'); // 'calm', 'stormy'
    const [genesisLightning, setGenesisLightning] = useState([]);
    const [fireAreas, setFireAreas] = useState([]);

    // Phase 5: Active Fire state
    const [emberParticles, setEmberParticles] = useState([]);
    const [smokePlumes, setSmokePlumes] = useState([]);
    const [lavaCracks, setLavaCracks] = useState([]);
    const [heatIntensity, setHeatIntensity] = useState(0);

    // Phase 6: Restoration state
    const [rainDrops, setRainDrops] = useState([]);
    const [steamParticles, setSteamParticles] = useState([]);
    const [puddles, setPuddles] = useState([]);
    const [ballTemperature, setBallTemperature] = useState(1); // 1 = hot, 0 = cool

    // Phase 7: Water World state
    const [waterRipples, setWaterRipples] = useState([]);
    const [bubbles, setBubbles] = useState([]);
    const [healingParticles, setHealingParticles] = useState([]);

    // Cycle tracking
    const [cycleCount, setCycleCount] = useState(1);
    const [timeInPhase, setTimeInPhase] = useState(0);
    const phaseStartTimeRef = useRef(Date.now());

    const fertilizationGrid = useRef(null);
    const isFertilized = useRef(false);
    const lightningIntervalRef = useRef(null);
    const rainIntervalRef = useRef(null);
    const emberIntervalRef = useRef(null);
    const smokeIntervalRef = useRef(null);
    const rippleIntervalRef = useRef(null);
    const bubbleIntervalRef = useRef(null);
    const GRID_SIZE = 10; // 10x10 grid

    // --- Genesis Sphere Logic ---
    const handleFertilizerLand = useCallback((x, y, isNew) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        const newPatch = {
            id: Date.now() + Math.random(),
            top: `${(y / rect.height) * 100}%`,
            left: `${(x / rect.width) * 100}%`,
            size: 150 + Math.random() * 100,
            isNew, // Track if this hit a new cell
            sprouted: false,
        };
        setFertilizerPatches(prev => [...prev, newPatch]);

        if (isFertilized.current) return;

        // Update progress
        const totalCells = GRID_SIZE * GRID_SIZE;
        const fertilizedCount = fertilizationGrid.current.flat().filter(Boolean).length;
        const progress = fertilizedCount / totalCells;
        setFertilizationProgress(progress);

        // Check if fully fertilized
        if (fertilizationGrid.current.every(row => row.every(cell => cell))) {
            isFertilized.current = true;
            transitionToGrowth();
        }
    }, []);

    // Transition from seeding to growth with dramatic sequence
    const transitionToGrowth = useCallback(() => {
        setTransitionState('seeding-to-growth');

        // Generate soil particles orbiting the ball
        const particles = Array.from({ length: 30 }, (_, i) => ({
            id: i,
            angle: (i / 30) * Math.PI * 2,
            distance: 180 + Math.random() * 40,
            size: 3 + Math.random() * 5,
            speed: 0.5 + Math.random() * 1,
        }));
        setSoilParticles(particles);

        // Step 1: Sprout animation (500ms)
        setTimeout(() => {
            setFertilizerPatches(prev => prev.map(p => ({ ...p, sprouted: true })));
        }, 500);

        // Step 2: Crack ball (2000ms)
        setTimeout(() => {
            setBallState('cracking');
        }, 2000);

        // Step 3: Complete transition and bloom explosion (5000ms)
        setTimeout(() => {
            setGenesisCycle('growth');
            setTransitionState(null);
            setBallState('normal');
            setSoilParticles([]);

            // Spawn bloom particles
            const blooms = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                angle: (i / 50) * Math.PI * 2 + (Math.random() - 0.5) * 0.3,
                distance: 0,
                targetDistance: 200 + Math.random() * 150,
                size: 8 + Math.random() * 12,
                color: ['#ff69b4', '#ffc0cb', '#ff1493', '#ffb6c1', '#ff69b4'][Math.floor(Math.random() * 5)],
                opacity: 1,
            }));
            setBloomParticles(blooms);

            // Fade out bloom particles and initialize living world
            setTimeout(() => {
                setBloomParticles([]);
                initializeLivingWorld();
            }, 2000);
        }, 5000);
    }, []);

    // Initialize Phase 3: Growth living world
    const initializeLivingWorld = useCallback(() => {
        // Spawn flower particles
        const flowers = Array.from({ length: 20 }, (_, i) => ({
            id: Date.now() + i,
            angle: (i / 20) * Math.PI * 2,
            distance: 0,
            maxDistance: 300 + Math.random() * 200,
            speed: 2 + Math.random() * 3,
            rotation: Math.random() * 360,
            type: Math.random() > 0.5 ? 'flower' : 'leaf'
        }));
        setFlowerParticles(flowers);

        // Create butterflies
        const butterflyList = Array.from({ length: 3 }, (_, i) => ({
            id: i,
            pathIndex: i,
            delay: i * 2.5,
        }));
        setButterflies(butterflyList);

        // Create pollen particles
        const pollen = Array.from({ length: 30 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: 100 + Math.random() * 20,
            speed: 0.5 + Math.random() * 1,
            drift: Math.random() * 30 - 15,
            size: 2 + Math.random() * 3,
        }));
        setPollenParticles(pollen);

        // Create grass blades
        const blades = Array.from({ length: 40 }, (_, i) => ({
            id: i,
            x: (i / 40) * 100,
            height: 50 + Math.random() * 50,
            delay: Math.random() * 3,
            duration: 3 + Math.random() * 2,
        }));
        setGrassBlades(blades);

        // Create vines spiraling around ball
        const vineList = Array.from({ length: 4 }, (_, i) => ({
            id: i,
            startAngle: (i / 4) * Math.PI * 2,
            spirals: 2 + Math.random(),
            thickness: 3 + Math.random() * 2,
        }));
        setVines(vineList);
    }, []);

    // Transition from growth to destruction with dramatic sequence
    const transitionToDestruction = useCallback(() => {
        setTransitionState('growth-to-destruction');
        setWeatherState('stormy');

        // Clear growth elements
        setFlowerParticles([]);
        setButterflies([]);
        setPollenParticles([]);
        setGrassBlades([]);
        setVines([]);

        let strikeCount = 0;
        const maxStrikes = 6;

        // Lightning strike function
        const createLightningStrike = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const x = Math.random() * rect.width;
            const y = Math.random() * rect.height;

            const bolt = {
                id: Date.now() + Math.random(),
                x,
                y,
                height: y,
            };
            setGenesisLightning(prev => [...prev, bolt]);

            // Remove lightning after animation
            setTimeout(() => {
                setGenesisLightning(prev => prev.filter(b => b.id !== bolt.id));
            }, 500);

            // Spawn fire at impact
            const fire = {
                id: Date.now() + Math.random(),
                x: `${(x / rect.width) * 100}%`,
                y: `${(y / rect.height) * 100}%`,
            };
            setFireAreas(prev => [...prev, fire]);

            strikeCount++;
            if (strikeCount >= maxStrikes) {
                clearInterval(lightningIntervalRef.current);

                // Ignite the ball
                setTimeout(() => {
                    setBallState('igniting');
                }, 500);

                // Complete transition to destruction
                setTimeout(() => {
                    setGenesisCycle('destruction');
                    setTransitionState(null);
                    setBallState('normal');
                    setWeatherState('calm');
                    setGenesisLightning([]);
                    setFireAreas([]);
                }, 3000);
            }
        };

        // Start lightning strikes
        lightningIntervalRef.current = setInterval(createLightningStrike, 800);
    }, []);

    // Transition from destruction to restoration with rain
    const transitionToRestoration = useCallback(() => {
        setTransitionState('destruction-to-restoration');

        // Stop fire effects
        setEmberParticles([]);
        setSmokePlumes([]);
        setLavaCracks([]);
        if (emberIntervalRef.current) clearInterval(emberIntervalRef.current);
        if (smokeIntervalRef.current) clearInterval(smokeIntervalRef.current);

        // Start rain system
        rainIntervalRef.current = setInterval(() => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();

            const newDrops = Array.from({ length: 5 }, () => ({
                id: Date.now() + Math.random(),
                x: Math.random() * rect.width,
                y: -20,
                speed: 5 + Math.random() * 3,
                length: 15 + Math.random() * 10,
            }));

            setRainDrops(prev => [...prev, ...newDrops]);

            // Cleanup old rain drops after animation
            setTimeout(() => {
                setRainDrops(prev => prev.filter(d => !newDrops.find(nd => nd.id === d.id)));
            }, 1500);
        }, 100);

        // Gradually cool down the ball
        const coolSteps = 60;
        let step = 0;
        const coolInterval = setInterval(() => {
            step++;
            setBallTemperature(1 - (step / coolSteps));

            // Spawn steam when rain hits hot ground
            if (Math.random() > 0.7 && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const steam = {
                    id: Date.now() + Math.random(),
                    x: `${Math.random() * 100}%`,
                    y: `${80 + Math.random() * 20}%`,
                };
                setSteamParticles(prev => [...prev, steam]);

                setTimeout(() => {
                    setSteamParticles(prev => prev.filter(s => s.id !== steam.id));
                }, 2000);
            }

            if (step >= coolSteps) {
                clearInterval(coolInterval);
                if (rainIntervalRef.current) {
                    clearInterval(rainIntervalRef.current);
                    rainIntervalRef.current = null;
                }

                // Create puddles
                const newPuddles = Array.from({ length: 8 }, (_, i) => ({
                    id: i,
                    x: `${10 + Math.random() * 80}%`,
                    y: `${60 + Math.random() * 35}%`,
                    size: 40 + Math.random() * 60,
                }));
                setPuddles(newPuddles);

                // Complete transition
                setTimeout(() => {
                    setGenesisCycle('restoration');
                    setTransitionState(null);
                    setBallState('normal');
                    setRainDrops([]);
                    setSteamParticles([]);
                    setBallTemperature(0);
                }, 1000);
            }
        }, 100);
    }, []);

    // --- Particle System Hooks ---
    const fireParticles = useFireParticleSystem(activeSkin === 'fireball', ballRef, mousePosRef);
    const projectiles = useFertilizerSystem(activeSkin === 'genesis-sphere' && genesisCycle === 'seeding', containerRef, handleFertilizerLand, fertilizationGrid);

    // Phase 7: Restoration water world effects
    useEffect(() => {
        if (activeSkin !== 'genesis-sphere' || genesisCycle !== 'restoration') {
            // Cleanup
            setWaterRipples([]);
            setBubbles([]);
            setHealingParticles([]);
            if (rippleIntervalRef.current) clearInterval(rippleIntervalRef.current);
            if (bubbleIntervalRef.current) clearInterval(bubbleIntervalRef.current);
            return;
        }

        // Spawn water ripples periodically
        rippleIntervalRef.current = setInterval(() => {
            if (!containerRef.current) return;

            const newRipple = {
                id: Date.now() + Math.random(),
            };
            setWaterRipples(prev => [...prev.slice(-5), newRipple]);

            // Remove ripple after animation completes
            setTimeout(() => {
                setWaterRipples(prev => prev.filter(r => r.id !== newRipple.id));
            }, 3000);
        }, 1500);

        // Spawn bubbles periodically
        bubbleIntervalRef.current = setInterval(() => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();

            const newBubble = {
                id: Date.now() + Math.random(),
                x: rect.width / 2 + (Math.random() - 0.5) * 150,
                y: rect.height / 2 + (Math.random() - 0.5) * 150,
                size: 10 + Math.random() * 20,
                delay: Math.random() * 1,
            };
            setBubbles(prev => [...prev.slice(-10), newBubble]);

            // Remove bubble after animation completes
            setTimeout(() => {
                setBubbles(prev => prev.filter(b => b.id !== newBubble.id));
            }, 4000 + newBubble.delay * 1000);
        }, 600);

        // Spawn healing particles continuously
        const healingInterval = setInterval(() => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();

            const newParticle = {
                id: Date.now() + Math.random(),
                x: rect.width / 2 + (Math.random() - 0.5) * 200,
                y: rect.height / 2 + (Math.random() - 0.5) * 200,
                size: 3 + Math.random() * 5,
                angle: Math.random() * Math.PI * 2,
                speed: 1 + Math.random() * 2,
            };
            setHealingParticles(prev => [...prev.slice(-20), newParticle]);

            // Remove particle after animation
            setTimeout(() => {
                setHealingParticles(prev => prev.filter(p => p.id !== newParticle.id));
            }, 3000);
        }, 200);

        return () => {
            if (rippleIntervalRef.current) clearInterval(rippleIntervalRef.current);
            if (bubbleIntervalRef.current) clearInterval(bubbleIntervalRef.current);
            clearInterval(healingInterval);
        };
    }, [activeSkin, genesisCycle]);

    // Phase timer - tracks time in current phase
    useEffect(() => {
        if (activeSkin !== 'genesis-sphere') return;

        phaseStartTimeRef.current = Date.now();
        setTimeInPhase(0);

        const timerInterval = setInterval(() => {
            const elapsed = Date.now() - phaseStartTimeRef.current;
            setTimeInPhase(elapsed);
        }, 100);

        return () => clearInterval(timerInterval);
    }, [activeSkin, genesisCycle]);

    // Phase 5: Destruction active fire effects
    useEffect(() => {
        if (activeSkin !== 'genesis-sphere' || genesisCycle !== 'destruction') {
            // Cleanup
            setEmberParticles([]);
            setSmokePlumes([]);
            setLavaCracks([]);
            setHeatIntensity(0);
            if (emberIntervalRef.current) clearInterval(emberIntervalRef.current);
            if (smokeIntervalRef.current) clearInterval(smokeIntervalRef.current);
            return;
        }

        // Generate lava cracks on ball
        const cracks = Array.from({ length: 12 }, (_, i) => ({
            id: i,
            angle: (i / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.3,
            length: 80 + Math.random() * 60,
            thickness: 2 + Math.random() * 2,
            glowDelay: Math.random() * 2,
        }));
        setLavaCracks(cracks);

        // Gradually increase heat intensity
        const heatInterval = setInterval(() => {
            setHeatIntensity(prev => Math.min(prev + 0.05, 1));
        }, 200);

        // Spawn ember particles
        emberIntervalRef.current = setInterval(() => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();

            const newEmbers = Array.from({ length: 2 }, () => ({
                id: Date.now() + Math.random(),
                x: rect.width / 2 + (Math.random() - 0.5) * 100,
                y: rect.height / 2 + (Math.random() - 0.5) * 100,
                size: 3 + Math.random() * 5,
                velocity: { x: (Math.random() - 0.5) * 2, y: -2 - Math.random() * 3 },
            }));

            setEmberParticles(prev => [...prev.slice(-30), ...newEmbers]);

            // Cleanup old embers
            setTimeout(() => {
                setEmberParticles(prev => prev.filter(e => !newEmbers.find(ne => ne.id === e.id)));
            }, 3000);
        }, 150);

        // Spawn smoke plumes
        smokeIntervalRef.current = setInterval(() => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();

            const newSmoke = {
                id: Date.now() + Math.random(),
                x: rect.width / 2 + (Math.random() - 0.5) * 120,
                y: rect.height / 2 + 60,
                size: 40 + Math.random() * 40,
                drift: (Math.random() - 0.5) * 50,
            };

            setSmokePlumes(prev => [...prev.slice(-15), newSmoke]);

            setTimeout(() => {
                setSmokePlumes(prev => prev.filter(s => s.id !== newSmoke.id));
            }, 4000);
        }, 300);

        return () => {
            clearInterval(heatInterval);
            if (emberIntervalRef.current) clearInterval(emberIntervalRef.current);
            if (smokeIntervalRef.current) clearInterval(smokeIntervalRef.current);
        };
    }, [activeSkin, genesisCycle]);

    // Initialize Genesis Sphere when skin changes
    useEffect(() => {
        if (activeSkin === 'genesis-sphere') {
            isFertilized.current = false;
            fertilizationGrid.current = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
            setFertilizerPatches([]);
            setGenesisCycle('seeding');
            setTransitionState(null);
            setBallState('normal');
            setSoilParticles([]);
            setBloomParticles([]);
            setFertilizationProgress(0);
            setFlowerParticles([]);
            setButterflies([]);
            setPollenParticles([]);
            setGrassBlades([]);
            setVines([]);
            setWeatherState('calm');
            setGenesisLightning([]);
            setFireAreas([]);
            setEmberParticles([]);
            setSmokePlumes([]);
            setLavaCracks([]);
            setHeatIntensity(0);
            setRainDrops([]);
            setSteamParticles([]);
            setPuddles([]);
            setBallTemperature(1);
            setWaterRipples([]);
            setBubbles([]);
            setHealingParticles([]);
            setCycleCount(1);
            setTimeInPhase(0);
            if (lightningIntervalRef.current) {
                clearInterval(lightningIntervalRef.current);
                lightningIntervalRef.current = null;
            }
            if (rainIntervalRef.current) {
                clearInterval(rainIntervalRef.current);
                rainIntervalRef.current = null;
            }
            if (emberIntervalRef.current) clearInterval(emberIntervalRef.current);
            if (smokeIntervalRef.current) clearInterval(smokeIntervalRef.current);
            if (rippleIntervalRef.current) clearInterval(rippleIntervalRef.current);
            if (bubbleIntervalRef.current) clearInterval(bubbleIntervalRef.current);
        } else {
            setFertilizerPatches([]);
            setSoilParticles([]);
            setBloomParticles([]);
            setFlowerParticles([]);
            setButterflies([]);
            setPollenParticles([]);
            setGrassBlades([]);
            setVines([]);
            setGenesisLightning([]);
            setFireAreas([]);
            setEmberParticles([]);
            setSmokePlumes([]);
            setLavaCracks([]);
            setRainDrops([]);
            setSteamParticles([]);
            setPuddles([]);
            setWaterRipples([]);
            setBubbles([]);
            setHealingParticles([]);
            if (lightningIntervalRef.current) {
                clearInterval(lightningIntervalRef.current);
                lightningIntervalRef.current = null;
            }
            if (rainIntervalRef.current) {
                clearInterval(rainIntervalRef.current);
                rainIntervalRef.current = null;
            }
            if (emberIntervalRef.current) clearInterval(emberIntervalRef.current);
            if (smokeIntervalRef.current) clearInterval(smokeIntervalRef.current);
            if (rippleIntervalRef.current) clearInterval(rippleIntervalRef.current);
            if (bubbleIntervalRef.current) clearInterval(bubbleIntervalRef.current);
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
            timeout = setTimeout(() => transitionToDestruction(), cycleDurations.growth);
        } else if (genesisCycle === 'destruction') {
            timeout = setTimeout(() => transitionToRestoration(), cycleDurations.destruction);
        } else if (genesisCycle === 'restoration') {
            timeout = setTimeout(() => {
                // Increment cycle count
                setCycleCount(prev => prev + 1);

                // Reset all state for new cycle
                isFertilized.current = false;
                fertilizationGrid.current = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
                setFertilizerPatches([]);
                setGenesisCycle('seeding');
                setTransitionState(null);
                setBallState('normal');
                setSoilParticles([]);
                setBloomParticles([]);
                setFertilizationProgress(0);
                setFlowerParticles([]);
                setButterflies([]);
                setPollenParticles([]);
                setGrassBlades([]);
                setVines([]);
                setWeatherState('calm');
                setGenesisLightning([]);
                setFireAreas([]);
                setEmberParticles([]);
                setSmokePlumes([]);
                setLavaCracks([]);
                setHeatIntensity(0);
                setRainDrops([]);
                setSteamParticles([]);
                setPuddles([]);
                setBallTemperature(1);
                setWaterRipples([]);
                setBubbles([]);
                setHealingParticles([]);
            }, cycleDurations.restoration);
        }

        return () => {
            if (timeout) clearTimeout(timeout);
        };

    }, [activeSkin, genesisCycle]);

    // Helper function to get current phase duration
    const getPhaseDuration = useCallback(() => {
        const cycleDurations = {
            seeding: Infinity, // User-controlled
            growth: 20000,
            destruction: 10000,
            restoration: 20000,
        };
        return cycleDurations[genesisCycle] || 0;
    }, [genesisCycle]);

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
        activeSkin === 'genesis-sphere' ? `genesis-${genesisCycle}` : '',
        activeSkin === 'genesis-sphere' && weatherState === 'stormy' ? 'genesis-stormy' : ''
    ].filter(Boolean).join(' ');


    return (
        <div className={containerClasses} ref={containerRef}>
            
            {activeSkin === 'palantir' && <div className="palantir-vortex-effect"></div>}

            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)} aria-label="Toggle skin customizer">
                {isSidebarOpen ? <X size={24} /> : <Paintbrush size={24} />}
            </button>

            <SkinSidebar isOpen={isSidebarOpen} onSelectSkin={setActiveSkin} activeSkin={activeSkin} />

            <div
                className={`ball ${activeSkin} ${activeSkin === 'genesis-sphere' ? `genesis-${genesisCycle}-ball ${ballState !== 'normal' ? ballState : ''} ${transitionState === 'destruction-to-restoration' ? 'genesis-cooling' : ''}` : ''}`}
                ref={ballRef}
                style={activeSkin === 'genesis-sphere' ? {
                    '--progress': fertilizationProgress,
                    '--heat-intensity': heatIntensity,
                    '--temperature': ballTemperature,
                } : {}}
            >
              {/* Other skins' inner elements would go here, conditionally rendered */}
            </div>

            {/* Particle containers */}
            {activeSkin === 'fireball' && <FireballEffects particles={fireParticles} />}
            {activeSkin === 'genesis-sphere' && (
                <>
                    <GenesisSphereEffects
                        projectiles={projectiles}
                        patches={fertilizerPatches}
                        soilParticles={soilParticles}
                        bloomParticles={bloomParticles}
                        fertilizationProgress={fertilizationProgress}
                        transitionState={transitionState}
                        genesisCycle={genesisCycle}
                        flowerParticles={flowerParticles}
                        butterflies={butterflies}
                        pollenParticles={pollenParticles}
                        grassBlades={grassBlades}
                        vines={vines}
                        genesisLightning={genesisLightning}
                        fireAreas={fireAreas}
                        emberParticles={emberParticles}
                        smokePlumes={smokePlumes}
                        lavaCracks={lavaCracks}
                        rainDrops={rainDrops}
                        steamParticles={steamParticles}
                        puddles={puddles}
                        waterRipples={waterRipples}
                        bubbles={bubbles}
                        healingParticles={healingParticles}
                    />

                    {/* Genesis Cycle UI */}
                    <div className="genesis-ui">
                        <div className="cycle-counter">Cycle {cycleCount}</div>
                        <div className="phase-indicator">
                            <div className={`phase-dot ${genesisCycle === 'seeding' ? 'active' : ''}`} title="Seeding">🌱</div>
                            <div className={`phase-dot ${genesisCycle === 'growth' ? 'active' : ''}`} title="Growth">🌿</div>
                            <div className={`phase-dot ${genesisCycle === 'destruction' ? 'active' : ''}`} title="Destruction">🔥</div>
                            <div className={`phase-dot ${genesisCycle === 'restoration' ? 'active' : ''}`} title="Restoration">💧</div>
                        </div>
                        {genesisCycle !== 'seeding' && (
                            <div className="phase-timer">
                                <div
                                    className="timer-bar"
                                    style={{ width: `${Math.min((timeInPhase / getPhaseDuration()) * 100, 100)}%` }}
                                />
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ThreeDBall;