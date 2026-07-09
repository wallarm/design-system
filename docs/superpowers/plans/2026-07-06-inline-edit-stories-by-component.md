# InlineEdit Stories Split by Component Type Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `InlineEdit.stories.tsx`'s single `Gallery` mega-story (all nine editor rows in one grid) with nine focused per-editor-type story exports in the same file, and repoint `InlineEdit.e2e.ts` at the new story names.

**Architecture:** One file stays one file — only the `Gallery` export is decomposed into nine sibling exports (`TextEditor`, `NumberEditor`, `TextareaEditor`, `SelectEditor`, `MultiSelectEditor`, `TagsEditor`, `DateEditor`, `TimeEditor`, `DateTimeEditor`), each with its own local state, reusing the file's existing `Row`/`roleItems`/`tagItems`. Since `meta.title` is unchanged, the Storybook ID prefix `data-display-inlineedit` is unchanged — only the story-name array and each e2e test's navigation target need updating.

**Tech Stack:** Storybook (`storybook-react-rsbuild`), Playwright, Biome.

**Spec:** `docs/superpowers/specs/2026-07-06-inline-edit-stories-by-component-design.md` — read it before starting.

## Global Constraints

- Conventional commits; scope `inline-edit`, ticket suffix `(WDS-143)`.
- Do NOT create separate `.stories.tsx` files per component — this was explicitly rejected. One file, nine new exports.
- `States`/`Async`/`NonEditable`/`CustomEditor`/`ConfirmCommit` are untouched — do not rename, move, or restructure them.
- This package's `pnpm typecheck` script is a confirmed pre-existing no-op (`tsc --noEmit` against a solution-style tsconfig with `files: []` — checks zero files). Use `pnpm --filter @wallarm-org/design-system build` and `build-storybook` as the real compile-checks.
- Biome formatting: `pnpm --filter @wallarm-org/design-system lint:fix` before every commit.
- E2E tests follow `docs/e2e-test-rules.md` (Should-sentences, Visual/Interactions/Accessibility groups, `data-testid` selectors only).

---

### Task 1: Split `Gallery` into nine per-editor story exports

**Files:**
- Modify: `packages/design-system/src/components/InlineEdit/InlineEdit.stories.tsx`

**Interfaces:**
- Consumes: existing `Row`, `roleItems`, `tagItems` (all already defined in this file, unchanged).
- Produces: nine new story exports — `TextEditor`, `NumberEditor`, `TextareaEditor`, `SelectEditor`, `MultiSelectEditor`, `TagsEditor`, `DateEditor`, `TimeEditor`, `DateTimeEditor` — each a `StoryFn`. Storybook derives their sidebar names by inserting spaces before capitals ("Text Editor", "Number Editor", etc.), matching how `NonEditable`/`CustomEditor` already display as "Non Editable"/"Custom Editor" in this same file. Task 2 references these nine display names verbatim.

- [ ] **Step 1: Replace the `Gallery` export with the nine new exports**

In `InlineEdit.stories.tsx`, delete the entire `Gallery` export (from its leading JSDoc comment `/** * All inline-edit value types in a single gallery...` through its closing `};`) and replace it with:

