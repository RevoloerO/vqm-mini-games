import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useExpandableCard — Shared interaction hook for compact game tags.
 *
 * Desktop: hover/focus expands description, click navigates.
 * Mobile:  first tap expands, second tap navigates, tap-outside collapses.
 *
 * @param {Function} onNavigate — called when the user intends to navigate
 * @returns {{ isExpanded: boolean, handlers: object }}
 */
export function useExpandableCard(onNavigate) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isTouchRef = useRef(false);
    const blurTimeoutRef = useRef(null);
    const cardRef = useRef(null);

    // ---- Touch detection ----
    const handleTouchStart = useCallback(() => {
        isTouchRef.current = true;
    }, []);

    // ---- Desktop hover ----
    const handleMouseEnter = useCallback(() => {
        if (isTouchRef.current) return;   // ignore synthetic hover after touch
        setIsExpanded(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        if (isTouchRef.current) return;
        setIsExpanded(false);
    }, []);

    // ---- Click / Tap ----
    const handleClick = useCallback((e) => {
        if (isTouchRef.current) {
            // Mobile two-tap pattern
            if (!isExpanded) {
                e.preventDefault();
                setIsExpanded(true);
            } else {
                // Already expanded → navigate
                onNavigate?.();
            }
        } else {
            // Desktop → always navigate on click
            onNavigate?.();
        }
    }, [isExpanded, onNavigate]);

    // ---- Keyboard ----
    const handleFocus = useCallback(() => {
        clearTimeout(blurTimeoutRef.current);
        setIsExpanded(true);
    }, []);

    const handleBlur = useCallback(() => {
        // Delay collapse so a click on the same card doesn't flicker
        blurTimeoutRef.current = setTimeout(() => {
            setIsExpanded(false);
        }, 150);
    }, []);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onNavigate?.();
        }
    }, [onNavigate]);

    // ---- Tap-outside to collapse (mobile) ----
    useEffect(() => {
        if (!isExpanded || !isTouchRef.current) return;

        const handleOutsideClick = (e) => {
            if (cardRef.current && !cardRef.current.contains(e.target)) {
                setIsExpanded(false);
                isTouchRef.current = false;  // reset for next interaction
            }
        };

        // Delay listener attachment so the current tap doesn't trigger it
        const raf = requestAnimationFrame(() => {
            document.addEventListener('click', handleOutsideClick, { passive: true });
        });

        return () => {
            cancelAnimationFrame(raf);
            document.removeEventListener('click', handleOutsideClick);
        };
    }, [isExpanded]);

    // Cleanup on unmount
    useEffect(() => {
        return () => clearTimeout(blurTimeoutRef.current);
    }, []);

    return {
        isExpanded,
        cardRef,
        handlers: {
            onTouchStart: handleTouchStart,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave,
            onClick: handleClick,
            onFocus: handleFocus,
            onBlur: handleBlur,
            onKeyDown: handleKeyDown,
        },
    };
}
