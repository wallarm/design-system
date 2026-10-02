import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const overflowStory = createStoryHelper('data-display-overflowlist', [
  'Resizable Container',
  'Show All In Popover',
  'Hidden Only In Popover',
  'Overlay Origin',
] as const);

const setWrapperWidth = (page: Page, width: number) =>
  page.getByTestId('resizable-wrapper').evaluate((el, w) => {
    (el as HTMLElement).style.width = `${w}px`;
  }, width);

// Count only the visible item tags inside the overflow list, excluding the
// "+N more" overflow indicator tag.
const getVisibleItemTagCount = (page: Page) =>
  page
    .locator('[data-slot="overflow-list"] [data-slot="tag"]')
    .filter({ hasNotText: /^\+\d+ more$/ })
    .count();

// The overflow indicator lives inside the overflow-list, not in the hidden
// measurement container, so scope the locator to avoid strict-mode failures.
const getOverflowIndicator = (page: Page) =>
  page
    .locator('[data-slot="overflow-list"]')
    .getByText(/^\+\d+ more$/)
    .first();

test.describe('Component: OverflowList', () => {
  test.describe('Visual', () => {
    test('Should render chip overflow popover correctly', async ({ page }) => {
      await overflowStory.goto(page, 'Show All In Popover');

      // Take screenshot of the trigger
      await expect(page).toHaveScreenshot('chip-overflow-trigger.png');

      // Click the overflow trigger to open popover
      await getOverflowIndicator(page).click();

      // Wait for popover to be visible
      await expect(page.getByText('4 attack types')).toBeVisible();

      // Take screenshot of the open popover
      await expect(page).toHaveScreenshot('chip-overflow-popover-open.png');
    });
  });

  test.describe('Interactions', () => {
    test('Should collapse items into the overflow indicator when the container shrinks', async ({
      page,
    }) => {
      await overflowStory.goto(page, 'Resizable Container');
      const wide = await getVisibleItemTagCount(page);

      await setWrapperWidth(page, 120);

      await expect.poll(() => getVisibleItemTagCount(page)).toBeLessThan(wide);
      await expect(getOverflowIndicator(page)).toBeVisible();
    });

    test('Should restore items when the container grows back', async ({ page }) => {
      await overflowStory.goto(page, 'Resizable Container');

      await setWrapperWidth(page, 120);
      // Wait for the reflow to settle before reading the narrow count.
      await expect.poll(() => getVisibleItemTagCount(page)).toBeLessThan(9);
      const narrow = await getVisibleItemTagCount(page);

      await setWrapperWidth(page, 760);

      await expect.poll(() => getVisibleItemTagCount(page)).toBeGreaterThan(narrow);
    });
  });

  test.describe('ChipOverflowPopover - Show All Pattern', () => {
    test('Should show header with total count', async ({ page }) => {
      await overflowStory.goto(page, 'Show All In Popover');

      // Click the overflow trigger
      await getOverflowIndicator(page).click();

      // Verify header shows total count
      await expect(page.getByText('4 attack types')).toBeVisible();
    });

    test('Should show all items (visible + hidden) in popover', async ({ page }) => {
      await overflowStory.goto(page, 'Show All In Popover');

      // Click the overflow trigger
      await getOverflowIndicator(page).click();

      // Verify all 4 attack types are shown in the popover
      const popover = page.locator('[data-slot="popover-content"]');
      await expect(popover.getByText('RCE')).toBeVisible();
      await expect(popover.getByText('XSS')).toBeVisible();
      await expect(popover.getByText('SQL Injection')).toBeVisible();
      await expect(popover.getByText('CSRF')).toBeVisible();
    });

    test('Should dim visible items in popover', async ({ page }) => {
      await overflowStory.goto(page, 'Show All In Popover');

      // Click the overflow trigger
      await getOverflowIndicator(page).click();

      // Verify visible item has opacity-60 class
      const visibleItem = page.locator('[data-visible="true"]').first();
      await expect(visibleItem).toHaveClass(/opacity-60/);
    });

    test('Should close popover on Escape key', async ({ page }) => {
      await overflowStory.goto(page, 'Show All In Popover');

      // Click the overflow trigger
      await getOverflowIndicator(page).click();

      // Verify popover is open
      await expect(page.getByText('4 attack types')).toBeVisible();

      // Press Escape
      await page.keyboard.press('Escape');

      // Verify popover is closed
      await expect(page.getByText('4 attack types')).not.toBeVisible();
    });
  });

  test.describe('ChipOverflowPopover - Hidden Only Pattern', () => {
    test('Should not show header when showAll is false', async ({ page }) => {
      await overflowStory.goto(page, 'Hidden Only In Popover');

      // Click the overflow trigger
      await getOverflowIndicator(page).click();

      // Verify header is NOT shown
      await expect(page.getByText('attack types')).not.toBeVisible();
    });

    test('Should show only hidden items in popover', async ({ page }) => {
      await overflowStory.goto(page, 'Hidden Only In Popover');

      // Click the overflow trigger
      await getOverflowIndicator(page).click();

      // Verify only hidden items are shown (not the visible one)
      const popover = page.locator('[data-slot="popover-content"]');

      // Should NOT have data-visible="true" items
      await expect(popover.locator('[data-visible="true"]')).toHaveCount(0);

      // Should have hidden items (3 out of 4 in this story with w-120)
      await expect(popover.locator('[data-visible="false"]')).toHaveCount(3);
    });
  });

  test.describe('ChipOverflowPopover - Overlay Origin', () => {
    test('Should overlay the origin when overlayOrigin is true', async ({ page }) => {
      await overflowStory.goto(page, 'Overlay Origin');

      // Click the overflow trigger
      await getOverflowIndicator(page).click();

      // Verify popover has overlay positioning attribute
      const popover = page.locator('[data-slot="popover-content"]');
      await expect(popover).toBeVisible();
      await expect(popover).toHaveAttribute('data-overlay-origin', 'true');
    });

    test('Should show all items with header when overlayOrigin is combined with showAll', async ({
      page,
    }) => {
      await overflowStory.goto(page, 'Overlay Origin');

      // Click the overflow trigger
      await getOverflowIndicator(page).click();

      // Verify header shows total count
      await expect(page.getByText('4 attack types')).toBeVisible();

      // Verify all items are shown
      const popover = page.locator('[data-slot="popover-content"]');
      await expect(popover.getByText('RCE')).toBeVisible();
      await expect(popover.getByText('XSS')).toBeVisible();
      await expect(popover.getByText('SQL Injection')).toBeVisible();
      await expect(popover.getByText('CSRF')).toBeVisible();
    });
  });
});
