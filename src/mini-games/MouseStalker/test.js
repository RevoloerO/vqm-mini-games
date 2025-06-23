function draw() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ddd';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.translate(50, 50);

    //headshape
    ctx.strokeStyle = `hsl(130, 80%, 20%)`;
    ctx.fillStyle = `hsl(130, 70%, 50%)`;
    var cheekX = 7;
    var cheekY = -7;
    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.lineTo(19, -4);
    ctx.bezierCurveTo(cheekX - 2, cheekY + 3, cheekX + 2, cheekY - 4, 3, -10);
    ctx.quadraticCurveTo(1, -14, -2, -16 );
   
    ctx.lineTo(0, -10);
    ctx.quadraticCurveTo( -1, -12, -7, -13 );
    ctx.lineTo(-4, -9);

    ctx.quadraticCurveTo( -14, -12, -9, -3);
   // ctx.lineTo(-5, -15);

    ctx.lineTo(-10, 0);

    ctx.bezierCurveTo(-15, 16, 5, 18, 10, 0);
    ctx.fill();
    ctx.stroke();
    /*
    ctx.beginPath();
    ctx.moveTo(8, -5);
    ctx.lineTo(18, -3);
    ctx.lineTo(18, 3);
    ctx.lineTo(8, 5);
    ctx.fill();
    ctx.stroke();*/
    //
    
    // Draw eyes
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(-5, -10);
    ctx.quadraticCurveTo(0, -8, 4, -4);
    ctx.quadraticCurveTo(-2, -4, -5, -10);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-5, 10);
    ctx.quadraticCurveTo(0, 8, 4, 4);
    ctx.quadraticCurveTo(-2, 4, -5, 10);
    ctx.fill();
    // Draw pupils
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(0, -6, 1.5, 0, Math.PI * 2);
    ctx.arc(0, 6, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Draw swhiskers
    ctx.strokeStyle = `hsl(130, 40%, 30%)`;
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

    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(cheekX - 1.5, cheekY + 3.5, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(cheekX + 1.5, cheekY - 3.5, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

draw();