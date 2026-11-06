import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const entityTableStory = createStoryHelper('patterns-entity-table', [
  'Default',
  'Cells',
  'Row Menu',
  'Loading',
  'Empty',
] as const);

test.describe('Pattern: Entity table', () => {
  test.describe('Visual', () => {
    test('Should render the full table correctly', async ({ page }) => {
      await entityTableStory.goto(page, 'Default');
      await expect(page.getByTestId('users-table--container--row')).toHaveCount(6);
      await expect(page).toHaveScreenshot();
    });

    test('Should render the cells correctly', async ({ page }) => {
      await entityTableStory.goto(page, 'Cells');
      await expect(page.getByTestId('users-table--container--row')).toHaveCount(6);
      await expect(page).toHaveScreenshot();
    });

    test('Should render the row menu in the master cell correctly', async ({ page }) => {
      await entityTableStory.goto(page, 'Row Menu');
      await expect(page.getByTestId('users-table--container--row')).toHaveCount(6);
      await page.getByTestId('users-table--container--row').first().hover();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the loading state correctly', async ({ page }) => {
      await entityTableStory.goto(page, 'Loading');
      await expect(page.getByTestId('users-table--container--loading')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the empty state correctly', async ({ page }) => {
      await entityTableStory.goto(page, 'Empty');
      await expect(page.getByTestId('users-empty-state')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should show the bulk bar when rows are selected', async ({ page }) => {
      await entityTableStory.goto(page, 'Default');
      await expect(page.getByTestId('users-bulk-delete')).toBeHidden();
      // Ark checkbox control: the native input is visually hidden.
      await page
        .getByTestId('users-table--container--row')
        .first()
        .locator('[data-scope="checkbox"][data-part="control"]')
        .click();
      await expect(page.getByTestId('users-bulk-delete')).toBeVisible();
    });

    test('Should open the row menu with the destructive action last', async ({ page }) => {
      await entityTableStory.goto(page, 'Default');
      const row = page.getByTestId('users-table--container--row').first();
      await row.hover();
      await row.getByRole('button', { name: 'Actions for Maria Lopez' }).click();
      const menu = page.getByTestId('users-row-menu--content');
      await expect(menu).toBeVisible();
      await expect(menu.getByRole('menuitem').last()).toHaveText('Delete user');
    });
  });
});
