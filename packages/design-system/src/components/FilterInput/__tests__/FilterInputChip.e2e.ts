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
  'With Delete Button',
  'Error With Delete',
  'Interactive Delete Example',
  'All States Showcase',
] as const);

test.describe('Component: FilterInputChip', () => {
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

    test('Should render OR operator variant correctly', async ({ page }) => {
      await filterChipStory.goto(page, 'Or Operator');
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

    test('Should render chip with delete button on hover correctly', async ({ page }) => {
      await filterChipStory.goto(page, 'With Delete Button');
      const chip = page.locator('[data-slot="filter-input-condition-chip"]').first();
      await chip.hover();
      await expect(page).toHaveScreenshot();
    });

    test('Should render chip error state with delete button on hover correctly', async ({
      page,
    }) => {
      await filterChipStory.goto(page, 'Error With Delete');
      const chip = page.locator('[data-slot="filter-input-condition-chip"]').first();
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
      const chip = page.locator('[data-slot="filter-input-condition-chip"]').first();
      const deleteButton = chip.getByRole('button', { name: 'Remove filter' });

      // The delete button is always in the DOM but hidden via opacity-0 until
      // hover (Playwright's toBeVisible ignores opacity, so assert the CSS).
      await expect(deleteButton).toHaveCSS('opacity', '0');

      // Hover reveals it (group-hover/chip:opacity-100).
      await chip.hover();
      await expect(deleteButton).toHaveCSS('opacity', '1');
    });

    test('Should remove chip when delete button is clicked', async ({ page }) => {
      await filterChipStory.goto(page, 'Interactive Delete Example');
      const chips = page.locator('[data-slot="filter-input-condition-chip"]');

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
      const chips = page.locator('[data-slot="filter-input-condition-chip"]');

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
      const chip = page.locator('[data-slot="filter-input-condition-chip"]').first();

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

    test('Should have proper ARIA label for delete button', async ({ page }) => {
      await filterChipStory.goto(page, 'With Delete Button');
      const chip = page.locator('[data-slot="filter-input-condition-chip"]').first();

      await chip.hover();

      const deleteButton = chip.getByRole('button', { name: 'Remove filter' });
      await expect(deleteButton).toHaveAttribute('aria-label', 'Remove filter');
    });
  });
});
