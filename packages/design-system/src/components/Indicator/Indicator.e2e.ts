import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const indicatorStory = createStoryHelper('status-indication-indicator', [
  'Basic',
  'All Variants',
] as const);

test.describe('Component: Indicator', () => {
  test.describe('Visual', () => {
    test('Should render basic indicator correctly', async ({ page }) => {
      await indicatorStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all variants correctly', async ({ page }) => {
      await indicatorStory.goto(page, 'All Variants');
      await expect(page).toHaveScreenshot();
    });
  });
});
