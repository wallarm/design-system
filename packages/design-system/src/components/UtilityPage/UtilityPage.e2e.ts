import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const utilityPageStory = createStoryHelper('pages-utilitypage', [
  'Error 404',
  'Error 403',
  'Error 500',
  'Offline',
] as const);

test.describe('Component: UtilityPage', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test.describe('Visual', () => {
    test('Should render 404 error page correctly', async ({ page }) => {
      await utilityPageStory.goto(page, 'Error 404');
      await expect(page).toHaveScreenshot();
    });

    test('Should render 403 error page correctly', async ({ page }) => {
      await utilityPageStory.goto(page, 'Error 403');
      await expect(page).toHaveScreenshot();
    });

    test('Should render 500 error page correctly', async ({ page }) => {
      await utilityPageStory.goto(page, 'Error 500');
      await expect(page).toHaveScreenshot();
    });

    test('Should render offline page correctly', async ({ page }) => {
      await utilityPageStory.goto(page, 'Offline');
      await expect(page).toHaveScreenshot();
    });
  });
});
