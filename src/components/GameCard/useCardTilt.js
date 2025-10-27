import { useState } from 'react';

/**
 * Custom hook for card tilt effect on mouse move
 */
export const useCardTilt = () => {
    const [tiltX, setTiltX] = useState(0);
    const [tiltY, setTiltY] = useState(0);

    const handleMouseMove = (e, isReady) => {
        if (!isReady) return;
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        setTiltX(rotateX);
        setTiltY(rotateY);
    };

    const handleMouseLeave = () => {
        setTiltX(0);
        setTiltY(0);
    };

    const tiltStyle = {
        transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
    };

    return { tiltStyle, handleMouseMove, handleMouseLeave };
};