```tsx
/** `InlineEditInput` in isolation — the default text editor. */
export const TextEditor: StoryFn = () => {
  const [text, setText] = useState('Checkout API');
  return (
    <div className='w-[320px]'>
      <Row label='Name'>
        <InlineEdit value={text} onValueCommit={v => setText(v as string)} data-testid='text'>
          <InlineEditPreview data-analytics-id='inline-edit-name'>{text}</InlineEditPreview>
          <InlineEditControl>
            <InlineEditInput data-analytics-id='inline-edit-name-input' aria-label='Name' />
          </InlineEditControl>
          <InlineEditError />
        </InlineEdit>
      </Row>
    </div>
  );
};

/** `InlineEditNumber` in isolation. */
export const NumberEditor: StoryFn = () => {
  const [port, setPort] = useState('8443');
  return (
    <div className='w-[320px]'>
      <Row label='Port'>
        <InlineEdit value={port} onValueCommit={v => setPort(v as string)} data-testid='number'>
          <InlineEditPreview>{port}</InlineEditPreview>
          <InlineEditControl>
            <InlineEditNumber />
          </InlineEditControl>
        </InlineEdit>
      </Row>
    </div>
  );
};

/** `InlineEditTextarea` in isolation, with `lineClamp` on the preview. */
export const TextareaEditor: StoryFn = () => {
  const [about, setAbout] = useState(
    'Displays a labeled value for a single object attribute. Used in detail panels, drawers and forms to present structured information.',
  );
  return (
    <div className='w-[320px]'>
      <Row label='About'>
        <InlineEdit value={about} onValueCommit={v => setAbout(v as string)} data-testid='textarea'>
          <InlineEditPreview lineClamp={3}>{about}</InlineEditPreview>
          <InlineEditControl>
            <InlineEditTextarea minRows={2} maxRows={6} />
          </InlineEditControl>
          <InlineEditError />
        </InlineEdit>
      </Row>
    </div>
  );
};

/** `InlineEditSelect` (single) in isolation. */
export const SelectEditor: StoryFn = () => {
  const [role, setRole] = useState<string[]>(['editor']);
  const roleLabel = roleItems.find(i => i.value === (role[0] ?? ''))?.label ?? '';
  return (
    <div className='w-[320px]'>
      <Row label='Role'>
        <InlineEdit value={role} onValueCommit={v => setRole(v as string[])} data-testid='select'>
          <InlineEditPreview>
            <InlineEditPreviewValue>{roleLabel}</InlineEditPreviewValue>
            <InlineEditPreviewIcon>
              <ChevronDown size='md' />
            </InlineEditPreviewIcon>
          </InlineEditPreview>
          <InlineEditControl>
            <InlineEditSelect items={roleItems} />
          </InlineEditControl>
        </InlineEdit>
      </Row>
    </div>
  );
};

/** `InlineEditSelect` (multiple) in isolation. */
export const MultiSelectEditor: StoryFn = () => {
  const [roles, setRoles] = useState<string[]>(['editor', 'viewer']);
  const rolesLabel = roles.map(v => roleItems.find(i => i.value === v)?.label ?? v).join(', ');
  return (
    <div className='w-[320px]'>
      <Row label='Roles'>
        <InlineEdit
          value={roles}
          onValueCommit={v => setRoles(v as string[])}
          data-testid='multi-select'
        >
          <InlineEditPreview>
            <InlineEditPreviewValue>{rolesLabel}</InlineEditPreviewValue>
            <InlineEditPreviewIcon>
              <ChevronDown size='md' />
            </InlineEditPreviewIcon>
          </InlineEditPreview>
          <InlineEditControl>
            <InlineEditSelect items={roleItems} multiple />
          </InlineEditControl>
        </InlineEdit>
      </Row>
    </div>
  );
};

/** `InlineEditSelect` (multiple) rendering its value as `Tag` chips. */
export const TagsEditor: StoryFn = () => {
  const [tags, setTags] = useState<string[]>(['production', 'critical']);
  return (
    <div className='w-[320px]'>
      <Row label='Tags'>
        <InlineEdit value={tags} onValueCommit={v => setTags(v as string[])} data-testid='tags'>
          <InlineEditPreview>
            <InlineEditPreviewValue>
              <span className='flex gap-4'>
                {tags.map(v => (
                  <Tag key={v}>{v}</Tag>
                ))}
              </span>
            </InlineEditPreviewValue>
            <InlineEditPreviewIcon>
              <ChevronDown size='md' />
            </InlineEditPreviewIcon>
          </InlineEditPreview>
          <InlineEditControl>
            <InlineEditSelect items={tagItems} multiple />
          </InlineEditControl>
        </InlineEdit>
      </Row>
    </div>
  );
};

/** `InlineEditDate` in isolation. */
export const DateEditor: StoryFn = () => {
  const [date, setDate] = useState<DateValue | null>(new CalendarDate(2026, 6, 15));
  const dateLabel = date
    ? format(new Date(date.year, date.month - 1, date.day), 'd MMM, yyyy')
    : '—';
  return (
    <div className='w-[320px]'>
      <DateFormatProvider order='day-first' hourCycle={24}>
        <Row label='Date'>
          <InlineEdit
            value={date}
            onValueCommit={v => setDate(v as DateValue | null)}
            data-testid='date'
          >
            <InlineEditPreview>
              <InlineEditPreviewValue>{dateLabel}</InlineEditPreviewValue>
              <InlineEditPreviewIcon>
                <Calendar size='md' />
              </InlineEditPreviewIcon>
            </InlineEditPreview>
            <InlineEditControl>
              <InlineEditDate />
            </InlineEditControl>
          </InlineEdit>
        </Row>
      </DateFormatProvider>
    </div>
  );
};

/** `InlineEditTime` in isolation. */
export const TimeEditor: StoryFn = () => {
  const [time, setTime] = useState<TimeValue | null>(new Time(14, 30));
  const timeLabel = time ? format(new Date(2000, 0, 1, time.hour, time.minute), 'h:mm a') : '—';
  return (
    <div className='w-[320px]'>
      <DateFormatProvider order='day-first' hourCycle={12}>
        <Row label='Time'>
          <InlineEdit
            value={time}
            onValueCommit={v => setTime(v as TimeValue | null)}
            data-testid='time'
          >
            <InlineEditPreview>
              <InlineEditPreviewValue>{timeLabel}</InlineEditPreviewValue>
              <InlineEditPreviewIcon>
                <Clock size='md' />
              </InlineEditPreviewIcon>
            </InlineEditPreview>
            <InlineEditControl>
              <InlineEditTime />
            </InlineEditControl>
          </InlineEdit>
        </Row>
      </DateFormatProvider>
    </div>
  );
};

/** `InlineEditDateTime` in isolation. */
export const DateTimeEditor: StoryFn = () => {
  const [dateTime, setDateTime] = useState<CalendarDateTime | null>(
    new CalendarDateTime(2026, 6, 15, 14, 30),
  );
  const dateTimeLabel = dateTime
    ? format(
        new Date(dateTime.year, dateTime.month - 1, dateTime.day, dateTime.hour, dateTime.minute),
        'd MMM, yyyy h:mm a',
      )
    : '—';
  return (
    <div className='w-[320px]'>
      <DateFormatProvider order='day-first' hourCycle={12}>
        <Row label='Date & Time'>
          <InlineEdit
            value={dateTime}
            onValueCommit={v => setDateTime(v as CalendarDateTime | null)}
            data-testid='datetime'
          >
            <InlineEditPreview>
              <InlineEditPreviewValue>{dateTimeLabel}</InlineEditPreviewValue>
              <InlineEditPreviewIcon>
                <Calendar size='md' />
              </InlineEditPreviewIcon>
            </InlineEditPreview>
            <InlineEditControl>
              <InlineEditDateTime />
            </InlineEditControl>
          </InlineEdit>
        </Row>
      </DateFormatProvider>
    </div>
  );
};
```

