import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const dropdownMenuStory = createStoryHelper('actions-dropdownmenu', [
  'Basic',
  'Context',
  'With Descriptions',
  'With Icons',
  'With Footer',
  'With Description And Icons',
  'With Checkbox Items',
  'With Radio Group',
  'With Mixed Selection Items',
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

    test('Should render checkbox items correctly', async ({ page }) => {
      await dropdownMenuStory.goto(page, 'With Checkbox Items');
      await openMenu(page);
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render radio group correctly', async ({ page }) => {
      await dropdownMenuStory.goto(page, 'With Radio Group');
      await openMenu(page);
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render mixed selection items correctly', async ({ page }) => {
      await dropdownMenuStory.goto(page, 'With Mixed Selection Items');
      await openMenu(page);
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

    test('Should toggle checkbox item on click and keep menu open', async ({ page }) => {
      await dropdownMenuStory.goto(page, 'With Checkbox Items');
      await openMenu(page);

      const italicItem = page
        .getByTestId('dropdown-menu--checkbox-item')
        .filter({ hasText: 'Italic' });
      await expect(italicItem).toHaveAttribute('data-state', 'unchecked');

      await italicItem.click();
      await expect(italicItem).toHaveAttribute('data-state', 'checked');
      await expect(getMenuContent(page)).toBeVisible();

      await italicItem.click();
      await expect(italicItem).toHaveAttribute('data-state', 'unchecked');
      await expect(getMenuContent(page)).toBeVisible();
    });

    test('Should select radio item on click and update group value', async ({ page }) => {
      await dropdownMenuStory.goto(page, 'With Radio Group');
      await openMenu(page);

      const listItem = page.getByTestId('dropdown-menu--radio-item').filter({ hasText: 'List' });
      const gridItem = page.getByTestId('dropdown-menu--radio-item').filter({ hasText: 'Grid' });

      await expect(listItem).toHaveAttribute('data-state', 'checked');
      await expect(gridItem).toHaveAttribute('data-state', 'unchecked');

      await gridItem.click();
      await expect(gridItem).toHaveAttribute('data-state', 'checked');
      await expect(listItem).toHaveAttribute('data-state', 'unchecked');
    });

    test('Should not toggle disabled checkbox item', async ({ page }) => {
      await dropdownMenuStory.goto(page, 'With Checkbox Items');
      await openMenu(page);

      const strikethroughItem = page
        .getByTestId('dropdown-menu--checkbox-item')
        .filter({ hasText: 'Strikethrough' });
      await expect(strikethroughItem).toHaveAttribute('data-disabled', '');
      await expect(strikethroughItem).toHaveAttribute('data-state', 'unchecked');

      await strikethroughItem.click({ force: true });
      await expect(strikethroughItem).toHaveAttribute('data-state', 'unchecked');
    });

    test('Should not select disabled radio item', async ({ page }) => {
      await dropdownMenuStory.goto(page, 'With Radio Group');
      await openMenu(page);

      const compactItem = page
        .getByTestId('dropdown-menu--radio-item')
        .filter({ hasText: 'Compact' });
      await expect(compactItem).toHaveAttribute('data-disabled', '');

      await compactItem.click({ force: true });
      await expect(compactItem).toHaveAttribute('data-state', 'unchecked');
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

    test('Should expose menuitemcheckbox role with aria-checked', async ({ page }) => {
      await dropdownMenuStory.goto(page, 'With Checkbox Items');
      await openMenu(page);

      const boldItem = page.getByRole('menuitemcheckbox', { name: 'Bold' });
      await expect(boldItem).toHaveAttribute('aria-checked', 'true');

      const italicItem = page.getByRole('menuitemcheckbox', { name: 'Italic' });
      await expect(italicItem).toHaveAttribute('aria-checked', 'false');
    });

    test('Should expose menuitemradio role with aria-checked', async ({ page }) => {
      await dropdownMenuStory.goto(page, 'With Radio Group');
      await openMenu(page);

      const listItem = page.getByRole('menuitemradio', { name: 'List' });
      await expect(listItem).toHaveAttribute('aria-checked', 'true');

      const gridItem = page.getByRole('menuitemradio', { name: 'Grid' });
      await expect(gridItem).toHaveAttribute('aria-checked', 'false');
    });
  });
});
