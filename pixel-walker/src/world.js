export const M = Object.freeze({ AIR: 0, STONE: 1, SAND: 2, WATER: 3, OIL: 4, FIRE: 5, STEAM: 6, SMOKE: 7 });
export const WIDTH = 180;
export const HEIGHT = 320;
export const PRESETS = Object.freeze({ coarse: 90, balanced: 180, fine: 270 });
export const PLATFORMS = [
  [0, 266, 180, 54], [15, 236, 48, 7], [91, 212, 68, 8],
  [54, 181, 45, 7], [10, 151, 48, 8], [81, 124, 40, 7], [128, 94, 42, 9],
];
export const SEEDS = [{ x: 143, y: 204 }, { x: 27, y: 143 }, { x: 150, y: 86 }];
export const PORTAL = { x: 27, y: 256 };
export function seededRandom(seed = 7131) {
  let state = seed >>> 0;
  return () => { state ^= state << 13; state ^= state >>> 17; state ^= state << 5; return (state >>> 0) / 4294967296; };
}

export class World {
  constructor(preset = 'balanced', { empty = false, seed = 7131 } = {}) {
    this.preset = preset;
    this.width = PRESETS[preset] ?? PRESETS.balanced;
    this.height = this.width * 16 / 9;
    this.scale = this.width / WIDTH;
    this.cells = new Uint8Array(this.width * this.height);
    this.life = new Uint16Array(this.cells.length);
    this.moved = new Uint32Array(this.cells.length);
    this.random = seededRandom(seed);
    this.tick = 0;
    if (!empty) this.buildLevel();
  }
  get(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return M.STONE;
    return this.cells[y * this.width + x];
  }
  at(x, y) { return this.get(Math.floor(x * this.scale), Math.floor(y * this.scale)); }
  set(x, y, material, life = 0) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    const i = y * this.width + x;
    this.cells[i] = material;
    this.life[i] = life || (material === M.FIRE ? 80 + (this.random() * 65 | 0) : material >= M.STEAM ? 90 + (this.random() * 100 | 0) : 0);
  }
  fill(x, y, w, h, material) {
    for (let cy = Math.floor(y * this.scale); cy < Math.ceil((y + h) * this.scale); cy++) {
      for (let cx = Math.floor(x * this.scale); cx < Math.ceil((x + w) * this.scale); cx++) this.set(cx, cy, material);
    }
  }
  buildLevel() {
    for (const p of PLATFORMS) this.fill(...p, M.STONE);
    this.fill(0, 51, 3, 215, M.STONE);
    this.fill(177, 51, 3, 215, M.STONE);
    this.fill(75, 257, 35, 9, M.WATER);
    this.fill(142, 261, 24, 5, M.OIL);
    for (let x = 33; x < 52; x++) this.fill(x, 236 - Math.max(1, 6 - Math.abs(x - 43) / 2), 1, Math.max(1, 6 - Math.abs(x - 43) / 2), M.SAND);
  }
  paint(x, y, material, radius = 3, player = null) {
    if (y < 56 || y > 265 || x < 4 || x > 176) return;
    const r = radius * this.scale;
    const cx = x * this.scale, cy = y * this.scale;
    for (let py = Math.floor(cy - r); py <= cy + r; py++) {
      for (let px = Math.floor(cx - r); px <= cx + r; px++) {
        if ((px - cx) ** 2 + (py - cy) ** 2 > r * r || px < 3 * this.scale || px >= 177 * this.scale || py >= 266 * this.scale || py < 55 * this.scale) continue;
        const wx = px / this.scale, wy = py / this.scale;
        if (player && (material === M.STONE || material === M.SAND) && Math.abs(wx - player.x) < 5 && wy > player.y - 14 && wy < player.y + 2) continue;
        const current = this.get(px, py);
        if (material === M.AIR || (current === M.AIR && (material === M.STONE || this.random() > 0.28))) this.set(px, py, material);
      }
    }
  }
  swap(a, b) {
    const cell = this.cells[a], life = this.life[a];
    this.cells[a] = this.cells[b]; this.life[a] = this.life[b];
    this.cells[b] = cell; this.life[b] = life;
    this.moved[a] = this.tick; this.moved[b] = this.tick;
  }
  move(i, x, y, material) {
    if (x < 1 || x >= this.width - 1 || y < 1 || y >= this.height - 1) return false;
    const j = y * this.width + x, target = this.cells[j];
    const canSwap = target === M.AIR ||
      (material === M.SAND && (target === M.WATER || target === M.OIL || target >= M.FIRE)) ||
      (material === M.WATER && (target === M.OIL || target >= M.FIRE)) ||
      (material === M.OIL && target >= M.FIRE);
    if (!canSwap || this.moved[j] === this.tick) return false;
    this.swap(i, j); return true;
  }
  step() {
    this.tick++;
    const { width: w, height: h, cells, life } = this;
    const forward = this.tick % 2 === 0;
    for (let y = h - 2; y > 0; y--) {
      for (let k = 1; k < w - 1; k++) {
        const x = forward ? k : w - 1 - k, i = y * w + x;
        const m = cells[i];
        if (m < M.SAND || this.moved[i] === this.tick) continue;
        const dir = this.random() < 0.5 ? -1 : 1;
        if (m === M.FIRE) {
          let quenched = false;
          for (const j of [i - w, i + w, i - 1, i + 1]) {
            if (cells[j] === M.WATER) { cells[i] = M.STEAM; life[i] = 100; cells[j] = M.AIR; quenched = true; break; }
          }
          if (quenched) continue;
          for (const j of [i - w, i + w, i - 1, i + 1]) {
            if (cells[j] === M.OIL && this.random() < 0.42) { cells[j] = M.FIRE; life[j] = 90 + (this.random() * 90 | 0); this.moved[j] = this.tick; }
          }
          if (--life[i] <= 0) { cells[i] = this.random() < 0.45 ? M.SMOKE : M.AIR; life[i] = 100; continue; }
          if (this.random() < 0.25) this.move(i, x + dir, y - 1, m);
          continue;
        }
        if (m === M.STEAM || m === M.SMOKE) {
          if (--life[i] <= 0 || y < 54 * this.scale) { cells[i] = M.AIR; continue; }
          if (!this.move(i, x, y - 1, m)) this.move(i, x + dir, y - 1, m);
          continue;
        }
        if (this.move(i, x, y + 1, m) || this.move(i, x + dir, y + 1, m) || this.move(i, x - dir, y + 1, m)) continue;
        if (m === M.WATER || m === M.OIL) {
          // Only slide through contiguous air: never jump a thin wall.
          for (const sign of [dir, -dir]) {
            let tx = x;
            const spread = m === M.WATER ? Math.ceil(3 * this.scale) : Math.ceil(2 * this.scale);
            for (let distance = 1; distance <= spread; distance++) {
              if (this.get(x + sign * distance, y) !== M.AIR) break;
              tx = x + sign * distance;
            }
            if (tx !== x && this.move(i, tx, y, m)) break;
          }
        }
      }
    }
  }
  count(material) { let n = 0; for (const cell of this.cells) if (cell === material) n++; return n; }
}

