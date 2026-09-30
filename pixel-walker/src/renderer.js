import {
  createEngine, createDynamicTexture, updateDynamicTexture, createGridSpriteAtlas,
  createSprite2DLayer, addSprite2D, updateSprite2D, createSpriteRenderer,
  registerSpriteRenderer, renderFrame, resizeEngine, disposeSpriteRenderer, disposeSpriteAtlas,
  disposeEngine, enableDeviceLostSpriteRecovery,
} from '@babylonjs/lite';
import { M, WIDTH, HEIGHT, PLATFORMS, PORTAL, seededRandom } from './world.js';

const COLORS = [null, [43, 57, 61], [227, 180, 96], [52, 158, 196], [119, 95, 158], [255, 140, 59], [153, 213, 206], [93, 103, 113]];
function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

function buildBackground() {
  const canvas = makeCanvas(540, 960), ctx = canvas.getContext('2d');
  ctx.scale(3, 3);
  const grad = ctx.createLinearGradient(0, 45, 0, 280);
  grad.addColorStop(0, '#13262e'); grad.addColorStop(0.6, '#1b353a'); grad.addColorStop(1, '#0e2027');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 180, 320);
  const rng = seededRandom(138);
  // Weathered vaulted halls, distant roots, and hanging limestone.
  for (let i = 0; i < 18; i++) {
    const x = Math.floor(rng() * 180), y = 40 + rng() * 210, h = 22 + rng() * 65;
    ctx.fillStyle = i % 2 ? '#213b3f' : '#192f35';
    ctx.fillRect(x, y, 7 + rng() * 7, h);
    ctx.fillStyle = '#294246'; ctx.fillRect(x, y, 2, h);
    ctx.fillStyle = '#10252d'; ctx.fillRect(x + 3, y + 4, 3, h - 4);
  }
  for (const [x, y] of [[35, 85], [106, 159], [133, 240]]) {
    ctx.fillStyle = '#12282f'; ctx.fillRect(x - 12, y, 24, 42);
    ctx.beginPath(); ctx.arc(x, y, 12, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = '#2b4547'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 14, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = '#244045'; ctx.fillRect(x - 16, y, 3, 43); ctx.fillRect(x + 13, y, 3, 43);
  }
  for (let i = 0; i < 55; i++) {
    const x = rng() * 180 | 0, y = 57 + (rng() * 207 | 0);
    ctx.fillStyle = '#294044'; ctx.fillRect(x, y, 2 + (rng() * 6 | 0), 1);
  }
  for (const x of [9, 49, 120, 168]) {
    const length = 15 + rng() * 30;
    ctx.strokeStyle = '#24453e'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, 53); ctx.lineTo(x + 2, 53 + length); ctx.stroke();
    for (let y = 58; y < 53 + length; y += 5) { ctx.fillStyle = '#3a6655'; ctx.fillRect(x - 2, y, 4, 2); }
  }
  return canvas;
}

