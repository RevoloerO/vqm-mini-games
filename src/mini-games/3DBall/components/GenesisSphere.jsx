import React from 'react';

/**
 * Genesis Sphere Projectile Component
 */
export const FertilizerProjectile = React.memo(({ style }) => (
    <div className="fertilizer-projectile" style={style}></div>
));

/**
 * Genesis Sphere Patch Component
 */
export const FertilizerPatch = React.memo(({ style }) => (
    <div className="fertilizer-patch" style={style}></div>
));

/**
 * Genesis Sphere Effects Container
 */
export const GenesisSphereEffects = ({ projectiles, patches }) => (
    <div className="genesis-effects-container">
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
                style={{
                    top: p.top,
                    left: p.left,
                    width: `${p.size}px`,
                    height: `${p.size}px`
                }}
            />
        ))}
    </div>
);
