function drawRotatedRectangle(ctx, centerX, centerY, width, height, angleInDegrees) {
    // Convertir l'angle en radians
    var angleInRadians = (angleInDegrees * Math.PI) / 180;

    // Calculer les coins du rectangle par rapport au centre
    var halfWidth = width / 2;
    var halfHeight = height / 2;

    var x1 = centerX - halfWidth;
    var y1 = centerY - halfHeight;

    var x2 = centerX + halfWidth;
    var y2 = centerY - halfHeight;

    var x3 = centerX + halfWidth;
    var y3 = centerY + halfHeight;

    var x4 = centerX - halfWidth;
    var y4 = centerY + halfHeight;

    // Rotation des coordonnées
    var rotatedX1 = centerX + (x1 - centerX) * Math.cos(angleInRadians) - (y1 - centerY) * Math.sin(angleInRadians);
    var rotatedY1 = centerY + (x1 - centerX) * Math.sin(angleInRadians) + (y1 - centerY) * Math.cos(angleInRadians);

    var rotatedX2 = centerX + (x2 - centerX) * Math.cos(angleInRadians) - (y2 - centerY) * Math.sin(angleInRadians);
    var rotatedY2 = centerY + (x2 - centerX) * Math.sin(angleInRadians) + (y2 - centerY) * Math.cos(angleInRadians);

    var rotatedX3 = centerX + (x3 - centerX) * Math.cos(angleInRadians) - (y3 - centerY) * Math.sin(angleInRadians);
    var rotatedY3 = centerY + (x3 - centerX) * Math.sin(angleInRadians) + (y3 - centerY) * Math.cos(angleInRadians);

    var rotatedX4 = centerX + (x4 - centerX) * Math.cos(angleInRadians) - (y4 - centerY) * Math.sin(angleInRadians);
    var rotatedY4 = centerY + (x4 - centerX) * Math.sin(angleInRadians) + (y4 - centerY) * Math.cos(angleInRadians);

    // Dessin du rectangle
    ctx.beginPath();
    ctx.moveTo(rotatedX1, rotatedY1);
    ctx.lineTo(rotatedX2, rotatedY2);
    ctx.lineTo(rotatedX3, rotatedY3);
    ctx.lineTo(rotatedX4, rotatedY4);
    ctx.closePath();
    ctx.stroke();
}


function animateRectangle(ctx, startX, startY, endX, endY, startAngle, endAngle, duration) {
    var startTime = null;

    function animate(currentTime) {
        if (!startTime) startTime = currentTime;

        var progress = (currentTime - startTime) / duration;
        if (progress > 1) progress = 1;

        var currentX = startX + (endX - startX) * progress;
        var currentY = startY + (endY - startY) * progress;
        var currentAngle = startAngle + (endAngle - startAngle) * progress;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        drawRotatedRectangle(ctx, currentX, currentY, 50, 30, currentAngle);

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}

