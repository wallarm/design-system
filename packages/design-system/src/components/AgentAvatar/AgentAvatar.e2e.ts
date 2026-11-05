import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const agentAvatarStory = createStoryHelper('ai-agentavatar', [
  'Basic',
  'Cast',
  'States',
  'Places',
  'PartialCoverage',
  'CustomAgent',
  'Team',
] as const);

// Every layer that shows has its baked image decoded (the veil only while the ghost or the crown shows).
const waitForBakes = (page: Page) =>
  page.waitForFunction(() =>
    [...document.querySelectorAll('[data-slot="agent-avatar"]')].every(svg => {
      const ghost = svg.hasAttribute('data-ghosting');
      return [...svg.querySelectorAll('[data-part~="ly"]')]
        .filter(g => ghost || !g.closest('[data-part~="veil"]'))
        .every(g => g.hasAttribute('data-ready'));
    }),
  );

test.describe('Component: AgentAvatar', () => {
  test.describe('Visual', () => {
    for (const story of [
      'Basic',
      'Cast',
      'States',
      'Places',
      'PartialCoverage',
      'CustomAgent',
    ] as const) {
      test(`Should render the ${story} story correctly`, async ({ page }) => {
        await agentAvatarStory.goto(page, story);
        await waitForBakes(page);
        await expect(page).toHaveScreenshot();
      });
    }
  });

  test.describe('Interactions', () => {
    // WDS-199 acceptance: a static view requests no animation frames once its bakes are in.
    test('Should request no animation frames when static via the Team story', async ({ page }) => {
      await page.addInitScript(() => {
        const w = window as unknown as { __raf: number };
        w.__raf = 0;
        const raf = window.requestAnimationFrame.bind(window);
        window.requestAnimationFrame = cb => {
          w.__raf++;
          return raf(cb);
        };
      });
      await agentAvatarStory.goto(page, 'Team');
      await waitForBakes(page);
      await page.waitForTimeout(500);
      const before = await page.evaluate(() => (window as unknown as { __raf: number }).__raf);
      await page.waitForTimeout(1000);
      const after = await page.evaluate(() => (window as unknown as { __raf: number }).__raf);
      expect(after - before).toBe(0);
    });
  });

  test.describe('Accessibility', () => {
    test('Should be decorative via aria-hidden when unlabelled', async ({ page }) => {
      await agentAvatarStory.goto(page, 'Basic');
      await expect(page.getByTestId('agent-avatar')).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
