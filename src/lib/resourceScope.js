export function createScope() {
  let active = true;
  const cleanups = [], timers = new Set(), frames = new Set();
  const api = {
    get active() { return active },
    on(target, event, handler, options) {
      target.addEventListener(event, handler, options);
      cleanups.push(() => target.removeEventListener(event, handler, options));
    },
    timeout(handler, ms) {
      const id = setTimeout(() => { timers.delete(id); if (active) handler() }, ms);
      timers.add(id); return id;
    },
    clearTimeout(id) { clearTimeout(id); timers.delete(id) },
    frame(handler) {
      const id = requestAnimationFrame(t => { frames.delete(id); if (active) handler(t) });
      frames.add(id); return id;
    },
    cancelFrame(id) { cancelAnimationFrame(id); frames.delete(id) },
    observer(Type, handler, options) {
      const observer = new Type((...args) => { if (active) handler(...args) }, options);
      cleanups.push(() => observer.disconnect()); return observer;
    },
    dispose() {
      active = false; cleanups.splice(0).forEach(fn => fn());
      timers.forEach(clearTimeout); frames.forEach(cancelAnimationFrame);
      timers.clear(); frames.clear();
    }
  };
  return api;
}
