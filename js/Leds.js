export class Leds {
  constructor(state, id) {
    this.state = state;
    this.row = document.getElementById(id);
    this.leds = Array.from(this.row.children);
  }

  update() {
    const level = this.state.values.glitchLevel;

    for (let i = 0; i < this.leds.length; i++) {
      if (level > i * 0.2) {
        this.leds[i].style.setProperty('--level', 0.6);
      } else if (level < (i + 1) * 0.2) {
        this.leds[i].style.setProperty('--level', 0.1);
      } else {
        this.leds[i].style.setProperty('--level', level);
      }
    }
  }
}