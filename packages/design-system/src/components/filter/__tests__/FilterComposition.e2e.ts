import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const compositionStory = createStoryHelper('components-filter-composition', [
  'Default',
  'Simple',
  'Multi Condition',
  'Backend Integration',
] as const);

test.describe('Component: FilterField - Self-Contained Mechanics', () => {
  // Helper to create a complete chip (field → operator → value)
  async function createChip(page: any) {
    const input = page.locator('input[type="text"]');
    await input.click();

    await page.waitForSelector('[role="menuitem"]', { state: 'visible', timeout: 5000 });
    const firstField = page.locator('[role="menuitem"]').first();
    await firstField.click();

    await page.waitForTimeout(300);
    await page.waitForSelector('[role="menuitem"]', { state: 'visible', timeout: 5000 });
    const firstOperator = page.locator('[role="menuitem"]').first();
    await firstOperator.click();

    await page.waitForTimeout(300);
    await page.waitForSelector('[role="menuitem"]', { state: 'visible', timeout: 5000 });
    const firstValue = page.locator('[role="menuitem"]').first();
    await firstValue.click();

    await page.waitForTimeout(300);
  }

  // Helper to create a chip by selecting specific field/value by text
  async function createChipWithSelection(page: any, fieldText: string, valueText: string) {
    const input = page.locator('input[type="text"]');
    await input.click();

    await page.waitForSelector('[role="menuitem"]', { state: 'visible', timeout: 5000 });
    const field = page.locator('[role="menuitem"]').filter({ hasText: fieldText });
    await field.click();

    await page.waitForTimeout(300);
    await page.waitForSelector('[role="menuitem"]', { state: 'visible', timeout: 5000 });
    const firstOperator = page.locator('[role="menuitem"]').first();
    await firstOperator.click();

    await page.waitForTimeout(300);
    await page.waitForSelector('[role="menuitem"]', { state: 'visible', timeout: 5000 });
    const valueItem = page.locator('[role="menuitem"]').filter({ hasText: valueText });
    await valueItem.click();

    await page.waitForTimeout(300);
  }

  test.describe('Interactions', () => {
    test('Should open field menu automatically on focus', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      const input = page.locator('input[type="text"]');
      await input.click();

      const menu = page.locator('[data-slot="filter-main-menu"]');
      await expect(menu).toBeVisible({ timeout: 2000 });

      const menuItems = page.locator('[role="menuitem"]');
      await expect(menuItems.first()).toBeVisible();
    });

    test('Should complete full autocomplete flow: field → operator → value → chip', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      const input = page.locator('input[type="text"]');
      await input.click();

      await page.waitForSelector('[data-slot="filter-main-menu"]', { state: 'visible', timeout: 2000 });
      const statusField = page.locator('[role="menuitem"]').filter({ hasText: 'Status' });
      await statusField.click();

      await page.waitForTimeout(300);
      await page.waitForSelector('[role="menuitem"]', { state: 'visible', timeout: 2000 });
      const isOperator = page.locator('[role="menuitem"]').first();
      await isOperator.click();

      await page.waitForTimeout(300);
      await page.waitForSelector('[role="menuitem"]', { state: 'visible', timeout: 2000 });
      const activeValue = page.locator('[role="menuitem"]').filter({ hasText: 'Active' });
      await activeValue.click();

      await page.waitForTimeout(300);
      const chip = page.locator('[data-slot="filter-chip"]');
      await expect(chip).toBeVisible();
      await expect(chip).toContainText('Status');
      await expect(chip).toContainText('Active');
    });

    test('Should delete chip when delete button clicked', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      await createChip(page);

      const chip = page.locator('[data-slot="filter-chip"]');
      await expect(chip).toBeVisible();

      await chip.hover();
      await page.waitForTimeout(200);
      const deleteButton = page.locator('[data-slot="filter-chip-delete"]');
      await expect(deleteButton).toBeVisible();
      await deleteButton.click();

      await expect(chip).not.toBeVisible();
    });

    test('Should clear all chips when clear button clicked', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      await createChip(page);

      const chip = page.locator('[data-slot="filter-chip"]');
      await expect(chip).toBeVisible();

      const field = page.locator('[data-slot="filter-field"]');
      await field.hover();
      await page.waitForTimeout(200);

      const clearButton = page.getByRole('button', { name: 'Clear all filters' });
      await expect(clearButton).toBeVisible();
      await clearButton.click();

      await expect(chip).not.toBeVisible();
    });

    test('Should open operator menu when chip operator clicked', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      await createChip(page);

      const chip = page.locator('[data-slot="filter-chip"]');
      const operatorSegment = chip.locator('[data-slot="segment-operator"]');
      await operatorSegment.click();

      await expect(chip).toBeVisible();

      await page.waitForTimeout(300);
      await page.waitForSelector('[role="menuitem"]', { state: 'visible', timeout: 2000 });
      const menu = page.locator('[role="menu"]');
      await expect(menu).toBeVisible();
    });

    test('Should open value menu when chip value clicked', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      await createChip(page);

      const chip = page.locator('[data-slot="filter-chip"]');
      const valueSegment = chip.locator('[data-slot="segment-value"]');
      await valueSegment.click();

      await expect(chip).toBeVisible();

      await page.waitForTimeout(300);
      await page.waitForSelector('[role="menuitem"]', { state: 'visible', timeout: 2000 });
      const menu = page.locator('[role="menu"]');
      await expect(menu).toBeVisible();
    });

    test('Should open field menu when chip attribute clicked', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      await createChip(page);

      const chip = page.locator('[data-slot="filter-chip"]');
      const attributeSegment = chip.locator('[data-slot="segment-attribute"]');
      await attributeSegment.click();

      await expect(chip).toBeVisible();

      await page.waitForTimeout(300);
      const fieldMenu = page.locator('[data-slot="filter-main-menu"]');
      await expect(fieldMenu).toBeVisible({ timeout: 2000 });
    });

    test('Should close menu when Escape pressed', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      const input = page.locator('input[type="text"]');
      await input.click();

      const menu = page.locator('[data-slot="filter-main-menu"]');
      await expect(menu).toBeVisible({ timeout: 2000 });

      await page.waitForTimeout(100);
      await page.keyboard.press('Escape');

      await expect(menu).not.toBeVisible({ timeout: 2000 });
    });

    test('Should navigate menu with keyboard arrows', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      const input = page.locator('input[type="text"]');
      await input.click();

      await page.waitForSelector('[data-slot="filter-main-menu"]', { state: 'visible', timeout: 2000 });

      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      await page.waitForTimeout(300);
      await page.waitForSelector('[role="menuitem"]', { state: 'visible', timeout: 2000 });
    });

    test('Should refocus input after chip creation', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      await createChip(page);

      const input = page.locator('input[type="text"]');
      await expect(input).toBeFocused();
    });
  });

  test.describe('Multi-Condition', () => {
    test('Should create two conditions with AND chip between them', async ({ page }) => {
      await compositionStory.goto(page, 'Multi Condition');

      await createChipWithSelection(page, 'Status', 'Active');

      const firstChip = page.locator('[data-slot="filter-chip"]').filter({ hasText: 'Status' });
      await expect(firstChip).toBeVisible();

      await createChipWithSelection(page, 'Priority', 'Low');

      const allChips = page.locator('[data-slot="filter-chip"]');
      await expect(allChips).toHaveCount(3);

      const andChip = page.locator('[data-slot="filter-chip"]').filter({ hasText: 'AND' });
      await expect(andChip).toBeVisible();
    });

    test('Should toggle AND to OR when connector chip clicked', async ({ page }) => {
      await compositionStory.goto(page, 'Multi Condition');

      await createChipWithSelection(page, 'Status', 'Active');
      await createChipWithSelection(page, 'Priority', 'Low');

      const andChip = page.locator('[data-slot="filter-chip"]').filter({ hasText: 'AND' });
      await expect(andChip).toBeVisible();

      await andChip.click();
      await page.waitForTimeout(200);

      const orChip = page.locator('[data-slot="filter-chip"]').filter({ hasText: 'OR' });
      await expect(orChip).toBeVisible();

      await expect(andChip).not.toBeVisible();
    });

    test('Should remove connector when condition is removed', async ({ page }) => {
      await compositionStory.goto(page, 'Multi Condition');

      await createChipWithSelection(page, 'Status', 'Active');
      await createChipWithSelection(page, 'Priority', 'Low');

      const allChips = page.locator('[data-slot="filter-chip"]');
      await expect(allChips).toHaveCount(3);

      const statusChip = page.locator('[data-slot="filter-chip"]').filter({ hasText: 'Status' });
      await statusChip.hover();
      await page.waitForTimeout(200);
      const deleteButton = statusChip.locator('[data-slot="filter-chip-delete"]');
      await deleteButton.click();
      await page.waitForTimeout(300);

      await expect(allChips).toHaveCount(1);
      const andChip = page.locator('[data-slot="filter-chip"]').filter({ hasText: 'AND' });
      await expect(andChip).not.toBeVisible();
    });

    test('Should output Group expression with multiple conditions', async ({ page }) => {
      await compositionStory.goto(page, 'Multi Condition');

      await createChipWithSelection(page, 'Status', 'Active');
      await createChipWithSelection(page, 'Priority', 'Low');

      const debug = page.locator('[data-testid="expression-debug"]');
      await expect(debug).toBeVisible();

      const debugText = await debug.textContent();
      const expression = JSON.parse(debugText!);

      expect(expression.type).toBe('group');
      expect(expression.operator).toBe('and');
      expect(expression.children).toHaveLength(2);
      expect(expression.children[0].field).toBe('status');
      expect(expression.children[1].field).toBe('priority');
    });
  });

  test.describe('Accessibility', () => {
    test('Should have combobox role', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      const field = page.locator('[data-slot="filter-field"]');
      await expect(field).toHaveAttribute('role', 'combobox');
    });

    test('Should indicate expanded state when menu open', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      const field = page.locator('[data-slot="filter-field"]');
      await expect(field).toHaveAttribute('aria-expanded', 'false');

      const input = page.locator('input[type="text"]');
      await input.click();
      await page.waitForTimeout(300);

      await expect(field).toHaveAttribute('aria-expanded', 'true');
    });

    test('Should be keyboard navigable through entire flow', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      await page.keyboard.press('Tab');

      const input = page.locator('input[type="text"]');
      await expect(input).toBeFocused();

      await page.waitForSelector('[data-slot="filter-main-menu"]', { state: 'visible', timeout: 2000 });

      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      await page.waitForSelector('[role="menuitem"]', { state: 'visible', timeout: 2000 });
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      await page.waitForSelector('[role="menuitem"]', { state: 'visible', timeout: 2000 });
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      const chip = page.locator('[data-slot="filter-chip"]');
      await expect(chip).toBeVisible();
    });

    test('Should announce menu items to screen readers', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      const input = page.locator('input[type="text"]');
      await input.click();

      await page.waitForSelector('[data-slot="filter-main-menu"]', { state: 'visible', timeout: 2000 });
      const menu = page.locator('[data-slot="filter-main-menu"]');
      await expect(menu).toHaveAttribute('role', 'menu');

      const menuItems = page.locator('[role="menuitem"]');
      await expect(menuItems.first()).toHaveAttribute('role', 'menuitem');
    });
  });
});
