import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const fieldMenuStory = createStoryHelper('patterns-filterinput-filterinputfieldmenu', [
  'With Groups',
] as const);

const filterInputStory = createStoryHelper('patterns-filterinput-filterinput', [
  'With Field Groups',
] as const);

// FilterInputFieldMenu's own stories stand the menu up behind a `Button`, since
// the component takes no trigger of its own and is anchored by FilterInput in
// real use. Open it before asserting: the shared `goto()` already waits on
// `#storybook-root` (the trigger) plus the font settle, so the menu's own
// portal is all that is left to wait for.
const gotoFieldMenu = async (page: Page, storyName: Parameters<typeof fieldMenuStory.goto>[1]) => {
  await fieldMenuStory.goto(page, storyName);
  await page.getByTestId('field-menu-trigger').click();
  await expect(page.locator('[data-slot="filter-input-field-menu"]')).toBeVisible();
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

    test('Should render an ungrouped field below all groups', async ({ page }) => {
      await gotoFieldMenu(page, 'With Groups');

      // "CWE" belongs to no group, so it must render in the trailing headerless
      // section below every group — in particular below the last group header
      // "Source and identity".
      const cwe = page.getByRole('menuitem', { name: /^CWE$/ });
      const source = page.getByText('Source and identity');
      await expect(cwe).toBeVisible();
      await expect(source).toBeVisible();

      const [cweBox, sourceBox] = await Promise.all([cwe.boundingBox(), source.boundingBox()]);
      expect(cweBox).not.toBeNull();
      expect(sourceBox).not.toBeNull();
      expect(cweBox!.y).toBeGreaterThan(sourceBox!.y);
    });
  });

  test.describe('Accessibility', () => {
    test('Should be navigable across group boundaries via the keyboard', async ({ page }) => {
      await filterInputStory.goto(page, 'With Field Groups');
      const field = page.locator('[data-slot="filter-input"]');
      const input = field.locator('input');
      await field.click();
      await expect(page.getByRole('menuitem', { name: /^Host$/ })).toBeVisible();

      // Flat keyboard-nav order follows `fieldGroups` array order across group
      // boundaries: [1] Attack type, [2] Status (Threat classification) → [3]
      // Host, [4] Path (Request features) → [5] Country (Source and identity).
      // The first ArrowDown highlights item 1, so 3 presses land on "Host" —
      // the first field of the SECOND group, proving nav crossed the boundary
      // out of group 1 and did not stop at its first item.
      await input.press('ArrowDown');
      await input.press('ArrowDown');
      await input.press('ArrowDown');
      await input.press('Enter');

      // Enter selected the highlighted later-group field → the building chip's
      // attribute is "Host", not "Attack type". A nav regression that stopped
      // inside group 1 would surface a different attribute here and fail.
      const buildingChip = page.locator('[data-slot="filter-input-condition-chip"]').first();
      await expect(buildingChip.locator('[data-slot="segment-attribute"]')).toHaveText('Host');

      // Drive the operator step; Host is a plain string field with no options,
      // so committing "is =" opens the freeform value combobox (mirrors the
      // "Should select a field when grouped" assertion).
      await page.getByRole('menuitem', { name: /^is =$/ }).click();
      await expect(page.getByRole('combobox', { name: 'Filter value' })).toBeVisible();
    });
  });
});
