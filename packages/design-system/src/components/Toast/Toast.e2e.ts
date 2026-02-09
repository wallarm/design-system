import { test, expect, type Page } from '@playwright/test';

import { createStoryHelper } from '@wallarm/playwright-config/storybook';

const toastStory = createStoryHelper('messaging-toast', [
  'Basic',
  'Update Loading To Success',
  'Simple With Actions',
  'Extended With Actions',
  'Long Text',
  'Without Close Button',
  'Custom Icon',
] as const);

const getToasts = (page: Page) =>
  page.locator('[data-scope="toast"][data-part="root"]');
const getToastCloseButton = (page: Page) =>
  getToasts(page).first().locator('[data-part="close-trigger"]');

const initToast = async (page: Page, name: string) => {
  await page.getByRole('button', { name }).click();
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
      await initToast(page, 'Success Toast');
      await verifyAndClose(page);
    });

    test('Error toast', async ({ page }) => {
      await toastStory.goto(page, 'Basic');
      await initToast(page, 'Error Toast');
      await verifyAndClose(page);
    });

    test('Warning toast', async ({ page }) => {
      await toastStory.goto(page, 'Basic');
      await initToast(page, 'Warning Toast');
      await verifyAndClose(page);
    });

    test('Info toast', async ({ page }) => {
      await toastStory.goto(page, 'Basic');
      await initToast(page, 'Info Toast');
      await verifyAndClose(page);
    });

    test('Loading toast', async ({ page }) => {
      await toastStory.goto(page, 'Basic');
      await initToast(page, 'Loading Toast');
      await verifyAndClose(page);
    });

    test('Default toast', async ({ page }) => {
      await toastStory.goto(page, 'Basic');
      await initToast(page, 'Default Toast');
      await verifyAndClose(page);
    });
  });

  test.describe('Update Toast', () => {
    test('Update toast - loading to success', async ({ page }) => {
      await toastStory.goto(page, 'Update Loading To Success');

      await initToast(page, 'Create loading toast');
      await expect(getToasts(page)).toBeVisible();

      await initToast(page, 'Update to success');
      await verifyAndClose(page);
    });
  });

  test.describe('Simple With Actions', () => {
    test('Simple toast with actions - single', async ({ page }) => {
      await toastStory.goto(page, 'Simple With Actions');
      await page
        .getByRole('button', { name: 'Simple Toast with Action' })
        .click();

      const toast = getToasts(page);
      await toast.waitFor();

      const undoButton = toast.getByRole('button', { name: 'Undo' });
      await expect(undoButton).toBeEnabled();

      await verifyAndClose(page);
    });

    test('Simple toast with actions - double', async ({ page }) => {
      await toastStory.goto(page, 'Simple With Actions');
      await page
        .getByRole('button', { name: 'Simple Toast with Two Actions' })
        .click();

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
      await page
        .getByRole('button', { name: 'Extended Toast with Action' })
        .click();

      const toast = getToasts(page);
      await toast.waitFor();

      const actionButton = toast.getByRole('button', { name: 'Action' });
      await expect(actionButton).toBeEnabled();

      await verifyAndClose(page);
    });

    test('Extended toast with actions - double', async ({ page }) => {
      await toastStory.goto(page, 'Extended With Actions');
      await page
        .getByRole('button', { name: 'Extended Toast with Two Actions' })
        .click();

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
      await page
        .getByRole('button', { name: 'Simple with long title' })
        .click();
      await verifyAndClose(page);
    });

    test('Long text - extended toast', async ({ page }) => {
      await toastStory.goto(page, 'Long Text');
      await page
        .getByRole('button', { name: 'Extended with long text' })
        .click();
      await verifyAndClose(page);
    });
  });

  test.describe('Custom Icon', () => {
    test('Custom icon - own color', async ({ page }) => {
      await toastStory.goto(page, 'Custom Icon');
      await page
        .getByRole('button', { name: 'Custom Icon with own color' })
        .click();
      await verifyAndClose(page);
    });

    test('Custom icon - without color', async ({ page }) => {
      await toastStory.goto(page, 'Custom Icon');
      await page
        .getByRole('button', { name: 'Custom Icon without color' })
        .click();
      await verifyAndClose(page);
    });
  });

  test.describe('Close Button', () => {
    test('Close button - keyboard accessible', async ({ page }) => {
      await toastStory.goto(page, 'Basic');
      await initToast(page, 'Success Toast');
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
      await initToast(page, 'Non-closable Toast');

      const toast = getToasts(page);
      await expect(toast).toBeVisible();

      const buttons = toast.getByRole('button');
      await expect(buttons).toHaveCount(0);

      await expect(page).toHaveScreenshot();
    });
  });
});
