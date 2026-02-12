import { AudioModule } from './AudioModule.js';

export class Filter extends AudioModule {
  constructor(ctx, type = 'lowpass') {
    super(ctx, 'Filter');
    this.input = ctx.createGain();

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = type;
    this.filter.frequency.value = 1000;
    this.filter.Q.value = 1;

    this.input.connect(this.filter);
    this.filter.connect(this.output);
  }

  set frequency(value) {
    this.filter.frequency.value = value;
  }

  set Q(value) {
    this.filter.Q.value = value;
  }
}