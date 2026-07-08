import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const story = createStoryHelper('data-display-simplecharts-metric', ['Gallery'] as const);

test.describe('Metric', () => {
  test.describe('Screenshots', () => {
    // Metric is display-only (no hover / selected / focus states), so the family's
    // interactive-state matrix does not apply — the gallery covers every brick combination.
    test('Gallery', async ({ page }) => {
      await story.goto(page, 'Gallery');
      await expect(page).toHaveScreenshot();
    });
  });
});
