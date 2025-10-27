import React from 'react';

/**
 * A presentational component for a single fire particle.
 */
const FireParticle = React.memo(({ x, y, size, opacity }) => {
    const style = {
        transform: `translate(${x}px, ${y}px)`,
        width: `${size}px`,
        height: `${size}px`,
        opacity: opacity,
        position: 'absolute',
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
 * Fireball particle container
 */
export const FireballEffects = ({ particles }) => (
    <div className="fire-particle-container">
        {particles.map(p => <FireParticle key={p.id} {...p} />)}
    </div>
);
