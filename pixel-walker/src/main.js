import './game.css';
import versionText from '../../version.txt?raw';
import { Game, M } from './world.js';
import { createRenderer } from './renderer.js';
import { createInput } from './input.js';

const version = versionText.trim().replace('version=', '');
const icons = {
  sand: '<path d="M4 16h16L14 9l-2 3-2-5z"/><path d="M12 2v2M17 4v2M6 5v2"/>',
  water: '<path d="M12 2C9 7 5 10 5 14a7 7 0 0 0 14 0c0-4-4-7-7-12Z"/><path d="M8 14c0 2 1 3 3 3"/>',
  oil: '<path d="M12 2C9 7 5 10 5 14a7 7 0 0 0 14 0c0-4-4-7-7-12Z"/><path d="m8 14 4-3 4 3-4 3z"/>',
  fire: '<path d="M13 2c2 7-3 7-1 11 2-1 3-3 3-5 5 5 5 13-3 13C3 21 3 12 7 8c-1 4 2 5 2 2 0-3 3-5 4-8Z"/>',
  stone: '<path d="m7 4 9-1 5 8-4 9H5L2 11z"/><path d="m7 4 3 7 11 0M10 11l-5 9"/>',
  erase: '<path d="m14 3 7 7-10 10H6l-5-5z"/><path d="m6 10 8 8M11 20h11"/>',
  pause: '<path d="M8 5v14M16 5v14"/>', reset: '<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>',
  settings: '<path d="M3 7h18M3 17h18M8 3v8M16 13v8"/>',
  github: '<path d="M9 20c-5 1-5-3-7-3m14 6v-4c0-1-.4-2-1-2 4 0 7-2 7-6 0-2-1-3-2-4 0-1 0-3-1-4-2 0-3 1-4 1a12 12 0 0 0-6 0C8 3 7 2 5 2 4 3 4 5 5 7c-1 1-2 2-2 4 0 4 3 6 7 6-1 0-1 1-1 2v4"/>',
};
const svg = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] ?? ''}</svg>`;
const materials = [
  { name: 'Sand', key: 'sand', id: M.SAND, color: '#e5bb78', note: 'Falls, piles up, and makes a path.' },
  { name: 'Water', key: 'water', id: M.WATER, color: '#81cddd', note: 'Flows, carries you, and quenches fire.' },
  { name: 'Oil', key: 'oil', id: M.OIL, color: '#b9a3da', note: 'Floats on water. Keep it away from sparks.' },
  { name: 'Fire', key: 'fire', id: M.FIRE, color: '#f59770', note: 'A little spark can start a big reaction.' },
  { name: 'Stone', key: 'stone', id: M.STONE, color: '#b9c6bb', note: 'Build a ledge. Give your walker a way up.' },
  { name: 'Erase', key: 'erase', id: M.AIR, color: '#a6b7bc', note: 'Clear a path through anything you pour.' },
];

document.querySelector('#app').innerHTML = `
  <div class="gutter-art" aria-hidden="true"></div>
  <div class="site-signature"><span class="signature-mark">✧</span> RIVELLO <span class="muted">/</span> PLAY LAB</div>
  <aside class="gutter-copy left-copy" aria-label="About the game"><span class="eyebrow">AN EXPERIMENT IN SMALL THINGS</span><h2>A little world.<br>In your hands.</h2><p>A handful of sand. A spark of fire.<br>A new path waiting to happen.</p><div class="fine-rule"></div><span class="small-caption">POUR · EXPLORE · DISCOVER</span></aside>
  <main class="frame" aria-label="Pixel Walker game">
    <div id="content_layer"><canvas id="world" aria-label="Cavern. Hold and drag to pour the selected material." tabindex="0"></canvas></div>
    <div id="ui_layer">
      <header class="topbar"><div class="corner corner_top_left title-group"><img src="${import.meta.env.BASE_URL}art/lantern.svg" alt=""/><div><h1>Pixel Walker</h1><span>THE ALCHEMIST’S GARDEN</span></div></div><div class="corner corner_top_right top-actions"><button id="help" class="icon-button" aria-label="How to play" title="How to play">?</button><a class="icon-button" href="https://github.com/SamuelAsherRivello/babylon-lite-pixel-walker" aria-label="View source on GitHub" target="_blank" rel="noopener noreferrer">${svg('github')}</a></div></header>
      <nav class="materials" aria-label="Substances">${materials.map((m, i) => `<button class="material ${i === 0 ? 'selected' : ''}" data-material="${m.id}" aria-label="${m.name}" aria-pressed="${i === 0}" style="--material:${m.color}" title="${m.name} (${i + 1})">${svg(m.key)}<span>${m.name}</span></button>`).join('')}</nav>
      <div class="world-hud"><span id="seed-count" aria-label="Lantern seeds collected"><span class="seed-icon">✦</span> <b>0 / 3</b> <span class="hud-label">SEEDS</span></span><div class="health-wrap"><span aria-hidden="true">♡</span><meter id="health" min="0" max="100" value="100" aria-label="Walker health"></meter></div><span class="hud-tools"><button id="pause" class="icon-button" aria-label="Pause" title="Pause (P)">${svg('pause')}</button><button id="reset" class="icon-button" aria-label="Reset world" title="Reset world (R)">${svg('reset')}</button></span></div>
      <div id="toast" role="status" aria-live="polite">Find the 3 lantern seeds. Bring them home.</div>
      <div class="controller" aria-label="Virtual controller"><div class="dpad"><button data-control="up" aria-label="Jump or swim up" class="up">▲</button><button data-control="left" aria-label="Move left" class="left">◀</button><span class="dpad-center" aria-hidden="true">✧</span><button data-control="right" aria-label="Move right" class="right">▶</button><button data-control="down" aria-label="Swim down" class="down">▼</button></div><div class="pour-tip"><span id="selected-name">SAND</span><span>hold to pour</span><div class="brush-options" role="group" aria-label="Brush size"><button data-radius="2" aria-label="Small brush" aria-pressed="false">·</button><button data-radius="4" class="active" aria-label="Medium brush" aria-pressed="true">•</button><button data-radius="7" aria-label="Large brush" aria-pressed="false">●</button></div></div><button data-control="jump" class="jump" aria-label="Jump"><span>↑</span><small>JUMP</small></button></div>
      <footer class="frame-footer"><button id="settings" class="corner corner_bottom_left footer-button">${svg('settings')}<span>Settings</span></button><span class="performance"><i></i> <span id="fps">STARTING</span></span><span class="corner corner_bottom_right version">v${version}</span></footer>
      <div id="paused-label" hidden>PAUSED <small>P to resume</small></div>
      <div id="startup" class="screen"><div class="screen-inner"><span class="screen-glyph">✧</span><h2>Growing a little world…</h2><p>Preparing the cavern.</p></div></div>
      <div id="victory" class="screen" hidden><div class="screen-inner"><span class="screen-glyph">✦</span><span class="eyebrow">EXPEDITION COMPLETE</span><h2>The garden<br>is awake.</h2><p>Three small lights. A world of possibilities.</p><button id="keep-playing" class="primary">Keep experimenting</button><button id="replay" class="secondary">Begin a new expedition</button></div></div>
    </div><div class="frame-corners" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
  </main>
  <aside class="gutter-copy right-copy" aria-label="Field notes"><span class="eyebrow">FIELD NOTES / 01</span><h2>Everything<br>has a reaction.</h2><div class="notes"><p><span class="note-dot sand"></span>Sand becomes a stepping stone.</p><p><span class="note-dot water"></span>Water finds its own way.</p><p><span class="note-dot fire"></span>Oil remembers every spark.</p></div><div class="fine-rule"></div><p class="keyboard-hint"><kbd>A</kbd><kbd>D</kbd> move <span>·</span> <kbd>W</kbd> jump<br><span>Arrow keys work, too.</span></p></aside>
  <div class="site-footer">A FALLING-SAND PLAYGROUND <span>·</span> BUILT WITH BABYLON LITE</div>
  <dialog id="settings-dialog"><form method="dialog"><button class="dialog-close" aria-label="Close settings">×</button></form><span class="eyebrow">MAKE IT YOUR WORLD</span><h2>Settings</h2><label for="resolution">Particle resolution</label><select id="resolution"><option value="coarse">Coarse · 90 × 160 · fastest</option><option value="balanced" selected>Balanced · 180 × 320</option><option value="fine">Fine · 270 × 480 · more detail</option></select><p class="setting-note">Smaller grains make richer details, but need more processing. Changing resolution starts a fresh expedition.</p><button id="rescue" class="secondary">Rescue walker to the gate</button><button id="fullscreen" class="secondary">Enter fullscreen</button><p class="setting-note">Rendering: Babylon Lite / WebGPU<br>Simulation: fixed-step cellular materials</p></dialog>
  <dialog id="help-dialog"><form method="dialog"><button class="dialog-close" aria-label="Close how to play">×</button></form><span class="eyebrow">WELCOME, LITTLE WALKER</span><h2>Make your own way.</h2><p>Collect the <strong>three golden lantern seeds</strong>, then return to the gate at the bottom left. Or simply experiment.</p><dl><dt>Move</dt><dd>A / D or ← / →</dd><dt>Jump / swim</dt><dd>W, ↑, or Space. S / ↓ to dive.</dd><dt>Pour</dt><dd>Select a substance, then hold and drag in the cavern. Keys 1–6 select tools.</dd><dt>On touch</dt><dd>Use the directional pad and Jump. Another finger can pour at the same time.</dd><dt>Take a breath</dt><dd>P pauses. R resets. Settings has a rescue button if you get stuck.</dd></dl><p class="setting-note">Sand makes paths, water puts out fire, and oil floats and burns. You can erase stone to open new routes.</p></dialog>
