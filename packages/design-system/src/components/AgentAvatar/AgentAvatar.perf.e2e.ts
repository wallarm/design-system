import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

// Measures only: budgets (06 §9) are a team decision, so nothing here asserts a number beyond "it was measured".
const agentAvatarStory = createStoryHelper('ai-agentavatar', ['Team', 'Many On Screen'] as const);

interface PerfWindow {
  __agentPerf: { firstAvatar?: number; allBaked?: number; layers?: number };
  __agentBaked: () => number;
}

// Before the story loads: a watcher stamps the first character on screen and the moment every shown layer is baked.
// The check is the same as waitForBakes in AgentAvatar.e2e.ts (the veil only counts while the ghost shows).
const watchBakes = (page: Page) =>
  page.addInitScript(() => {
    const w = window as unknown as PerfWindow;
    w.__agentPerf = {};
    w.__agentBaked = () => {
      let shown = 0;
      for (const svg of document.querySelectorAll('svg[data-testid^="agent-avatar-"]')) {
        const ghost = svg.hasAttribute('data-ghosting');
        for (const g of svg.querySelectorAll('[data-part~="ly"]')) {
          if (!ghost && g.closest('[data-part~="veil"]')) continue;
          if (!g.hasAttribute('data-ready')) return -1;
          shown++;
        }
      }
      return shown;
    };
    new MutationObserver((_, observer) => {
      const p = w.__agentPerf;
      if (
        p.firstAvatar === undefined &&
        document.querySelector('svg[data-testid^="agent-avatar-"]')
      ) {
        p.firstAvatar = performance.now();
      }
      if (p.firstAvatar === undefined) return;
      const layers = w.__agentBaked();
      if (layers > 0) {
        p.allBaked = performance.now();
        p.layers = layers;
        observer.disconnect();
      }
    }).observe(document, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-ready'],
    });
  });

const runner = (page: Page) =>
  page.evaluate(() => ({
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? null,
    devicePixelRatio: window.devicePixelRatio,
    userAgent: navigator.userAgent,
  }));

// rAF timestamps over `ms`: frames per second and the 95th-percentile frame time.
const sampleFrames = (page: Page, ms: number) =>
  page.evaluate(
    duration =>
      new Promise<{ frames: number; fps: number; p95FrameMs: number; maxFrameMs: number }>(
        resolve => {
          const stamps: number[] = [];
          const round = (n = 0) => Math.round(n * 10) / 10;
          const tick = (t: number) => {
            const start = stamps[0] ?? t;
            stamps.push(t);
            if (t - start < duration) {
              requestAnimationFrame(tick);
              return;
            }
            const deltas = stamps
              .slice(1)
              .map((s, i) => s - (stamps[i] ?? s))
              .sort((a, b) => a - b);
            resolve({
              frames: deltas.length,
              fps: round((deltas.length / (t - start)) * 1000),
              p95FrameMs: round(deltas[Math.floor((deltas.length - 1) * 0.95)]),
              maxFrameMs: round(deltas[deltas.length - 1]),
            });
          };
          requestAnimationFrame(tick);
        },
      ),
    ms,
  );

const report = (name: string, data: Record<string, unknown>) => {
  const line = JSON.stringify({ test: name, ...data });
  test.info().annotations.push({ type: 'agent-perf', description: line });
  // biome-ignore lint/suspicious/noConsole: the greppable AGENT_PERF line is how the numbers leave CI
  console.log(`AGENT_PERF ${line}`);
};

test.describe('Component: AgentAvatar', () => {
  test.describe('Interactions', () => {
    // A fresh browser context per test, so the bake cache and the HTTP cache are both cold.
    test('Should measure the cold bake of 16 cards via the Team story', async ({ page }) => {
      test.setTimeout(60000);
      await watchBakes(page);
      await agentAvatarStory.goto(page, 'Team');
      await page.waitForFunction(
        () => (window as unknown as PerfWindow).__agentPerf.allBaked,
        null,
        {
          timeout: 30000,
        },
      );
      const perf = await page.evaluate(() => (window as unknown as PerfWindow).__agentPerf);
      const avatars = await page.locator('[data-testid^="agent-avatar-team-"]').count();

      expect(avatars).toBe(16);
      expect(perf.layers).toBeGreaterThan(0);

      report('team-cold-bake', {
        avatars,
        layers: perf.layers,
        firstAvatarMs: Math.round(perf.firstAvatar ?? 0),
        allBakedMs: Math.round(perf.allBaked ?? 0),
        bakeMs: Math.round((perf.allBaked ?? 0) - (perf.firstAvatar ?? 0)),
        runner: await runner(page),
      });
    });

    test('Should measure the frame rate of 15 live agents via the Many On Screen story', async ({
      page,
      browserName,
    }) => {
      test.setTimeout(90000);
      await watchBakes(page);
      await agentAvatarStory.goto(page, 'Many On Screen');
      await page.waitForFunction(
        () => (window as unknown as PerfWindow).__agentPerf.allBaked,
        null,
        {
          timeout: 30000,
        },
      );
      await expect(page.locator('[data-testid^="agent-avatar-many-"][data-live]')).toHaveCount(15);

      const normal = await sampleFrames(page, 5000);
      expect(normal.frames).toBeGreaterThan(0);

      let throttled4x: Awaited<ReturnType<typeof sampleFrames>> | null = null;
      if (browserName === 'chromium') {
        const cdp = await page.context().newCDPSession(page);
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
        await page.waitForTimeout(500);
        throttled4x = await sampleFrames(page, 5000);
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
        expect(throttled4x.frames).toBeGreaterThan(0);
      }

      report('many-on-screen-live', {
        live: 15,
        size: 120,
        sampleMs: 5000,
        normal,
        throttled4x,
        runner: await runner(page),
      });
    });
  });
});
