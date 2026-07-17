import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const dialogStory = createStoryHelper('overlay-dialog', [
  'Basic',
  'With Footer',
  'With Footer Left Actions',
  'Sizes',
  'Custom Sizes',
  'Scrollable',
  'Controlled',
  'No Closable On Esc',
  'No Overlay',
  'With Nested',
  'With Tabs',
  'With Input At Edge',
  'With Input At Edge Scrollable',
  'With Nested Select',
  'With Nested Drawer',
] as const);

const getDialogContent = (page: Page) => page.getByTestId('dialog--content');
const getDialogTrigger = (page: Page) => page.getByTestId('dialog--trigger');
const getDialogCloseButton = (page: Page) =>
  page.getByTestId('dialog--content').getByRole('button', { name: /close|cancel/i });

const openDialog = async (page: Page) => {
  await getDialogTrigger(page).click();
  await expect(getDialogContent(page)).toBeVisible();
};

// `.focus()` doesn't trigger `:focus-visible` in Chromium - only keyboard-driven
// focus changes do, which is what actually reveals a focus ring/outline visually.
const focusViaKeyboard = async (page: Page, locator: ReturnType<Page['locator']>) => {
  for (let i = 0; i < 10; i += 1) {
    if (await locator.evaluate(el => el === document.activeElement)) return;
    await page.keyboard.press('Tab');
  }
  await expect(locator).toBeFocused();
};

