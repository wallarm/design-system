import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const drawerStory = createStoryHelper('overlay-drawer', [
  'Basic',
  'With Footer',
  'With Footer Left Actions',
  'Sizes',
  'Custom Sizes',
  'Resizable',
  'Scrollable',
  'Controlled',
  'No Closable On Esc',
  'No Overlay',
  'With Nested',
  'With Tabs',
  'Resizable With Overflow List',
  'With Nested Select',
  'With Nested Dialog',
] as const);

const getDrawerContent = (page: Page) => page.getByTestId('drawer--content');
const getDrawerTrigger = (page: Page) => page.getByTestId('drawer--trigger');

const openDrawer = async (page: Page) => {
  await getDrawerTrigger(page).click();
  await expect(getDrawerContent(page)).toBeVisible();
};

test.describe('Component: Drawer', () => {
  test.describe('Visual', () => {
    test('Should render basic drawer correctly', async ({ page }) => {
      await drawerStory.goto(page, 'Basic');
      await openDrawer(page);
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render drawer with footer correctly', async ({ page }) => {
      await drawerStory.goto(page, 'With Footer');
      await page.getByRole('button', { name: 'Open Drawer' }).click();
      await expect(page.locator('[data-scope="dialog"][data-part="content"]')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render drawer with footer left actions correctly', async ({ page }) => {
      await drawerStory.goto(page, 'With Footer Left Actions');
      await page.getByRole('button', { name: 'Open with Footer Actions' }).click();
      await expect(page.locator('[data-scope="dialog"][data-part="content"]')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render resizable drawer correctly', async ({ page }) => {
      await drawerStory.goto(page, 'Resizable');
      await page.getByRole('button', { name: /Open Resizable Drawer \(as number\)/ }).click();
      await expect(page.locator('[data-scope="dialog"][data-part="content"]')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render scrollable drawer correctly', async ({ page }) => {
      await drawerStory.goto(page, 'Scrollable');
      await page.getByRole('button', { name: 'Open Drawer with Scroll' }).click();
      await expect(page.locator('[data-scope="dialog"][data-part="content"]')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render drawer without overlay correctly', async ({ page }) => {
      await drawerStory.goto(page, 'No Overlay');
      await page.getByRole('button', { name: 'Open without Overlay' }).click();
      await expect(page.locator('[data-scope="dialog"][data-part="content"]')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render drawer with tabs correctly', async ({ page }) => {
      await drawerStory.goto(page, 'With Tabs');
      await page.getByRole('button', { name: 'Open Drawer with Tabs' }).click();
      await expect(page.locator('[data-scope="dialog"][data-part="content"]')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the select dropdown above a nested drawer correctly', async ({ page }) => {
      await drawerStory.goto(page, 'With Nested Select');
      await page.getByRole('button', { name: 'Open drawer with nested select' }).click();
      await page.getByRole('button', { name: 'Open nested drawer' }).click();
      await page.getByTestId('nested-select--button').click();
      await expect(page.locator('[data-scope="select"][data-part="content"]')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });
  });

  test.describe('Interactions', () => {
    test('Should not push the drawer back when a dialog opens inside it', async ({ page }) => {
      // Regression: Drawer and Dialog share one Ark dialog machine, so zag's
      // data-has-nested cannot tell them apart — a Dialog opened from a
      // Drawer wrongly triggered the drawer's pushed-back animation. The
      // pushed-back CSS keys on the DS-owned same-kind attribute now.
      await drawerStory.goto(page, 'With Nested Dialog');
      await page.getByRole('button', { name: 'Open drawer with dialog inside' }).click();
      const drawerContent = page.locator('[data-scope="dialog"][data-part="content"]').first();
      await expect(drawerContent).toBeVisible();

      await page.getByRole('button', { name: 'Open dialog' }).click();
      await expect(page.locator('[data-scope="dialog"][data-part="content"]')).toHaveCount(2);

      await expect(drawerContent).not.toHaveAttribute('data-has-nested-same');
      const pushedBack = await drawerContent.evaluate(el => {
        const cs = getComputedStyle(el);
        return { scale: cs.scale, translate: cs.translate };
      });
      expect(pushedBack).toEqual({ scale: 'none', translate: 'none' });
    });

    test('Should stack the select dropdown above a nested drawer when opened inside it', async ({
      page,
    }) => {
      // Regression: the dropdown content's static z-50 mirrored into its
      // positioner sat below the nested drawer positioner (50 + layer * 20),
      // hiding the open menu. The content z-index is layer-aware now.
      await drawerStory.goto(page, 'With Nested Select');
      await page.getByRole('button', { name: 'Open drawer with nested select' }).click();
      await page.getByRole('button', { name: 'Open nested drawer' }).click();
      await page.getByTestId('nested-select--button').click();

      const content = page.locator('[data-scope="select"][data-part="content"]');
      await expect(content).toBeVisible();

      // The topmost element at the dropdown's location must belong to the
      // dropdown itself — not to the nested drawer covering it.
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

    test('Should stack the dropdown menu above a nested drawer when opened inside it', async ({
      page,
    }) => {
      await drawerStory.goto(page, 'With Nested Select');
      await page.getByRole('button', { name: 'Open drawer with nested select' }).click();
      await page.getByRole('button', { name: 'Open nested drawer' }).click();
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

    test('Should open drawer when trigger button is clicked', async ({ page }) => {
      await drawerStory.goto(page, 'Basic');
      await expect(getDrawerContent(page)).toBeHidden();
      await openDrawer(page);
      await expect(getDrawerContent(page)).toBeVisible();
    });

    test('Should close drawer when overlay is clicked', async ({ page }) => {
      await drawerStory.goto(page, 'Basic');
      await openDrawer(page);
      await expect(getDrawerContent(page)).toBeVisible();

      // Force-click the backdrop corner to trigger Ark UI's DismissableLayer.
      // A real pointerdown (trusted event) is required — synthetic events via
      // dispatchEvent are ignored by the layer's listener. Position (10, 10)
      // hits backdrop only, away from the drawer content.
      // Wait for the backdrop's open-animation to finish and its pointerdown
      // listener to attach before clicking — otherwise the click can land
      // before DismissableLayer is wired up.
      const backdrop = page.locator('[data-scope="dialog"][data-part="backdrop"]');
      await expect(backdrop).toBeVisible();
      await expect(backdrop).toHaveAttribute('data-state', 'open');
      await backdrop.click({ force: true, position: { x: 10, y: 10 } });
      await expect(getDrawerContent(page)).toBeHidden();
    });

    test('Should close drawer when close button is clicked', async ({ page }) => {
      await drawerStory.goto(page, 'Scrollable');
      await page.getByRole('button', { name: 'Open Drawer with Scroll' }).click();
      const content = page.locator('[data-scope="dialog"][data-part="content"]');
      await expect(content).toBeVisible();

      await content.getByRole('button', { name: 'Close', exact: true }).click();
      await expect(content).toBeHidden();
    });

    test('Should open nested drawer when nested trigger is clicked', async ({ page }) => {
      await drawerStory.goto(page, 'With Nested');
      await page.getByRole('button', { name: '1st level drawer' }).click();
      await expect(page.getByText('[Level 1] Main Drawer')).toBeVisible();

      await page.getByRole('button', { name: '2nd level drawer' }).click();
      await expect(page.getByText('[Level 2] Detail View')).toBeVisible();
    });

    test('Should reflow the OverflowList when the drawer is resized wider', async ({ page }) => {
      await drawerStory.goto(page, 'Resizable With Overflow List');

      await page.getByRole('button', { name: 'Open Resizable Drawer with OverflowList' }).click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      const countVisibleTags = () =>
        page
          .getByRole('dialog')
          .locator('[data-slot="overflow-list"] [data-slot="tag"]')
          .filter({ hasNotText: /^\+\d+$/ })
          .count();

      const before = await countVisibleTags();
      expect(before).toBeGreaterThan(0);

      const handle = dialog.locator('[data-slot="resize-handle"]');
      const box = await handle.boundingBox();
      if (!box) throw new Error('Resize handle not found');

      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;
      // Drawer starts at width=480; the handle is on its left edge. Dragging the
      // mouse 400px left increases width to ~880px (delta = startX - clientX),
      // safely within the [400, 1130] min/max at the 1280px CI viewport.
      const targetX = startX - 400;

      await handle.hover();
      await page.mouse.down();
      // Wait for DrawerResizeHandle to flip data-resizing="true" — same handshake
      // as the Table test below. More reliable than a fixed timeout.
      await expect(handle).toHaveAttribute('data-resizing', 'true');

      // Move left to widen the drawer (delta = startX - clientX becomes positive → width increases)
      await page.mouse.move(targetX, startY, { steps: 20 });
      await page.mouse.up();

      await expect.poll(countVisibleTags, { timeout: 5000 }).toBeGreaterThan(before);
    });
  });

  test.describe('Accessibility', () => {
    test('Should close drawer via Escape key', async ({ page }) => {
      await drawerStory.goto(page, 'Basic');
      await openDrawer(page);

      await page.keyboard.press('Escape');
      await expect(getDrawerContent(page)).toBeHidden();
    });

    test('Should not close drawer via Escape key when closeOnEscape is false', async ({ page }) => {
      await drawerStory.goto(page, 'No Closable On Esc');
      await page.getByRole('button', { name: 'Open Drawer' }).click();
      const content = page.locator('[data-scope="dialog"][data-part="content"]');
      await expect(content).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(content).toBeVisible();
    });
  });
});
