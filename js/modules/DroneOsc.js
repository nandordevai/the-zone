import { AudioModule} from './AudioModule.js';

export class DroneOsc extends AudioModule {
  constructor(ctx, freq = 55) {
    super(ctx, 'DroneOsc');

    // waveform
    const real = new Float32Array([0, 0, 0, 0, 0]);
    const imag = new Float32Array([0, 1, 0.5, 0.3, 0.2]);
    const droneWave = this.ctx.createPeriodicWave(real, imag);

    const detuneValues = [-10, 0, 10];

    detuneValues.forEach((offset, index) => {
      const osc = this.ctx.createOscillator();
      osc.setPeriodicWave(droneWave);
      osc.frequency.value = freq;
      osc.detune.value = offset; // cents

      const panner = this.ctx.createStereoPanner();

      const panLfo = this.ctx.createOscillator();
      const panLfoGain = this.ctx.createGain();

      panLfo.frequency.value = 0.05 + (index * 0.02);
      panLfoGain.gain.value = 1; // -1: left, 1: right

      panLfo.connect(panLfoGain);
      panLfoGain.connect(panner.pan);

      osc.connect(panner);
      panner.connect(this.output);

      panLfo.start();
      osc.start();
    });
  }
}