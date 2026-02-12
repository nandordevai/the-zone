import { AudioModule} from './AudioModule.js';

export class NoiseOsc extends AudioModule {
  constructor(ctx) {
    super(ctx, 'NoiseOsc');

    this.merger = ctx.createChannelMerger(2);
    const leftChannel = this.createNoiseSource();
    const rightChannel = this.createNoiseSource();
    leftChannel.connect(this.merger, 0, 0);
    rightChannel.connect(this.merger, 0, 1);
    this.merger.connect(this.output);
  }

  set level(value) {
    this.output.gain.value = value;
  }

  createNoiseSource() {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer
    source.loop = true;
    source.start();
    return source;
  }
}