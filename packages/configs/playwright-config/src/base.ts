import { defineConfig, devices } from '@playwright/test';

export const baseConfig = defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30000,
  reporter: [['html'], ['junit', { outputFile: 'test-results/junit.xml' }]],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            // NOTE: intentionally NOT passing --disable-dev-shm-usage. That flag
            // forces Chromium to use /tmp instead of /dev/shm, which under parallel
            // screenshotting intermittently truncated capture buffers — visual
            // baselines came out with a black void, and regeneration failed with
            // "unrecognised content at end of stream". The CI container provides
            // --shm-size=2gb, so Chromium can use /dev/shm directly, as Playwright's
            // own Docker guidance recommends. See #207.
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
          ],
        },
      },
    },
  ],
  snapshotPathTemplate:
    '{testDir}/{testFileDir}/{testFileName}-snapshots/{testName}-{projectName}{ext}',
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.005, threshold: 0.1 },
  },
  // webServer will be overridden in specific projects
});
