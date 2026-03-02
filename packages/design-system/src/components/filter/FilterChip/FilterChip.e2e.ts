import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const filterChipStory = createStoryHelper('components-filter-filterchip', [
  'Default',
  'With Error',
  'With Long Text',
  'Realistic Example',
  'And Operator',
  'Or Operator',
  'Combined With And',
  'Combined With Or',
  'Opening Parenthesis',
  'Closing Parenthesis',
  'Combined With Parentheses',
  'With Delete Button',
  'Error With Delete',
  'Interactive Delete Example',
] as const);

test.describe('FilterChip Component', () => {
  test.describe('Screenshots', () => {
    test('Default chip variant', async ({ page }) => {
      await filterChipStory.goto(page, 'Default');
      await expect(page).toHaveScreenshot();
    });

    test('Chip with error state', async ({ page }) => {
      await filterChipStory.goto(page, 'With Error');
      await expect(page).toHaveScreenshot();
    });

    test('Chip with long text truncation', async ({ page }) => {
      await filterChipStory.goto(page, 'With Long Text');
      await expect(page).toHaveScreenshot();
    });

    test('Realistic example', async ({ page }) => {
      await filterChipStory.goto(page, 'Realistic Example');
      await expect(page).toHaveScreenshot();
    });

    test('AND operator variant', async ({ page }) => {
      await filterChipStory.goto(page, 'And Operator');
      await expect(page).toHaveScreenshot();
    });

    test('OR operator variant', async ({ page }) => {
      await filterChipStory.goto(page, 'Or Operator');
      await expect(page).toHaveScreenshot();
    });

    test('Combined chips with AND', async ({ page }) => {
      await filterChipStory.goto(page, 'Combined With And');
      await expect(page).toHaveScreenshot();
    });

    test('Combined chips with OR', async ({ page }) => {
      await filterChipStory.goto(page, 'Combined With Or');
      await expect(page).toHaveScreenshot();
    });

    test('Opening parenthesis variant', async ({ page }) => {
      await filterChipStory.goto(page, 'Opening Parenthesis');
      await expect(page).toHaveScreenshot();
    });

    test('Closing parenthesis variant', async ({ page }) => {
      await filterChipStory.goto(page, 'Closing Parenthesis');
      await expect(page).toHaveScreenshot();
    });

    test('Combined with parentheses', async ({ page }) => {
      await filterChipStory.goto(page, 'Combined With Parentheses');
      await expect(page).toHaveScreenshot();
    });

    test('With delete button on hover', async ({ page }) => {
      await filterChipStory.goto(page, 'With Delete Button');
      // Hover to show delete button
      const chip = page.locator('[data-slot="filter-chip"]').first();
      await chip.hover();
      await expect(page).toHaveScreenshot();
    });

    test('Error state with delete button on hover', async ({ page }) => {
      await filterChipStory.goto(page, 'Error With Delete');
      // Hover to show delete button
      const chip = page.locator('[data-slot="filter-chip"]').first();
      await chip.hover();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Delete button appears on hover', async ({ page }) => {
      await filterChipStory.goto(page, 'With Delete Button');
      const chip = page.locator('[data-slot="filter-chip"]').first();
      const deleteButton = chip.getByRole('button', { name: 'Remove filter' });

      // Delete button should not be visible initially
      await expect(deleteButton).not.toBeVisible();

      // Hover should show delete button
      await chip.hover();
      await expect(deleteButton).toBeVisible();
    });

    test('Delete button removes chip when clicked', async ({ page }) => {
      await filterChipStory.goto(page, 'Interactive Delete Example');
      const chips = page.locator('[data-slot="filter-chip"]');

      // Should have 3 chips initially
      await expect(chips).toHaveCount(3);

      // Hover and click delete on first chip
      const firstChip = chips.first();
      await firstChip.hover();
      const deleteButton = firstChip.getByRole('button', { name: 'Remove filter' });
      await deleteButton.click();

      // Should now have 2 chips
      await expect(chips).toHaveCount(2);
    });

    test('All chips can be removed in sequence', async ({ page }) => {
      await filterChipStory.goto(page, 'Interactive Delete Example');
      const chips = page.locator('[data-slot="filter-chip"]');

      // Remove all chips one by one
      while ((await chips.count()) > 0) {
        const firstChip = chips.first();
        await firstChip.hover();
        const deleteButton = firstChip.getByRole('button', { name: 'Remove filter' });
        await deleteButton.click();
      }

      // Should show "All filters removed" message
      await expect(page.getByText('All filters removed')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('Delete button is keyboard accessible', async ({ page }) => {
      await filterChipStory.goto(page, 'With Delete Button');
      const chip = page.locator('[data-slot="filter-chip"]').first();

      // Hover to show delete button
      await chip.hover();

      const deleteButton = chip.getByRole('button', { name: 'Remove filter' });
      await expect(deleteButton).toBeVisible();

      // Focus on delete button
      await deleteButton.focus();
      await expect(deleteButton).toBeFocused();

      // Should be able to trigger with Enter key
      await page.keyboard.press('Enter');
    });

    test('Delete button has proper ARIA label', async ({ page }) => {
      await filterChipStory.goto(page, 'With Delete Button');
      const chip = page.locator('[data-slot="filter-chip"]').first();

      await chip.hover();

      const deleteButton = chip.getByRole('button', { name: 'Remove filter' });
      await expect(deleteButton).toHaveAttribute('aria-label', 'Remove filter');
    });
  });
});
