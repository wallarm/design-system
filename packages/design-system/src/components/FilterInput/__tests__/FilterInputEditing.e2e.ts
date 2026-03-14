import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const compositionStory = createStoryHelper('components-querybar-composition', [
  'Default',
  'Simple',
] as const);

// Helper: create a chip via field → operator → value
async function createChipWithSelection(page: any, fieldText: string, valueText: string) {
  const input = page.locator('input[type="text"]');
  await input.click();

  // Step 1: Select field
  const fieldItem = page.locator('[role="menuitem"]').filter({ hasText: fieldText });
  await expect(fieldItem).toBeVisible({ timeout: 10000 });
  await fieldItem.click();

  // Step 2: Select operator (first available)
  const operatorItem = page.locator('[role="menuitem"]').first();
  await expect(operatorItem).toBeVisible({ timeout: 10000 });
  await operatorItem.click();

  // Step 3: Select value
  const valueItem = page.locator('[role="menuitem"]').filter({ hasText: valueText });
  await expect(valueItem).toBeVisible({ timeout: 10000 });
  await valueItem.click();

  // Wait for chip to appear
  const chip = page.locator('[data-slot="filter-input-chip"]');
  await expect(chip.first()).toBeVisible({ timeout: 5000 });
}

// Helper: create a multi-select chip (Status in [values])
async function createMultiSelectChip(
  page: any,
  fieldText: string,
  operatorText: string,
  valueTexts: string[],
) {
  const input = page.locator('input[type="text"]');
  await input.click();

  // Step 1: Select field
  const fieldItem = page.locator('[role="menuitem"]').filter({ hasText: fieldText });
  await expect(fieldItem).toBeVisible({ timeout: 10000 });
  await fieldItem.click();

  // Step 2: Select operator
  const operatorItem = page.locator('[role="menuitem"]').filter({ hasText: operatorText });
  await expect(operatorItem).toBeVisible({ timeout: 10000 });
  await operatorItem.click();

  // Step 3: Select values
  for (const val of valueTexts) {
    const valueItem = page.locator('[role="menuitem"]').filter({ hasText: val });
    await expect(valueItem).toBeVisible({ timeout: 10000 });
    await valueItem.click();
  }
  // Close multi-select by pressing Escape
  await page.keyboard.press('Escape');

  // Wait for chip to appear
  const chip = page.locator('[data-slot="filter-input-chip"]');
  await expect(chip.first()).toBeVisible({ timeout: 5000 });
}

