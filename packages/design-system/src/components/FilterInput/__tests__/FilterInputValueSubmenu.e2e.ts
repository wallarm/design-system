import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const story = createStoryHelper('patterns-filterinput-filterinput', [
  'Nested Value Submenu',
] as const);

/** Field → operator (`is any of` = IN, multi-select) → value menu. */
const openValueMenu = async (page: Page) => {
  const field = page.locator('[data-slot="filter-input"]');
  await field.click();
  await page.getByRole('menuitem', { name: /^Attack type$/ }).click();
  await page.getByRole('menuitem', { name: /^is any of IN$/ }).click();
};

test.describe('Component: FilterInput', () => {
  test.describe('Interactions', () => {
    test('opens a parent category submenu on hover', async ({ page }) => {
      await story.goto(page, 'Nested Value Submenu');
      await openValueMenu(page);

      // Section rows are visible; "SQL injection" is a submenu parent.
      const parent = page.getByRole('menuitem', { name: /^SQL injection$/ });
      await expect(parent).toBeVisible();
      await parent.hover();

      // The submenu opens with a "Select all" toggle and the leaf sub-types.
      await expect(page.getByRole('menuitem', { name: /^Select all$/ })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: /^Union-based SQLi$/ })).toBeVisible();
    });

    test('"Select all" checks every child and the chip collapses to the parent label', async ({
      page,
    }) => {
      await story.goto(page, 'Nested Value Submenu');
      await openValueMenu(page);

      await page.getByRole('menuitem', { name: /^SQL injection$/ }).hover();
      await page.getByRole('menuitem', { name: /^Select all$/ }).click();

      // Blur to commit the multi-select.
      await page.locator('body').click({ position: { x: 4, y: 4 } });

      // The committed chip collapses all selected leaves to the parent label…
      const chip = page.locator('[data-slot="filter-input-condition-chip"]').first();
      await expect(chip.locator('[data-slot="segment-value"]')).toHaveText('SQL injection');
    });

    test('selecting a single leaf collapses the category to "label (1)"', async ({ page }) => {
      await story.goto(page, 'Nested Value Submenu');
      await openValueMenu(page);

      await page.getByRole('menuitem', { name: /^SQL injection$/ }).hover();
      await page.getByRole('menuitem', { name: /^Union-based SQLi$/ }).click();
      await page.locator('body').click({ position: { x: 4, y: 4 } });

      // One of several sub-values selected is a partial selection, so the chip
      // shows the parent label with a count of 1 — not the individual leaf.
      const chip = page.locator('[data-slot="filter-input-condition-chip"]').first();
      await expect(chip.locator('[data-slot="segment-value"]')).toHaveText('SQL injection (1)');
    });

    test('a partially-selected category collapses to the parent label with a count', async ({
      page,
    }) => {
      await story.goto(page, 'Nested Value Submenu');
      await openValueMenu(page);

      // Check two of the eight SQLi sub-types — a partial selection.
      await page.getByRole('menuitem', { name: /^SQL injection$/ }).hover();
      await page.getByRole('menuitem', { name: /^Code execution via SQLi$/ }).click();
      await page.getByRole('menuitem', { name: /^Union-based SQLi$/ }).click();

      // Blur to commit the multi-select.
      await page.locator('body').click({ position: { x: 4, y: 4 } });

      // The chip shows the parent label with the selected-leaf count, not the
      // individual sub-type labels.
      const chip = page.locator('[data-slot="filter-input-condition-chip"]').first();
      await expect(chip.locator('[data-slot="segment-value"]')).toHaveText('SQL injection (2)');
    });
  });

  test.describe('Accessibility', () => {
    test('closes the open submenu with ArrowLeft', async ({ page }) => {
      await story.goto(page, 'Nested Value Submenu');
      await openValueMenu(page);
      const input = page.locator('[data-slot="filter-input"] input');

      // Hovering the parent opens its submenu.
      await page.getByRole('menuitem', { name: /^SQL injection$/ }).hover();
      await expect(page.getByRole('menuitem', { name: /^Select all$/ })).toBeVisible();

      // ArrowLeft returns to the parent level (submenu closes).
      await input.press('ArrowLeft');
      await expect(page.getByRole('menuitem', { name: /^Select all$/ })).toHaveCount(0);
    });
  });

  test.describe('Visual', () => {
    test('renders the two-panel nested value menu', async ({ page }) => {
      await story.goto(page, 'Nested Value Submenu');
      await openValueMenu(page);
      await page.getByRole('menuitem', { name: /^SQL injection$/ }).hover();
      await expect(page.getByRole('menuitem', { name: /^Select all$/ })).toBeVisible();
      await expect(page.locator('body')).toHaveScreenshot('nested-value-submenu.png');
    });

    test('renders a partially-selected group chip as "label (count)"', async ({ page }) => {
      await story.goto(page, 'Nested Value Submenu');
      await openValueMenu(page);

      await page.getByRole('menuitem', { name: /^SQL injection$/ }).hover();
      await page.getByRole('menuitem', { name: /^Code execution via SQLi$/ }).click();
      await page.getByRole('menuitem', { name: /^Union-based SQLi$/ }).click();
      await page.locator('body').click({ position: { x: 4, y: 4 } });

      const field = page.locator('[data-slot="filter-input"]');
      const chip = page.locator('[data-slot="filter-input-condition-chip"]').first();
      await expect(chip.locator('[data-slot="segment-value"]')).toHaveText('SQL injection (2)');
      await expect(field).toHaveScreenshot('nested-group-chip-partial-count.png');
    });
  });
});
