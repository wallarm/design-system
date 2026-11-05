import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const settingsStory = createStoryHelper('patterns-settings-page', [
  'Default',
  'Invalid Value',
  'Action Row',
  'Locked Value',
  'Read Only Value',
  'Saving',
] as const);

test.describe('Pattern: Settings page', () => {
  test.describe('Visual', () => {
    test('Should render the full page correctly', async ({ page }) => {
      await settingsStory.goto(page, 'Default');
      await expect(page.getByTestId('profile-name')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the invalid value state correctly', async ({ page }) => {
      await settingsStory.goto(page, 'Invalid Value');
      await expect(page.getByTestId('profile-name')).toHaveAttribute('aria-invalid', 'true');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the action row correctly', async ({ page }) => {
      await settingsStory.goto(page, 'Action Row');
      await expect(page.getByTestId('profile-sidebar-style')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the locked value correctly', async ({ page }) => {
      await settingsStory.goto(page, 'Locked Value');
      await expect(page.getByTestId('profile-two-factor')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the read-only value correctly', async ({ page }) => {
      await settingsStory.goto(page, 'Read Only Value');
      await expect(page.getByTestId('profile-email')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the saving state correctly', async ({ page }) => {
      await settingsStory.goto(page, 'Saving');
      await expect(page.getByTestId('profile-weekly-report')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should save the name on blur and confirm with a toast', async ({ page }) => {
      await settingsStory.goto(page, 'Default');
      const name = page.getByTestId('profile-name');
      await name.fill('Maria Lopez-Garcia');
      await name.blur();
      await expect(page.getByRole('status').filter({ hasText: 'Name updated' })).toBeVisible();
    });

    test('Should show an error and not save an empty name', async ({ page }) => {
      await settingsStory.goto(page, 'Default');
      const name = page.getByTestId('profile-name');
      await name.fill('');
      await name.blur();
      await expect(name).toHaveAttribute('aria-invalid', 'true');
      await expect(page.getByRole('status')).toHaveCount(0);
    });

    test('Should save a choice on change', async ({ page }) => {
      await settingsStory.goto(page, 'Default');
      await page.getByTestId('profile-time-format').getByText('12-hour').click();
      await expect(
        page.getByRole('status').filter({ hasText: 'Time format updated' }),
      ).toBeVisible();
    });
  });
});
