import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const inlineEditStory = createStoryHelper('data-display-inlineedit', [
  'Gallery',
  'States',
  'Async',
  'Non Editable',
  'Custom Editor',
  'Confirm Commit',
] as const);

test.describe('Component: InlineEdit', () => {
  test.describe('Visual', () => {
    test('Should render the editor gallery correctly', async ({ page }) => {
      await inlineEditStory.goto(page, 'Gallery');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render hover affordance with tooltip correctly', async ({ page }) => {
      await inlineEditStory.goto(page, 'Gallery');
      await page.getByTestId('text--preview').hover();
      await expect(page.getByTestId('text--content')).toHaveText('Edit');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the editing state correctly', async ({ page }) => {
      await inlineEditStory.goto(page, 'Gallery');
      await page.getByTestId('text--preview').click();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render async-feedback states correctly', async ({ page }) => {
      await inlineEditStory.goto(page, 'States');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render non-editable states correctly', async ({ page }) => {
      await inlineEditStory.goto(page, 'Non Editable');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the commit confirmation dialog correctly', async ({ page }) => {
      await inlineEditStory.goto(page, 'Confirm Commit');
      await page.getByTestId('confirm-email--preview').click();
      const input = page.getByTestId('confirm-email--input');
      await input.fill('new@wallarm.com');
      await input.press('Enter');
      await expect(page.getByTestId('confirm-dialog--content')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });
  });

  test.describe('Interactions', () => {
    test('Should enter edit mode and commit on Enter', async ({ page }) => {
      await inlineEditStory.goto(page, 'Gallery');
      await page.getByTestId('text--preview').click();
      const input = page.getByTestId('text--input');
      await expect(input).toBeFocused();
      await input.fill('Payments API');
      await input.press('Enter');
      await expect(page.getByTestId('text--preview')).toHaveText(/Payments API/);
    });

    test('Should revert on Escape', async ({ page }) => {
      await inlineEditStory.goto(page, 'Gallery');
      await page.getByTestId('text--preview').click();
      const input = page.getByTestId('text--input');
      await input.fill('Discarded');
      await input.press('Escape');
      await expect(page.getByTestId('text--preview')).toHaveText(/Checkout API/);
    });

    test('Should commit on blur', async ({ page }) => {
      await inlineEditStory.goto(page, 'Gallery');
      await page.getByTestId('text--preview').click();
      const input = page.getByTestId('text--input');
      await input.fill('Blurred API');
      await input.press('Tab');
      await expect(page.getByTestId('text--preview')).toHaveText(/Blurred API/);
    });

    test('Should show loading then saved during async commit', async ({ page }) => {
      await inlineEditStory.goto(page, 'Async');
      await page.getByTestId('attr--preview').click();
      const input = page.getByTestId('attr--input');
      await input.fill('Async API');
      await input.press('Enter');
      await expect(page.getByTestId('attr--preview')).toHaveText(/Async API/);
    });

    test('Should surface error and stay in edit on rejected commit', async ({ page }) => {
      await inlineEditStory.goto(page, 'Async');
      await page.getByTestId('attr--preview').click();
      const input = page.getByTestId('attr--input');
      await input.fill('');
      await input.press('Enter');
      await expect(page.getByTestId('attr--error')).toBeVisible();
      await expect(page.getByTestId('attr--input')).toBeVisible();
    });

    test('Should commit a select pick when the dropdown closes', async ({ page }) => {
      await inlineEditStory.goto(page, 'Gallery');
      await page.getByTestId('select--preview').click();
      await page.getByRole('option', { name: 'Admin' }).click();
      await expect(page.getByTestId('select--preview')).toHaveText(/Admin/);
    });

    test('Should commit a date pick when the calendar closes', async ({ page }) => {
      await inlineEditStory.goto(page, 'Gallery');
      await page.getByTestId('date--preview').click();
      await page.locator('[data-part="table-cell-trigger"]', { hasText: /^20$/ }).first().click();
      await page.mouse.click(5, 5);
      await expect(page.getByTestId('date--preview')).toHaveText(/20 Jun, 2026/);
    });

    test('Should commit a time edit when the date-time popover closes', async ({ page }) => {
      await inlineEditStory.goto(page, 'Gallery');
      const preview = page.getByTestId('datetime--preview');
      await expect(preview).toHaveText(/2:30 PM/);
      await preview.click();
      const popover = page.locator('[data-scope="date-picker"][data-part="content"]');
      await popover.getByRole('spinbutton', { name: 'hour' }).click();
      await page.keyboard.type('5');
      await page.mouse.click(5, 5);
      await expect(preview).toHaveText(/5:30 PM/);
    });

    test('Should keep the time when a day is picked from the date-time grid', async ({ page }) => {
      await inlineEditStory.goto(page, 'Gallery');
      const preview = page.getByTestId('datetime--preview');
      await preview.click();
      await page.locator('[data-part="table-cell-trigger"]', { hasText: /^20$/ }).first().click();
      await page.mouse.click(5, 5);
      await expect(preview).toHaveText(/20 Jun, 2026 2:30 PM/);
    });

    test('Should commit a time edit on blur', async ({ page }) => {
      await inlineEditStory.goto(page, 'Gallery');
      await page.getByTestId('time--preview').click();
      const hour = page.getByRole('spinbutton', { name: 'hour' }).first();
      await hour.click();
      await page.keyboard.type('9');
      await page.getByTestId('text--preview').click(); // blur out
      await expect(page.getByTestId('time--preview')).toHaveText(/9:30/);
    });

    test('Should not enter edit mode when readOnly', async ({ page }) => {
      await inlineEditStory.goto(page, 'Non Editable');
      await page.getByTestId('readonly--preview').click();
      await expect(page.getByTestId('readonly--input')).toHaveCount(0);
    });

    test('Should not enter edit mode when disabled', async ({ page }) => {
      await inlineEditStory.goto(page, 'Non Editable');
      await page.getByTestId('disabled--preview').click();
      await expect(page.getByTestId('disabled--input')).toHaveCount(0);
    });

    test('Should commit through a custom render-prop editor', async ({ page }) => {
      await inlineEditStory.goto(page, 'Custom Editor');
      await page.getByTestId('custom--preview').click();
      const input = page.getByRole('textbox', { name: 'Custom' });
      await input.fill('payments api');
      await input.press('Enter');
      await expect(page.getByTestId('custom--preview')).toHaveText(/PAYMENTS API/);
    });

    test('Should keep editing with the draft when the confirmation is declined', async ({
      page,
    }) => {
      await inlineEditStory.goto(page, 'Confirm Commit');
      await page.getByTestId('confirm-email--preview').click();
      const input = page.getByTestId('confirm-email--input');
      await input.fill('new@wallarm.com');
      await input.press('Enter');
      await page.getByTestId('confirm-decline').click();
      await expect(input).toBeVisible();
      await expect(input).toHaveValue('new@wallarm.com');
    });

    test('Should commit when the confirmation is accepted', async ({ page }) => {
      await inlineEditStory.goto(page, 'Confirm Commit');
      await page.getByTestId('confirm-email--preview').click();
      const input = page.getByTestId('confirm-email--input');
      await input.fill('new@wallarm.com');
      await input.press('Enter');
      await page.getByTestId('confirm-accept').click();
      await expect(page.getByTestId('confirm-email--preview')).toHaveText(/new@wallarm.com/);
    });

    test('Should not prompt when the submitted value is unchanged', async ({ page }) => {
      await inlineEditStory.goto(page, 'Confirm Commit');
      await page.getByTestId('confirm-email--preview').click();
      await page.getByTestId('confirm-email--input').press('Enter');
      await expect(page.getByTestId('confirm-email--preview')).toBeVisible();
      await expect(page.getByTestId('confirm-accept')).toBeHidden();
    });

    test('Should park a declined select in edit mode and ask again on reclose', async ({
      page,
    }) => {
      await inlineEditStory.goto(page, 'Confirm Commit');
      await page.getByTestId('confirm-role--preview').click();
      await page.getByRole('option', { name: 'Admin' }).click(); // closes popover → guard
      await page.getByTestId('confirm-decline').click();
      // Parked: still in edit mode (collapsed trigger, no preview).
      await expect(page.getByTestId('confirm-role--preview')).toBeHidden();
      await expect(page.getByTestId('confirm-role--input')).toBeVisible();
      // Recovery: reopen and re-close the popover — the guard fires again.
      await page.getByTestId('confirm-role--input').click();
      await page.getByRole('option', { name: 'Admin' }).click();
      await page.getByTestId('confirm-accept').click();
      await expect(page.getByTestId('confirm-role--preview')).toHaveText(/Admin/);
    });
  });

  test.describe('Accessibility', () => {
    test('Should enter edit via keyboard activation', async ({ page }) => {
      await inlineEditStory.goto(page, 'Gallery');
      const preview = page.getByTestId('text--preview');
      await preview.focus();
      await preview.press('Enter');
      await expect(page.getByTestId('text--input')).toBeFocused();
    });

    test('Should cancel edit via Escape', async ({ page }) => {
      await inlineEditStory.goto(page, 'Gallery');
      await page.getByTestId('text--preview').click();
      await page.getByTestId('text--input').press('Escape');
      await expect(page.getByTestId('text--preview')).toBeVisible();
    });

    test('Should reach the preview in tab order and expose the editor name', async ({ page }) => {
      await inlineEditStory.goto(page, 'Gallery');
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('text--preview')).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('textbox', { name: 'Name' })).toBeFocused();
    });

    test('Should return focus to the editor when the confirmation is declined', async ({
      page,
    }) => {
      await inlineEditStory.goto(page, 'Confirm Commit');
      await page.getByTestId('confirm-email--preview').click();
      const input = page.getByTestId('confirm-email--input');
      await input.fill('new@wallarm.com');
      await input.press('Enter');
      // Focus moved into the dialog while it decides.
      await expect(page.getByTestId('confirm-decline')).toBeVisible();
      await expect(input).not.toBeFocused();
      await page.getByTestId('confirm-decline').click();
      await expect(input).toBeFocused();
    });
  });
});
