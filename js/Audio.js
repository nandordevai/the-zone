import { Clicker, Distortion, Drift, DroneOsc, Filter, NoiseOsc, Radio, Reverb } from './modules/index.js';

export class Audio {
  constructor(state, id) {
    this.state = state;
    this.initialized = false;
    this.el = document.getElementById(id);
    const button = this.el.querySelector('#audio-button');
    button.addEventListener('change', (e) => { this.onChange(e); });
    this.runningModules = [];
    this.state.subscribe((newState) => this.onStateChange(newState));
  }

  onStateChange(state) {
    if (!this.glitchNoise) return;

    this.glitchNoise.level = state.isGlitching ? 0.35 : 0;
  }

  async onChange(e) {
    if (!this.initialized) await this.initialize();

    this.soundChannel.gain.value = e.target.checked ? 0.5 : 0;
  }

  async initialize() {
    this.audioCtx = new AudioContext();

    this.effectChannel = this.audioCtx.createGain();
    this.effectChannel.gain.value = 0.5;
    this.effectChannel.connect(this.audioCtx.destination);

    this.soundChannel = this.audioCtx.createGain();
    this.soundChannel.gain.value = 0;
    this.soundChannel.connect(this.audioCtx.destination);

    const noiseFilter = new Filter(this.audioCtx);
    noiseFilter.frequency = 400;
    noiseFilter.Q = 10;

    const noiseFilterDrift = new Drift(this.audioCtx);
    noiseFilterDrift.level = 200;
    this.runningModules.push(noiseFilterDrift);
    noiseFilterDrift.connect(noiseFilter.filter.frequency);

    const noise = new NoiseOsc(this.audioCtx);
    noise.connect(noiseFilter);
    noiseFilter.connect(this.soundChannel);

    const drone = new DroneOsc(this.audioCtx);

    const droneFilter = new Filter(this.audioCtx);
    droneFilter.frequency = 800;
    droneFilter.Q = 10;
    drone.connect(droneFilter);

    const droneFilterDrift = new Drift(this.audioCtx);
    droneFilterDrift.level = 200;
    this.runningModules.push(droneFilterDrift);
    droneFilterDrift.connect(droneFilter.filter.frequency);

    const reverb = new Reverb(this.audioCtx);
    await reverb.loadIR('./audio/r1_ortf.wav');
    reverb.mix = 0.7;
    droneFilter.connect(reverb);
    reverb.connect(this.soundChannel);

    this.glitchNoise = new NoiseOsc(this.audioCtx);
    this.glitchNoise.level = 0;
    this.glitchNoise.connect(this.soundChannel);

    this.clicker = new Clicker(this.audioCtx);
    await this.clicker.load([
      './audio/click-on.wav',
      './audio/click-off.wav',
    ]);
    this.clicker.connect(this.effectChannel);
    this.runningModules.push(this.clicker);

    const distFilter = new Filter(this.audioCtx);
    distFilter.frequency = 600;
    distFilter.Q = 5;
    distFilter.connect(this.soundChannel);
    distFilter.gain = 0.5;

    const distortion = new Distortion(this.audioCtx);
    distortion.setAmount(100)
    distortion.connect(distFilter);

    const radioSamples = Array.from({ length: 3}, (_, i) => `./audio/radio${i + 1}.wav`)
      .concat(Array.from({ length: 8 }, (_, i) => `./audio/fx${i + 1}.wav`));
    this.radio = new Radio(this.audioCtx, radioSamples);
    this.radio.gain = 1;
    await this.radio.play();
    this.radio.connect(distortion);
    this.runningModules.push(this.radio);

    this.tick();
    this.initialized = true;
  }

  click(state) {
    if (!this.initialized) return;

    this.clicker?.play(state);
  }

  tick() {
    this.runningModules.forEach((module) => {
      module.update();
    });
    requestAnimationFrame(this.tick.bind(this));
  }
}