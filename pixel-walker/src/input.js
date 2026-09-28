import { WIDTH, HEIGHT } from './world.js';

export function createInput(canvas, controls, settings, onShortcut) {
  const keys = new Set(), touches = new Map(), pours = new Map();
  const abort = new AbortController(), signal = abort.signal;
  let cursor = null;
  const movement = new Set(['KeyA', 'KeyD', 'KeyW', 'KeyS', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space']);
  const point = e => { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * WIDTH, y: (e.clientY - r.top) / r.height * HEIGHT, radius: settings.radius }; };
  function clear() {
    keys.clear(); touches.clear(); pours.clear(); cursor = null;
    for (const button of controls) button.classList.remove('held');
  }
  window.addEventListener('keydown', e => {
    if (e.target.matches('input, select, textarea') || document.querySelector('dialog[open]')) return;
    if (movement.has(e.code)) { e.preventDefault(); keys.add(e.code); }
    if (!e.repeat && !movement.has(e.code)) onShortcut(e.code);
  }, { signal });
  window.addEventListener('keyup', e => { keys.delete(e.code); }, { signal });
  window.addEventListener('blur', clear, { signal });
  document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); }, { signal });
  for (const button of controls) {
    button.addEventListener('pointerdown', e => {
      e.preventDefault(); button.setPointerCapture(e.pointerId); touches.set(e.pointerId, button.dataset.control); button.classList.add('held');
    }, { signal });
    const release = e => { touches.delete(e.pointerId); if (![...touches.values()].includes(button.dataset.control)) button.classList.remove('held'); };
    for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(event, release, { signal });
  }
  canvas.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    e.preventDefault(); canvas.setPointerCapture(e.pointerId); cursor = point(e); pours.set(e.pointerId, { ...cursor });
  }, { signal });
  canvas.addEventListener('pointermove', e => { cursor = point(e); if (pours.has(e.pointerId)) pours.set(e.pointerId, { ...cursor }); }, { signal });
  const stop = e => { pours.delete(e.pointerId); if (e.pointerType === 'touch') cursor = null; };
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(event, stop, { signal });
  canvas.addEventListener('pointerleave', () => { if (!pours.size) cursor = null; }, { signal });
  canvas.addEventListener('contextmenu', e => e.preventDefault(), { signal });
  const held = name => [...touches.values()].includes(name);
  return {
    clear,
    get cursor() { return cursor && { ...cursor, radius: settings.radius }; },
    read() {
      return {
        axis: Number(keys.has('KeyD') || keys.has('ArrowRight') || held('right')) - Number(keys.has('KeyA') || keys.has('ArrowLeft') || held('left')),
        jump: keys.has('KeyW') || keys.has('ArrowUp') || keys.has('Space') || held('jump') || held('up'),
        down: keys.has('KeyS') || keys.has('ArrowDown') || held('down'),
        pours: [...pours.values()].map(p => ({ ...p, radius: settings.radius, material: settings.material })),
      };
    },
    dispose() { clear(); abort.abort(); },
  };
}
