import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const treeViewStory = createStoryHelper('navigation-treeview', [
  'Basic',
  'Nested',
  'With Icons',
  'With Icons Nested',
  'Collapsible',
  'Collapsible With Actions',
] as const);

test.describe('Component: TreeView', () => {
  test.describe('Visual', () => {
    test('Should render basic tree view correctly', async ({ page }) => {
      await treeViewStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render nested tree view correctly', async ({ page }) => {
      await treeViewStory.goto(page, 'Nested');
      await expect(page).toHaveScreenshot();
    });

    test('Should render tree view with icons correctly', async ({ page }) => {
      await treeViewStory.goto(page, 'With Icons');
      await expect(page).toHaveScreenshot();
    });

    test('Should render nested tree view with icons correctly', async ({ page }) => {
      await treeViewStory.goto(page, 'With Icons Nested');
      await expect(page).toHaveScreenshot();
    });

    test('Should render collapsible tree view correctly', async ({ page }) => {
      await treeViewStory.goto(page, 'Collapsible');
      await expect(page).toHaveScreenshot();
    });

    test('Should render collapsible tree view with actions correctly', async ({ page }) => {
      await treeViewStory.goto(page, 'Collapsible With Actions');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should expand collapsed item when trigger is clicked', async ({ page }) => {
      await treeViewStory.goto(page, 'Collapsible');

      const branchContent = page.locator('[data-slot="tree-branch-content"]').nth(1);
      const branchControl = page.locator('[data-slot="tree-branch-control"]').nth(1);

      await expect(branchContent).toHaveAttribute('data-state', 'closed');
      await branchControl.click();
      await expect(branchContent).toHaveAttribute('data-state', 'open');
    });

    test('Should collapse expanded item on second click', async ({ page }) => {
      await treeViewStory.goto(page, 'Collapsible');

      const branchContent = page.locator('[data-slot="tree-branch-content"]').first();
      const branchControl = page.locator('[data-slot="tree-branch-control"]').first();

      await expect(branchContent).toHaveAttribute('data-state', 'open');
      await branchControl.click();
      await expect(branchContent).toHaveAttribute('data-state', 'closed');
    });

    test('Should render expanded state correctly after toggle', async ({ page }) => {
      await treeViewStory.goto(page, 'Collapsible');

      const branchControl = page.locator('[data-slot="tree-branch-control"]').nth(1);
      await branchControl.click();

      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Accessibility', () => {
    test('Should have tree role', async ({ page }) => {
      await treeViewStory.goto(page, 'Basic');
      const tree = page.getByRole('tree');
      await expect(tree).toBeVisible();
    });

    test('Should have treeitem roles', async ({ page }) => {
      await treeViewStory.goto(page, 'Basic');
      const items = page.getByRole('treeitem');
      await expect(items).toHaveCount(3);
    });

    test('Should navigate with keyboard', async ({ page }) => {
      await treeViewStory.goto(page, 'Collapsible');

      // Focus the tree
      await page.getByRole('tree').focus();

      // Arrow down to navigate
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');

      // Enter to toggle expand
      const branchContent = page.locator('[data-slot="tree-branch-content"]').nth(1);
      await expect(branchContent).toHaveAttribute('data-state', 'closed');
      await page.keyboard.press('Enter');
      await expect(branchContent).toHaveAttribute('data-state', 'open');
    });
  });
});
