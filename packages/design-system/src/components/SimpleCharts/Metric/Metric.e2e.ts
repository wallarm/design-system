import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const story = createStoryHelper('data-display-simplecharts-metric', [
  'Gallery',
  'Loading',
] as const);

test.describe('Metric', () => {
  test.describe('Screenshots', () => {
    // Metric is display-only (no hover / selected / focus states), so the family's
    // interactive-state matrix does not apply — the gallery covers every brick combination.
    test('Gallery', async ({ page }) => {
      await story.goto(page, 'Gallery');
      await expect(page).toHaveScreenshot();
    });

    test('Loading', async ({ page }) => {
      await story.goto(page, 'Loading');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Accessibility', () => {
    test('Should announce the skeleton loading state', async ({ page }) => {
      await story.goto(page, 'Loading');
      const skeleton = page.locator('[data-slot=metric-skeleton]');
      await expect(skeleton).toHaveAttribute('aria-busy', 'true');
      await expect(skeleton).toHaveAttribute('aria-live', 'polite');
    });
  });
});
