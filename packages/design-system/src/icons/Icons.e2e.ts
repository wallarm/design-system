import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const iconsStory = createStoryHelper('primitives-icons', ['Icon Sizes', 'Icons In Text'] as const);

test.describe('Component: Icons', () => {
  test.describe('Visual', () => {
    test('Should render icon sizes correctly', async ({ page }) => {
      await iconsStory.goto(page, 'Icon Sizes');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render icons in text correctly', async ({ page }) => {
      await iconsStory.goto(page, 'Icons In Text');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });
  });
});
