import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './pixel-walker/test/browser',
  timeout: 60000,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    channel: 'chromium',
    baseURL: process.env.PIXEL_WALKER_URL || 'http://127.0.0.1:4381/babylon-lite-pixel-walker/',
    viewport: { width: 1440, height: 1000 },
    launchOptions: { args: ['--enable-unsafe-webgpu', '--ignore-gpu-blocklist', '--disable-dawn-features=tint_ir'] },
    screenshot: 'only-on-failure',
  },
  webServer: process.env.PIXEL_WALKER_URL ? undefined : {
    command: 'npm run preview -- --port 4381 --strictPort',
    url: 'http://127.0.0.1:4381/babylon-lite-pixel-walker/',
    reuseExistingServer: !process.env.CI,
  },
});
