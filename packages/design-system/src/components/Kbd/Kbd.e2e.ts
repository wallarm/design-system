import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const kbdStory = createStoryHelper('primitives-kbd', [
  'Basic',
  'Group',
  'Sizes',
  'With Tooltip',
] as const);

test.describe('Component: Kbd', () => {
  test.describe('Visual', () => {
    test('Should render basic keyboard key correctly', async ({ page }) => {
      await kbdStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render keyboard key groups correctly', async ({ page }) => {
      await kbdStory.goto(page, 'Group');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all size variants correctly', async ({ page }) => {
      await kbdStory.goto(page, 'Sizes');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with tooltip correctly', async ({ page }) => {
      await kbdStory.goto(page, 'With Tooltip');
      await expect(page).toHaveScreenshot();
    });
  });
});
