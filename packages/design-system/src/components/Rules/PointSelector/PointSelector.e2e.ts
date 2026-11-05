import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const pointSelectorStory = createStoryHelper('rules-pointselector', [
  'Build From Scratch',
  'With Examples',
  'With Initial Value',
  'JWT Claims',
  'With Wildcards',
  'Multi Format Parsing',
] as const);

const getInput = (page: Page) => page.getByRole('combobox').first();
const getListbox = (page: Page) => page.getByRole('listbox').first();
const getChips = (page: Page) => page.locator('[data-slot="where-bar"] button');

test.describe('Component: PointSelector', () => {
  test.describe('Visual', () => {
    test('Should render empty state correctly', async ({ page }) => {
      await pointSelectorStory.goto(page, 'Build From Scratch');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with initial value correctly', async ({ page }) => {
      await pointSelectorStory.goto(page, 'With Initial Value');
      await expect(page).toHaveScreenshot();
    });

    test('Should render JWT claims correctly', async ({ page }) => {
      await pointSelectorStory.goto(page, 'JWT Claims');
      await expect(page).toHaveScreenshot();
    });

    test('Should render wildcards correctly', async ({ page }) => {
      await pointSelectorStory.goto(page, 'With Wildcards');
      await expect(page).toHaveScreenshot();
    });

    test('Should render multi-format parsing correctly', async ({ page }) => {
      await pointSelectorStory.goto(page, 'Multi Format Parsing');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with examples correctly', async ({ page }) => {
      await pointSelectorStory.goto(page, 'With Examples');
      await expect(page).toHaveScreenshot();
    });

    test('Should render with menu open correctly', async ({ page }) => {
      await pointSelectorStory.goto(page, 'Build From Scratch');
      const input = getInput(page);
      await input.click();
      await expect(getListbox(page)).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should open menu when input is clicked', async ({ page }) => {
      await pointSelectorStory.goto(page, 'Build From Scratch');
      const input = getInput(page);

      await expect(getListbox(page)).toBeHidden();
      await input.click();
      await expect(getListbox(page)).toBeVisible();
    });

    test('Should filter options when typing', async ({ page }) => {
      await pointSelectorStory.goto(page, 'Build From Scratch');
      const input = getInput(page);

      await input.click();
      await expect(getListbox(page)).toBeVisible();

      await input.fill('hea');
      const options = page.locator('[role="option"]');
      await expect(options.first()).toBeVisible();
    });

    test('Should close menu when Escape is pressed', async ({ page }) => {
      await pointSelectorStory.goto(page, 'Build From Scratch');
      const input = getInput(page);

      await input.click();
      await expect(getListbox(page)).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(getListbox(page)).toBeHidden();
    });

    test('Should select option with Enter key', async ({ page }) => {
      await pointSelectorStory.goto(page, 'Build From Scratch');
      const input = getInput(page);

      await input.click();
      await expect(getListbox(page)).toBeVisible();

      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      // A chip should appear after selection
      const chips = getChips(page);
      await expect(chips.first()).toBeVisible();
    });

    test('Should navigate options with arrow keys', async ({ page }) => {
      await pointSelectorStory.goto(page, 'Build From Scratch');
      const input = getInput(page);

      await input.click();
      await expect(getListbox(page)).toBeVisible();

      await page.keyboard.press('ArrowDown');
      const firstOption = page.locator('[role="option"][aria-selected="true"]');
      await expect(firstOption).toBeVisible();
    });

    test('Should remove last chip with Backspace on empty input', async ({ page }) => {
      await pointSelectorStory.goto(page, 'Build From Scratch');
      const input = getInput(page);

      // Select a segment first so we have a chip
      await input.click();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      const chips = getChips(page);
      await expect(chips.first()).toBeVisible();
      const initialChips = await chips.count();

      // Close the menu that opened after selection, then press Backspace
      await page.keyboard.press('Escape');
      await expect(getListbox(page)).toBeHidden();
      await page.keyboard.press('Backspace');

      const finalChips = await chips.count();
      expect(finalChips).toBeLessThan(initialChips);
    });

    test('Should truncate point when chip is clicked', async ({ page }) => {
      await pointSelectorStory.goto(page, 'With Initial Value');
      const chips = getChips(page);

      const initialChipCount = await chips.count();
      expect(initialChipCount).toBeGreaterThan(1);

      await chips.first().click();

      await expect(getListbox(page)).toBeVisible();
      const finalChipCount = await chips.count();
      expect(finalChipCount).toBe(1);
    });

    test('Should show segments as chips in pre-populated story', async ({ page }) => {
      await pointSelectorStory.goto(page, 'With Initial Value');
      const chips = getChips(page);
      await expect(chips.first()).toBeVisible();

      // WithInitialValue has [http:header]['x-api-version']
      await expect(chips.nth(0)).toContainText('Header');
    });

    test('Should load example when example button is clicked', async ({ page }) => {
      await pointSelectorStory.goto(page, 'With Examples');

      // Click one of the example buttons
      const exampleButton = page.getByRole('button', { name: 'Header X-Api-Version' });
      await exampleButton.click();

      // Chips should appear
      const chips = getChips(page);
      await expect(chips.first()).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('Should be focusable via click', async ({ page }) => {
      await pointSelectorStory.goto(page, 'Build From Scratch');
      const input = getInput(page);

      await input.click();
      await expect(input).toBeFocused();
    });

    test('Should have proper ARIA attributes on combobox', async ({ page }) => {
      await pointSelectorStory.goto(page, 'Build From Scratch');
      const input = getInput(page);

      await expect(input).toHaveAttribute('role', 'combobox');
      await expect(input).toHaveAttribute('aria-haspopup', 'listbox');
      await expect(input).toHaveAttribute('aria-expanded', 'false');

      await input.click();

      await expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    test('Should announce input purpose via aria-label', async ({ page }) => {
      await pointSelectorStory.goto(page, 'Build From Scratch');
      const input = getInput(page);

      await expect(input).toHaveAttribute(
        'aria-label',
        'type to filter, or the number of an option',
      );
    });

    test('Should close menu with Escape and retain focus', async ({ page }) => {
      await pointSelectorStory.goto(page, 'Build From Scratch');
      const input = getInput(page);

      await input.click();
      await expect(getListbox(page)).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(getListbox(page)).toBeHidden();
      await expect(input).toBeFocused();
    });

    test('Should connect menu to input via aria-controls', async ({ page }) => {
      await pointSelectorStory.goto(page, 'Build From Scratch');
      const input = getInput(page);

      await input.click();
      await expect(getListbox(page)).toBeVisible();

      const menuId = await getListbox(page).getAttribute('id');
      expect(menuId).toBeTruthy();
      await expect(input).toHaveAttribute('aria-controls', menuId!);
    });
  });
});
