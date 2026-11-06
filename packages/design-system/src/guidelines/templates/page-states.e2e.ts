import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const pageStatesStory = createStoryHelper('templates-page-states', [
  'Default',
  'Loading',
  'Empty',
  'No Results',
  'Load Error',
  'No Permission',
  'Partial Failure',
] as const);

test.describe('Template: Page states', () => {
  test.describe('Visual', () => {
    test('Should render the page with data correctly', async ({ page }) => {
      await pageStatesStory.goto(page, 'Default');
      await expect(page.getByTestId('api-tokens-table')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the loading state correctly', async ({ page }) => {
      await pageStatesStory.goto(page, 'Loading');
      await expect(page.getByTestId('api-tokens-table')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the first-use empty state correctly', async ({ page }) => {
      await pageStatesStory.goto(page, 'Empty');
      await expect(page.getByTestId('api-tokens-empty-state')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the no results state correctly', async ({ page }) => {
      await pageStatesStory.goto(page, 'No Results');
      await expect(page.getByTestId('api-tokens-no-results')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the load error state correctly', async ({ page }) => {
      await pageStatesStory.goto(page, 'Load Error');
      await expect(page.getByTestId('api-tokens-error')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the read-only state correctly', async ({ page }) => {
      await pageStatesStory.goto(page, 'No Permission');
      await expect(page.getByTestId('api-tokens-read-only')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the partial failure state correctly', async ({ page }) => {
      await pageStatesStory.goto(page, 'Partial Failure');
      await expect(page.getByTestId('api-tokens-partial-failure')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should open the row menu from the name cell with the destructive action last', async ({
      page,
    }) => {
      await pageStatesStory.goto(page, 'Default');
      const row = page.getByTestId('api-tokens-table--container--row').first();
      await row.hover();
      await row.getByTestId('api-tokens-actions-tok-2201').click();
      const menu = page.getByTestId('api-tokens-row-menu--content');
      await expect(menu).toBeVisible();
      await expect(menu.getByRole('menuitem').last()).toHaveText('Revoke token');
    });

    test('Should clear the search when Reset filters is clicked', async ({ page }) => {
      await pageStatesStory.goto(page, 'No Results');
      await page.getByTestId('api-tokens-reset').click();
      await expect(page.getByTestId('api-tokens-search').getByRole('textbox')).toHaveValue('');
      await expect(
        page.getByTestId('api-tokens-table').getByText('ci-deploy-production'),
      ).toBeVisible();
    });

    test('Should load the tokens when Try again is clicked after a failed request', async ({
      page,
    }) => {
      await pageStatesStory.goto(page, 'Load Error');
      await page.getByTestId('api-tokens-retry').click();
      await expect(page.getByTestId('api-tokens-error')).toBeHidden();
      await expect(page.getByText('ci-deploy-production')).toBeVisible();
    });

    test('Should hide the partial failure alert when Retry is clicked', async ({ page }) => {
      await pageStatesStory.goto(page, 'Partial Failure');
      await page.getByTestId('api-tokens-retry').click();
      await expect(page.getByTestId('api-tokens-partial-failure')).toBeHidden();
    });
  });
});
