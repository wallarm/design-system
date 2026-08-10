import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

// EditableCell is demoed inside the Table story (it must live in a real body
// cell to own the full-cell box), so the e2e drives the Table's story.
const story = createStoryHelper('data-display-table', ['Inline Cell Editing'] as const);

test.describe('Component: EditableCell', () => {
  test.describe('Interactions', () => {
    test('Should edit a text cell in place and commit on Enter', async ({ page }) => {
      await story.goto(page, 'Inline Cell Editing');

      const cell = page.locator('[data-slot="editable-text-cell"]').first();
      await cell.click();

      const input = cell.locator('input');
      await expect(input).toBeFocused();

      await input.fill('Renamed via e2e');
      await input.press('Enter');

      await expect(cell.locator('input')).toHaveCount(0);
      await expect(cell).toContainText('Renamed via e2e');
    });

    test('Should revert a text edit on Escape', async ({ page }) => {
      await story.goto(page, 'Inline Cell Editing');

      const cell = page.locator('[data-slot="editable-text-cell"]').first();
      const original = (await cell.innerText()).trim();

      await cell.click();
      await cell.locator('input').fill('discard me');
      await cell.locator('input').press('Escape');

      await expect(cell).toContainText(original);
    });

    test('Should open a select cell and commit the picked option', async ({ page }) => {
      await story.goto(page, 'Inline Cell Editing');

      const cell = page.locator('[data-slot="editable-select-cell"]').first();
      await cell.click();

      await page.getByRole('option', { name: 'Monitoring' }).click();

      await expect(cell).toContainText('Monitoring');
    });

    test('Should show the consumer placeholder for an empty select cell', async ({ page }) => {
      await story.goto(page, 'Inline Cell Editing');

      // The Category column starts empty → placeholder text.
      await expect(page.getByRole('combobox').filter({ hasText: 'Select…' }).first()).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('Should expose the idle text cell as a focusable button', async ({ page }) => {
      await story.goto(page, 'Inline Cell Editing');

      const cell = page.locator('[data-slot="editable-text-cell"]').first();
      await expect(cell).toHaveRole('button');

      await cell.focus();
      await expect(cell).toBeFocused();

      // Enter activates edit mode from the keyboard.
      await cell.press('Enter');
      await expect(cell.locator('input')).toBeFocused();
    });
  });
});
