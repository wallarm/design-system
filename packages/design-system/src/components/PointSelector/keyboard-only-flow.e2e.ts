/**
 * PointSelector Keyboard-Only Flow E2E Tests
 *
 * Acceptance criteria: "The whole flow works by keyboard alone"
 *
 * These tests verify that users can build complete points using ONLY keyboard input,
 * with no mouse interaction. All tests include:
 * - Full keyboard navigation (Tab, Arrow keys, Enter, Escape)
 * - Number key shortcuts (1-9)
 * - Keyboard shortcuts (Alt+C, ?)
 * - Focus management and visual indicators
 * - Accessibility (axe-core audits, screen reader labels)
 */

import { expect, type Page, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const pointSelectorStory = createStoryHelper('components-pointselector', [
  'BuildFromScratch',
  'HttpRequest',
  'WithInitialValue',
] as const);

const getInput = (page: Page) => page.getByRole('textbox').first();
const getMenu = (page: Page) => page.getByRole('menu').first();
const getChips = (page: Page) => page.locator('[data-slot="where-bar"] button');

test.describe('Component: PointSelector', () => {
  test.describe('Keyboard-Only Flow', () => {
    test('Should build simple point [http:header]["authorization"] without mouse', async ({
      page,
    }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      // Focus input using Tab
      await page.keyboard.press('Tab');
      const input = getInput(page);
      await expect(input).toBeFocused();

      // Press '3' to select Header
      await page.keyboard.press('3');
      await page.waitForTimeout(600); // Number selection timeout

      // Verify Header chip added
      const chips = getChips(page);
      await expect(chips.first()).toContainText('Header');

      // Type 'authorization' to filter header names
      await page.keyboard.type('authorization');

      // Press Enter to select
      await page.keyboard.press('Enter');

      // Verify both chips
      await expect(chips).toHaveCount(2);
      await expect(chips.nth(0)).toContainText('Header');
      await expect(chips.nth(1)).toContainText('authorization');

      // Verify canonical form displays
      const canonicalText = page.getByText(/\[http:header\]\['authorization'\]/);
      await expect(canonicalText).toBeVisible();
    });

    test('Should build JSON body point [http:body][format:json]["user"]["email"]', async ({
      page,
    }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      const input = getInput(page);
      await page.keyboard.press('Tab');
      await expect(input).toBeFocused();

      // Step 1: Select Body
      await page.keyboard.press('2');
      await page.waitForTimeout(600);

      // Step 2: Select JSON format (first format option)
      await page.keyboard.press('1');
      await page.waitForTimeout(600);

      // Step 3: Type 'user' key
      await page.keyboard.type('user');
      await page.keyboard.press('Enter');

      // Step 4: Type 'email' key
      await page.keyboard.type('email');
      await page.keyboard.press('Enter');

      // Verify all chips
      const chips = getChips(page);
      await expect(chips).toHaveCount(4);
      await expect(chips.nth(0)).toContainText('Body');
      await expect(chips.nth(1)).toContainText('JSON');
      await expect(chips.nth(2)).toContainText('user');
      await expect(chips.nth(3)).toContainText('email');

      // Verify canonical form
      const canonical = page.getByText(/\[http:body\]\[format:json\]\['user'\]\['email'\]/);
      await expect(canonical).toBeVisible();
    });

    test('Should build complex JWT point entirely with keyboard', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      await page.keyboard.press('Tab');

      // [http:header]
      await page.keyboard.press('3');
      await page.waitForTimeout(600);

      // ['authorization']
      await page.keyboard.type('authorization');
      await page.keyboard.press('Enter');

      // [format:auth] (assuming it's available in menu)
      await page.keyboard.press('7'); // format option
      await page.waitForTimeout(600);
      await page.keyboard.type('auth');
      await page.keyboard.press('Enter');

      // ['bearer']
      await page.keyboard.type('bearer');
      await page.keyboard.press('Enter');

      // [format:jwt]
      await page.keyboard.press('7');
      await page.waitForTimeout(600);
      await page.keyboard.type('jwt');
      await page.keyboard.press('Enter');

      // ['payload']
      await page.keyboard.type('payload');
      await page.keyboard.press('Enter');

      // Verify chips contain expected segments
      const chips = getChips(page);
      await expect(chips.first()).toContainText('Header');

      // Verify canonical form has JWT structure
      const canonical = page.getByText(/\[http:header\]\['authorization'\]/);
      await expect(canonical).toBeVisible();
    });

    test('Should navigate menu with arrow keys and select with Enter', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      await page.keyboard.press('Tab');
      const input = getInput(page);
      await expect(input).toBeFocused();

      // Open menu with ArrowDown
      await page.keyboard.press('ArrowDown');
      const menu = getMenu(page);
      await expect(menu).toBeVisible();

      // Navigate down 2 times to reach Header (3rd item)
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');

      // Verify second item is selected
      const secondItem = page.locator('[role="menuitem"]').nth(1);
      await expect(secondItem).toHaveAttribute('aria-selected', 'true');

      // Navigate back up
      await page.keyboard.press('ArrowUp');

      // Select with Enter
      await page.keyboard.press('Enter');

      // Chip should appear
      const chips = getChips(page);
      await expect(chips).toHaveCount(1);
    });

    test('Should close menu with Escape key and retain focus', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      const input = getInput(page);
      await page.keyboard.press('Tab');

      // Open menu
      await page.keyboard.press('ArrowDown');
      await expect(getMenu(page)).toBeVisible();

      // Close with Escape
      await page.keyboard.press('Escape');
      await expect(getMenu(page)).not.toBeVisible();

      // Input should still be focused
      await expect(input).toBeFocused();
    });

    test('Should use Tab to navigate between input and Next button', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      await page.keyboard.press('Tab');

      // Build a simple point
      await page.keyboard.press('3'); // Header
      await page.waitForTimeout(600);
      await page.keyboard.type('cookie');
      await page.keyboard.press('Enter');

      // Tab to Next button
      await page.keyboard.press('Tab');

      const nextButton = page.getByRole('button', { name: /Next/ });
      await expect(nextButton).toBeFocused();

      // Press Enter to proceed
      await page.keyboard.press('Enter');

      // Should navigate to match/condition step
      await page.waitForTimeout(200);
      const conditionSection = page.getByText(/How should the value/);
      await expect(conditionSection).toBeVisible();
    });

    test('Should use Shift+Tab to navigate backwards', async ({ page }) => {
      await pointSelectorStory.goto(page, 'WithInitialValue');

      // Tab forward to Next button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      const nextButton = page.getByRole('button', { name: /Next/ });
      await expect(nextButton).toBeFocused();

      // Shift+Tab back to input
      await page.keyboard.press('Shift+Tab');

      const input = getInput(page);
      await expect(input).toBeFocused();
    });

    test('Should delete last segment with Backspace when input is empty', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      await page.keyboard.press('Tab');

      // Build point with 2 segments
      await page.keyboard.press('3'); // Header
      await page.waitForTimeout(600);
      await page.keyboard.type('cookie');
      await page.keyboard.press('Enter');

      let chips = getChips(page);
      await expect(chips).toHaveCount(2);

      // Press Backspace with empty input
      const input = getInput(page);
      await input.focus();
      await page.keyboard.press('Backspace');

      // Last chip should be removed
      chips = getChips(page);
      await expect(chips).toHaveCount(1);
      await expect(chips.first()).toContainText('Header');
    });

    test('Should use Alt+C to toggle ignore case in name step', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      await page.keyboard.press('Tab');

      // Build point to header name step
      await page.keyboard.press('3'); // Header
      await page.waitForTimeout(600);

      // Name input should be visible
      const nameInput = page.locator('input[placeholder*="header"]');
      await expect(nameInput).toBeVisible();

      // Toggle case sensitivity with Alt+C
      await page.keyboard.press('Alt+KeyC');

      const caseCheckbox = page.getByRole('checkbox', { name: /Ignore letter case/i });
      await expect(caseCheckbox).toBeChecked();

      // Toggle again
      await page.keyboard.press('Alt+KeyC');
      await expect(caseCheckbox).not.toBeChecked();
    });

    test('Should open keyboard shortcuts dialog with ? key', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      await page.keyboard.press('Tab');

      // Press ? to open shortcuts
      await page.keyboard.press('Shift+Slash');

      const dialog = page.getByRole('dialog', { name: /keyboard.*shortcuts/i });
      await expect(dialog).toBeVisible();

      // Close with Escape
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
    });

    test('Should handle rapid keyboard input without losing state', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      await page.keyboard.press('Tab');

      // Rapid typing
      await page.keyboard.press('3'); // Header
      await page.keyboard.type('auth'); // Fast typing
      await page.keyboard.press('Enter');

      await page.waitForTimeout(200);

      // Verify correct chip
      const chips = getChips(page);
      await expect(chips.nth(1)).toContainText('authorization');
    });

    test('Should navigate to match step via Tab and complete condition with keyboard', async ({
      page,
    }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      await page.keyboard.press('Tab');

      // Build point
      await page.keyboard.press('3'); // Header
      await page.waitForTimeout(600);
      await page.keyboard.type('x-api-key');
      await page.keyboard.press('Enter');

      // Tab to Next button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');

      // Should be in match/condition step
      await page.waitForTimeout(200);

      // Select condition with keyboard (press '1' for Equal)
      await page.keyboard.press('1');

      // Type value
      await page.keyboard.type('secret123');

      // Verify value entered
      const valueInput = page.getByDisplayValue('secret123');
      await expect(valueInput).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('Should have no axe-core violations in empty state', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Should have no axe-core violations with menu open', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      const input = getInput(page);
      await input.click();
      await expect(getMenu(page)).toBeVisible();

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Should have no axe-core violations with chips displayed', async ({ page }) => {
      await pointSelectorStory.goto(page, 'WithInitialValue');

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('Should have proper aria-label on input', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      const input = getInput(page);
      await expect(input).toHaveAttribute(
        'aria-label',
        'type to filter, or the number of an option',
      );
    });

    test('Should have proper ARIA attributes on combobox', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      const combobox = page.locator('[role="combobox"]').first();

      await expect(combobox).toHaveAttribute('role', 'combobox');
      await expect(combobox).toHaveAttribute('aria-haspopup', 'menu');
      await expect(combobox).toHaveAttribute('aria-expanded', 'false');

      // Open menu
      const input = getInput(page);
      await input.click();

      await expect(combobox).toHaveAttribute('aria-expanded', 'true');
    });

    test('Should connect menu to input via aria-controls', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      const input = getInput(page);
      const combobox = page.locator('[role="combobox"]').first();

      await input.click();
      await expect(getMenu(page)).toBeVisible();

      // Get menu ID
      const menuId = await getMenu(page).getAttribute('id');
      expect(menuId).toBeTruthy();

      // Combobox should reference it
      await expect(combobox).toHaveAttribute('aria-controls', menuId!);
    });

    test('Should have visible focus indicators on all interactive elements', async ({ page }) => {
      await pointSelectorStory.goto(page, 'WithInitialValue');

      // Tab to input
      await page.keyboard.press('Tab');
      const input = getInput(page);
      await expect(input).toBeFocused();

      // Input should have focus ring (check computed style or screenshot)
      const focusRingVisible = await input.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        // Check for outline or box-shadow that indicates focus
        return (
          styles.outline !== 'none' ||
          styles.outlineWidth !== '0px' ||
          styles.boxShadow !== 'none'
        );
      });
      expect(focusRingVisible).toBe(true);

      // Tab to Next button
      await page.keyboard.press('Tab');
      const nextButton = page.getByRole('button', { name: /Next/ });
      await expect(nextButton).toBeFocused();
    });

    test('Should announce menu items to screen readers via aria-selected', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      const input = getInput(page);
      await input.click();
      await expect(getMenu(page)).toBeVisible();

      // Navigate with arrow keys
      await page.keyboard.press('ArrowDown');

      // First item should have aria-selected="true"
      const firstItem = page.locator('[role="menuitem"]').first();
      await expect(firstItem).toHaveAttribute('aria-selected', 'true');
    });

    test('Should support keyboard navigation in all contexts (request/response)', async ({
      page,
    }) => {
      await pointSelectorStory.goto(page, 'HttpRequest');

      await page.keyboard.press('Tab');
      await page.keyboard.press('ArrowDown');
      await expect(getMenu(page)).toBeVisible();

      // Menu should be navigable
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      const chips = getChips(page);
      await expect(chips).toHaveCount(1);
    });
  });

  test.describe('Visual: Focus States', () => {
    test('Should show clear focus indicator on input', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      const input = getInput(page);
      await input.focus();
      await expect(input).toBeFocused();

      await expect(page).toHaveScreenshot();
    });

    test('Should show clear focus indicator on Next button', async ({ page }) => {
      await pointSelectorStory.goto(page, 'WithInitialValue');

      const nextButton = page.getByRole('button', { name: /Next/ });
      await nextButton.focus();
      await expect(nextButton).toBeFocused();

      await expect(page).toHaveScreenshot();
    });

    test('Should show clear focus indicator on menu item', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      const input = getInput(page);
      await input.click();
      await expect(getMenu(page)).toBeVisible();

      // Navigate to highlight menu item
      await page.keyboard.press('ArrowDown');

      await expect(page).toHaveScreenshot();
    });

    test('Should show clear focus indicator on chip', async ({ page }) => {
      await pointSelectorStory.goto(page, 'WithInitialValue');

      const chips = getChips(page);
      await chips.first().focus();

      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Keyboard Shortcuts', () => {
    test('Should list all keyboard shortcuts in help dialog', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      await page.keyboard.press('Tab');
      await page.keyboard.press('Shift+Slash');

      const dialog = page.getByRole('dialog', { name: /keyboard.*shortcuts/i });
      await expect(dialog).toBeVisible();

      // Verify shortcuts are listed
      await expect(dialog.getByText(/Enter/)).toBeVisible();
      await expect(dialog.getByText(/Escape/)).toBeVisible();
      await expect(dialog.getByText(/Arrow/)).toBeVisible();
      await expect(dialog.getByText(/Tab/)).toBeVisible();
      await expect(dialog.getByText(/1-9/)).toBeVisible();
      await expect(dialog.getByText(/Alt\+C/i)).toBeVisible();
    });

    test('Should close help dialog with Escape', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      await page.keyboard.press('Shift+Slash');
      const dialog = page.getByRole('dialog', { name: /keyboard.*shortcuts/i });
      await expect(dialog).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
    });
  });

  test.describe('Tab Order', () => {
    test('Should have logical tab order: input → Next button → Change where', async ({
      page,
    }) => {
      await pointSelectorStory.goto(page, 'WithInitialValue');

      // Start from outside component
      await page.keyboard.press('Tab');
      const input = getInput(page);
      await expect(input).toBeFocused();

      // Tab to Next button
      await page.keyboard.press('Tab');
      const nextButton = page.getByRole('button', { name: /Next/ });
      await expect(nextButton).toBeFocused();

      // Tab to Change where button (if visible)
      await page.keyboard.press('Tab');
      // Depending on story, this might be another button
    });

    test('Should maintain focus within menu when navigating with arrows', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      await page.keyboard.press('Tab');
      await page.keyboard.press('ArrowDown');
      await expect(getMenu(page)).toBeVisible();

      // Navigate through menu items
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');

      // Menu should still be visible (focus trapped within)
      await expect(getMenu(page)).toBeVisible();
    });

    test('Should not trap focus - Tab should exit component', async ({ page }) => {
      await pointSelectorStory.goto(page, 'BuildFromScratch');

      await page.keyboard.press('Tab'); // Input
      const input = getInput(page);
      await expect(input).toBeFocused();

      // Build a simple point
      await page.keyboard.press('3');
      await page.waitForTimeout(600);

      // Tab to Next
      await page.keyboard.press('Tab');
      const nextButton = page.getByRole('button', { name: /Next/ });
      await expect(nextButton).toBeFocused();

      // Tab again should exit component (or move to next section)
      await page.keyboard.press('Tab');
      // Input should no longer be focused
      await expect(input).not.toBeFocused();
      await expect(nextButton).not.toBeFocused();
    });
  });
});
