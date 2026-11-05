import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const resourceListStory = createStoryHelper('patterns-resource-list-page', [
  'Default',
  'No Results',
  'Empty',
] as const);

test.describe('Pattern: Resource list page', () => {
  test.describe('Visual', () => {
    test('Should render the full page correctly', async ({ page }) => {
      await resourceListStory.goto(page, 'Default');
      await expect(page.getByTestId('users-table--container--row')).toHaveCount(6);
      await expect(page).toHaveScreenshot();
    });

    test('Should render the no results state correctly', async ({ page }) => {
      await resourceListStory.goto(page, 'No Results');
      await expect(page.getByTestId('users-no-results')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the empty state correctly', async ({ page }) => {
      await resourceListStory.goto(page, 'Empty');
      await expect(page.getByTestId('users-empty-state')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should filter rows when a status tab is selected', async ({ page }) => {
      await resourceListStory.goto(page, 'Default');
      await page
        .getByTestId('users-status-tabs')
        .getByRole('tab', { name: /Invited/ })
        .click();
      await expect(page.getByTestId('users-table--container--row')).toHaveCount(2);
    });

    test('Should show every row again when reset filters is clicked', async ({ page }) => {
      await resourceListStory.goto(page, 'No Results');
      await page
        .getByTestId('users-no-results')
        .getByRole('button', { name: 'Reset filters' })
        .click();
      await expect(page.getByTestId('users-table--container--row')).toHaveCount(6);
      await expect(page.getByTestId('users-search').getByRole('textbox')).toHaveValue('');
    });
  });
});
