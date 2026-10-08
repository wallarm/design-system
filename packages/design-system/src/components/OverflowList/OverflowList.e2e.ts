import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const overflowStory = createStoryHelper('data-display-overflowlist', [
  'Resizable Container',
  'With Header',
  'Hidden Only',
  'Cover Placement',
] as const);

const setWrapperWidth = (page: Page, width: number) =>
  page.getByTestId('resizable-wrapper').evaluate((el, w) => {
    (el as HTMLElement).style.width = `${w}px`;
  }, width);

// Row items are the row's children minus the "+N more" trigger.
const getVisibleItemTagCount = async (page: Page) =>
  (await page.getByTestId('tags').locator('> *').count()) -
  (await page.getByTestId('tags--more--trigger').count());

const getOverflowIndicator = (page: Page) => page.getByTestId('tags--more--trigger');

test.describe('Component: OverflowList', () => {
  test.describe('Visual', () => {
    test('Should render the overflow popover with header correctly', async ({ page }) => {
      await overflowStory.goto(page, 'With Header');
      await page.getByTestId('attacks--more--trigger').click();
      await expect(page.getByTestId('attacks--more--header')).toHaveText('4 attack types');

      await expect(page).toHaveScreenshot();
    });

    test('Should render the cover placement popover correctly', async ({ page }) => {
      await overflowStory.goto(page, 'Cover Placement');
      await page.getByTestId('attacks--more--trigger').click();
      await expect(page.getByTestId('attacks--more--content')).toBeVisible();

      await expect(page).toHaveScreenshot();
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

    test('Should dim the row items when the popover lists every item', async ({ page }) => {
      await overflowStory.goto(page, 'With Header');
      await page.getByTestId('attacks--more--trigger').click();

      const list = page.getByTestId('attacks--more--items');
      for (const name of ['RCE', 'XSS', 'SQL Injection', 'CSRF']) {
        await expect(list.getByText(name, { exact: true })).toBeVisible();
      }
      await expect(list.getByTestId('attacks--more--items--item').first()).toHaveClass(
        /opacity-60/,
      );
    });

    test('Should list only the hidden items when show is hidden', async ({ page }) => {
      await overflowStory.goto(page, 'Hidden Only');
      const trigger = page.getByTestId('attacks--more--trigger');
      const hiddenCount = Number((await trigger.textContent())?.replace(/\D/g, ''));
      await trigger.click();

      const list = page.getByTestId('attacks--more--items');
      await expect(list.getByTestId('attacks--more--items--item')).toHaveCount(hiddenCount);
    });

    test('Should open over the row when placement is cover', async ({ page }) => {
      await overflowStory.goto(page, 'Cover Placement');
      const row = await page.getByTestId('attacks').boundingBox();
      await page.getByTestId('attacks--more--trigger').click();

      const content = page.getByTestId('attacks--more--content');
      await expect(content).toBeVisible();
      // The opening zoom/slide animation changes the bounding box until it finishes.
      await content.evaluate(el =>
        Promise.all(el.getAnimations().map(animation => animation.finished)),
      );

      const popover = await content.boundingBox();
      expect(row && popover).toBeTruthy();
      if (!row || !popover) return;
      expect(Math.abs(popover.x - row.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(popover.y - row.y)).toBeLessThanOrEqual(1);
    });
  });

  test.describe('Accessibility', () => {
    test('Should be openable and closable via keyboard Enter and Escape', async ({ page }) => {
      await overflowStory.goto(page, 'With Header');
      const trigger = page.getByTestId('attacks--more--trigger');

      await trigger.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByTestId('attacks--more--content')).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(page.getByTestId('attacks--more--content')).toBeHidden();
    });
  });
});
