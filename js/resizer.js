const callbacks = new WeakMap();
const timeouts = new WeakMap();

const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const callback = callbacks.get(entry.target);
    if (!callback) continue;

    clearTimeout(timeouts.get(entry.target));

    const timer = setTimeout(() => {
      callback(entry);
    }, 100);

    timeouts.set(entry.target, timer);
  }
});

export function observe(element, callback) {
  if (!(element instanceof Element)) return;
  callbacks.set(element, callback);
  observer.observe(element);
}

export function unobserve(element) {
  if (!element) return;
  clearTimeout(timeouts.get(element));
  callbacks.delete(element);
  timeouts.delete(element);
  observer.unobserve(element);
}