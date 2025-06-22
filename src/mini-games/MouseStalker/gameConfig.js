// /src/components/MouseStalker/gameConfig.js

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
  default: (ctx, segments, targetPos) => {
    const head = segments[0];
    if (!head) return;
    for (let i = 1; i < segments.length; i++) {
        const segment = segments[i];
        const percent = (segments.length - i) / segments.length;
        const colorLightness = 50 + percent * 20;
        ctx.fillStyle = `hsl(130, 70%, ${colorLightness}%)`;
        ctx.beginPath();
        ctx.arc(segment.x, segment.y, segment.size, 0, Math.PI * 2);
        ctx.fill();
    }
    const angle = Math.atan2(targetPos.y - head.y, targetPos.x - head.x);
    const headScale = head.size / 8;
    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(angle);
    ctx.scale(headScale, headScale);
    ctx.strokeStyle = `hsl(130, 80%, 20%)`;
    ctx.lineWidth = 2 / headScale;
    ctx.fillStyle = `hsl(130, 70%, 50%)`;
    const leaves = 5;
    for (let i = 0; i < leaves; i++) {
        const leafAngle = (i - (leaves - 1) / 2) * 0.5;
        ctx.save();
        ctx.rotate(leafAngle);
        ctx.beginPath();
        ctx.moveTo(-12, -15);
        ctx.quadraticCurveTo(0, -25, 12, -15);
        ctx.quadraticCurveTo(0, -20, -12, -15);
        ctx.fill();
        ctx.restore();
    }
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.bezierCurveTo(5, -18, -15, -16, -10, 0);
    ctx.bezierCurveTo(-15, 16, 5, 18, 10, 0);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, -5);
    ctx.lineTo(18, -3);
    ctx.lineTo(18, 3);
    ctx.lineTo(8, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = `hsl(130, 60%, 40%)`;
    ctx.beginPath();
    ctx.moveTo(-5, -8);
    ctx.bezierCurveTo(-10, -15, -5, -20, 0, -18);
    ctx.closePath();
    ctx.fill();
    ctx.moveTo(-5, 8);
    ctx.bezierCurveTo(-10, 15, -5, 20, 0, 18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(5, -10);
    ctx.quadraticCurveTo(0, -8, -4, -4);
    ctx.quadraticCurveTo(2, -4, 5, -10);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(5, 10);
    ctx.quadraticCurveTo(0, 8, -4, 4);
    ctx.quadraticCurveTo(2, 4, 5, 10);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(0, -6, 1.5, 0, Math.PI * 2);
    ctx.arc(0, 6, 1.5, 0, Math.PI * 2);
    ctx.fill();
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
  snake: (ctx, segments) => {
    if (segments.length === 0) return;

    // Draw body
    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i];
      const prevSegment = segments[i - 1];
      const gradient = ctx.createLinearGradient(prevSegment.x, prevSegment.y, segment.x, segment.y);
      gradient.addColorStop(0, '#38a3a5');
      gradient.addColorStop(1, '#57cc99');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(segment.x, segment.y, segment.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw head
    const head = segments[0];
    ctx.fillStyle = '#38a3a5';
    ctx.beginPath();
    ctx.arc(head.x, head.y, head.size, 0, Math.PI * 2);
    ctx.fill();

    // Draw eyes
    const angle = Math.atan2(segments[1].y - head.y, segments[1].x - head.x);
    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(angle + Math.PI); // Rotate to face forward
    
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
  
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  
    for (let i = segments.length - 1; i > 0; i--) {
      const segment = segments[i];
      const prevSegment = segments[i-1];
      const opacity = (i / segments.length) * 0.5;
      
      ctx.strokeStyle = `rgba(236, 239, 241, ${opacity})`;
      ctx.lineWidth = segment.size * 2;
      ctx.beginPath();
      ctx.moveTo(prevSegment.x, prevSegment.y);
      ctx.lineTo(segment.x, segment.y);
      ctx.stroke();
    }
  
    // Draw head
    const head = segments[0];
    ctx.fillStyle = 'rgba(236, 239, 241, 0.8)';
    ctx.beginPath();
    ctx.arc(head.x, head.y, head.size, 0, 2 * Math.PI);
    ctx.fill();
  
    // Draw eyes
    const angle = Math.atan2(segments[1].y - head.y, segments[1].x - head.x);
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