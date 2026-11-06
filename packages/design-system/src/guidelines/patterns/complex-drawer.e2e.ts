import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const complexDrawerStory = createStoryHelper('patterns-complex-drawer', [
  'Default',
  'Header',
  'Charts',
  'Split View',
  'Loading',
] as const);

test.describe('Pattern: Complex drawer', () => {
  test.describe('Visual', () => {
    test('Should render the open drawer correctly', async ({ page }) => {
      await complexDrawerStory.goto(page, 'Default');
      await page
        .getByTestId('attacks-table')
        .getByText(/^Remote code execution/)
        .click();
      await expect(page.getByTestId('attack-drawer--title')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the header correctly', async ({ page }) => {
      await complexDrawerStory.goto(page, 'Header');
      await page.getByTestId('attack-drawer--trigger').click();
      await expect(page.getByTestId('attack-attributes')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the charts correctly', async ({ page }) => {
      await complexDrawerStory.goto(page, 'Charts');
      await page.getByTestId('attack-drawer--trigger').click();
      await expect(page.getByTestId('attack-charts')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the split view correctly', async ({ page }) => {
      await complexDrawerStory.goto(page, 'Split View');
      await page.getByTestId('attack-drawer--trigger').click();
      await expect(page.getByTestId('attack-request')).toContainText('/api/v1/accounts/sync');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the loading state correctly', async ({ page }) => {
      await complexDrawerStory.goto(page, 'Loading');
      await page.getByTestId('attack-drawer--trigger').click();
      await expect(page.getByTestId('attack-loading')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should show the clicked request next to the list', async ({ page }) => {
      await complexDrawerStory.goto(page, 'Default');
      await page
        .getByTestId('attacks-table')
        .getByText(/^Remote code execution/)
        .click();
      await page.getByRole('tab', { name: /Requests/ }).click();
      await expect(page.getByTestId('attack-request')).toContainText('Select a request');
      await page.getByTestId('attack-requests-table').getByText('/api/v1/accounts/export').click();
      await expect(page.getByTestId('attack-request')).toContainText(
        'POST /api/v1/accounts/export',
      );
    });

    test('Should switch to the requests tab and reset it for the next row', async ({ page }) => {
      await complexDrawerStory.goto(page, 'Default');
      await page
        .getByTestId('attacks-table')
        .getByText(/^Remote code execution/)
        .click();
      await page.getByRole('tab', { name: /Requests/ }).click();
      await expect(page.getByTestId('attack-requests-table--container--row')).toHaveCount(3);
      await page
        .getByTestId('attacks-table')
        .getByText(/^Path traversal from/)
        .click();
      await expect(page.getByTestId('attack-drawer--title')).toHaveText(/^Path traversal from/);
      await expect(page.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });
  });
});
