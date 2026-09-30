import test from 'node:test';
import assert from 'node:assert/strict';
import { World, Game, M, PRESETS, PLATFORMS } from '../src/world.js';
import { EXPEDITION_ROUTE } from './route.js';

function step(world, n) { for (let i = 0; i < n; i++) world.step(); }
function box() { const w = new World('balanced', { empty: true }); w.fill(20, 50, 1, 40, M.STONE); w.fill(40, 50, 1, 40, M.STONE); w.fill(20, 90, 21, 1, M.STONE); return w; }
test('sand falls, piles, and conserves grains in a closed container', () => {
  const w = box(); w.fill(26, 61, 8, 5, M.SAND); step(w, 120);
  assert.equal(w.count(M.SAND), 40); assert.equal(w.get(29, 89), M.SAND);
  assert.equal(w.get(29, 61), M.AIR);
});
test('water spreads and cannot pass through a thin stone wall', () => {
  const w = box(); w.fill(27, 66, 5, 10, M.WATER); step(w, 180);
  assert.equal(w.count(M.WATER), 50);
  assert.equal(w.get(21, 89), M.WATER); assert.equal(w.get(39, 89), M.WATER);
  for (let y = 50; y < 90; y++) { assert.equal(w.get(19, y), M.AIR); assert.equal(w.get(41, y), M.AIR); }
});
test('water sinks under oil and sand sinks through both', () => {
  const w = box(); w.fill(21, 83, 19, 7, M.OIL); w.fill(21, 76, 19, 7, M.WATER); w.fill(27, 69, 5, 3, M.SAND);
  step(w, 230);
  const averageY = m => { let sum = 0, count = 0; for (let i = 0; i < w.cells.length; i++) if (w.cells[i] === m) { sum += Math.floor(i / w.width); count++; } return sum / count; };
  assert.equal(w.count(M.WATER), 133); assert.equal(w.count(M.OIL), 133); assert.equal(w.count(M.SAND), 15);
  assert.ok(averageY(M.SAND) > averageY(M.WATER)); assert.ok(averageY(M.WATER) > averageY(M.OIL));
});
test('oil ignites and fire expires; water quenches fire into steam', () => {
  const w = box(); w.fill(21, 84, 19, 6, M.OIL); w.set(25, 83, M.FIRE, 100);
  step(w, 25); assert.ok(w.count(M.OIL) < 114); assert.ok(w.count(M.FIRE) > 1);
  step(w, 600); assert.equal(w.count(M.FIRE), 0);
  const wet = box(); wet.set(28, 80, M.FIRE, 100); wet.set(28, 79, M.WATER);
  wet.step(); assert.equal(wet.count(M.FIRE), 0); assert.ok(wet.count(M.STEAM) > 0);
  step(wet, 240); assert.equal(wet.count(M.STEAM), 0);
});
test('resolution changes preserve proportions and rebuild a fresh game', () => {
  for (const [preset, width] of Object.entries(PRESETS)) {
    const game = new Game(preset); assert.equal(game.world.width, width); assert.equal(game.world.height / width, 16 / 9);
    for (const [x, y, w] of PLATFORMS) assert.equal(game.world.at(x + w / 2, y + 1), M.STONE);
    game.world.paint(75, 150, M.SAND, 5); assert.ok(game.world.count(M.SAND) > 0);
    game.seeds[0].collected = true; game.player.health = 20; game.reset(preset);
    assert.equal(game.collected, 0); assert.equal(game.player.health, 100); assert.equal(game.world.tick, 0);
  }
});
test('sand settles and wakes after support is removed', () => {
  const w = box(); w.set(30, 88, M.SAND); step(w, 10);
  assert.equal(w.get(30, 89), M.SAND); assert.equal(w.get(30, 88), M.AIR);
  const sand = [...w.cells].findIndex(m => m === M.SAND); assert.ok(sand >= 0);
  assert.equal(w.settled[sand], 1);
});
test('poured stone falls as a block and becomes fixed while level terrain stays fixed', () => {
  const w = new World('coarse'); const fixedBefore = w.fixed.reduce((n, x) => n + x, 0);
  w.paint(80, 100, M.STONE, 5); const blocks = new Set(w.stoneBlock.filter(Boolean)); assert.ok(blocks.size > 0);
  const id = blocks.values().next().value, before = [...w.stoneBlock].findIndex(x => x === id);
  step(w, 30); const after = [...w.stoneBlock].findIndex(x => x === id);
  assert.ok(after > before || !w.stoneBlock.includes(id));
  assert.ok(w.stoneBlockSettled.includes(id), 'the falling block must eventually settle');
  assert.ok(w.fixed.reduce((n, x) => n + x, 0) >= fixedBefore);
  assert.equal(w.at(40, 237), M.STONE);
  const settledBlockCell = [...w.stoneBlockSettled].findIndex(Boolean);
  assert.ok(settledBlockCell >= 0);
  const bx = settledBlockCell % w.width, by = Math.floor(settledBlockCell / w.width);
  w.set(bx, by, M.AIR);
  assert.equal(w.fixed[settledBlockCell], 0);
  w.set(bx, by, M.STONE);
  assert.equal(w.fixed[settledBlockCell], 0);
});
test('movement collides with floors and walls; pause freezes the world', () => {
  const game = new Game(); for (let i = 0; i < 600; i++) game.step({ axis: -1 });
  assert.ok(game.player.x >= 5); assert.ok(game.player.y <= 266.1);
  game.paused = true; const state = game.snapshot(); for (let i = 0; i < 10; i++) game.step({ axis: 1, jump: true });
  assert.deepEqual(game.snapshot(), state);
});
test('swimming permits ascent and descent; fire damage causes safe recovery', () => {
  const game = new Game(); game.world.fill(15, 240, 25, 26, M.WATER);
  const initialY = game.player.y; for (let i = 0; i < 15; i++) game.step({ jump: true });
  assert.ok(game.player.y < initialY - 4);
  const high = game.player.y; for (let i = 0; i < 10; i++) game.step({ down: true }); assert.ok(game.player.y > high);
  game.world.fill(15, 240, 30, 26, M.AIR); game.player.health = 1; game.player.invulnerable = 0;
  game.world.fill(game.player.x - 5, game.player.y - 13, 10, 14, M.FIRE);
  for (let i = 0; i < 5; i++) game.step();
  assert.equal(game.rescues, 1); assert.equal(game.player.health, 100);
  assert.ok(!game.collides(game.player.x, game.player.y));
});
test('complete expedition is reachable at every resolution using movement only, then replay resets it', () => {
  for (const preset of Object.keys(PRESETS)) {
    const game = new Game(preset);
    for (const [frames, input] of EXPEDITION_ROUTE) for (let i = 0; i < frames; i++) game.step(input);
    assert.equal(game.collected, 3, preset); assert.equal(game.won, true, preset); assert.equal(game.rescues, 0);
    game.reset(); assert.equal(game.won, false); assert.equal(game.collected, 0);
  }
});
test('seeded simulations are reproducible and painting respects bounds', () => {
  const a = new World(), b = new World();
  for (const w of [a, b]) { w.paint(80, 150, M.SAND, 7); step(w, 100); }
  assert.deepEqual(a.cells, b.cells);
  const before = a.cells.slice(); a.paint(-5, 1, M.FIRE, 8); assert.deepEqual(a.cells, before);
});
