import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const tooltipStory = createStoryHelper('overlay-tooltip', [
  'Basic',
  'With Description',
  'With Kbd',
  'With Nested Dialog',
] as const);

const getTooltipTrigger = (page: Page) => page.getByTestId('tooltip--trigger');
const getTooltipContent = (page: Page) => page.getByTestId('tooltip--content');

test.describe('Component: Tooltip', () => {
  test.describe('Visual', () => {
    test('Should render basic tooltip correctly', async ({ page }) => {
      await tooltipStory.goto(page, 'Basic');
      await getTooltipTrigger(page).hover();
      await expect(getTooltipContent(page)).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render tooltip with description correctly', async ({ page }) => {
      await tooltipStory.goto(page, 'With Description');
      await page.getByRole('button').hover();
      await expect(page.locator('[data-scope="tooltip"][data-part="content"]')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render tooltip with keyboard shortcut correctly', async ({ page }) => {
      await tooltipStory.goto(page, 'With Kbd');
      await page.getByRole('button').hover();
      await expect(page.locator('[data-scope="tooltip"][data-part="content"]')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });
  });

  test.describe('Interactions', () => {
    test('Should show tooltip when trigger is hovered', async ({ page }) => {
      await tooltipStory.goto(page, 'Basic');
      await expect(getTooltipContent(page)).toBeHidden();

      await getTooltipTrigger(page).hover();
      await expect(getTooltipContent(page)).toBeVisible();
      await expect(getTooltipContent(page)).toHaveText('Right');
    });

    test('Should stack the tooltip above a nested dialog when hovered inside it', async ({
      page,
    }) => {
      // Regression: the tooltip content's static z-50 mirrored into its
      // positioner sat below the nested dialog positioner (50 + layer * 20),
      // hiding the open tooltip. Tooltips never join zag's dismissable layer
      // stack, so the content uses the dedicated top-tier --tooltip-z-index.
      await tooltipStory.goto(page, 'With Nested Dialog');
      await page.getByRole('button', { name: 'Open dialog with nested tooltip' }).click();
      await page.getByRole('button', { name: 'Open nested dialog' }).click();
      await page.getByTestId('nested-tooltip--trigger').hover();

      const content = page.getByTestId('nested-tooltip--content');
      await expect(content).toBeVisible();

      // The topmost element at the tooltip's location must belong to the
      // tooltip itself — not to the nested dialog covering it.
      const isOnTop = await content.evaluate(el => {
        const rect = el.getBoundingClientRect();
        const top = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
        );
        return !!top && el.contains(top);
      });
      expect(isOnTop).toBe(true);
    });

    test('Should hide tooltip when mouse leaves trigger', async ({ page }) => {
      await tooltipStory.goto(page, 'Basic');
      await getTooltipTrigger(page).hover();
      await expect(getTooltipContent(page)).toBeVisible();

      // Move mouse away from the trigger
      await page.mouse.move(0, 0);
      await expect(getTooltipContent(page)).toBeHidden();
    });
  });
});
