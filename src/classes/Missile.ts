export class Missile {
  x: number = 0;
  y: number = 0;
  size: number = 3;
  fillColor: string = '#ffff00';
  strokeColor: string = '#ff0000';
  speed: number = 0;
  dx: number = 0;
  dy: number = 0;

  constructor(canvasWidth: number, canvasHeight: number, stage: number = 1) {
    // Calculate base speed with stage increase
    // Start with base speed of 0.5 and increase by 0.5 per stage
    const baseSpeed = 0.5 + ((stage - 1) * 0.5);
    // Add small random variation (±0.2)
    const speedVariation = (Math.random() - 0.5) * 0.4;
    this.speed = baseSpeed + speedVariation;

    // Randomly choose which edge to spawn from
    const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    
    // Calculate center of canvas
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    switch (edge) {
      case 0: // top
        this.x = Math.random() * canvasWidth;
        this.y = -this.size;
        break;
      case 1: // right
        this.x = canvasWidth + this.size;
        this.y = Math.random() * canvasHeight;
        break;
      case 2: // bottom
        this.x = Math.random() * canvasWidth;
        this.y = canvasHeight + this.size;
        break;
      case 3: // left
        this.x = -this.size;
        this.y = Math.random() * canvasHeight;
        break;
    }

    // Calculate direction towards center
    const angle = Math.atan2(centerY - this.y, centerX - this.x);
    this.dx = Math.cos(angle) * this.speed;
    this.dy = Math.sin(angle) * this.speed;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.fillColor;
    ctx.strokeStyle = this.strokeColor;
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  isOutOfBounds(canvasWidth: number, canvasHeight: number): boolean {
    return (
      this.x < -this.size * 2 ||
      this.x > canvasWidth + this.size * 2 ||
      this.y < -this.size * 2 ||
      this.y > canvasHeight + this.size * 2
    );
  }
} 