import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const fieldMenuStory = createStoryHelper('patterns-filterinput-filterinputfieldmenu', [
  'With Descriptions',
] as const);

const filterInputStory = createStoryHelper('patterns-filterinput-filterinput', [
  'With Described Chip',
] as const);

// The FilterInputFieldMenu story renders `open: true` with no trigger — the menu
// lives in an Ark UI portal on <body>, so the shared readiness check never
// resolves. Navigate directly and wait on the portaled menu (mirrors
// FilterInputFieldMenuGrouping.e2e.ts).
const gotoFieldMenu = async (page: Page, storyName: Parameters<typeof fieldMenuStory.goto>[1]) => {
  await page.goto(fieldMenuStory.url(storyName), { waitUntil: 'domcontentloaded' });
  // Generous timeout: with parallel workers hitting a cold Storybook, the first
  // portal render of this story can lag past the default 5s expect budget.
  await expect(page.locator('[data-slot="filter-input-field-menu"]')).toBeVisible({
    timeout: 15000,
  });
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

test.describe('Component: FilterInput field-menu description popover (AS-1060)', () => {
  test('shows title + description on hover of a described field', async ({ page }) => {
    await gotoFieldMenu(page, 'With Descriptions');
    await page.getByRole('menuitem', { name: /^Attack type$/ }).hover();

    const popover = page.getByTestId('field-menu-popover');
    await expect(popover).toBeVisible();
    await expect(popover).toContainText('Attack type');
    await expect(popover).toContainText('Filter by the high-level category of the detected attack');
  });

  test('opens the popover to the right of the field menu', async ({ page }) => {
    await gotoFieldMenu(page, 'With Descriptions');
    await page.getByRole('menuitem', { name: /^Attack type$/ }).hover();

    const menu = page.locator('[data-slot="filter-input-field-menu"]');
    const popover = page.getByTestId('field-menu-popover');
    await expect(popover).toBeVisible();

    const [menuBox, popoverBox] = await Promise.all([menu.boundingBox(), popover.boundingBox()]);
    expect(menuBox).not.toBeNull();
    expect(popoverBox).not.toBeNull();
    // Anchored to the right edge of the menu (default placement) — its left edge
    // sits at or past the menu's right edge.
    expect(popoverBox!.x).toBeGreaterThanOrEqual(menuBox!.x + menuBox!.width - 1);
  });

  test('realigns to the newly highlighted row when moving between described fields', async ({
    page,
  }) => {
    await gotoFieldMenu(page, 'With Descriptions');
    const popover = page.getByTestId('field-menu-popover');

    // Open on the first described row, then move to another without leaving the
    // menu — the popover stays mounted, so its anchor must follow the new row
    // rather than freezing on the row it opened against.
    await page.getByRole('menuitem', { name: /^Attack type$/ }).hover();
    await expect(popover).toBeVisible();

    const parameter = page.getByRole('menuitem', { name: /^Parameter$/ });
    await parameter.hover();
    await expect(popover).toContainText('Filter by the request parameter');

    const [itemBox, popoverBox] = await Promise.all([
      parameter.boundingBox(),
      popover.boundingBox(),
    ]);
    expect(itemBox).not.toBeNull();
    expect(popoverBox).not.toBeNull();
    // right-start aligns the popover's top to the highlighted row's top.
    expect(Math.abs(popoverBox!.y - itemBox!.y)).toBeLessThan(16);
  });

  test('renders the monospace example block for a non-obvious value format', async ({ page }) => {
    await gotoFieldMenu(page, 'With Descriptions');
    await page.getByRole('menuitem', { name: /^Parameter$/ }).hover();

    const popover = page.getByTestId('field-menu-popover');
    await expect(popover).toBeVisible();
    await expect(popover).toContainText('post.user[*].name');
  });

  test('shows no popover for a field without a description', async ({ page }) => {
    await gotoFieldMenu(page, 'With Descriptions');
    await page.getByRole('menuitem', { name: /^No description field$/ }).hover();

    await expect(page.getByTestId('field-menu-popover')).toBeHidden();
  });

  test('does not open a popover for a group header', async ({ page }) => {
    await gotoFieldMenu(page, 'With Descriptions');
    // Hover the group header first (clean state) — it is a non-interactive label,
    // so it must not surface a popover.
    await page.getByText('Threat classification').hover();

    await expect(page.getByTestId('field-menu-popover')).toBeHidden();
  });
});

test.describe('Component: FilterInput chip attribute tooltip (AS-1060)', () => {
  test('shows the description in a dark tooltip on the attribute segment', async ({ page }) => {
    await filterInputStory.goto(page, 'With Described Chip');

    const chip = page.locator('[data-slot="filter-input-condition-chip"]').first();
    await expect(chip).toBeVisible();
    await chip.locator('[data-slot="segment-attribute"]').hover();

    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText(
      'Filter by the HTTP response status code returned to the attacker.',
    );
  });

  test('does not show the tooltip when hovering the value segment', async ({ page }) => {
    await filterInputStory.goto(page, 'With Described Chip');

    const chip = page.locator('[data-slot="filter-input-condition-chip"]').first();
    await expect(chip).toBeVisible();
    await chip.locator('[data-slot="segment-value"]').hover();

    await expect(page.getByRole('tooltip')).toBeHidden();
  });
});
