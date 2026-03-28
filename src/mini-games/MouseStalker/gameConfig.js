export const FRUIT_TYPES = {
    // BUG FIX: Normal fruit given a 20-second lifespan to prevent accumulation
    NORMAL: { type: 'NORMAL', color: 'gold', size: 10, lifespan: 20000, minBonus: 1, maxBonus: 1 },
    RARE: { type: 'RARE', color: '#48dbfb', size: 7, lifespan: 10000, minBonus: 3, maxBonus: 5 },
    EPIC: { type: 'EPIC', color: '#ff9ff3', size: 5, lifespan: 5000, minBonus: 7, maxBonus: 10 },
    LEGENDARY: { type: 'LEGENDARY', color: '#FFFFFF', size: 12, lifespan: 2500, minBonus: 20, maxBonus: 30 },
};

export const GAME_CONFIG = {
    numInitialSegments: 10,
    initialSize: 5,
    maxSize: 30,
    easeFactor: 0.15,
    fruitSpawnRate: 2000,
};

export const SKINS = {

    dragon: (ctx, segments, targetPos, timestamp, isWandering) => {
        const head = segments[0];
        if (!head) return;

        const baseHue = 130; // The classic green hue

        // --- Body Segments ---
        for (let i = segments.length - 1; i > 0; i--) {
            const segment = segments[i];
            const prevSegment = segments[i - 1];

            let sizeScale = 1.0;
            const midPoint = segments.length * 0.75;
            if (i > midPoint) {
                const t = (i - midPoint) / (segments.length - midPoint);
                const minScale = 0.1;
                sizeScale = 1 - t * (1 - minScale);
            }
            const displaySize = segment.size * sizeScale;

            const shimmer = Math.sin(timestamp / 500 + i * 0.4) * 30;
            const shimmerHue = baseHue + shimmer;

            const percent = i / segments.length;
            const colorLightness = 70 - percent * 40;

            ctx.fillStyle = `hsl(${shimmerHue}, 70%, ${colorLightness}%)`;
            ctx.beginPath();
            ctx.arc(segment.x, segment.y, displaySize, 0, Math.PI * 2);
            ctx.fill();

            const gradient = ctx.createLinearGradient(prevSegment.x, prevSegment.y, segment.x - displaySize * Math.cos(Math.atan2(targetPos.y - segment.y, targetPos.x - segment.x)), segment.y - displaySize * Math.sin(Math.atan2(targetPos.y - segment.y, targetPos.x - segment.x)));
            gradient.addColorStop(0, 'white');
            gradient.addColorStop(0.2, `hsl(${shimmerHue}, 70%, ${colorLightness}%)`);
            gradient.addColorStop(0.7, `hsl(${shimmerHue}, 70%, ${colorLightness}%)`);
            gradient.addColorStop(1, `hsl(${shimmerHue}, 90%, ${colorLightness}%)`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = displaySize * 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(prevSegment.x, prevSegment.y);
            ctx.lineTo(segment.x, segment.y);
            ctx.stroke();

            ctx.strokeStyle = gradient;
            ctx.lineWidth = displaySize / 2;
            ctx.beginPath();
            ctx.moveTo(segment.x, segment.y);
            ctx.lineTo(segment.x - displaySize * Math.cos(Math.atan2(targetPos.y - segment.y, targetPos.x - segment.x)),
                segment.y - displaySize * Math.sin(Math.atan2(targetPos.y - segment.y, targetPos.x - segment.x)));
            ctx.stroke();
        }

        // --- Head Drawing ---
        const angle = Math.atan2(targetPos.y - head.y, targetPos.x - head.x);
        const headScale = head.size / 8;
        ctx.save();
        ctx.translate(head.x, head.y);
        ctx.rotate(angle);
        ctx.scale(headScale, headScale);
        ctx.lineWidth = 2 / headScale;

        const darkOutlineColor = `hsl(${baseHue}, 80%, 20%)`;

        // Draw the back frills/horns
        ctx.strokeStyle = darkOutlineColor;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-5, -17, -30, -15);
        ctx.quadraticCurveTo(-9, -10, -7, 0);
        ctx.quadraticCurveTo(-9, 10, -30, 15);
        ctx.quadraticCurveTo(-5, 17, 0, 0);
        ctx.fill();
        ctx.stroke();

        // --- Main head shape with gradient layer ---
        ctx.strokeStyle = darkOutlineColor;
        const headGradient = ctx.createRadialGradient(5, 0, 1, 0, 0, 30);
        headGradient.addColorStop(0, `hsl(${baseHue}, 70%, 65%)`);
        headGradient.addColorStop(1, `hsl(${baseHue}, 70%, 50%)`);
        ctx.fillStyle = headGradient;

        const mainHeadPath = new Path2D();
        mainHeadPath.moveTo(22, 0);
        mainHeadPath.lineTo(19, -4);
        const cheekX = 7;
        const cheekY = -7;
        mainHeadPath.bezierCurveTo(cheekX - 2, cheekY + 3, cheekX + 2, cheekY - 4, 3, -10);
        mainHeadPath.quadraticCurveTo(1, -14, -2, -16);
        mainHeadPath.lineTo(0, -10);
        mainHeadPath.quadraticCurveTo(-1, -12, -7, -13);
        mainHeadPath.lineTo(-4, -9);
        mainHeadPath.quadraticCurveTo(-15, -13, -9, -3);
        mainHeadPath.lineTo(-7, -2);
        mainHeadPath.quadraticCurveTo(-10, -4, -22, 0);
        mainHeadPath.quadraticCurveTo(-10, 4, -7, 2);
        mainHeadPath.lineTo(-9, 3);
        mainHeadPath.quadraticCurveTo(-15, 13, -4, 9);
        mainHeadPath.lineTo(-7, 13);
        mainHeadPath.quadraticCurveTo(-1, 12, 0, 10);
        mainHeadPath.lineTo(-2, 16);
        mainHeadPath.quadraticCurveTo(1, 14, 3, 10);
        mainHeadPath.bezierCurveTo(cheekX + 2, -cheekY + 4, cheekX - 2, -cheekY - 3, 19, 4);
        mainHeadPath.lineTo(22, 0);
        ctx.fill(mainHeadPath);
        ctx.stroke(mainHeadPath);

        // --- Add extra highlight layer for scales ---
        ctx.save();
        ctx.clip(mainHeadPath);
        const shimmer = Math.sin(timestamp / 400) * 5;
        ctx.strokeStyle = `hsla(${baseHue}, 90%, ${75 + shimmer}%, 0.5)`;
        ctx.lineWidth = 1.5 / headScale;
        ctx.beginPath();
        ctx.moveTo(15, -3);
        ctx.quadraticCurveTo(10, -8, 5, -9);
        ctx.moveTo(15, 3);
        ctx.quadraticCurveTo(10, 8, 5, 9);
        ctx.moveTo(-5, -12);
        ctx.quadraticCurveTo(-10, -8, -12, -2);
        ctx.moveTo(-5, 12);
        ctx.quadraticCurveTo(-10, 8, -12, 2);
        ctx.stroke();
        ctx.restore();

        // --- Static Eye Details ---
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(-7, -13);
        ctx.quadraticCurveTo(-3, -5, 5, -3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-3, -8);
        ctx.quadraticCurveTo(2, -9, 2, -4);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-7, 13);
        ctx.quadraticCurveTo(-3, 5, 5, 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-3, 8);
        ctx.quadraticCurveTo(2, 9, 2, 4);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `hsl(${baseHue}, 80%, 20%)`;
        ctx.moveTo(2, -4);
        ctx.quadraticCurveTo(-1, -2, -6.5, -6);
        ctx.moveTo(4.5, -3);
        ctx.quadraticCurveTo(-1, -2, -6.5, -6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(2, 4);
        ctx.quadraticCurveTo(-1, 2, -6.5, 6);
        ctx.moveTo(4.5, 3);
        ctx.quadraticCurveTo(-1, 2, -6.5, 6);
        ctx.stroke();

        // --- Blinking Animation ---
        if (isWandering) {
            const timeInCycle = timestamp % 3500;
            const blinkDuration = 150;
            if (timeInCycle < blinkDuration) {
                // Blink animation draws closed eyelids
                ctx.fillStyle = `hsl(${baseHue}, 70%, 50%)`;
                ctx.strokeStyle = darkOutlineColor;
                ctx.lineWidth = 1.5 / headScale;
                ctx.beginPath();
                ctx.moveTo(-3, -8);
                ctx.quadraticCurveTo(2, -9, 2, -4);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(-3, 8);
                ctx.quadraticCurveTo(2, 9, 2, 4);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        }

        // --- Nose and Whiskers ---
        ctx.beginPath();
        ctx.moveTo(19, -4);
        ctx.quadraticCurveTo(13, -3.5, 17, -1);
        ctx.moveTo(19, 4);
        ctx.quadraticCurveTo(13, 3.5, 17, 1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(20, -1);
        ctx.lineTo(18, -3);
        ctx.moveTo(20, 1);
        ctx.lineTo(18, 3);
        ctx.stroke();
        ctx.moveTo(8, -3);
        ctx.quadraticCurveTo(6, 0, 8, 3);
        ctx.moveTo(10, -2.5);
        ctx.quadraticCurveTo(8, 0, 10, 2.5);
        ctx.moveTo(15.3, -3);
        ctx.quadraticCurveTo(10, -2, 5, -6);
        ctx.moveTo(15.3, 3);
        ctx.quadraticCurveTo(10, 2, 5, 6);
        ctx.stroke();

        ctx.strokeStyle = `hsl(${baseHue}, 40%, 30%)`;
        ctx.lineWidth = 1.5 / headScale;
        const whiskerWiggleX = Math.sin(timestamp / 480) * 1.5;
        const whiskerWiggleY = Math.cos(timestamp / 550) * 2;
        const whiskerRoll = Math.sin(timestamp / 550) * 2;
        ctx.beginPath();
        ctx.moveTo(16.5, -4);
        ctx.bezierCurveTo(22 + whiskerWiggleX, -10 + whiskerWiggleY, 27 + whiskerWiggleX, -1 + whiskerWiggleY, 29 + whiskerWiggleX, -7 + whiskerWiggleY);
        ctx.bezierCurveTo(28 + whiskerWiggleX, -10 + whiskerWiggleY - whiskerRoll, 25 + whiskerWiggleX, -7 + whiskerWiggleY, 27 + whiskerWiggleX, -6 + whiskerWiggleY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(16.5, 4);
        ctx.bezierCurveTo(22 + whiskerWiggleX, 10 - whiskerWiggleY, 27 + whiskerWiggleX, 1 - whiskerWiggleY, 29 + whiskerWiggleX, 7 - whiskerWiggleY);
        ctx.bezierCurveTo(28 + whiskerWiggleX, 10 - whiskerWiggleY, 25 + whiskerWiggleX, 7 - whiskerWiggleY, 27 + whiskerWiggleX, 6 - whiskerWiggleY);
        ctx.stroke();

        if (!isWandering) {
            const lockOnPulse = 2 + Math.sin(timestamp / 200) * 2;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20 + lockOnPulse);
            glowGradient.addColorStop(0, `hsla(0, 100.00%, 50.20%, 0.69)`);
            glowGradient.addColorStop(0.7, `hsla(${baseHue}, 100%, 80%, 0.3)`);
            glowGradient.addColorStop(1, `hsla(${baseHue}, 100%, 50%, 0)`);
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(0, 0, 20 + lockOnPulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    },
    // eslint-disable-next-line no-unused-vars
    'fire-wyrm': (ctx, segments, targetPos, timestamp, isWandering) => {
        const head = segments[0];
        if (!head) return;

        ctx.shadowBlur = 0;

        for (let i = segments.length - 1; i > 0; i--) {
            const segment = segments[i];
            const prevSegment = segments[i - 1];

            let sizeScale = 1.0;
            const midPoint = segments.length * 0.75;
            if (i > midPoint) {
                const t = (i - midPoint) / (segments.length - midPoint);
                const minScale = 0.1;
                sizeScale = 1 - t * (1 - minScale);
            }
            const displaySize = segment.size * sizeScale;

            const flicker = Math.abs(Math.sin(timestamp / 250 + i * 0.2));
            const percent = (segments.length - i) / segments.length;
            const colorHue = 50 - percent * 50;
            const colorLightness = 45 + flicker * 15;

            ctx.fillStyle = `hsla(${45 + flicker * 10}, 100%, 60%, 0.25)`;
            ctx.beginPath();
            ctx.arc(segment.x, segment.y, displaySize + 3 + flicker * 3, 0, Math.PI * 2);
            ctx.fill();

            const gradient = ctx.createLinearGradient(prevSegment.x, prevSegment.y, segment.x, segment.y);
            gradient.addColorStop(0, `hsl(${colorHue + 10}, 100%, 60%)`);
            gradient.addColorStop(0.5, `hsl(${colorHue}, 100%, ${colorLightness}%)`);
            gradient.addColorStop(1, `hsl(${colorHue - 10}, 100%, 40%)`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = displaySize * 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(prevSegment.x, prevSegment.y);
            ctx.lineTo(segment.x, segment.y);
            ctx.stroke();
        }
        const angle = Math.atan2(targetPos.y - head.y, targetPos.x - head.x);
        const headScale = head.size / 8;
        ctx.save();
        ctx.translate(head.x, head.y);
        ctx.rotate(angle);
        ctx.scale(headScale, headScale);
        ctx.lineWidth = 2 / headScale;

        ctx.strokeStyle = `hsl(0, 0%, 20%)`;
        ctx.fillStyle = `hsl(30, 100%, 85%)`;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-5, -17, -30, -15);
        ctx.quadraticCurveTo(-9, -10, -7, 0);
        ctx.quadraticCurveTo(-9, 10, -30, 15);
        ctx.quadraticCurveTo(-5, 17, 0, 0);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = `hsl(0, 80%, 30%)`;
        ctx.fillStyle = `hsl(25, 100%, 50%)`;
        var cheekX = 7;
        var cheekY = -7;
        ctx.beginPath();
        ctx.moveTo(22, 0);
        ctx.lineTo(19, -4);
        ctx.bezierCurveTo(cheekX - 2, cheekY + 3, cheekX + 2, cheekY - 4, 3, -10);
        ctx.quadraticCurveTo(1, -14, -2, -16);
        ctx.lineTo(0, -10);
        ctx.quadraticCurveTo(-1, -12, -7, -13);
        ctx.lineTo(-4, -9);
        ctx.quadraticCurveTo(-15, -13, -9, -3);
        ctx.lineTo(-7, -2);
        ctx.quadraticCurveTo(-10, -4, -22, 0);
        ctx.quadraticCurveTo(-10, 4, -7, 2);
        ctx.lineTo(-9, 3);
        ctx.quadraticCurveTo(-15, 13, -4, 9);
        ctx.lineTo(-7, 13);
        ctx.quadraticCurveTo(-1, 12, 0, 10);
        ctx.lineTo(-2, 16);
        ctx.quadraticCurveTo(1, 14, 3, 10);
        ctx.bezierCurveTo(cheekX + 2, -cheekY + 4, cheekX - 2, -cheekY - 3, 19, 4);
        ctx.lineTo(22, 0);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(-7, -13);
        ctx.quadraticCurveTo(-3, -5, 5, -3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-7, -13);
        ctx.moveTo(-3, -8);
        ctx.quadraticCurveTo(2, -9, 2, -4);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-7, 13);
        ctx.quadraticCurveTo(-3, 5, 5, 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-7, 13);
        ctx.moveTo(-3, 8);
        ctx.quadraticCurveTo(2, 9, 2, 4);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `hsl(0, 80%, 30%)`;
        ctx.moveTo(2, -4);
        ctx.quadraticCurveTo(-1, -2, -6.5, -6);
        ctx.moveTo(4.5, -3);
        ctx.quadraticCurveTo(-1, -2, -6.5, -6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(2, 4);
        ctx.quadraticCurveTo(-1, 2, -6.5, 6);
        ctx.moveTo(4.5, 3);
        ctx.quadraticCurveTo(-1, 2, -6.5, 6);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(19, -4);
        ctx.quadraticCurveTo(13, -3.5, 17, -1);
        ctx.moveTo(19, 4);
        ctx.quadraticCurveTo(13, 3.5, 17, 1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(20, -1);
        ctx.lineTo(18, -3);
        ctx.moveTo(20, 1);
        ctx.lineTo(18, 3);
        ctx.stroke();

        ctx.strokeStyle = `hsl(45, 100%, 50%)`;
        ctx.lineWidth = 1.5 / headScale;
        ctx.beginPath();
        ctx.moveTo(18, -2);
        ctx.bezierCurveTo(25, -5, 25, -15, 15, -20);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(18, 2);
        ctx.bezierCurveTo(25, 5, 25, 15, 15, 20);
        ctx.stroke();

        ctx.restore();
    },
    nagini: (ctx, segments, targetPos, timestamp, isWandering) => {
        const head = segments[0];
        if (!head) return;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = segments.length - 1; i > 0; i--) {
            const segment = segments[i];
            const prevSegment = segments[i - 1];

            const angle = Math.atan2(prevSegment.y - segment.y, prevSegment.x - segment.x);
            const scaleSize = segment.size * 1.2;

            ctx.save();
            ctx.translate(segment.x, segment.y);
            ctx.rotate(angle);

            const scaleGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, scaleSize);
            scaleGradient.addColorStop(0, '#6a956a');
            scaleGradient.addColorStop(0.7, '#4a754a');
            scaleGradient.addColorStop(1, '#2a4d2a');
            ctx.fillStyle = scaleGradient;

            ctx.beginPath();
            ctx.ellipse(0, 0, scaleSize, scaleSize * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = 'rgba(200, 255, 200, 0.2)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, -scaleSize * 0.2, scaleSize * 0.6, Math.PI * 0.2, Math.PI * 0.8);
            ctx.stroke();
            ctx.restore();

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(prevSegment.x, prevSegment.y);
            ctx.lineTo(segment.x, segment.y);

            const flowPulse = 0.5 + Math.sin(timestamp / 400 + i * 0.1) * 0.5;
            const flowWidth = 2 + Math.sin(timestamp / 200 + i * 0.1) * 1.5;

            ctx.strokeStyle = `hsla(120, 100%, 70%, ${flowPulse * 0.6})`;
            ctx.lineWidth = flowWidth * 2;
            ctx.shadowColor = `hsl(120, 100%, 50%)`;
            ctx.shadowBlur = 15;
            ctx.stroke();

            ctx.strokeStyle = `hsla(350, 100%, 50%, ${flowPulse * 0.8})`;
            ctx.lineWidth = flowWidth;
            ctx.shadowColor = `hsl(350, 100%, 50%)`;
            ctx.shadowBlur = 20;
            ctx.stroke();
            ctx.restore();
        }

        const headAngle = Math.atan2(targetPos.y - head.y, targetPos.x - head.x);
        const headScale = head.size / 10;
        ctx.save();
        ctx.translate(head.x, head.y);
        ctx.rotate(headAngle);
        ctx.scale(headScale, headScale);
        ctx.lineWidth = 1.3 / headScale;

        ctx.strokeStyle = '#112211';
        const headGradient = ctx.createRadialGradient(0, 0, 1, 10, 0, 25);
        headGradient.addColorStop(0, '#4a754a');
        headGradient.addColorStop(1, '#1a2d1a');
        ctx.fillStyle = headGradient;

        ctx.beginPath();
        ctx.moveTo(25, 0);
        ctx.quadraticCurveTo(26, -3, 22, -6);
        ctx.quadraticCurveTo(12, -7, 9, -12);
        ctx.bezierCurveTo(-3, -19, -13, -15, -15, 0);
        ctx.moveTo(25, 0);
        ctx.quadraticCurveTo(26, 3, 22, 6);
        ctx.quadraticCurveTo(12, 7, 9, 12);
        ctx.bezierCurveTo(-3, 19, -13, 15, -15, 0);
        ctx.fill();
        ctx.stroke();

        ctx.lineWidth = 1.3 / headScale;
        ctx.shadowColor = `hsl(55, 100%, 50%)`;
        ctx.shadowBlur = 20 / headScale;
        ctx.fillStyle = `hsl(55, 100%, 60%)`;
        ctx.beginPath();
        ctx.moveTo(7.5, -8);
        ctx.quadraticCurveTo(8, -12, 2, -11.5);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(7.5, 8);
        ctx.quadraticCurveTo(8, 12, 2, 11.5);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 0.5 / headScale;
        ctx.beginPath();
        ctx.moveTo(4, -10.2);
        ctx.lineTo(6.5, -10);
        ctx.moveTo(4, 10.2);
        ctx.lineTo(6.5, 10);
        ctx.stroke();

        ctx.strokeStyle = '#112211';
        ctx.lineWidth = 1/ headScale;
        ctx.beginPath();
        ctx.moveTo(-4, -13);
        ctx.quadraticCurveTo(-2, -14, 9, -7);
        ctx.moveTo(-4, 13);
        ctx.quadraticCurveTo(-2, 14, 9, 7);
        ctx.moveTo(19, -5);
        ctx.quadraticCurveTo(19, -3, 22, -3)
        ctx.moveTo(19, 5);
        ctx.quadraticCurveTo(19, 3, 22, 3)
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        ctx.lineWidth = 0.3 / headScale;
        ctx.beginPath();
        ctx.moveTo(-5, -15); ctx.quadraticCurveTo(-15, -10, -12, -1); ctx.moveTo(9, -7); ctx.bezierCurveTo(14, -4, 8, -2, 6, -4); ctx.bezierCurveTo(6, -5, 6, -8.5, 8.5, -7); ctx.moveTo(6, -4); ctx.bezierCurveTo(2, -5, 0, -12, 6, -9); ctx.moveTo(3.5, -5.5); ctx.bezierCurveTo(-4, -9, -2, -13, 2, -11); ctx.moveTo(-1, -8.5); ctx.bezierCurveTo(-7, -11, -10, -13, -5, -13); ctx.moveTo(-1, -8.5); ctx.quadraticCurveTo(2, -6, -3, -5); ctx.quadraticCurveTo(-3, 0, -2, 0); ctx.moveTo(-3, -5); ctx.quadraticCurveTo(-9, -6.5, -9, -5); ctx.quadraticCurveTo(-10, -0.5, -9, -0.5); ctx.moveTo(-9, -6); ctx.quadraticCurveTo(-10, -6.5, -8, -11); ctx.moveTo(6, -4); ctx.lineTo(6, -0.5);
        ctx.moveTo(-5, 15); ctx.quadraticCurveTo(-15, 10, -12, 1); ctx.moveTo(9, 7); ctx.bezierCurveTo(14, 4, 8, 2, 6, 4); ctx.bezierCurveTo(6, 5, 6, 8.5, 8.5, 7); ctx.moveTo(6, 4); ctx.bezierCurveTo(2, 5, 0, 12, 6, 9); ctx.moveTo(3.5, 5.5); ctx.bezierCurveTo(-4, 9, -2, 13, 2, 11); ctx.moveTo(-1, 8.5); ctx.bezierCurveTo(-7, 11, -10, 13, -5, 13); ctx.moveTo(-1, 8.5); ctx.quadraticCurveTo(2, 6, -3, 5); ctx.quadraticCurveTo(-3, 0, -2, 0); ctx.moveTo(-3, 5); ctx.quadraticCurveTo(-9, 6.5, -9, 5); ctx.quadraticCurveTo(-10, 0.5, -9, 0.5); ctx.moveTo(-9, 6); ctx.quadraticCurveTo(-10, 6.5, -8, 11); ctx.moveTo(6, 4); ctx.lineTo(6, 0.5);
        ctx.moveTo(4.5,0 ); ctx.lineTo(-2, 0); ctx.moveTo(-5, 0); ctx.lineTo(-7, 0);
        ctx.stroke();

        ctx.lineWidth = 1 / headScale;
        ctx.beginPath();
        ctx.moveTo(-3, -20);
        ctx.quadraticCurveTo(-4, -20, -4, -18);
        ctx.stroke();

        if (!isWandering) {
            const cycle = timestamp % 4000;
            let tongueProgress = 0;
            if (cycle < 600) {
                tongueProgress = Math.sin((cycle / 600) * Math.PI * 0.5);
            }
            else if (cycle < 1000) {
                tongueProgress = 1;
            }
            else if (cycle < 1500) {
                tongueProgress = 1 - Math.sin(((cycle - 1000) / 500) * Math.PI * 0.5);
            }
            if (tongueProgress > 0) {
                const tongueLength = 30 * tongueProgress;
                ctx.strokeStyle = `#c33149`;
                ctx.lineWidth = 1.8 / headScale;
                ctx.shadowColor = '#c33149';
                ctx.shadowBlur = 15 / headScale;
                ctx.beginPath();
                ctx.moveTo(25, 0);
                ctx.bezierCurveTo(25 + tongueLength * 0.4, tongueLength * 0.2, 25 + tongueLength * 0.6, -tongueLength * 0.2, 25 + tongueLength, 0);
                ctx.stroke();
                const tipAngle = -0.4;
                const tipLength = 8 * tongueProgress;
                ctx.beginPath();
                ctx.moveTo(25 + tongueLength, 0);
                ctx.lineTo(25 + tongueLength - Math.cos(tipAngle) * tipLength, 0 - Math.sin(tipAngle) * tipLength);
                ctx.moveTo(25 + tongueLength, 0);
                ctx.lineTo(25 + tongueLength - Math.cos(-tipAngle) * tipLength, 0 - Math.sin(-tipAngle) * tipLength);
                ctx.stroke();
            }
        }
        ctx.restore();
    },
    // eslint-disable-next-line no-unused-vars
    snake: (ctx, segments, targetPos, timestamp, isWandering) => {
        if (segments.length < 2) return;
        const len = segments.length;

        // --- Body: tapering with diamond scales ---
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw body as smooth tapering path with belly gradient
        for (let i = len - 1; i > 0; i--) {
            const seg = segments[i];
            const prev = segments[i - 1];
            const t = 1 - i / len; // 0 at tail, 1 at head
            const bodyWidth = seg.size * (0.4 + t * 1.4); // taper: thin tail → thick near head

            // Undulation offset for organic movement
            const undulate = Math.sin(timestamp / 200 + i * 0.6) * 2 * (1 - t);
            const angle = Math.atan2(seg.y - prev.y, seg.x - prev.x);
            const perpX = Math.cos(angle + Math.PI / 2) * undulate;
            const perpY = Math.sin(angle + Math.PI / 2) * undulate;

            // Dorsal (top) color — rich emerald to olive
            const hue = 130 + t * 20;
            const lightness = 28 + t * 12;
            const gradient = ctx.createLinearGradient(
                prev.x + perpX, prev.y + perpY, seg.x + perpX, seg.y + perpY
            );
            gradient.addColorStop(0, `hsl(${hue}, 70%, ${lightness}%)`);
            gradient.addColorStop(1, `hsl(${hue - 10}, 65%, ${lightness + 5}%)`);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = bodyWidth;
            ctx.beginPath();
            ctx.moveTo(prev.x + perpX, prev.y + perpY);
            ctx.lineTo(seg.x + perpX, seg.y + perpY);
            ctx.stroke();

            // Ventral (belly) highlight stripe
            ctx.strokeStyle = `hsla(60, 50%, 75%, ${0.15 + t * 0.1})`;
            ctx.lineWidth = bodyWidth * 0.3;
            ctx.beginPath();
            ctx.moveTo(prev.x + perpX, prev.y + perpY);
            ctx.lineTo(seg.x + perpX, seg.y + perpY);
            ctx.stroke();

            // Diamond scale pattern (every 2nd segment)
            if (i % 2 === 0 && bodyWidth > 3) {
                const mx = (seg.x + prev.x) / 2 + perpX;
                const my = (seg.y + prev.y) / 2 + perpY;
                const scaleSize = bodyWidth * 0.35;
                const scaleAngle = angle;
                ctx.save();
                ctx.translate(mx, my);
                ctx.rotate(scaleAngle);
                ctx.fillStyle = `hsla(${hue + 15}, 60%, ${lightness + 15}%, 0.4)`;
                ctx.beginPath();
                ctx.moveTo(0, -scaleSize);
                ctx.lineTo(scaleSize * 0.6, 0);
                ctx.lineTo(0, scaleSize);
                ctx.lineTo(-scaleSize * 0.6, 0);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        }

        // --- Head: wedge-shaped viper head ---
        const head = segments[0];
        const neck = segments[Math.min(2, len - 1)];
        const headAngle = Math.atan2(targetPos.y - head.y, targetPos.x - head.x);
        const headScale = head.size / 8;

        ctx.save();
        ctx.translate(head.x, head.y);
        ctx.rotate(headAngle);
        ctx.scale(headScale, headScale);

        // Wedge shape — wider than neck, triangular
        const headGrad = ctx.createLinearGradient(-12, 0, 22, 0);
        headGrad.addColorStop(0, 'hsl(130, 55%, 30%)');
        headGrad.addColorStop(0.5, 'hsl(135, 65%, 25%)');
        headGrad.addColorStop(1, 'hsl(140, 60%, 22%)');
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.moveTo(22, 0);           // snout tip
        ctx.lineTo(5, -12);          // upper jaw corner
        ctx.quadraticCurveTo(-8, -14, -12, -8); // brow ridge
        ctx.lineTo(-12, 8);          // neck bottom
        ctx.quadraticCurveTo(-8, 14, 5, 12);    // lower jaw corner
        ctx.closePath();
        ctx.fill();

        // Head dorsal pattern — darker V marking
        ctx.fillStyle = 'hsla(120, 40%, 18%, 0.5)';
        ctx.beginPath();
        ctx.moveTo(-8, 0);
        ctx.lineTo(0, -6);
        ctx.lineTo(10, 0);
        ctx.lineTo(0, 6);
        ctx.closePath();
        ctx.fill();

        // Heat pits (small dark marks between eye and nostril)
        ctx.fillStyle = 'hsl(130, 30%, 15%)';
        ctx.beginPath();
        ctx.ellipse(14, -4, 1.5, 1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(14, 4, 1.5, 1, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes — amber with vertical slit pupils
        const eyeX = 6, eyeYOffset = 7, eyeR = 3.5;
        // Eye glow
        ctx.shadowColor = 'hsl(45, 100%, 50%)';
        ctx.shadowBlur = 8 / headScale;
        // Eyeball
        ctx.fillStyle = 'hsl(45, 90%, 55%)';
        ctx.beginPath();
        ctx.ellipse(eyeX, -eyeYOffset, eyeR, eyeR * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(eyeX, eyeYOffset, eyeR, eyeR * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Vertical slit pupil
        ctx.fillStyle = 'hsl(0, 0%, 5%)';
        ctx.beginPath();
        ctx.ellipse(eyeX + 0.5, -eyeYOffset, 1, eyeR * 0.75, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(eyeX + 0.5, eyeYOffset, 1, eyeR * 0.75, 0, 0, Math.PI * 2);
        ctx.fill();

        // Forked tongue — flicks periodically
        const tonguePhase = (timestamp % 2000) / 2000;
        if (tonguePhase < 0.3) {
            const flick = Math.sin(tonguePhase / 0.3 * Math.PI);
            const tongueLen = 12 + flick * 8;
            const forkSpread = 3 + flick * 4;
            ctx.strokeStyle = 'hsl(350, 70%, 45%)';
            ctx.lineWidth = 1.2 / headScale;
            ctx.lineCap = 'round';
            // Tongue base
            ctx.beginPath();
            ctx.moveTo(22, 0);
            ctx.lineTo(22 + tongueLen, 0);
            ctx.stroke();
            // Fork
            ctx.beginPath();
            ctx.moveTo(22 + tongueLen, 0);
            ctx.lineTo(22 + tongueLen + 4, -forkSpread);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(22 + tongueLen, 0);
            ctx.lineTo(22 + tongueLen + 4, forkSpread);
            ctx.stroke();
        }

        ctx.restore();
    },
    // eslint-disable-next-line no-unused-vars
    ghost: (ctx, segments, targetPos, timestamp, isWandering) => {
        if (segments.length < 2) return;
        const len = segments.length;
        const time = timestamp / 1000;

        // --- Spectral aura — eerie glow along the whole body path ---
        for (let i = 0; i < len; i += 3) {
            const seg = segments[i];
            const t = 1 - i / len;
            const auraR = seg.size * (1.6 + Math.sin(time + i * 0.5) * 0.4);
            const auraAlpha = (0.03 + t * 0.03) * (0.8 + Math.sin(time * 1.5 + i * 0.7) * 0.2);
            const grad = ctx.createRadialGradient(seg.x, seg.y, 0, seg.x, seg.y, auraR);
            grad.addColorStop(0, `hsla(190, 50%, 70%, ${auraAlpha * 1.5})`);
            grad.addColorStop(0.4, `hsla(260, 30%, 60%, ${auraAlpha})`);
            grad.addColorStop(1, `hsla(280, 20%, 40%, 0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(seg.x, seg.y, auraR, 0, Math.PI * 2);
            ctx.fill();
        }

        // --- Spine glow — neon energy running through the backbone ---
        const spineGlowPulse = Math.sin(time * 3) * 0.15 + 0.85;
        for (let i = len - 1; i > 0; i--) {
            const seg = segments[i];
            const prev = segments[i - 1];
            const t = 1 - i / len;
            // Outer glow
            ctx.shadowColor = 'hsl(190, 100%, 60%)';
            ctx.shadowBlur = 6 + t * 4;
            ctx.strokeStyle = `hsla(190, 80%, 65%, ${(0.08 + t * 0.12) * spineGlowPulse})`;
            ctx.lineWidth = 4 + t * 3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(seg.x, seg.y);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // --- Spine bone — solid white-bone line ---
        for (let i = len - 1; i > 0; i--) {
            const seg = segments[i];
            const prev = segments[i - 1];
            const t = 1 - i / len;
            ctx.strokeStyle = `hsla(40, 14%, 85%, ${0.55 + t * 0.35})`;
            ctx.lineWidth = 2 + t * 1.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(seg.x, seg.y);
            ctx.stroke();
        }

        // --- Vertebrae + dorsal spines + ribs ---
        for (let i = len - 1; i > 0; i--) {
            const seg = segments[i];
            const prev = segments[i - 1];
            const t = 1 - i / len;
            const angle = Math.atan2(seg.y - prev.y, seg.x - prev.x);
            const mx = (seg.x + prev.x) / 2;
            const my = (seg.y + prev.y) / 2;
            const boneAlpha = 0.5 + t * 0.4;

            // Vertebra knob — 3D shaded circle
            const knobSize = 2 + t * 1.8;
            const knobGrad = ctx.createRadialGradient(
                mx - knobSize * 0.3, my - knobSize * 0.3, 0,
                mx, my, knobSize
            );
            knobGrad.addColorStop(0, `hsla(45, 18%, 95%, ${boneAlpha})`);
            knobGrad.addColorStop(0.6, `hsla(40, 14%, 82%, ${boneAlpha})`);
            knobGrad.addColorStop(1, `hsla(35, 10%, 65%, ${boneAlpha * 0.6})`);
            ctx.fillStyle = knobGrad;
            ctx.beginPath();
            ctx.arc(mx, my, knobSize, 0, Math.PI * 2);
            ctx.fill();
            // Knob outline
            ctx.strokeStyle = `hsla(35, 10%, 60%, ${boneAlpha * 0.4})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();

            // Dorsal spine process — sharp pointed triangle
            const dorsalLen = knobSize * 2;
            const dorsalAngle = angle + Math.PI / 2;
            const dorsalGrad = ctx.createLinearGradient(
                mx, my,
                mx + Math.cos(dorsalAngle) * dorsalLen,
                my + Math.sin(dorsalAngle) * dorsalLen
            );
            dorsalGrad.addColorStop(0, `hsla(40, 12%, 85%, ${boneAlpha * 0.8})`);
            dorsalGrad.addColorStop(1, `hsla(40, 10%, 75%, ${boneAlpha * 0.3})`);
            ctx.fillStyle = dorsalGrad;
            ctx.beginPath();
            ctx.moveTo(
                mx - Math.cos(angle) * knobSize * 0.3,
                my - Math.sin(angle) * knobSize * 0.3
            );
            ctx.lineTo(
                mx + Math.cos(dorsalAngle) * dorsalLen,
                my + Math.sin(dorsalAngle) * dorsalLen
            );
            ctx.lineTo(
                mx + Math.cos(angle) * knobSize * 0.3,
                my + Math.sin(angle) * knobSize * 0.3
            );
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = `hsla(35, 8%, 68%, ${boneAlpha * 0.3})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();

            // --- Ribs: 3D curved bones with shading ---
            if (i < len - 2) {
                const ribScale = 0.3 + t * 0.7;
                const ribLen = seg.size * (0.9 + t * 1.3) * ribScale;
                const ribAlpha = 0.4 + t * 0.35;
                const breathe = Math.sin(time * 0.7 + i * 0.4) * 0.08;
                const ribWidth = 0.9 + t * 0.7;

                // Left rib
                const lStart = Math.PI / 2 + breathe;
                const lMid = Math.PI / 2 + 0.3 + breathe;
                const lEnd = Math.PI / 2 + 0.55 + breathe;

                // Rib shadow (wider, darker, offset)
                ctx.strokeStyle = `hsla(30, 8%, 50%, ${ribAlpha * 0.25})`;
                ctx.lineWidth = ribWidth + 1;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(mx, my);
                ctx.bezierCurveTo(
                    mx + Math.cos(angle + lStart) * ribLen * 0.4,
                    my + Math.sin(angle + lStart) * ribLen * 0.4,
                    mx + Math.cos(angle + lMid) * ribLen * 0.8,
                    my + Math.sin(angle + lMid) * ribLen * 0.8,
                    mx + Math.cos(angle + lEnd) * ribLen,
                    my + Math.sin(angle + lEnd) * ribLen
                );
                ctx.stroke();

                // Rib bone (lighter)
                ctx.strokeStyle = `hsla(42, 14%, 87%, ${ribAlpha})`;
                ctx.lineWidth = ribWidth;
                ctx.beginPath();
                ctx.moveTo(mx, my);
                ctx.bezierCurveTo(
                    mx + Math.cos(angle + lStart) * ribLen * 0.4,
                    my + Math.sin(angle + lStart) * ribLen * 0.4,
                    mx + Math.cos(angle + lMid) * ribLen * 0.8,
                    my + Math.sin(angle + lMid) * ribLen * 0.8,
                    mx + Math.cos(angle + lEnd) * ribLen,
                    my + Math.sin(angle + lEnd) * ribLen
                );
                ctx.stroke();

                // Rib tip highlight
                ctx.fillStyle = `hsla(45, 15%, 90%, ${ribAlpha * 0.6})`;
                ctx.beginPath();
                ctx.arc(
                    mx + Math.cos(angle + lEnd) * ribLen,
                    my + Math.sin(angle + lEnd) * ribLen,
                    0.7 + t * 0.4, 0, Math.PI * 2
                );
                ctx.fill();

                // Right rib (mirror)
                const rStart = -Math.PI / 2 - breathe;
                const rMid = -Math.PI / 2 - 0.3 - breathe;
                const rEnd = -Math.PI / 2 - 0.55 - breathe;

                ctx.strokeStyle = `hsla(30, 8%, 50%, ${ribAlpha * 0.25})`;
                ctx.lineWidth = ribWidth + 1;
                ctx.beginPath();
                ctx.moveTo(mx, my);
                ctx.bezierCurveTo(
                    mx + Math.cos(angle + rStart) * ribLen * 0.4,
                    my + Math.sin(angle + rStart) * ribLen * 0.4,
                    mx + Math.cos(angle + rMid) * ribLen * 0.8,
                    my + Math.sin(angle + rMid) * ribLen * 0.8,
                    mx + Math.cos(angle + rEnd) * ribLen,
                    my + Math.sin(angle + rEnd) * ribLen
                );
                ctx.stroke();

                ctx.strokeStyle = `hsla(42, 14%, 87%, ${ribAlpha})`;
                ctx.lineWidth = ribWidth;
                ctx.beginPath();
                ctx.moveTo(mx, my);
                ctx.bezierCurveTo(
                    mx + Math.cos(angle + rStart) * ribLen * 0.4,
                    my + Math.sin(angle + rStart) * ribLen * 0.4,
                    mx + Math.cos(angle + rMid) * ribLen * 0.8,
                    my + Math.sin(angle + rMid) * ribLen * 0.8,
                    mx + Math.cos(angle + rEnd) * ribLen,
                    my + Math.sin(angle + rEnd) * ribLen
                );
                ctx.stroke();

                ctx.fillStyle = `hsla(45, 15%, 90%, ${ribAlpha * 0.6})`;
                ctx.beginPath();
                ctx.arc(
                    mx + Math.cos(angle + rEnd) * ribLen,
                    my + Math.sin(angle + rEnd) * ribLen,
                    0.7 + t * 0.4, 0, Math.PI * 2
                );
                ctx.fill();
            }
        }

        // --- HEAD: Massive detailed serpent skull ---
        const head = segments[0];
        const headAngle = Math.atan2(targetPos.y - head.y, targetPos.x - head.x);
        const hs = head.size / 6.5; // slightly bigger scale

        ctx.save();
        ctx.translate(head.x, head.y);
        ctx.rotate(headAngle);
        ctx.scale(hs, hs);

        // Head aura glow
        ctx.shadowColor = 'hsl(190, 100%, 55%)';
        ctx.shadowBlur = 15 / hs;
        ctx.fillStyle = 'hsla(190, 60%, 60%, 0.04)';
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        const boneHi = 'hsla(42, 16%, 92%, 0.95)';
        const boneMid = 'hsla(40, 14%, 84%, 0.9)';
        const boneLo = 'hsla(35, 10%, 62%, 0.7)';
        const lineW = 0.7 / hs;

        // === Upper cranium ===
        // 3D shaded skull plate
        const crGrad = ctx.createLinearGradient(-22, -14, 10, 4);
        crGrad.addColorStop(0, boneMid);
        crGrad.addColorStop(0.4, boneHi);
        crGrad.addColorStop(1, boneMid);
        ctx.fillStyle = crGrad;
        ctx.strokeStyle = boneLo;
        ctx.lineWidth = lineW;
        ctx.beginPath();
        ctx.moveTo(26, -1.5);
        ctx.lineTo(20, -4);
        ctx.lineTo(12, -7);
        ctx.quadraticCurveTo(5, -12, -2, -14);
        ctx.quadraticCurveTo(-10, -16, -17, -13);
        ctx.quadraticCurveTo(-24, -9, -24, 0);
        ctx.quadraticCurveTo(-24, 3, -20, 5);
        ctx.lineTo(-10, 4.5);
        ctx.lineTo(4, 2.5);
        ctx.lineTo(20, -0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Brow ridge — heavy bone above eye
        ctx.strokeStyle = boneLo;
        ctx.lineWidth = 2 / hs;
        ctx.beginPath();
        ctx.moveTo(14, -6.5);
        ctx.quadraticCurveTo(6, -11, -2, -13.5);
        ctx.quadraticCurveTo(-8, -14.5, -14, -12);
        ctx.stroke();
        // Brow highlight
        ctx.strokeStyle = `hsla(42, 16%, 93%, 0.5)`;
        ctx.lineWidth = 0.8 / hs;
        ctx.beginPath();
        ctx.moveTo(12, -7.5);
        ctx.quadraticCurveTo(5, -12, -2, -14);
        ctx.stroke();

        // Cranial suture lines
        ctx.strokeStyle = 'hsla(30, 8%, 62%, 0.3)';
        ctx.lineWidth = 0.4 / hs;
        ctx.beginPath();
        ctx.moveTo(-18, -11);
        ctx.quadraticCurveTo(-12, -7, -5, -9);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-22, -3);
        ctx.quadraticCurveTo(-14, -1, -8, -2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-10, -14);
        ctx.quadraticCurveTo(-8, -8, -12, -4);
        ctx.stroke();

        // Snout ridge detail
        ctx.strokeStyle = 'hsla(35, 10%, 70%, 0.4)';
        ctx.lineWidth = 0.5 / hs;
        ctx.beginPath();
        ctx.moveTo(20, -3);
        ctx.lineTo(10, -5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(20, -2);
        ctx.lineTo(14, -2.5);
        ctx.stroke();

        // === Lower jaw — separated, angled down ===
        const jawGrad = ctx.createLinearGradient(-18, 5, 20, 12);
        jawGrad.addColorStop(0, boneMid);
        jawGrad.addColorStop(0.5, boneHi);
        jawGrad.addColorStop(1, boneMid);
        ctx.fillStyle = jawGrad;
        ctx.strokeStyle = boneLo;
        ctx.lineWidth = lineW;
        ctx.beginPath();
        ctx.moveTo(26, 1.5);
        ctx.lineTo(20, 4);
        ctx.lineTo(10, 8);
        ctx.quadraticCurveTo(2, 12, -5, 13);
        ctx.quadraticCurveTo(-12, 14, -18, 10);
        ctx.quadraticCurveTo(-22, 7, -20, 5);
        ctx.lineTo(-10, 5);
        ctx.lineTo(4, 3.5);
        ctx.lineTo(20, 1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Jaw bone ridge detail
        ctx.strokeStyle = 'hsla(35, 10%, 68%, 0.35)';
        ctx.lineWidth = 0.4 / hs;
        ctx.beginPath();
        ctx.moveTo(18, 3);
        ctx.quadraticCurveTo(6, 7, -4, 9);
        ctx.stroke();

        // Jaw hinge — detailed joint
        ctx.fillStyle = boneMid;
        ctx.strokeStyle = boneLo;
        ctx.lineWidth = 0.6 / hs;
        ctx.beginPath();
        ctx.arc(-19, 7, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Joint inner circle
        ctx.fillStyle = `hsla(35, 8%, 70%, 0.5)`;
        ctx.beginPath();
        ctx.arc(-19, 7, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // === Eye socket — deep angular void ===
        ctx.fillStyle = 'hsla(260, 70%, 3%, 0.97)';
        ctx.beginPath();
        ctx.moveTo(12, -6);
        ctx.lineTo(6, -12);
        ctx.lineTo(-2, -9);
        ctx.lineTo(-1, -5);
        ctx.quadraticCurveTo(3, -4, 7, -4.5);
        ctx.closePath();
        ctx.fill();
        // Socket rim highlight
        ctx.strokeStyle = 'hsla(40, 14%, 78%, 0.6)';
        ctx.lineWidth = 0.9 / hs;
        ctx.stroke();
        // Inner socket depth shadow
        ctx.strokeStyle = 'hsla(260, 30%, 20%, 0.4)';
        ctx.lineWidth = 0.5 / hs;
        ctx.beginPath();
        ctx.moveTo(10, -6.5);
        ctx.lineTo(5, -10.5);
        ctx.lineTo(0, -8);
        ctx.stroke();

        // Soul-fire eye — intense glow
        const ef = Math.sin(time * 5) * 0.15 + 0.85;
        const es = Math.sin(time * 3) * 0.4 + 1.6;
        // Outer glow
        ctx.shadowColor = 'hsl(185, 100%, 55%)';
        ctx.shadowBlur = (14 + Math.sin(time * 7) * 5) / hs;
        ctx.fillStyle = `hsla(185, 100%, 70%, ${ef * 0.5})`;
        ctx.beginPath();
        ctx.arc(5, -7.5, es * 1.8, 0, Math.PI * 2);
        ctx.fill();
        // Bright core
        ctx.fillStyle = `hsla(185, 100%, 85%, ${ef * 0.95})`;
        ctx.beginPath();
        ctx.arc(5, -7.5, es, 0, Math.PI * 2);
        ctx.fill();
        // White-hot center
        ctx.fillStyle = `hsla(180, 100%, 95%, ${ef * 0.7})`;
        ctx.beginPath();
        ctx.arc(5.2, -7.8, es * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // === Nose holes ===
        ctx.fillStyle = 'hsla(260, 40%, 5%, 0.85)';
        ctx.beginPath();
        ctx.moveTo(22, -3);
        ctx.lineTo(24.5, -2);
        ctx.lineTo(22, -1.2);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(22, -0.5);
        ctx.lineTo(24, 0.2);
        ctx.lineTo(22, 0.5);
        ctx.closePath();
        ctx.fill();

        // === Teeth — upper jaw row ===
        ctx.fillStyle = boneHi;
        ctx.strokeStyle = 'hsla(35, 10%, 65%, 0.35)';
        ctx.lineWidth = 0.25 / hs;
        // Large front fangs
        ctx.beginPath();
        ctx.moveTo(24, -0.5);
        ctx.lineTo(27, 2);
        ctx.lineTo(22.5, 1);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(21, 0);
        ctx.lineTo(23, 2.5);
        ctx.lineTo(19.5, 1.5);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        // Smaller teeth row
        for (let ti = 0; ti < 6; ti++) {
            const tx = 17 - ti * 2.5;
            const tl = 2 - ti * 0.12;
            ctx.beginPath();
            ctx.moveTo(tx, 1);
            ctx.lineTo(tx + 0.7, 1 + tl);
            ctx.lineTo(tx - 0.7, 1 + tl * 0.85);
            ctx.closePath();
            ctx.fill();
        }

        // === Teeth — lower jaw row ===
        for (let ti = 0; ti < 5; ti++) {
            const tx = 18 - ti * 2.5;
            const tl = 1.7 - ti * 0.1;
            ctx.beginPath();
            ctx.moveTo(tx, 3.5);
            ctx.lineTo(tx + 0.5, 3.5 - tl);
            ctx.lineTo(tx - 0.5, 3.5 - tl * 0.85);
            ctx.closePath();
            ctx.fill();
        }

        // === Horns / bone crests on back of skull ===
        const hornGrad = ctx.createLinearGradient(-14, -13, -24, -20);
        hornGrad.addColorStop(0, boneMid);
        hornGrad.addColorStop(1, 'hsla(35, 10%, 70%, 0.5)');
        ctx.fillStyle = hornGrad;
        ctx.strokeStyle = boneLo;
        ctx.lineWidth = 0.6 / hs;
        // Main horn
        ctx.beginPath();
        ctx.moveTo(-13, -13);
        ctx.quadraticCurveTo(-16, -18, -22, -20);
        ctx.lineTo(-18, -11);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        // Secondary horn
        ctx.beginPath();
        ctx.moveTo(-17, -10);
        ctx.quadraticCurveTo(-22, -14, -27, -14);
        ctx.lineTo(-21, -8);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        // Small spine crest
        ctx.beginPath();
        ctx.moveTo(-20, -6);
        ctx.lineTo(-26, -8);
        ctx.lineTo(-22, -4);
        ctx.closePath();
        ctx.fill();

        // === Orbiting souls ===
        for (let s = 0; s < 3; s++) {
            const oa = time * 1.5 + s * (Math.PI * 2 / 3);
            const or2 = 28 + Math.sin(time * 2 + s * 1.5) * 5;
            const sx = Math.cos(oa) * or2;
            const sy = Math.sin(oa) * or2;
            const sa = 0.25 + Math.sin(time * 3.5 + s * 2) * 0.12;
            ctx.shadowColor = `hsl(${185 + s * 30}, 100%, 60%)`;
            ctx.shadowBlur = 6 / hs;
            ctx.fillStyle = `hsla(${185 + s * 30}, 80%, 82%, ${sa})`;
            ctx.beginPath();
            ctx.arc(sx, sy, 1.3 + Math.sin(time * 4 + s) * 0.4, 0, Math.PI * 2);
            ctx.fill();
            // Soul trail
            const ta = oa - 0.6;
            ctx.fillStyle = `hsla(${185 + s * 30}, 60%, 75%, ${sa * 0.25})`;
            ctx.beginPath();
            ctx.arc(Math.cos(ta) * or2 * 0.85, Math.sin(ta) * or2 * 0.85, 0.7, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;

        ctx.restore();
    },
};
