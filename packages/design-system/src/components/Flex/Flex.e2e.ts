import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const flexStory = createStoryHelper('layout-flex', [
  'Basic',
  'Direction',
  'Alignment',
  'Wrap',
  'Grow Shrink',
] as const);

test.describe('Component: Flex', () => {
  test.describe('Visual', () => {
    test('Should render basic layout correctly', async ({ page }) => {
      await flexStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render direction variants correctly', async ({ page }) => {
      await flexStory.goto(page, 'Direction');
      await expect(page).toHaveScreenshot();
    });

    test('Should render alignment variants correctly', async ({ page }) => {
      await flexStory.goto(page, 'Alignment');
      await expect(page).toHaveScreenshot();
    });

    test('Should render wrap behavior correctly', async ({ page }) => {
      await flexStory.goto(page, 'Wrap');
      await expect(page).toHaveScreenshot();
    });

    test('Should render grow and shrink behavior correctly', async ({ page }) => {
      await flexStory.goto(page, 'Grow Shrink');
      await expect(page).toHaveScreenshot();
    });
  });
});
