import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const overflowStory = createStoryHelper('data-display-overflowlist', [
  'Resizable Container',
] as const);

const setWrapperWidth = (page: Page, width: number) =>
  page.getByTestId('resizable-wrapper').evaluate((el, w) => {
    (el as HTMLElement).style.width = `${w}px`;
  }, width);

// Count only the visible item tags inside the overflow list, excluding the
// "+N" overflow indicator tag.
const getVisibleItemTagCount = (page: Page) =>
  page
    .locator('[data-slot="overflow-list"] [data-slot="tag"]')
    .filter({ hasNotText: /^\+\d+$/ })
    .count();

// The overflow indicator lives inside the overflow-list, not in the hidden
// measurement container, so scope the locator to avoid strict-mode failures.
const getOverflowIndicator = (page: Page) =>
  page.locator('[data-slot="overflow-list"]').getByText(/^\+\d+$/);

test.describe('Component: OverflowList', () => {
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
});
