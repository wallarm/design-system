import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const filterInputStory = createStoryHelper('patterns-filterinput-filterinput', [
  'With Multi Condition Preset',
] as const);

test.describe('Component: FilterInput - Menu Positioning', () => {
  test.describe('Interactions', () => {
    test('Should reposition dropdown to follow the input when a chip is removed via Backspace', async ({
      page,
    }) => {
      await filterInputStory.goto(page, 'With Multi Condition Preset');

      const field = page.locator('[data-slot="filter-input"]');
      const input = field.locator('input[type="text"]');
      const chips = page.locator('[data-slot="filter-input-condition-chip"]');
      const fieldMenu = page.locator('[data-slot="filter-input-field-menu"]');

      await expect(chips).toHaveCount(2);

      // Dispatch click via DOM — a real pointer click would be intercepted
      // by the trailing chip's hover-delete overlay. The handler is gated on
      // `menuState === 'closed'`, not on the focus auto-open path (which
      // requires zero conditions), so we need a real click event.
      await input.evaluate(el => {
        (el as HTMLInputElement).focus();
        (el as HTMLInputElement).click();
      });
      await expect(fieldMenu).toBeVisible({ timeout: 5000 });

      const inputBefore = await input.boundingBox();
      const menuBefore = await fieldMenu.boundingBox();
      expect(inputBefore).not.toBeNull();
      expect(menuBefore).not.toBeNull();
      // Field menu is anchored to the input — left edges align within tolerance.
      expect(Math.abs(menuBefore!.x - inputBefore!.x)).toBeLessThan(8);

      // Backspace on empty input removes the last committed chip while keeping
      // the field menu open — this is the scenario the fix addresses.
      await page.keyboard.press('Backspace');
      await expect(chips).toHaveCount(1);
      await expect(fieldMenu).toBeVisible();

      // Give floating-ui one paint to react to the synthetic resize dispatched
      // by useFloatingRecomputeOn on chipsCount change.
      await page.waitForTimeout(100);

      const inputAfter = await input.boundingBox();
      const menuAfter = await fieldMenu.boundingBox();
      expect(inputAfter).not.toBeNull();
      expect(menuAfter).not.toBeNull();

      // Input shifted left (one fewer chip in front of it).
      expect(inputAfter!.x).toBeLessThan(inputBefore!.x - 5);

      // Menu followed the input — without the fix, menu.x would stick near the
      // old inputBefore.x and drift away from the live input position.
      expect(Math.abs(menuAfter!.x - inputAfter!.x)).toBeLessThan(8);
    });
  });
});
