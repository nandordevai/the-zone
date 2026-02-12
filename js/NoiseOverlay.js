export class NoiseOverlay {
  constructor(state, canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.scanlineWidth = 10;
    this.scanlinePos = -this.scanlineWidth;
    this.state = state;
    this.frameNum = 10;
    this.lowNoiseFrames = [];
    this.highNoiseFrames = [];
    this.currentFrameIndex = 0;
    this.generateFrames(this.lowNoiseFrames, 'low');
    this.generateFrames(this.highNoiseFrames, 'high');
  }

  generateFrames(frames, intensity) {
    for (let i = 0; i < this.frameNum; i++) {
      const offscreen = document.createElement('canvas');
      offscreen.width = this.canvas.width;
      offscreen.height = this.canvas.height;
      const oCtx = offscreen.getContext('2d');
      const imgData = oCtx.createImageData(offscreen.width, offscreen.height);
      for (let j = 0; j < imgData.data.length; j += 4) {
        let val = this.getNoiseValue(intensity);
        imgData.data[j] = imgData.data[j+1] = imgData.data[j+2] = val;
        imgData.data[j+3] = 255;
      }
      oCtx.putImageData(imgData, 0, 0);
      frames.push(offscreen);
    }
  }

  getNoiseValue(intensity) {
    let val = 10;
    if (Math.random() > 0.98 || intensity === 'high') {
        val = Math.random() * 120;
    }
    return val;
  }

  update(deltaTime) {
    this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frameNum;

    const pixelsPerSecond = 25;
    this.scanlinePos += pixelsPerSecond * deltaTime;
    if (this.scanlinePos > this.canvas.height) {
      this.scanlinePos = -this.scanlineWidth;
    }
  }

  render() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const frame = this.state.values.isGlitching ?
      this.highNoiseFrames[this.currentFrameIndex] :
      this.lowNoiseFrames[this.currentFrameIndex];
    const offset = Math.random() * 10 - 5;
    this.ctx.drawImage(frame, offset, offset, w, h);

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'darken';
    this.ctx.fillStyle = this.state.values.isGlitching ? 'oklch(0 0 0 / 0.25)' : 'oklch(0 0 0 / 1)';
    this.ctx.fillRect(0, this.scanlinePos, w, this.scanlineWidth);
    this.ctx.restore();
    this.ctx.fillStyle = 'oklch(1 0 0 / .15)';
    this.ctx.fillRect(0, this.scanlinePos, w, 1);
  }
}