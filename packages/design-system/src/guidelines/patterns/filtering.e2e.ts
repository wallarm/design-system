import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const filteringStory = createStoryHelper('patterns-filtering', [
  'Default',
  'Searchable Select',
  'Picker Dialog',
] as const);

test.describe('Pattern: Filtering', () => {
  test.describe('Visual', () => {
    test('Should render the filter bar over the table correctly', async ({ page }) => {
      await filteringStory.goto(page, 'Default');
      await expect(page.getByTestId('attacks-table--container--row')).toHaveCount(8);
      await expect(page).toHaveScreenshot();
    });

    test('Should render the searchable select correctly', async ({ page }) => {
      await filteringStory.goto(page, 'Searchable Select');
      await expect(page.getByTestId('timezone-select')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the picker dialog correctly', async ({ page }) => {
      await filteringStory.goto(page, 'Picker Dialog');
      await page.getByTestId('members-add').click();
      await expect(page.getByTestId('members-table--container--row')).toHaveCount(7);
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should narrow rows when filter values are picked', async ({ page }) => {
      await filteringStory.goto(page, 'Default');
      await page.getByTestId('attacks-type-filter--trigger').click();
      await page
        .getByTestId('attacks-type-filter--content')
        .getByRole('option', { name: /SQL injection/ })
        .click();
      await expect(page.getByTestId('attacks-table--container--row')).toHaveCount(3);
      await page.keyboard.press('Escape');

      await page.getByTestId('attacks-status-filter--trigger').click();
      await page
        .getByTestId('attacks-status-filter--content')
        .getByRole('option', { name: 'Monitored' })
        .click();
      await expect(page.getByTestId('attacks-table--container--row')).toHaveCount(1);
    });

    test('Should show every row again when reset filters is clicked', async ({ page }) => {
      await filteringStory.goto(page, 'Default');
      await page.getByTestId('attacks-search').getByRole('textbox').fill('wp-admin');
      await page
        .getByTestId('attacks-no-results')
        .getByRole('button', { name: 'Reset filters' })
        .click();
      await expect(page.getByTestId('attacks-table--container--row')).toHaveCount(8);
      await expect(page.getByTestId('attacks-search').getByRole('textbox')).toHaveValue('');
    });

    test('Should narrow time zones by the menu search', async ({ page }) => {
      await filteringStory.goto(page, 'Searchable Select');
      await page.getByTestId('timezone-input').click();
      await page.getByTestId('timezone-select--search-input').getByRole('textbox').fill('tok');
      await expect(page.getByTestId('timezone-select--content--option')).toHaveCount(1);
    });

    test('Should count the picked users on the primary button', async ({ page }) => {
      await filteringStory.goto(page, 'Picker Dialog');
      await page.getByTestId('members-add').click();
      await expect(page.getByTestId('members-confirm')).toBeDisabled();
      const rows = page.getByTestId('members-table--container--row');
      await rows.nth(0).getByRole('checkbox').check();
      await rows.nth(1).getByRole('checkbox').check();
      await expect(page.getByTestId('members-confirm')).toHaveText('Add 2 users');
    });
  });
});
