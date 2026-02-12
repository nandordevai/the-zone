import { AudioModule } from './AudioModule.js';

export class Clicker extends AudioModule {
  constructor(ctx) {
    super(ctx, 'Clicker');
    this.playing = false;
    this.queuedSounds = [];
  }

  async load([on, off]) {
    let response = await fetch(on);
    let arrayBuffer = await response.arrayBuffer();
    this.onBuffer = await this.ctx.decodeAudioData(arrayBuffer);
    response = await fetch(off);
    arrayBuffer = await response.arrayBuffer();
    this.offBuffer = await this.ctx.decodeAudioData(arrayBuffer);
  }

  play(state) {
    this.queuedSounds.push(state);
  }

  update() {
    if (
      this.playing ||
      this.queuedSounds.length === 0 ||
      (!this.onBuffer || !this.offBuffer)
    ) return;

    const sample = this.queuedSounds.shift();

    const source = this.ctx.createBufferSource();
    source.buffer = sample === 'on' ? this.onBuffer : this.offBuffer;
    source.connect(this.output);
    source.start(this.ctx.currentTime);
    this.playing = true;
    source.onended = () => {
      this.playing = false;
    }
  }
}