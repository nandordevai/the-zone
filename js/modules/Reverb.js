import { AudioModule } from './AudioModule.js';

export class Reverb extends AudioModule {
  constructor(ctx) {
    super(ctx, 'Reverb');
    this.input = ctx.createGain();
    this.dryChannel = ctx.createGain();
    this.wetChannel = ctx.createGain();
    this.input.connect(this.dryChannel);
    this.dryChannel.connect(this.output);
  }

  async loadIR(irUrl) {
    const convolver = this.ctx.createConvolver();
    const response = await fetch(irUrl);
    const arrayBuffer = await response.arrayBuffer();
    convolver.buffer = await this.ctx.decodeAudioData(arrayBuffer);

    this.input.connect(convolver);
    convolver.connect(this.wetChannel);
    this.wetChannel.connect(this.output);
    this.mix = 0.5;
  }

  set mix(value) {
    const now = this.ctx.currentTime;
    this.wetChannel.gain.setTargetAtTime(value, now, 0.01);
    this.dryChannel.gain.setTargetAtTime(1 - value, now, 0.01);
  }
}