- [ ] **Step 2: Verify no other story/doc still references `Gallery`**

Run: `grep -n "Gallery" packages/design-system/src/components/InlineEdit/InlineEdit.stories.tsx`
Expected: no matches (the export is fully gone; the JSDoc mentioning "single gallery" was deleted along with it in Step 1).

- [ ] **Step 3: Compile-check with the real build and build-storybook**

Run: `pnpm --filter @wallarm-org/design-system build`
Expected: exit 0.

Run: `pnpm --filter @wallarm-org/design-system build-storybook`
Expected: exit 0.

(Do not rely on `pnpm typecheck` — it is a confirmed no-op in this package.)

- [ ] **Step 4: Visually confirm in Storybook**

With Storybook running (`pnpm --filter @wallarm-org/design-system storybook` if not already up), open `http://localhost:6006` and confirm the sidebar under "Data Display > InlineEdit" now shows nine new story entries (Text Editor, Number Editor, Textarea Editor, Select Editor, Multi Select Editor, Tags Editor, Date Editor, Time Editor, Date Time Editor) alongside the unchanged States/Async/Non Editable/Custom Editor/Confirm Commit — and that "Gallery" is gone.

- [ ] **Step 5: Lint and commit**

```bash
pnpm --filter @wallarm-org/design-system lint:fix
git add packages/design-system/src/components/InlineEdit/InlineEdit.stories.tsx
git commit -m "refactor(inline-edit): split Gallery into per-editor story exports (WDS-143)"
```

---

### Task 2: Repoint `InlineEdit.e2e.ts` and re-baseline screenshots

**Files:**
- Modify: `packages/design-system/src/components/InlineEdit/InlineEdit.e2e.ts`
- Modify: `packages/design-system/src/components/InlineEdit/InlineEdit.e2e.ts-snapshots/` (re-baselined PNGs)

**Interfaces:**
- Consumes: the nine story display names from Task 1 (`Text Editor`, `Number Editor`, `Textarea Editor`, `Select Editor`, `Multi Select Editor`, `Tags Editor`, `Date Editor`, `Time Editor`, `Date Time Editor`).
- Produces: a fully green e2e suite against the new story set.

- [ ] **Step 1: Replace the `createStoryHelper` story-name array**

In `InlineEdit.e2e.ts`, replace:

