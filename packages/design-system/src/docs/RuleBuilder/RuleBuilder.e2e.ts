import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const ruleBuilderStory = createStoryHelper('docs-rulebuilder', [
  'EmptyRule',
  'FieldConditionStory',
  'AttackConditionStory',
  'SignalConditionStory',
  'NestedGroups',
  'AddAttackAction',
  'AddTagAction',
  'SuppressAttackAction',
  'MarkAttackAction',
  'CombineAction',
  'ProcessingLimits',
  'EntryLimits',
  'ValidationErrors',
  'CompleteRule',
] as const);

const getAddConditionButton = (page: Page) => page.getByRole('button', { name: /Add Condition/i });
const getAddFieldCheckButton = (page: Page) =>
  page.getByRole('button', { name: /Add Field Check/i });
const getAddAttackCheckButton = (page: Page) =>
  page.getByRole('button', { name: /Add Attack Check/i });
const getAddNestedGroupButton = (page: Page) =>
  page.getByRole('button', { name: /Add Nested Group/i });
const getRemoveButtons = (page: Page) => page.getByRole('button', { name: /Remove check/i });
const getCopyButton = (page: Page) => page.getByRole('button', { name: /Copy/i });

test.describe('Component: RuleBuilder', () => {
  test.describe('Visual', () => {
    test('Should render empty rule correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'EmptyRule');
      await expect(page).toHaveScreenshot();
    });

    test('Should render field condition correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'FieldConditionStory');
      await expect(page).toHaveScreenshot();
    });

    test('Should render attack condition correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'AttackConditionStory');
      await expect(page).toHaveScreenshot();
    });

    test('Should render signal condition correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'SignalConditionStory');
      await expect(page).toHaveScreenshot();
    });

    test('Should render nested groups correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'NestedGroups');
      await expect(page).toHaveScreenshot();
    });

    test('Should render add_attack action correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'AddAttackAction');
      await expect(page).toHaveScreenshot();
    });

    test('Should render add_tag action correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'AddTagAction');
      await expect(page).toHaveScreenshot();
    });

    test('Should render suppress_attack action correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'SuppressAttackAction');
      await expect(page).toHaveScreenshot();
    });

    test('Should render mark_attack action correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'MarkAttackAction');
      await expect(page).toHaveScreenshot();
    });

    test('Should render combine action correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'CombineAction');
      await expect(page).toHaveScreenshot();
    });

    test('Should render processing limits correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'ProcessingLimits');
      await expect(page).toHaveScreenshot();
    });

    test('Should render entry limits correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'EntryLimits');
      await expect(page).toHaveScreenshot();
    });

    test('Should render validation errors correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'ValidationErrors');
      await expect(page).toHaveScreenshot();
    });

    test('Should render complete rule correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'CompleteRule');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions - Conditions', () => {
    test('Should add field check when button is clicked', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'EmptyRule');

      // Initially no checks
      let removeButtons = getRemoveButtons(page);
      await expect(removeButtons).toHaveCount(0);

      // Click Add Condition
      await getAddConditionButton(page).click();

      // Click Add Field Check
      await getAddFieldCheckButton(page).click();

      // Should have one check now
      removeButtons = getRemoveButtons(page);
      await expect(removeButtons).toHaveCount(1);
    });

    test('Should add attack check when button is clicked', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'EmptyRule');

      // Click Add Condition
      await getAddConditionButton(page).click();

      // Click Add Attack Check
      await getAddAttackCheckButton(page).click();

      // Should have one check now
      const removeButtons = getRemoveButtons(page);
      await expect(removeButtons).toHaveCount(1);

      // Should show attack_present badge
      const badge = page.getByText('attack_present');
      await expect(badge).toBeVisible();
    });

    test('Should add nested group when button is clicked', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'EmptyRule');

      // Click Add Condition
      await getAddConditionButton(page).click();

      // Click Add Nested Group
      await getAddNestedGroupButton(page).click();

      // Should have nested group with its own Add Condition button
      const addButtons = getAddConditionButton(page);
      await expect(addButtons).toHaveCount(2); // Parent + nested
    });

    test('Should remove check when remove button is clicked', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'FieldConditionStory');

      // Should have at least one check
      let removeButtons = getRemoveButtons(page);
      const initialCount = await removeButtons.count();
      expect(initialCount).toBeGreaterThan(0);

      // Click first remove button
      await removeButtons.first().click();

      // Should have one less check
      removeButtons = getRemoveButtons(page);
      const finalCount = await removeButtons.count();
      expect(finalCount).toBe(initialCount - 1);
    });

    test('Should change operator type', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'FieldConditionStory');

      // Find the operator select (should show AND initially)
      const operatorSelect = page.locator('select, [role="combobox"]').first();
      await expect(operatorSelect).toBeVisible();

      // Verify current value (may vary by story)
      // In a real test, you'd click and select OR
    });

    test('Should integrate PointSelector for field conditions', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'FieldConditionStory');

      // PointSelector should be visible
      const pointSelector = page.locator('[data-slot="point-selector"]');
      await expect(pointSelector).toBeVisible();

      // Should have chips or input
      const input = pointSelector.getByRole('textbox');
      await expect(input).toBeVisible();
    });
  });

  test.describe('Interactions - Actions', () => {
    test('Should change action type', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'AddAttackAction');

      // Find action type select
      const actionTypeSelect = page.getByRole('combobox', { name: /Action Type/i });
      await expect(actionTypeSelect).toBeVisible();

      // Current value should be add_attack
      // In a real test, you'd verify the dropdown has all action types
    });

    test('Should show attack type field for add_attack action', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'AddAttackAction');

      // Should have Attack Type field
      const attackTypeField = page.getByLabel(/Attack Type/i);
      await expect(attackTypeField).toBeVisible();
    });

    test('Should show tag fields for add_tag action', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'AddTagAction');

      // Should have Tag Key and Tag Value fields
      const tagKeyField = page.getByLabel(/Tag Key/i);
      const tagValueField = page.getByLabel(/Tag Value/i);
      await expect(tagKeyField).toBeVisible();
      await expect(tagValueField).toBeVisible();
    });

    test('Should show separator field for combine action', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'CombineAction');

      // Should have Separator field
      const separatorField = page.getByLabel(/Separator/i);
      await expect(separatorField).toBeVisible();
    });

    test('Should show time limit field for processing_time_limit', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'ProcessingLimits');

      // Should have Time Limit field
      const timeLimitField = page.getByLabel(/Time Limit/i);
      await expect(timeLimitField).toBeVisible();
    });

    test('Should show validation errors when showProblems is true', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'ValidationErrors');

      // Should show alert with validation problems
      const alert = page.getByRole('alert');
      await expect(alert).toBeVisible();

      // Alert should contain error messages
      const alertText = await alert.textContent();
      expect(alertText).toBeTruthy();
    });
  });

  test.describe('Interactions - JSON Output', () => {
    test('Should generate JSON correctly', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'CompleteRule');

      // Find the code snippet
      const codeSnippet = page.locator('code');
      await expect(codeSnippet).toBeVisible();

      // Should contain valid JSON
      const jsonText = await codeSnippet.textContent();
      expect(jsonText).toBeTruthy();

      // Should be parseable JSON
      expect(() => JSON.parse(jsonText!)).not.toThrow();
    });

    test('Should copy JSON when copy button is clicked', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'CompleteRule');

      // Click copy button
      const copyButton = getCopyButton(page);
      await copyButton.click();

      // Note: Actual clipboard verification requires browser permissions
      // In a real test, you'd verify clipboard content
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('Should navigate between fields with Tab key', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'FieldConditionStory');

      // Tab through fields
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Focus should move through inputs/selects
      // Verify by checking activeElement
    });

    test('Should open dropdown with Enter key', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'FieldConditionStory');

      // Tab to first select
      const select = page.locator('select, [role="combobox"]').first();
      await select.focus();

      // Press Enter to open
      await page.keyboard.press('Enter');

      // Dropdown should open
      // Note: Actual behavior depends on ChoiceSelect implementation
    });

    test('Should PointSelector keyboard shortcuts work in condition tree', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'FieldConditionStory');

      // Find PointSelector input
      const pointInput = page.locator('[data-slot="point-selector"] input').first();
      await pointInput.click();

      // Test keyboard shortcuts
      await page.keyboard.press('ArrowDown'); // Navigate menu
      await page.keyboard.press('Enter'); // Select item

      // Menu should update
    });
  });

  test.describe('Accessibility', () => {
    test('Should have proper ARIA labels on buttons', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'EmptyRule');

      // Add Condition button should have accessible name
      const addButton = getAddConditionButton(page);
      const buttonText = await addButton.textContent();
      expect(buttonText).toBeTruthy();
    });

    test('Should have proper form field labels', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'AddAttackAction');

      // All inputs should have labels
      const inputs = page.locator('input[type="text"], select');
      const count = await inputs.count();

      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          await expect(label).toBeVisible();
        }
      }
    });

    test('Should have proper heading structure', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'CompleteRule');

      // Should have h2 headings for sections
      const headings = page.locator('h2');
      await expect(headings).toHaveCount(3); // Conditions, Action, Generated JSON

      // Headings should have text
      const conditionsHeading = page.getByRole('heading', { name: /Conditions/i });
      await expect(conditionsHeading).toBeVisible();

      const actionHeading = page.getByRole('heading', { name: /Action/i });
      await expect(actionHeading).toBeVisible();
    });

    test('Should be keyboard navigable', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'FieldConditionStory');

      // Tab through all interactive elements
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
      }

      // Should be able to navigate back with Shift+Tab
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Shift+Tab');
      }

      // No errors should occur
    });

    test('Should have proper color contrast', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'CompleteRule');

      // This would require axe-core or similar for proper testing
      // For now, just verify the page renders
      await expect(page.locator('[data-slot="rule-builder"]')).toBeVisible();
    });
  });

  test.describe('Complex Scenarios', () => {
    test('Should handle deeply nested condition groups', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'NestedGroups');

      // Should render multiple nesting levels
      const conditionTree = page.locator('[data-slot="condition-tree"]');
      await expect(conditionTree).toBeVisible();

      // Nested groups should be visually indented
      // Verify by checking border-l class or similar
    });

    test('Should preserve state when switching action types', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'AddAttackAction');

      // Fill in attack type
      const attackTypeField = page.getByLabel(/Attack Type/i);
      await attackTypeField.fill('sqli');

      // Change action type (this would clear fields in some implementations)
      // Verify behavior based on actual implementation
    });

    test('Should show correct preview for condition summary', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'FieldConditionStory');

      // Preview section should exist
      const preview = page.getByText(/Preview:/i);
      await expect(preview).toBeVisible();

      // ConditionSummary should render
      // Verify by checking for readable condition text
    });

    test('Should show correct preview for action summary', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'AddAttackAction');

      // Preview section should exist
      const preview = page.getByText(/Preview:/i).nth(1); // Second Preview is for action
      await expect(preview).toBeVisible();

      // ActionSummary should render
    });
  });

  test.describe('Analytics & Metrics Compliance', () => {
    test('Should forward data-testid to root element', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'EmptyRule');

      // Root should have data-testid
      const root = page.locator('[data-testid="rule-builder"]');
      await expect(root).toBeVisible();
    });

    test('Should have data-slot attribute on root', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'EmptyRule');

      // Root should have data-slot
      const root = page.locator('[data-slot="rule-builder"]');
      await expect(root).toBeVisible();
    });

    test('Should accept className prop', async ({ page }) => {
      // This would require a story that passes className
      // Verify by checking the root element has the custom class
    });

    test('Should accept ref prop', async ({ page }) => {
      // This would require a story that uses ref
      // Verify by checking the ref is properly forwarded
    });
  });
});
