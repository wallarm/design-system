import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const overlayStory = createStoryHelper('overlay-overlaymanager', [
  'Confirm Dialog',
  'From Menu Item',
  'Lazy Loading',
  'Skeleton While Loading',
  'Stacked Overlays',
  'Unsaved Changes Guard',
] as const);

const getConfirmContent = (page: Page) => page.getByTestId('confirm-delete--content');
const getEditUserContent = (page: Page) => page.getByTestId('edit-user--content');
const getGuardContent = (page: Page) => page.getByTestId('unsaved-changes--content');
const getResult = (page: Page) => page.getByTestId('result');
const getLoading = (page: Page) => page.getByTestId('edit-user--loading');

const openConfirm = async (page: Page) => {
  await page.getByTestId('open-confirm').click();
  await expect(getConfirmContent(page)).toBeVisible();
};

const openEditUser = async (page: Page) => {
  await page.getByTestId('open-edit-user').click();
  await expect(getEditUserContent(page)).toBeVisible();
};

/**
 * Holds every script request until the returned release runs, so a lazy chunk cannot arrive in the
 * middle of an assertion about the skeleton. Call it after goto, once the story's own code is in.
 */
const holdScripts = async (page: Page) => {
  const gate: { open?: () => void } = {};
  const opened = new Promise<void>(resolve => {
    gate.open = resolve;
  });
  await page.route('**/*.js', async route => {
    await opened;
    await route.fallback();
  });
  return async () => {
    gate.open?.();
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  };
};

/** Waits until every finite animation has ended, such as the drawer sliding in. */
const waitForAnimations = (page: Page) =>
  page.waitForFunction(() =>
    document
      .getAnimations()
      .every(
        animation =>
          animation.playState !== 'running' ||
          animation.effect?.getTiming().iterations === Number.POSITIVE_INFINITY,
      ),
  );

