import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const responseCodeStory = createStoryHelper('data-display-responsecode', [
  'Playground',
  'All Categories',
  'Real World Codes',
  'Sizes',
  'Wildcard Groups',
  'Unknown Code Falls Back To Slate',
] as const);

test.describe('Component: ResponseCode', () => {
  test.describe('Visual', () => {
    test('Should render every status category with its color', async ({ page }) => {
      await responseCodeStory.goto(page, 'All Categories');
      await expect(page).toHaveScreenshot();
    });

    test('Should render real-world status codes per category', async ({ page }) => {
      await responseCodeStory.goto(page, 'Real World Codes');
      await expect(page).toHaveScreenshot();
    });

    test('Should render medium and large sizes', async ({ page }) => {
      await responseCodeStory.goto(page, 'Sizes');
      await expect(page).toHaveScreenshot();
    });

    test('Should render wildcard groups per category', async ({ page }) => {
      await responseCodeStory.goto(page, 'Wildcard Groups');
      await expect(page).toHaveScreenshot();
    });

    test('Should render unknown codes in slate as the unknown fallback', async ({ page }) => {
      await responseCodeStory.goto(page, 'Unknown Code Falls Back To Slate');
      await expect(page).toHaveScreenshot();
    });
  });
});
