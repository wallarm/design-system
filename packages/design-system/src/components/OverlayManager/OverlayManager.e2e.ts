import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const overlayStory = createStoryHelper('overlay-overlaymanager', [
  'Confirm Dialog',
  'From Menu Item',
  'Stacked Overlays',
  'Unsaved Changes Guard',
] as const);

const getConfirmContent = (page: Page) => page.getByTestId('confirm-delete--content');
const getEditUserContent = (page: Page) => page.getByTestId('edit-user--content');
const getGuardContent = (page: Page) => page.getByTestId('unsaved-changes--content');
const getResult = (page: Page) => page.getByTestId('result');

const openConfirm = async (page: Page) => {
  await page.getByTestId('open-confirm').click();
  await expect(getConfirmContent(page)).toBeVisible();
};

const openEditUser = async (page: Page) => {
  await page.getByTestId('open-edit-user').click();
  await expect(getEditUserContent(page)).toBeVisible();
};

test.describe('Component: OverlayManager', () => {
  test.describe('Visual', () => {
    test('Should render confirm dialog correctly', async ({ page }) => {
      await overlayStory.goto(page, 'Confirm Dialog');
      await openConfirm(page);
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render stacked overlays correctly', async ({ page }) => {
      await overlayStory.goto(page, 'Stacked Overlays');
      await openEditUser(page);
      await page.getByTestId('edit-user-delete').click();
      await expect(getConfirmContent(page)).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });
  });

  test.describe('Interactions', () => {
    test('Should resolve the result when confirm is clicked', async ({ page }) => {
      await overlayStory.goto(page, 'Confirm Dialog');
      await expect(getResult(page)).toHaveText('Result: none yet');
      await openConfirm(page);

      await page.getByTestId('confirm-delete-submit').click();

      await expect(getResult(page)).toHaveText('Result: deleted');
      await expect(getConfirmContent(page)).toBeHidden();
    });

    test('Should resolve cancelled when Escape is pressed', async ({ page }) => {
      await overlayStory.goto(page, 'Confirm Dialog');
      await openConfirm(page);

      await page.keyboard.press('Escape');

      await expect(getResult(page)).toHaveText('Result: cancelled');
      await expect(getConfirmContent(page)).toBeHidden();
    });

    test('Should open the dialog when a menu item is clicked', async ({ page }) => {
      await overlayStory.goto(page, 'From Menu Item');
      await page.getByTestId('row-menu').click();
      await page.getByTestId('row-menu-delete').click();

      await expect(getConfirmContent(page)).toBeVisible();
      // The dialog outlives the menu that opened it.
      await expect(page.getByTestId('row-menu-delete')).toBeHidden();
      await page.getByTestId('confirm-delete-submit').click();
      await expect(getResult(page)).toHaveText('Result: deleted');
    });

    test('Should close only the top overlay when Escape is pressed over a stack', async ({
      page,
    }) => {
      await overlayStory.goto(page, 'Stacked Overlays');
      await openEditUser(page);
      await page.getByTestId('edit-user-delete').click();
      await expect(getConfirmContent(page)).toBeVisible();

      await page.keyboard.press('Escape');

      await expect(getConfirmContent(page)).toBeHidden();
      await expect(getEditUserContent(page)).toBeVisible();
      await expect(getEditUserContent(page)).toHaveAttribute('data-state', 'open');
    });

    test('Should ask before closing when the drawer has unsaved changes', async ({ page }) => {
      await overlayStory.goto(page, 'Unsaved Changes Guard');
      await openEditUser(page);
      await page.getByTestId('edit-user-name').fill('Jane Cooper-Smith');

      await page.keyboard.press('Escape');
      await expect(getGuardContent(page)).toBeVisible();

      await page.getByTestId('unsaved-changes-keep').click();
      // The closing guard stays mounted while it animates out: wait for it before asking again.
      await expect(getGuardContent(page)).toBeHidden();
      await expect(getEditUserContent(page)).toHaveAttribute('data-state', 'open');

      await page.keyboard.press('Escape');
      await expect(getGuardContent(page)).toBeVisible();

      await page.getByTestId('unsaved-changes-leave').click();
      await expect(getEditUserContent(page)).toBeHidden();
    });
  });

  test.describe('Accessibility', () => {
    test('Should be labelled by its title via role', async ({ page }) => {
      await overlayStory.goto(page, 'Confirm Dialog');
      await openConfirm(page);

      await expect(page.getByRole('dialog', { name: 'Delete user?' })).toBeVisible();
    });

    test('Should return focus to the trigger via Escape', async ({ page }) => {
      await overlayStory.goto(page, 'Confirm Dialog');
      await page.getByTestId('open-confirm').focus();
      await page.keyboard.press('Enter');
      await expect(getConfirmContent(page)).toBeVisible();

      await page.keyboard.press('Escape');

      await expect(getConfirmContent(page)).toBeHidden();
      await expect(page.getByTestId('open-confirm')).toBeFocused();
    });
  });
});
