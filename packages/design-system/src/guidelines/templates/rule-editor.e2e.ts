import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const ruleEditorStory = createStoryHelper('templates-rule-editor', ['Default', 'Loading'] as const);

const openDrawer = async (page: Page) => {
  await ruleEditorStory.goto(page, 'Default');
  await page.getByTestId('rules-create').click();
  await expect(page.getByTestId('rule-name')).toBeVisible();
};

const fillScope = async (page: Page) => {
  await page.getByTestId('rule-name').fill('Login credential stuffing');
  await page.getByTestId('rule-host').click();
  await page.getByRole('option', { name: 'auth.shop-demo.io' }).click();
  await page.getByTestId('rule-path').fill('/v2/login');
  await page.getByTestId('rule-methods').getByText('POST').click();
};

const nextStep = async (page: Page, times: number) => {
  for (let i = 0; i < times; i++) {
    await page.getByTestId('rule-next').click();
  }
};

test.describe('Template: Rule editor', () => {
  test.describe('Visual', () => {
    test('Should render the rules list correctly', async ({ page }) => {
      await ruleEditorStory.goto(page, 'Default');
      await expect(page.getByTestId('rules-table')).toBeVisible();
      await expect(page.getByTestId('rule-drawer')).toBeHidden();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the loading list correctly', async ({ page }) => {
      await ruleEditorStory.goto(page, 'Loading');
      await expect(page.getByTestId('rules-table')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the scope step correctly', async ({ page }) => {
      await openDrawer(page);
      await fillScope(page);
      await expect(page).toHaveScreenshot();
    });

    test('Should render the condition step correctly', async ({ page }) => {
      await openDrawer(page);
      await fillScope(page);
      await nextStep(page, 1);
      await expect(page.getByRole('textbox', { name: 'Rule condition' })).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the action step correctly', async ({ page }) => {
      await openDrawer(page);
      await fillScope(page);
      await nextStep(page, 2);
      await expect(page.getByTestId('rule-action')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the review step correctly', async ({ page }) => {
      await openDrawer(page);
      await fillScope(page);
      await nextStep(page, 3);
      await expect(page.getByTestId('rule-review')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the validation errors correctly', async ({ page }) => {
      await openDrawer(page);
      await page.getByTestId('rule-path').fill('v2/login');
      await nextStep(page, 3);
      await page.getByTestId('rule-submit').click();
      await expect(page.getByTestId('rule-path')).toHaveAttribute('aria-invalid', 'true');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should mark scope as danger when leaving it with an invalid path', async ({ page }) => {
      await openDrawer(page);
      await page.getByTestId('rule-path').fill('v2/login');
      await page.getByTestId('rule-next').click();
      await expect(page.getByTestId('rule-condition')).toBeVisible();
      await expect(page.getByTestId('rule-stepper--item-0')).toHaveAttribute(
        'data-status',
        'danger',
      );
    });

    test('Should create the rule and show a toast when submit is clicked', async ({ page }) => {
      await openDrawer(page);
      await fillScope(page);
      await nextStep(page, 3);
      await page.getByTestId('rule-submit').click();
      await expect(page.getByTestId('rule-created')).toBeVisible();
      await expect(page.getByTestId('rules-table')).toContainText('Login credential stuffing');
    });
  });
});
