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
  'Paired Field',
  'Paired Field Preset',
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

    // AS-1160 — two-step paired chip.
    test('Should reveal the second value after the first when building a paired field', async ({
      page,
    }) => {
      await filterFieldStory.goto(page, 'Paired Field');
      const field = page.locator('[data-slot="filter-input"]');
      await field.click();

      await page.getByRole('menuitem', { name: /^Context Param$/ }).click();
      await page.getByRole('menuitem', { name: /^is =$/ }).click();
      await page.getByRole('menuitem', { name: /^header$/ }).click();

      // The building chip now shows the paired attribute and the ; separator.
      const buildingChip = page.locator('[data-slot="filter-input-condition-chip"][data-building]');
      await expect(buildingChip.locator('[data-slot="segment-separator"]')).toBeVisible();
      await expect(buildingChip).toContainText('Value');
    });

    test('Should render a preset paired condition as one chip', async ({ page }) => {
      await filterFieldStory.goto(page, 'Paired Field Preset');
      const chip = page.locator('[data-slot="filter-input-condition-chip"]').first();
      await expect(chip.locator('[data-slot="segment-separator"]')).toBeVisible();
      await expect(chip.locator('[data-slot="segment-attribute"]')).toHaveCount(2);
      await expect(chip.locator('[data-slot="segment-value"]')).toHaveCount(2);
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

// AS-1022 — wrapper-click and blur-outside paths must commit an in-progress
// multi-select building chip. The test lives outside the broader describe.skip
// because the screenshot blocker doesn't apply to interaction assertions, and
// the bug is a synchronous-event race subtle enough to need a CI guard.
test.describe('Component: FilterInput — AS-1022 wrapper-click commit', () => {
  test.describe('Interactions', () => {
    // Build an in-progress multi-select chip: Status code "in" with two values
    // checked. Returns once the building chip preview shows both labels so the
    // calling test can act on a known state.
    async function setupMultiSelectBuilding(
      page: Parameters<Parameters<typeof test>[1]>[0]['page'],
    ) {
      await filterFieldStory.goto(page, 'HTTP Status Code Suggestions');
      const input = page.locator('input[type="text"]');
      await input.click();
      await page.getByRole('menuitem', { name: /^status code$/i }).click();
      await page.getByRole('menuitem', { name: /^in IN$/i }).click();
      await page.getByRole('menuitem', { name: /^1XX$/ }).click();
      await page.getByRole('menuitem', { name: /^3XX$/ }).click();

      const buildingChip = page.locator('[data-slot="filter-input-condition-chip"][data-building]');
      await expect(buildingChip).toContainText('1XX, 3XX');
    }

    test('Should preserve checked multi-select values when wrapper is clicked', async ({
      page,
    }) => {
      // The bug: Ark UI's dismissable closes the value menu on the same
      // pointerdown, racing the onClick handler. The previous open-gated
      // blurCommitRef would already be null by the time handleAreaClick read
      // it, and the chip would commit empty.
      await setupMultiSelectBuilding(page);

      // Click the inner div's top padding band — well to the left of the
      // ACTIONS_PADDING (64px) action-button zone, above the chip row. This
      // is unambiguously empty inner-content area; the wrapper/inner onClick
      // delegators both route to handleAreaClick from here.
      const wrapper = page.locator('[data-slot="filter-input"]');
      const box = await wrapper.boundingBox();
      expect(box).toBeTruthy();
      await page.mouse.click(box!.x + box!.width / 2, box!.y + 4);

      const conditionChip = page.locator('[data-slot="filter-input-condition-chip"]').first();
      await expect(conditionChip).not.toHaveAttribute('data-building', '');
      await expect(conditionChip).toContainText('1XX, 3XX');
    });

    test('Should commit checked multi-select values when focus leaves the field', async ({
      page,
    }) => {
      // Sibling smoke for the wrapper-click path: blurring out of the field
      // entirely (focus moves to <body>) used to drop the checked values
      // because blurCommitRef was already null from the same outside-click
      // sequence. With the ref armed while the value menu is mounted, blur
      // commits the chip just like the wrapper click does.
      await setupMultiSelectBuilding(page);

      // Click far outside the FilterInput — viewport corner is reliably
      // outside the field's bounding box for all reasonable viewports.
      await page.mouse.click(2, 2);

      const conditionChip = page.locator('[data-slot="filter-input-condition-chip"]').first();
      await expect(conditionChip).not.toHaveAttribute('data-building', '');
      await expect(conditionChip).toContainText('1XX, 3XX');
    });
  });
});
