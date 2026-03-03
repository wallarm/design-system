import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const compositionStory = createStoryHelper('components-filter-composition', [
  'Default',
  'Simple',
  'Backend Integration',
] as const);

test.describe('Component: FilterField - Self-Contained Mechanics', () => {
  // Helper to create a complete chip
  async function createChip(page: any) {
    const input = page.locator('input[type="text"]');
    await input.click();

    // Wait for and select field
    await page.waitForSelector('[role="menuitem"]', { state: 'visible', timeout: 5000 });
    const firstField = page.locator('[role="menuitem"]').first();
    await firstField.click();

    // Wait for and select operator
    await page.waitForTimeout(300);
    await page.waitForSelector('[role="menuitem"]', { state: 'visible', timeout: 5000 });
    const firstOperator = page.locator('[role="menuitem"]').first();
    await firstOperator.click();

    // Wait for and select value
    await page.waitForTimeout(300);
    await page.waitForSelector('[role="menuitem"]', { state: 'visible', timeout: 5000 });
    const firstValue = page.locator('[role="menuitem"]').first();
    await firstValue.click();

    // Wait for chip to be created
    await page.waitForTimeout(300);
  }

  test.describe('Interactions', () => {
    test('Should open field menu automatically on focus', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      const input = page.locator('input[type="text"]');
      await input.click();

      // Field menu should open automatically
      const menu = page.locator('[data-slot="filter-main-menu"]');
      await expect(menu).toBeVisible({ timeout: 2000 });

      // Should have menu items
      const menuItems = page.locator('[role="menuitem"]');
      await expect(menuItems.first()).toBeVisible();
    });

    test('Should complete full autocomplete flow: field → operator → value → chip', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      const input = page.locator('input[type="text"]');
      await input.click();

      // Step 1: Select field
      await page.waitForSelector('[data-slot="filter-main-menu"]', { state: 'visible', timeout: 2000 });
      const statusField = page.locator('[role="menuitem"]').filter({ hasText: 'Status' });
      await statusField.click();

      // Step 2: Select operator
      await page.waitForTimeout(300);
      await page.waitForSelector('[role="menuitem"]', { state: 'visible', timeout: 2000 });
      const isOperator = page.locator('[role="menuitem"]').first();
      await isOperator.click();

      // Step 3: Select value
      await page.waitForTimeout(300);
      await page.waitForSelector('[role="menuitem"]', { state: 'visible', timeout: 2000 });
      const activeValue = page.locator('[role="menuitem"]').filter({ hasText: 'Active' });
      await activeValue.click();

      // Step 4: Verify chip created
      await page.waitForTimeout(300);
      const chip = page.locator('[data-slot="filter-chip"]');
      await expect(chip).toBeVisible();
      await expect(chip).toContainText('Status');
      await expect(chip).toContainText('Active');
    });

    test('Should delete chip when delete button clicked', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      // Create chip using helper
      await createChip(page);

      // Verify chip exists
      const chip = page.locator('[data-slot="filter-chip"]');
      await expect(chip).toBeVisible();

      // Hover and click delete
      await chip.hover();
      await page.waitForTimeout(200);
      const deleteButton = page.locator('[data-slot="filter-chip-delete"]');
      await expect(deleteButton).toBeVisible();
      await deleteButton.click();

      // Chip should be removed
      await expect(chip).not.toBeVisible();
    });

    test('Should clear all chips when clear button clicked', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      // Create chip using helper
      await createChip(page);

      // Verify chip exists
      const chip = page.locator('[data-slot="filter-chip"]');
      await expect(chip).toBeVisible();

      // Hover field to show clear button
      const field = page.locator('[data-slot="filter-field"]');
      await field.hover();
      await page.waitForTimeout(200);

      const clearButton = page.getByRole('button', { name: 'Clear all filters' });
      await expect(clearButton).toBeVisible();
      await clearButton.click();

      // All chips should be removed
      await expect(chip).not.toBeVisible();
    });

    test('Should open operator menu when chip operator clicked', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      // Create chip using helper
      await createChip(page);

      // Click operator segment to edit
      const chip = page.locator('[data-slot="filter-chip"]');
      const operatorSegment = chip.locator('[data-slot="segment-operator"]');
      await operatorSegment.click();

      // Chip should stay visible
      await expect(chip).toBeVisible();

      // Operator menu should open
      await page.waitForTimeout(300);
      await page.waitForSelector('[role="menuitem"]', { state: 'visible', timeout: 2000 });
      const menu = page.locator('[role="menu"]');
      await expect(menu).toBeVisible();
    });

    test('Should open value menu when chip value clicked', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      // Create chip using helper
      await createChip(page);

      // Click value segment to edit
      const chip = page.locator('[data-slot="filter-chip"]');
      const valueSegment = chip.locator('[data-slot="segment-value"]');
      await valueSegment.click();

      // Chip should stay visible
      await expect(chip).toBeVisible();

      // Value menu should open
      await page.waitForTimeout(300);
      await page.waitForSelector('[role="menuitem"]', { state: 'visible', timeout: 2000 });
      const menu = page.locator('[role="menu"]');
      await expect(menu).toBeVisible();
    });

    test('Should open field menu when chip attribute clicked', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      // Create chip using helper
      await createChip(page);

      // Click attribute segment to edit
      const chip = page.locator('[data-slot="filter-chip"]');
      const attributeSegment = chip.locator('[data-slot="segment-attribute"]');
      await attributeSegment.click();

      // Chip should stay visible
      await expect(chip).toBeVisible();

      // Field menu should open
      await page.waitForTimeout(300);
      const fieldMenu = page.locator('[data-slot="filter-main-menu"]');
      await expect(fieldMenu).toBeVisible({ timeout: 2000 });
    });

    test('Should close menu when Escape pressed', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      const input = page.locator('input[type="text"]');
      await input.click();

      // Field menu should be open
      const menu = page.locator('[data-slot="filter-main-menu"]');
      await expect(menu).toBeVisible({ timeout: 2000 });

      // Wait for event listeners to register after render
      await page.waitForTimeout(100);

      // Press Escape
      await page.keyboard.press('Escape');

      // Menu should close
      await expect(menu).not.toBeVisible({ timeout: 2000 });
    });

    test('Should navigate menu with keyboard arrows', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      const input = page.locator('input[type="text"]');
      await input.click();

      // Field menu should be open
      await page.waitForSelector('[data-slot="filter-main-menu"]', { state: 'visible', timeout: 2000 });

      // Press ArrowDown to navigate
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');

      // Press Enter to select
      await page.keyboard.press('Enter');

      // Operator menu should open
      await page.waitForTimeout(300);
      await page.waitForSelector('[role="menuitem"]', { state: 'visible', timeout: 2000 });
    });

    test('Should refocus input after chip creation', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      // Create chip using helper
      await createChip(page);

      // Input should be focused again for next chip
      const input = page.locator('input[type="text"]');
      await expect(input).toBeFocused();
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

      // Initially not expanded
      await expect(field).toHaveAttribute('aria-expanded', 'false');

      // Click to open menu
      const input = page.locator('input[type="text"]');
      await input.click();
      await page.waitForTimeout(300);

      // Should be expanded
      await expect(field).toHaveAttribute('aria-expanded', 'true');
    });

    test('Should be keyboard navigable through entire flow', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      // Tab to input
      await page.keyboard.press('Tab');

      const input = page.locator('input[type="text"]');
      await expect(input).toBeFocused();

      // Menu should open
      await page.waitForSelector('[data-slot="filter-main-menu"]', { state: 'visible', timeout: 2000 });

      // Navigate with arrows and select with Enter
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      // Operator menu
      await page.waitForSelector('[role="menuitem"]', { state: 'visible', timeout: 2000 });
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      // Value menu
      await page.waitForSelector('[role="menuitem"]', { state: 'visible', timeout: 2000 });
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      // Chip should be created
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
