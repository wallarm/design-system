import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const emptyStatesStory = createStoryHelper('patterns-empty-states', [
  'Default',
  'No Results',
  'Section Table',
  'Dependency',
  'Empty Tabs',
  'Small Containers',
] as const);

test.describe('Pattern: Empty states', () => {
  test.describe('Visual', () => {
    test('Should render the empty page table correctly', async ({ page }) => {
      await emptyStatesStory.goto(page, 'Default');
      await expect(page.getByTestId('triggers-empty-state')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the no results state correctly', async ({ page }) => {
      await emptyStatesStory.goto(page, 'No Results');
      await expect(page.getByTestId('triggers-no-results')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the empty section table correctly', async ({ page }) => {
      await emptyStatesStory.goto(page, 'Section Table');
      await expect(page.getByTestId('mapping-rules-empty-state')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the missing dependency state correctly', async ({ page }) => {
      await emptyStatesStory.goto(page, 'Dependency');
      await expect(page.getByTestId('operations-empty-state')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the empty tab correctly', async ({ page }) => {
      await emptyStatesStory.goto(page, 'Empty Tabs');
      await expect(page.getByTestId('notifications-unread-empty')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the small container states correctly', async ({ page }) => {
      await emptyStatesStory.goto(page, 'Small Containers');
      await expect(page.getByTestId('incidents-column-empty')).toBeVisible();
      await expect(page.getByTestId('attacks-chart-empty')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should switch to the no results copy when a search is typed', async ({ page }) => {
      await emptyStatesStory.goto(page, 'Default');
      await page.getByTestId('triggers-search').getByRole('textbox').fill('brute');
      await expect(page.getByTestId('triggers-no-results')).toBeVisible();
      await expect(page.getByTestId('triggers-empty-state')).toBeHidden();
    });

    test('Should show every row again when reset filters is clicked', async ({ page }) => {
      await emptyStatesStory.goto(page, 'No Results');
      await page
        .getByTestId('triggers-no-results')
        .getByRole('button', { name: 'Reset filters' })
        .click();
      await expect(page.getByTestId('triggers-table--container--row')).toHaveCount(3);
      await expect(page.getByTestId('triggers-search').getByRole('textbox')).toHaveValue('');
    });

    test('Should show per-tab copy when another tab is selected', async ({ page }) => {
      await emptyStatesStory.goto(page, 'Empty Tabs');
      await page.getByTestId('notifications-tabs').getByRole('tab', { name: 'Read' }).click();
      await expect(page.getByTestId('notifications-read-empty')).toBeVisible();
    });
  });
});
