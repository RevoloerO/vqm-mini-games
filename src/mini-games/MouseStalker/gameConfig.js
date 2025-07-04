export const FRUIT_TYPES = {
    NORMAL: { type: 'NORMAL', color: 'gold', size: 10, lifespan: Infinity, minBonus: 1, maxBonus: 1 },
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
        // Eye ridges
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

        // Eye details
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
            const timeInCycle = timestamp % 3500; // Blink cycle of 3.5 seconds
            const blinkDuration = 150; // Blink lasts 250ms
            if (timeInCycle < blinkDuration) {
                // Creates a smooth 0 -> 1 -> 0 curve for the blink
                const blinkProgress = Math.sin((timeInCycle / blinkDuration) * Math.PI);

                ctx.fillStyle = `hsl(${baseHue}, 70%, 50%)`; // Eyelid color
                ctx.strokeStyle = darkOutlineColor;
                ctx.lineWidth = 1.5 / headScale;

                // Draw top eyelid as a simple arc
                ctx.beginPath();
                ctx.moveTo(-3, -8);
                ctx.quadraticCurveTo(2, -9, 2, -4);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Draw bottom eyelid
                ctx.beginPath();
                ctx.moveTo(-3, 8);
                ctx.quadraticCurveTo(2, 9, 2, 4);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        }

        // --- Nose and Whiskers ---
        // Nose
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

        // Whiskers with motion
        ctx.strokeStyle = `hsl(${baseHue}, 40%, 30%)`;
        ctx.lineWidth = 1.5 / headScale;
        const whiskerWiggleX = Math.sin(timestamp / 480) * 1.5;
        const whiskerWiggleY = Math.cos(timestamp / 550) * 2;
        const whiskerRoll = Math.sin(timestamp / 550) * 2;

        // Top whisker
        ctx.beginPath();
        ctx.moveTo(16.5, -4);
        ctx.bezierCurveTo(22 + whiskerWiggleX, -10 + whiskerWiggleY, 27 + whiskerWiggleX, -1 + whiskerWiggleY, 29 + whiskerWiggleX, -7 + whiskerWiggleY);
        ctx.bezierCurveTo(28 + whiskerWiggleX, -10 + whiskerWiggleY - whiskerRoll, 25 + whiskerWiggleX, -7 + whiskerWiggleY, 27 + whiskerWiggleX, -6 + whiskerWiggleY);
        ctx.stroke();

        // Bottom whisker
        ctx.beginPath();
        ctx.moveTo(16.5, 4);
        ctx.bezierCurveTo(22 + whiskerWiggleX, 10 - whiskerWiggleY, 27 + whiskerWiggleX, 1 - whiskerWiggleY, 29 + whiskerWiggleX, 7 - whiskerWiggleY);
        ctx.bezierCurveTo(28 + whiskerWiggleX, 10 - whiskerWiggleY, 25 + whiskerWiggleX, 7 - whiskerWiggleY, 27 + whiskerWiggleX, 6 - whiskerWiggleY);
        ctx.stroke();

        // --- Eye Animation Logic ---
        if (!isWandering) {
            // "Lock-on" glow effect when not wandering
            const lockOnPulse = 2 + Math.sin(timestamp / 200) * 2;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter'; // Additive blending for a nice glow
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
    // =================================================================
    // ELEGANT NAGINI SKIN
    // =================================================================
    nagini: (ctx, segments, targetPos, timestamp, isWandering) => {
        const head = segments[0];
        if (!head) return;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // --- 1. Elegant Body: Rendered with overlapping, lit scales ---
        for (let i = segments.length - 1; i > 0; i--) {
            const segment = segments[i];
            const prevSegment = segments[i - 1];
            const angle = Math.atan2(prevSegment.y - segment.y, prevSegment.x - segment.x);
            const scaleSize = segment.size * 1.2;

            ctx.save();
            ctx.translate(segment.x, segment.y);
            ctx.rotate(angle);

            // Create a gradient for each scale for a 3D effect
            const scaleGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, scaleSize);
            scaleGradient.addColorStop(0, '#6a956a'); // Lighter center
            scaleGradient.addColorStop(0.7, '#4a754a'); // Mid-tone
            scaleGradient.addColorStop(1, '#2a4d2a'); // Dark edge

            ctx.fillStyle = scaleGradient;

            // Draw the scale as a slightly flattened ellipse
            ctx.beginPath();
            ctx.ellipse(0, 0, scaleSize, scaleSize * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Add a subtle, shimmering highlight to the top edge of the scale
            ctx.strokeStyle = 'rgba(200, 255, 200, 0.2)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, -scaleSize * 0.2, scaleSize * 0.6, Math.PI * 0.2, Math.PI * 0.8);
            ctx.stroke();

            ctx.restore();
        }

        // --- 2. CORRECTED: Pulsing Venom/Blood Flow Line ---
        // This is drawn on top of the scales to connect the segments visually.
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(segments[0].x, segments[0].y);
        // Use lineTo for a direct, robust path along the segments.
        for (let i = 1; i < segments.length; i++) {
            ctx.lineTo(segments[i].x, segments[i].y);
        }
        
        const flowPulse = 0.5 + Math.sin(timestamp / 400) * 0.5; // Pulse between 0 and 1
        const flowWidth = 2 + Math.sin(timestamp / 200) * 1.5; // Pulsing width

        // Base venom green glow
        ctx.strokeStyle = `hsla(120, 100%, 70%, ${flowPulse * 0.8})`; 
        ctx.lineWidth = flowWidth;
        ctx.shadowColor = `hsl(120, 100%, 50%)`;
        ctx.shadowBlur = 20; // Increased blur for a stronger glow
        ctx.stroke();

        // Inner blood-red core
        ctx.strokeStyle = `hsla(350, 100%, 70%, ${flowPulse * 0.6})`;
        ctx.lineWidth = flowWidth * 0.5;
        ctx.shadowColor = `hsl(350, 100%, 50%)`;
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.restore();


        // --- 3. Head Drawing ---
        const headAngle = Math.atan2(targetPos.y - head.y, targetPos.x - head.x);
        const headScale = head.size / 10;
        ctx.save();
        ctx.translate(head.x, head.y);
        ctx.rotate(headAngle);
        ctx.scale(headScale, headScale);
        ctx.lineWidth = 1.3 / headScale;

        // Head shape
        ctx.strokeStyle = '#112211'; // Very dark green outline
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

        // Eyes
        ctx.lineWidth = 1.3 / headScale;
        ctx.shadowColor = `hsl(55, 100%, 50%)`;
        ctx.shadowBlur = 20 / headScale;
        ctx.fillStyle = `hsl(55, 100%, 60%)`; // Bright yellow
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

        // Head Details (your original details)
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

        // --- Elegant Forked Tongue Animation ---
        if (!isWandering) {
            const cycle = timestamp % 4000; // A longer, more graceful 4-second cycle
            let tongueProgress = 0;

            // Phase 1: Extend (0ms to 600ms)
            if (cycle < 600) {
                tongueProgress = Math.sin((cycle / 600) * Math.PI * 0.5); // Ease-out
            }
            // Phase 2: Hold (600ms to 1000ms)
            else if (cycle < 1000) {
                tongueProgress = 1;
            }
            // Phase 3: Retract (1000ms to 1500ms)
            else if (cycle < 1500) {
                tongueProgress = 1 - Math.sin(((cycle - 1000) / 500) * Math.PI * 0.5); // Ease-in
            }

            if (tongueProgress > 0) {
                const tongueLength = 30 * tongueProgress;
                
                ctx.strokeStyle = `#c33149`; // Dark, fleshy red
                ctx.lineWidth = 1.8 / headScale;
                ctx.shadowColor = '#c33149';
                ctx.shadowBlur = 15 / headScale;

                ctx.beginPath();
                ctx.moveTo(25, 0); // Start from nose
                // Use a Bezier curve for a graceful S-shape
                ctx.bezierCurveTo(
                    25 + tongueLength * 0.4, 
                    tongueLength * 0.2, // First control point creates outward curve
                    25 + tongueLength * 0.6, 
                    -tongueLength * 0.2, // Second control point creates inward curve
                    25 + tongueLength, 
                    0 // End point
                );
                ctx.stroke();

                // Draw the forked tips at the end of the curve
                const tipAngle = -0.4; // Angle of the forks
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
    snake: (ctx, segments, targetPos, timestamp, isWandering) => {
        if (segments.length < 2) return;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (let i = 1; i < segments.length; i++) {
            const segment = segments[i];
            const prevSegment = segments[i - 1];
            const gradient = ctx.createLinearGradient(prevSegment.x, prevSegment.y, segment.x, segment.y);
            gradient.addColorStop(0, '#38a3a5');
            gradient.addColorStop(1, '#80ed99');
            ctx.strokeStyle = gradient;
            ctx.lineWidth = segment.size * 2;
            ctx.beginPath();
            ctx.moveTo(prevSegment.x, prevSegment.y);
            ctx.lineTo(segment.x, segment.y);
            ctx.stroke();
        }
        const head = segments[0];
        const next_seg = segments[1];

        // --- Head Drawing ---
        ctx.fillStyle = '#38a3a5';
        ctx.beginPath();

        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        const angle = Math.atan2(next_seg.y - head.y, next_seg.x - head.x);
        ctx.save();
        ctx.translate(head.x, head.y);
        ctx.rotate(angle + Math.PI);
        const eyeOffsetX = head.size * 0.5;
        const eyeOffsetY = head.size * 0.5;
        const eyeRadius = head.size * 0.2;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(eyeOffsetX, -eyeOffsetY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeOffsetX, eyeOffsetY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(eyeOffsetX + eyeRadius * 0.2, -eyeOffsetY, eyeRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeOffsetX + eyeRadius * 0.2, eyeOffsetY, eyeRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    },
    ghost: (ctx, segments, targetPos, timestamp, isWandering) => {
        if (segments.length < 2) return;

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = segments.length - 1; i > 0; i--) {
            const segment = segments[i];
            const prevSegment = segments[i - 1];

            const wispOpacity = Math.max(0, 0.3 + Math.sin(timestamp / 300 + i * 0.5) * 0.3);
            ctx.strokeStyle = `rgba(100, 80, 150, ${wispOpacity})`;
            ctx.lineWidth = Math.random() * segment.size * 0.5;
            ctx.beginPath();
            ctx.moveTo(prevSegment.x + (Math.random() - 0.5) * 20, prevSegment.y + (Math.random() - 0.5) * 20);
            ctx.quadraticCurveTo(
                (segment.x + prevSegment.x) / 2 + (Math.random() - 0.5) * 30,
                (segment.y + prevSegment.y) / 2 + (Math.random() - 0.5) * 30,
                segment.x + (Math.random() - 0.5) * 20,
                segment.y + (Math.random() - 0.5) * 20
            );
            ctx.stroke();

            const angle = Math.atan2(prevSegment.y - segment.y, prevSegment.x - segment.x);

            ctx.save();
            ctx.translate(segment.x, segment.y);
            ctx.rotate(angle);

            const boneLength = segment.size * 1.8;
            const boneWidth = segment.size * 0.9;

            const gradient = ctx.createLinearGradient(-boneLength / 2, 0, boneLength / 2, 0);
            gradient.addColorStop(0, 'rgba(210, 200, 255, 0)');
            gradient.addColorStop(0.3, 'rgba(230, 230, 255, 0.6)');
            gradient.addColorStop(0.7, 'rgba(230, 230, 255, 0.6)');
            gradient.addColorStop(1, 'rgba(210, 200, 255, 0)');
            ctx.fillStyle = gradient;

            ctx.beginPath();
            ctx.arc(-boneLength / 2, 0, boneWidth / 2, Math.PI * 0.5, Math.PI * 1.5);
            ctx.arc(boneLength / 2, 0, boneWidth / 2, Math.PI * 1.5, Math.PI * 0.5);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = `rgba(230, 230, 255, 0.4)`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-boneLength / 2, 0);
            ctx.lineTo(boneLength / 2, 0);
            ctx.stroke();

            const veinCount = Math.floor(segment.size / 4);
            ctx.strokeStyle = `rgba(180, 160, 255, 0.5)`;
            ctx.lineWidth = 1 + Math.random();
            ctx.lineCap = 'butt';
            for (let j = 0; j < veinCount; j++) {
                ctx.beginPath();
                const startX = -boneLength / 2;
                const endX = boneLength / 2;
                const yOffset = (Math.random() - 0.5) * (boneWidth * 0.7);
                ctx.moveTo(startX, yOffset);
                ctx.quadraticCurveTo(0, yOffset + (Math.random() - 0.5) * boneWidth, endX, yOffset);
                ctx.stroke();
            }
            ctx.lineCap = 'round';

            ctx.restore();
        }

        const head = segments[0];
        const headAngle = Math.atan2(targetPos.y - head.y, targetPos.x - head.x);
        const headScale = head.size / 8;

        ctx.save();
        ctx.translate(head.x, head.y);
        ctx.rotate(headAngle);
        ctx.scale(headScale, headScale);

        const spikeOpacity = 0.4 + Math.abs(Math.sin(timestamp / 150)) * 0.6;
        ctx.strokeStyle = `rgba(230, 230, 255, ${spikeOpacity})`;
        ctx.lineWidth = 1.5 / headScale;
        ctx.beginPath();
        ctx.moveTo(-10, -12);
        ctx.lineTo(-5, -22);
        ctx.lineTo(0, -15);
        ctx.lineTo(5, -25);
        ctx.lineTo(10, -14);
        ctx.lineTo(15, -20);
        ctx.lineTo(20, -12);
        ctx.stroke();

        ctx.fillStyle = 'rgba(240, 240, 255, 0.8)';
        ctx.strokeStyle = 'rgba(180, 160, 255, 0.7)';
        ctx.lineWidth = 2 / headScale;
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.quadraticCurveTo(10, -18, -15, -15);
        ctx.quadraticCurveTo(-25, -5, -25, 0);
        ctx.quadraticCurveTo(-25, 5, -15, 15);
        ctx.quadraticCurveTo(10, 18, 20, 0);
        ctx.fill();
        ctx.stroke();

        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20 / headScale;
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(5, -6, 4, 0, Math.PI * 2);
        ctx.arc(5, 6, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        const frillPulse = Math.sin(timestamp / 400) * 5;
        ctx.fillStyle = `rgba(180, 160, 255, 0.2)`;
        ctx.beginPath();
        ctx.moveTo(-15, -15);
        ctx.quadraticCurveTo(-30, -30 - frillPulse, -45, -10);
        ctx.quadraticCurveTo(-25, 0, -45, 10);
        ctx.quadraticCurveTo(-30, 30 + frillPulse, -15, 15);
        ctx.closePath();
        ctx.fill();

        const starPulse = 1 + Math.sin(timestamp / 200) * 0.8;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-28, -15, starPulse, 0, Math.PI * 2);
        ctx.arc(-35, 0, starPulse * 0.8, 0, Math.PI * 2);
        ctx.arc(-29, 12, starPulse * 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    },
};
