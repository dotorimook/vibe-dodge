export class Item {
  x: number = 0;
  y: number = 0;
  size: number;
  color: string;
  effect: string;
  duration: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.size = 6; // Half of the total size since we're drawing from center
    this.color = '#00aaff';
    this.effect = 'speed';
    this.duration = 5000; // 5 seconds

    // Random position within the canvas
    this.x = Math.random() * (canvasWidth - this.size * 4) + this.size * 2;
    this.y = Math.random() * (canvasHeight - this.size * 4) + this.size * 2;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Draw triangle (12x12 pixels total)
    ctx.beginPath();
    ctx.moveTo(0, -this.size); // Top point
    ctx.lineTo(-this.size, this.size); // Bottom left
    ctx.lineTo(this.size, this.size); // Bottom right
    ctx.closePath();
    
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
  }

  checkCollision(planeX: number, planeY: number, planeSize: number): boolean {
    const distance = Math.sqrt(
      Math.pow(this.x - planeX, 2) + Math.pow(this.y - planeY, 2)
    );
    return distance < (this.size + planeSize/2);
  }

  applyEffect(plane: { x: number; y: number; size: number; applySpeedBoost: (duration: number, currentTime: number) => void }, currentTime: number): boolean {
    if (this.checkCollision(plane.x, plane.y, plane.size)) {
      plane.applySpeedBoost(this.duration, currentTime);
      return true; // Item was collected
    }
    return false; // Item was not collected
  }

  static checkItemsCollision(items: Item[], plane: { x: number; y: number; size: number; applySpeedBoost: (duration: number, currentTime: number) => void }, currentTime: number): Item[] {
    return items.filter(item => !item.applyEffect(plane, currentTime));
  }
} 