test.describe('Component: OverlayManager', () => {
  test.describe('Visual', () => {
    test('Should render confirm dialog correctly', async ({ page }) => {
      await overlayStory.goto(page, 'Confirm Dialog');
      await openConfirm(page);
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the skeleton while the drawer form loads', async ({ page }) => {
      await overlayStory.goto(page, 'Skeleton While Loading');
      const release = await holdScripts(page);
      await openEditUser(page);
      await expect(getLoading(page)).toBeAttached();

      await expect(page).toHaveScreenshot({ animations: 'disabled' });
      await release();
    });

    test('Should render stacked overlays correctly', async ({ page }) => {
      await overlayStory.goto(page, 'Stacked Overlays');
      await openEditUser(page);
      await page.getByTestId('edit-user-delete').click();
      await expect(getConfirmContent(page)).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });
  });

  test.describe('Interactions', () => {
    test('Should resolve the result when confirm is clicked', async ({ page }) => {
      await overlayStory.goto(page, 'Confirm Dialog');
      await expect(getResult(page)).toHaveText('Result: none yet');
      await openConfirm(page);

      await page.getByTestId('confirm-delete-submit').click();

      await expect(getResult(page)).toHaveText('Result: deleted');
      await expect(getConfirmContent(page)).toBeHidden();
    });

    test('Should resolve cancelled when Escape is pressed', async ({ page }) => {
      await overlayStory.goto(page, 'Confirm Dialog');
      await openConfirm(page);

      await page.keyboard.press('Escape');

      await expect(getResult(page)).toHaveText('Result: cancelled');
      await expect(getConfirmContent(page)).toBeHidden();
    });

    test('Should open the dialog when a menu item is clicked', async ({ page }) => {
      await overlayStory.goto(page, 'From Menu Item');
      await page.getByTestId('row-menu').click();
      await page.getByTestId('row-menu-delete').click();

      await expect(getConfirmContent(page)).toBeVisible();
      // The dialog outlives the menu that opened it.
      await expect(page.getByTestId('row-menu-delete')).toBeHidden();
      await page.getByTestId('confirm-delete-submit').click();
      await expect(getResult(page)).toHaveText('Result: deleted');
    });

    test('Should load the code on hover, then open the dialog at once', async ({ page }) => {
      await overlayStory.goto(page, 'Lazy Loading');
      const codeStatus = page.getByTestId('code-status');
      await expect(codeStatus).toHaveText('Dialog code: not loaded');

      await page.getByTestId('open-lazy-confirm').hover();
      await expect(codeStatus).toHaveText('Dialog code: loading');
      await expect(codeStatus).toHaveText('Dialog code: loaded');

      await page.getByTestId('open-lazy-confirm').click();
      await expect(getConfirmContent(page)).toBeVisible();
      await page.getByTestId('confirm-delete-submit').click();
      await expect(getResult(page)).toHaveText('Result: deleted');
    });

    test('Should show nothing until the code arrives when the first open loads it', async ({
      page,
    }) => {
      await overlayStory.goto(page, 'Lazy Loading');
      // A click event with no pointer move before it, so no hover starts the load early.
      await page.getByTestId('open-lazy-confirm').dispatchEvent('click');

      await expect(page.getByTestId('code-status')).toHaveText('Dialog code: loading');
      await expect(getConfirmContent(page)).toBeHidden();
      await expect(getConfirmContent(page)).toBeVisible();
      await expect(page.getByTestId('code-status')).toHaveText('Dialog code: loaded');
    });

    test('Should keep focus and the footer in place when the form arrives', async ({ page }) => {
      await overlayStory.goto(page, 'Skeleton While Loading');
      const release = await holdScripts(page);
      await openEditUser(page);
      const close = page.getByTestId('edit-user--close');
      const footer = page.getByTestId('edit-user--footer');
      await expect(getLoading(page)).toBeAttached();
      await expect(close).toBeFocused();
      await waitForAnimations(page);
      const skeletonFooter = await footer.boundingBox();

      await release();
      await expect(page.getByTestId('edit-user-name')).toBeVisible();

      await expect(getLoading(page)).toHaveCount(0);
      await expect(close).toBeFocused();
      expect(await footer.boundingBox()).toEqual(skeletonFooter);
    });

    test('Should close with Escape while the form loads', async ({ page }) => {
      await overlayStory.goto(page, 'Skeleton While Loading');
      const release = await holdScripts(page);
      await openEditUser(page);
      await expect(getLoading(page)).toBeAttached();
      // zag listens for Escape once focus is inside the drawer.
      await expect(page.getByTestId('edit-user--close')).toBeFocused();

      await page.keyboard.press('Escape');

      await expect(getEditUserContent(page)).toBeHidden();
      await expect(page.getByTestId('open-edit-user')).toBeFocused();
      await release();
    });

    test('Should close only the top overlay when Escape is pressed over a stack', async ({
      page,
    }) => {
      await overlayStory.goto(page, 'Stacked Overlays');
      await openEditUser(page);
      await page.getByTestId('edit-user-delete').click();
      await expect(getConfirmContent(page)).toBeVisible();

      await page.keyboard.press('Escape');

      await expect(getConfirmContent(page)).toBeHidden();
      await expect(getEditUserContent(page)).toBeVisible();
      await expect(getEditUserContent(page)).toHaveAttribute('data-state', 'open');
    });

    test('Should ask before closing when the drawer has unsaved changes', async ({ page }) => {
      await overlayStory.goto(page, 'Unsaved Changes Guard');
      await openEditUser(page);
      await page.getByTestId('edit-user-name').fill('Jane Cooper-Smith');

      await page.keyboard.press('Escape');
      await expect(getGuardContent(page)).toBeVisible();

      await page.getByTestId('unsaved-changes-keep').click();
      // The closing guard stays mounted while it animates out: wait for it before asking again.
      await expect(getGuardContent(page)).toBeHidden();
      await expect(getEditUserContent(page)).toHaveAttribute('data-state', 'open');

      await page.keyboard.press('Escape');
      await expect(getGuardContent(page)).toBeVisible();

      await page.getByTestId('unsaved-changes-leave').click();
      await expect(getEditUserContent(page)).toBeHidden();
    });
  });

  test.describe('Accessibility', () => {
    test('Should be labelled by its title via role', async ({ page }) => {
      await overlayStory.goto(page, 'Confirm Dialog');
      await openConfirm(page);

      await expect(page.getByRole('dialog', { name: 'Delete user?' })).toBeVisible();
    });

    test('Should name the drawer and announce the load while the form loads', async ({ page }) => {
      await overlayStory.goto(page, 'Skeleton While Loading');
      const release = await holdScripts(page);
      await openEditUser(page);

      await expect(page.getByRole('dialog', { name: 'Edit user' })).toBeVisible();
      await expect(page.getByRole('status')).toHaveText('Loading');
      // A busy live region would hold the announcement back.
      await expect(page.getByRole('status')).not.toHaveAttribute('aria-busy', 'true');
      await release();
    });

    test('Should return focus to the trigger via Escape', async ({ page }) => {
      await overlayStory.goto(page, 'Confirm Dialog');
      await page.getByTestId('open-confirm').focus();
      await page.keyboard.press('Enter');
      await expect(getConfirmContent(page)).toBeVisible();

      await page.keyboard.press('Escape');

      await expect(getConfirmContent(page)).toBeHidden();
      await expect(page.getByTestId('open-confirm')).toBeFocused();
    });
  });
});
