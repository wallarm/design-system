import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const toastStory = createStoryHelper('messaging-toast', [
  'Basic',
  'With Nested Overlays',
  'Update Loading To Success',
  'Simple With Actions',
  'Extended With Actions',
  'Long Text',
  'Without Close Button',
  'Custom Icon',
] as const);

const getToasts = (page: Page) => page.locator('[data-scope="toast"][data-part="root"]');
const getToastCloseButton = (page: Page) =>
  getToasts(page).first().getByRole('button', { name: 'Close' });

/** Click a static (secondary variant) button to create a toast without progress animation */
const initStaticToast = async (page: Page, name: string) => {
  const staticSection = page.getByText('Static (for screenshots)').locator('..');
  await staticSection.getByRole('button', { name }).click();
};

const verifyAndClose = async (page: Page) => {
  await expect(getToasts(page)).toBeVisible();
  await expect(page).toHaveScreenshot();
  await getToastCloseButton(page).click();
  await expect(getToasts(page)).toBeHidden();
};

test.describe('Toast Component', () => {
  test.describe('View - All Types', () => {
    test('Success toast', async ({ page }) => {
      await toastStory.goto(page, 'Basic');
      await initStaticToast(page, 'Success Toast');
      await verifyAndClose(page);
    });

    test('Error toast', async ({ page }) => {
      await toastStory.goto(page, 'Basic');
      await initStaticToast(page, 'Error Toast');
      await verifyAndClose(page);
    });

    test('Warning toast', async ({ page }) => {
      await toastStory.goto(page, 'Basic');
      await initStaticToast(page, 'Warning Toast');
      await verifyAndClose(page);
    });

    test('Info toast', async ({ page }) => {
      await toastStory.goto(page, 'Basic');
      await initStaticToast(page, 'Info Toast');
      await verifyAndClose(page);
    });

    test('Loading toast', async ({ page }) => {
      await toastStory.goto(page, 'Basic');
      await initStaticToast(page, 'Loading Toast');
      await verifyAndClose(page);
    });

    test('Default toast', async ({ page }) => {
      await toastStory.goto(page, 'Basic');
      await initStaticToast(page, 'Default Toast');
      await verifyAndClose(page);
    });
  });

  test.describe('Update Toast', () => {
    test('Update toast - loading to success', async ({ page }) => {
      await toastStory.goto(page, 'Update Loading To Success');

      await initStaticToast(page, 'Create loading toast');
      await expect(getToasts(page)).toBeVisible();

      await initStaticToast(page, 'Update to success');
      await verifyAndClose(page);
    });
  });

  test.describe('Simple With Actions', () => {
    test('Simple toast with actions - single', async ({ page }) => {
      await toastStory.goto(page, 'Simple With Actions');
      await initStaticToast(page, 'Simple Toast with Action');

      const toast = getToasts(page);
      await toast.waitFor();

      const undoButton = toast.getByRole('button', { name: 'Undo' });
      await expect(undoButton).toBeEnabled();

      await verifyAndClose(page);
    });

    test('Simple toast with actions - double', async ({ page }) => {
      await toastStory.goto(page, 'Simple With Actions');
      await initStaticToast(page, 'Simple Toast with Two Actions');

      const toast = getToasts(page);
      await toast.waitFor();

      const viewButton = toast.getByRole('button', { name: 'View' });
      await expect(viewButton).toBeEnabled();
      const dismissButton = toast.getByRole('button', {
        name: 'Dismiss',
        exact: true,
      });
      await expect(dismissButton).toBeEnabled();

      await verifyAndClose(page);
    });
  });

  test.describe('Extended Variant With Actions', () => {
    test('Extended toast with actions - single', async ({ page }) => {
      await toastStory.goto(page, 'Extended With Actions');
      await initStaticToast(page, 'Extended Toast with Action');

      const toast = getToasts(page);
      await toast.waitFor();

      const actionButton = toast.getByRole('button', { name: 'Action' });
      await expect(actionButton).toBeEnabled();

      await verifyAndClose(page);
    });

    test('Extended toast with actions - double', async ({ page }) => {
      await toastStory.goto(page, 'Extended With Actions');
      await initStaticToast(page, 'Extended Toast with Two Actions');

      const toast = getToasts(page).first();
      await expect(toast).toBeVisible();

      const viewButton = toast.getByRole('button', { name: 'View' });
      await expect(viewButton).toBeEnabled();

      const downloadButton = toast.getByRole('button', { name: 'Download' });
      await expect(downloadButton).toBeEnabled();

      await verifyAndClose(page);
    });
  });

  test.describe('Long Text', () => {
    test('Long text - simple toast', async ({ page }) => {
      await toastStory.goto(page, 'Long Text');
      await initStaticToast(page, 'Simple with long title');
      await verifyAndClose(page);
    });

    test('Long text - extended toast', async ({ page }) => {
      await toastStory.goto(page, 'Long Text');
      await initStaticToast(page, 'Extended with long text');
      await verifyAndClose(page);
    });
  });

  test.describe('Custom Icon', () => {
    test('Custom icon - own color', async ({ page }) => {
      await toastStory.goto(page, 'Custom Icon');
      await initStaticToast(page, 'Custom Icon with own color');
      await verifyAndClose(page);
    });

    test('Custom icon - without color', async ({ page }) => {
      await toastStory.goto(page, 'Custom Icon');
      await initStaticToast(page, 'Custom Icon without color');
      await verifyAndClose(page);
    });
  });

  test.describe('Close Button', () => {
    test('Close button - keyboard accessible', async ({ page }) => {
      await toastStory.goto(page, 'Basic');
      await initStaticToast(page, 'Success Toast');
      const toast = getToasts(page).first();
      await expect(toast).toBeVisible();

      const closeButton = getToastCloseButton(page);
      await closeButton.focus();
      await expect(closeButton).toBeFocused();

      await page.keyboard.press('Enter');

      await expect(toast).toBeHidden();
    });

    test('Non-closable toast - no close button visible', async ({ page }) => {
      await toastStory.goto(page, 'Without Close Button');
      await initStaticToast(page, 'Non-closable Toast');

      const toast = getToasts(page);
      await expect(toast).toBeVisible();

      const buttons = toast.getByRole('button');
      await expect(buttons).toHaveCount(0);

      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should stack the toast above open drawer and nested dialog overlays', async ({
      page,
    }) => {
      // Regression: the toaster region's forced !z-[50] sat at or below the
      // drawer/dialog positioners (50 + layer * 20) and nested overlays
      // (40 + layer * 20), hiding toasts behind them. The region now sits on
      // the dedicated top-tier --toast-z-index.
      const expectFrontToastOnTop = async () => {
        const toast = getToasts(page).first();
        await expect(toast).toBeVisible();

        // The topmost element at the toast's location must belong to the
        // toast itself — not to a drawer, dialog, or overlay covering it.
        // Polled because the toast slides in: until the enter transition
        // settles its center may still be outside the viewport.
        await expect
          .poll(() =>
            toast.evaluate(el => {
              const rect = el.getBoundingClientRect();
              const top = document.elementFromPoint(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2,
              );
              return !!top && el.contains(top);
            }),
          )
          .toBe(true);
      };

      await toastStory.goto(page, 'With Nested Overlays');

      await page.getByRole('button', { name: 'Open drawer' }).click();
      await page.getByRole('button', { name: 'Show toast from drawer' }).click();
      await expectFrontToastOnTop();

      await page.getByRole('button', { name: 'Open nested dialog' }).click();
      await page.getByRole('button', { name: 'Show toast from nested dialog' }).click();
      await expect(getToasts(page)).toHaveCount(2);
      await expectFrontToastOnTop();
    });
  });
});
