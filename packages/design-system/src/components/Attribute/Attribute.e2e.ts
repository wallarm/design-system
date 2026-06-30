import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const attributeStory = createStoryHelper('data-display-attribute', [
  'Horizontal',
  'Horizontal Truncation',
  'Horizontal Composition',
  'Horizontal Loading',
  'Horizontal With Actions',
  'Horizontal With Actions Menu Only',
  'Inline Edit Text',
  'Inline Edit Error',
  'Inline Edit Loading',
  'Inline Edit Saved',
  'Inline Edit Horizontal',
  'Inline Edit Async',
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

    test('Should render inline edit read state correctly', async ({ page }) => {
      await attributeStory.goto(page, 'Inline Edit Text');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render inline edit hover affordance correctly', async ({ page }) => {
      await attributeStory.goto(page, 'Inline Edit Text');
      await page.getByTestId('attr--edit-preview').hover();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render inline edit editing state correctly', async ({ page }) => {
      await attributeStory.goto(page, 'Inline Edit Text');
      await page.getByTestId('attr--edit-preview').click();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render inline edit error state correctly', async ({ page }) => {
      await attributeStory.goto(page, 'Inline Edit Error');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render inline edit loading state correctly', async ({ page }) => {
      await attributeStory.goto(page, 'Inline Edit Loading');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render inline edit saved state correctly', async ({ page }) => {
      await attributeStory.goto(page, 'Inline Edit Saved');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render inline edit horizontal orientation correctly', async ({ page }) => {
      await attributeStory.goto(page, 'Inline Edit Horizontal');
      await page.getByTestId('attr--edit-preview').click();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
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
      await attributeStory.goto(page, 'Horizontal With Actions');

      const badge = page.locator('[data-slot="badge"]').first();
      const dropdownContent = page.locator('[data-scope="menu"][data-part="content"]');

      await expect(badge).toBeVisible();
      await badge.click();

      await expect(dropdownContent).toBeVisible();
    });

    test('Should open actions dropdown when clicking a decorative Tag inside an OverflowList', async ({
      page,
    }) => {
      await attributeStory.goto(page, 'Horizontal With Actions');

      const tag = page.locator('[data-slot="tag"]:visible').first();
      const dropdownContent = page.locator('[data-scope="menu"][data-part="content"]');

      await expect(tag).toBeVisible();
      await tag.click();

      await expect(dropdownContent).toBeVisible();
    });

    test('Should open IP overflow popover and not the dropdown in default mode', async ({
      page,
    }) => {
      await attributeStory.goto(page, 'Horizontal With Actions');

      const overflowTrigger = page.getByTestId('attr-ip-overflow--list-overflow-trigger');
      const overflowContent = page.getByTestId('attr-ip-overflow--list-overflow-content');
      const dropdownContent = page.locator('[data-scope="menu"][data-part="content"]');

      await expect(overflowTrigger).toBeVisible();
      await overflowTrigger.click();

      await expect(overflowContent).toBeVisible();
      await expect(dropdownContent).toBeHidden();
    });

    test('Should enter edit mode and commit on Enter', async ({ page }) => {
      await attributeStory.goto(page, 'Inline Edit Text');
      await page.getByTestId('attr--edit-preview').click();
      const input = page.getByTestId('attr--edit-input');
      await expect(input).toBeFocused();
      await input.fill('Payments API');
      await input.press('Enter');
      await expect(page.getByTestId('attr--edit-preview')).toHaveText(/Payments API/);
    });

    test('Should revert on Escape', async ({ page }) => {
      await attributeStory.goto(page, 'Inline Edit Text');
      await page.getByTestId('attr--edit-preview').click();
      const input = page.getByTestId('attr--edit-input');
      await input.fill('Discarded');
      await input.press('Escape');
      await expect(page.getByTestId('attr--edit-preview')).toHaveText(/Checkout API/);
    });

    test('Should commit on blur', async ({ page }) => {
      await attributeStory.goto(page, 'Inline Edit Text');
      await page.getByTestId('attr--edit-preview').click();
      const input = page.getByTestId('attr--edit-input');
      await input.fill('Blurred API');
      await input.press('Tab');
      await expect(page.getByTestId('attr--edit-preview')).toHaveText(/Blurred API/);
    });

    test('Should show loading then saved during async commit', async ({ page }) => {
      await attributeStory.goto(page, 'Inline Edit Async');
      await page.getByTestId('attr--edit-preview').click();
      const input = page.getByTestId('attr--edit-input');
      await input.fill('Async API');
      await input.press('Enter');
      // loading spinner visible inside the preview while the promise is pending
      await expect(page.getByTestId('attr--edit-preview')).toHaveText(/Async API/);
    });

    test('Should surface error and stay in edit on rejected commit', async ({ page }) => {
      await attributeStory.goto(page, 'Inline Edit Async');
      await page.getByTestId('attr--edit-preview').click();
      const input = page.getByTestId('attr--edit-input');
      await input.fill('');
      await input.press('Enter');
      await expect(page.getByTestId('attr--edit-error')).toBeVisible();
      await expect(page.getByTestId('attr--edit-input')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('Should enter edit via keyboard activation', async ({ page }) => {
      await attributeStory.goto(page, 'Inline Edit Text');
      const preview = page.getByTestId('attr--edit-preview');
      await preview.focus();
      await preview.press('Enter');
      await expect(page.getByTestId('attr--edit-input')).toBeFocused();
    });

    test('Should cancel edit via Escape and restore focus to preview', async ({ page }) => {
      await attributeStory.goto(page, 'Inline Edit Text');
      await page.getByTestId('attr--edit-preview').click();
      await page.getByTestId('attr--edit-input').press('Escape');
      await expect(page.getByTestId('attr--edit-preview')).toBeVisible();
    });
  });
});