// TODO: Enable after baseline screenshots are generated and menu flow is stabilized
test.describe.skip('Component: FilterInput - Editing', () => {
  test.describe('Interactions', () => {
    test('Should change attribute when selecting from dropdown during edit', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      // Create a Status chip
      await createChipWithSelection(page, 'Status', 'Active');

      const chip = page.locator('[data-slot="filter-input-chip"]').filter({ hasText: 'Status' });
      await expect(chip).toBeVisible();

      // Click attribute segment to edit
      const attributeSegment = chip.locator('[data-slot="segment-attribute"]');
      await attributeSegment.click();

      await page.waitForTimeout(300);
      const fieldMenu = page.locator('[data-slot="filter-input-field-menu"]');
      await expect(fieldMenu).toBeVisible({ timeout: 2000 });

      // Select different field
      await page.locator('[role="menuitem"]').filter({ hasText: 'Priority' }).click();
      await page.waitForTimeout(300);

      // Chip should now show Priority, not Status
      const updatedChip = page
        .locator('[data-slot="filter-input-chip"]')
        .filter({ hasText: 'Priority' });
      await expect(updatedChip).toBeVisible();

      // Should NOT have opened operator menu (stays on the chip as-is)
      const menu = page.locator('[role="menu"]');
      await expect(menu).not.toBeVisible({ timeout: 1000 });
    });

    test('Should mark chip as error when attribute changed to incompatible field', async ({
      page,
    }) => {
      await compositionStory.goto(page, 'Simple');

      // Create a Status chip with value "Active"
      await createChipWithSelection(page, 'Status', 'Active');

      const chip = page.locator('[data-slot="filter-input-chip"]').filter({ hasText: 'Status' });
      await expect(chip).toBeVisible();

      // Click attribute to edit it
      const attributeSegment = chip.locator('[data-slot="segment-attribute"]');
      await attributeSegment.click();

      await page.waitForTimeout(300);
      const fieldMenu = page.locator('[data-slot="filter-input-field-menu"]');
      await expect(fieldMenu).toBeVisible({ timeout: 2000 });

      // Change to Priority — "Active" is not a valid Priority value
      await page.locator('[role="menuitem"]').filter({ hasText: 'Priority' }).click();
      await page.waitForTimeout(300);

      // Chip should be marked with error (data-error or error class)
      const updatedChip = page.locator('[data-slot="filter-input-condition-chip"]');
      // Error chips have the error styling
      const debugOutput = page.locator('[data-testid="expression-debug"]');
      const debugText = await debugOutput.textContent();
      const expression = JSON.parse(debugText!);
      expect(expression.error).toBe(true);
    });

    test('Should mark chip as error when custom unknown attribute is typed', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      // Create a Status chip
      await createChipWithSelection(page, 'Status', 'Active');

      const chip = page.locator('[data-slot="filter-input-chip"]').filter({ hasText: 'Status' });
      const attributeSegment = chip.locator('[data-slot="segment-attribute"]');
      await attributeSegment.click();

      await page.waitForTimeout(300);

      // Type a custom attribute that doesn't exist
      const segmentInput = page.locator('[data-slot^="segment-"] input');
      await segmentInput.fill('UnknownField');
      await page.keyboard.press('Enter');

      await page.waitForTimeout(300);

      // Should show the unknown attribute name
      const updatedChip = page
        .locator('[data-slot="filter-input-chip"]')
        .filter({ hasText: 'UnknownField' });
      await expect(updatedChip).toBeVisible();

      // Expression should have error
      const debugOutput = page.locator('[data-testid="expression-debug"]');
      const debugText = await debugOutput.textContent();
      const expression = JSON.parse(debugText!);
      expect(expression.error).toBe(true);
    });

    test('Should open field dropdown when clicking attribute of error chip', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      // Create a chip with Status, then change attribute to unknown
      await createChipWithSelection(page, 'Status', 'Active');

      const chip = page.locator('[data-slot="filter-input-chip"]').filter({ hasText: 'Status' });
      const attributeSegment = chip.locator('[data-slot="segment-attribute"]');
      await attributeSegment.click();

      await page.waitForTimeout(300);

      // Type unknown attribute
      const segmentInput = page.locator('[data-slot^="segment-"] input');
      await segmentInput.fill('BadField');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      // Now click attribute of the error chip
      const errorChip = page
        .locator('[data-slot="filter-input-chip"]')
        .filter({ hasText: 'BadField' });
      await expect(errorChip).toBeVisible();

      const errorAttr = errorChip.locator('[data-slot="segment-attribute"]');
      await errorAttr.click();
      await page.waitForTimeout(300);

      // Field dropdown should appear
      const fieldMenu = page.locator('[data-slot="filter-input-field-menu"]');
      await expect(fieldMenu).toBeVisible({ timeout: 2000 });

      // Select a valid field to fix the error
      await page.locator('[role="menuitem"]').filter({ hasText: 'Status' }).click();
      await page.waitForTimeout(300);

      // Chip should now show Status
      const fixedChip = page
        .locator('[data-slot="filter-input-chip"]')
        .filter({ hasText: 'Status' });
      await expect(fixedChip).toBeVisible();
    });

    test('Should not auto-highlight first dropdown item when focus is on input', async ({
      page,
    }) => {
      await compositionStory.goto(page, 'Simple');

      const input = page.locator('input[type="text"]');
      await input.click();

      const fieldMenu = page.locator('[data-slot="filter-input-field-menu"]');
      await expect(fieldMenu).toBeVisible({ timeout: 2000 });

      // No item should be highlighted when focus is on input
      const highlightedItem = page.locator('[role="menuitem"][data-highlighted]');
      await expect(highlightedItem).toHaveCount(0);

      // After pressing ArrowDown, first item should be highlighted
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(100);
      await expect(highlightedItem).toHaveCount(1);
    });

    test('Should show all multi-select options with selected at top during editing', async ({
      page,
    }) => {
      await compositionStory.goto(page, 'Default');

      // Create a multi-select chip: Status in [Registered, Blocked]
      await createMultiSelectChip(page, 'Status', 'is one of', ['Registered', 'Blocked']);

      await page.waitForTimeout(300);

      // Click value segment to edit
      const chip = page.locator('[data-slot="filter-input-chip"]').first();
      const valueSegment = chip.locator('[data-slot="segment-value"]');
      await valueSegment.click();

      await page.waitForTimeout(300);
      await page.waitForSelector('[role="menuitem"]', { state: 'visible', timeout: 5000 });

      // All options should be visible (not filtered)
      const menuItems = page.locator('[role="menuitem"]');
      const count = await menuItems.count();
      // Status has 2 values: Registered, Blocked — both should show
      expect(count).toBeGreaterThanOrEqual(2);
    });
  });

  test.describe('Accessibility', () => {
    test('Should commit attribute edit via Enter key', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      await createChipWithSelection(page, 'Status', 'Active');

      const chip = page.locator('[data-slot="filter-input-chip"]').filter({ hasText: 'Status' });
      await expect(chip).toBeVisible({ timeout: 5000 });

      const attributeSegment = chip.locator('[data-slot="segment-attribute"]');
      await expect(attributeSegment).toBeVisible({ timeout: 5000 });
      await attributeSegment.click();

      // Type a valid field name and press Enter
      const segmentInput = page.locator('[data-slot^="segment-"] input');
      await expect(segmentInput).toBeVisible({ timeout: 5000 });
      await segmentInput.fill('Priority');
      await page.keyboard.press('Enter');

      // Chip should now show Priority
      const updatedChip = page
        .locator('[data-slot="filter-input-chip"]')
        .filter({ hasText: 'Priority' });
      await expect(updatedChip).toBeVisible({ timeout: 5000 });
    });

    test('Should cancel attribute edit via Escape key', async ({ page }) => {
      await compositionStory.goto(page, 'Simple');

      await createChipWithSelection(page, 'Status', 'Active');

      const chip = page.locator('[data-slot="filter-input-chip"]').filter({ hasText: 'Status' });
      await expect(chip).toBeVisible({ timeout: 5000 });

      const attributeSegment = chip.locator('[data-slot="segment-attribute"]');
      await expect(attributeSegment).toBeVisible({ timeout: 5000 });
      await attributeSegment.click();

      // Type something then cancel
      const segmentInput = page.locator('[data-slot^="segment-"] input');
      await expect(segmentInput).toBeVisible({ timeout: 5000 });
      await segmentInput.fill('Priority');
      await page.keyboard.press('Escape');

      // Chip should still show Status (not changed)
      await expect(chip).toContainText('Status');
    });
  });
});
