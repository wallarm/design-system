import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const stackStory = createStoryHelper('layout-stack', [
  'Basic',
  'Direction',
  'Alignment',
  'Spacing',
  'Wrap',
  'Flex Behavior',
] as const);

test.describe('Component: Stack', () => {
  test.describe('Visual', () => {
    test('Should render basic layout correctly', async ({ page }) => {
      await stackStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render direction variants correctly', async ({ page }) => {
      await stackStory.goto(page, 'Direction');
      await expect(page).toHaveScreenshot();
    });

    test('Should render alignment variants correctly', async ({ page }) => {
      await stackStory.goto(page, 'Alignment');
      await expect(page).toHaveScreenshot();
    });

    test('Should render spacing variants correctly', async ({ page }) => {
      await stackStory.goto(page, 'Spacing');
      await expect(page).toHaveScreenshot();
    });

    test('Should render wrap behavior correctly', async ({ page }) => {
      await stackStory.goto(page, 'Wrap');
      await expect(page).toHaveScreenshot();
    });

    test('Should render flex behavior variants correctly', async ({ page }) => {
      await stackStory.goto(page, 'Flex Behavior');
      await expect(page).toHaveScreenshot();
    });
  });
});
