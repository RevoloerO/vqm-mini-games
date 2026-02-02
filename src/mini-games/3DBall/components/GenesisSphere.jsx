import React, { useEffect, useRef } from 'react';

/**
 * Genesis Sphere Projectile Component with trail
 */
export const FertilizerProjectile = React.memo(({ style }) => (
    <div className="fertilizer-projectile" style={style}>
        <div className="projectile-trail"></div>
    </div>
));

/**
 * Genesis Sphere Patch Component with sprout capability
 */
export const FertilizerPatch = React.memo(({ style, sprouted, isNew }) => (
    <div className={`fertilizer-patch ${sprouted ? 'sprouted' : ''} ${isNew ? 'new-hit' : 'wasted-hit'}`} style={style}>
        {sprouted && <div className="grass-sprout"></div>}
    </div>
));

/**
 * Progress Ring Component
 */
const ProgressRing = React.memo(({ progress }) => {
    const radius = 150;
    const strokeWidth = 4;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress * circumference);

    return (
        <div className="genesis-progress-ring-container">
            <svg className="genesis-progress-ring" width={radius * 2} height={radius * 2}>
                {/* Background ring */}
                <circle
                    className="progress-ring-bg"
                    stroke="#8d6e63"
                    strokeOpacity="0.3"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                {/* Progress ring */}
                <circle
                    className="progress-ring-progress"
                    stroke="#a1887f"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{ strokeDashoffset }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
            <div className="progress-percentage">{Math.round(progress * 100)}%</div>
        </div>
    );
});

/**
 * Soil Particle Component
 */
const SoilParticle = React.memo(({ particle }) => {
    const x = Math.cos(particle.angle) * particle.distance;
    const y = Math.sin(particle.angle) * particle.distance;

    return (
        <div
            className="soil-particle"
            style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animationDuration: `${2 / particle.speed}s`,
            }}
        />
    );
});

/**
 * Bloom Particle Component
 */
const BloomParticle = React.memo(({ particle }) => {
    const particleRef = useRef(null);

    useEffect(() => {
        if (!particleRef.current) return;

        const animateBloom = () => {
            const progress = Math.min(1, (Date.now() - startTime) / 2000);
            const currentDistance = particle.targetDistance * progress;
            const x = Math.cos(particle.angle) * currentDistance;
            const y = Math.sin(particle.angle) * currentDistance;
            const opacity = 1 - progress;

            if (particleRef.current) {
                particleRef.current.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
                particleRef.current.style.opacity = opacity;
            }

            if (progress < 1) {
                requestAnimationFrame(animateBloom);
            }
        };

        const startTime = Date.now();
        requestAnimationFrame(animateBloom);
    }, [particle]);

    return (
        <div
            ref={particleRef}
            className="bloom-particle"
            style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
            }}
        />
    );
});

/**
 * Grid Overlay Component
 */
const GridOverlay = React.memo(() => (
    <div className="grid-overlay">
        {Array.from({ length: 10 }).map((_, i) => (
            <React.Fragment key={i}>
                <div className="grid-line grid-line-horizontal" style={{ top: `${i * 10}%` }} />
                <div className="grid-line grid-line-vertical" style={{ left: `${i * 10}%` }} />
            </React.Fragment>
        ))}
    </div>
));

/**
 * Flower Particle Component
 */
