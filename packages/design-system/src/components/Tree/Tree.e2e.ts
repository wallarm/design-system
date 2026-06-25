import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const treeStory = createStoryHelper('navigation-tree', [
  'Basic',
  'Nested',
  'With Icons',
  'With Icons Nested',
  'Collapsible',
  'Collapsible With Actions',
] as const);

test.describe('Component: Tree', () => {
  test.describe('Visual', () => {
    test('Should render basic tree correctly', async ({ page }) => {
      await treeStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render nested tree correctly', async ({ page }) => {
      await treeStory.goto(page, 'Nested');
      await expect(page).toHaveScreenshot();
    });

    test('Should render tree with icons correctly', async ({ page }) => {
      await treeStory.goto(page, 'With Icons');
      await expect(page).toHaveScreenshot();
    });

    test('Should render nested tree with icons correctly', async ({ page }) => {
      await treeStory.goto(page, 'With Icons Nested');
      await expect(page).toHaveScreenshot();
    });

    test('Should render collapsible tree correctly', async ({ page }) => {
      await treeStory.goto(page, 'Collapsible');
      await expect(page).toHaveScreenshot();
    });

    test('Should render collapsible tree with actions correctly', async ({ page }) => {
      await treeStory.goto(page, 'Collapsible With Actions');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should expand collapsed item when header is clicked', async ({ page }) => {
      await treeStory.goto(page, 'Collapsible');

      const itemContent = page.locator('[data-slot="tree-item-content"]').nth(1);
      const itemHeader = page.locator('[data-slot="tree-item-header"]').nth(1);

      await expect(itemContent).toHaveAttribute('data-state', 'closed');
      await itemHeader.click();
      await expect(itemContent).toHaveAttribute('data-state', 'open');
    });

    test('Should collapse expanded item on second click', async ({ page }) => {
      await treeStory.goto(page, 'Collapsible');

      const itemContent = page.locator('[data-slot="tree-item-content"]').first();
      const itemHeader = page.locator('[data-slot="tree-item-header"]').first();

      await expect(itemContent).toHaveAttribute('data-state', 'open');
      await itemHeader.click();
      await expect(itemContent).toHaveAttribute('data-state', 'closed');
    });

    test('Should render expanded state correctly after toggle', async ({ page }) => {
      await treeStory.goto(page, 'Collapsible');

      const itemHeader = page.locator('[data-slot="tree-item-header"]').nth(1);
      await itemHeader.click();

      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Accessibility', () => {
    test('Should have tree-item slots for each item', async ({ page }) => {
      await treeStory.goto(page, 'Basic');
      const items = page.locator('[data-slot="tree-item"]');
      await expect(items).toHaveCount(3);
    });

    test('Should toggle via keyboard when header is focused', async ({ page }) => {
      await treeStory.goto(page, 'Collapsible');

      const itemHeader = page.locator('[data-slot="tree-item-header"]').nth(1);
      const itemContent = page.locator('[data-slot="tree-item-content"]').nth(1);

      await expect(itemContent).toHaveAttribute('data-state', 'closed');
      await itemHeader.locator('button').focus();
      await page.keyboard.press('Enter');
      await expect(itemContent).toHaveAttribute('data-state', 'open');
    });
  });
});
