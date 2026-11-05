import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const authPageStory = createStoryHelper('patterns-auth-page', [
  'Default',
  'Select Organization',
  'Reset Password',
] as const);

const goToPasswordStep = async (page: Page) => {
  await authPageStory.goto(page, 'Default');
  await page.getByTestId('sign-in-email').getByRole('textbox').fill('maria.lopez@acme-bank.com');
  await page.getByTestId('sign-in-continue').click();
};

test.describe('Pattern: Auth page', () => {
  // The animated background renders one static frame under reduced motion.
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test.describe('Visual', () => {
    test('Should render the email step correctly', async ({ page }) => {
      await authPageStory.goto(page, 'Default');
      await expect(page.getByTestId('sign-in-email')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the password step correctly', async ({ page }) => {
      await goToPasswordStep(page);
      await expect(page.getByTestId('sign-in-sso')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the wrong credentials state correctly', async ({ page }) => {
      await goToPasswordStep(page);
      await page.getByTestId('sign-in-password').getByPlaceholder('Enter').fill('Winter2026');
      await page.getByTestId('sign-in-submit').click();
      await expect(page.getByTestId('sign-in-password--error')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the organization select correctly', async ({ page }) => {
      await authPageStory.goto(page, 'Select Organization');
      await expect(page.getByTestId('organization-list').getByRole('radio')).toHaveCount(5);
      await expect(page).toHaveScreenshot();
    });

    test('Should render the reset password step correctly', async ({ page }) => {
      await authPageStory.goto(page, 'Reset Password');
      await expect(page.getByTestId('reset-password-card')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should go back to the email step', async ({ page }) => {
      await goToPasswordStep(page);
      await page.getByTestId('sign-in-back').click();
      await expect(page.getByTestId('sign-in-email')).toBeVisible();
      await expect(page.getByTestId('sign-in-sso')).toBeHidden();
    });

    test('Should show every organization when show more is clicked', async ({ page }) => {
      await authPageStory.goto(page, 'Select Organization');
      await page.getByTestId('organization-show-more').click();
      await expect(page.getByTestId('organization-list').getByRole('radio')).toHaveCount(7);
      await expect(page.getByTestId('organization-show-more')).toHaveText('Show less');
    });

    test('Should show a toast once the reset form is complete and submitted', async ({ page }) => {
      await authPageStory.goto(page, 'Reset Password');
      const submit = page.getByTestId('reset-password-submit');
      await expect(submit).toBeDisabled();

      await page.getByTestId('reset-password-code').getByRole('textbox').first().click();
      await page.keyboard.type('482913');
      await page.getByTestId('reset-password-new').getByPlaceholder('Enter').fill('Wallarm#2026');
      await page
        .getByTestId('reset-password-confirm')
        .getByPlaceholder('Enter')
        .fill('Wallarm#2026');

      await expect(submit).toBeEnabled();
      await submit.click();
      await expect(page.getByTestId('password-reset--title')).toHaveText('Password reset');
    });
  });
});
