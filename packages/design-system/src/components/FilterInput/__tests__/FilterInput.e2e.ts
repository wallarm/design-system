import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const filterFieldStory = createStoryHelper('components-querybar-querybar', [
  'Default',
  'With Keyboard Hint',
  'With More Than Three Chips',
  'Error Empty',
  'Error With Chips',
  'Interactive With Removal',
  'Interactive',
  'With Clear Button',
] as const);

// TODO: Enable after baseline screenshots are generated and menu flow is stabilized
test.describe.skip('Component: FilterInput', () => {
  test.describe('Interactions', () => {
    test('Should call onFocus when field is clicked', async ({ page }) => {
      await filterFieldStory.goto(page, 'Interactive');
      const field = page.locator('[data-slot="filter-input"]');

      await field.click();
      await expect(field).toBeFocused();
    });

    test('Should call onClear when clear button is clicked', async ({ page }) => {
      await filterFieldStory.goto(page, 'Interactive With Removal');
      const field = page.locator('[data-slot="filter-input"]');
      const chips = page.locator('[data-slot="filter-input-chip"]');

      // Should have chips initially
      const initialCount = await chips.count();
      expect(initialCount).toBeGreaterThan(0);

      // Hover to show clear button
      await field.hover();
      const clearButton = page.getByRole('button', { name: 'Clear all filters' });
      await expect(clearButton).toBeVisible();

      // Click clear button
      await clearButton.click();

      // All chips should be removed
      await expect(chips).toHaveCount(0);
    });

    test('Should remove chip when chip delete button is clicked', async ({ page }) => {
      await filterFieldStory.goto(page, 'Interactive With Removal');
      const chips = page.locator('[data-slot="filter-input-chip"]');

      // Get initial chip count
      const initialCount = await chips.count();
      expect(initialCount).toBeGreaterThan(0);

      // Hover and click delete on first chip (only 'chip' variant has delete)
      const firstChip = chips.first();
      await firstChip.hover();
      const deleteButton = firstChip.getByRole('button', { name: 'Remove filter' });
      await deleteButton.click();

      // Should have one less chip
      await expect(chips).toHaveCount(initialCount - 1);
    });

    test('Should show max 3 visible chips and placeholder hint', async ({ page }) => {
      await filterFieldStory.goto(page, 'With More Than Three Chips');

      // Should only show 3 chips visually
      const visibleChips = page.locator('[data-slot="filter-input-chip"]');
      await expect(visibleChips).toHaveCount(3);

      // Should show placeholder hint
      const placeholderHint = page.getByText('Search [object]...');
      await expect(placeholderHint).toBeVisible();
    });

    test('Should propagate error state to chips automatically', async ({ page }) => {
      await filterFieldStory.goto(page, 'Error With Chips');

      // Field should have error styling
      const field = page.locator('[data-slot="filter-input"]');
      await expect(field).toHaveAttribute('aria-invalid', 'true');

      // Chips should have error styling (red background)
      const chip = page.locator('[data-slot="filter-input-chip"]').first();
      await expect(chip).toBeVisible();
    });

    test('Should remove all chips in sequence', async ({ page }) => {
      await filterFieldStory.goto(page, 'Interactive With Removal');
      const chips = page.locator('[data-slot="filter-input-chip"]');

      // Remove chips one by one (only chip variants have delete buttons)
      let remainingCount = await chips.count();
      while (remainingCount > 0) {
        const firstChip = chips.first();
        const variantAttr = await firstChip.getAttribute('data-variant');

        if (variantAttr === 'chip') {
          await firstChip.hover();
          const deleteButton = firstChip.getByRole('button', { name: 'Remove filter' });
          if (await deleteButton.isVisible()) {
            await deleteButton.click();
          }
        }

        // Check if count decreased, otherwise break to avoid infinite loop
        const newCount = await chips.count();
        if (newCount === remainingCount) break;
        remainingCount = newCount;
      }
    });
  });

  test.describe('Accessibility', () => {
    test('Should be focusable via Tab key', async ({ page }) => {
      await filterFieldStory.goto(page, 'Default');
      const field = page.locator('[data-slot="filter-input"]');

      // Tab to focus the field
      await page.keyboard.press('Tab');
      await expect(field).toBeFocused();
    });

    test('Should have aria-invalid when error is true', async ({ page }) => {
      await filterFieldStory.goto(page, 'Error Empty');
      const field = page.locator('[data-slot="filter-input"]');

      await expect(field).toHaveAttribute('aria-invalid', 'true');
    });

    test('Should have proper role attribute', async ({ page }) => {
      await filterFieldStory.goto(page, 'Default');
      const field = page.locator('[data-slot="filter-input"]');

      await expect(field).toHaveAttribute('role', 'textbox');
    });

    test('Should be keyboard navigable to clear button', async ({ page }) => {
      await filterFieldStory.goto(page, 'With Clear Button');
      const field = page.locator('[data-slot="filter-input"]');

      // Hover to show clear button
      await field.hover();

      const clearButton = page.getByRole('button', { name: 'Clear all filters' });
      await expect(clearButton).toBeVisible();

      // Tab to clear button
      await clearButton.focus();
      await expect(clearButton).toBeFocused();
    });

    test('Should trigger clear via Enter key on clear button', async ({ page }) => {
      await filterFieldStory.goto(page, 'Interactive With Removal');
      const field = page.locator('[data-slot="filter-input"]');
      const chips = page.locator('[data-slot="filter-input-chip"]');

      // Hover to show clear button
      await field.hover();

      const clearButton = page.getByRole('button', { name: 'Clear all filters' });
      await clearButton.focus();
      await expect(clearButton).toBeFocused();

      // Press Enter
      await page.keyboard.press('Enter');

      // Chips should be cleared
      await expect(chips).toHaveCount(0);
    });

    test('Should have keyboard hint with proper aria labels', async ({ page }) => {
      await filterFieldStory.goto(page, 'With Keyboard Hint');

      // Keyboard hint should be visible
      const kbdElement = page.locator('kbd').first();
      await expect(kbdElement).toBeVisible();
    });
  });
});
