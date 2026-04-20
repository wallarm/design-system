import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const filterFieldStory = createStoryHelper('patterns-filterinput-filterinput', [
  'Default',
  'With Keyboard Hint',
  'Error Empty',
  'With Preset Value',
  'With Multi Condition Preset',
  'Error With Value',
] as const);

// TODO: Enable after baseline screenshots are generated and menu flow is stabilized
test.describe.skip('Component: FilterInput', () => {
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
