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
] as const);

const getDialogContent = (page: Page) => page.getByTestId('dialog--content');
const getDialogTrigger = (page: Page) => page.getByTestId('dialog--trigger');
const getDialogCloseButton = (page: Page) =>
  page.getByTestId('dialog--content').getByRole('button', { name: /close|cancel/i });

const openDialog = async (page: Page) => {
  await getDialogTrigger(page).click();
  await expect(getDialogContent(page)).toBeVisible();
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
  });

  test.describe('Interactions', () => {
    test('Should open dialog when trigger button is clicked', async ({ page }) => {
      await dialogStory.goto(page, 'Basic');
      await expect(getDialogContent(page)).toBeHidden();
      await openDialog(page);
      await expect(getDialogContent(page)).toBeVisible();
    });

    test('Should close dialog when overlay is clicked', async ({ page }) => {
      await dialogStory.goto(page, 'Basic');
      await openDialog(page);

      // Click outside the dialog content to trigger closeOnInteractOutside.
      // Using page.mouse.click ensures a real pointer event that the dialog
      // library can detect, unlike force-clicking the backdrop element.
      await page.mouse.click(10, 10);
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
