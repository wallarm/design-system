import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const fieldMenuStory = createStoryHelper('patterns-filterinput-filterinputfieldmenu', [
  'With Groups',
] as const);

const filterInputStory = createStoryHelper('patterns-filterinput-filterinput', [
  'With Field Groups',
] as const);

// FilterInputFieldMenu's own stories render with `open: true` and no trigger
// element in `#storybook-root` — the menu content lives entirely in an Ark UI
// portal appended to `<body>`. `fieldMenuStory.goto()`'s generic readiness
// check (`#storybook-root` has children) therefore never resolves for this
// story. Navigate directly and wait on the portaled menu instead. The
// font-ready/settle wait mirrors the shared `createStoryHelper.goto()` so the
// Visual screenshot baseline can't be captured mid font-display:swap.
const gotoFieldMenu = async (page: Page, storyName: Parameters<typeof fieldMenuStory.goto>[1]) => {
  await page.goto(fieldMenuStory.url(storyName), { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-slot="filter-input-field-menu"]')).toBeVisible();
  // fonts.ready resolves immediately when no font request has started yet, so
  // force-load every registered face before awaiting it.
  await page.evaluate(async () => {
    const loads: Promise<unknown>[] = [];
    document.fonts.forEach(font => {
      loads.push(font.load().catch(() => undefined));
    });
    await Promise.all(loads);
    await document.fonts.ready;
  });
  await page.waitForTimeout(300);
};

test.describe('Component: FilterInput', () => {
  test.describe('Visual', () => {
    test('Should render the grouped field menu correctly', async ({ page }) => {
      await gotoFieldMenu(page, 'With Groups');
      const menu = page.locator('[data-slot="filter-input-field-menu"]');
      await expect(menu).toHaveScreenshot('field-menu-grouped.png');
    });
  });

  test.describe('Interactions', () => {
    test('Should show all group headers in order', async ({ page }) => {
      await gotoFieldMenu(page, 'With Groups');

      const threat = page.getByText('Threat classification');
      const request = page.getByText('Request features');
      const source = page.getByText('Source and identity');
      await expect(threat).toBeVisible();
      await expect(request).toBeVisible();
      await expect(source).toBeVisible();

      // Groups must render top-to-bottom in `fieldGroups` array order — the core
      // guarantee of this feature. Assert strictly increasing vertical position
      // so a regression that reorders (e.g. alphabetizes) the groups fails.
      const [threatBox, requestBox, sourceBox] = await Promise.all([
        threat.boundingBox(),
        request.boundingBox(),
        source.boundingBox(),
      ]);
      expect(threatBox).not.toBeNull();
      expect(requestBox).not.toBeNull();
      expect(sourceBox).not.toBeNull();
      expect(threatBox!.y).toBeLessThan(requestBox!.y);
      expect(requestBox!.y).toBeLessThan(sourceBox!.y);
    });

    test('Should select a field when grouped', async ({ page }) => {
      await filterInputStory.goto(page, 'With Field Groups');
      const field = page.locator('[data-slot="filter-input"]');
      await field.click();
      await page.getByRole('menuitem', { name: /^Host$/ }).click();
      // Operators render as "<label> <symbol>", e.g. the `=` operator is "is =".
      await page.getByRole('menuitem', { name: /^is =$/ }).click();
      // Host has no autocomplete options, so committing the operator opens a
      // freeform value combobox (not a menu) — its presence proves the field
      // was selected and the operator step completed via a grouped field.
      await expect(page.getByRole('combobox', { name: 'Filter value' })).toBeVisible();
    });

    test('Should hide groups with no matching field when filtering', async ({ page }) => {
      await filterInputStory.goto(page, 'With Field Groups');
      const field = page.locator('[data-slot="filter-input"]');
      const input = field.locator('input');
      await field.click();
      await input.fill('host');
      // Matching group header stays…
      await expect(page.getByText('Request features')).toBeVisible();
      // …non-matching group headers are gone.
      await expect(page.getByText('Threat classification')).toHaveCount(0);
      await expect(page.getByText('Source and identity')).toHaveCount(0);
    });
  });
});
