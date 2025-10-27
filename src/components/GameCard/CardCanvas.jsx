import React, { useRef, useEffect } from 'react';

/**
 * Canvas background animation for specific game cards
 */
const CardCanvas = ({ title }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        // Early return if this card doesn't need canvas animation
        if (title !== 'Mouse Stalker' && title !== 'Blooming Garden') return;
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        let animationId;

        // Mouse Stalker animation
        if (title === 'Mouse Stalker') {
            let mouseX = canvas.width / 2;
            let mouseY = canvas.height / 2;
            let targetX = mouseX;
            let targetY = mouseY;

            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                mouseX += (targetX - mouseX) * 0.1;
                mouseY += (targetY - mouseY) * 0.1;

                ctx.beginPath();
                ctx.arc(mouseX, mouseY, 30, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(127, 183, 126, 0.5)';
                ctx.fill();

                animationId = requestAnimationFrame(animate);
            };

            const handleMove = (e) => {
                const rect = canvas.getBoundingClientRect();
                targetX = e.clientX - rect.left;
                targetY = e.clientY - rect.top;
            };

            canvas.addEventListener('mousemove', handleMove);
            animate();

            return () => {
                cancelAnimationFrame(animationId);
                canvas.removeEventListener('mousemove', handleMove);
            };
        }

        // Blooming Garden animation
        if (title === 'Blooming Garden') {
            const petals = Array.from({ length: 15 }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 10 + 5,
                speed: Math.random() * 1 + 0.5,
                rotation: Math.random() * Math.PI * 2
            }));

            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                petals.forEach(petal => {
                    petal.y += petal.speed;
                    petal.rotation += 0.02;

                    if (petal.y > canvas.height) {
                        petal.y = -petal.size;
                        petal.x = Math.random() * canvas.width;
                    }

                    ctx.save();
                    ctx.translate(petal.x, petal.y);
                    ctx.rotate(petal.rotation);
                    ctx.fillStyle = 'rgba(127, 183, 126, 0.4)';
                    ctx.fillRect(-petal.size / 2, -petal.size / 2, petal.size, petal.size);
                    ctx.restore();
                });

                animationId = requestAnimationFrame(animate);
            };

            animate();

            return () => {
                cancelAnimationFrame(animationId);
            };
        }
    }, [title]);

    // Only render canvas if this card needs animation
    if (title !== 'Mouse Stalker' && title !== 'Blooming Garden') {
        return null;
    }

    return <canvas ref={canvasRef} className="card-background-canvas" />;
};

export default CardCanvas;
