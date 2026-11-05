import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const formsStory = createStoryHelper('patterns-create-and-edit-forms', [
  'Create In Dialog',
  'Invalid Field',
  'Edit In Dialog',
  'Create In Drawer With Sections',
  'Create In Drawer With Steps',
] as const);

test.describe('Pattern: Create and edit forms', () => {
  test.describe('Visual', () => {
    test('Should render the create dialog correctly', async ({ page }) => {
      await formsStory.goto(page, 'Create In Dialog');
      await page.getByTestId('create-user-dialog--trigger').click();
      await expect(page.getByTestId('create-user-dialog--content')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render an invalid field correctly', async ({ page }) => {
      await formsStory.goto(page, 'Create In Dialog');
      await page.getByTestId('create-user-dialog--trigger').click();
      await page.getByTestId('create-user-name').fill('Maria Lopez');
      await page.getByTestId('create-user-email').fill('maria.lopez');
      await page.getByTestId('create-user-email').blur();
      await expect(page.getByTestId('create-user-email-error')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the invalid field story correctly', async ({ page }) => {
      await formsStory.goto(page, 'Invalid Field');
      await expect(page.getByTestId('invalid-email-field')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the edit dialog correctly', async ({ page }) => {
      await formsStory.goto(page, 'Edit In Dialog');
      await page.getByTestId('edit-user-dialog--trigger').click();
      await expect(page.getByTestId('edit-user-dialog--content')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the drawer with sections correctly', async ({ page }) => {
      await formsStory.goto(page, 'Create In Drawer With Sections');
      await page.getByTestId('create-provider-drawer--trigger').click();
      await expect(page.getByTestId('create-provider-sections')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the drawer with steps correctly', async ({ page }) => {
      await formsStory.goto(page, 'Create In Drawer With Steps');
      await page.getByTestId('create-policy-drawer--trigger').click();
      await expect(page.getByTestId('create-policy-stepper--content-0')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should enable submit only when required fields are filled', async ({ page }) => {
      await formsStory.goto(page, 'Create In Dialog');
      await page.getByTestId('create-user-dialog--trigger').click();
      const submit = page.getByTestId('create-user-submit');
      await expect(submit).toBeDisabled();
      await page.getByTestId('create-user-name').fill('Maria Lopez');
      await page.getByTestId('create-user-email').fill('maria.lopez@acme-bank.com');
      await expect(submit).toBeEnabled();
    });

    test('Should close the dialog and show a toast after create', async ({ page }) => {
      await formsStory.goto(page, 'Create In Dialog');
      await page.getByTestId('create-user-dialog--trigger').click();
      await page.getByTestId('create-user-name').fill('Maria Lopez');
      await page.getByTestId('create-user-email').fill('maria.lopez@acme-bank.com');
      await page.getByTestId('create-user-submit').click();
      await expect(page.getByTestId('create-user-dialog--content')).toBeHidden();
      await expect(page.getByTestId('user-created')).toBeVisible();
    });

    test('Should enable save changes only after a value changes', async ({ page }) => {
      await formsStory.goto(page, 'Edit In Dialog');
      await page.getByTestId('edit-user-dialog--trigger').click();
      const submit = page.getByTestId('edit-user-submit');
      await expect(page.getByTestId('edit-user-id')).toBeDisabled();
      await expect(submit).toBeDisabled();
      await page.getByTestId('edit-user-name').fill('Daniel A. Okafor');
      await expect(submit).toBeEnabled();
    });

    test('Should show the connection result in its section', async ({ page }) => {
      await formsStory.goto(page, 'Create In Drawer With Sections');
      await page.getByTestId('create-provider-drawer--trigger').click();
      await page.getByTestId('create-provider-domain').fill('https://acme-bank.okta.com');
      await page.getByTestId('create-provider-client-id').fill('0oa1x2y3z4');
      await page.getByTestId('create-provider-client-secret').fill('s3cr3t');
      await page.getByTestId('create-provider-test').click();
      await expect(page.getByTestId('create-provider-test-result')).toBeVisible();
    });

    test('Should replace Next with submit on the last step', async ({ page }) => {
      await formsStory.goto(page, 'Create In Drawer With Steps');
      await page.getByTestId('create-policy-drawer--trigger').click();
      const next = page.getByTestId('create-policy-stepper--next-trigger');
      await next.click();
      await next.click();
      await expect(page.getByTestId('create-policy-stepper--content-2')).toBeVisible();
      await expect(page.getByTestId('create-policy-submit')).toBeVisible();
      await expect(next).toHaveCount(0);
    });
  });
});
