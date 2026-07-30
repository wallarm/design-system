import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const filterInputStory = createStoryHelper('patterns-filterinput-filterinput', [
  'With Value Groups',
] as const);

const getMenu = (page: Page) => page.getByRole('menu').last();
const getChip = (page: Page) => page.locator('[data-slot="filter-input-condition-chip"]').first();
const getGroupHeader = (page: Page, label: string) =>
  page.getByRole('menuitem', { name: new RegExp(`^${label}$`) });

/**
 * Drive field → operator so the grouped value menu is open. Operators render as
 * "<label> <symbol>"; `attack_type` is a `string` field, so `in` takes the
 * string-type label and reads "in IN" (an `enum` field would read "is any of
 * IN"). Only `attack_type` carries `valueGroups` in this story; "Attack Subtype"
 * is a separate field, so the field name is anchored.
 */
const openValueMenu = async (page: Page, operator: RegExp) => {
  const field = page.locator('[data-slot="filter-input"]');
  await field.click();
  await page.getByRole('menuitem', { name: /^Attack Type$/ }).click();
  await page.getByRole('menuitem', { name: operator }).click();
  await expect(getGroupHeader(page, 'Input-based attacks')).toBeVisible();
};

/**
 * Narrow the ~60 attack types to the 7-member "GraphQL attacks" group. Typing
 * goes to whatever holds focus after the operator commit (the value input), the
 * same path a user takes. Every GraphQL label is prefixed "GraphQL …" and no
 * other option's label or value contains the word, so the group is left alone
 * in the menu — a compact, deterministic target for screenshots and select-all.
 */
const filterToGraphQlGroup = async (page: Page) => {
  await page.keyboard.type('graphql');
  await expect(page.getByRole('menuitem', { name: /^GraphQL query depth$/ })).toBeVisible();
  await expect(getGroupHeader(page, 'Input-based attacks')).toHaveCount(0);
};

/**
 * Prepare the menu for a screenshot.
 *
 * Parks the pointer clear of the popover — the click that opened the value menu
 * leaves the cursor over whichever row landed under it, and that row's hover
 * highlight would otherwise bake into the baseline.
 *
 * Then waits for the popover to stop moving. Ark UI re-anchors the menu after
 * mount and after the content reflows, so a capture taken too early lands
 * mid-settle and the whole menu is offset a few pixels inside the frame — a
 * diff far above the 0.005 ratio. Polling the box to a fixed value is what makes
 * the baseline reproducible; the trailing pause mirrors `createStoryHelper.goto`.
 */
const settleForCapture = async (page: Page) => {
  await page.mouse.move(1270, 790);

  const menu = getMenu(page);
  let previous = '';
  await expect
    .poll(async () => {
      const current = JSON.stringify(await menu.boundingBox());
      const unchanged = current === previous;
      previous = current;
      return unchanged;
    })
    .toBe(true);
  await page.waitForTimeout(300);
};

