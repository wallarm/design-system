import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const confirmationStory = createStoryHelper('patterns-confirmation-dialogs', [
  'Default',
  'Activate',
  'Type To Confirm',
  'Unsaved Changes',
] as const);

const openUserActions = async (page: Page, name: string) => {
  await page
    .getByTestId('users-table--container--row')
    .filter({ hasText: name })
    .getByTestId('users-actions')
    .click();
};

const openUnsavedChangesGuard = async (page: Page) => {
  await confirmationStory.goto(page, 'Unsaved Changes');
  await page.getByTestId('provider-edit').click();
  await page.getByTestId('provider-name').fill('Okta Staging');
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('unsaved-changes-dialog--content')).toBeVisible();
};

test.describe('Pattern: Confirmation dialogs', () => {
  test.describe('Visual', () => {
    test('Should render the delete confirmation correctly', async ({ page }) => {
      await confirmationStory.goto(page, 'Default');
      await openUserActions(page, 'Maria Lopez');
      await page.getByTestId('users-delete').click();
      await expect(page.getByTestId('delete-user-dialog--content')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the activate confirmation correctly', async ({ page }) => {
      await confirmationStory.goto(page, 'Activate');
      await page.getByTestId('user-change-status').click();
      await expect(page.getByTestId('user-status-dialog--content')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the type to confirm dialog correctly', async ({ page }) => {
      await confirmationStory.goto(page, 'Type To Confirm');
      await page.getByTestId('provider-delete').click();
      await expect(page.getByTestId('delete-provider-dialog--content')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the unsaved changes guard correctly', async ({ page }) => {
      await openUnsavedChangesGuard(page);
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });
  });

  test.describe('Interactions', () => {
    test('Should remove the row when delete is confirmed', async ({ page }) => {
      await confirmationStory.goto(page, 'Default');
      await openUserActions(page, 'Maria Lopez');
      await page.getByTestId('users-delete').click();
      await page.getByTestId('delete-user-confirm').click();
      await expect(page.getByTestId('delete-user-dialog--content')).toBeHidden();
      await expect(page.getByTestId('users-table--container--row')).toHaveCount(3);
    });

    test('Should keep every row when cancel is clicked', async ({ page }) => {
      await confirmationStory.goto(page, 'Default');
      await openUserActions(page, 'Maria Lopez');
      await page.getByTestId('users-delete').click();
      await page.getByTestId('delete-user-cancel').click();
      await expect(page.getByTestId('delete-user-dialog--content')).toBeHidden();
      await expect(page.getByTestId('users-table--container--row')).toHaveCount(4);
    });

    test('Should enable confirm only when the name matches exactly', async ({ page }) => {
      await confirmationStory.goto(page, 'Type To Confirm');
      await page.getByTestId('provider-delete').click();
      const input = page.getByTestId('delete-provider-input');
      const confirm = page.getByTestId('delete-provider-confirm');
      await expect(confirm).toBeDisabled();
      await input.fill('okta production');
      await expect(confirm).toBeDisabled();
      await input.fill('Okta Production');
      await expect(confirm).toBeEnabled();
    });

    test('Should reset the input when the dialog is reopened', async ({ page }) => {
      await confirmationStory.goto(page, 'Type To Confirm');
      await page.getByTestId('provider-delete').click();
      await page.getByTestId('delete-provider-input').fill('Okta');
      await page.keyboard.press('Escape');
      await expect(page.getByTestId('delete-provider-dialog--content')).toBeHidden();
      await page.getByTestId('provider-delete').click();
      await expect(page.getByTestId('delete-provider-input')).toHaveValue('');
    });

    test('Should keep the drawer open when keep editing is clicked', async ({ page }) => {
      await openUnsavedChangesGuard(page);
      await page.getByTestId('unsaved-changes-keep').click();
      await expect(page.getByTestId('unsaved-changes-dialog--content')).toBeHidden();
      await expect(page.getByTestId('provider-name')).toHaveValue('Okta Staging');
    });

    test('Should close the drawer when leave without saving is clicked', async ({ page }) => {
      await openUnsavedChangesGuard(page);
      await page.getByTestId('unsaved-changes-leave').click();
      await expect(page.getByTestId('edit-provider-drawer--content')).toBeHidden();
    });
  });
});
