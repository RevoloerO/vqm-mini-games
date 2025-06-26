
export const FRUIT_TYPES = {
    NORMAL: { type: 'NORMAL', color: 'gold', size: 10, lifespan: Infinity, minBonus: 1, maxBonus: 1 },
    RARE: { type: 'RARE', color: '#48dbfb', size: 7, lifespan: 10000, minBonus: 3, maxBonus: 5 },
    EPIC: { type: 'EPIC', color: '#ff9ff3', size: 5, lifespan: 3000, minBonus: 7, maxBonus: 10 },
};

export const GAME_CONFIG = {
    numInitialSegments: 15,
    initialSize: 8,
    maxSize: 30,
    easeFactor: 0.15,
    fruitSpawnRate: 2000,
};

export const SKINS = {
    dragon: (ctx, segments, targetPos) => {
        const head = segments[0];
        if (!head) return;
        for (let i = segments.length - 1; i > 0; i--) {
            const segment = segments[i];
            const percent = (segments.length - i) / segments.length;
            const colorLightness = 50 + percent * 20;
            ctx.fillStyle = `hsl(130, 70%, ${colorLightness}%)`;
            ctx.beginPath();
            ctx.arc(segment.x, segment.y, segment.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = `hsl(130, 80%, 20%)`;
            ctx.strokeStyle = `hsl(130, 70%, 50%)`;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = segment.size / 2;
            ctx.beginPath();
            ctx.moveTo(segments[i - 1].x, segments[i - 1].y);
            ctx.lineTo(segment.x, segment.y);
            ctx.stroke();
``          // Draw fur segment 
            ctx.strokeStyle = `hsl(130, 80%, 20%)`;
            ctx.beginPath();
            ctx.moveTo(segment.x, segment.y);
            ctx.lineTo(segment.x - segment.size * Math.cos(Math.atan2(targetPos.y - segment.y, targetPos.x - segment.x)),
                segment.y - segment.size * Math.sin(Math.atan2(targetPos.y - segment.y, targetPos.x - segment.x)));

            ctx.stroke();
        }
        const angle = Math.atan2(targetPos.y - head.y, targetPos.x - head.x);
        const headScale = head.size / 8;
        ctx.save();
        ctx.translate(head.x, head.y);
        ctx.rotate(angle);
        ctx.scale(headScale, headScale);
        ctx.lineWidth = 2 / headScale;
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

        // Draw swhiskers
        ctx.strokeStyle = `hsl(130, 40%, 30%)`;
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

        ctx.restore();
    },
    snake: (ctx, segments) => {
    if (segments.length < 2) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw body with a gradient
    for (let i = 1; i < segments.length; i++) {
        const segment = segments[i];
        const prevSegment = segments[i - 1];
        
        const gradient = ctx.createLinearGradient(prevSegment.x, prevSegment.y, segment.x, segment.y);
        gradient.addColorStop(0, '#38a3a5'); // Teal
        gradient.addColorStop(1, '#80ed99'); // Light Green

        ctx.strokeStyle = gradient;
        ctx.lineWidth = segment.size * 2; // Use lineWidth for thickness
        ctx.beginPath();
        ctx.moveTo(prevSegment.x, prevSegment.y);
        ctx.lineTo(segment.x, segment.y);
        ctx.stroke();
    }

    // Draw head
    const head = segments[0];
    const next_seg = segments[1];
    ctx.fillStyle = '#38a3a5';
    ctx.beginPath();
    ctx.arc(head.x, head.y, head.size, 0, Math.PI * 2);
    ctx.fill();

    // Draw eyes
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
  ghost: (ctx, segments) => {
    if (segments.length === 0) return;
  
    // Set up properties for the ghost trail
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(236, 239, 241, 0.7)'; // White shadow for glow
    
    // Draw the tail with blur and decreasing opacity
    for (let i = segments.length - 1; i > 0; i--) {
      const segment = segments[i];
      const prevSegment = segments[i-1];
      const opacity = (i / segments.length) * 0.4; // Make it more transparent
      
      ctx.strokeStyle = `rgba(236, 239, 241, ${opacity})`;
      ctx.lineWidth = segment.size * 2;
      ctx.shadowBlur = segment.size * 2; // Add blur based on size
      
      ctx.beginPath();
      ctx.moveTo(prevSegment.x, prevSegment.y);
      ctx.lineTo(segment.x, segment.y);
      ctx.stroke();
    }
  
    // Reset shadow for the head
    ctx.shadowBlur = 0;

    // Draw head
    const head = segments[0];
    const next_seg = segments[1];
    ctx.fillStyle = 'rgba(236, 239, 241, 0.8)';
    ctx.beginPath();
    ctx.arc(head.x, head.y, head.size, 0, 2 * Math.PI);
    ctx.fill();
  
    // Draw eyes
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