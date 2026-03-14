import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const dropdownMenuStory = createStoryHelper('actions-dropdownmenu', [
  'Basic',
  'Context',
  'With Descriptions',
  'With Icons',
  'With Footer',
  'With Description And Icons',
] as const);

const getMenuTrigger = (page: Page) => page.getByTestId('dropdown-menu--trigger');
const getMenuContent = (page: Page) => page.getByTestId('dropdown-menu--content');

const openMenu = async (page: Page) => {
  await getMenuTrigger(page).click();
  await expect(getMenuContent(page)).toBeVisible();
};

test.describe('Component: DropdownMenu', () => {
  test.describe('Visual', () => {
    test('Should render basic dropdown menu correctly', async ({ page }) => {
      await dropdownMenuStory.goto(page, 'Basic');
      await openMenu(page);
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render dropdown menu with descriptions correctly', async ({ page }) => {
      await dropdownMenuStory.goto(page, 'With Descriptions');
      await page.getByRole('button', { name: 'Add Widget' }).click();
      await expect(page.locator('[data-scope="menu"][data-part="content"]')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render dropdown menu with icons correctly', async ({ page }) => {
      await dropdownMenuStory.goto(page, 'With Icons');
      await page.getByRole('button', { name: 'Add Widget' }).click();
      await expect(page.locator('[data-scope="menu"][data-part="content"]')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render dropdown menu with footer correctly', async ({ page }) => {
      await dropdownMenuStory.goto(page, 'With Footer');
      await page.getByRole('button', { name: 'Open' }).click();
      await expect(page.locator('[data-scope="menu"][data-part="content"]')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render dropdown menu with descriptions and icons correctly', async ({ page }) => {
      await dropdownMenuStory.goto(page, 'With Description And Icons');
      await page.getByRole('button', { name: 'Add Widget' }).click();
      await expect(page.locator('[data-scope="menu"][data-part="content"]')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });
  });

  test.describe('Interactions', () => {
    test('Should open dropdown menu when trigger is clicked', async ({ page }) => {
      await dropdownMenuStory.goto(page, 'Basic');
      await expect(getMenuContent(page)).toBeHidden();
      await openMenu(page);
      await expect(getMenuContent(page)).toBeVisible();
    });

    test('Should close dropdown menu when clicking outside', async ({ page }) => {
      await dropdownMenuStory.goto(page, 'Basic');
      await openMenu(page);

      await page.locator('body').click({ position: { x: 10, y: 10 } });
      await expect(getMenuContent(page)).toBeHidden();
    });

    test('Should highlight menu item when hovered', async ({ page }) => {
      await dropdownMenuStory.goto(page, 'Basic');
      await openMenu(page);

      const profileItem = getMenuContent(page)
        .locator('[data-scope="menu"][data-part="item"]')
        .filter({ hasText: 'Profile' });
      await profileItem.hover();
      await expect(profileItem).toHaveAttribute('data-highlighted', '');
    });

    test('Should open submenu when trigger item is hovered', async ({ page }) => {
      await dropdownMenuStory.goto(page, 'Basic');
      await openMenu(page);

      const inviteItem = page
        .locator('[data-scope="menu"][data-part="trigger-item"]')
        .filter({ hasText: 'Invite users' });
      await inviteItem.hover();

      // Submenu should appear
      const submenuContent = page.locator('[data-scope="menu"][data-part="content"]').nth(1);
      await expect(submenuContent).toBeVisible();
      await expect(submenuContent.getByText('Email')).toBeVisible();
    });

    test('Should not interact with disabled menu item when clicked', async ({ page }) => {
      await dropdownMenuStory.goto(page, 'Basic');
      await openMenu(page);

      const apiItem = getMenuContent(page)
        .locator('[data-scope="menu"][data-part="item"]')
        .filter({ hasText: 'API' });
      await expect(apiItem).toHaveAttribute('data-disabled', '');
    });

    test('Should open context menu when right-clicking trigger area', async ({ page }) => {
      await dropdownMenuStory.goto(page, 'Context');
      const contextArea = page.getByText('Right click here');
      await contextArea.click({ button: 'right' });

      await expect(page.locator('[data-scope="menu"][data-part="content"]').first()).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('Should close dropdown menu via Escape key', async ({ page }) => {
      await dropdownMenuStory.goto(page, 'Basic');
      await openMenu(page);

      await page.keyboard.press('Escape');
      await expect(getMenuContent(page)).toBeHidden();
    });

    test('Should navigate menu items via ArrowDown key', async ({ page }) => {
      await dropdownMenuStory.goto(page, 'Basic');
      await openMenu(page);

      await page.keyboard.press('ArrowDown');
      const highlightedItem = getMenuContent(page).locator(
        '[data-scope="menu"][data-part="item"][data-highlighted]',
      );
      await expect(highlightedItem).toBeVisible();
    });

    test('Should navigate menu items via ArrowUp key', async ({ page }) => {
      await dropdownMenuStory.goto(page, 'Basic');
      await openMenu(page);

      // Navigate down first, then up
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowUp');

      const highlightedItem = getMenuContent(page).locator(
        '[data-scope="menu"][data-part="item"][data-highlighted]',
      );
      await expect(highlightedItem).toBeVisible();
    });
  });
});
