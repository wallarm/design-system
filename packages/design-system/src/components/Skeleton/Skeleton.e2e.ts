import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const skeletonStory = createStoryHelper('loading-skeleton', [
  'Basic',
  'Shapes',
  'Transparent',
  'Animated',
] as const);

test.describe('Skeleton Component', () => {
  test.describe('View', () => {
    test('Shapes', async ({ page }) => {
      await skeletonStory.goto(page, 'Shapes');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(page).toHaveScreenshot();
    });

    test('Transparent / non-transparent', async ({ page }) => {
      await skeletonStory.goto(page, 'Transparent');

      const pulseElements = page.locator('.animate-pulse');
      await expect(pulseElements).toHaveCount(2);

      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(page).toHaveScreenshot();
    });

    test('Animated / not animated', async ({ page }) => {
      await skeletonStory.goto(page, 'Animated');

      const pulseElements = page.locator('.animate-pulse');
      await expect(pulseElements).toHaveCount(1);

      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(page).toHaveScreenshot();
    });
  });
});
