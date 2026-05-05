import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const httpMethodStory = createStoryHelper('data-display-httpmethod', [
  'Playground',
  'All Methods',
  'Sizes',
  'Unknown Method Falls Back To Slate',
] as const);

test.describe('Component: HttpMethod', () => {
  test.describe('Visual', () => {
    test('Should render every HTTP method with its color', async ({ page }) => {
      await httpMethodStory.goto(page, 'All Methods');
      await expect(page).toHaveScreenshot();
    });

    test('Should render medium and large sizes', async ({ page }) => {
      await httpMethodStory.goto(page, 'Sizes');
      await expect(page).toHaveScreenshot();
    });

    test('Should render unknown methods in slate as the OTHER fallback', async ({ page }) => {
      await httpMethodStory.goto(page, 'Unknown Method Falls Back To Slate');
      await expect(page).toHaveScreenshot();
    });
  });
});
