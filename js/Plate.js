import { observe } from './resizer.js'

export class Plate {
  constructor(id) {
    this.canvas = document.getElementById(id);
    this.isMobile = this.canvas.width > this.canvas.height;
    this.ctx = this.canvas.getContext('2d');
    this.needsUpdate = true;
    this.screwSize = this.isMobile ? 5 : 7;
    this.dpr = devicePixelRatio ?? 1;

    const parent = this.canvas.parentNode;
    this.newWidth = Math.round(parent.clientWidth * this.dpr);
    this.newHeight = Math.round(parent.clientHeight * this.dpr);
    this.setSize();

    observe(this.canvas, (entry) => {
      this.handleResize(entry.contentRect);
    });
  }

  handleResize(rect) {
    const { width, height } = rect;
    const newWidth = Math.round(width * this.dpr);
    const newHeight = Math.round(height * this.dpr);
    if (
      this.canvas.width !== newWidth ||
      this.canvas.height !== newHeight
    ) {
      this.newWidth = newWidth;
      this.newHeight = newHeight;
      this.needsUpdate = true;
    }
  }

  setSize() {
    if (!this.newWidth && !this.newHeight) return;

    this.canvas.width = this.newWidth;
    this.canvas.height = this.newHeight;

    this.ctx.resetTransform();
    this.ctx.scale(this.dpr, this.dpr);

    this.newWidth = null;
    this.newHeight = null;
  }

  get w() {
    return this.canvas.width / this.dpr;
  }

  get h() {
    return this.canvas.height / this.dpr;
  }

  render() {
    this.setSize()

    // base metal
    const metalGrad = this.ctx.createLinearGradient(0, 0, this.w, this.h);
    metalGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    metalGrad.addColorStop(0.5, 'rgba(1, 1, 1, 1)');
    metalGrad.addColorStop(1, 'rgba(2, 2, 2, 1)');
    this.ctx.fillStyle = metalGrad;
    this.ctx.fillRect(0, 0, this.w, this.h);

    // grime & scratches
    this.drawChippedPaint('rgba(70, 70, 70, 0.5)');
    this.drawGrime(30);
    this.drawPitting(150);
    this.drawScratches(100);

    // light reflection
    const lightGrad = this.ctx.createLinearGradient(0, 0, this.w, this.h);
    lightGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0)');
    lightGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.1)');
    lightGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
    lightGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.1)');
    lightGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0)');

    this.ctx.globalCompositeOperation = 'screen'; // brightens the colors underneath
    this.ctx.fillStyle = lightGrad;
    this.ctx.fillRect(0, 0, this.w, this.h);
    this.ctx.globalCompositeOperation = 'source-over';

    // text label
    this.drawStampedText({
      text: 'K-5247',
      x: this.w / 2,
      y: this.h - 10,
      size: 10,
      align: 'center',
    });

    // screws
    const padding = 11;
    this.drawScrew(padding, padding);
    this.drawScrew(this.w - padding, padding);
    this.drawScrew(padding, this.h - padding);
    this.drawScrew(this.w - padding, this.h - padding);

    // grime & oxidation
    this.ctx.globalCompositeOperation = 'multiply';
    this.ctx.fillStyle = 'rgba(70, 70, 70, 0.2)';
    this.ctx.fillRect(0, 0, this.w, this.h);
    this.needsUpdate = false;
  }

  drawChippedPaint(color) {
    this.ctx.save();

    // draw the full paint layer first
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.w, this.h);

    // create chips by erasing parts of the paint
    this.ctx.globalCompositeOperation = 'destination-out';

    for (let i = 0; i < 40; i++) {
      const x = Math.random() * this.w;
      const y = Math.random() * this.h;
      const size = Math.random() * 20 + 5;

      this.ctx.beginPath();
      // jagged edges
      this.ctx.moveTo(x, y);
      for (let j = 0; j < 4; j++) {
        this.ctx.lineTo(x + Math.random() * size, y + Math.random() * size);
      }
      this.ctx.closePath();
      this.ctx.fill();
    }

    // edge wear
    this.ctx.lineWidth = 2.5;
    this.ctx.strokeRect(0, 0, this.w, this.h);

    this.ctx.restore();
  }

  drawGrime(patchCount) {
    for (let i = 0; i < patchCount; i++) {
      const x = Math.random() * this.w;
      const y = Math.random() * this.h;
      const radius = Math.random() * 50 + 50;
      const color = `rgba(0, 0, 0, ${Math.random() * 0.2})`;

      const g = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
      g.addColorStop(0, color);
      g.addColorStop(0.6, color.replace(/[\d.]+\)$/g, '0)')); // fade out

      this.ctx.globalCompositeOperation = 'multiply';
      this.ctx.fillStyle = g;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalCompositeOperation = 'source-over';
  }

  drawPitting(count) {
    for (let i = 0; i < count; i++) {
      this.ctx.fillStyle = `rgba(60, 60, 60, ${Math.random() * 0.25})`;
      this.ctx.beginPath();
      this.ctx.arc(Math.random() * this.w, Math.random() * this.h, Math.random() * 3, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  drawScratches(count) {
    for (let i = 0; i < count; i++) {
      this.ctx.beginPath();
      const sx = Math.random() * this.w;
      const sy = Math.random() * this.h;
      const len = Math.random() * 3 + 1;
      const angle = (Math.random() - 0.5) * 2;

      this.ctx.moveTo(sx, sy);
      this.ctx.lineTo(sx + len, sy + (len * angle));

      const depth = Math.random();
      if (depth > 0.8) {
        this.ctx.strokeStyle = 'rgba(200, 200, 200, 0.15)';
        this.ctx.lineWidth = 0.8;
      } else {
        this.ctx.strokeStyle = 'rgba(120, 120, 120, 0.10)';
        this.ctx.lineWidth = 0.5;
      }
      this.ctx.stroke();
    }
  }

  drawStampedText({ text, x, y, size, align = 'center' }) {
    this.ctx.textAlign = align;
    this.ctx.font = `bold ${size}px 'Courier New', monospace`;
    const textWidth = this.ctx.measureText(text).width;
    let curX = align === 'center' ? x - textWidth / 2 : x;
    text.split('').forEach(char => {
      this.ctx.save();
      this.ctx.translate(curX, y + (Math.random() - 0.25));
      this.ctx.rotate((Math.random() - 0.5) * 0.05);
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillText(char, 1, 1);
      this.ctx.fillStyle = 'rgba(120, 120, 120, 0.75)';
      this.ctx.fillText(char, 0, 0);
      this.ctx.restore();
      curX += size * 0.65;
    });
  }

  drawScrew(x, y) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(Math.random() * Math.PI);

    const g = this.ctx.createRadialGradient(-2, -2, 1, 0, 0, this.screwSize);
    g.addColorStop(0, 'rgba(120, 120, 120, 1)');
    g.addColorStop(1, 'rgba(15, 15, 15, 1)');
    this.ctx.fillStyle = g;

    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.screwSize, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    this.ctx.lineWidth = 2;

    const l = this.isMobile ? 1 : 3;
    this.ctx.beginPath();
    this.ctx.moveTo(-this.screwSize + l, 0);
    this.ctx.lineTo(this.screwSize - l, 0);
    this.ctx.stroke();
    this.ctx.restore();
  }
}