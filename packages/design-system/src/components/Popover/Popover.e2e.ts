import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const popoverStory = createStoryHelper('overlay-popover', [
  'Basic',
  'Min Max Width',
  'Min Max Height',
] as const);

const getPopoverTrigger = (page: Page) => page.getByTestId('popover--trigger');
const getPopoverContent = (page: Page) => page.getByTestId('popover--content');

const openPopover = async (page: Page) => {
  await getPopoverTrigger(page).click();
  await expect(getPopoverContent(page)).toBeVisible();
};

test.describe('Component: Popover', () => {
  test.describe('Visual', () => {
    test('Should render basic popover correctly', async ({ page }) => {
      await popoverStory.goto(page, 'Basic');
      await openPopover(page);
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render min max width popover correctly', async ({ page }) => {
      await popoverStory.goto(page, 'Min Max Width');
      // Open the first popover (Min Width)
      await page.getByRole('button', { name: 'Min Width' }).click();
      await expect(
        page.locator('[data-scope="popover"][data-part="content"]').first(),
      ).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render min max height popover correctly', async ({ page }) => {
      await popoverStory.goto(page, 'Min Max Height');
      // Open the second popover (Max Height) to show scrolling content
      await page.getByRole('button', { name: 'Max Height' }).click();
      await expect(
        page.locator('[data-scope="popover"][data-part="content"]').first(),
      ).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });
  });

  test.describe('Interactions', () => {
    test('Should open popover when trigger is clicked', async ({ page }) => {
      await popoverStory.goto(page, 'Basic');
      await expect(getPopoverContent(page)).toBeHidden();
      await openPopover(page);
      await expect(getPopoverContent(page)).toBeVisible();
    });

    test('Should close popover when trigger is clicked again', async ({ page }) => {
      await popoverStory.goto(page, 'Basic');
      await openPopover(page);

      await getPopoverTrigger(page).click();
      await expect(getPopoverContent(page)).toBeHidden();
    });

    test('Should close popover when clicking outside', async ({ page }) => {
      await popoverStory.goto(page, 'Basic');
      await openPopover(page);

      // Click outside the popover
      await page.locator('body').click({ position: { x: 10, y: 10 } });
      await expect(getPopoverContent(page)).toBeHidden();
    });
  });

  test.describe('Accessibility', () => {
    test('Should close popover via Escape key', async ({ page }) => {
      await popoverStory.goto(page, 'Basic');
      await openPopover(page);

      await page.keyboard.press('Escape');
      await expect(getPopoverContent(page)).toBeHidden();
    });
  });
});
