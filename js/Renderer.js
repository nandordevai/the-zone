export class Renderer {
  constructor() {
    this.components = [];
    this.lastTime = null;
  }

  register(component) {
    this.components.push(component);
  }

  start() {
    requestAnimationFrame(this.loop.bind(this));
  }

  loop(timestamp) {
    if (this.lastTime === null) {
      this.lastTime = timestamp;
      requestAnimationFrame(this.loop.bind(this));
      return;
    }

    const diff = timestamp - this.lastTime;
    const deltaTime = diff / 1000;
    const cappedDelta = Math.min(deltaTime, 0.1);
    this.lastTime = timestamp;

    this.components.forEach(comp => {
      if (comp.needsUpdate ?? true) {
        comp.update?.(cappedDelta);
        comp.render?.();
      }
    });

    requestAnimationFrame(this.loop.bind(this));
  }
}