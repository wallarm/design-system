import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const treeViewStory = createStoryHelper('navigation-treeview', [
  'Basic',
  'Nested',
  'With Checkboxes',
  'Selectable',
  'Disabled',
  'With Toolbar',
] as const);

const itemByText = (page: Page, text: string) =>
  page.getByRole('treeitem').filter({ hasText: text }).first();

test.describe('Component: TreeView', () => {
  test.describe('Visual', () => {
    test('Should render basic tree correctly', async ({ page }) => {
      await treeViewStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render nested tree correctly', async ({ page }) => {
      await treeViewStory.goto(page, 'Nested');
      await expect(page).toHaveScreenshot();
    });

    test('Should render tree with checkboxes correctly', async ({ page }) => {
      await treeViewStory.goto(page, 'With Checkboxes');
      await expect(page).toHaveScreenshot();
    });

    test('Should render selectable tree correctly', async ({ page }) => {
      await treeViewStory.goto(page, 'Selectable');
      await expect(page).toHaveScreenshot();
    });

    test('Should render disabled items correctly', async ({ page }) => {
      await treeViewStory.goto(page, 'Disabled');
      await expect(page).toHaveScreenshot();
    });

    test('Should render tree with toolbar correctly', async ({ page }) => {
      await treeViewStory.goto(page, 'With Toolbar');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should expand a collapsed branch when its toggle is clicked', async ({ page }) => {
      await treeViewStory.goto(page, 'Basic');

      const utils = itemByText(page, 'Utils');
      const group = utils.locator('[data-slot="tree-view-group"]').first();

      await expect(group).toBeHidden();
      await utils.locator('[data-slot="tree-view-toggle"]').first().click();
      await expect(group).toBeVisible();
    });

    test('Should select a row when it is clicked', async ({ page }) => {
      await treeViewStory.goto(page, 'Selectable');

      const input = itemByText(page, 'Input.tsx');
      await expect(input).toHaveAttribute('aria-selected', 'false');
      await input.click();
      await expect(input).toHaveAttribute('aria-selected', 'true');
    });

    test('Should collapse every branch when collapse-all is clicked', async ({ page }) => {
      await treeViewStory.goto(page, 'With Toolbar');

      const src = itemByText(page, 'src');
      const group = src.locator('[data-slot="tree-view-group"]').first();

      await expect(group).toBeVisible();
      await page.getByRole('button', { name: 'Collapse all' }).click();
      await expect(group).toBeHidden();
    });

    test('Should expand every branch when expand-all is clicked', async ({ page }) => {
      await treeViewStory.goto(page, 'With Toolbar');

      await page.getByRole('button', { name: 'Collapse all' }).click();
      const src = itemByText(page, 'src');
      const group = src.locator('[data-slot="tree-view-group"]').first();
      await expect(group).toBeHidden();

      await page.getByRole('button', { name: 'Expand all' }).click();
      await expect(group).toBeVisible();
    });

    test('Should not select a disabled row when it is clicked', async ({ page }) => {
      await treeViewStory.goto(page, 'Disabled');

      const disabled = itemByText(page, 'Input.tsx (disabled)');
      await expect(disabled).toHaveAttribute('aria-disabled', 'true');

      await disabled.click({ force: true });
      await expect(disabled).not.toHaveAttribute('aria-selected', 'true');
    });

    test('Should toggle a checkbox when it is clicked', async ({ page }) => {
      await treeViewStory.goto(page, 'With Checkboxes');

      const checkbox = page.getByRole('checkbox').first();
      await expect(checkbox).not.toBeChecked();
      await checkbox.click();
      await expect(checkbox).toBeChecked();
    });
  });

  test.describe('Accessibility', () => {
    test('Should expose tree and treeitem roles', async ({ page }) => {
      await treeViewStory.goto(page, 'Basic');

      await expect(page.getByRole('tree')).toHaveCount(1);
      await expect(page.getByRole('treeitem').first()).toBeVisible();
    });

    test('Should expand a branch via ArrowRight key', async ({ page }) => {
      await treeViewStory.goto(page, 'Basic');

      const utils = itemByText(page, 'Utils');
      const group = utils.locator('[data-slot="tree-view-group"]').first();

      await expect(group).toBeHidden();
      await utils.focus();
      await page.keyboard.press('ArrowRight');
      await expect(group).toBeVisible();
    });

    test('Should select a row via Enter key', async ({ page }) => {
      await treeViewStory.goto(page, 'Selectable');

      const input = itemByText(page, 'Input.tsx');
      await input.focus();
      await page.keyboard.press('Enter');
      await expect(input).toHaveAttribute('aria-selected', 'true');
    });
  });
});