test.describe('Component: Dialog', () => {
  test.describe('Visual', () => {
    test('Should render basic dialog correctly', async ({ page }) => {
      await dialogStory.goto(page, 'Basic');
      await openDialog(page);
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render dialog with footer correctly', async ({ page }) => {
      await dialogStory.goto(page, 'With Footer');
      await page.getByRole('button', { name: 'Open Dialog' }).click();
      await expect(page.locator('[data-scope="dialog"][data-part="content"]')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render dialog with footer left actions correctly', async ({ page }) => {
      await dialogStory.goto(page, 'With Footer Left Actions');
      await page.getByRole('button', { name: 'Open with Footer Actions' }).click();
      await expect(page.locator('[data-scope="dialog"][data-part="content"]')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render scrollable dialog correctly', async ({ page }) => {
      await dialogStory.goto(page, 'Scrollable');
      await page.getByRole('button', { name: 'Open Dialog with Scroll' }).click();
      await expect(page.locator('[data-scope="dialog"][data-part="content"]')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render dialog without overlay correctly', async ({ page }) => {
      await dialogStory.goto(page, 'No Overlay');
      await page.getByRole('button', { name: 'Open without Overlay' }).click();
      await expect(page.locator('[data-scope="dialog"][data-part="content"]')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render dialog with tabs correctly', async ({ page }) => {
      await dialogStory.goto(page, 'With Tabs');
      await page.getByRole('button', { name: 'Open Dialog with Tabs' }).click();
      await expect(page.locator('[data-scope="dialog"][data-part="content"]')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render focus ring fully around an input flush with the body edge', async ({
      page,
    }) => {
      await dialogStory.goto(page, 'With Input At Edge');
      await page.getByRole('button', { name: 'Open Dialog with Edge Input' }).click();
      const input = page.getByTestId('edge-input');
      await expect(input).toBeVisible();

      await focusViaKeyboard(page, input);
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the select dropdown above a nested dialog correctly', async ({ page }) => {
      await dialogStory.goto(page, 'With Nested Select');
      await page.getByRole('button', { name: 'Open dialog with nested select' }).click();
      await page.getByRole('button', { name: 'Open nested dialog' }).click();
      await page.getByTestId('nested-select--button').click();
      await expect(page.locator('[data-scope="select"][data-part="content"]')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });
  });

  test.describe('Interactions', () => {
    test('Should not push the dialog back when a drawer opens inside it', async ({ page }) => {
      // Regression: Drawer and Dialog share one Ark dialog machine, so zag's
      // data-has-nested cannot tell them apart — a Drawer opened from a
      // Dialog wrongly triggered the dialog's pushed-back animation. The
      // pushed-back CSS keys on the DS-owned same-kind attribute now.
      await dialogStory.goto(page, 'With Nested Drawer');
      await page.getByRole('button', { name: 'Open dialog with drawer inside' }).click();
      const dialogContent = page.locator('[data-scope="dialog"][data-part="content"]').first();
      await expect(dialogContent).toBeVisible();

      await page.getByRole('button', { name: 'Open drawer' }).click();
      await expect(page.locator('[data-scope="dialog"][data-part="content"]')).toHaveCount(2);

      await expect(dialogContent).not.toHaveAttribute('data-has-nested-same');
      const pushedBack = await dialogContent.evaluate(el => {
        const cs = getComputedStyle(el);
        return { scale: cs.scale, translate: cs.translate };
      });
      expect(pushedBack).toEqual({ scale: 'none', translate: 'none' });
    });

    test('Should stack the select dropdown above a nested dialog when opened inside it', async ({
      page,
    }) => {
      // Regression: the dropdown content's static z-50 mirrored into its
      // positioner sat below the nested dialog positioner (50 + layer * 20),
      // hiding the open menu. The content z-index is layer-aware now.
      await dialogStory.goto(page, 'With Nested Select');
      await page.getByRole('button', { name: 'Open dialog with nested select' }).click();
      await page.getByRole('button', { name: 'Open nested dialog' }).click();
      await page.getByTestId('nested-select--button').click();

      const content = page.locator('[data-scope="select"][data-part="content"]');
      await expect(content).toBeVisible();

      // The topmost element at the dropdown's location must belong to the
      // dropdown itself — not to the nested dialog covering it.
      // Let the open animation (zoom-in/slide-in) finish before hit-testing —
      // mid-animation the content box is still transforming and the probe
      // point can land outside it.
      await content.evaluate(el => Promise.all(el.getAnimations().map(a => a.finished)));
      const isOnTop = await content.evaluate(el => {
        const rect = el.getBoundingClientRect();
        const top = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
        );
        return !!top && el.contains(top);
      });
      expect(isOnTop).toBe(true);

      // The option is actually interactive: selecting closes the dropdown.
      await page.getByRole('option', { name: 'Vue' }).click();
      await expect(content).toBeHidden();
    });

    test('Should stack the dropdown menu above a nested dialog when opened inside it', async ({
      page,
    }) => {
      await dialogStory.goto(page, 'With Nested Select');
      await page.getByRole('button', { name: 'Open dialog with nested select' }).click();
      await page.getByRole('button', { name: 'Open nested dialog' }).click();
      await page.getByRole('button', { name: 'Open menu' }).click();

      const content = page.locator('[data-scope="menu"][data-part="content"]');
      await expect(content).toBeVisible();

      // Let the open animation (zoom-in/slide-in) finish before hit-testing —
      // mid-animation the content box is still transforming and the probe
      // point can land outside it.
      await content.evaluate(el => Promise.all(el.getAnimations().map(a => a.finished)));
      const isOnTop = await content.evaluate(el => {
        const rect = el.getBoundingClientRect();
        const top = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
        );
        return !!top && el.contains(top);
      });
      expect(isOnTop).toBe(true);

      await page.getByRole('menuitem', { name: 'First action' }).click();
      await expect(content).toBeHidden();
    });

    test('Should open dialog when trigger button is clicked', async ({ page }) => {
      await dialogStory.goto(page, 'Basic');
      await expect(getDialogContent(page)).toBeHidden();
      await openDialog(page);
      await expect(getDialogContent(page)).toBeVisible();
    });

    test('Should close dialog when overlay is clicked', async ({ page }) => {
      await dialogStory.goto(page, 'Basic');
      await openDialog(page);
      await expect(getDialogContent(page)).toBeVisible();

      // Force-click the backdrop corner to trigger Ark UI's DismissableLayer.
      // A real pointerdown (trusted event) is required — synthetic events via
      // dispatchEvent are ignored by the layer's listener. Position (10, 10)
      // hits backdrop only, away from the centered dialog content.
      // Wait for the backdrop's open-animation to finish and its pointerdown
      // listener to attach before clicking — otherwise the click can land
      // before DismissableLayer is wired up.
      const backdrop = page.locator('[data-scope="dialog"][data-part="backdrop"]');
      await expect(backdrop).toBeVisible();
      await expect(backdrop).toHaveAttribute('data-state', 'open');
      await backdrop.click({ force: true, position: { x: 10, y: 10 } });
      await expect(getDialogContent(page)).toBeHidden();
    });

    test('Should close dialog when close button is clicked', async ({ page }) => {
      await dialogStory.goto(page, 'Scrollable');
      await page.getByRole('button', { name: 'Open Dialog with Scroll' }).click();
      const content = page.locator('[data-scope="dialog"][data-part="content"]');
      await expect(content).toBeVisible();

      await content.getByRole('button', { name: 'Close', exact: true }).click();
      await expect(content).toBeHidden();
    });

    test('Should open nested dialog when nested trigger is clicked', async ({ page }) => {
      await dialogStory.goto(page, 'With Nested');
      await page.getByRole('button', { name: '1st level dialog' }).click();
      await expect(page.getByText('[Level 1] Main Dialog')).toBeVisible();

      await page.getByRole('button', { name: '2nd level dialog' }).click();
      await expect(page.getByText('[Level 2] Detail View')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('Should close dialog via Escape key', async ({ page }) => {
      await dialogStory.goto(page, 'Basic');
      await openDialog(page);

      await page.keyboard.press('Escape');
      await expect(getDialogContent(page)).toBeHidden();
    });

    test('Should not close dialog via Escape key when closeOnEscape is false', async ({ page }) => {
      await dialogStory.goto(page, 'No Closable On Esc');
      await page.getByRole('button', { name: 'Open Dialog' }).click();
      const content = page.locator('[data-scope="dialog"][data-part="content"]');
      await expect(content).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(content).toBeVisible();
    });
  });
});
