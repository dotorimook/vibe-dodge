export class Plane {
  x: number;
  y: number;
  size: number;
  color: string;
  private flameAnimation: number;
  speed: number;
  baseSpeed: number;
  isSpeedBoosted: boolean;
  speedBoostEndTime: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.size = 24;
    this.color = 'white';
    this.flameAnimation = 0;
    this.baseSpeed = 5;
    this.speed = this.baseSpeed;
    this.isSpeedBoosted = false;
    this.speedBoostEndTime = 0;
    // Initialize at center of canvas
    this.x = canvasWidth / 2 - this.size / 2;
    this.y = canvasHeight / 2 - this.size / 2;
  }

  move(dx: number, dy: number) {
    this.x += dx;
    this.y += dy;
    // Update flame animation
    this.flameAnimation = (this.flameAnimation + 0.1) % 1;
  }

  update(currentTime: number) {
    if (this.isSpeedBoosted && currentTime > this.speedBoostEndTime) {
      this.speed = this.baseSpeed;
      this.isSpeedBoosted = false;
    }
  }

  applySpeedBoost(duration: number, currentTime: number) {
    this.speed = this.baseSpeed * 1.5; // 50% speed increase
    this.isSpeedBoosted = true;
    this.speedBoostEndTime = currentTime + duration;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x + this.size/2, this.y + this.size/2);
    
    // Draw main body (cute rounded shape)
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(0, -this.size/2); // Nose
    ctx.quadraticCurveTo(this.size/2, -this.size/4, this.size/3, 0); // Right curve
    ctx.lineTo(this.size/3, this.size/3); // Right body
    ctx.quadraticCurveTo(0, this.size/2, -this.size/3, this.size/3); // Bottom curve
    ctx.lineTo(-this.size/3, 0); // Left body
    ctx.quadraticCurveTo(-this.size/2, -this.size/4, 0, -this.size/2); // Left curve
    ctx.closePath();
    ctx.fill();
    
    // Draw wings
    ctx.fillStyle = '#f0f0f0'; // Slightly off-white for wings
    // Right wing
    ctx.beginPath();
    ctx.moveTo(this.size/3, 0);
    ctx.lineTo(this.size/2, -this.size/6);
    ctx.lineTo(this.size, 0);
    ctx.lineTo(this.size/2, this.size/6);
    ctx.closePath();
    ctx.fill();
    // Left wing
    ctx.beginPath();
    ctx.moveTo(-this.size/3, 0);
    ctx.lineTo(-this.size/2, -this.size/6);
    ctx.lineTo(-this.size, 0);
    ctx.lineTo(-this.size/2, this.size/6);
    ctx.closePath();
    ctx.fill();
    
    // Draw cockpit
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(0, -this.size/6, this.size/4, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw cute eyes
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(-this.size/6, -this.size/6, this.size/8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.size/6, -this.size/6, this.size/8, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw pupils
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(-this.size/6, -this.size/6, this.size/16, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.size/6, -this.size/6, this.size/16, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw weapon ports
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(-this.size/3, this.size/4, this.size/8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.size/3, this.size/4, this.size/8, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw animated engine flame
    const flameHeight = this.size/2 + this.size/2 * (0.5 + Math.sin(this.flameAnimation * Math.PI * 2) * 0.2);
    const flameWidth = this.size/3 * (0.8 + Math.cos(this.flameAnimation * Math.PI * 4) * 0.2);
    
    // Outer flame (orange)
    const outerGradient = ctx.createLinearGradient(0, this.size/2, 0, this.size/2 + flameHeight);
    outerGradient.addColorStop(0, '#ff4500');
    outerGradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
    ctx.fillStyle = outerGradient;
    ctx.beginPath();
    ctx.moveTo(-flameWidth, this.size/2);
    ctx.lineTo(0, this.size/2 + flameHeight);
    ctx.lineTo(flameWidth, this.size/2);
    ctx.closePath();
    ctx.fill();
    
    // Inner flame (yellow)
    const innerGradient = ctx.createLinearGradient(0, this.size/2, 0, this.size/2 + flameHeight * 0.8);
    innerGradient.addColorStop(0, '#ffff00');
    innerGradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
    ctx.fillStyle = innerGradient;
    ctx.beginPath();
    ctx.moveTo(-flameWidth * 0.6, this.size/2);
    ctx.lineTo(0, this.size/2 + flameHeight * 0.8);
    ctx.lineTo(flameWidth * 0.6, this.size/2);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }

  checkCollision(missileX: number, missileY: number, missileSize: number): boolean {
    // Simple circle-rectangle collision detection
    const planeCenterX = this.x + this.size/2;
    const planeCenterY = this.y + this.size/2;
    const missileCenterX = missileX + missileSize/2;
    const missileCenterY = missileY + missileSize/2;

    const distance = Math.sqrt(
      Math.pow(planeCenterX - missileCenterX, 2) + 
      Math.pow(planeCenterY - missileCenterY, 2)
    );

    return distance < (this.size/2 + missileSize/2);
  }
} 