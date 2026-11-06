import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const attackEventsStory = createStoryHelper('templates-attack-events', [
  'Default',
  'No Results',
  'Load Error',
  'Loading',
] as const);

test.describe('Template: Attack events', () => {
  test.describe('Visual', () => {
    test('Should render the event log correctly', async ({ page }) => {
      await attackEventsStory.goto(page, 'Default');
      await expect(page.getByTestId('attacks-table--container--row')).toHaveCount(10);
      await expect(page.getByTestId('attacks-pagination')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the drawer Overview tab correctly', async ({ page }) => {
      await attackEventsStory.goto(page, 'Default');
      await page.getByTestId('attacks-table').getByText('SSRF').first().click();
      await expect(page.getByTestId('attack-overview')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the drawer Requests tab correctly', async ({ page }) => {
      await attackEventsStory.goto(page, 'Default');
      await page.getByTestId('attacks-table').getByText('SSRF').first().click();
      await page
        .getByTestId('attack-tabs')
        .getByRole('tab', { name: /Requests/ })
        .click();
      await page.getByTestId('attack-request-list').getByRole('button').first().click();
      await expect(page.getByTestId('attack-raw-request')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the no results state correctly', async ({ page }) => {
      await attackEventsStory.goto(page, 'No Results');
      await expect(page.getByTestId('attacks-no-results')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the load error state correctly', async ({ page }) => {
      await attackEventsStory.goto(page, 'Load Error');
      await expect(page.getByTestId('attacks-error')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the loading state correctly', async ({ page }) => {
      await attackEventsStory.goto(page, 'Loading');
      await expect(page.getByTestId('attacks-table')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should open the clicked attack on its Overview tab', async ({ page }) => {
      await attackEventsStory.goto(page, 'Default');
      await page.getByTestId('attacks-table').getByText('SSRF').first().click();
      await expect(page.getByTestId('attack-summary')).toContainText('SSRF in post.json.url');
      await expect(page.getByTestId('attack-overview')).toBeVisible();
    });

    test('Should show the selected request with its payload', async ({ page }) => {
      await attackEventsStory.goto(page, 'Default');
      await page.getByTestId('attacks-table').getByText('SSRF').first().click();
      await page
        .getByTestId('attack-tabs')
        .getByRole('tab', { name: /Requests/ })
        .click();
      await page.getByTestId('attack-request-list').getByRole('button').first().click();
      await expect(page.getByTestId('attack-raw-request')).toContainText('169.254.169.254');
    });

    test('Should open the row menu from the master cell', async ({ page }) => {
      await attackEventsStory.goto(page, 'Default');
      const row = page.getByTestId('attacks-table--container--row').first();
      await row.hover();
      await row.getByRole('button', { name: /^Actions for event / }).click();
      await page.getByRole('menuitem', { name: 'Open event' }).click();
      await expect(page.getByTestId('attack-overview')).toBeVisible();
    });

    test('Should mark selected attacks as false positives from the bulk bar', async ({ page }) => {
      await attackEventsStory.goto(page, 'Default');
      const firstRow = page.getByTestId('attacks-table--container--row').first();
      // The real <input> sits visually hidden under the styled control, so a pointer click
      // never lands on it; dispatch the click to the input itself.
      await firstRow.getByRole('checkbox').dispatchEvent('click');
      await page.getByTestId('attacks-bulk-false-positive').click();
      await expect(firstRow.getByText('False positive')).toBeVisible();
    });

    test('Should reset the filter when nothing matches', async ({ page }) => {
      await attackEventsStory.goto(page, 'No Results');
      await page.getByTestId('attacks-reset-filters').click();
      await expect(page.getByTestId('attacks-no-results')).toBeHidden();
      await expect(page.getByTestId('attacks-table--container--row').first()).toBeVisible();
    });

    test('Should load the rows on Try again', async ({ page }) => {
      await attackEventsStory.goto(page, 'Load Error');
      await page.getByTestId('attacks-retry').click();
      await expect(page.getByTestId('attacks-error')).toBeHidden();
      await expect(page.getByTestId('attacks-table--container--row').first()).toBeVisible();
    });
  });
});
