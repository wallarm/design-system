/**
 * RuleBuilder E2E Tests
 */

import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const ruleBuilderStory = createStoryHelper('data-display-rulebuilder', [
  'Empty Rule',
  'Simple Field Condition',
  'Complex Nested Conditions',
  'Attack Detection',
  'Signal Detection',
  'With Validation Problems',
  'Conditions Only',
  'Action Only',
  'Code Output Only',
  'All Action Types',
  'Condition Summary Example',
  'Action Summary Example',
] as const);

const getRuleBuilder = (page: Page) => page.getByTestId('rule-builder');
const getConditionTree = (page: Page) => page.getByTestId('condition-tree');
const getActionEditor = (page: Page) => page.getByTestId('action-editor');
const getCodeOutput = (page: Page) => page.locator('code');

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

    test('Should render attack detection condition correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Attack Detection');
      await expect(page).toHaveScreenshot();
    });

    test('Should render signal detection condition correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Signal Detection');
      await expect(page).toHaveScreenshot();
    });

    test('Should render validation problems correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'With Validation Problems');
      await expect(page).toHaveScreenshot();
    });

    test('Should render conditions only section correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Conditions Only');
      await expect(page).toHaveScreenshot();
    });

    test('Should render action only section correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Action Only');
      await expect(page).toHaveScreenshot();
    });

    test('Should render code output only section correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Code Output Only');
      await expect(page).toHaveScreenshot();
    });

    test('Should render all action types correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'All Action Types');
      await expect(page).toHaveScreenshot();
    });

    test('Should render condition summary correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Condition Summary Example');
      await expect(page).toHaveScreenshot();
    });

    test('Should render action summary correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Action Summary Example');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test.beforeEach(async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Empty Rule');
    });

    test('Should add new field condition when add button is clicked', async ({ page }) => {
      const addButton = page.getByRole('button', { name: /add condition/i });
      await addButton.click();

      // Menu should appear
      const fieldOption = page.getByRole('menuitem', { name: /field condition/i });
      await expect(fieldOption).toBeVisible();

      await fieldOption.click();

      // New condition card should appear
      const conditionCards = page.locator('[data-testid^="condition-card"]');
      await expect(conditionCards).toHaveCount(2); // One existing + one new
    });

    test('Should remove condition when delete button is clicked', async ({ page }) => {
      // First add a condition
      const addButton = page.getByRole('button', { name: /add condition/i });
      await addButton.click();
      await page.getByRole('menuitem', { name: /field condition/i }).click();

      const conditionCards = page.locator('[data-testid^="condition-card"]');
      await expect(conditionCards).toHaveCount(2);

      // Then remove it
      const deleteButton = conditionCards.last().getByRole('button', { name: /delete/i });
      await deleteButton.click();

      await expect(conditionCards).toHaveCount(1);
    });

    test('Should change action type when dropdown is changed', async ({ page }) => {
      const actionTypeSelect = page.getByRole('combobox', { name: /action type/i });
      await actionTypeSelect.click();

      // Select "Tag the request"
      await page.getByRole('option', { name: /tag the request/i }).click();

      // Should show tag-specific fields
      await expect(page.getByLabel(/tag key/i)).toBeVisible();
      await expect(page.getByLabel(/tag value/i)).toBeVisible();
    });

    test('Should generate valid JSON when rule is complete', async ({ page }) => {
      // Navigate to a story with complete rule
      await ruleBuilderStory.goto(page, 'Simple Field Condition');

      const codeOutput = getCodeOutput(page);
      const jsonText = await codeOutput.textContent();

      // Verify JSON structure
      expect(jsonText).toBeTruthy();
      const parsed = JSON.parse(jsonText!);

      expect(parsed).toHaveProperty('meta');
      expect(parsed).toHaveProperty('condition');
      expect(parsed).toHaveProperty('action');
      expect(Array.isArray(parsed.action)).toBe(true);
    });
  });

  test.describe('Accessibility', () => {
    test('Should be navigable via Tab key', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Simple Field Condition');

      // Start from top
      await page.keyboard.press('Tab');

      // Should focus on operator select
      const operatorSelect = page.getByRole('combobox', { name: /operator/i }).first();
      await expect(operatorSelect).toBeFocused();

      // Continue tabbing through interactive elements
      await page.keyboard.press('Tab');
      // Should focus on next interactive element (varies by story)
    });

    test('Should open add menu via keyboard Enter key', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Empty Rule');

      const addButton = page.getByRole('button', { name: /add condition/i });
      await addButton.focus();
      await expect(addButton).toBeFocused();

      await page.keyboard.press('Enter');

      // Menu should open
      const menu = page.getByRole('menu');
      await expect(menu).toBeVisible();
    });

    test('Should navigate menu via arrow keys', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Empty Rule');

      const addButton = page.getByRole('button', { name: /add condition/i });
      await addButton.click();

      // First option should be focused/highlighted
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');

      // Select with Enter
      await page.keyboard.press('Enter');

      // Menu should close and new condition should be added
      const menu = page.getByRole('menu');
      await expect(menu).not.toBeVisible();
    });
  });

  test.describe('Visual: Section Control', () => {
    test('Should show only conditions when sections prop includes only conditions', async ({
      page,
    }) => {
      await ruleBuilderStory.goto(page, 'Conditions Only');

      // Conditions should be visible
      await expect(getConditionTree(page)).toBeVisible();

      // Action and code should NOT be visible
      await expect(getActionEditor(page)).not.toBeVisible();
      await expect(page.getByText('Generated Rule')).not.toBeVisible();
    });

    test('Should show only action when sections prop includes only action', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Action Only');

      // Action should be visible
      await expect(getActionEditor(page)).toBeVisible();

      // Conditions and code should NOT be visible
      await expect(getConditionTree(page)).not.toBeVisible();
      await expect(page.getByText('Generated Rule')).not.toBeVisible();
    });

    test('Should show only code when sections prop includes only code', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Code Output Only');

      // Code should be visible
      await expect(getCodeOutput(page)).toBeVisible();

      // Conditions and action should NOT be visible
      await expect(getConditionTree(page)).not.toBeVisible();
      await expect(getActionEditor(page)).not.toBeVisible();
    });
  });

  test.describe('Visual: Validation', () => {
    test('Should display validation errors when showProblems is true', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'With Validation Problems');

      // Should show validation error messages
      await expect(page.getByText(/finish every condition/i)).toBeVisible();
      await expect(page.getByText(/choose the attack type/i)).toBeVisible();
    });

    test('Should not display validation errors when showProblems is false', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Empty Rule');

      // Should NOT show validation errors (even if rule is incomplete)
      await expect(page.getByText(/finish every condition/i)).not.toBeVisible();
      await expect(page.getByText(/choose the attack type/i)).not.toBeVisible();
    });
  });
});
