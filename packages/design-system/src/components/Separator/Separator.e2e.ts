import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const separatorStory = createStoryHelper('primitives-separator', ['Basic'] as const);

test.describe('Component: Separator', () => {
  test.describe('Visual', () => {
    test('Should render horizontal and vertical separators correctly', async ({ page }) => {
      await separatorStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });
  });
});
