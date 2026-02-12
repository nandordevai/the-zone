export class Glitch {
  constructor(state) {
    this.state = state;
    this.state.update('glitchLevel', 0);
    this.glitchElements = document.querySelectorAll('.glitch');
  }

  update(_deltaTime) {
    let level = this.lfo(0.1, 0.9, 0, true);
    const jitter = (Math.random() - 0.5) * 0.2;
    level += jitter;
    this.state.update('glitchLevel', level);
    if (this.state.values.glitchLevel > 0.9) {
      this.triggerRandomGlitch();
    }
  }

  lfo(freq = 1, amp = 1, offset = 0, unipolar = false) {
    const t = Date.now() / 1000;
    let wave = Math.sin(2 * Math.PI * freq * t);
    if (unipolar) {
      wave = (wave + 1) * 0.5;
    }
    return offset + (wave * amp);
  }


  triggerRandomGlitch() {
    this.state.update('isGlitching', true);

    this.glitchElements.forEach(el => el.classList.add('heavy-glitch'));

    setTimeout(() => {
    this.glitchElements.forEach(el => el.classList.remove('heavy-glitch'));
      this.state.update('isGlitching', false);
    }, 200 + Math.random() * 600);
  }
}