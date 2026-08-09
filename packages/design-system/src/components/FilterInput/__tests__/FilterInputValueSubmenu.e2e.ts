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

      // The submenu opens with an "All SQL injection" toggle and the leaf sub-types.
      await expect(page.getByRole('menuitem', { name: /^All SQL injection$/ })).toBeVisible();
      await expect(page.getByRole('menuitem', { name: /^Union-based SQLi$/ })).toBeVisible();
    });

    test('"All SQL injection" checks every child and the chip collapses to the parent label', async ({
      page,
    }) => {
      await story.goto(page, 'Nested Value Submenu');
      await openValueMenu(page);

      await page.getByRole('menuitem', { name: /^SQL injection$/ }).hover();
      await page.getByRole('menuitem', { name: /^All SQL injection$/ }).click();

      // Blur to commit the multi-select.
      await page.locator('body').click({ position: { x: 4, y: 4 } });

      // The committed chip collapses all selected leaves to the parent label…
      const chip = page.locator('[data-slot="filter-input-condition-chip"]').first();
      await expect(chip.locator('[data-slot="segment-value"]')).toHaveText('SQL injection');
    });

    test('selecting a single leaf shows that leaf label, not the category', async ({ page }) => {
      await story.goto(page, 'Nested Value Submenu');
      await openValueMenu(page);

      await page.getByRole('menuitem', { name: /^SQL injection$/ }).hover();
      await page.getByRole('menuitem', { name: /^Union-based SQLi$/ }).click();
      await page.locator('body').click({ position: { x: 4, y: 4 } });

      // A partial selection is never collapsed to the category: the single
      // selected leaf renders as its own label.
      const chip = page.locator('[data-slot="filter-input-condition-chip"]').first();
      await expect(chip.locator('[data-slot="segment-value"]')).toHaveText('Union-based SQLi');
    });

    test('a partially-selected category enumerates its leaves (no count)', async ({ page }) => {
      await story.goto(page, 'Nested Value Submenu');
      await openValueMenu(page);

      // Check two of the eight SQLi sub-types — a partial selection.
      await page.getByRole('menuitem', { name: /^SQL injection$/ }).hover();
      await page.getByRole('menuitem', { name: /^Code execution via SQLi$/ }).click();
      await page.getByRole('menuitem', { name: /^Union-based SQLi$/ }).click();

      // Blur to commit the multi-select.
      await page.locator('body').click({ position: { x: 4, y: 4 } });

      // The chip lists the selected sub-type labels, comma-separated, in config
      // order — no "(2)" count.
      const chip = page.locator('[data-slot="filter-input-condition-chip"]').first();
      await expect(chip.locator('[data-slot="segment-value"]')).toHaveText(
        'Code execution via SQLi, Union-based SQLi',
      );
    });
  });

  test.describe('Accessibility', () => {
    test('closes the open submenu with ArrowLeft', async ({ page }) => {
      await story.goto(page, 'Nested Value Submenu');
      await openValueMenu(page);
      const input = page.locator('[data-slot="filter-input"] input');

      // Hovering the parent opens its submenu.
      await page.getByRole('menuitem', { name: /^SQL injection$/ }).hover();
      await expect(page.getByRole('menuitem', { name: /^All SQL injection$/ })).toBeVisible();

      // ArrowLeft returns to the parent level (submenu closes).
      await input.press('ArrowLeft');
      await expect(page.getByRole('menuitem', { name: /^All SQL injection$/ })).toHaveCount(0);
    });
  });

  test.describe('Visual', () => {
    test('renders the two-panel nested value menu', async ({ page }) => {
      await story.goto(page, 'Nested Value Submenu');
      await openValueMenu(page);
      await page.getByRole('menuitem', { name: /^SQL injection$/ }).hover();
      await expect(page.getByRole('menuitem', { name: /^All SQL injection$/ })).toBeVisible();
      // "Visible" only means the submenu mounted — it races two async settles:
      // the hover-highlight's scrollIntoView on the left list (useKeyboardNav's
      // onHighlightChange), and floating-ui's autoUpdate repositioning the right
      // panel in response to that same scroll (its anchor rect tracks the left
      // row live). Give both one paint to land before capturing, same as the
      // floating-ui settle wait in FilterInputMenuPositioning.e2e.ts.
      await page.waitForTimeout(100);
      // Capture the viewport (not the `body` element): the two panels render in
      // fixed-positioned portals that overflow `body`'s small bounding box, so an
      // element screenshot of `body` crops the menu. The viewport includes both.
      await expect(page).toHaveScreenshot('nested-value-submenu.png');
    });

    test('renders a partially-selected group chip as a comma-separated leaf list', async ({
      page,
    }) => {
      await story.goto(page, 'Nested Value Submenu');
      await openValueMenu(page);

      await page.getByRole('menuitem', { name: /^SQL injection$/ }).hover();
      await page.getByRole('menuitem', { name: /^Code execution via SQLi$/ }).click();
      await page.getByRole('menuitem', { name: /^Union-based SQLi$/ }).click();
      await page.locator('body').click({ position: { x: 4, y: 4 } });

      const field = page.locator('[data-slot="filter-input"]');
      const chip = page.locator('[data-slot="filter-input-condition-chip"]').first();
      await expect(chip.locator('[data-slot="segment-value"]')).toHaveText(
        'Code execution via SQLi, Union-based SQLi',
      );
      await expect(field).toHaveScreenshot('nested-group-chip-partial-list.png');
    });
  });
});