const FlowerParticle = React.memo(({ particle }) => {
    const particleRef = useRef(null);

    useEffect(() => {
        if (!particleRef.current) return;

        const animate = () => {
            if (!particleRef.current) return;

            particle.distance = Math.min(particle.distance + particle.speed, particle.maxDistance);
            particle.rotation += 2;

            const x = Math.cos(particle.angle) * particle.distance;
            const y = Math.sin(particle.angle) * particle.distance;
            const opacity = 1 - (particle.distance / particle.maxDistance);

            particleRef.current.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${particle.rotation}deg)`;
            particleRef.current.style.opacity = opacity;

            if (particle.distance < particle.maxDistance) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [particle]);

    return (
        <div
            ref={particleRef}
            className={`growth-particle growth-${particle.type}`}
        />
    );
});

/**
 * Butterfly Component
 */
const Butterfly = React.memo(({ butterfly }) => (
    <div
        className="growth-butterfly"
        style={{
            animationDelay: `${butterfly.delay}s`,
            '--path-index': butterfly.pathIndex,
        }}
    />
));

/**
 * Pollen Particle Component
 */
const PollenParticle = React.memo(({ pollen }) => (
    <div
        className="growth-pollen"
        style={{
            left: `${pollen.x}%`,
            bottom: `${pollen.y}%`,
            width: `${pollen.size}px`,
            height: `${pollen.size}px`,
            animationDuration: `${20 / pollen.speed}s`,
            '--drift-offset': `${pollen.drift}px`,
        }}
    />
));

/**
 * Grass Blade Component
 */
const GrassBlade = React.memo(({ blade }) => (
    <div
        className="growth-grass-blade"
        style={{
            left: `${blade.x}%`,
            height: `${blade.height}px`,
            animationDelay: `${blade.delay}s`,
            animationDuration: `${blade.duration}s`,
        }}
    />
));

/**
 * Vine Component
 */
const Vine = React.memo(({ vine }) => {
    const pathRef = useRef(null);

    useEffect(() => {
        if (!pathRef.current) return;

        // Generate spiral path around the ball
        const points = [];
        const segments = 50;
        const radius = 140; // Ball radius + offset

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const angle = vine.startAngle + t * Math.PI * 2 * vine.spirals;
            const r = radius - t * 20; // Spiral inward slightly
            const x = 50 + Math.cos(angle) * (r / 3); // Convert to percentage
            const y = 50 + Math.sin(angle) * (r / 3);
            points.push(`${x},${y}`);
        }

        pathRef.current.setAttribute('points', points.join(' '));
    }, [vine]);

    return (
        <svg className="growth-vine" viewBox="0 0 100 100">
            <polyline
                ref={pathRef}
                fill="none"
                stroke="#4caf50"
                strokeWidth={vine.thickness}
                strokeLinecap="round"
                opacity="0.7"
            />
        </svg>
    );
});

/**
 * Lightning Bolt Component
 */
const LightningBolt = React.memo(({ bolt }) => (
    <div
        className="genesis-lightning"
        style={{
            left: `${bolt.x}px`,
            top: 0,
            height: `${bolt.height}px`,
        }}
    />
));

/**
 * Fire Spread Component
 */
const FireSpread = React.memo(({ fire }) => (
    <div
        className="fire-spread"
        style={{
            top: fire.y,
            left: fire.x,
        }}
    />
));

/**
 * Ember Particle Component
 */
const EmberParticle = React.memo(({ ember }) => {
    const emberRef = useRef(null);

    useEffect(() => {
        if (!emberRef.current) return;

        const animate = () => {
            if (!emberRef.current) return;

            ember.x += ember.velocity.x;
            ember.y += ember.velocity.y;
            ember.velocity.y -= 0.1; // Gravity effect
            ember.size *= 0.98; // Shrink over time

            emberRef.current.style.transform = `translate(${ember.x}px, ${ember.y}px)`;
            emberRef.current.style.width = `${ember.size}px`;
            emberRef.current.style.height = `${ember.size}px`;
            emberRef.current.style.opacity = Math.max(0, ember.size / 8);

            if (ember.size > 0.5) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [ember]);

    return (
        <div
            ref={emberRef}
            className="ember-particle"
        />
    );
});

/**
 * Smoke Plume Component
 */
const SmokePlume = React.memo(({ smoke }) => (
    <div
        className="smoke-plume"
        style={{
            left: `${smoke.x}px`,
            top: `${smoke.y}px`,
            width: `${smoke.size}px`,
            height: `${smoke.size}px`,
            '--drift-offset': `${smoke.drift}px`,
        }}
    />
));

/**
 * Lava Crack Component
 */
const LavaCrack = React.memo(({ crack }) => {
    const rotation = (crack.angle * 180) / Math.PI;

    return (
        <div
            className="lava-crack"
            style={{
                width: `${crack.thickness}px`,
                height: `${crack.length}px`,
                transform: `rotate(${rotation}deg)`,
                transformOrigin: 'top center',
                animationDelay: `${crack.glowDelay}s`,
            }}
        />
    );
});

/**
 * Rain Drop Component
 */
const RainDrop = React.memo(({ drop }) => (
    <div
        className="rain-drop"
        style={{
            left: `${drop.x}px`,
            top: `${drop.y}px`,
            height: `${drop.length}px`,
            animationDuration: `${1 / drop.speed}s`,
        }}
    />
));

/**
 * Steam Particle Component
 */
const SteamParticle = React.memo(({ steam }) => (
    <div
        className="steam-particle"
        style={{
            left: steam.x,
            top: steam.y,
        }}
    />
));

/**
 * Puddle Component
 */
const Puddle = React.memo(({ puddle }) => (
    <div
        className="water-puddle"
        style={{
            left: puddle.x,
            top: puddle.y,
            width: `${puddle.size}px`,
            height: `${puddle.size * 0.5}px`,
        }}
    />
));

/**
 * Water Ripple Component
 */
const WaterRipple = React.memo(() => (
    <div className="water-ripple" />
));

/**
 * Restoration Bubble Component
 */
const RestorationBubble = React.memo(({ bubble }) => (
    <div
        className="restoration-bubble"
        style={{
            left: `${bubble.x}px`,
            top: `${bubble.y}px`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            animationDelay: `${bubble.delay}s`,
        }}
    />
));

/**
 * Healing Particle Component
 */
const HealingParticle = React.memo(({ particle }) => {
    const particleRef = useRef(null);

    useEffect(() => {
        if (!particleRef.current) return;

        const animate = () => {
            if (!particleRef.current) return;

            const elapsed = (Date.now() - particle.id) / 1000;
            const distance = particle.speed * elapsed * 50;
            const x = Math.cos(particle.angle) * distance;
            const y = Math.sin(particle.angle) * distance;
            const opacity = Math.max(0, 1 - elapsed / 3);

            particleRef.current.style.transform = `translate(${x}px, ${y}px)`;
            particleRef.current.style.opacity = opacity;

            if (elapsed < 3) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [particle]);

    return (
        <div
            ref={particleRef}
            className="healing-particle"
            style={{
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
            }}
        />
    );
});

/**
 * Genesis Sphere Effects Container
 */
export const GenesisSphereEffects = ({
    projectiles,
    patches,
    soilParticles,
    bloomParticles,
    fertilizationProgress,
    transitionState,
    genesisCycle,
    flowerParticles,
    butterflies,
    pollenParticles,
    grassBlades,
    vines,
    genesisLightning,
    fireAreas,
    emberParticles,
    smokePlumes,
    lavaCracks,
    rainDrops,
    steamParticles,
    puddles,
    waterRipples,
    bubbles,
    healingParticles,
}) => (
    <div className="genesis-effects-container">
        {/* Phase 1: Seeding */}
        {fertilizationProgress < 1 && transitionState === null && (
            <>
                <ProgressRing progress={fertilizationProgress} />
                <GridOverlay />
            </>
        )}

        {projectiles.map(p => (
            <FertilizerProjectile
                key={p.id}
                style={{
                    transform: `translate(${p.x}px, ${p.y}px) scale(${p.scale})`,
                    opacity: p.opacity
                }}
            />
        ))}

        {patches.map(p => (
            <FertilizerPatch
                key={p.id}
                sprouted={p.sprouted}
                isNew={p.isNew}
                style={{
                    top: p.top,
                    left: p.left,
                    width: `${p.size}px`,
                    height: `${p.size}px`
                }}
            />
        ))}

        {soilParticles.map(p => (
            <SoilParticle key={p.id} particle={p} />
        ))}

        {/* Phase 2: Transition bloom particles */}
        {bloomParticles.map(p => (
            <BloomParticle key={p.id} particle={p} />
        ))}

        {/* Phase 3: Growth living world */}
        {genesisCycle === 'growth' && (
            <>
                {flowerParticles.map(p => (
                    <FlowerParticle key={p.id} particle={p} />
                ))}

                {butterflies.map(b => (
                    <Butterfly key={b.id} butterfly={b} />
                ))}

                {pollenParticles.map(p => (
                    <PollenParticle key={p.id} pollen={p} />
                ))}

                {grassBlades.map(b => (
                    <GrassBlade key={b.id} blade={b} />
                ))}

                {vines.map(v => (
                    <Vine key={v.id} vine={v} />
                ))}
            </>
        )}

        {/* Phase 4: Destruction - Lightning and Fire */}
        {genesisLightning.map(bolt => (
            <LightningBolt key={bolt.id} bolt={bolt} />
        ))}

        {fireAreas.map(fire => (
            <FireSpread key={fire.id} fire={fire} />
        ))}

        {/* Phase 5: Destruction - Active Fire */}
        {genesisCycle === 'destruction' && (
            <>
                {/* Lava cracks on ball */}
                <div className="lava-cracks-container">
                    {lavaCracks.map(crack => (
                        <LavaCrack key={crack.id} crack={crack} />
                    ))}
                </div>

                {/* Ember particles */}
                {emberParticles.map(ember => (
                    <EmberParticle key={ember.id} ember={ember} />
                ))}

                {/* Smoke plumes */}
                {smokePlumes.map(smoke => (
                    <SmokePlume key={smoke.id} smoke={smoke} />
                ))}
            </>
        )}

        {/* Phase 6: Restoration - Healing Rain */}
        {(transitionState === 'destruction-to-restoration' || genesisCycle === 'restoration') && (
            <>
                {/* Rain drops */}
                {rainDrops.map(drop => (
                    <RainDrop key={drop.id} drop={drop} />
                ))}

                {/* Steam particles */}
                {steamParticles.map(steam => (
                    <SteamParticle key={steam.id} steam={steam} />
                ))}

                {/* Puddles */}
                {puddles.map(puddle => (
                    <Puddle key={puddle.id} puddle={puddle} />
                ))}
            </>
        )}

        {/* Phase 7: Restoration - Water World */}
        {genesisCycle === 'restoration' && (
            <>
                {/* Water ripples */}
                {waterRipples.map(ripple => (
                    <WaterRipple key={ripple.id} ripple={ripple} />
                ))}

                {/* Bubbles */}
                {bubbles.map(bubble => (
                    <RestorationBubble key={bubble.id} bubble={bubble} />
                ))}

                {/* Healing particles */}
                {healingParticles.map(particle => (
                    <HealingParticle key={particle.id} particle={particle} />
                ))}
            </>
        )}
    </div>
);
