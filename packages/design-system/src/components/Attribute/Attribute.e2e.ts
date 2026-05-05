import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const attributeStory = createStoryHelper('data-display-attribute', [
  'Horizontal',
  'Horizontal Label Truncation',
  'Horizontal Value Truncation',
  'Horizontal Composition',
  'Horizontal Loading',
  'Horizontal With Actions',
  'Horizontal With Actions Ip Overflow',
] as const);

test.describe('Component: Attribute', () => {
  test.describe('Visual', () => {
    test('Should render horizontal orientation correctly', async ({ page }) => {
      await attributeStory.goto(page, 'Horizontal');
      await expect(page).toHaveScreenshot();
    });

    test('Should render horizontal label truncation correctly', async ({ page }) => {
      await attributeStory.goto(page, 'Horizontal Label Truncation');
      await expect(page).toHaveScreenshot();
    });

    test('Should render horizontal value truncation correctly', async ({ page }) => {
      await attributeStory.goto(page, 'Horizontal Value Truncation');
      await expect(page).toHaveScreenshot();
    });

    test('Should render horizontal composition correctly', async ({ page }) => {
      await attributeStory.goto(page, 'Horizontal Composition');
      await expect(page).toHaveScreenshot();
    });

    test('Should render horizontal loading correctly', async ({ page }) => {
      await attributeStory.goto(page, 'Horizontal Loading');
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should open IP overflow popover when +N badge is clicked', async ({ page }) => {
      await attributeStory.goto(page, 'Horizontal With Actions Ip Overflow');

      const overflowTrigger = page.getByTestId('attr-ip-overflow--list-overflow-trigger');
      const overflowContent = page.getByTestId('attr-ip-overflow--list-overflow-content');
      const dropdownContent = page.locator('[data-scope="menu"][data-part="content"]');

      await expect(overflowTrigger).toBeVisible();
      await overflowTrigger.click();

      await expect(overflowContent).toBeVisible();
      await expect(dropdownContent).toBeHidden();
    });

    test('Should open actions dropdown when clicking a non-interactive area of the value', async ({
      page,
    }) => {
      await attributeStory.goto(page, 'Horizontal With Actions Ip Overflow');

      const target = page.getByTestId('attr-ip-overflow--target');
      const dropdownContent = page.locator('[data-scope="menu"][data-part="content"]');

      const box = await target.boundingBox();
      if (!box) throw new Error('target box not measurable');
      await page.mouse.click(box.x + box.width - 4, box.y + box.height / 2);

      await expect(dropdownContent).toBeVisible();
    });

    test('Should open actions dropdown when clicking a plain-text value', async ({ page }) => {
      await attributeStory.goto(page, 'Horizontal With Actions');

      // Source IP row uses data-testid="attribute-horizontal-with-actions" on AttributeActions.
      // After the TestId cascade fix, AttributeActionsTarget derives "...--target" from it.
      const target = page.getByTestId('attribute-horizontal-with-actions--target');
      const dropdownContent = page.locator('[data-scope="menu"][data-part="content"]');

      await expect(target).toBeVisible();
      await target.click();

      await expect(dropdownContent).toBeVisible();
    });
  });
});
