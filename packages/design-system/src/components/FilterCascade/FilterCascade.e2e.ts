import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const filterCascadeStory = createStoryHelper('patterns-filtercascade', [
  'Default',
  'Scope Filter',
  'Picked',
  'Parent Picked',
  'Load Error',
  'Disabled',
] as const);

/**
 * Moves the pointer onto an option without `locator.hover()`, which scrolls its target into view
 * first — and scrolled the level in the baselines. A real pointer never scrolls a level on hover.
 */
const pointAt = async (page: Page, text: string) => {
  const box = await page.getByText(text, { exact: true }).first().boundingBox();
  if (!box) throw new Error(`"${text}" is not on screen`);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
};

const settle = (page: Page) => page.waitForFunction(() => document.getAnimations().length === 0);

/** Opens a story's menu and waits for its open animation to end. */
const openMenu = async (page: Page, testId: string) => {
  await page.getByTestId(`${testId}--trigger`).click();
  await settle(page);
};

test.describe('Component: FilterCascade', () => {
  test.describe('Visual', () => {
    test('Should render a picked path in the trigger correctly', async ({ page }) => {
      await filterCascadeStory.goto(page, 'Picked');
      await expect(page.getByTestId('filter-cascade-picked--trigger')).toHaveAccessibleName(
        'Scope, production-eu-central-1-cluster › checkout-api',
      );
      await expect(page).toHaveScreenshot();
    });

    test('Should render the disabled trigger correctly', async ({ page }) => {
      await filterCascadeStory.goto(page, 'Disabled');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the levels of plain items correctly', async ({ page }) => {
      await filterCascadeStory.goto(page, 'Default');
      await openMenu(page, 'filter-cascade');
      await pointAt(page, 'Europe');
      await expect(page.getByText('Frankfurt')).toBeVisible();
      await settle(page);
      await expect(page).toHaveScreenshot();
    });

    test('Should render the Scope menu correctly', async ({ page }) => {
      await filterCascadeStory.goto(page, 'Scope Filter');
      await openMenu(page, 'filter-cascade-scope');
      await expect(page).toHaveScreenshot();
    });

    test('Should render a loaded level beside its deployment correctly', async ({ page }) => {
      await filterCascadeStory.goto(page, 'Scope Filter');
      await openMenu(page, 'filter-cascade-scope');
      await pointAt(page, 'Production US');
      await expect(page.getByText('mobile-gateway')).toBeVisible();
      await settle(page);
      await expect(page).toHaveScreenshot();
    });

    test('Should render the picked deployment level correctly', async ({ page }) => {
      await filterCascadeStory.goto(page, 'Parent Picked');
      await openMenu(page, 'filter-cascade-parent');
      await expect(page.getByText('mobile-gateway')).toBeVisible();
      await settle(page);
      await expect(page).toHaveScreenshot();
    });

    test('Should render the search list correctly', async ({ page }) => {
      // The picked deployment's applications are loaded, so the search finds them too.
      await filterCascadeStory.goto(page, 'Parent Picked');
      await openMenu(page, 'filter-cascade-parent');
      await expect(page.getByText('mobile-gateway')).toBeVisible();
      await page.getByRole('textbox', { name: 'Search Scope' }).fill('stag');
      await expect(page.getByText('Staging EU')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the no-results state correctly', async ({ page }) => {
      await filterCascadeStory.goto(page, 'Scope Filter');
      await openMenu(page, 'filter-cascade-scope');
      await page.getByRole('textbox', { name: 'Search Scope' }).fill('nothing like this');
      await expect(page.getByTestId('filter-cascade-scope--empty')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render a level that failed to load correctly', async ({ page }) => {
      await filterCascadeStory.goto(page, 'Load Error');
      await openMenu(page, 'filter-cascade-error');
      await pointAt(page, 'Sandbox');
      await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
      await settle(page);
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Behavior', () => {
    test('Should pick an application with the keyboard', async ({ page }) => {
      await filterCascadeStory.goto(page, 'Scope Filter');
      await openMenu(page, 'filter-cascade-scope');
      // The search has the caret; ↓ hands the list over.
      await page.keyboard.press('ArrowDown'); // Organization only
      await page.keyboard.press('ArrowDown'); // Production US — its applications start loading
      await expect(page.getByText('mobile-gateway')).toBeVisible();
      await page.keyboard.press('ArrowRight'); // Deployment level
      await page.keyboard.press('ArrowDown'); // api
      await page.keyboard.press('Enter');
      await expect(page.getByTestId('filter-cascade-scope--trigger')).toHaveAccessibleName(
        'Scope, Production US › api',
      );
    });

    test('Should open the path tooltip at the trigger', async ({ page }) => {
      await filterCascadeStory.goto(page, 'Picked');
      const trigger = page.getByTestId('filter-cascade-picked--trigger');
      await trigger.hover();
      const tooltip = page.getByText('Scope — production-eu-central-1-cluster › checkout-api');
      await expect(tooltip).toBeVisible();
      const [anchor, tip] = await Promise.all([
        page.getByTestId('filter-cascade-picked--control').boundingBox(),
        tooltip.boundingBox(),
      ]);
      if (!anchor || !tip) throw new Error('no boxes');
      // Right above or below the trigger, centred on it; unanchored, it opens at the page corner.
      const above = anchor.y - (tip.y + tip.height);
      const below = tip.y - (anchor.y + anchor.height);
      expect(Math.max(above, below)).toBeGreaterThanOrEqual(0);
      expect(Math.max(above, below)).toBeLessThan(24);
      expect(Math.abs(tip.x + tip.width / 2 - (anchor.x + anchor.width / 2))).toBeLessThan(4);
    });

    test('Should clear the path with the ✕', async ({ page }) => {
      await filterCascadeStory.goto(page, 'Scope Filter');
      await openMenu(page, 'filter-cascade-scope');
      await pointAt(page, 'Production US');
      await page.getByText('Deployment level').click();
      await page.getByRole('button', { name: 'Clear Scope' }).click();
      await expect(page.getByTestId('filter-cascade-scope--trigger')).toHaveAccessibleName('Scope');
    });
  });
});
