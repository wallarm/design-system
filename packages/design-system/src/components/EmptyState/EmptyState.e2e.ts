import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const emptyStateStory = createStoryHelper('pages-emptystate', [
  'Collection Empty',
  'No Results',
  'Minimal',
  'No Results Examples',
] as const);

test.describe('Component: EmptyState', () => {
  test.describe('Visual', () => {
    test('Should render collection empty variant correctly', async ({ page }) => {
      await emptyStateStory.goto(page, 'Collection Empty');
      await expect(page).toHaveScreenshot();
    });

    test('Should render no results variant correctly', async ({ page }) => {
      await emptyStateStory.goto(page, 'No Results');
      await expect(page).toHaveScreenshot();
    });

    test('Should render minimal variant correctly', async ({ page }) => {
      await emptyStateStory.goto(page, 'Minimal');
      await expect(page).toHaveScreenshot();
    });

    test('Should render no results examples correctly', async ({ page }) => {
      await emptyStateStory.goto(page, 'No Results Examples');
      await expect(page).toHaveScreenshot();
    });
  });
});
