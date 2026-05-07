import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const attributeStory = createStoryHelper('data-display-attribute', [
  'Horizontal',
  'Horizontal Truncation',
  'Horizontal Composition',
  'Horizontal Loading',
  'Horizontal With Actions',
  'Horizontal With Actions Menu Only',
] as const);

test.describe('Component: Attribute', () => {
  test.describe('Visual', () => {
    test('Should render horizontal orientation correctly', async ({ page }) => {
      await attributeStory.goto(page, 'Horizontal');
      await expect(page).toHaveScreenshot();
    });

    test('Should render horizontal truncation correctly', async ({ page }) => {
      await attributeStory.goto(page, 'Horizontal Truncation');
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

    test('Should render hover state with full rounded corners on the actions target', async ({
      page,
    }) => {
      await attributeStory.goto(page, 'Horizontal With Actions Menu Only');
      const target = page.getByTestId('attr-ip-overflow--target');
      const box = await target.boundingBox();
      if (!box) throw new Error('target box not measurable');
      await page.mouse.move(box.x + box.width - 4, box.y + box.height / 2);
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should open actions dropdown when clicking a non-interactive area of the value', async ({
      page,
    }) => {
      await attributeStory.goto(page, 'Horizontal With Actions Menu Only');

      const target = page.getByTestId('attr-ip-overflow--target');
      const dropdownContent = page.locator('[data-scope="menu"][data-part="content"]');

      const box = await target.boundingBox();
      if (!box) throw new Error('target box not measurable');
      await page.mouse.click(box.x + box.width - 4, box.y + box.height / 2);

      await expect(dropdownContent).toBeVisible();
    });

    test('Should open actions dropdown when clicking a plain-text value', async ({ page }) => {
      await attributeStory.goto(page, 'Horizontal With Actions');

      const target = page.getByTestId('attr-source-ip--target');
      const dropdownContent = page.locator('[data-scope="menu"][data-part="content"]');

      await expect(target).toBeVisible();
      await target.click();

      await expect(dropdownContent).toBeVisible();
    });

    test('Should open actions dropdown when clicking a decorative Badge value', async ({
      page,
    }) => {
      await attributeStory.goto(page, 'Horizontal With Actions Menu Only');

      const badge = page.locator('[data-slot="badge"]').first();
      const dropdownContent = page.locator('[data-scope="menu"][data-part="content"]');

      await expect(badge).toBeVisible();
      await badge.click();

      await expect(dropdownContent).toBeVisible();
    });

    test('Should open actions dropdown when clicking a decorative Tag inside an OverflowList', async ({
      page,
    }) => {
      await attributeStory.goto(page, 'Horizontal With Actions Menu Only');

      const tag = page.locator('[data-slot="tag"]:visible').first();
      const dropdownContent = page.locator('[data-scope="menu"][data-part="content"]');

      await expect(tag).toBeVisible();
      await tag.click();

      await expect(dropdownContent).toBeVisible();
    });
  });
});
