import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const codeStory = createStoryHelper('typography-code', [
  'Basic',
  'Sizes',
  'Weights',
  'Colors',
  'Multiline',
  'Italic',
  'As Child',
] as const);

test.describe('Component: Code', () => {
  test.describe('Visual', () => {
    test('Should render basic inline code correctly', async ({ page }) => {
      await codeStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all size variants correctly', async ({ page }) => {
      await codeStory.goto(page, 'Sizes');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all weight variants correctly', async ({ page }) => {
      await codeStory.goto(page, 'Weights');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all color variants correctly', async ({ page }) => {
      await codeStory.goto(page, 'Colors');
      await expect(page).toHaveScreenshot();
    });

    test('Should render multiline code correctly', async ({ page }) => {
      await codeStory.goto(page, 'Multiline');
      await expect(page).toHaveScreenshot();
    });

    test('Should render italic variants correctly', async ({ page }) => {
      await codeStory.goto(page, 'Italic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render as child element correctly', async ({ page }) => {
      await codeStory.goto(page, 'As Child');
      await expect(page).toHaveScreenshot();
    });
  });
});
