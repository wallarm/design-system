import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const eventDrawerStory = createStoryHelper('patterns-event-drawer', [
  'Default',
  'Header',
  'Charts',
  'Loading',
] as const);

test.describe('Pattern: Event drawer', () => {
  test.describe('Visual', () => {
    test('Should render the open drawer correctly', async ({ page }) => {
      await eventDrawerStory.goto(page, 'Default');
      await page
        .getByTestId('attacks-table')
        .getByText(/^Remote code execution/)
        .click();
      await expect(page.getByTestId('attack-drawer--title')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the header correctly', async ({ page }) => {
      await eventDrawerStory.goto(page, 'Header');
      await page.getByTestId('attack-drawer--trigger').click();
      await expect(page.getByTestId('attack-attributes')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the charts correctly', async ({ page }) => {
      await eventDrawerStory.goto(page, 'Charts');
      await page.getByTestId('attack-drawer--trigger').click();
      await expect(page.getByTestId('attack-charts')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the loading state correctly', async ({ page }) => {
      await eventDrawerStory.goto(page, 'Loading');
      await page.getByTestId('attack-drawer--trigger').click();
      await expect(page.getByTestId('attack-loading')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should switch to the requests tab and reset it for the next row', async ({ page }) => {
      await eventDrawerStory.goto(page, 'Default');
      await page
        .getByTestId('attacks-table')
        .getByText(/^Remote code execution/)
        .click();
      await page.getByRole('tab', { name: /Requests/ }).click();
      await expect(page.getByTestId('attack-requests-table--container--row')).toHaveCount(3);
      await page
        .getByTestId('attacks-table')
        .getByText(/^Path traversal/)
        .click();
      await expect(page.getByTestId('attack-drawer--title')).toHaveText(/^Path traversal/);
      await expect(page.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });
  });
});
