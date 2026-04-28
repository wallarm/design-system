import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const attributeStory = createStoryHelper('data-display-attribute', [
  'Horizontal',
  'Horizontal Label Truncation',
  'Horizontal Value Truncation',
  'Horizontal Composition',
  'Horizontal Loading',
] as const);

test.describe('Component: Attribute', () => {
  test.describe('Visual', () => {
    test('Should render horizontal orientation correctly', async ({ page }) => {
      await attributeStory.goto(page, 'Horizontal');
      await expect(page).toHaveScreenshot();
    });

    test('Should render horizontal label truncation correctly', async ({ page }) => {
      await attributeStory.goto(page, 'Horizontal Label Truncation');
      await expect(page).toHaveScreenshot();
    });

    test('Should render horizontal value truncation correctly', async ({ page }) => {
      await attributeStory.goto(page, 'Horizontal Value Truncation');
      await expect(page).toHaveScreenshot();
    });

    test('Should render horizontal composition correctly', async ({ page }) => {
      await attributeStory.goto(page, 'Horizontal Composition');
      await expect(page).toHaveScreenshot();
    });

    test('Should render horizontal loading correctly', async ({ page }) => {
      await attributeStory.goto(page, 'Horizontal Loading');
      await expect(page).toHaveScreenshot();
    });
  });
});