`;

const $ = s => document.querySelector(s);
const game = new Game(), settings = { material: M.SAND, radius: 4 };
let selected = materials[0], renderer, input, raf, last = 0, accumulator = 0, ready = false, victoryShown = false;
let toastUntil = 0, fpsTime = 0, fpsFrames = 0, fps = 0;
function announce(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); toastUntil = performance.now() + 4500; }
function selectMaterial(index) {
  selected = materials[index]; settings.material = selected.id;
  for (const button of document.querySelectorAll('[data-material]')) { const active = +button.dataset.material === selected.id; button.classList.toggle('selected', active); button.setAttribute('aria-pressed', String(active)); }
  $('#selected-name').textContent = selected.name.toUpperCase(); $('#selected-name').style.color = selected.color; announce(selected.note);
}
function refreshPause() { $('#pause').setAttribute('aria-label', game.paused ? 'Resume' : 'Pause'); $('#pause').innerHTML = game.paused ? '▷' : svg('pause'); $('#paused-label').hidden = !game.paused || !!document.querySelector('dialog[open]'); }
function pause() { game.paused = !game.paused; input?.clear(); refreshPause(); }
function reset() { game.reset($('#resolution').value); input?.clear(); victoryShown = false; $('#victory').hidden = true; refreshPause(); announce('A fresh start. Find the 3 lantern seeds.'); }
function openDialog(id) { if (!ready) return; game.paused = true; input.clear(); $(id).showModal(); refreshPause(); }
function failure(error) {
  ready = false; cancelAnimationFrame(raf); input?.clear(); game.paused = true;
  const startup = $('#startup'); startup.hidden = false;
  startup.innerHTML = '<div class="screen-inner"><span class="screen-glyph">◇</span><h2>This world needs WebGPU.</h2><p id="error-detail"></p><button class="primary" id="retry">Try again</button></div>';
  $('#error-detail').textContent = error.message || 'The game could not start. Try reloading in a WebGPU-capable browser.';
  $('#retry').addEventListener('click', () => location.reload()); $('#fps').textContent = 'UNAVAILABLE'; document.body.dataset.state = 'error'; console.error(error);
}
for (const [i, button] of [...document.querySelectorAll('[data-material]')].entries()) button.addEventListener('click', () => selectMaterial(i));
for (const button of document.querySelectorAll('[data-radius]')) button.addEventListener('click', () => { settings.radius = +button.dataset.radius; for (const b of document.querySelectorAll('[data-radius]')) { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); } });
$('#pause').addEventListener('click', pause); $('#reset').addEventListener('click', reset); $('#replay').addEventListener('click', reset);
$('#keep-playing').addEventListener('click', () => { $('#victory').hidden = true; game.paused = false; refreshPause(); });
$('#settings').addEventListener('click', () => openDialog('#settings-dialog')); $('#help').addEventListener('click', () => openDialog('#help-dialog'));
for (const dialog of document.querySelectorAll('dialog')) dialog.addEventListener('close', () => { game.paused = false; input?.clear(); refreshPause(); });
$('#resolution').addEventListener('change', () => { reset(); game.paused = true; refreshPause(); announce('Resolution changed. Your expedition has restarted.'); });
$('#rescue').addEventListener('click', () => { game.rescue(); $('#settings-dialog').close(); });
$('#fullscreen').addEventListener('click', async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { announce('Fullscreen is unavailable in this browser.'); } });
document.addEventListener('fullscreenchange', () => { $('#fullscreen').textContent = document.fullscreenElement ? 'Exit fullscreen' : 'Enter fullscreen'; });
document.addEventListener('visibilitychange', () => { accumulator = 0; last = performance.now(); if (document.hidden && ready) { game.paused = true; refreshPause(); } });
window.addEventListener('blur', () => { if (ready) { game.paused = true; refreshPause(); } });
function frame(now) {
  if (!ready) return;
  try {
    const delta = Math.min((now - (last || now)) / 1000, 0.08); last = now;
    if (!document.hidden && !game.paused) { accumulator = Math.min(accumulator + delta, 4 / 60); while (accumulator >= 1 / 60) { game.step(input.read()); accumulator -= 1 / 60; } } else accumulator = 0;
    renderer.draw(game, input.cursor, selected.color, delta * 1000);
    fpsFrames++; fpsTime += delta;
    if (fpsTime >= 0.5) { fps = Math.round(fpsFrames / fpsTime); fpsFrames = 0; fpsTime = 0; $('#fps').textContent = `${fps} FPS · WEBGPU`; }
    $('#health').value = game.player.health; $('#seed-count b').textContent = `${game.collected} / 3`; $('#seed-count').setAttribute('aria-label', `${game.collected} of 3 lantern seeds collected`);
    if (game.events.length) announce(game.events.splice(0).at(-1));
    if (now > toastUntil) $('#toast').classList.remove('visible');
    if (game.won && !victoryShown) { victoryShown = true; game.paused = true; input.clear(); $('#victory').hidden = false; $('#keep-playing').focus(); refreshPause(); }
    raf = requestAnimationFrame(frame);
  } catch (error) { failure(error); }
}
async function boot() {
  try {
    renderer = await createRenderer($('#world'), failure);
    input = createInput($('#world'), document.querySelectorAll('[data-control]'), settings, code => { if (code === 'KeyP' || code === 'Escape') pause(); if (code === 'KeyR') reset(); if (/^Digit[1-6]$/.test(code)) selectMaterial(+code.at(-1) - 1); });
    renderer.draw(game, null, selected.color); ready = true; document.body.dataset.state = 'ready'; $('#startup').hidden = true; announce('Find the 3 lantern seeds. Bring them home.'); raf = requestAnimationFrame(frame);
  } catch (error) { failure(error); }
}
// Read-only diagnostics: browser tests exercise the real controls, not a cheat API.
Object.defineProperty(window, '__pixelWalker', { value: Object.freeze({ snapshot: () => ({ ...game.snapshot(), ready, fps, drawCalls: renderer?.drawCalls ?? 0, version }) }) });
window.addEventListener('pagehide', () => { cancelAnimationFrame(raf); input?.dispose(); renderer?.dispose(); });
boot();
