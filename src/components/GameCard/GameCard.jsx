import React, { useCallback } from 'react';
import CardCanvas from './CardCanvas';
import { useCardTilt } from './useCardTilt';
import { useExpandableCard } from '../../hooks/useExpandableCard';

/**
 * GameCard Component - Displays a single game with interactive effects.
 * Compact by default — description expands on hover (desktop) / first tap (mobile).
 */
const GameCard = ({ title, description, status, icon, onPlay, delay, featured = false, theme = 'arcade' }) => {
    const { tiltStyle, handleMouseMove, handleMouseLeave: tiltMouseLeave } = useCardTilt();

    const navigate = useCallback(() => {
        if (status === 'Ready') onPlay();
    }, [status, onPlay]);

    const { isExpanded, cardRef, handlers } = useExpandableCard(navigate);

    // Compose mouse handlers: tilt + expand
    const onMouseMove = useCallback((e) => {
        handleMouseMove(e, status === 'Ready');
    }, [handleMouseMove, status]);

    const onMouseLeave = useCallback((e) => {
        tiltMouseLeave();
        handlers.onMouseLeave(e);
    }, [tiltMouseLeave, handlers]);

    const onMouseEnter = useCallback((e) => {
        handlers.onMouseEnter(e);
    }, [handlers]);

    return (
        <div
            ref={cardRef}
            className="game-card"
            style={{
                animationDelay: `${delay}s`,
                '--animation-delay': `${delay}s`,
                cursor: status === 'Ready' ? 'pointer' : 'default',
                ...tiltStyle
            }}
            data-featured={featured}
            data-theme={theme}
            data-expanded={isExpanded}
            tabIndex={status === 'Ready' ? 0 : -1}
            onClick={handlers.onClick}
            onKeyDown={handlers.onKeyDown}
            onFocus={handlers.onFocus}
            onBlur={handlers.onBlur}
            onTouchStart={handlers.onTouchStart}
            onMouseMove={onMouseMove}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            role="button"
            aria-label={`Play ${title}`}
            aria-expanded={isExpanded}
        >
            <CardCanvas title={title} theme={theme} />
            <div className="game-card-icon" aria-hidden="true">{icon}</div>
            <h3 className="game-card-title">{title}</h3>
            <div className="card-expandable" data-expanded={isExpanded}>
                <div className="card-expandable-inner">
                    <p className="game-card-description">{description}</p>
                </div>
            </div>
        </div>
    );
};

export default GameCard;
