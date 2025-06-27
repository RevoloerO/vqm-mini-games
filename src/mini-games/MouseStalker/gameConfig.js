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
            
            // --- NEW: Shimmering Scales Effect ---
            // The base hue is green (130), and it shifts by up to 30 degrees (into teal/yellow)
            // The wave flows down the body based on the segment index (i) and time (timestamp)
            const shimmer = Math.sin(timestamp / 500 + i * 0.4) * 30;
            const shimmerHue = 130 + shimmer;

            const percent = (segments.length - i) / segments.length;
            const colorLightness = 50 - percent * 20;

            // Use the new shimmering hue for the fill and stroke
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
        
        // Head drawing remains the same
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
    ghost: (ctx, segments, timestamp) => {
        if (segments.length === 0) return;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(236, 239, 241, 0.7)';
        for (let i = segments.length - 1; i > 0; i--) {
            const segment = segments[i];
            const prevSegment = segments[i - 1];
            const opacity = (i / segments.length) * 0.4;
            ctx.strokeStyle = `rgba(236, 239, 241, ${opacity})`;
            ctx.lineWidth = segment.size * 2;
            ctx.shadowBlur = segment.size * 2;
            ctx.beginPath();
            ctx.moveTo(prevSegment.x, prevSegment.y);
            ctx.lineTo(segment.x, segment.y);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
        const head = segments[0];
        const next_seg = segments[1];
        ctx.fillStyle = 'rgba(236, 239, 241, 0.8)';
        ctx.beginPath();
        ctx.arc(head.x, head.y, head.size, 0, 2 * Math.PI);
        ctx.fill();
        const angle = Math.atan2(next_seg.y - head.y, next_seg.x - head.x);
        ctx.save();
        ctx.translate(head.x, head.y);
        ctx.rotate(angle + Math.PI);
        const eyeOffsetX = head.size * 0.4;
        const eyeOffsetY = head.size * 0.5;
        const eyeRadius = head.size * 0.25;
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(eyeOffsetX, -eyeOffsetY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeOffsetX, eyeOffsetY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
};
