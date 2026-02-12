import { AudioModule } from './AudioModule.js';

export class Radio extends AudioModule {
  constructor(ctx, clips) {
    super(ctx, 'Radio');
    this.clips = clips;
    this.buffers = [];
    this.waitBetweenSamples = 0;
    this.startNextAt = ctx.currentTime + Math.random() * 5 + 5;
    this.index = 0;
    this.playing = false;
  }

  async play() {
    if (this.buffers.length === 0) {
      this.clips.forEach(async (url) => {
        let response = await fetch(url);
        let arrayBuffer = await response.arrayBuffer();
        const buffer = await this.ctx.decodeAudioData(arrayBuffer);
        this.buffers.push(buffer);
      });
      this.index = Math.floor(Math.random() * this.buffers.length);
    }
    this.buffers = this.shuffle(this.buffers);
  }

  // Fisher-Yates algorithm
  shuffle(items) {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  update() {
    if (this.buffers.length === 0 || this.playing) return;

    if (this.startNextAt > this.ctx.currentTime) return;

    const source = this.ctx.createBufferSource();
    source.buffer = this.buffers[this.index];
    source.connect(this.output);
    source.start(this.ctx.currentTime);
    this.playing = true;
    source.onended = () => {
      this.playing = false;
      this.startNextAt = this.ctx.currentTime + Math.random() * 5 + 5;
      this.index = this.index + 1;
      if (this.index >= this.buffers.length) {
        this.index = 0;
        this.shuffle();
      }
    }
  }
}