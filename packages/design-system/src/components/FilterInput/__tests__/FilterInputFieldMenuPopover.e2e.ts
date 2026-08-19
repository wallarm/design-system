import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const fieldMenuStory = createStoryHelper('patterns-filterinput-filterinputfieldmenu', [
  'With Descriptions',
  'With Scrollable Descriptions',
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

    // Sits a ~4px gutter to the right of the menu's edge (AS-1060), not the
    // padding-inset row. Poll so the enter animation's transform has settled.
    await expect
      .poll(async () => {
        const [m, p] = await Promise.all([menu.boundingBox(), popover.boundingBox()]);
        if (!m || !p) return null;
        const gap = p.x - (m.x + m.width);
        return gap >= 2 && gap <= 6;
      })
      .toBe(true);
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

  test('opens the popover on keyboard focus (arrow navigation)', async ({ page }) => {
    await gotoFieldMenu(page, 'With Descriptions');
    const popover = page.getByTestId('field-menu-popover');
    // Nothing highlighted yet → no popover.
    await expect(popover).toBeHidden();

    // Arrow-key highlight (not hover) must trigger the popover, per the spec's
    // "hover AND keyboard focus" requirement.
    await page.keyboard.press('ArrowDown');
    await expect(popover).toBeVisible();
    await expect(popover).toContainText('Attack type');
  });

  test('follows the row under the cursor when the list scrolls beneath it', async ({ page }) => {
    await gotoFieldMenu(page, 'With Scrollable Descriptions');
    const menu = page.locator('[data-slot="filter-input-field-menu"]');
    const popover = page.getByTestId('field-menu-popover');

    const box = await menu.boundingBox();
    expect(box).not.toBeNull();
    const px = box!.x + 40;
    const py = box!.y + box!.height / 2;

    // Rest a real pointer on a row (records the last-pointer the re-hit-test uses).
    await page.mouse.move(px, py);
    await expect(popover).toBeVisible();
    const before = (await popover.textContent())?.trim();

    const labelUnderCursor = () =>
      page.evaluate(
        ({ x, y }) =>
          document.elementFromPoint(x, y)?.closest('[role="menuitem"]')?.textContent?.trim() ??
          null,
        { x: px, y: py },
      );
    const rowBefore = await labelUnderCursor();

    // Scroll the list beneath the stationary pointer. Driving the scroll container
    // directly (a real `scroll` event — what the handler listens for) sidesteps
    // headless wheel-target quirks while still exercising the re-hit-test path.
    await page.evaluate(() => {
      const menuEl = document.querySelector('[data-slot="filter-input-field-menu"]');
      if (!menuEl) return;
      const scroller =
        menuEl.scrollHeight > menuEl.clientHeight
          ? menuEl
          : [...menuEl.querySelectorAll('*')].find(el => el.scrollHeight > el.clientHeight + 5);
      if (!(scroller instanceof HTMLElement)) return;
      for (let i = 0; i < 4; i++) {
        scroller.scrollTop += 44;
        scroller.dispatchEvent(new Event('scroll'));
      }
    });

    // The row under the pointer changed → the popover must re-sync to it (content
    // changes and matches the field now under the cursor).
    await expect.poll(labelUnderCursor, { timeout: 4000 }).not.toBe(rowBefore);
    const rowAfter = await labelUnderCursor();
    expect(rowAfter).not.toBeNull();
    await expect(popover).toContainText(rowAfter!);
    expect((await popover.textContent())?.trim()).not.toBe(before);
  });

  test('keyboard navigation is not hijacked by a resting pointer during scroll', async ({
    page,
  }) => {
    await gotoFieldMenu(page, 'With Scrollable Descriptions');
    const menu = page.locator('[data-slot="filter-input-field-menu"]');
    const popover = page.getByTestId('field-menu-popover');

    const box = await menu.boundingBox();
    expect(box).not.toBeNull();
    // Park the pointer over an upper row, then drive the highlight down far
    // enough that the list scrolls (scrollIntoView). The scroll must NOT re-sync
    // the highlight to the parked pointer — keyboard wins.
    await page.mouse.move(box!.x + 40, box!.y + 40);
    await expect(popover).toBeVisible();
    for (let i = 0; i < 14; i++) await page.keyboard.press('ArrowDown');

    // The popover must settle on the keyboard-highlighted row (not the parked
    // pointer's row). Poll until popover content and `data-highlighted` agree.
    await expect
      .poll(async () => {
        const highlighted = await page.evaluate(
          () =>
            document
              .querySelector('[data-slot="filter-input-field-menu"] [data-highlighted]')
              ?.textContent?.trim() ?? null,
        );
        const text = (await popover.textContent())?.trim() ?? '';
        return highlighted && text.includes(highlighted) ? highlighted : null;
      })
      .not.toBeNull();
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