test.describe('Component: FilterInput', () => {
  test.describe('Visual', () => {
    test('Should render the grouped value menu correctly', async ({ page }) => {
      await filterInputStory.goto(page, 'With Value Groups');
      await openValueMenu(page, /^in IN$/);
      await settleForCapture(page);

      // The menu scrolls at 430px, so this captures the first group and the head
      // of the second — enough to pin header typography, spacing and separators.
      await expect(getMenu(page)).toHaveScreenshot('value-menu-grouped.png');
    });

    test('Should render a partially selected group header correctly', async ({ page }) => {
      await filterInputStory.goto(page, 'With Value Groups');
      await openValueMenu(page, /^in IN$/);

      // Check one of the seven members first, then narrow. Toggling a value
      // clears the query text, so filtering *before* the click would race that
      // clear against the re-typed query — and would leave the baseline pinned
      // to a scroll offset in the restored ~60-row list rather than to the group.
      await page.getByRole('menuitem', { name: /^GraphQL aliases$/ }).click();

      // The check writes a preview into the building chip, which grows the field
      // and re-anchors the popover. Wait for that text before capturing, or the
      // shot can land mid-reflow and bake in a few pixels of vertical drift.
      await expect(getChip(page).locator('[data-slot="segment-value"]')).toHaveText(
        'GraphQL aliases',
      );
      await filterToGraphQlGroup(page);

      // One of seven members checked → the header's checkmark is indeterminate.
      await expect(
        getGroupHeader(page, 'GraphQL attacks').locator('[data-state="indeterminate"]'),
      ).toBeVisible();
      await settleForCapture(page);

      await expect(getMenu(page)).toHaveScreenshot('value-menu-group-partial.png');
    });
  });

  test.describe('Interactions', () => {
    test('Should render group headers in declaration order', async ({ page }) => {
      await filterInputStory.goto(page, 'With Value Groups');
      await openValueMenu(page, /^in IN$/);

      const input = getGroupHeader(page, 'Input-based attacks');
      const graphql = getGroupHeader(page, 'GraphQL attacks');
      const spec = getGroupHeader(page, 'API specification enforcement');

      // Groups must render top-to-bottom in `valueGroups` array order — the core
      // guarantee of the feature. Assert strictly increasing vertical position so
      // a regression that reorders (e.g. alphabetizes) the sections fails. The
      // menu scrolls, but every section is laid out, so each has a bounding box.
      const [inputBox, graphqlBox, specBox] = await Promise.all([
        input.boundingBox(),
        graphql.boundingBox(),
        spec.boundingBox(),
      ]);
      expect(inputBox).not.toBeNull();
      expect(graphqlBox).not.toBeNull();
      expect(specBox).not.toBeNull();
      expect(inputBox!.y).toBeLessThan(graphqlBox!.y);
      expect(graphqlBox!.y).toBeLessThan(specBox!.y);
    });

    test('Should check every member when a group header is clicked', async ({ page }) => {
      await filterInputStory.goto(page, 'With Value Groups');
      await openValueMenu(page, /^in IN$/);
      await filterToGraphQlGroup(page);

      await getGroupHeader(page, 'GraphQL attacks').click();

      // All seven members checked, and the header itself resolves to fully checked.
      await expect(getMenu(page).locator('[role="menuitem"] [data-state="checked"]')).toHaveCount(
        8,
      );

      // ArrowRight is the multi-select commit gesture (Escape would discard).
      await page.keyboard.press('ArrowRight');

      const value = getChip(page).locator('[data-slot="segment-value"]');
      await expect(value).toContainText('GraphQL aliases');
      await expect(value).toContainText('GraphQL introspection');
    });

    test('Should clear every member when a fully checked group header is clicked again', async ({
      page,
    }) => {
      await filterInputStory.goto(page, 'With Value Groups');
      await openValueMenu(page, /^in IN$/);
      await filterToGraphQlGroup(page);

      const header = getGroupHeader(page, 'GraphQL attacks');
      await header.click();
      await expect(header.locator('[data-state="checked"]')).toBeVisible();

      await header.click();
      await expect(header.locator('[data-state="unchecked"]')).toBeVisible();
      await expect(getMenu(page).locator('[role="menuitem"] [data-state="checked"]')).toHaveCount(
        0,
      );
    });

    test('Should check only the visible members when the list is filtered', async ({ page }) => {
      await filterInputStory.goto(page, 'With Value Groups');
      await openValueMenu(page, /^in IN$/);

      // "introspection" narrows "GraphQL attacks" to a single member; the other
      // six must not be swept in by the header's select-all.
      await page.keyboard.type('introspection');
      await expect(page.getByRole('menuitem', { name: /^GraphQL introspection$/ })).toBeVisible();

      await getGroupHeader(page, 'GraphQL attacks').click();
      await page.keyboard.press('ArrowRight');

      await expect(getChip(page).locator('[data-slot="segment-value"]')).toHaveText(
        'GraphQL introspection',
      );
    });

    test('Should switch to a multi-select operator when a group is picked under "is"', async ({
      page,
    }) => {
      await filterInputStory.goto(page, 'With Value Groups');
      await openValueMenu(page, /^is =$/);
      await filterToGraphQlGroup(page);

      // A single-select operator can't hold a group, so selecting the header
      // rewrites `=` → `in` and commits the members in one step — no separate
      // commit gesture needed.
      await getGroupHeader(page, 'GraphQL attacks').click();

      const chip = getChip(page);
      await expect(chip.locator('[data-slot="segment-operator"]')).toHaveText('in');
      await expect(chip.locator('[data-slot="segment-value"]')).toContainText('GraphQL aliases');
    });

    test('Should render an ungrouped value below every group', async ({ page }) => {
      await filterInputStory.goto(page, 'With Value Groups');
      await openValueMenu(page, /^in IN$/);

      // "Rate limit" belongs to no group, so it lands in the trailing headerless
      // section — below the last group header, "Other".
      const rateLimit = page.getByRole('menuitem', { name: /^Rate limit$/ });
      const other = getGroupHeader(page, 'Other');

      const [rateLimitBox, otherBox] = await Promise.all([
        rateLimit.boundingBox(),
        other.boundingBox(),
      ]);
      expect(rateLimitBox).not.toBeNull();
      expect(otherBox).not.toBeNull();
      expect(rateLimitBox!.y).toBeGreaterThan(otherBox!.y);
    });
  });

  test.describe('Accessibility', () => {
    test('Should be selectable via keyboard navigation through the group header', async ({
      page,
    }) => {
      await filterInputStory.goto(page, 'With Value Groups');
      await openValueMenu(page, /^in IN$/);
      await filterToGraphQlGroup(page);

      // A selectable header joins the flat nav order just above its own rows, so
      // the first ArrowDown highlights the header rather than the first member.
      await page.keyboard.press('ArrowDown');
      await expect(page.locator('[role="menuitem"][data-highlighted]')).toHaveText(
        'GraphQL attacks',
      );

      // Enter on the highlighted header is the same select-all as a click.
      await page.keyboard.press('Enter');
      await expect(getMenu(page).locator('[role="menuitem"] [data-state="checked"]')).toHaveCount(
        8,
      );
    });
  });
});
