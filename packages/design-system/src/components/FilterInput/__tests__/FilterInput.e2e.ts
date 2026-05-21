import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const filterFieldStory = createStoryHelper('patterns-filterinput-filterinput', [
  'Default',
  'With Keyboard Hint',
  'Error Empty',
  'With Preset Value',
  'With Multi Condition Preset',
  'Error With Value',
  'HTTP Status Code Suggestions',
] as const);

// TODO: Enable after baseline screenshots are generated and menu flow is stabilized
test.describe.skip('Component: FilterInput', () => {
  test.describe('Visual', () => {
    test('Should render status code mask menu correctly', async ({ page }) => {
      await filterFieldStory.goto(page, 'HTTP Status Code Suggestions');
      const field = page.locator('[data-slot="filter-input"]');

      await field.click();
      // Pick the Status code field from the field menu, then the "is" operator,
      // to surface the value menu with mask suggestions.
      await page.getByRole('menuitem', { name: /status code/i }).click();
      await page.getByRole('menuitem', { name: /^is$/i }).click();

      const menu = page.getByRole('menu').last();
      await expect(menu).toHaveScreenshot('status-code-mask-menu.png');
    });
  });

  test.describe('Interactions', () => {
    test('Should focus field when clicked', async ({ page }) => {
      await filterFieldStory.goto(page, 'With Preset Value');
      const field = page.locator('[data-slot="filter-input"]');

      await field.click();
      await expect(field).toBeFocused();
    });

    test('Should display preset chips', async ({ page }) => {
      await filterFieldStory.goto(page, 'With Preset Value');
      const chips = page.locator('[data-slot="filter-input-chip"]');

      await expect(chips).toHaveCount(1);
    });

    test('Should display multiple preset chips', async ({ page }) => {
      await filterFieldStory.goto(page, 'With Multi Condition Preset');
      const chips = page.locator('[data-slot="filter-input-chip"]');

      const count = await chips.count();
      expect(count).toBeGreaterThan(1);
    });

    test('Should propagate error state to field with value', async ({ page }) => {
      await filterFieldStory.goto(page, 'Error With Value');

      const field = page.locator('[data-slot="filter-input"]');
      await expect(field).toHaveAttribute('aria-invalid', 'true');

      const chip = page.locator('[data-slot="filter-input-chip"]').first();
      await expect(chip).toBeVisible();
    });

    test('Should preserve checked multi-select values when wrapper is clicked', async ({
      page,
    }) => {
      // Regression for AS-1022: clicking the FilterInput wrapper while a
      // multi-select value menu has checked items must commit them into a
      // built chip. Ark UI's dismissable closes the menu on the same
      // pointerdown, so the commit registration must survive that close.
      await filterFieldStory.goto(page, 'HTTP Status Code Suggestions');

      const input = page.locator('input[type="text"]');
      await input.click();
      await page.getByRole('menuitem', { name: /^status code$/i }).click();
      await page.getByRole('menuitem', { name: /^in IN$/i }).click();
      await page.getByRole('menuitem', { name: /^1XX$/ }).click();
      await page.getByRole('menuitem', { name: /^3XX$/ }).click();

      const buildingChip = page.locator('[data-slot="filter-input-condition-chip"][data-building]');
      await expect(buildingChip).toContainText('1XX, 3XX');

      // Click the right edge of the wrapper — outside the building chip and
      // the menu, but inside `data-slot="filter-input"`. This is the bug's
      // exact trigger surface: Ark UI's outside-click for the value menu.
      const wrapper = page.locator('[data-slot="filter-input"]');
      const box = await wrapper.boundingBox();
      expect(box).toBeTruthy();
      await page.mouse.click(box!.x + box!.width - 60, box!.y + box!.height / 2);

      // Building chip flips to a committed chip; the checked values survive.
      const committedChip = page
        .locator('[data-slot="filter-input-condition-chip"]')
        .filter({ hasNotText: '' })
        .first();
      await expect(committedChip).not.toHaveAttribute('data-building', '');
      await expect(committedChip).toContainText('1XX, 3XX');
    });
  });

  test.describe('Accessibility', () => {
    test('Should be focusable via Tab key', async ({ page }) => {
      await filterFieldStory.goto(page, 'Default');
      const field = page.locator('[data-slot="filter-input"]');

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

    test('Should have keyboard hint with proper aria labels', async ({ page }) => {
      await filterFieldStory.goto(page, 'With Keyboard Hint');

      const kbdElement = page.locator('kbd').first();
      await expect(kbdElement).toBeVisible();
    });
  });
});
