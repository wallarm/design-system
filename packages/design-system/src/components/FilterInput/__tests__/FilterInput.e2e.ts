import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const filterFieldStory = createStoryHelper('patterns-filterinput-filterinput', [
  'Default',
  'With Keyboard Hint',
  'Error Empty',
  'With Preset Value',
  'With Multi Condition Preset',
  'Error With Value',
  'HTTP Status Code Suggestions',
  'Paired Field',
  'Paired Field Preset',
  'Paired Field Value Is Set',
] as const);

// TODO: Enable after baseline screenshots are generated and menu flow is stabilized
test.describe.skip('Component: FilterInput', () => {
  test.describe('Visual', () => {
    test('Should render status code mask menu correctly', async ({ page }) => {
      await filterFieldStory.goto(page, 'HTTP Status Code Suggestions');
      const field = page.locator('[data-slot="filter-input"]');

      await field.click();
      // Pick the Status code field from the field menu, then the "is" operator,
      // to surface the value menu with mask suggestions.
      await page.getByRole('menuitem', { name: /status code/i }).click();
      await page.getByRole('menuitem', { name: /^is$/i }).click();

      const menu = page.getByRole('menu').last();
      await expect(menu).toHaveScreenshot('status-code-mask-menu.png');
    });
  });

  test.describe('Interactions', () => {
    test('Should focus field when clicked', async ({ page }) => {
      await filterFieldStory.goto(page, 'With Preset Value');
      const field = page.locator('[data-slot="filter-input"]');

      await field.click();
      await expect(field).toBeFocused();
    });

    test('Should display preset chips', async ({ page }) => {
      await filterFieldStory.goto(page, 'With Preset Value');
      const chips = page.locator('[data-slot="filter-input-chip"]');

      await expect(chips).toHaveCount(1);
    });

    test('Should display multiple preset chips', async ({ page }) => {
      await filterFieldStory.goto(page, 'With Multi Condition Preset');
      const chips = page.locator('[data-slot="filter-input-chip"]');

      const count = await chips.count();
      expect(count).toBeGreaterThan(1);
    });

    test('Should propagate error state to field with value', async ({ page }) => {
      await filterFieldStory.goto(page, 'Error With Value');

      const field = page.locator('[data-slot="filter-input"]');
      await expect(field).toHaveAttribute('aria-invalid', 'true');

      const chip = page.locator('[data-slot="filter-input-chip"]').first();
      await expect(chip).toBeVisible();
    });

    // AS-1160 — two-step paired chip.
    test('Should reveal the second value after the first when building a paired field', async ({
      page,
    }) => {
      await filterFieldStory.goto(page, 'Paired Field');
      const field = page.locator('[data-slot="filter-input"]');
      await field.click();

      await page.getByRole('menuitem', { name: /^Context Param$/ }).click();
      await page.getByRole('menuitem', { name: /^is =$/ }).click();
      await page.getByRole('menuitem', { name: /^header$/ }).click();

      // The building chip now shows the paired attribute and the ; separator.
      const buildingChip = page.locator('[data-slot="filter-input-condition-chip"][data-building]');
      await expect(buildingChip.locator('[data-slot="segment-separator"]')).toBeVisible();
      await expect(buildingChip).toContainText('Value');
    });

    test('Should render a preset paired condition as one chip', async ({ page }) => {
      await filterFieldStory.goto(page, 'Paired Field Preset');
      const chip = page.locator('[data-slot="filter-input-condition-chip"]').first();
      await expect(chip.locator('[data-slot="segment-separator"]')).toBeVisible();
      await expect(chip.locator('[data-slot="segment-attribute"]')).toHaveCount(2);
      await expect(chip.locator('[data-slot="segment-value"]')).toHaveCount(2);
    });
  });

  test.describe('Accessibility', () => {
    test('Should be focusable via Tab key', async ({ page }) => {
      await filterFieldStory.goto(page, 'Default');
      const field = page.locator('[data-slot="filter-input"]');

      await page.keyboard.press('Tab');
      await expect(field).toBeFocused();
    });

    test('Should have aria-invalid when error is true', async ({ page }) => {
      await filterFieldStory.goto(page, 'Error Empty');
      const field = page.locator('[data-slot="filter-input"]');

      await expect(field).toHaveAttribute('aria-invalid', 'true');
    });

    test('Should have proper role attribute', async ({ page }) => {
      await filterFieldStory.goto(page, 'Default');
      const field = page.locator('[data-slot="filter-input"]');

      await expect(field).toHaveAttribute('role', 'textbox');
    });

    test('Should have keyboard hint with proper aria labels', async ({ page }) => {
      await filterFieldStory.goto(page, 'With Keyboard Hint');

      const kbdElement = page.locator('kbd').first();
      await expect(kbdElement).toBeVisible();
    });
  });
});

