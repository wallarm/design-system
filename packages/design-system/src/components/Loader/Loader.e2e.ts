import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const loaderStory = createStoryHelper('loading-loader', [
  'Basic',
  'Types',
  'Sizes',
  'Colors',
  'Circle Background',
] as const);

test.describe('Component: Loader', () => {
  test.describe('Visual', () => {
    test('Should render basic loader correctly', async ({ page }) => {
      await loaderStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render all type variants correctly', async ({ page }) => {
      await loaderStory.goto(page, 'Types');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render all size variants correctly', async ({ page }) => {
      await loaderStory.goto(page, 'Sizes');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render all color variants correctly', async ({ page }) => {
      await loaderStory.goto(page, 'Colors');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render circle background variants correctly', async ({ page }) => {
      await loaderStory.goto(page, 'Circle Background');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });
  });
});
