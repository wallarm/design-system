import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const filterChipStory = createStoryHelper('patterns-filterinput-filterinputchip', [
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
  // AND operator variants
  'And Operator Error',
  'And Operator Hover',
  'And Operator Error Hover',
  // OR operator variants
  'Or Operator Error',
  'Or Operator Hover',
  'Or Operator Error Hover',
  // Opening parenthesis variants
  'Opening Parenthesis Error',
  'Opening Parenthesis Hover',
  'Opening Parenthesis Error Hover',
  // Closing parenthesis variants
  'Closing Parenthesis Error',
  'Closing Parenthesis Hover',
  'Closing Parenthesis Error Hover',
  // All states showcase
  'All States Showcase',
] as const);

// TODO: Enable after baseline screenshots are generated and menu flow is stabilized
test.describe.skip('Component: FilterInputChip', () => {
  test.describe('Visual', () => {
    test('Should render default chip variant correctly', async ({ page }) => {
      await filterChipStory.goto(page, 'Default');
      await expect(page).toHaveScreenshot();
    });

    test('Should render chip with error state correctly', async ({ page }) => {
      await filterChipStory.goto(page, 'With Error');
      await expect(page).toHaveScreenshot();
    });

    test('Should render chip with long text truncation correctly', async ({ page }) => {
      await filterChipStory.goto(page, 'With Long Text');
      await expect(page).toHaveScreenshot();
    });

    test('Should render realistic example correctly', async ({ page }) => {
      await filterChipStory.goto(page, 'Realistic Example');
      await expect(page).toHaveScreenshot();
    });

    test('Should render AND operator variant correctly', async ({ page }) => {
      await filterChipStory.goto(page, 'And Operator');
      await expect(page).toHaveScreenshot();
    });

    test('Should render AND operator with error correctly', async ({ page }) => {
      await filterChipStory.goto(page, 'And Operator Error');
      await expect(page).toHaveScreenshot();
    });

    test('Should render AND operator hover state correctly', async ({ page }) => {
      await filterChipStory.goto(page, 'And Operator Hover');
      const chip = page.locator('[data-slot="filter-input-chip"]').first();
      await chip.hover();
      await expect(page).toHaveScreenshot();
    });

    test('Should render AND operator error hover state correctly', async ({ page }) => {
      await filterChipStory.goto(page, 'And Operator Error Hover');
      const chip = page.locator('[data-slot="filter-input-chip"]').first();
      await chip.hover();
      await expect(page).toHaveScreenshot();
    });

    test('Should render OR operator variant correctly', async ({ page }) => {
      await filterChipStory.goto(page, 'Or Operator');
      await expect(page).toHaveScreenshot();
    });

    test('Should render OR operator with error correctly', async ({ page }) => {
      await filterChipStory.goto(page, 'Or Operator Error');
      await expect(page).toHaveScreenshot();
    });

    test('Should render OR operator hover state correctly', async ({ page }) => {
      await filterChipStory.goto(page, 'Or Operator Hover');
      const chip = page.locator('[data-slot="filter-input-chip"]').first();
      await chip.hover();
      await expect(page).toHaveScreenshot();
    });

    test('Should render OR operator error hover state correctly', async ({ page }) => {
      await filterChipStory.goto(page, 'Or Operator Error Hover');
      const chip = page.locator('[data-slot="filter-input-chip"]').first();
      await chip.hover();
      await expect(page).toHaveScreenshot();
    });

    test('Should render combined chips with AND correctly', async ({ page }) => {
      await filterChipStory.goto(page, 'Combined With And');
      await expect(page).toHaveScreenshot();
    });

    test('Should render combined chips with OR correctly', async ({ page }) => {
      await filterChipStory.goto(page, 'Combined With Or');
      await expect(page).toHaveScreenshot();
    });

    test('Should render opening parenthesis variant correctly', async ({ page }) => {
      await filterChipStory.goto(page, 'Opening Parenthesis');
      await expect(page).toHaveScreenshot();
    });

    test('Should render opening parenthesis with error correctly', async ({ page }) => {
      await filterChipStory.goto(page, 'Opening Parenthesis Error');
      await expect(page).toHaveScreenshot();
    });

    test('Should render opening parenthesis hover state correctly', async ({ page }) => {
      await filterChipStory.goto(page, 'Opening Parenthesis Hover');
      const chip = page.locator('[data-slot="filter-input-chip"]').first();
      await chip.hover();
      await expect(page).toHaveScreenshot();
    });

    test('Should render opening parenthesis error hover state correctly', async ({ page }) => {
      await filterChipStory.goto(page, 'Opening Parenthesis Error Hover');
      const chip = page.locator('[data-slot="filter-input-chip"]').first();
      await chip.hover();
      await expect(page).toHaveScreenshot();
    });

    test('Should render closing parenthesis variant correctly', async ({ page }) => {
      await filterChipStory.goto(page, 'Closing Parenthesis');
      await expect(page).toHaveScreenshot();
    });

    test('Should render closing parenthesis with error correctly', async ({ page }) => {
      await filterChipStory.goto(page, 'Closing Parenthesis Error');
      await expect(page).toHaveScreenshot();
    });

    test('Should render closing parenthesis hover state correctly', async ({ page }) => {
      await filterChipStory.goto(page, 'Closing Parenthesis Hover');
      const chip = page.locator('[data-slot="filter-input-chip"]').first();
      await chip.hover();
      await expect(page).toHaveScreenshot();
    });

    test('Should render closing parenthesis error hover state correctly', async ({ page }) => {
      await filterChipStory.goto(page, 'Closing Parenthesis Error Hover');
      const chip = page.locator('[data-slot="filter-input-chip"]').first();
      await chip.hover();
      await expect(page).toHaveScreenshot();
    });

    test('Should render combined with parentheses correctly', async ({ page }) => {
      await filterChipStory.goto(page, 'Combined With Parentheses');
      await expect(page).toHaveScreenshot();
    });

    test('Should render chip with delete button on hover correctly', async ({ page }) => {
      await filterChipStory.goto(page, 'With Delete Button');
      const chip = page.locator('[data-slot="filter-input-chip"]').first();
      await chip.hover();
      await expect(page).toHaveScreenshot();
    });

    test('Should render chip error state with delete button on hover correctly', async ({
      page,
    }) => {
      await filterChipStory.goto(page, 'Error With Delete');
      const chip = page.locator('[data-slot="filter-input-chip"]').first();
      await chip.hover();
      await expect(page).toHaveScreenshot();
    });

    test('Should render all states showcase correctly', async ({ page }) => {
      await filterChipStory.goto(page, 'All States Showcase');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should show delete button when chip is hovered', async ({ page }) => {
      await filterChipStory.goto(page, 'With Delete Button');
      const chip = page.locator('[data-slot="filter-input-chip"]').first();
      const deleteButton = chip.getByRole('button', { name: 'Remove filter' });

      // Delete button should not be visible initially
      await expect(deleteButton).not.toBeVisible();

      // Hover should show delete button
      await chip.hover();
      await expect(deleteButton).toBeVisible();
    });

    test('Should show delete button when AND operator is hovered', async ({ page }) => {
      await filterChipStory.goto(page, 'And Operator Hover');
      const chip = page.locator('[data-slot="filter-input-chip"]').first();
      const deleteButton = chip.getByRole('button', { name: 'Remove filter' });

      await expect(deleteButton).not.toBeVisible();
      await chip.hover();
      await expect(deleteButton).toBeVisible();
    });

    test('Should show delete button when OR operator is hovered', async ({ page }) => {
      await filterChipStory.goto(page, 'Or Operator Hover');
      const chip = page.locator('[data-slot="filter-input-chip"]').first();
      const deleteButton = chip.getByRole('button', { name: 'Remove filter' });

      await expect(deleteButton).not.toBeVisible();
      await chip.hover();
      await expect(deleteButton).toBeVisible();
    });

    test('Should show delete button when parenthesis is hovered', async ({ page }) => {
      await filterChipStory.goto(page, 'Opening Parenthesis Hover');
      const chip = page.locator('[data-slot="filter-input-chip"]').first();
      const deleteButton = chip.getByRole('button', { name: 'Remove filter' });

      await expect(deleteButton).not.toBeVisible();
      await chip.hover();
      await expect(deleteButton).toBeVisible();
    });

    test('Should remove chip when delete button is clicked', async ({ page }) => {
      await filterChipStory.goto(page, 'Interactive Delete Example');
      const chips = page.locator('[data-slot="filter-input-chip"]');

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

    test('Should remove all chips in sequence when delete is clicked', async ({ page }) => {
      await filterChipStory.goto(page, 'Interactive Delete Example');
      const chips = page.locator('[data-slot="filter-input-chip"]');

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
    test('Should be focusable via keyboard for chip delete button', async ({ page }) => {
      await filterChipStory.goto(page, 'With Delete Button');
      const chip = page.locator('[data-slot="filter-input-chip"]').first();

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

    test('Should be focusable via keyboard for AND operator delete button', async ({ page }) => {
      await filterChipStory.goto(page, 'And Operator Hover');
      const chip = page.locator('[data-slot="filter-input-chip"]').first();

      await chip.hover();

      const deleteButton = chip.getByRole('button', { name: 'Remove filter' });
      await deleteButton.focus();
      await expect(deleteButton).toBeFocused();
    });

    test('Should be focusable via keyboard for OR operator delete button', async ({ page }) => {
      await filterChipStory.goto(page, 'Or Operator Hover');
      const chip = page.locator('[data-slot="filter-input-chip"]').first();

      await chip.hover();

      const deleteButton = chip.getByRole('button', { name: 'Remove filter' });
      await deleteButton.focus();
      await expect(deleteButton).toBeFocused();
    });

    test('Should have proper ARIA label for delete button', async ({ page }) => {
      await filterChipStory.goto(page, 'With Delete Button');
      const chip = page.locator('[data-slot="filter-input-chip"]').first();

      await chip.hover();

      const deleteButton = chip.getByRole('button', { name: 'Remove filter' });
      await expect(deleteButton).toHaveAttribute('aria-label', 'Remove filter');
    });
  });
});
