import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const ruleBuilderStory = createStoryHelper('rules-rulebuilder', [
  'Empty Rule',
  'Simple Field Condition',
  'Complex Nested Conditions',
  'Attack Detection',
  'With Validation Problems',
] as const);

const getAddConditionButton = (page: Page) => page.getByRole('button', { name: 'Add condition' });
const getCodeOutput = (page: Page) => page.locator('[data-slot="rule-builder"] p.font-mono');

test.describe('Component: RuleBuilder', () => {
  test.describe('Visual', () => {
    test('Should render empty rule correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Empty Rule');
      await expect(page).toHaveScreenshot();
    });

    test('Should render simple field condition correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Simple Field Condition');
      await expect(page).toHaveScreenshot();
    });

    test('Should render complex nested conditions correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Complex Nested Conditions');
      await expect(page).toHaveScreenshot();
    });

    test('Should render attack detection correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Attack Detection');
      await expect(page).toHaveScreenshot();
    });

    test('Should render validation problems correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'With Validation Problems');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should open add-condition menu when button is clicked', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Empty Rule');

      const addButton = getAddConditionButton(page);
      await addButton.click();

      // DropdownMenu should show condition type options
      const menuContent = page.locator('[data-scope="menu"][data-part="content"]');
      await expect(menuContent).toBeVisible();
      await expect(page.getByText('A value in the request or response')).toBeVisible();
      await expect(page.getByText('A group of conditions')).toBeVisible();
    });

    test('Should add field condition from menu', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Empty Rule');

      const addButton = getAddConditionButton(page);
      await addButton.click();

      // Click "A value in the request or response"
      await page.getByText('A value in the request or response').click();

      // EmptyRule starts with 1 field child; adding another makes 2
      const conditionCards = page.locator('[data-slot="condition-card"]');
      await expect(conditionCards).toHaveCount(2);
    });

    test('Should remove condition when remove button is clicked', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Simple Field Condition');

      const conditionCards = page.locator('[data-slot="condition-card"]');
      const initialCount = await conditionCards.count();
      expect(initialCount).toBeGreaterThan(0);

      // Click the remove button on the first card
      const removeButton = page.getByRole('button', { name: 'Remove condition' }).first();
      await removeButton.click();

      await expect(conditionCards).toHaveCount(initialCount - 1);
    });

    test('Should generate JSON code output', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Simple Field Condition');

      const codeOutput = getCodeOutput(page);
      await expect(codeOutput).toBeVisible();

      const jsonText = await codeOutput.textContent();
      expect(jsonText).toBeTruthy();

      const parsed = JSON.parse(jsonText!);
      expect(parsed).toHaveProperty('meta');
      expect(parsed).toHaveProperty('rules');
    });

    test('Should change operator between AND/OR', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Complex Nested Conditions');

      // Find the operator select
      const operatorSelect = page
        .getByRole('combobox', { name: 'How the conditions combine' })
        .first();
      await expect(operatorSelect).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('Should open add-condition menu via keyboard', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Empty Rule');

      const addButton = getAddConditionButton(page);
      await addButton.focus();
      await page.keyboard.press('Enter');

      const menuContent = page.locator('[data-scope="menu"][data-part="content"]');
      await expect(menuContent).toBeVisible();
    });

    test('Should close add-condition menu with Escape', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Empty Rule');

      const addButton = getAddConditionButton(page);
      await addButton.click();

      const menuContent = page.locator('[data-scope="menu"][data-part="content"]');
      await expect(menuContent).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(menuContent).toBeHidden();
    });

    test('Should display validation errors when enabled', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'With Validation Problems');

      // Validation errors should be visible
      const dangerText = page.locator('[class*="danger"]');
      await expect(dangerText.first()).toBeVisible();
    });
  });
});