export class Game {
  constructor(preset = 'balanced') { this.reset(preset); }
  reset(preset = this.world?.preset ?? 'balanced') {
    this.world = new World(preset);
    this.seeds = SEEDS.map(p => ({ ...p, collected: false }));
    this.won = false; this.paused = false; this.elapsed = 0; this.rescues = 0; this.jumpHeld = false;
    this.player = { x: 27, y: 265, vx: 0, vy: 0, health: 100, grounded: false, swimming: false, facing: 1, coyote: 0, invulnerable: 1 };
    this.events = [];
  }
  get collected() { return this.seeds.filter(s => s.collected).length; }
  collides(x, y) {
    const s = this.world.scale;
    for (let cy = Math.floor((y - 11) * s); cy <= Math.floor((y - 0.05) * s); cy++) {
      for (let cx = Math.floor((x - 3) * s); cx <= Math.floor((x + 2.9) * s); cx++) {
        const m = this.world.get(cx, cy);
        if (m === M.STONE || m === M.SAND) return true;
      }
    }
    return y < 64;
  }
  rescue() {
    this.world.fill(18, 247, 19, 19, M.AIR);
    this.world.fill(18, 266, 19, 3, M.STONE);
    Object.assign(this.player, { x: 27, y: 265, vx: 0, vy: 0, health: 100, invulnerable: 2 });
    this.rescues++; this.events.push('Back at the lantern. Your collected seeds are safe.');
  }
  step(input = {}, dt = 1 / 60) {
    if (this.paused) return;
    this.elapsed += dt;
    const p = this.player;
    if (input.pours) for (const pour of input.pours) this.world.paint(pour.x, pour.y, pour.material, pour.radius, p);
    // Keep cells out of the body so granular settling cannot pin the player.
    this.world.step();
    for (let yy = p.y - 10; yy < p.y; yy += 1 / this.world.scale) {
      for (let xx = p.x - 2; xx < p.x + 2; xx += 1 / this.world.scale) {
        if (this.world.at(xx, yy) === M.SAND) this.world.set(Math.floor(xx * this.world.scale), Math.floor(yy * this.world.scale), M.AIR);
      }
    }
    const body = this.world.at(p.x, p.y - 5);
    p.swimming = body === M.WATER || body === M.OIL;
    p.grounded = this.collides(p.x, p.y + 0.6);
    p.coyote = p.grounded ? 0.1 : Math.max(0, p.coyote - dt);
    const axis = Math.max(-1, Math.min(1, input.axis ?? 0));
    p.vx = axis * (p.swimming ? 32 : 48);
    if (axis) p.facing = Math.sign(axis);
    if (input.jump && !this.jumpHeld && p.coyote > 0) { p.vy = -128; p.coyote = 0; }
    else if (input.jump && p.swimming && p.vy > -44) p.vy = -44;
    this.jumpHeld = !!input.jump;
    p.vy = Math.min(p.swimming ? 32 : 145, p.vy + (p.swimming ? 65 : 210) * dt);
    if (p.swimming && input.down) p.vy = 45;
    for (const [key, amount] of [['x', p.vx * dt], ['y', p.vy * dt]]) {
      const steps = Math.max(1, Math.ceil(Math.abs(amount) * this.world.scale * 2));
      for (let i = 0; i < steps; i++) {
        const nx = p.x + (key === 'x' ? amount / steps : 0), ny = p.y + (key === 'y' ? amount / steps : 0);
        if (this.collides(nx, ny)) {
          if (key === 'x' && p.grounded && !this.collides(nx, ny - 1.5)) { p.x = nx; p.y -= 1.5; continue; }
          if (key === 'y') p.vy = 0;
          break;
        }
        p[key] += amount / steps;
      }
    }
    p.invulnerable = Math.max(0, p.invulnerable - dt);
    let burning = false;
    for (let yy = p.y - 10; yy < p.y; yy += 2) for (let xx = p.x - 3; xx <= p.x + 3; xx += 2) if (this.world.at(xx, yy) === M.FIRE) burning = true;
    if (burning && !p.invulnerable) p.health = Math.max(0, p.health - 38 * dt);
    else p.health = Math.min(100, p.health + 3 * dt);
    if (p.health <= 0 || p.y > 275) this.rescue();
    for (const seed of this.seeds) {
      if (!seed.collected && Math.hypot(p.x - seed.x, p.y - 6 - seed.y) < 9) {
        seed.collected = true;
        this.events.push(this.collected === 3 ? 'All three seeds! Return to the lantern gate below.' : `Lantern seed ${this.collected} of 3 found.`);
      }
    }
    if (!this.won && this.collected === 3 && Math.hypot(p.x - PORTAL.x, p.y - 6 - PORTAL.y) < 12) {
      this.won = true; this.events.push('The garden is awake. Expedition complete!');
    }
  }
  snapshot() {
    return { preset: this.world.preset, grid: [this.world.width, this.world.height], player: { ...this.player }, collected: this.collected, won: this.won, paused: this.paused, tick: this.world.tick, elapsed: this.elapsed, particles: this.world.cells.reduce((n, m) => n + (m > M.STONE), 0) };
  }
}
