import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const detailDrawerStory = createStoryHelper('patterns-detail-drawer', [
  'Default',
  'Header',
  'Attributes',
  'Section',
  'Nested Table',
  'Loading',
  'Old Version',
] as const);

test.describe('Pattern: Detail drawer', () => {
  test.describe('Visual', () => {
    test('Should render the open drawer correctly', async ({ page }) => {
      await detailDrawerStory.goto(page, 'Default');
      await page.getByTestId('providers-table').getByText('Okta', { exact: true }).click();
      await expect(page.getByTestId('provider-rules-table--container--row')).toHaveCount(3);
      await expect(page).toHaveScreenshot();
    });

    test('Should render the header correctly', async ({ page }) => {
      await detailDrawerStory.goto(page, 'Header');
      await page.getByTestId('provider-drawer--trigger').click();
      await expect(page.getByTestId('provider-drawer--header')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the attributes correctly', async ({ page }) => {
      await detailDrawerStory.goto(page, 'Attributes');
      await page.getByTestId('provider-drawer--trigger').click();
      await expect(page.getByTestId('provider-attributes')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the section correctly', async ({ page }) => {
      await detailDrawerStory.goto(page, 'Section');
      await page.getByTestId('provider-drawer--trigger').click();
      await expect(page.getByTestId('provider-defaults-section')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the nested table correctly', async ({ page }) => {
      await detailDrawerStory.goto(page, 'Nested Table');
      await page.getByTestId('provider-drawer--trigger').click();
      await expect(page.getByTestId('provider-rules-empty')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the loading state correctly', async ({ page }) => {
      await detailDrawerStory.goto(page, 'Loading');
      await page.getByTestId('providers-table').getByText('Okta', { exact: true }).click();
      await expect(page.getByTestId('provider-attributes')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the old version state correctly', async ({ page }) => {
      await detailDrawerStory.goto(page, 'Old Version');
      await page.getByTestId('providers-table').getByText('Okta', { exact: true }).click();
      await expect(page.getByTestId('provider-version-alert')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should open the clicked entity and switch tabs', async ({ page }) => {
      await detailDrawerStory.goto(page, 'Default');
      await page.getByTestId('providers-table').getByText('Okta', { exact: true }).click();
      await expect(page.getByTestId('provider-drawer--title')).toHaveText('Okta');
      await page
        .getByTestId('provider-tabs')
        .getByRole('tab', { name: /Domains/ })
        .click();
      await expect(page.getByTestId('provider-domains-table--container--row')).toHaveCount(2);
    });

    test('Should show the empty nested collection', async ({ page }) => {
      await detailDrawerStory.goto(page, 'Default');
      await page
        .getByTestId('providers-table')
        .getByText('Google Workspace', { exact: true })
        .click();
      await expect(page.getByTestId('provider-drawer--title')).toHaveText('Google Workspace');
      await expect(page.getByTestId('provider-rules-empty')).toBeVisible();
    });

    test('Should enable actions after going back to the current version', async ({ page }) => {
      await detailDrawerStory.goto(page, 'Old Version');
      await page.getByTestId('providers-table').getByText('Okta', { exact: true }).click();
      await expect(page.getByTestId('provider-actions--trigger')).toBeDisabled();
      await page
        .getByTestId('provider-version-alert')
        .getByRole('button', { name: 'Back to current' })
        .click();
      await expect(page.getByTestId('provider-version-alert')).toBeHidden();
      await expect(page.getByTestId('provider-actions--trigger')).toBeEnabled();
    });
  });
});