// AS-1022 — wrapper-click and blur-outside paths must commit an in-progress
// multi-select building chip. The test lives outside the broader describe.skip
// because the screenshot blocker doesn't apply to interaction assertions, and
// the bug is a synchronous-event race subtle enough to need a CI guard.
test.describe('Component: FilterInput — AS-1022 wrapper-click commit', () => {
  test.describe('Interactions', () => {
    // Build an in-progress multi-select chip: Status code "in" with two values
    // checked. Returns once the building chip preview shows both labels so the
    // calling test can act on a known state.
    async function setupMultiSelectBuilding(
      page: Parameters<Parameters<typeof test>[1]>[0]['page'],
    ) {
      await filterFieldStory.goto(page, 'HTTP Status Code Suggestions');
      const input = page.locator('input[type="text"]');
      await input.click();
      await page.getByRole('menuitem', { name: /^status code$/i }).click();
      await page.getByRole('menuitem', { name: /^in IN$/i }).click();
      await page.getByRole('menuitem', { name: /^1XX$/ }).click();
      await page.getByRole('menuitem', { name: /^3XX$/ }).click();

      const buildingChip = page.locator('[data-slot="filter-input-condition-chip"][data-building]');
      await expect(buildingChip).toContainText('1XX, 3XX');
    }

    test('Should preserve checked multi-select values when wrapper is clicked', async ({
      page,
    }) => {
      // The bug: Ark UI's dismissable closes the value menu on the same
      // pointerdown, racing the onClick handler. The previous open-gated
      // blurCommitRef would already be null by the time handleAreaClick read
      // it, and the chip would commit empty.
      await setupMultiSelectBuilding(page);

      // Click the inner div's top padding band — well to the left of the
      // ACTIONS_PADDING (64px) action-button zone, above the chip row. This
      // is unambiguously empty inner-content area; the wrapper/inner onClick
      // delegators both route to handleAreaClick from here.
      const wrapper = page.locator('[data-slot="filter-input"]');
      const box = await wrapper.boundingBox();
      expect(box).toBeTruthy();
      await page.mouse.click(box!.x + box!.width / 2, box!.y + 4);

      const conditionChip = page.locator('[data-slot="filter-input-condition-chip"]').first();
      await expect(conditionChip).not.toHaveAttribute('data-building', '');
      await expect(conditionChip).toContainText('1XX, 3XX');
    });

    test('Should commit checked multi-select values when focus leaves the field', async ({
      page,
    }) => {
      // Sibling smoke for the wrapper-click path: blurring out of the field
      // entirely (focus moves to <body>) used to drop the checked values
      // because blurCommitRef was already null from the same outside-click
      // sequence. With the ref armed while the value menu is mounted, blur
      // commits the chip just like the wrapper click does.
      await setupMultiSelectBuilding(page);

      // Click far outside the FilterInput — viewport corner is reliably
      // outside the field's bounding box for all reasonable viewports.
      await page.mouse.click(2, 2);

      const conditionChip = page.locator('[data-slot="filter-input-condition-chip"]').first();
      await expect(conditionChip).not.toHaveAttribute('data-building', '');
      await expect(conditionChip).toContainText('1XX, 3XX');
    });
  });
});

