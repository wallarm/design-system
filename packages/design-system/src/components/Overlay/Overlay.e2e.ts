import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const overlayStory = createStoryHelper('primitives-overlay', ['Basic'] as const);

test.describe('Component: Overlay', () => {
  test.describe('Visual', () => {
    test('Should render overlay correctly', async ({ page }) => {
      await overlayStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });
  });
});
