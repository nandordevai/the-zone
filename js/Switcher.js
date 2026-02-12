export class Switcher {
  constructor(state, id) {
    this.state = state;
    const el = document.getElementById(id);
    el.querySelectorAll('input').forEach((input) => {
      input.addEventListener('change', (e) => {
        state.update('terminalStream', e.target.value);
      });
    });
  }
}