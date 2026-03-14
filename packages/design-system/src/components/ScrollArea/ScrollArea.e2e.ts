import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const scrollAreaStory = createStoryHelper('layout-scrollarea', ['Vertical', 'Horizontal'] as const);

test.describe('Component: ScrollArea', () => {
  test.describe('Visual', () => {
    test('Should render vertical scroll area correctly', async ({ page }) => {
      await scrollAreaStory.goto(page, 'Vertical');
      await expect(page).toHaveScreenshot();
    });

    test('Should render horizontal scroll area correctly', async ({ page }) => {
      await scrollAreaStory.goto(page, 'Horizontal');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should scroll content when using mouse wheel', async ({ page }) => {
      await scrollAreaStory.goto(page, 'Vertical');

      const viewport = page.locator('[data-scope="scroll-area"][data-part="viewport"]');
      await viewport.hover();
      await page.mouse.wheel(0, 300);

      await expect(page).toHaveScreenshot();
    });
  });
});
