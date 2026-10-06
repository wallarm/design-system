import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const filterCascadeStory = createStoryHelper('patterns-filtercascade', [
  'Default',
  'Picked',
  'Parent Picked',
  'Disabled',
  'Composed',
] as const);

/**
 * Moves the pointer onto an option without `locator.hover()`, which scrolls its target into view
 * first — and scrolled the level in the baselines. A real pointer never scrolls a level on hover.
 */
const pointAt = async (page: Page, text: string) => {
  const box = await page.getByText(text, { exact: true }).boundingBox();
  if (!box) throw new Error(`"${text}" is not on screen`);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
};

test.describe('Component: FilterCascade', () => {
  test.describe('Visual', () => {
    test('Should render a picked path in the trigger correctly', async ({ page }) => {
      await filterCascadeStory.goto(page, 'Picked');
      await expect(page).toHaveScreenshot();
    });

    test('Should render a picked parent in the trigger correctly', async ({ page }) => {
      await filterCascadeStory.goto(page, 'Parent Picked');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the disabled trigger correctly', async ({ page }) => {
      await filterCascadeStory.goto(page, 'Disabled');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the menu with the next level open correctly', async ({ page }) => {
      await filterCascadeStory.goto(page, 'Default');
      await page.getByTestId('filter-cascade--trigger').click();
      await page.waitForFunction(() => document.getAnimations().length === 0);
      await pointAt(page, 'Production US');
      await expect(page.getByTestId('filter-cascade--level')).toHaveCount(2);
      await expect(page).toHaveScreenshot();
    });

    test('Should render the composed menu with search, groups and a section correctly', async ({
      page,
    }) => {
      await filterCascadeStory.goto(page, 'Composed');
      await page.getByTestId('filter-cascade-composed--trigger').click();
      await page.waitForFunction(() => document.getAnimations().length === 0);
      await pointAt(page, 'Production US');
      await expect(page.getByText('Applications')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the no-results state correctly', async ({ page }) => {
      await filterCascadeStory.goto(page, 'Composed');
      await page.getByTestId('filter-cascade-composed--trigger').click();
      await page.getByRole('textbox', { name: 'Search Scope' }).fill('nothing like this');
      await expect(page.getByTestId('filter-cascade-composed--empty')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Behavior', () => {
    test('Should pick a path with the keyboard from the search', async ({ page }) => {
      await filterCascadeStory.goto(page, 'Composed');
      const trigger = page.getByTestId('filter-cascade-composed--trigger');
      await trigger.click();
      await page.getByRole('textbox', { name: 'Search Scope' }).fill('staging');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await expect(trigger).toHaveAccessibleName('Scope, Staging EU › api');
    });

    test('Should clear the path with the ✕', async ({ page }) => {
      await filterCascadeStory.goto(page, 'Picked');
      await page.getByRole('button', { name: 'Clear Scope' }).click();
      await expect(page.getByTestId('filter-cascade-picked--trigger')).toHaveAccessibleName(
        'Scope',
      );
    });
  });
});