// AS-1179 — context-parameter (paired) chip bugs. Interaction-only assertions
// (no screenshots), so this block runs in CI despite the screenshot-gated
// describe.skip above — same rationale as the AS-1022 block. A red chip and an
// error banner always travel together, so the banner (role="alert") plus the
// field's aria-invalid are the stable proxies for "the chip turned red".
test.describe('Component: FilterInput — AS-1179 paired chip', () => {
  test.describe('Interactions', () => {
    type E2EPage = Parameters<Parameters<typeof test>[1]>[0]['page'];

    const getField = (page: E2EPage) => page.locator('[data-slot="filter-input"]');
    const getChip = (page: E2EPage) =>
      page.locator('[data-slot="filter-input-condition-chip"]').first();

    // Build the base triplet "Context Param is <key>", leaving the paired Value
    // operator menu open (the paired Value part always follows the key).
    async function buildBase(page: E2EPage, key: string) {
      await filterFieldStory.goto(page, 'Paired Field');
      await getField(page).click();
      await page.getByRole('menuitem', { name: /^Context Param$/ }).click();
      await page.getByRole('menuitem', { name: /^is =$/ }).click();
      await page.getByRole('menuitem', { name: new RegExp(`^${key}$`) }).click();
    }

    // Build a complete chip "Context Param is <key> ; Value is <value>".
    async function buildFullPair(page: E2EPage, key: string, value: string) {
      await buildBase(page, key);
      await page.getByRole('menuitem', { name: /^is =$/ }).click();
      await page.getByRole('combobox', { name: 'Filter value' }).fill(value);
      await page.keyboard.press('Enter');
      await expect(getChip(page)).not.toHaveAttribute('data-building', '');
    }

    // The fix: blurring out while the paired value is still empty must NOT
    // silently drop the in-progress chip. It commits the already-valid base
    // and flags the missing value, so the chip lands red with a "Value is
    // required" banner — instead of an invisible, uncommitted draft. (The
    // red chip and the banner always travel together; the banner is the
    // stable proxy — aria-invalid on the root tracks the external `error`
    // prop, not internally-detected validation errors.)
    test('Should commit an errored chip when focus leaves with the paired value empty', async ({
      page,
    }) => {
      await buildBase(page, 'header');
      await page.getByRole('menuitem', { name: /^is =$/ }).click();

      await page.mouse.click(2, 2);

      const chip = getChip(page);
      await expect(chip).toBeVisible();
      await expect(chip).not.toHaveAttribute('data-building', '');
      await expect(chip).toContainText('header');
      await expect(page.getByRole('alert')).toContainText('Value is required');
    });

    // The errored chip stays editable: clicking the fixed "Value" label reopens
    // the value input, and entering a value clears the error (AS-1179 #1/#2).
    // QUARANTINED (AS-1193): the resume→value-commit path has a prod-only,
    // load-dependent timing race that drops the typed value (~50-80% under
    // `--repeat-each` against a production Storybook build; passes on dev and at
    // human speed). Pre-existing on the AS-1179 branch; re-enable once AS-1193
    // makes the commit deterministic.
    test.fixme(
      'Should resume an incomplete paired chip and clear the error when a value is entered',
      async ({ page }) => {
        await buildBase(page, 'header');
        await page.getByRole('menuitem', { name: /^is =$/ }).click();
        await page.mouse.click(2, 2);

        const chip = getChip(page);
        await expect(page.getByRole('alert')).toContainText('Value is required');

        // The paired "Value" label (second attribute segment) is clickable while
        // the pair is incomplete — it resumes editing at the missing value.
        await chip.locator('[data-slot="segment-attribute"]').nth(1).click();
        await page.getByRole('combobox', { name: 'Filter value' }).fill('Mozilla');
        await page.keyboard.press('Enter');
        await page.mouse.click(2, 2);

        await expect(page.getByRole('alert')).toHaveCount(0);
        await expect(chip).toContainText('Mozilla');
      },
    );

    // AS-1192 — an incomplete paired chip whose pair operator was never chosen:
    // clicking the fixed "Value" label opens the pair OPERATOR menu (the operator
    // segment is zero-width while unset, so the label is its affordance).
    // QUARANTINED (AS-1193): committing the pair via a blur while its operator menu
    // is still open is non-deterministic on the production Storybook build (the
    // chip stays `data-building`); passes on dev and verified manually. The
    // deterministic guard is the unit test in FilterInputChip.test.tsx.
    test.fixme(
      'Should open the pair operator menu from the label when the operator is unset',
      async ({ page }) => {
        // Leave the pair operator menu open (operator not yet chosen), then blur so
        // the chip commits incomplete with no pair operator.
        await buildBase(page, 'header');
        await page.mouse.click(2, 2);

        const chip = getChip(page);
        await expect(chip).not.toHaveAttribute('data-building', '');
        await expect(page.getByRole('alert')).toContainText('Value is required');

        // Click the paired "Value" label: with no pair operator it must open the
        // operator menu (operator choices render as menuitems; the value flow has
        // no menuitems since the paired field is freeform). The "is =" and
        // "is not !=" paired operators confirm it is the operator menu, not the value step.
        await chip.locator('[data-slot="segment-attribute"]').nth(1).click();
        await expect(page.getByRole('menuitem', { name: /^is =$/ })).toBeVisible();
        await expect(page.getByRole('menuitem', { name: /^is not !=$/ })).toBeVisible();
      },
    );

    // AS-1192 — every segment of an incomplete paired chip is individually
    // editable via a targeted click, exactly like a single chip (previously
    // `tryResumeBuilding` hijacked every click to the first missing step).
    // QUARANTINED (AS-1193): clicking the committed pair's tiny operator segment is
    // non-deterministic on the production Storybook build; passes on dev and
    // verified manually. Unit tests cover the routing deterministically.
    test.fixme(
      'Should edit the clicked segment (not resume) on an incomplete paired chip',
      async ({ page }) => {
        // Base complete + pair operator "is =" chosen, pair value left empty → blur.
        await buildBase(page, 'header');
        await page.getByRole('menuitem', { name: /^is =$/ }).click();
        await page.mouse.click(2, 2);

        const chip = getChip(page);
        await expect(chip).not.toHaveAttribute('data-building', '');

        // Click the PAIR operator segment → the pair operator menu ("like ~" is a
        // paired-only operator the "=" base field lacks, proving it is the pair
        // operator menu and not a resume into the value step).
        await chip.locator('[data-slot="segment-operator"]').nth(1).click();
        await expect(page.getByRole('menuitem', { name: /^like ~$/ })).toBeVisible();

        // Click the BASE value segment → the key-options menu (targeted), not a resume.
        await page.mouse.click(2, 2);
        await chip.locator('[data-slot="segment-value"]').nth(0).click();
        await expect(page.getByRole('menuitem', { name: /^cookie$/ })).toBeVisible();
      },
    );

    // AS-1192 — the empty paired VALUE reserves a small clickable width even when
    // idle, so the trailing × can't sit where the user clicks to fill it (which
    // deleted the chip). Clicking it resumes building to type the value.
    // QUARANTINED (AS-1193): the paired resume-on-value-click is non-deterministic
    // on the production Storybook build (the resumed input doesn't always render in
    // time); passes on dev and verified manually. The standalone equivalent below
    // is CI-stable, and the unit test guards the placeholder render.
    test.fixme(
      'Should not delete the chip when clicking the empty paired value to fill it',
      async ({ page }) => {
        await buildBase(page, 'header');
        await page.getByRole('menuitem', { name: /^is =$/ }).click(); // pair operator
        await page.mouse.click(2, 2);

        const chip = getChip(page);
        await expect(chip).not.toHaveAttribute('data-building', '');

        // The idle empty value segment must be a real target: non-zero width AND
        // height (an empty segment otherwise collapses to a 0×0 box and clicks fall
        // through to the chip / × button).
        await chip.hover();
        const pairValue = chip.locator('[data-slot="segment-value"]').nth(1);
        const box = (await pairValue.boundingBox())!;
        expect(box).toBeTruthy();
        expect(box.width).toBeGreaterThanOrEqual(3);
        expect(box.height).toBeGreaterThanOrEqual(12);

        // Click its centre (empty segments fail Playwright's visibility gate, so
        // click by coordinate as a user would). It must resume the chip for value
        // entry, not hit the × button behind it → the chip survives with its input.
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        await expect(page.locator('[data-slot="filter-input-condition-chip"]')).toHaveCount(1);
        await expect(page.locator('[data-slot="filter-input"] input')).toHaveCount(1);
      },
    );

    // AS-1179 #4 — changing the parameter key of a complete paired chip keeps
    // the chip and its second value (regression: the chip used to vanish).
    test('Should keep the chip and its value when the parameter key is changed', async ({
      page,
    }) => {
      await buildFullPair(page, 'header', 'authorization');
      const chip = getChip(page);
      await expect(chip).toContainText('header');
      await expect(chip).toContainText('authorization');

      // First value slot = the parameter key. Re-pick a different key.
      await chip.locator('[data-slot="segment-value"]').first().click();
      await page.getByRole('menuitem', { name: /^cookie$/ }).click();

      await expect(page.locator('[data-slot="filter-input-condition-chip"]')).toHaveCount(1);
      await expect(chip).toContainText('cookie');
      await expect(chip).toContainText('authorization');
    });

    // AS-1179 #5 — switching a paired "Value is not set" back to "is" makes the
    // now-required value missing, surfacing the standard required-value banner.
    test('Should surface the required-value error when "is not set" is switched to "is"', async ({
      page,
    }) => {
      await filterFieldStory.goto(page, 'Paired Field Value Is Set');
      const chip = getChip(page);
      // Preset chip ("Value is not set") is valid — no banner yet.
      await expect(page.getByRole('alert')).toHaveCount(0);

      // Second operator segment = the paired Value operator.
      await chip.locator('[data-slot="segment-operator"]').nth(1).click();
      await page.getByRole('menuitem', { name: /^is =$/ }).click();
      await page.mouse.click(2, 2);

      await expect(page.getByRole('alert')).toContainText('Value is required');
    });

    // AS-1179 #3 — a long paired value can't grow the chip past its 380px cap.
    test('Should cap the paired chip width when the value is very long', async ({ page }) => {
      await buildFullPair(page, 'header', `Mozilla-5.0-${'x'.repeat(200)}`);
      await page.mouse.click(2, 2);

      const box = await getChip(page).boundingBox();
      expect(box).toBeTruthy();
      // 380px cap + border/padding tolerance.
      expect(box!.width).toBeLessThanOrEqual(390);
    });
  });
});

