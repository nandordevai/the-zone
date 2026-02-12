export class AnimationState {
  constructor() {
    this.values = {
      terminalStream: 0,
      isGlitching: false,
      glitchLevel: 0,
    };
    this.listeners = [];
  }

  update(key, value) {
    this.values[key] = value;
    this.listeners.forEach(callback => callback(this.values));
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }
}