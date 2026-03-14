import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const textStory = createStoryHelper('typography-text', [
  'Basic',
  'Sizes',
  'Weights',
  'Colors',
  'As Child',
] as const);

test.describe('Component: Text', () => {
  test.describe('Visual', () => {
    test('Should render basic text correctly', async ({ page }) => {
      await textStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all size variants correctly', async ({ page }) => {
      await textStory.goto(page, 'Sizes');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all weight variants correctly', async ({ page }) => {
      await textStory.goto(page, 'Weights');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all color variants correctly', async ({ page }) => {
      await textStory.goto(page, 'Colors');
      await expect(page).toHaveScreenshot();
    });

    test('Should render as child element correctly', async ({ page }) => {
      await textStory.goto(page, 'As Child');
      await expect(page).toHaveScreenshot();
    });
  });
});
