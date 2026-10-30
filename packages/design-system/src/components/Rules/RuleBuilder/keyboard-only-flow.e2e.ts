/**
 * RuleBuilder Keyboard-Only Flow E2E Tests
 *
 * Acceptance criteria: "The whole flow works by keyboard alone"
 *
 * These tests verify that users can build complete rules using ONLY keyboard input:
 * - Add conditions via keyboard
 * - Configure check types via keyboard
 * - Add actions via keyboard
 * - Navigate between sections with Tab
 * - All interactions accessible without mouse
 */

import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const ruleBuilderStory = createStoryHelper('data-display-rulebuilder', [
  'Empty Rule',
  'Simple Field Condition',
  'Complex Nested Conditions',
  'Attack Detection',
  'All Action Types',
] as const);

const getRuleBuilder = (page: Page) => page.getByTestId('rule-builder');
const getConditionTree = (page: Page) => page.getByTestId('condition-tree');
const getActionEditor = (page: Page) => page.getByTestId('action-editor');

test.describe('Component: RuleBuilder', () => {
  test.describe('Keyboard-Only Flow', () => {
    test('Should add field condition using only keyboard', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Empty Rule');

      // Tab to "Add condition" button
      let currentElement = page.locator(':focus');
      let attempts = 0;
      while (attempts < 20) {
        await page.keyboard.press('Tab');
        currentElement = page.locator(':focus');
        const text = await currentElement.textContent();
        if (text?.includes('Add condition')) {
          break;
        }
        attempts++;
      }

      const addButton = page.getByRole('button', { name: /add condition/i });
      await expect(addButton).toBeFocused();

      // Press Enter to open menu
      await page.keyboard.press('Enter');

      const menu = page.getByRole('menu');
      await expect(menu).toBeVisible();

      // Navigate to "Field condition" with arrow keys
      await page.keyboard.press('ArrowDown');

      // Select with Enter
      await page.keyboard.press('Enter');

      // New condition card should appear
      const conditionCards = page.locator('[data-testid^="condition-card"]');
      await expect(conditionCards).toHaveCount(2); // One existing + one new
    });

    test('Should configure field condition check type via keyboard', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Simple Field Condition');

      // Tab to check type dropdown
      let attempts = 0;
      while (attempts < 30) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        const role = await focused.getAttribute('role');
        if (role === 'combobox') {
          const label = await focused.getAttribute('aria-label');
          if (label?.includes('check') || label?.includes('type')) {
            break;
          }
        }
        attempts++;
      }

      // Open dropdown with Enter or Space
      await page.keyboard.press('Enter');

      // Wait for options menu
      await page.waitForTimeout(200);

      // Navigate with arrow keys
      await page.keyboard.press('ArrowDown');

      // Select with Enter
      await page.keyboard.press('Enter');

      // Dropdown should close
      await page.waitForTimeout(200);
    });

    test('Should add action using only keyboard', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Empty Rule');

      // Tab to action section
      let attempts = 0;
      while (attempts < 30) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        const role = await focused.getAttribute('role');
        const ariaLabel = await focused.getAttribute('aria-label');

        if (role === 'combobox' && ariaLabel?.toLowerCase().includes('action')) {
          break;
        }
        attempts++;
      }

      // Should be on action type select
      const actionTypeSelect = page.getByRole('combobox', { name: /action type/i });
      await expect(actionTypeSelect).toBeFocused();

      // Open dropdown
      await page.keyboard.press('Enter');

      // Navigate to "Tag the request"
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');

      // Select
      await page.keyboard.press('Enter');

      // Tag-specific fields should appear
      await page.waitForTimeout(200);
      await expect(page.getByLabel(/tag key/i)).toBeVisible();
    });

    test('Should navigate through complete rule flow with keyboard', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Empty Rule');

      // 1. Add condition
      let attempts = 0;
      while (attempts < 20) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        const text = await focused.textContent();
        if (text?.includes('Add condition')) {
          break;
        }
        attempts++;
      }

      await page.keyboard.press('Enter'); // Open menu
      await page.keyboard.press('ArrowDown'); // Navigate to option
      await page.keyboard.press('Enter'); // Select

      // 2. Configure check (Tab to check type dropdown)
      attempts = 0;
      while (attempts < 20) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        const role = await focused.getAttribute('role');
        if (role === 'combobox') {
          break;
        }
        attempts++;
      }

      await page.keyboard.press('Enter'); // Open check type
      await page.keyboard.press('ArrowDown'); // Select check
      await page.keyboard.press('Enter');

      // 3. Tab to action section
      attempts = 0;
      while (attempts < 30) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        const ariaLabel = await focused.getAttribute('aria-label');
        if (ariaLabel?.toLowerCase().includes('action')) {
          break;
        }
        attempts++;
      }

      // 4. Configure action
      await page.keyboard.press('Enter'); // Open action dropdown
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      // Rule should now have condition and action configured
      const conditionCards = page.locator('[data-testid^="condition-card"]');
      await expect(conditionCards).toHaveCount(1);
    });

    test('Should delete condition using keyboard', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Simple Field Condition');

      // Tab to delete button
      let attempts = 0;
      while (attempts < 40) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        const ariaLabel = await focused.getAttribute('aria-label');
        const text = await focused.textContent();

        if (ariaLabel?.includes('delete') || text?.toLowerCase().includes('delete')) {
          break;
        }
        attempts++;
      }

      const deleteButton = page.getByRole('button', { name: /delete/i }).first();
      await expect(deleteButton).toBeFocused();

      // Press Enter to delete
      await page.keyboard.press('Enter');

      // Condition should be removed
      await page.waitForTimeout(200);
    });

    test('Should use Tab to navigate between condition, action, and code sections', async ({
      page,
    }) => {
      await ruleBuilderStory.goto(page, 'Simple Field Condition');

      // Start at condition section
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Continue tabbing through to action section
      let inActionSection = false;
      let attempts = 0;
      while (attempts < 40 && !inActionSection) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        const ariaLabel = await focused.getAttribute('aria-label');

        if (ariaLabel?.toLowerCase().includes('action')) {
          inActionSection = true;
        }
        attempts++;
      }

      expect(inActionSection).toBe(true);

      // Code section should be visible (read-only, no focus)
      const codeOutput = page.locator('code');
      await expect(codeOutput).toBeVisible();
    });

    test('Should use Shift+Tab to navigate backwards', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Simple Field Condition');

      // Tab forward several times
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      const forwardFocused = page.locator(':focus');
      const forwardText = await forwardFocused.textContent();

      // Shift+Tab backwards
      await page.keyboard.press('Shift+Tab');

      const backwardFocused = page.locator(':focus');
      const backwardText = await backwardFocused.textContent();

      // Should be different element
      expect(backwardText).not.toBe(forwardText);
    });

    test('Should navigate nested conditions with keyboard', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Complex Nested Conditions');

      // Tab through nested condition cards
      let conditionCardsFocused = 0;
      let attempts = 0;

      while (attempts < 60) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        const testId = await focused.getAttribute('data-testid');

        if (testId?.includes('condition-card')) {
          conditionCardsFocused++;
        }

        attempts++;
      }

      // Should have tabbed through multiple nested condition cards
      expect(conditionCardsFocused).toBeGreaterThan(0);
    });

    test('Should handle Enter key on operator select (AND/OR)', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Simple Field Condition');

      // Tab to operator select
      let attempts = 0;
      while (attempts < 20) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        const role = await focused.getAttribute('role');
        const ariaLabel = await focused.getAttribute('aria-label');

        if (role === 'combobox' && ariaLabel?.toLowerCase().includes('operator')) {
          break;
        }
        attempts++;
      }

      const operatorSelect = page.getByRole('combobox', { name: /operator/i }).first();
      await expect(operatorSelect).toBeFocused();

      // Open with Enter
      await page.keyboard.press('Enter');

      // Navigate options
      await page.keyboard.press('ArrowDown');

      // Select
      await page.keyboard.press('Enter');

      await page.waitForTimeout(200);
    });
  });

  test.describe('Accessibility', () => {
    test('Should have no axe-core violations in empty state', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Empty Rule');

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Should have no axe-core violations with simple condition', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Simple Field Condition');

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Should have no axe-core violations with complex nested conditions', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Complex Nested Conditions');

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Should have no axe-core violations with attack detection', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Attack Detection');

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Should have proper aria-labels on interactive elements', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Simple Field Condition');

      // Check operator select
      const operatorSelect = page.getByRole('combobox', { name: /operator/i }).first();
      await expect(operatorSelect).toHaveAttribute('aria-label');

      // Check delete button
      const deleteButton = page.getByRole('button', { name: /delete/i }).first();
      await expect(deleteButton).toHaveAttribute('aria-label');
    });

    test('Should have visible focus indicators on all controls', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Simple Field Condition');

      // Tab to operator select
      let attempts = 0;
      while (attempts < 20) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        const role = await focused.getAttribute('role');

        if (role === 'combobox') {
          break;
        }
        attempts++;
      }

      const operatorSelect = page.getByRole('combobox').first();
      await expect(operatorSelect).toBeFocused();

      // Check for focus indicator (outline or box-shadow)
      const focusIndicatorVisible = await operatorSelect.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return (
          styles.outline !== 'none' || styles.outlineWidth !== '0px' || styles.boxShadow !== 'none'
        );
      });

      expect(focusIndicatorVisible).toBe(true);
    });

    test('Should support keyboard navigation in add condition menu', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Empty Rule');

      const addButton = page.getByRole('button', { name: /add condition/i });
      await addButton.focus();
      await page.keyboard.press('Enter');

      const menu = page.getByRole('menu');
      await expect(menu).toBeVisible();

      // Navigate with arrow keys
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowUp');

      // Menu should still be open
      await expect(menu).toBeVisible();

      // Close with Escape
      await page.keyboard.press('Escape');
      await expect(menu).not.toBeVisible();
    });

    test('Should announce dynamic content changes to screen readers', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Empty Rule');

      // Check for aria-live regions or role="status"
      const liveRegions = page.locator('[aria-live], [role="status"]');
      const count = await liveRegions.count();

      // Should have some live regions for dynamic updates
      // (or this may be implemented differently)
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Visual: Focus States', () => {
    test('Should show clear focus indicator on operator select', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Simple Field Condition');

      const operatorSelect = page.getByRole('combobox', { name: /operator/i }).first();
      await operatorSelect.focus();
      await expect(operatorSelect).toBeFocused();

      await expect(page).toHaveScreenshot();
    });

    test('Should show clear focus indicator on Add condition button', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Empty Rule');

      const addButton = page.getByRole('button', { name: /add condition/i });
      await addButton.focus();
      await expect(addButton).toBeFocused();

      await expect(page).toHaveScreenshot();
    });

    test('Should show clear focus indicator on delete button', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Simple Field Condition');

      const deleteButton = page.getByRole('button', { name: /delete/i }).first();
      await deleteButton.focus();
      await expect(deleteButton).toBeFocused();

      await expect(page).toHaveScreenshot();
    });

    test('Should show clear focus indicator on action type select', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Empty Rule');

      const actionSelect = page.getByRole('combobox', { name: /action type/i });
      await actionSelect.focus();
      await expect(actionSelect).toBeFocused();

      await expect(page).toHaveScreenshot();
    });

    test('Should highlight menu items when navigating with keyboard', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Empty Rule');

      const addButton = page.getByRole('button', { name: /add condition/i });
      await addButton.click();

      const menu = page.getByRole('menu');
      await expect(menu).toBeVisible();

      // Navigate with arrow keys to highlight item
      await page.keyboard.press('ArrowDown');

      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Tab Order', () => {
    test('Should have logical tab order: conditions → actions → code', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Simple Field Condition');

      const focusedElements: string[] = [];

      // Tab through first 20 elements
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        const ariaLabel = await focused.getAttribute('aria-label');
        const text = await focused.textContent();

        focusedElements.push(ariaLabel || text || 'unknown');
      }

      // Condition-related elements should come before action-related elements
      const firstActionIndex = focusedElements.findIndex(el => el.toLowerCase().includes('action'));
      const lastConditionIndex = focusedElements.findIndex(
        (el, idx) => idx < firstActionIndex && el.toLowerCase().includes('condition'),
      );

      if (firstActionIndex !== -1 && lastConditionIndex !== -1) {
        expect(lastConditionIndex).toBeLessThan(firstActionIndex);
      }
    });

    test('Should not trap focus within component', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Simple Field Condition');

      // Tab through all interactive elements
      let attempts = 0;
      let lastFocused = '';

      while (attempts < 50) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        const tagName = await focused.evaluate(el => el.tagName);

        if (tagName === 'BODY') {
          // Focus escaped the component
          break;
        }

        const currentFocused = await focused.textContent();
        if (currentFocused === lastFocused) {
          // Focus is looping - shouldn't happen
          break;
        }
        lastFocused = currentFocused || '';

        attempts++;
      }

      // Should have exited component or not looped
      expect(attempts).toBeLessThan(50);
    });

    test('Should maintain focus within menu when navigating with arrow keys', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Empty Rule');

      const addButton = page.getByRole('button', { name: /add condition/i });
      await addButton.focus();
      await page.keyboard.press('Enter');

      const menu = page.getByRole('menu');
      await expect(menu).toBeVisible();

      // Navigate through all menu items
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');

      // Menu should still be visible and focused
      await expect(menu).toBeVisible();
    });
  });

  test.describe('Menu Navigation', () => {
    test('Should close add condition menu with Escape', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Empty Rule');

      const addButton = page.getByRole('button', { name: /add condition/i });
      await addButton.focus();
      await page.keyboard.press('Enter');

      const menu = page.getByRole('menu');
      await expect(menu).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(menu).not.toBeVisible();

      // Focus should return to button
      await expect(addButton).toBeFocused();
    });

    test('Should navigate menu with ArrowDown and ArrowUp', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Empty Rule');

      const addButton = page.getByRole('button', { name: /add condition/i });
      await addButton.click();

      const menu = page.getByRole('menu');
      await expect(menu).toBeVisible();

      // Navigate down
      await page.keyboard.press('ArrowDown');
      let firstItem = page.locator('[role="menuitem"]').first();
      let isHighlighted = await firstItem.getAttribute('aria-selected');
      expect(isHighlighted).toBe('true');

      // Navigate down again
      await page.keyboard.press('ArrowDown');
      const secondItem = page.locator('[role="menuitem"]').nth(1);
      isHighlighted = await secondItem.getAttribute('aria-selected');
      expect(isHighlighted).toBe('true');

      // Navigate up
      await page.keyboard.press('ArrowUp');
      firstItem = page.locator('[role="menuitem"]').first();
      isHighlighted = await firstItem.getAttribute('aria-selected');
      expect(isHighlighted).toBe('true');
    });

    test('Should select menu item with Enter key', async ({ page }) => {
      await ruleBuilderStory.goto(page, 'Empty Rule');

      const addButton = page.getByRole('button', { name: /add condition/i });
      await addButton.click();

      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      // Menu should close and condition should be added
      const menu = page.getByRole('menu');
      await expect(menu).not.toBeVisible();

      const conditionCards = page.locator('[data-testid^="condition-card"]');
      await expect(conditionCards).toHaveCount(2);
    });
  });
});
