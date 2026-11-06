import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const complexDrawerStory = createStoryHelper('patterns-complex-drawer', [
  'Default',
  'Header',
  'Overview Tab',
  'Requests Tab',
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
      await expect(page.getByTestId('attack-info-card')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the header correctly', async ({ page }) => {
      await complexDrawerStory.goto(page, 'Header');
      await page.getByTestId('attack-drawer--trigger').click();
      await expect(page.getByTestId('attack-summary')).toContainText('0/55 blocked');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the overview tab correctly', async ({ page }) => {
      await complexDrawerStory.goto(page, 'Overview Tab');
      await page.getByTestId('attack-drawer--trigger').click();
      await expect(page.getByTestId('attack-overview')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the requests tab correctly', async ({ page }) => {
      await complexDrawerStory.goto(page, 'Requests Tab');
      await page.getByTestId('attack-drawer--trigger').click();
      await expect(page.getByTestId('attack-request')).toContainText('Full request');
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
      await page
        .getByTestId('attack-request-list')
        .getByRole('button', { name: /accounts\/export/ })
        .click();
      await expect(page.getByTestId('attack-request')).toContainText('req-3');
    });

    test('Should reset the tab when another attack opens', async ({ page }) => {
      await complexDrawerStory.goto(page, 'Default');
      await page
        .getByTestId('attacks-table')
        .getByText(/^Remote code execution/)
        .click();
      await page.getByRole('tab', { name: /Requests/ }).click();
      await expect(page.getByTestId('attack-request-list').getByRole('button')).toHaveCount(3);
      // The open drawer covers the middle of the long name; click its visible start, as a user would.
      await page
        .getByTestId('attacks-table')
        .getByText(/^Path traversal from/)
        .click({ position: { x: 8, y: 8 } });
      await expect(page.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });
  });
});