```ts
const inlineEditStory = createStoryHelper('data-display-inlineedit', [
  'Gallery',
  'States',
  'Async',
  'Non Editable',
  'Custom Editor',
  'Confirm Commit',
] as const);
```

with:

```ts
const inlineEditStory = createStoryHelper('data-display-inlineedit', [
  'Text Editor',
  'Number Editor',
  'Textarea Editor',
  'Select Editor',
  'Multi Select Editor',
  'Tags Editor',
  'Date Editor',
  'Time Editor',
  'Date Time Editor',
  'States',
  'Async',
  'Non Editable',
  'Custom Editor',
  'Confirm Commit',
] as const);
```

- [ ] **Step 2: Replace the `Visual` describe block**

Replace the entire `test.describe('Visual', ...)` block with:

```ts
  test.describe('Visual', () => {
    test('Should render the text editor correctly', async ({ page }) => {
      await inlineEditStory.goto(page, 'Text Editor');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the number editor correctly', async ({ page }) => {
      await inlineEditStory.goto(page, 'Number Editor');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the textarea editor correctly', async ({ page }) => {
      await inlineEditStory.goto(page, 'Textarea Editor');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the select editor correctly', async ({ page }) => {
      await inlineEditStory.goto(page, 'Select Editor');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the multi-select editor correctly', async ({ page }) => {
      await inlineEditStory.goto(page, 'Multi Select Editor');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the tags editor correctly', async ({ page }) => {
      await inlineEditStory.goto(page, 'Tags Editor');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the date editor correctly', async ({ page }) => {
      await inlineEditStory.goto(page, 'Date Editor');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the time editor correctly', async ({ page }) => {
      await inlineEditStory.goto(page, 'Time Editor');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the date-time editor correctly', async ({ page }) => {
      await inlineEditStory.goto(page, 'Date Time Editor');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render hover affordance with tooltip correctly', async ({ page }) => {
      await inlineEditStory.goto(page, 'Text Editor');
      await page.getByTestId('text--preview').hover();
      await expect(page.getByTestId('text--content')).toHaveText('Edit');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the editing state correctly', async ({ page }) => {
      await inlineEditStory.goto(page, 'Text Editor');
      await page.getByTestId('text--preview').click();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render async-feedback states correctly', async ({ page }) => {
      await inlineEditStory.goto(page, 'States');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render non-editable states correctly', async ({ page }) => {
      await inlineEditStory.goto(page, 'Non Editable');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the commit confirmation dialog correctly', async ({ page }) => {
      await inlineEditStory.goto(page, 'Confirm Commit');
      await page.getByTestId('confirm-email--preview').click();
      const input = page.getByTestId('confirm-email--input');
      await input.fill('new@wallarm.com');
      await input.press('Enter');
      await expect(page.getByTestId('confirm-dialog--content')).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });
  });
```

- [ ] **Step 3: Replace the `Interactions` describe block**

Replace the entire `test.describe('Interactions', ...)` block with:

