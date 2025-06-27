export const FRUIT_TYPES = {
    NORMAL: { type: 'NORMAL', color: 'gold', size: 10, lifespan: Infinity, minBonus: 1, maxBonus: 1 },
    RARE: { type: 'RARE', color: '#48dbfb', size: 7, lifespan: 10000, minBonus: 3, maxBonus: 5 },
    EPIC: { type: 'EPIC', color: '#ff9ff3', size: 5, lifespan: 3000, minBonus: 7, maxBonus: 10 },
    LEGENDARY: { type: 'LEGENDARY', color: '#FFFFFF', size: 12, lifespan: 5000, minBonus: 20, maxBonus: 30 },
};

export const GAME_CONFIG = {
    numInitialSegments: 15,
    initialSize: 8,
    maxSize: 30,
    easeFactor: 0.15,
    fruitSpawnRate: 2000,
};

export const SKINS = {
    dragon: (ctx, segments, targetPos, timestamp) => {
        const head = segments[0];
        if (!head) return;
        for (let i = segments.length - 1; i > 0; i--) {
            const segment = segments[i];

            let sizeScale = 1.0;
            const midPoint = segments.length * 0.75;
            if (i > midPoint) {
                const t = (i - midPoint) / (segments.length - midPoint);
                const minScale = 0.1;
                sizeScale = 1 - t * (1 - minScale);
            }
            const displaySize = segment.size * sizeScale;
            
            const shimmer = Math.sin(timestamp / 500 + i * 0.4) * 30;
            const shimmerHue = 130 + shimmer;

            const percent = (segments.length - i) / segments.length;
            const colorLightness = 50 - percent * 20;

            ctx.fillStyle = `hsl(${shimmerHue}, 70%, ${colorLightness}%)`;
            ctx.beginPath();
            ctx.arc(segment.x, segment.y, displaySize, 0, Math.PI * 2);
            ctx.fill();
            
            const prevSegment = segments[i - 1];
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
        
        const angle = Math.atan2(targetPos.y - head.y, targetPos.x - head.x);
        const headScale = head.size / 8;
        ctx.save();
        ctx.translate(head.x, head.y);
        ctx.rotate(angle);
        ctx.scale(headScale, headScale);
        ctx.lineWidth = 2 / headScale;
        
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
        
        ctx.beginPath();
        ctx.moveTo(19, -4);
        ctx.quadraticCurveTo(13, -3.5, 17, -1);
        ctx.moveTo(19, 4);
        ctx.quadraticCurveTo(13, 3.5, 17, 1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(20, -1);
        ctx.lineTo(18, -3);
        ctx.stroke();

        ctx.strokeStyle = `hsl(130, 40%, 30%)`;
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
    'fire-wyrm': (ctx, segments, targetPos, timestamp) => {
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
    snake: (ctx, segments, timestamp) => {
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
        ctx.fillStyle = '#38a3a5';
        ctx.beginPath();
        ctx.arc(head.x, head.y, head.size, 0, Math.PI * 2);
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
    // --- UPDATED: Ghost skin with a center line for bone definition ---
    ghost: (ctx, segments, targetPos, timestamp) => {
        if (segments.length < 2) return;

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // --- 1. Draw Body: Smoky, ethereal, and threaded with veins ---
        for (let i = segments.length - 1; i > 0; i--) {
            const segment = segments[i];
            const prevSegment = segments[i - 1];

            // "shadowy wisps that curl and vanish" between segments.
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

            // --- Bone Shape Logic ---
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

            // Draw the capsule/bone shape
            ctx.beginPath();
            ctx.arc(-boneLength / 2, 0, boneWidth / 2, Math.PI * 0.5, Math.PI * 1.5);
            ctx.arc(boneLength / 2, 0, boneWidth / 2, Math.PI * 1.5, Math.PI * 0.5);
            ctx.closePath();
            ctx.fill();

            // NEW: Add a horizontal line for bone definition
            ctx.strokeStyle = `rgba(230, 230, 255, 0.4)`; // A brighter, misty highlight
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-boneLength / 2, 0);
            ctx.lineTo(boneLength / 2, 0);
            ctx.stroke();

            // "threaded with pale violet veins"
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

        // --- 2. Draw Head: A hollow skull-mask (remains the same) ---
        const head = segments[0];
        const angle = Math.atan2(targetPos.y - head.y, targetPos.x - head.x);
        const headScale = head.size / 8;

        ctx.save();
        ctx.translate(head.x, head.y);
        ctx.rotate(angle);
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
