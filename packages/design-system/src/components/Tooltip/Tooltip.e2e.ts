import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const tooltipStory = createStoryHelper('overlay-tooltip', [
  'Basic',
  'With Description',
  'With Kbd',
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
