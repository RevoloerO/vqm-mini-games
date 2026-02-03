import React, { useCallback } from 'react';
import CardCanvas from './CardCanvas';
import { useCardTilt } from './useCardTilt';

/**
 * GameCard Component - Displays a single game with interactive effects
 */
const GameCard = ({ title, description, status, icon, onPlay, delay, featured = false, theme = 'arcade' }) => {
    const { tiltStyle, handleMouseMove, handleMouseLeave } = useCardTilt();

    const handleClick = useCallback(() => {
        if (status === 'Ready') onPlay();
    }, [status, onPlay]);

    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (status === 'Ready') onPlay();
        }
        // Don't prevent default for Space to allow scrolling
    }, [status, onPlay]);

    return (
        <div
            className="game-card"
            style={{
                animationDelay: `${delay}s`,
                '--animation-delay': `${delay}s`,
                cursor: status === 'Ready' ? 'pointer' : 'default',
                ...tiltStyle
            }}
            data-featured={featured}
            data-theme={theme}
            tabIndex={status === 'Ready' ? 0 : -1}
            onClick={handleClick}
            onKeyPress={handleKeyPress}
            onMouseMove={(e) => handleMouseMove(e, status === 'Ready')}
            onMouseLeave={handleMouseLeave}
            role="button"
            aria-label={`Play ${title}`}
        >
            <CardCanvas title={title} theme={theme} />
            <div className="game-card-icon" aria-hidden="true">{icon}</div>
            <h3 className="game-card-title">{title}</h3>
            <p className="game-card-description">{description}</p>
        </div>
    );
};

export default GameCard;