// AS-1192 — a standalone (non-paired) incomplete chip is [attr][op] with no value
// segment, so the trailing × sits where the value goes and clicking to fill it
// deleted the chip. Mirrors the paired no-delete guard; interaction-only (chip
// survival), so it dodges the AS-1193 value-commit race.
test.describe('Component: FilterInput — AS-1192 standalone chip', () => {
  test.describe('Interactions', () => {
    type E2EPage = Parameters<Parameters<typeof test>[1]>[0]['page'];
    const getField = (page: E2EPage) => page.locator('[data-slot="filter-input"]');
    const getChip = (page: E2EPage) =>
      page.locator('[data-slot="filter-input-condition-chip"]').first();

    test('Should not delete the chip when clicking the empty value to fill it', async ({
      page,
    }) => {
      await filterFieldStory.goto(page, 'Default');
      await getField(page).click();
      await page.getByRole('menuitem', { name: /^Priority$/ }).click();
      await page.getByRole('menuitem', { name: /^is =$/ }).click();

      // Force-commit the incomplete chip: click the empty input area past the
      // building chip (leaves the value empty) instead of blurring, which would
      // keep it a draft. +24px clears the chip's margin and × button without
      // reaching the next chip.
      const chip = getChip(page);
      const cbox = (await chip.boundingBox())!;
      await page.mouse.click(cbox.x + cbox.width + 24, cbox.y + cbox.height / 2);
      await expect(chip).not.toHaveAttribute('data-building', '');
      await expect(page.getByRole('alert')).toBeVisible();

      // The empty value renders a clickable placeholder; clicking it must resume
      // value entry, not hit the × behind it → the chip survives and the value
      // input opens.
      await chip.hover();
      const value = chip.locator('[data-slot="segment-value"]');
      const vbox = (await value.boundingBox())!;
      expect(vbox.width).toBeGreaterThanOrEqual(3);
      expect(vbox.height).toBeGreaterThanOrEqual(12);
      await page.mouse.click(vbox.x + vbox.width / 2, vbox.y + vbox.height / 2);
      await expect(page.locator('[data-slot="filter-input-condition-chip"]')).toHaveCount(1);
      await expect(page.getByRole('combobox', { name: 'Filter value' })).toBeVisible();
    });
  });
});
