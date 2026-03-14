import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const numericBadgeStory = createStoryHelper('status-indication-numericbadge', [
  'Basic',
  'Types',
] as const);

test.describe('Component: NumericBadge', () => {
  test.describe('Visual', () => {
    test('Should render basic numeric badge correctly', async ({ page }) => {
      await numericBadgeStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all type variants correctly', async ({ page }) => {
      await numericBadgeStory.goto(page, 'Types');
      await expect(page).toHaveScreenshot();
    });
  });
});
