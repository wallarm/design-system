import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const filterInputStory = createStoryHelper('inputs-filterinput-filterinput', [
  'With Multi Condition Preset',
] as const);

test.describe('Component: FilterInput - Menu Positioning', () => {
  test.describe('Interactions', () => {
    test('Should reposition dropdown to follow the input when a chip is removed via Backspace', async ({
      page,
    }) => {
      await filterInputStory.goto(page, 'With Multi Condition Preset');

      const field = page.getByTestId('filter-input');
      const input = field.locator('input[type="text"]');
      const chips = page.getByTestId('filter-input--condition-chip');
      const fieldMenu = page.getByTestId('filter-input--field-menu');

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

      // Left-edge gap between the menu and the input. Polled, not read once: the
      // menu turns visible while its zoom-in-95 open animation still scales it, so
      // a box read in the first frames is up to ~9px off the settled position.
      const menuOffset = async () => {
        const [inputBox, menuBox] = [await input.boundingBox(), await fieldMenu.boundingBox()];
        return inputBox && menuBox ? Math.abs(menuBox.x - inputBox.x) : Number.POSITIVE_INFINITY;
      };

      // Field menu is anchored to the input — left edges align within tolerance.
      await expect.poll(menuOffset).toBeLessThan(8);
      const inputBefore = await input.boundingBox();
      expect(inputBefore).not.toBeNull();

      // Backspace on empty input removes the last committed chip while keeping
      // the field menu open — this is the scenario the fix addresses.
      await page.keyboard.press('Backspace');
      await expect(chips).toHaveCount(1);
      await expect(fieldMenu).toBeVisible();

      // Input shifted left (one fewer chip in front of it).
      const inputAfter = await input.boundingBox();
      expect(inputAfter).not.toBeNull();
      expect(inputAfter!.x).toBeLessThan(inputBefore!.x - 5);

      // Menu followed the input once floating-ui reacted to the synthetic resize
      // useFloatingRecomputeOn dispatches on chipsCount change — without the fix,
      // menu.x would stick near the old inputBefore.x and the poll times out.
      await expect.poll(menuOffset).toBeLessThan(8);
    });
  });
});