```ts
  test.describe('Interactions', () => {
    test('Should enter edit mode and commit on Enter', async ({ page }) => {
      await inlineEditStory.goto(page, 'Text Editor');
      await page.getByTestId('text--preview').click();
      const input = page.getByTestId('text--input');
      await expect(input).toBeFocused();
      await input.fill('Payments API');
      await input.press('Enter');
      await expect(page.getByTestId('text--preview')).toHaveText(/Payments API/);
    });

    test('Should revert on Escape', async ({ page }) => {
      await inlineEditStory.goto(page, 'Text Editor');
      await page.getByTestId('text--preview').click();
      const input = page.getByTestId('text--input');
      await input.fill('Discarded');
      await input.press('Escape');
      await expect(page.getByTestId('text--preview')).toHaveText(/Checkout API/);
    });

    test('Should commit on blur', async ({ page }) => {
      await inlineEditStory.goto(page, 'Text Editor');
      await page.getByTestId('text--preview').click();
      const input = page.getByTestId('text--input');
      await input.fill('Blurred API');
      await input.press('Tab');
      await expect(page.getByTestId('text--preview')).toHaveText(/Blurred API/);
    });

    test('Should show loading then saved during async commit', async ({ page }) => {
      await inlineEditStory.goto(page, 'Async');
      await page.getByTestId('attr--preview').click();
      const input = page.getByTestId('attr--input');
      await input.fill('Async API');
      await input.press('Enter');
      await expect(page.getByTestId('attr--preview')).toHaveText(/Async API/);
    });

    test('Should surface error and stay in edit on rejected commit', async ({ page }) => {
      await inlineEditStory.goto(page, 'Async');
      await page.getByTestId('attr--preview').click();
      const input = page.getByTestId('attr--input');
      await input.fill('');
      await input.press('Enter');
      await expect(page.getByTestId('attr--error')).toBeVisible();
      await expect(page.getByTestId('attr--input')).toBeVisible();
    });

    test('Should commit a select pick when the dropdown closes', async ({ page }) => {
      await inlineEditStory.goto(page, 'Select Editor');
      await page.getByTestId('select--preview').click();
      await page.getByRole('option', { name: 'Admin' }).click();
      await expect(page.getByTestId('select--preview')).toHaveText(/Admin/);
    });

    test('Should commit a date pick when the calendar closes', async ({ page }) => {
      await inlineEditStory.goto(page, 'Date Editor');
      await page.getByTestId('date--preview').click();
      await page.locator('[data-part="table-cell-trigger"]', { hasText: /^20$/ }).first().click();
      await page.mouse.click(5, 5);
      await expect(page.getByTestId('date--preview')).toHaveText(/20 Jun, 2026/);
    });

    test('Should commit a time edit when the date-time popover closes', async ({ page }) => {
      await inlineEditStory.goto(page, 'Date Time Editor');
      const preview = page.getByTestId('datetime--preview');
      await expect(preview).toHaveText(/2:30 PM/);
      await preview.click();
      const popover = page.locator('[data-scope="date-picker"][data-part="content"]');
      await popover.getByRole('spinbutton', { name: 'hour' }).click();
      await page.keyboard.type('5');
      await page.mouse.click(5, 5);
      await expect(preview).toHaveText(/5:30 PM/);
    });

    test('Should keep the time when a day is picked from the date-time grid', async ({ page }) => {
      await inlineEditStory.goto(page, 'Date Time Editor');
      const preview = page.getByTestId('datetime--preview');
      await preview.click();
      await page.locator('[data-part="table-cell-trigger"]', { hasText: /^20$/ }).first().click();
      await page.mouse.click(5, 5);
      await expect(preview).toHaveText(/20 Jun, 2026 2:30 PM/);
    });

    test('Should commit a time edit on blur', async ({ page }) => {
      await inlineEditStory.goto(page, 'Time Editor');
      await page.getByTestId('time--preview').click();
      const hour = page.getByRole('spinbutton', { name: 'hour' }).first();
      await hour.click();
      await page.keyboard.type('9');
      await page.mouse.click(5, 5); // blur out — no sibling editor on this isolated page
      await expect(page.getByTestId('time--preview')).toHaveText(/9:30/);
    });

    test('Should not enter edit mode when readOnly', async ({ page }) => {
      await inlineEditStory.goto(page, 'Non Editable');
      await page.getByTestId('readonly--preview').click();
      await expect(page.getByTestId('readonly--input')).toHaveCount(0);
    });

    test('Should not enter edit mode when disabled', async ({ page }) => {
      await inlineEditStory.goto(page, 'Non Editable');
      await page.getByTestId('disabled--preview').click();
      await expect(page.getByTestId('disabled--input')).toHaveCount(0);
    });

    test('Should commit through a custom render-prop editor', async ({ page }) => {
      await inlineEditStory.goto(page, 'Custom Editor');
      await page.getByTestId('custom--preview').click();
      const input = page.getByRole('textbox', { name: 'Custom' });
      await input.fill('payments api');
      await input.press('Enter');
      await expect(page.getByTestId('custom--preview')).toHaveText(/PAYMENTS API/);
    });

    test('Should keep editing with the draft when the confirmation is declined', async ({
      page,
    }) => {
      await inlineEditStory.goto(page, 'Confirm Commit');
      await page.getByTestId('confirm-email--preview').click();
      const input = page.getByTestId('confirm-email--input');
      await input.fill('new@wallarm.com');
      await input.press('Enter');
      await page.getByTestId('confirm-decline').click();
      await expect(input).toBeVisible();
      await expect(input).toHaveValue('new@wallarm.com');
    });

    test('Should commit when the confirmation is accepted', async ({ page }) => {
      await inlineEditStory.goto(page, 'Confirm Commit');
      await page.getByTestId('confirm-email--preview').click();
      const input = page.getByTestId('confirm-email--input');
      await input.fill('new@wallarm.com');
      await input.press('Enter');
      await page.getByTestId('confirm-accept').click();
      await expect(page.getByTestId('confirm-email--preview')).toHaveText(/new@wallarm.com/);
    });

    test('Should not prompt when the submitted value is unchanged', async ({ page }) => {
      await inlineEditStory.goto(page, 'Confirm Commit');
      await page.getByTestId('confirm-email--preview').click();
      await page.getByTestId('confirm-email--input').press('Enter');
      await expect(page.getByTestId('confirm-email--preview')).toBeVisible();
      await expect(page.getByTestId('confirm-accept')).toBeHidden();
    });

    test('Should park a declined select in edit mode and ask again on reclose', async ({
      page,
    }) => {
      await inlineEditStory.goto(page, 'Confirm Commit');
      await page.getByTestId('confirm-role--preview').click();
      await page.getByRole('option', { name: 'Admin' }).click(); // closes popover → guard
      await page.getByTestId('confirm-decline').click();
      // Parked: still in edit mode (collapsed trigger, no preview).
      await expect(page.getByTestId('confirm-role--preview')).toBeHidden();
      await expect(page.getByTestId('confirm-role--input')).toBeVisible();
      // Recovery: reopen and re-close the popover — the guard fires again.
      await page.getByTestId('confirm-role--input').click();
      await page.getByRole('option', { name: 'Admin' }).click();
      await page.getByTestId('confirm-accept').click();
      await expect(page.getByTestId('confirm-role--preview')).toHaveText(/Admin/);
    });
  });
```

