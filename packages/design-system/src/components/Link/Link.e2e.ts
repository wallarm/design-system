import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const linkStory = createStoryHelper('navigation-link', [
  'Basic',
  'Types',
  'Weight',
  'Sizes',
  'Icons',
] as const);

test.describe('Component: Link', () => {
  test.describe('Visual', () => {
    test('Should render basic link correctly', async ({ page }) => {
      await linkStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all type variants correctly', async ({ page }) => {
      await linkStory.goto(page, 'Types');
      await expect(page).toHaveScreenshot();
    });

    test('Should render weight variants correctly', async ({ page }) => {
      await linkStory.goto(page, 'Weight');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all size variants correctly', async ({ page }) => {
      await linkStory.goto(page, 'Sizes');
      await expect(page).toHaveScreenshot();
    });

    test('Should render links with icons correctly', async ({ page }) => {
      await linkStory.goto(page, 'Icons');
      await expect(page).toHaveScreenshot();
    });
  });
});
