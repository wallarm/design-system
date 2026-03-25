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
  });

  test.describe('Interactions', () => {
    test('Should open drawer when trigger button is clicked', async ({ page }) => {
      await drawerStory.goto(page, 'Basic');
      await expect(getDrawerContent(page)).toBeHidden();
      await openDrawer(page);
      await expect(getDrawerContent(page)).toBeVisible();
    });

    test('Should close drawer when overlay is clicked', async ({ page }) => {
      await drawerStory.goto(page, 'Basic');
      await openDrawer(page);

      // Click the positioner layer outside the drawer content.
      // Ark UI detects interact-outside on the positioner (not the backdrop),
      // so we must click this element at a position away from the content.
      const positioner = page.locator('[data-scope="dialog"][data-part="positioner"]');
      await positioner.click({ position: { x: 5, y: 5 } });
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