- [ ] **Step 4: Retarget the `Accessibility` describe block**

In the `test.describe('Accessibility', ...)` block, change the two `'Gallery'` targets to `'Text Editor'` (the third and fourth tests already target `'Confirm Commit'` and stay unchanged):

```ts
    test('Should enter edit via keyboard activation', async ({ page }) => {
      await inlineEditStory.goto(page, 'Text Editor');
      const preview = page.getByTestId('text--preview');
      await preview.focus();
      await preview.press('Enter');
      await expect(page.getByTestId('text--input')).toBeFocused();
    });

    test('Should cancel edit via Escape', async ({ page }) => {
      await inlineEditStory.goto(page, 'Text Editor');
      await page.getByTestId('text--preview').click();
      await page.getByTestId('text--input').press('Escape');
      await expect(page.getByTestId('text--preview')).toBeVisible();
    });

    test('Should reach the preview in tab order and expose the editor name', async ({ page }) => {
      await inlineEditStory.goto(page, 'Text Editor');
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('text--preview')).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('textbox', { name: 'Name' })).toBeFocused();
    });
```

(Leave `'Should restore focus to the editor when the confirmation dialog closes on decline'` exactly as-is — it already targets `'Confirm Commit'`, untouched by this plan.)

- [ ] **Step 5: Re-baseline and run the full suite**

Storybook must be running: `pnpm --filter @wallarm-org/design-system storybook` (skip if already up on `:6006`).

Run: `pnpm --filter @wallarm-org/design-system e2e InlineEdit.e2e.ts --update-snapshots`
Expected: all tests pass; new baselines generated for the nine new Visual tests and re-generated for the two retargeted Visual tests (hover affordance, editing state) whose screenshot content changed (smaller single-row page instead of the nine-row grid).

Re-run without the flag to confirm stability: `pnpm --filter @wallarm-org/design-system e2e InlineEdit.e2e.ts`
Expected: all pass.

- [ ] **Step 6: Lint and commit (with the screenshot trigger)**

```bash
pnpm --filter @wallarm-org/design-system lint:fix
git add packages/design-system/src/components/InlineEdit/InlineEdit.e2e.ts packages/design-system/src/components/InlineEdit/InlineEdit.e2e.ts-snapshots
git commit -m "test(inline-edit): repoint e2e at per-editor stories [update-screenshots] (WDS-143)"
```

---

### Task 3: Final verification

**Files:** none new — verification only.

- [ ] **Step 1: Full quality gate**

```bash
pnpm --filter @wallarm-org/design-system lint
pnpm --filter @wallarm-org/design-system build
pnpm --filter @wallarm-org/design-system build-storybook
pnpm --filter @wallarm-org/design-system test:run
pnpm --filter @wallarm-org/design-system e2e InlineEdit.e2e.ts
```

Expected: all green.

- [ ] **Step 2: Spec cross-check**

```bash
grep -n "'Gallery'" packages/design-system/src/components/InlineEdit/InlineEdit.e2e.ts packages/design-system/src/components/InlineEdit/InlineEdit.stories.tsx
```

Expected: no matches.
