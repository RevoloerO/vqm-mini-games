function draw() {
    var canvas = document.getElementById('canvas');
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ddd';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.translate(50, 50);

         // Draw horn 
        ctx.strokeStyle = `hsl(130, 80%, 20%)`;
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-5, -17, -30, -15);
        ctx.quadraticCurveTo(-9, -10, -7, 0);
        ctx.quadraticCurveTo(-9, 10, -30, 15);
        ctx.quadraticCurveTo(-5, 17, 0, 0);
        ctx.fill();
        ctx.stroke();
        // Draw head shape
        ctx.strokeStyle = `hsl(130, 80%, 20%)`;
        ctx.fillStyle = `hsl(130, 70%, 50%)`;
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
        // ctx.lineTo(-5, -15);
        //left face
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
        //

        // Draw eyes
        // right eye
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
        // left eye
        ctx.beginPath();
        ctx.moveTo(-7, 13);
        ctx.quadraticCurveTo(-3, 5, 5, 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-7, 13);
        ctx.moveTo(-3, 8);
        ctx.quadraticCurveTo(2, 9, 2, 4);
        ctx.fill();
        //draw eyebrows
        ctx.beginPath();
        ctx.fillStyle = `hsl(130, 80%, 20%)`;
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
        // Draw nose
        ctx.beginPath();
        ctx.moveTo(19, -4);
        ctx.quadraticCurveTo(13, -3.5, 17, -1);
        ctx.moveTo(19, 4);
        ctx.quadraticCurveTo(13, 3.5, 17, 1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(20, -1);
        ctx.lineTo(18, -3);
        //ctx.quadraticCurveTo(15,-4, 16, -3);
        ctx.stroke();

        // Draw whiskers
        ctx.strokeStyle = `hsl(130, 40%, 30%)`;
        const headScale = 1; // Scale factor for the test drawing
        ctx.lineWidth = 1.5 / headScale;
        // Left whiskers
        ctx.beginPath();
        ctx.moveTo(18, -2);
        ctx.bezierCurveTo(25, -5, 25, -15, 15, -20);
        ctx.stroke();
        // Right whiskers
        ctx.beginPath();
        ctx.moveTo(18, 2);
        ctx.bezierCurveTo(25, 5, 25, 15, 15, 20);
        ctx.stroke();


        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(0, 0, 1, 0, Math.PI * 2);
        ctx.fill();


        ctx.restore();
    }
}

draw();
/*Dragon Sketching template
// This is a template for drawing a dragon in a game context.
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
            glowGradient.addColorStop(0.7,`hsla(${baseHue}, 100%, 80%, 0.3)` );
            glowGradient.addColorStop(1, `hsla(${baseHue}, 100%, 50%, 0)`);

            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(0, 0, 20 + lockOnPulse, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
        ctx.restore();
    }

 */