export async function createRenderer(canvas, onFailure) {
  if (!navigator.gpu) throw new Error('WebGPU is unavailable. Open Pixel Walker in a current Chrome or Edge browser with hardware acceleration enabled.');
  let engine;
  try { engine = await createEngine(canvas, { maxDevicePixelRatio: 1, msaaSamples: 1 }); }
  catch (error) { throw new Error('No usable WebGPU graphics device was found. Try a current Chrome or Edge browser with hardware acceleration enabled, then reload.', { cause: error }); }
  const surface = makeCanvas(540, 960), ctx = surface.getContext('2d');
  const background = buildBackground();
  const texture = createDynamicTexture(engine, 540, 960, { minFilter: 'nearest', magFilter: 'nearest' });
  const atlas = createGridSpriteAtlas(texture, { cellWidthPx: 540, cellHeightPx: 960 });
  const layer = createSprite2DLayer(atlas, { capacity: 1 });
  const sprite = addSprite2D(layer, { positionPx: [canvas.width / 2, canvas.height / 2], sizePx: [canvas.width, canvas.height], frame: 0 });
  const renderer = createSpriteRenderer(engine, { layers: [layer] });
  registerSpriteRenderer(renderer);
  const recovery = enableDeviceLostSpriteRecovery(engine, { onLost: () => onFailure(new Error('The graphics device was interrupted. Reload to reconnect WebGPU.')) });
  let particleCanvas, particleContext, image, currentWorld, disposed = false;

  function draw(game, cursor, materialColor, delta = 16.67) {
    if (disposed) return;
    const world = game.world, t = game.elapsed;
    if (currentWorld !== world) {
      currentWorld = world; particleCanvas = makeCanvas(world.width, world.height);
      particleContext = particleCanvas.getContext('2d'); image = particleContext.createImageData(world.width, world.height);
    }
    const data = image.data;
    for (let i = 0; i < world.cells.length; i++) {
      const m = world.cells[i], p = i * 4;
      if (!m) { data[p + 3] = 0; continue; }
      const x = i % world.width, y = Math.floor(i / world.width), n = ((x * 17 + y * 31) % 13) - 6;
      let c = COLORS[m], a = 255;
      if (m === M.STONE && (world.stoneBlock[i] || world.stoneBlockSettled[i])) {
        const movingId = world.stoneBlock[i], settled = world.stoneBlockSettled[i];
        const isBlock = j => movingId ? world.stoneBlock[j] === movingId : world.stoneBlockSettled[j] === settled;
        const left = x === 0 || !isBlock(i - 1);
        const top = y === 0 || !isBlock(i - world.width);
        const right = x === world.width - 1 || !isBlock(i + 1);
        const bottom = y === world.height - 1 || !isBlock(i + world.width);
        c = left || top || right || bottom ? [143, 151, 139] : [88, 101, 99];
      } else if (m === M.STONE) {
        const exposed = y > 0 && world.cells[i - world.width] !== M.STONE;
        c = exposed ? [91, 125, 91] : ((Math.floor(y / (7 * world.scale)) % 2 ? x + 9 * world.scale : x) % Math.floor(15 * world.scale) < world.scale || y % Math.floor(7 * world.scale) < world.scale) ? [27, 38, 44] : COLORS[m];
      }
      if (m === M.WATER) { c = world.get(x, y - 1) !== M.WATER ? [130, 215, 213] : COLORS[m]; a = 205; }
      if (m === M.OIL) { c = world.get(x, y - 1) !== M.OIL ? [179, 153, 200] : COLORS[m]; a = 232; }
      if (m === M.FIRE) c = (world.tick + i) % 5 < 2 ? [255, 221, 125] : [245, 101, 52];
      if (m >= M.STEAM) a = Math.min(140, world.life[i] * 2);
      data[p] = c[0] + n; data[p + 1] = c[1] + n; data[p + 2] = c[2] + n; data[p + 3] = a;
    }
    particleContext.putImageData(image, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(background, 0, 0); ctx.drawImage(particleCanvas, 0, 0, 540, 960);
    ctx.scale(3, 3);
    // Tiny fern and mushroom silhouettes rooted in intact ledges.
    for (const [x, y, w] of PLATFORMS.slice(1)) {
      for (const offset of [4, w - 8]) {
        if (world.at(x + offset, y + 1) !== M.STONE) continue;
        ctx.fillStyle = '#497a62'; ctx.fillRect(x + offset, y - 5, 1, 5);
        ctx.fillRect(x + offset - 2, y - 4, 5, 1); ctx.fillRect(x + offset - 1, y - 2, 4, 1);
      }
      ctx.fillStyle = '#b9d3ad'; ctx.fillRect(x + w - 4, y - 3, 1, 3);
      ctx.fillStyle = '#7cd1b4'; ctx.fillRect(x + w - 6, y - 4, 5, 2);
    }
    for (const [x, y] of [[7, 191], [171, 144], [7, 108]]) {
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 22);
      glow.addColorStop(0, '#efb45228'); glow.addColorStop(1, '#efb45200');
      ctx.fillStyle = glow; ctx.fillRect(x - 22, y - 22, 44, 44);
      ctx.fillStyle = '#8f7651'; ctx.fillRect(x - 2, y - 4, 5, 7);
      ctx.fillStyle = '#ffe2a1'; ctx.fillRect(x - 1, y - 3, 3, 4);
      ctx.fillStyle = '#483f38'; ctx.fillRect(x - 3, y - 5, 7, 1);
    }
    // Lantern gate at the spawn point.
    const gateColor = game.collected === 3 ? '#8effc4' : '#c3a66b';
    ctx.fillStyle = '#364e4d'; ctx.fillRect(PORTAL.x - 9, 247, 3, 19); ctx.fillRect(PORTAL.x + 7, 247, 3, 19); ctx.fillRect(PORTAL.x - 6, 244, 13, 3);
    ctx.fillStyle = '#56736b'; ctx.fillRect(PORTAL.x - 10, 264, 21, 2);
    ctx.strokeStyle = gateColor; ctx.lineWidth = 0.8; ctx.strokeRect(PORTAL.x - 6, 248, 13, 16);
    if (game.collected === 3) { ctx.fillStyle = `rgba(118,236,170,${0.14 + Math.sin(t * 3) * 0.04})`; ctx.fillRect(PORTAL.x - 5, 249, 11, 14); }
    for (const seed of game.seeds) {
      if (seed.collected) continue;
      const sy = seed.y + Math.sin(t * 2 + seed.x) * 1.2;
      const glow = ctx.createRadialGradient(seed.x, sy, 0, seed.x, sy, 13);
      glow.addColorStop(0, '#f9d28555'); glow.addColorStop(1, '#f9d28500');
      ctx.fillStyle = glow; ctx.fillRect(seed.x - 13, sy - 13, 26, 26);
      ctx.fillStyle = '#7d683e'; ctx.fillRect(seed.x - 3, sy - 4, 6, 7);
      ctx.fillStyle = '#edbb67'; ctx.fillRect(seed.x - 2, sy - 3, 4, 5);
      ctx.fillStyle = '#fff2bb'; ctx.fillRect(seed.x - 1, sy - 2, 2, 3);
      ctx.fillStyle = '#93b993'; ctx.fillRect(seed.x, sy - 6, 3, 2);
    }
    // The walker: large readable amber hood, teal coat, satchel and boots.
    const p = game.player, px = Math.round(p.x), py = Math.round(p.y);
    const leg = Math.abs(p.vx) > 1 && p.grounded ? Math.sin(t * 21) > 0 ? 1 : -1 : 0;
    ctx.save(); ctx.translate(px, py); ctx.scale(p.facing, 1);
    ctx.fillStyle = '#091b24'; ctx.fillRect(-5, -12, 10, 10); ctx.fillRect(-4, -15, 8, 4);
    ctx.fillStyle = '#db9e57'; ctx.fillRect(-4, -14, 8, 5); ctx.fillRect(-5, -12, 10, 3);
    ctx.fillStyle = '#f5d18b'; ctx.fillRect(-3, -14, 5, 1);
    ctx.fillStyle = '#2a3e43'; ctx.fillRect(-2, -11, 7, 3);
    ctx.fillStyle = '#ffe4ad'; ctx.fillRect(2, -10, 2, 1);
    ctx.fillStyle = p.health < 35 && Math.sin(t * 15) > 0 ? '#e98770' : '#6dc2ae'; ctx.fillRect(-3, -8, 7, 6);
    ctx.fillStyle = '#3e827d'; ctx.fillRect(-3, -8, 2, 6);
    ctx.fillStyle = '#b98150'; ctx.fillRect(-5, -7, 3, 4); ctx.fillRect(-3, -3, 7, 1);
    ctx.fillStyle = '#17292f'; ctx.fillRect(-3, -2 + leg, 3, 3); ctx.fillRect(2, -2 - leg, 3, 3);
    ctx.restore();
    for (let i = 0; i < 14; i++) {
      const x = 7 + (i * 41.37 % 165) + Math.sin(t * 0.4 + i) * 3, y = 65 + (i * 37.3 % 192) + Math.cos(t * 0.7 + i) * 4;
      ctx.fillStyle = `rgba(172,208,169,${0.12 + (Math.sin(t + i) + 1) * 0.12})`; ctx.fillRect(x, y, 0.6, 0.6);
    }
    if (cursor && cursor.y > 56 && cursor.y < 266) {
      ctx.strokeStyle = materialColor; ctx.lineWidth = 0.55; ctx.beginPath(); ctx.arc(cursor.x, cursor.y, cursor.radius, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = materialColor; ctx.fillRect(cursor.x - 0.5, cursor.y - 0.5, 1, 1);
    }
    // Keep decorative gutters outside of the WebGPU game surface.
    updateDynamicTexture(engine, texture, surface, { invertY: false });
    resizeEngine(engine);
    updateSprite2D(sprite, { positionPx: [canvas.width / 2, canvas.height / 2], sizePx: [canvas.width, canvas.height] });
    renderFrame(engine, delta);
  }
  return {
    draw,
    get drawCalls() { return engine.drawCallCount; },
    dispose() { if (disposed) return; disposed = true; recovery.disable(); disposeSpriteRenderer(renderer); disposeSpriteAtlas(atlas); disposeEngine(engine); },
  };
}
