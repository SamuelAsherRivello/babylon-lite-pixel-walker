import { test, expect } from '@playwright/test';
import { EXPEDITION_ROUTE } from '../route.js';

const snapshot = page => page.evaluate(() => window.__pixelWalker.snapshot());
async function openGame(page) {
  await page.goto('./');
  await expect(page.locator('body')).toHaveAttribute('data-state', 'ready', { timeout: 25000 });
  await expect.poll(async () => (await snapshot(page)).tick).toBeGreaterThan(5);
}

test('WebGPU render, keyboard, material pouring, pause, and reset', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', e => { if (e.type() === 'error') errors.push(e.text()); });
  await openGame(page);
  expect((await snapshot(page)).drawCalls).toBeGreaterThan(0);
  const before = await snapshot(page);
  await page.keyboard.down('KeyD'); await page.waitForFunction(() => window.__pixelWalker.snapshot().player.x >= 72); await page.keyboard.up('KeyD');
  expect((await snapshot(page)).player.x).toBeGreaterThan(before.player.x + 6);
  await page.keyboard.down('KeyW'); await page.waitForTimeout(250); await page.keyboard.up('KeyW');
  expect((await snapshot(page)).player.y).toBeLessThan(before.player.y - 3);
  const box = await page.locator('#world').boundingBox();
  await page.getByRole('button', { name: 'Water', exact: true }).click();
  const initial = (await snapshot(page)).particles;
  await page.mouse.move(box.x + box.width * .7, box.y + box.height * .48); await page.mouse.down(); await page.waitForTimeout(600); await page.mouse.up();
  expect((await snapshot(page)).particles).toBeGreaterThan(initial + 40);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const paused = await snapshot(page); await page.waitForTimeout(200);
  expect((await snapshot(page)).tick).toBe(paused.tick);
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  await page.getByRole('button', { name: 'Reset world', exact: true }).click();
  expect((await snapshot(page)).collected).toBe(0);
  await page.screenshot({ path: 'test-results/desktop.png' });
  expect(errors).toEqual([]);
});

test('resolution, recovery, help, and responsive portrait framing', async ({ page }) => {
  await openGame(page);
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByLabel('Particle resolution').selectOption('fine');
  expect((await snapshot(page)).grid).toEqual([270, 480]);
  await page.getByLabel('Particle resolution').selectOption('limit');
  expect((await snapshot(page)).grid).toEqual([720, 1280]);
  await page.getByLabel('Show FPS in the lower-right corner').uncheck();
  await expect(page.locator('#performance')).toBeHidden();
  await page.getByLabel('Show FPS in the lower-right corner').check();
  await expect(page.locator('#performance')).toBeVisible();
  await page.getByRole('button', { name: 'Close settings' }).click();
  await page.getByRole('button', { name: 'How to play' }).click();
  await expect(page.getByText('Make your own way.')).toBeVisible();
  await page.getByRole('button', { name: 'Close how to play' }).click();
  for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 568 }, { width: 844, height: 390 }, { width: 1440, height: 1000 }]) {
    await page.setViewportSize(viewport);
    const box = await page.locator('.frame').boundingBox();
    expect(box.width / box.height).toBeCloseTo(9 / 16, 2);
    expect(box.x).toBeGreaterThanOrEqual(0); expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/mobile.png' });
});

test('unsupported WebGPU explains failure with retry', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'gpu', { value: undefined }));
  await page.goto('./');
  await expect(page.locator('body')).toHaveAttribute('data-state', 'error');
  await expect(page.getByRole('heading', { name: 'This world needs WebGPU.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
});

test('keyboard expedition collects all seeds and returns to the portal; replay works', async ({ page }) => {
  await page.clock.install();
  await openGame(page);
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.getByRole('button', { name: 'Reset world' }).click();
  for (const [frames, input] of EXPEDITION_ROUTE) {
    for (const key of ['KeyA', 'KeyD', 'KeyW']) await page.keyboard.up(key);
    if (input.axis === 1) await page.keyboard.down('KeyD');
    if (input.axis === -1) await page.keyboard.down('KeyA');
    if (input.jump) await page.keyboard.down('KeyW');
    await page.clock.runFor(frames * 1000 / 60);
  }
  for (const key of ['KeyA', 'KeyD', 'KeyW']) await page.keyboard.up(key);
  expect((await snapshot(page)).collected).toBe(3);
  await expect(page.getByText('EXPEDITION COMPLETE', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Keep experimenting' }).click();
  expect((await snapshot(page)).paused).toBe(false);
  await page.getByRole('button', { name: 'Reset world' }).click();
  expect((await snapshot(page)).won).toBe(false);
  expect((await snapshot(page)).collected).toBe(0);
});

test('multitouch moves while pouring and touch cancellation stops both', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  try {
    await openGame(page);
    const cdp = await context.newCDPSession(page);
    const direction = await page.getByRole('button', { name: 'Move right' }).boundingBox();
    const canvas = await page.locator('#world').boundingBox();
    const initial = await snapshot(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [
      { id: 1, x: direction.x + direction.width / 2, y: direction.y + direction.height / 2 },
      { id: 2, x: canvas.x + canvas.width * .7, y: canvas.y + canvas.height * .5 },
    ] });
    await page.waitForTimeout(400);
    const moved = await snapshot(page);
    expect(moved.player.x).toBeGreaterThan(initial.player.x + 8);
    expect(moved.particles).toBeGreaterThan(initial.particles + 20);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
    await page.waitForTimeout(200);
    const released = await snapshot(page);
    await page.waitForTimeout(200);
    const after = await snapshot(page);
    expect(after.player.x).toBeCloseTo(released.player.x, 1);
    expect(after.particles).toBeLessThanOrEqual(released.particles);
  } finally { await context.close(); }
});

test('blur cancels held keys and pouring; recovery works without reload', async ({ page }) => {
  await openGame(page);
  await page.keyboard.down('ArrowRight');
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  expect((await snapshot(page)).paused).toBe(true);
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  const x = (await snapshot(page)).player.x; await page.waitForTimeout(150);
  expect((await snapshot(page)).player.x).toBeCloseTo(x, 1);
  await page.keyboard.up('ArrowRight');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'Rescue walker to the gate' }).click();
  expect((await snapshot(page)).player.x).toBe(27);
  expect((await snapshot(page)).player.health).toBe(100);
});
