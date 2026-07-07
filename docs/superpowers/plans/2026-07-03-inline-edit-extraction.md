# InlineEdit Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the `AttributeEdit*` family into a standalone `InlineEdit` compound component with built-in Select/Date/Time editors and a submit-mode override mechanism, per `docs/superpowers/specs/2026-07-03-inline-edit-extraction-design.md`.

**Architecture:** Physical move + mechanical rename of 8 source files (zero import coupling to Attribute, nothing exported from the package root yet — no breaking change). Attribute-specific styling moves to `AttributeValue` as `data-slot`-keyed CSS (host adapts to guest). New core capability: editors register their commit mode via `useInlineEditSubmitMode` (layout-effect, token-safe, last-wins); `InlineEditControl` gains a `submitMode` prop and render-prop children. Three new adapter editors wrap DS `Select`/`Calendar`/`TimeInput`.

**Tech Stack:** React 19 (ref prop, no forwardRef), TypeScript strict, Tailwind 4 + tailwind-merge via `cn()`, CVA in `classes.ts`, Vitest + Testing Library (jsdom), Playwright e2e, Storybook (`storybook-react-rsbuild`).

## Global Constraints

- No `any`; named exports only; `displayName` on every component; `ref?: Ref<...>` prop directly (React 19), never `React.forwardRef`.
- `cn()` from `../../utils/cn` for all className merging; CVA variants live in `classes.ts`.
- `data-slot='inline-edit*'` kebab-case on compound roots; `data-slot` is for CSS only — tests select via `data-testid` exclusively.
- testId cascading per `.claude/rules/test-id.md`: root `useTestId(undefined, testIdProp)` + `TestIdProvider`; sub-components `useTestId('slot', override)`. Slots: `preview`, `control`, `error`; all editors share `input` (deliberate deviation, editor-agnostic e2e selectors).
- Conventional commits; every commit message ends with the `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` trailer.
- Run `pnpm lint:fix` before each commit (Biome owns formatting).
- Unit test command (from repo root): `pnpm -C packages/design-system exec vitest run <path>`; typecheck: `pnpm typecheck`.
- E2E is updated in Task 10; between Tasks 1 and 10 the Playwright suite is knowingly red locally — do not "fix" it earlier. Unit tests and typecheck must be green after every task.
- Editors inherit the ambient `DateFormatProvider` — never wrap one inside a component.

---

### Task 1: Physical move + mechanical rename

**Files:**
- Move (git mv): `packages/design-system/src/components/Attribute/AttributeEdit{,Context,Preview,Control,Input,Number,Textarea,Error}.{tsx,ts}` → `packages/design-system/src/components/InlineEdit/InlineEdit{,Context,Preview,Control,Input,Number,Textarea,Error}.{tsx,ts}`
- Move (git mv): the six unit test files `AttributeEdit.test.tsx`, `AttributeEditContext.test.tsx`, `AttributeEditControl.test.tsx`, `AttributeEditError.test.tsx`, `AttributeEditInput.test.tsx`, `AttributeEditPreview.test.tsx` → same names with `InlineEdit` prefix in `components/InlineEdit/`
- Move (git mv): `Attribute/ANALYTICS_GAPS.md` → `InlineEdit/ANALYTICS_GAPS.md`
- Rename in place: `Attribute/AttributeEdit.integration.test.tsx` → `Attribute/AttributeInlineEdit.integration.test.tsx`
- Create: `packages/design-system/src/components/InlineEdit/index.ts`
- Modify: `packages/design-system/src/components/Attribute/index.ts` (drop Edit exports), `Attribute/Attribute.stories.tsx` (re-point imports/usages)

**Interfaces:**
- Consumes: current `AttributeEdit*` sources (verified: they import only `react`, `../../utils/*`, `../../hooks/useControlled`, `../../icons`, and generic DS components — no Attribute internals).
- Produces: symbols `InlineEdit<T>`, `InlineEditPreview`, `InlineEditControl`, `InlineEditInput`, `InlineEditNumber`, `InlineEditTextarea`, `InlineEditError`, `useInlineEdit<T>()`, types `InlineEditProps<T>`, `InlineEditContextValue<T>`, `InlineEditStatus`, `InlineEditActivationMode`, `InlineEditSubmitMode`; data-slots `inline-edit`, `inline-edit-preview`, `inline-edit-control`, `inline-edit-error`; testId slots `preview`, `control`, `input`, `error`. All later tasks build on these names.

- [ ] **Step 1: Move the files with git mv**

```bash
cd /Users/ilyapashkov/Projects/wallarm/wallarm-design-system/packages/design-system/src/components
mkdir InlineEdit
for f in AttributeEdit.tsx AttributeEditContext.ts AttributeEditPreview.tsx AttributeEditControl.tsx AttributeEditInput.tsx AttributeEditNumber.tsx AttributeEditTextarea.tsx AttributeEditError.tsx AttributeEdit.test.tsx AttributeEditContext.test.tsx AttributeEditControl.test.tsx AttributeEditError.test.tsx AttributeEditInput.test.tsx AttributeEditPreview.test.tsx; do
  git mv "Attribute/$f" "InlineEdit/${f/AttributeEdit/InlineEdit}"
done
git mv Attribute/ANALYTICS_GAPS.md InlineEdit/ANALYTICS_GAPS.md
git mv Attribute/AttributeEdit.integration.test.tsx Attribute/AttributeInlineEdit.integration.test.tsx
```

- [ ] **Step 2: Rename symbols, slots, and testId slots inside the moved files**

Order matters: slots first (their strings contain `attribute-edit`), then the symbol prefix (also fixes `./AttributeEditContext` import specifiers and `useAttributeEdit`), then the testId slot strings.

```bash
cd /Users/ilyapashkov/Projects/wallarm/wallarm-design-system/packages/design-system/src/components/InlineEdit
sed -i '' \
  -e "s/attribute-edit/inline-edit/g" \
  -e "s/AttributeEdit/InlineEdit/g" \
  -e "s/'edit-preview'/'preview'/g" \
  -e "s/'edit-control'/'control'/g" \
  -e "s/'edit-input'/'input'/g" \
  -e "s/'edit-error'/'error'/g" \
  ./*.tsx ./*.ts
# Test files reference derived testids like 'attr--edit-preview' → 'attr--preview'
sed -i '' -e "s/--edit-preview/--preview/g" -e "s/--edit-control/--control/g" -e "s/--edit-input/--input/g" -e "s/--edit-error/--error/g" ./*.test.tsx
# ANALYTICS_GAPS.md subjects
sed -i '' -e "s/AttributeEdit/InlineEdit/g" -e "s/Attribute — Analytics Gaps/InlineEdit — Analytics Gaps/" ANALYTICS_GAPS.md
```

Note: `useAttributeEdit` → `useInlineEdit` happens via the `AttributeEdit` → `InlineEdit` substitution. Import paths like `../../utils/cn` stay valid (same directory depth).

- [ ] **Step 3: Create `InlineEdit/index.ts`**

```typescript
export { InlineEdit, type InlineEditProps } from './InlineEdit';
export {
  type InlineEditActivationMode,
  type InlineEditContextValue,
  type InlineEditStatus,
  type InlineEditSubmitMode,
  useInlineEdit,
} from './InlineEditContext';
export { InlineEditControl, type InlineEditControlProps } from './InlineEditControl';
export { InlineEditError, type InlineEditErrorProps } from './InlineEditError';
export { InlineEditInput, type InlineEditInputProps } from './InlineEditInput';
export { InlineEditNumber, type InlineEditNumberProps } from './InlineEditNumber';
export { InlineEditPreview, type InlineEditPreviewProps } from './InlineEditPreview';
export { InlineEditTextarea, type InlineEditTextareaProps } from './InlineEditTextarea';
```

- [ ] **Step 4: Drop the Edit exports from `Attribute/index.ts`**

Delete these lines from `packages/design-system/src/components/Attribute/index.ts` (currently lines 9–22):

```typescript
export { AttributeEdit, type AttributeEditProps } from './AttributeEdit';
export {
  type AttributeEditActivationMode,
  type AttributeEditContextValue,
  type AttributeEditStatus,
  type AttributeEditSubmitMode,
  useAttributeEdit,
} from './AttributeEditContext';
export { AttributeEditControl, type AttributeEditControlProps } from './AttributeEditControl';
export { AttributeEditError, type AttributeEditErrorProps } from './AttributeEditError';
export { AttributeEditInput, type AttributeEditInputProps } from './AttributeEditInput';
export { AttributeEditNumber, type AttributeEditNumberProps } from './AttributeEditNumber';
export { AttributeEditPreview, type AttributeEditPreviewProps } from './AttributeEditPreview';
export { AttributeEditTextarea, type AttributeEditTextareaProps } from './AttributeEditTextarea';
```

- [ ] **Step 5: Re-point `Attribute.stories.tsx` (keeps compiling until Task 8 rewrites it)**

The story file exports a story literally named `InlineEdit`, so the root component must be import-aliased to avoid a name collision. In `packages/design-system/src/components/Attribute/Attribute.stories.tsx`:

Replace the seven old imports (lines 45–52):

```typescript
import { AttributeEdit } from './AttributeEdit';
import { useAttributeEdit } from './AttributeEditContext';
import { AttributeEditControl } from './AttributeEditControl';
import { AttributeEditError } from './AttributeEditError';
import { AttributeEditInput } from './AttributeEditInput';
import { AttributeEditNumber } from './AttributeEditNumber';
import { AttributeEditPreview } from './AttributeEditPreview';
import { AttributeEditTextarea } from './AttributeEditTextarea';
```

with:

```typescript
import {
  InlineEdit as InlineEditRoot,
  InlineEditControl,
  InlineEditError,
  InlineEditInput,
  InlineEditNumber,
  InlineEditPreview,
  InlineEditTextarea,
  useInlineEdit,
} from '../InlineEdit';
```

Then rename usages in the same file:

```bash
cd /Users/ilyapashkov/Projects/wallarm/wallarm-design-system/packages/design-system/src/components/Attribute
sed -i '' \
  -e "s/<AttributeEdit$/<InlineEditRoot/g" \
  -e "s/<AttributeEdit /<InlineEditRoot /g" \
  -e "s/<\/AttributeEdit>/<\/InlineEditRoot>/g" \
  -e "s/useAttributeEdit/useInlineEdit/g" \
  -e "s/AttributeEditPreview/InlineEditPreview/g" \
  -e "s/AttributeEditControl/InlineEditControl/g" \
  -e "s/AttributeEditInput/InlineEditInput/g" \
  -e "s/AttributeEditNumber/InlineEditNumber/g" \
  -e "s/AttributeEditTextarea/InlineEditTextarea/g" \
  -e "s/AttributeEditError/InlineEditError/g" \
  Attribute.stories.tsx
```

Also delete `AttributeEdit`-referencing entries from the `subcomponents` object in the story `meta` if present (check lines 59–80).

- [ ] **Step 6: Re-point the renamed integration test**

In `Attribute/AttributeInlineEdit.integration.test.tsx`, replace the single import block:

```typescript
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  InlineEdit,
  InlineEditControl,
  InlineEditError,
  InlineEditInput,
  InlineEditPreview,
} from '../InlineEdit';
import { Attribute, AttributeLabel, AttributeValue } from './index';
```

then run the symbol/testid sed over it:

```bash
sed -i '' \
  -e "s/AttributeEdit/InlineEdit/g" \
  -e "s/--edit-preview/--preview/g" \
  -e "s/--edit-input/--input/g" \
  Attribute/AttributeInlineEdit.integration.test.tsx
```

(The describe title becomes `InlineEdit integration` via the same substitution; that is fine — Task 9 extends this file.)

- [ ] **Step 7: Verify**

```bash
cd /Users/ilyapashkov/Projects/wallarm/wallarm-design-system
pnpm typecheck
pnpm -C packages/design-system exec vitest run src/components/InlineEdit src/components/Attribute
```

Expected: typecheck PASS; all moved/renamed unit tests PASS (they are behavior-identical, only names changed). Also verify nothing references the old names:

```bash
grep -rn "AttributeEdit\|attribute-edit\|useAttributeEdit" packages/design-system/src --include="*.ts" --include="*.tsx" | grep -v node_modules
```

Expected: no output.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor(inline-edit): extract AttributeEdit family into standalone InlineEdit (WDS-143)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Package root exports

**Files:**
- Modify: `packages/design-system/src/index.ts`

**Interfaces:**
- Consumes: `components/InlineEdit/index.ts` from Task 1; existing Select block at ~`index.ts:492–509`.
- Produces: package-root exports for the whole family + `SelectDataItem` + `createListCollection`. Later tasks (5–7) extend `InlineEdit/index.ts`; the root block added here re-exports them automatically only if listed — Tasks 5–7 each add their root-export lines.

- [ ] **Step 1: Add the InlineEdit export block**

In `packages/design-system/src/index.ts`, components are alphabetical; insert between the `HttpMethod` block and the `Input` block:

```typescript
export {
  InlineEdit,
  InlineEditControl,
  type InlineEditControlProps,
  InlineEditError,
  type InlineEditErrorProps,
  InlineEditInput,
  type InlineEditInputProps,
  InlineEditNumber,
  type InlineEditNumberProps,
  InlineEditPreview,
  type InlineEditPreviewProps,
  type InlineEditProps,
  InlineEditTextarea,
  type InlineEditTextareaProps,
  type InlineEditActivationMode,
  type InlineEditContextValue,
  type InlineEditStatus,
  type InlineEditSubmitMode,
  useInlineEdit,
} from './components/InlineEdit';
```

- [ ] **Step 2: Export `SelectDataItem` + `createListCollection` from the Select block**

In the existing Select export block (starts `export { Select, SelectButton, ...`), add two entries alphabetically:

```typescript
  createListCollection,
  type SelectDataItem,
```

(Both are already exported from `components/Select/index.ts:1,19` — this only surfaces them at the root.)

- [ ] **Step 3: Fix the stale header comment**

Replace the note in the file header (currently lines 7–10) that claims `DateValue` is intentionally not re-exported:

```typescript
 * Note: the `DateValue` union re-exported below comes from `Calendar`
 * (`./components/Calendar`); the concrete classes (`CalendarDate`,
 * `CalendarDateTime`, `ZonedDateTime`, `Time`) come from
 * `@internationalized/date`.
```

- [ ] **Step 4: Verify + commit**

```bash
pnpm typecheck && pnpm -C packages/design-system exec vitest run src/components/InlineEdit
git add packages/design-system/src/index.ts
git commit -m "feat(inline-edit): export InlineEdit family and SelectDataItem from package root (WDS-143)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Styling seam — neutral preview, host-owned integration CSS

**Files:**
- Create: `packages/design-system/src/components/InlineEdit/classes.ts`
- Modify: `InlineEdit/InlineEditPreview.tsx`, `Attribute/AttributeValue.tsx`, `Attribute/Attribute.stories.tsx` (drop `overflow-visible` hacks)
- Test: `Attribute/AttributeInlineEdit.integration.test.tsx` (seam assertions), `InlineEdit/InlineEditPreview.test.tsx` (no `-my-4`)

**Interfaces:**
- Consumes: `InlineEditPreview` from Task 1; `data-slot='inline-edit-preview'` / `data-slot='inline-edit'` strings.
- Produces: `inlineEditPreviewVariants({ multiline, activatable, invalid })` in `classes.ts` (not exported from package root); `AttributeValue` carrying the two seam classes.

- [ ] **Step 1: Write the failing tests**

Append to `Attribute/AttributeInlineEdit.integration.test.tsx`:

```typescript
it('AttributeValue carries the InlineEdit seam classes', () => {
  render(<Example onCommit={() => {}} />);
  const value = screen.getByTestId('attr--value');
  expect(value.className).toContain('[&_[data-slot=inline-edit-preview]]:-my-4');
  expect(value.className).toContain('has-[[data-slot=inline-edit]]:overflow-visible');
});
```

Append to `InlineEdit/InlineEditPreview.test.tsx` (inside the existing describe, using its render helpers — the preview must render inside an `InlineEdit` root as the other tests there do):

```typescript
it('is neutral standalone — no negative row margin', () => {
  render(
    <InlineEdit defaultValue='v' data-testid='ie'>
      <InlineEditPreview>v</InlineEditPreview>
    </InlineEdit>,
  );
  expect(screen.getByTestId('ie--preview').className).not.toContain('-my-4');
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm -C packages/design-system exec vitest run src/components/Attribute/AttributeInlineEdit.integration.test.tsx src/components/InlineEdit/InlineEditPreview.test.tsx
```

Expected: the two new tests FAIL (seam classes absent / `-my-4` present).

- [ ] **Step 3: Create `InlineEdit/classes.ts`**

```typescript
import { cva } from 'class-variance-authority';

export const inlineEditPreviewVariants = cva(
  'group flex w-full min-w-0 gap-4 rounded-8 border border-transparent px-6 py-4 transition-colors',
  {
    variants: {
      // Multi-line values align the trigger icon to the top; single-line centers it.
      multiline: {
        true: 'items-start',
        false: 'items-center',
      },
      activatable: {
        true: '',
        false: '',
      },
      invalid: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      // Editable, no error: neutral hover background + primary focus ring.
      {
        activatable: true,
        invalid: false,
        className:
          'cursor-pointer hover:bg-states-primary-hover active:bg-states-primary-pressed focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
      },
      // Editable with an error: hover/focus reveal the destructive text-box border + ring.
      {
        activatable: true,
        invalid: true,
        className:
          'cursor-pointer bg-component-input-bg hover:border-border-strong-danger hover:ring-3 hover:ring-focus-destructive focus-visible:border-border-strong-danger focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-destructive',
      },
    ],
    defaultVariants: {
      multiline: false,
      activatable: false,
      invalid: false,
    },
  },
);
```

- [ ] **Step 4: Use the variants in `InlineEditPreview.tsx`**

Replace the root `className={cn(...)}` expression (the block that today starts with `'group -my-4 flex w-full min-w-0 gap-4 …'` and the two `activatable &&` conditions) with:

```typescript
      className={cn(
        inlineEditPreviewVariants({
          multiline: Boolean(lineClamp),
          activatable,
          invalid: activatable && invalid,
        }),
        className,
      )}
```

and add the import: `import { inlineEditPreviewVariants } from './classes';`. Delete the now-unused conditional class strings. Note the `-my-4` is gone — that is the point.

- [ ] **Step 5: Add the seam classes to `AttributeValue.tsx`**

Replace the `className={cn(...)}` in `Attribute/AttributeValue.tsx`:

```typescript
      className={cn(
        'flex items-center',
        // InlineEdit hosting seam, keyed on the guest's data-slot contract
        // (see components/InlineEdit). The preview's own px-6/py-4 hover box
        // is neutral; the host cancels its row padding so the box fills the
        // row without changing row height. If the preview's padding changes,
        // this constant must follow. Consumer overrides of the margin must
        // target AttributeValue (or use `!` importance on the preview) —
        // this rule is parent-scoped and outweighs plain utilities.
        '[&_[data-slot=inline-edit-preview]]:-my-4',
        // Un-clip non-portaled editor dropdowns (horizontal `truncate` sets
        // overflow-hidden). :has() only matches while an InlineEdit is hosted.
        'has-[[data-slot=inline-edit]]:overflow-visible',
        isHorizontal ? 'flex-1 min-w-0 py-4 truncate' : 'pt-4 min-h-[28px]',
        className,
      )}
```

- [ ] **Step 6: Drop the story-level `overflow-visible` hack**

```bash
cd /Users/ilyapashkov/Projects/wallarm/wallarm-design-system/packages/design-system/src/components/Attribute
sed -i '' "s/<AttributeValue className='overflow-visible'>/<AttributeValue>/g" Attribute.stories.tsx
```

Also delete the now-obsolete two-line comment above the time row (`{/* overflow-visible so the (non-portaled, absolute) time dropdown is not clipped … */}`).

- [ ] **Step 7: Run tests to verify they pass**

```bash
pnpm -C packages/design-system exec vitest run src/components/InlineEdit src/components/Attribute && pnpm typecheck
```

Expected: PASS. Manually spot-check in Storybook (`pnpm -C packages/design-system storybook` or the repo's storybook script): the Attribute inline-edit gallery must look pixel-identical (hover box fills the row; time dropdown not clipped in horizontal).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(inline-edit): neutral preview styling with Attribute-owned hosting seam (WDS-143)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Submit-mode override + Control submitMode prop + render-prop children

**Files:**
- Modify: `InlineEdit/InlineEditContext.ts`, `InlineEdit/InlineEdit.tsx`, `InlineEdit/InlineEditControl.tsx`, `InlineEdit/index.ts`, `packages/design-system/src/index.ts`
- Test: `InlineEdit/InlineEditControl.test.tsx` (extend), `InlineEdit/InlineEdit.test.tsx` (extend)

**Interfaces:**
- Consumes: `InlineEditContextValue`, `InlineEdit` root state from Task 1.
- Produces (used by Tasks 5–7):
  - `useInlineEditSubmitMode(mode: InlineEditSubmitMode): void` — registers while mounted (layout effect, token-safe, last-wins).
  - `InlineEditContextValue.registerSubmitModeOverride: (mode: InlineEditSubmitMode) => () => void`.
  - `InlineEditControlProps.submitMode?: InlineEditSubmitMode` — highest precedence.
  - `InlineEditControlProps.children?: ReactNode | ((ctx: InlineEditContextValue) => ReactNode)`.
  - Precedence: **Control prop > editor registration > root prop**.

- [ ] **Step 1: Write the failing tests**

Append to `InlineEdit/InlineEditControl.test.tsx` (reuse its existing render pattern — Control must render inside `InlineEdit` with `defaultEdit` so it is visible):

```typescript
function ModeProbe() {
  const { submitMode } = useInlineEdit();
  return <span data-testid='mode'>{submitMode}</span>;
}

function RegisteringEditor({ mode }: { mode: InlineEditSubmitMode }) {
  useInlineEditSubmitMode(mode);
  return <ModeProbe />;
}

describe('submit-mode override', () => {
  it('editor registration overrides the root prop', () => {
    render(
      <InlineEdit defaultValue='v' defaultEdit submitMode='both'>
        <InlineEditControl>
          <RegisteringEditor mode='none' />
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('none');
  });

  it('registration survives StrictMode double-invoke', () => {
    render(
      <StrictMode>
        <InlineEdit defaultValue='v' defaultEdit submitMode='both'>
          <InlineEditControl>
            <RegisteringEditor mode='none' />
          </InlineEditControl>
        </InlineEdit>
      </StrictMode>,
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('none');
  });

  it('unregisters token-safely on unmount (root prop applies again)', () => {
    function Toggle() {
      const [on, setOn] = useState(true);
      return (
        <InlineEdit defaultValue='v' defaultEdit submitMode='both'>
          <button type='button' data-testid='toggle' onClick={() => setOn(false)} />
          <InlineEditControl>{on ? <RegisteringEditor mode='none' /> : <ModeProbe />}</InlineEditControl>
        </InlineEdit>
      );
    }
    render(<Toggle />);
    expect(screen.getByTestId('mode')).toHaveTextContent('none');
    fireEvent.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('mode')).toHaveTextContent('both');
  });

  it('Control submitMode prop beats editor registration', async () => {
    const onCommit = vi.fn();
    render(
      <InlineEdit
        defaultValue='v'
        defaultEdit
        submitMode='both'
        onValueCommit={onCommit}
        data-testid='ie'
      >
        <InlineEditControl submitMode='none'>
          <RegisteringEditor mode='blur' />
          <InlineEditInput />
        </InlineEditControl>
      </InlineEdit>,
    );
    // Blur out of the control: with 'none' in force nothing commits or cancels.
    fireEvent.blur(screen.getByTestId('ie--input'), { relatedTarget: document.body });
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByTestId('ie--input')).toBeInTheDocument();
  });

  it('render-prop children receive the context and render only while editing', () => {
    render(
      <InlineEdit defaultValue='v' defaultEdit>
        <InlineEditControl>
          {ctx => <span data-testid='rp'>{String(ctx.value)}</span>}
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(screen.getByTestId('rp')).toHaveTextContent('v');
  });

  it('keeps cancel gated on defaultPrevented for Escape (popover guard is load-bearing)', () => {
    const onEditChange = vi.fn();
    render(
      <InlineEdit defaultValue='v' defaultEdit onEditChange={onEditChange}>
        <InlineEditControl
          onKeyDown={e => {
            e.preventDefault(); // simulates zag's dismissable-layer preventDefault
          }}
        >
          <InlineEditInput />
        </InlineEditControl>
      </InlineEdit>,
    );
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
    expect(onEditChange).not.toHaveBeenCalledWith(false);
  });
});
```

Add the imports these tests need at the top of the file: `StrictMode`, `useState` from `react`; `fireEvent` from `@testing-library/react`; `useInlineEditSubmitMode`, `useInlineEdit`, type `InlineEditSubmitMode`, `InlineEditInput` from the local modules (match the file's existing import style).

- [ ] **Step 2: Run to verify failure**

```bash
pnpm -C packages/design-system exec vitest run src/components/InlineEdit/InlineEditControl.test.tsx
```

Expected: FAIL — `useInlineEditSubmitMode` is not exported; `registerSubmitModeOverride` missing from context.

- [ ] **Step 3: Extend `InlineEditContext.ts`**

Add to `InlineEditContextValue`:

```typescript
  /**
   * Registers a submit-mode override while an editor is mounted (last
   * registration wins; returns an unregister cleanup). Prefer the
   * `useInlineEditSubmitMode` hook. Popover editors use this so consumers
   * never have to pair `submitMode='none'` on the root by hand.
   */
  registerSubmitModeOverride: (mode: InlineEditSubmitMode) => () => void;
```

Add the hook (plus `useLayoutEffect` import from `react`):

```typescript
/**
 * Declares the submit mode an editor needs while it is mounted (e.g. a
 * popover editor commits on close, so blur/enter handling must be 'none').
 * Registered via layout effect so the override is committed before paint and
 * before any browser event can observe the consumer-provided mode.
 */
export function useInlineEditSubmitMode(mode: InlineEditSubmitMode): void {
  const { registerSubmitModeOverride } = useInlineEdit();
  useLayoutEffect(() => registerSubmitModeOverride(mode), [mode, registerSubmitModeOverride]);
}
```

- [ ] **Step 4: Implement the override state in `InlineEdit.tsx`**

At module scope (above the component):

```typescript
interface SubmitModeOverride {
  token: symbol;
  mode: InlineEditSubmitMode;
}
```

Inside the component, next to the other state:

```typescript
  const [submitModeOverride, setSubmitModeOverride] = useState<SubmitModeOverride | null>(null);
  const overrideRef = useRef<SubmitModeOverride | null>(null);
  overrideRef.current = submitModeOverride;

  const registerSubmitModeOverride = useCallback((mode: InlineEditSubmitMode) => {
    const prev = overrideRef.current;
    if (process.env.NODE_ENV !== 'production' && prev && prev.mode !== mode) {
      console.warn(
        `InlineEdit: an editor registered submitMode='${mode}' while another editor's '${prev.mode}' override is active. Last registration wins.`,
      );
    }
    const entry: SubmitModeOverride = { token: Symbol('inline-edit-submit-mode'), mode };
    setSubmitModeOverride(entry);
    return () => {
      setSubmitModeOverride(current => (current?.token === entry.token ? null : current));
    };
  }, []);
```

In the `contextValue` memo, change `submitMode` to the effective value and add the register fn (and both to the dependency array):

```typescript
      submitMode: submitModeOverride?.mode ?? submitMode,
      registerSubmitModeOverride,
```

- [ ] **Step 5: Extend `InlineEditControl.tsx`**

Update the props interface and rendering:

```typescript
export interface InlineEditControlProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  ref?: Ref<HTMLDivElement>;
  /**
   * Explicit render-time submit mode for this editor session. Highest
   * precedence (beats editor registrations and the root prop) — the escape
   * hatch for custom editors that cannot call useInlineEditSubmitMode.
   */
  submitMode?: InlineEditSubmitMode;
  /** Function children receive the inline-edit context (render-prop). */
  children?: ReactNode | ((ctx: InlineEditContextValue) => ReactNode);
}
```

In the component body, keep consuming the context as one object so the render-prop can receive it:

```typescript
  const ctx = useInlineEdit();
  const { editing, selectOnFocus, submit, cancel } = ctx;
  const submitMode = submitModeProp ?? ctx.submitMode;
```

(destructure `submitMode: submitModeProp` from props). Replace `{children}` with:

```typescript
      {typeof children === 'function' ? children(ctx) : children}
```

`import type { InlineEditContextValue, InlineEditSubmitMode }` from `./InlineEditContext`.

- [ ] **Step 6: Export the hook**

`InlineEdit/index.ts` — extend the context export line with `useInlineEditSubmitMode`. Root `src/index.ts` — add `useInlineEditSubmitMode` to the InlineEdit block.

- [ ] **Step 7: Run tests, then full folder + typecheck**

```bash
pnpm -C packages/design-system exec vitest run src/components/InlineEdit && pnpm typecheck
```

Expected: PASS, including the pre-existing Control tests (blur/enter/escape behavior unchanged when nothing registers).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(inline-edit): submit-mode override, Control submitMode prop and render-prop children (WDS-143)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: InlineEditSelect

**Files:**
- Create: `InlineEdit/InlineEditSelect.tsx`, `InlineEdit/InlineEditSelect.test.tsx`
- Modify: `InlineEdit/index.ts`, `packages/design-system/src/index.ts`

**Interfaces:**
- Consumes: `useInlineEdit<string[] | string>()`, `useInlineEditSubmitMode('none')` (Task 4); DS `Select` family (`Select`, `SelectButton`, `SelectInput`, `SelectPositioner`, `SelectContent`, `SelectOption`, `SelectOptionText`, `SelectOptionIndicator`, `type SelectDataItem` from `../Select`; `createListCollection` from `../Select`).
- Produces: `InlineEditSelect`, `type InlineEditSelectProps` (discriminated union on `multiple`).

- [ ] **Step 1: Write the failing tests**

`InlineEdit/InlineEditSelect.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InlineEdit } from './InlineEdit';
import { InlineEditControl } from './InlineEditControl';
import { InlineEditSelect } from './InlineEditSelect';

const items = [
  { label: 'Admin', value: 'admin' },
  { label: 'Editor', value: 'editor' },
];

function Harness({
  onCommit,
  value = ['editor'],
  multiple = false,
  analyticsId,
}: {
  onCommit?: (v: unknown) => void;
  value?: string[] | string;
  multiple?: boolean;
  analyticsId?: string;
}) {
  return (
    <InlineEdit defaultValue={value} defaultEdit onValueCommit={onCommit} data-testid='ie'>
      <InlineEditControl>
        {multiple ? (
          <InlineEditSelect items={items} multiple data-analytics-id={analyticsId} />
        ) : (
          <InlineEditSelect items={items} data-analytics-id={analyticsId} />
        )}
      </InlineEditControl>
    </InlineEdit>
  );
}

describe('InlineEditSelect', () => {
  it('opens on mount and shows options from items', async () => {
    render(<Harness />);
    expect(await screen.findByText('Admin')).toBeInTheDocument();
  });

  it('picking an option (single) commits on close', async () => {
    const onCommit = vi.fn();
    render(<Harness onCommit={onCommit} />);
    await userEvent.click(await screen.findByText('Admin'));
    // Single select closes on selection → onOpenChange(open:false) → submit()
    expect(onCommit).toHaveBeenCalledWith(['admin']);
  });

  it('normalizes a plain string committed value into an array draft', async () => {
    render(<Harness value='editor' />);
    // Draft is normalized to ['editor'] — Editor option is marked selected.
    const option = await screen.findByText('Editor');
    expect(option.closest('[data-state]')).toHaveAttribute('data-state', 'checked');
  });

  it('forwards data-analytics-id to the real trigger', async () => {
    render(<Harness analyticsId='role-edit' />);
    expect(document.querySelector('[data-analytics-id="role-edit"]')?.tagName).toBe('BUTTON');
  });

  it('children replace the default composition (per-option analytics path)', async () => {
    render(
      <InlineEdit defaultValue={['admin']} defaultEdit data-testid='ie'>
        <InlineEditControl>
          <InlineEditSelect items={items}>
            <span data-testid='custom-composition' />
          </InlineEditSelect>
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(screen.getByTestId('custom-composition')).toBeInTheDocument();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('derives the shared input testId slot', () => {
    render(<Harness />);
    expect(screen.getByTestId('ie--input')).toBeInTheDocument();
  });
});
```

(Adjust the `data-state` assertion to whatever attribute the DS `SelectOption` actually renders for a selected item — check `Select.test.tsx` for the established assertion style and reuse it.)

- [ ] **Step 2: Run to verify failure**

```bash
pnpm -C packages/design-system exec vitest run src/components/InlineEdit/InlineEditSelect.test.tsx
```

Expected: FAIL — module `./InlineEditSelect` does not exist.

- [ ] **Step 3: Implement `InlineEditSelect.tsx`**

```typescript
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { useMemo } from 'react';
import { useTestId } from '../../utils/testId';
import {
  createListCollection,
  Select,
  SelectButton,
  SelectContent,
  type SelectDataItem,
  SelectInput,
  SelectOption,
  SelectOptionIndicator,
  SelectOptionText,
  SelectPositioner,
} from '../Select';
import { useInlineEdit, useInlineEditSubmitMode } from './InlineEditContext';

interface InlineEditSelectBaseProps {
  /** Options; the collection is built internally (PaginationPageSize precedent). */
  items: SelectDataItem[];
  /** Full custom composition — replaces the default trigger/options entirely. */
  children?: ReactNode;
  'data-testid'?: string;
}

/** Single select: rest props forward to the real `<button>` trigger. */
export interface InlineEditSelectSingleProps
  extends InlineEditSelectBaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'value'> {
  multiple?: false;
}

/** Multiple select: rest props forward to the trigger `<div>`. */
export interface InlineEditSelectMultipleProps
  extends InlineEditSelectBaseProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  multiple: true;
}

export type InlineEditSelectProps = InlineEditSelectSingleProps | InlineEditSelectMultipleProps;

export const InlineEditSelect = ({
  items,
  multiple = false,
  children,
  'data-testid': testIdProp,
  ...rest
}: InlineEditSelectProps) => {
  const testId = useTestId('input', testIdProp);
  const { value, setValue, submit } = useInlineEdit<string[] | string>();
  useInlineEditSubmitMode('none');

  const collection = useMemo(() => createListCollection({ items }), [items]);
  // A plain-string committed value is a natural single-select shape —
  // normalize instead of silently blanking it.
  const selected = Array.isArray(value) ? value : typeof value === 'string' && value !== '' ? [value] : [];

  return (
    <Select
      defaultOpen
      collection={collection}
      multiple={multiple}
      value={selected}
      onValueChange={details => setValue(details.value)}
      onOpenChange={details => {
        if (!details.open) submit();
      }}
    >
      {children ?? (
        <>
          {multiple ? (
            <SelectInput data-testid={testId} {...(rest as HTMLAttributes<HTMLDivElement>)} />
          ) : (
            <SelectButton
              data-testid={testId}
              {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
            />
          )}
          <SelectPositioner>
            <SelectContent>
              {items.map(item => (
                <SelectOption key={item.value} item={item}>
                  <SelectOptionText>{item.label}</SelectOptionText>
                  <SelectOptionIndicator />
                </SelectOption>
              ))}
            </SelectContent>
          </SelectPositioner>
        </>
      )}
    </Select>
  );
};

InlineEditSelect.displayName = 'InlineEditSelect';
```

Adjust `SelectButton`/`SelectInput` prop spreads to their actual prop types if the casts fight the compiler (check their interfaces — `SelectButton` is `ButtonProps`-based, `SelectInput` is div-based).

- [ ] **Step 4: Export**

`InlineEdit/index.ts`: `export { InlineEditSelect, type InlineEditSelectProps } from './InlineEditSelect';` — and add `InlineEditSelect` + `type InlineEditSelectProps` to the root `src/index.ts` block.

- [ ] **Step 5: Run tests + typecheck, commit**

```bash
pnpm -C packages/design-system exec vitest run src/components/InlineEdit && pnpm typecheck
git add -A
git commit -m "feat(inline-edit): built-in InlineEditSelect editor (WDS-143)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: InlineEditDate

**Files:**
- Create: `InlineEdit/InlineEditDate.tsx`, `InlineEdit/InlineEditDate.test.tsx`
- Modify: `InlineEdit/index.ts`, `packages/design-system/src/index.ts`, `InlineEdit/ANALYTICS_GAPS.md`

**Interfaces:**
- Consumes: `useInlineEdit<DateValue | null>()`, `useInlineEditSubmitMode('none')`; DS `Calendar` family (`Calendar` — aliased, `CalendarTrigger`, `CalendarContent`, `CalendarBody`, `CalendarGrids`, `CalendarInputHeader`, `type DateValue` from `../Calendar`), `DateInput` from `../DateInput`.
- Produces: `InlineEditDate`, `type InlineEditDateProps { showTime?: boolean }`.

- [ ] **Step 1: Write the failing tests**

`InlineEdit/InlineEditDate.test.tsx`:

```typescript
import { CalendarDate } from '@internationalized/date';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InlineEdit } from './InlineEdit';
import { InlineEditControl } from './InlineEditControl';
import { InlineEditDate } from './InlineEditDate';

function Harness({ onCommit, showTime = false }: { onCommit?: (v: unknown) => void; showTime?: boolean }) {
  return (
    <InlineEdit
      defaultValue={new CalendarDate(2026, 6, 15)}
      defaultEdit
      onValueCommit={onCommit}
      data-testid='ie'
    >
      <InlineEditControl>
        <InlineEditDate showTime={showTime} />
      </InlineEditControl>
    </InlineEdit>
  );
}

describe('InlineEditDate', () => {
  it('renders the calendar open with the segmented trigger input pre-filled', async () => {
    render(<Harness />);
    // Portaled content is present (defaultOpen) — grid day cells exist.
    expect(document.querySelector('[data-scope="date-picker"][data-part="content"]')).toBeTruthy();
    expect(screen.getByTestId('ie--input')).toBeInTheDocument();
  });

  it('showTime mode renders the time-aware header', () => {
    render(<Harness showTime />);
    expect(document.querySelector('[data-scope="date-picker"][data-part="content"]')).toBeTruthy();
    // CalendarInputHeader renders time segments in the popover header — assert
    // using the same query Calendar.test.tsx uses for the header.
  });

  it('derives the shared input testId slot on the DateInput wrapper', () => {
    render(<Harness />);
    expect(screen.getByTestId('ie--input')).toBeInTheDocument();
  });
});
```

(Model the open-popover and header assertions on `Calendar/Calendar.test.tsx` — it already renders `defaultOpen` and queries portaled content.)

- [ ] **Step 2: Run to verify failure**

```bash
pnpm -C packages/design-system exec vitest run src/components/InlineEdit/InlineEditDate.test.tsx
```

Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `InlineEditDate.tsx`**

```typescript
import type { FC } from 'react';
import type { CalendarDateTime } from '@internationalized/date';
import { useTestId } from '../../utils/testId';
import {
  CalendarBody,
  CalendarContent,
  CalendarGrids,
  CalendarInputHeader,
  // Aliased: the DS also exports a `Calendar` icon; same trick as the stories.
  Calendar as CalendarRoot,
  CalendarTrigger,
  type DateValue,
} from '../Calendar';
import { DateInput } from '../DateInput';
import { useInlineEdit, useInlineEditSubmitMode } from './InlineEditContext';

export interface InlineEditDateProps {
  /**
   * Date+time mode: minute-granularity segmented trigger, time-aware popover
   * header, popover stays open on day picks (mirrors Calendar `showTime`).
   */
  showTime?: boolean;
  'data-testid'?: string;
}

export const InlineEditDate: FC<InlineEditDateProps> = ({
  showTime = false,
  'data-testid': testIdProp,
}) => {
  const testId = useTestId('input', testIdProp);
  const { value, setValue, submit } = useInlineEdit<DateValue | null>();
  useInlineEditSubmitMode('none');

  return (
    <CalendarRoot
      type='single'
      defaultOpen
      showTime={showTime}
      closeOnSelect={!showTime}
      value={value ? [value] : []}
      // Calendar's contract is DateValue[]; in showTime mode `useCalendarTime`
      // promotes grid picks to CalendarDateTime — the cast reflects that.
      onChange={next =>
        setValue(showTime ? ((next[0] as CalendarDateTime | undefined) ?? null) : (next[0] ?? null))
      }
      onOpenChange={open => {
        if (!open) submit();
      }}
    >
      <CalendarTrigger>
        {/* Pass the value straight through — an `instanceof` gate drops values
            produced by the Ark calendar (different @internationalized/date
            copy), showing the placeholder instead. */}
        {showTime ? (
          <DateInput
            data-testid={testId}
            value={value ?? null}
            onChange={v => setValue(v)}
            granularity='minute'
            showIcon={false}
          />
        ) : (
          <DateInput
            data-testid={testId}
            value={value ?? null}
            onChange={v => setValue(v)}
            granularity='day'
            showIcon={false}
          />
        )}
      </CalendarTrigger>
      <CalendarContent>
        <CalendarBody>
          {showTime ? <CalendarInputHeader /> : null}
          <CalendarGrids />
        </CalendarBody>
      </CalendarContent>
    </CalendarRoot>
  );
};

InlineEditDate.displayName = 'InlineEditDate';
```

Two explicit `DateInput` branches keep the `granularity` discriminated union honest (`'day'` forbids time props). If `DateInput`'s react-aria `DateValue` and Calendar's Ark `DateValue` disagree structurally at a call site, cast at that boundary with a comment referencing the interop note.

- [ ] **Step 4: Add the pre-committed analytics-gap entry**

Append to `InlineEdit/ANALYTICS_GAPS.md`:

```markdown
## `InlineEditDate` → DateInput wrapper, not the focusable segments

- **What:** consumer `data-*` / `aria-*` spread lands on the `DateInput`
  wrapper `<div>`, not the focusable date segments (mirror of the
  `InlineEditNumber` entry above).
- **Impact:** Low — document-level click analytics resolve via
  `closest('[data-analytics-id]')`.
- **Fix belongs in:** `components/DateInput` (forward consumer attributes to
  the segment group), out of scope here.
- **Tested:** `InlineEditDate.test.tsx` asserts the wrapper placement.
```

- [ ] **Step 5: Export, run, commit**

Add exports to `InlineEdit/index.ts` and root `src/index.ts` (`InlineEditDate`, `type InlineEditDateProps`).

```bash
pnpm -C packages/design-system exec vitest run src/components/InlineEdit && pnpm typecheck
git add -A
git commit -m "feat(inline-edit): built-in InlineEditDate editor with showTime mode (WDS-143)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: InlineEditTime

**Files:**
- Create: `InlineEdit/InlineEditTime.tsx`, `InlineEdit/InlineEditTime.test.tsx`
- Modify: `InlineEdit/index.ts`, `packages/design-system/src/index.ts`, `InlineEdit/ANALYTICS_GAPS.md`

**Interfaces:**
- Consumes: `useInlineEdit<TimeValue | null>()`, `useInlineEditSubmitMode('blur')`; `TimeInput` from `../TimeInput` (`TimeValue` type from `@react-aria/datepicker`).
- Produces: `InlineEditTime`, `type InlineEditTimeProps`.

- [ ] **Step 1: Write the failing tests**

`InlineEdit/InlineEditTime.test.tsx`:

```typescript
import { Time } from '@internationalized/date';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InlineEdit } from './InlineEdit';
import { InlineEditControl } from './InlineEditControl';
import { InlineEditTime } from './InlineEditTime';

function Harness() {
  return (
    <InlineEdit defaultValue={new Time(14, 30)} defaultEdit data-testid='ie'>
      <InlineEditControl>
        <InlineEditTime />
      </InlineEditControl>
    </InlineEdit>
  );
}

describe('InlineEditTime', () => {
  it('renders the time input with the shared input testId slot', () => {
    render(<Harness />);
    expect(screen.getByTestId('ie--input')).toBeInTheDocument();
  });

  it('registers the blur submit mode', () => {
    function ModeProbe() {
      const { submitMode } = useInlineEdit();
      return <span data-testid='mode'>{submitMode}</span>;
    }
    render(
      <InlineEdit defaultValue={new Time(14, 30)} defaultEdit submitMode='both' data-testid='ie'>
        <InlineEditControl>
          <InlineEditTime />
          <ModeProbe />
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('blur');
  });
});
```

(add `useInlineEdit` to the imports from `./InlineEditContext`).

- [ ] **Step 2: Run to verify failure, then implement `InlineEditTime.tsx`**

```typescript
import type { ComponentProps, FC } from 'react';
import type { TimeValue } from '@react-aria/datepicker';
import { useTestId } from '../../utils/testId';
import { TimeInput } from '../TimeInput';
import { useInlineEdit, useInlineEditSubmitMode } from './InlineEditContext';

type TimeInputProps = ComponentProps<typeof TimeInput>;

export type InlineEditTimeProps = Omit<TimeInputProps, 'value' | 'onChange'>;

/**
 * Commits on blur — time pickers have no discrete "selection complete" event.
 * Safe because the time dropdown is rendered inline (absolute, non-portaled)
 * and its rows preventDefault() on mousedown, so focus never leaves the
 * control subtree; a future portaled TimeDropdown would need re-evaluation.
 * Clipping ancestors need `overflow-visible` (automatic inside
 * AttributeValue; standalone hosts own it).
 */
export const InlineEditTime: FC<InlineEditTimeProps> = ({
  'data-testid': testIdProp,
  granularity = 'minute',
  showTimeDropdown = true,
  showIcon = false,
  ...props
}) => {
  const testId = useTestId('input', testIdProp);
  // Pass the value straight through (TimeValue union) — no `instanceof Time`
  // narrowing; it would rely on npm dedup of @internationalized/date.
  const { value, setValue } = useInlineEdit<TimeValue | null>();
  useInlineEditSubmitMode('blur');

  return (
    <TimeInput
      {...props}
      data-testid={testId}
      granularity={granularity}
      showTimeDropdown={showTimeDropdown}
      showIcon={showIcon}
      value={value ?? null}
      onChange={v => setValue(v)}
    />
  );
};

InlineEditTime.displayName = 'InlineEditTime';
```

If `TimeInput`'s granularity union rejects the `'minute'` default in the destructuring, set the defaults at the JSX spread site instead.

- [ ] **Step 3: Add the analytics-gap entry**

Append to `InlineEdit/ANALYTICS_GAPS.md`:

```markdown
## `InlineEditTime` → TimeInput wrapper + closed dropdown rows

- **What:** consumer attributes land on the `TimeInput` wrapper `<div>` (same
  shape as the DateInput entry). Additionally the time-dropdown option rows
  are a closed target — no consumer attribute can reach them.
- **Impact:** Low — click analytics resolve via `closest()`; value-level
  analytics belong on `onValueCommit`.
- **Fix belongs in:** `components/TimeInput` / `TemporalCore`, out of scope.
- **Tested:** `InlineEditTime.test.tsx` asserts the wrapper placement.
```

- [ ] **Step 4: Export, run, commit**

Add exports to both barrels (`InlineEditTime`, `type InlineEditTimeProps`).

```bash
pnpm -C packages/design-system exec vitest run src/components/InlineEdit && pnpm typecheck
git add -A
git commit -m "feat(inline-edit): built-in InlineEditTime editor (WDS-143)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: Stories — standalone InlineEdit + slim Attribute integration

**Files:**
- Create: `InlineEdit/InlineEdit.stories.tsx`
- Modify: `Attribute/Attribute.stories.tsx` (delete the inline-edit block; add two integration stories)

**Interfaces:**
- Consumes: everything exported from `components/InlineEdit` (Tasks 1–7).
- Produces: Storybook title `Data Display/InlineEdit` → e2e component id `data-display-inlineedit`; story exports `Gallery`, `States`, `Async`, `NonEditable`, `CustomEditor`; Attribute story exports `WithInlineEdit`, `HorizontalWithInlineEdit`. Task 10's e2e depends on these exact names.

- [ ] **Step 1: Create `InlineEdit/InlineEdit.stories.tsx`**

Structure (write the full file; the editor rows move from the old gallery, switching to built-ins and **keeping the row `data-testid` values** `text`, `number`, `textarea`, `select`, `multi-select`, `tags`, `date`, `time`, `datetime` — now passed to `InlineEdit` directly since there is no Attribute provider):

```tsx
import { useState } from 'react';
import { format } from 'date-fns';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import type { TimeValue } from '@react-aria/datepicker';
import { Calendar, ChevronDown, Clock } from '../../icons';
import type { DateValue } from '../../index';
import { CalendarDate, CalendarDateTime, Time } from '../../index';
import { DateFormatProvider } from '../DateFormatProvider';
import { Input } from '../Input';
import type { SelectDataItem } from '../Select';
import { Tag } from '../Tag';
import { Text } from '../Text';
import { InlineEdit } from './InlineEdit';
import { InlineEditControl } from './InlineEditControl';
import { InlineEditDate } from './InlineEditDate';
import { InlineEditError } from './InlineEditError';
import { InlineEditInput } from './InlineEditInput';
import { InlineEditNumber } from './InlineEditNumber';
import { InlineEditPreview } from './InlineEditPreview';
import { InlineEditSelect } from './InlineEditSelect';
import { InlineEditTextarea } from './InlineEditTextarea';
import { InlineEditTime } from './InlineEditTime';

const meta = {
  title: 'Data Display/InlineEdit',
  component: InlineEdit,
  subcomponents: {
    InlineEditPreview,
    InlineEditControl,
    InlineEditError,
    InlineEditInput,
    InlineEditNumber,
    InlineEditTextarea,
    InlineEditSelect,
    InlineEditDate,
    InlineEditTime,
  },
} satisfies Meta<typeof InlineEdit>;

export default meta;
```

Then a `Row` layout helper (label + value column, standalone — no Attribute):

```tsx
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='flex flex-col gap-2'>
      <Text size='sm' color='secondary'>
        {label}
      </Text>
      {children}
    </div>
  );
}
```

`Gallery` story — port the nine editors from the old `InlineEditGallery`, with these changes per row (write all nine out in full in the actual file):

- text: `data-analytics-id='inline-edit-name'` on `InlineEditPreview` and `data-analytics-id='inline-edit-name-input'` + `aria-label='Name'` on `InlineEditInput` (metrics-checklist demo + a11y-name e2e hook). No `submitMode` prop.
- number / textarea: unchanged apart from names.
- select: `value={role}` + `<InlineEditSelect items={roleItems} />` — **no `submitMode` on the root**.
- multi-select: `<InlineEditSelect items={roleItems} multiple />`.
- tags: `<InlineEditSelect items={tagItems} multiple />` with `Tag` chips in the preview (as today).
- date: `<InlineEditDate />`; datetime: `<InlineEditDate showTime />`; time: `<InlineEditTime />` — wrapped in the per-row `DateFormatProvider` exactly as the old stories (demo-only).

`States` and `Async` stories — port `InlineEditStatesList` / `InlineEditAsyncDemo` bodies verbatim minus the Attribute wrappers (use `Row`), keeping testids `loading`, `saved`, `error`, `attr`.

`NonEditable` story — two rows for the e2e checks the old spec promised:

```tsx
export const NonEditable: StoryFn = () => (
  <div className='flex w-[320px] flex-col gap-8'>
    <Row label='Read only'>
      <InlineEdit defaultValue='Locked value' readOnly data-testid='readonly'>
        <InlineEditPreview>Locked value</InlineEditPreview>
        <InlineEditControl>
          <InlineEditInput />
        </InlineEditControl>
      </InlineEdit>
    </Row>
    <Row label='Disabled'>
      <InlineEdit defaultValue='Disabled value' disabled data-testid='disabled'>
        <InlineEditPreview>Disabled value</InlineEditPreview>
        <InlineEditControl>
          <InlineEditInput />
        </InlineEditControl>
      </InlineEdit>
    </Row>
  </div>
);
```

`CustomEditor` story — the extension-seam demo (render-prop + Control `submitMode`; plain DS `Input` uppercased on change to make the custom wiring visible):

```tsx
export const CustomEditor: StoryFn = () => {
  const [value, setValue] = useState('CHECKOUT API');
  return (
    <div className='w-[320px]'>
      <Row label='Custom editor (render-prop)'>
        <InlineEdit value={value} onValueCommit={v => setValue(v as string)} data-testid='custom'>
          <InlineEditPreview>{value}</InlineEditPreview>
          <InlineEditControl submitMode='both'>
            {({ value: draft, setValue: setDraft }) => (
              <Input
                aria-label='Custom'
                value={(draft as string) ?? ''}
                onChange={e => setDraft(e.target.value.toUpperCase())}
                className='h-28 px-8'
              />
            )}
          </InlineEditControl>
          <InlineEditError />
        </InlineEdit>
      </Row>
    </div>
  );
};
```

- [ ] **Step 2: Slim down `Attribute.stories.tsx`**

Delete everything from the `// ─── Inline Edit Stories ───` banner to the end of the file (the helper editors, `InlineEditGallery`, `InlineEditStatesList`, `InlineEditAsyncDemo`, and the six story exports), delete the now-unused imports (the `../InlineEdit` block from Task 1, `createListCollection`, `date-fns` `format`, Select family, Calendar family, `DateInput`, `TimeInput`, `DateFormatProvider`, `ChevronDown`, `Clock`, `Calendar` icon, `Tag`, `CalendarDate`/`CalendarDateTime`/`Time`/`DateValue` — verify each is unused elsewhere in the file before removing), and append:

```tsx
// ─── InlineEdit Integration ─────────────────────────────────────────────────
// Canonical nesting: Attribute > AttributeValue > InlineEdit. No manual
// overflow-visible — AttributeValue's :has() seam supplies it.

function AttributeInlineEditExample({ orientation }: { orientation?: AttributeProps['orientation'] }) {
  const [name, setName] = useState('Checkout API');
  return (
    <div className='w-[420px]'>
      <Attribute orientation={orientation} data-testid='attr'>
        <AttributeLabel>Name</AttributeLabel>
        <AttributeValue>
          <InlineEditRoot value={name} onValueCommit={v => setName(v as string)}>
            <InlineEditPreview>{name}</InlineEditPreview>
            <InlineEditControl>
              <InlineEditInput />
            </InlineEditControl>
            <InlineEditError />
          </InlineEditRoot>
        </AttributeValue>
      </Attribute>
    </div>
  );
}

export const WithInlineEdit: StoryFn = () => <AttributeInlineEditExample />;

export const HorizontalWithInlineEdit: StoryFn = () => (
  <AttributeInlineEditExample orientation='horizontal' />
);
```

(Keep the `InlineEdit as InlineEditRoot` import alias plus `InlineEditControl`, `InlineEditError`, `InlineEditInput`, `InlineEditPreview` from `../InlineEdit`; drop the rest of that import.)

- [ ] **Step 3: Verify**

```bash
pnpm typecheck && pnpm -C packages/design-system exec vitest run src/components/InlineEdit src/components/Attribute
```

Then launch Storybook and manually verify: `Data Display/InlineEdit` shows Gallery (9 editors работают: select/date/time open on click, commit on close/blur), States, Async, NonEditable, CustomEditor; `Data Display/Attribute` shows the two integration stories with correct row alignment.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "docs(inline-edit): standalone stories with built-in editors; slim Attribute integration stories (WDS-143)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: Integration tests — standalone + hosted seam

**Files:**
- Create: `InlineEdit/InlineEdit.integration.test.tsx`
- Modify: `Attribute/AttributeInlineEdit.integration.test.tsx` (root `onValueRevert` coverage lives in the moved `InlineEdit.test.tsx` — verify it exists there, add if missing)

**Interfaces:**
- Consumes: all InlineEdit exports; `Attribute`/`AttributeLabel`/`AttributeValue`.
- Produces: nothing new — coverage.

- [ ] **Step 1: Write `InlineEdit/InlineEdit.integration.test.tsx`**

```typescript
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InlineEdit } from './InlineEdit';
import { InlineEditControl } from './InlineEditControl';
import { InlineEditError } from './InlineEditError';
import { InlineEditInput } from './InlineEditInput';
import { InlineEditPreview } from './InlineEditPreview';

function Example({
  onCommit,
  onRevert,
}: {
  onCommit?: (v: string) => void;
  onRevert?: (v: string) => void;
}) {
  return (
    <InlineEdit
      defaultValue='Checkout API'
      onValueCommit={onCommit}
      onValueRevert={onRevert}
      data-testid='ie'
    >
      <InlineEditPreview>Checkout API</InlineEditPreview>
      <InlineEditControl>
        <InlineEditInput />
      </InlineEditControl>
      <InlineEditError />
    </InlineEdit>
  );
}

describe('InlineEdit standalone integration', () => {
  it('click → type → Enter commits the new value', async () => {
    const onCommit = vi.fn();
    render(<Example onCommit={onCommit} />);
    await userEvent.click(screen.getByTestId('ie--preview'));
    const input = screen.getByTestId('ie--input') as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, 'Payments API{Enter}');
    expect(onCommit).toHaveBeenCalledWith('Payments API');
    expect(screen.getByTestId('ie--preview')).toBeInTheDocument();
  });

  it('Escape reverts, calls onValueRevert, and does not commit', async () => {
    const onCommit = vi.fn();
    const onRevert = vi.fn();
    render(<Example onCommit={onCommit} onRevert={onRevert} />);
    await userEvent.click(screen.getByTestId('ie--preview'));
    await userEvent.type(screen.getByTestId('ie--input'), 'x');
    await userEvent.keyboard('{Escape}');
    expect(onCommit).not.toHaveBeenCalled();
    expect(onRevert).toHaveBeenCalledWith('Checkout API');
  });

  it('render-prop editor commits through the same lifecycle', async () => {
    const onCommit = vi.fn();
    render(
      <InlineEdit defaultValue='v' onValueCommit={onCommit} data-testid='rp'>
        <InlineEditPreview>v</InlineEditPreview>
        <InlineEditControl>
          {({ value, setValue }) => (
            <input
              aria-label='raw'
              value={(value as string) ?? ''}
              onChange={e => setValue(e.target.value)}
            />
          )}
        </InlineEditControl>
      </InlineEdit>,
    );
    await userEvent.click(screen.getByTestId('rp--preview'));
    await userEvent.type(screen.getByRole('textbox', { name: 'raw' }), '2{Enter}');
    expect(onCommit).toHaveBeenCalledWith('v2');
  });
});
```

- [ ] **Step 2: Run, fix anything, commit**

```bash
pnpm -C packages/design-system exec vitest run src/components/InlineEdit src/components/Attribute && pnpm typecheck
git add -A
git commit -m "test(inline-edit): standalone integration coverage incl. render-prop path (WDS-143)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 10: E2E migration

**Files:**
- Create: `InlineEdit/InlineEdit.e2e.ts`
- Modify: `Attribute/Attribute.e2e.ts` (drop the 5 inline-edit tuples + 13 inline tests; add 3 integration tests)
- Delete: stale inline-edit screenshots in `Attribute/Attribute.e2e.ts-snapshots/`

**Interfaces:**
- Consumes: story ids from Task 8 (`data-display-inlineedit`: `Gallery`, `States`, `Async`, `Non Editable`, `Custom Editor`; `data-display-attribute`: `With Inline Edit`, `Horizontal With Inline Edit`); testIds `{row}--preview`, `{row}--input`, `{row}--error`, `{row}--content` (tooltip).
- Produces: green e2e; new screenshot baselines via `[update-screenshots]`.

- [ ] **Step 1: Write `InlineEdit/InlineEdit.e2e.ts`**

Follow `docs/e2e-test-rules.md` (describe hierarchy `Component: InlineEdit` → `Visual`/`Interactions`/`Accessibility`, "Should …" titles, severity annotations as the rules define, `data-testid` selectors only):

```typescript
import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const inlineEditStory = createStoryHelper('data-display-inlineedit', [
  'Gallery',
  'States',
  'Async',
  'Non Editable',
  'Custom Editor',
] as const);

test.describe('Component: InlineEdit', () => {
  test.describe('Visual', () => {
    test('Should render the editor gallery correctly', async ({ page }) => {
      await inlineEditStory.goto(page, 'Gallery');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render hover affordance with tooltip correctly', async ({ page }) => {
      await inlineEditStory.goto(page, 'Gallery');
      await page.getByTestId('text--preview').hover();
      await expect(page.getByTestId('text--content')).toHaveText('Edit');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render the editing state correctly', async ({ page }) => {
      await inlineEditStory.goto(page, 'Gallery');
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
  });

  test.describe('Interactions', () => {
    test('Should enter edit mode and commit on Enter', async ({ page }) => {
      await inlineEditStory.goto(page, 'Gallery');
      await page.getByTestId('text--preview').click();
      const input = page.getByTestId('text--input');
      await expect(input).toBeFocused();
      await input.fill('Payments API');
      await input.press('Enter');
      await expect(page.getByTestId('text--preview')).toHaveText(/Payments API/);
    });

    test('Should revert on Escape', async ({ page }) => {
      await inlineEditStory.goto(page, 'Gallery');
      await page.getByTestId('text--preview').click();
      const input = page.getByTestId('text--input');
      await input.fill('Discarded');
      await input.press('Escape');
      await expect(page.getByTestId('text--preview')).toHaveText(/Checkout API/);
    });

    test('Should commit on blur', async ({ page }) => {
      await inlineEditStory.goto(page, 'Gallery');
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
      await inlineEditStory.goto(page, 'Gallery');
      await page.getByTestId('select--preview').click();
      await page.getByRole('option', { name: 'Admin' }).click();
      await expect(page.getByTestId('select--preview')).toHaveText(/Admin/);
    });

    test('Should commit a date pick when the calendar closes', async ({ page }) => {
      await inlineEditStory.goto(page, 'Gallery');
      await page.getByTestId('date--preview').click();
      await page.locator('[data-part="table-cell-trigger"]', { hasText: /^20$/ }).first().click();
      await page.mouse.click(5, 5);
      await expect(page.getByTestId('date--preview')).toHaveText(/20 Jun, 2026/);
    });

    test('Should commit a time edit when the date-time popover closes', async ({ page }) => {
      await inlineEditStory.goto(page, 'Gallery');
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
      await inlineEditStory.goto(page, 'Gallery');
      const preview = page.getByTestId('datetime--preview');
      await preview.click();
      await page.locator('[data-part="table-cell-trigger"]', { hasText: /^20$/ }).first().click();
      await page.mouse.click(5, 5);
      await expect(preview).toHaveText(/20 Jun, 2026 2:30 PM/);
    });

    test('Should commit a time edit on blur', async ({ page }) => {
      await inlineEditStory.goto(page, 'Gallery');
      await page.getByTestId('time--preview').click();
      const hour = page.getByRole('spinbutton', { name: 'hour' }).first();
      await hour.click();
      await page.keyboard.type('9');
      await page.getByTestId('text--preview').click(); // blur out
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
  });

  test.describe('Accessibility', () => {
    test('Should enter edit via keyboard activation', async ({ page }) => {
      await inlineEditStory.goto(page, 'Gallery');
      const preview = page.getByTestId('text--preview');
      await preview.focus();
      await preview.press('Enter');
      await expect(page.getByTestId('text--input')).toBeFocused();
    });

    test('Should cancel edit via Escape', async ({ page }) => {
      await inlineEditStory.goto(page, 'Gallery');
      await page.getByTestId('text--preview').click();
      await page.getByTestId('text--input').press('Escape');
      await expect(page.getByTestId('text--preview')).toBeVisible();
    });

    test('Should reach the preview in tab order and expose the editor name', async ({ page }) => {
      await inlineEditStory.goto(page, 'Gallery');
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('text--preview')).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('textbox', { name: 'Name' })).toBeFocused();
    });
  });
});
```

Add the severity annotations exactly as `docs/e2e-test-rules.md` mandates (copy the annotation shape from the current `Attribute.e2e.ts` / another component's e2e).

- [ ] **Step 2: Slim `Attribute/Attribute.e2e.ts`**

Replace the story tuple (drop the five `Inline Edit*` names, add the two integration names):

```typescript
const attributeStory = createStoryHelper('data-display-attribute', [
  'Horizontal',
  'Horizontal Truncation',
  'Horizontal Composition',
  'Horizontal Loading',
  'Horizontal With Actions',
  'Horizontal With Actions Menu Only',
  'With Inline Edit',
  'Horizontal With Inline Edit',
] as const);
```

Delete the 7 inline-edit Visual tests, the 7 inline-edit Interactions tests, and both Accessibility tests (they all migrated). Add to `Visual`:

```typescript
    test('Should render hosted inline edit with correct row height', async ({ page }) => {
      await attributeStory.goto(page, 'With Inline Edit');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render horizontal hosted inline edit with correct truncation and row height', async ({
      page,
    }) => {
      await attributeStory.goto(page, 'Horizontal With Inline Edit');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should not clip the open editor in a horizontal value (overflow seam)', async ({
      page,
    }) => {
      // Regression for f16702b3: AttributeValue's :has() rule must un-clip the
      // editor border/focus ring that horizontal `truncate` would hide.
      await attributeStory.goto(page, 'Horizontal With Inline Edit');
      await page.getByTestId('attr--preview').click();
      await expect(page.getByTestId('attr--input')).toBeFocused();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });
```

- [ ] **Step 3: Delete stale baselines and run locally**

```bash
cd /Users/ilyapashkov/Projects/wallarm/wallarm-design-system
git rm packages/design-system/src/components/Attribute/Attribute.e2e.ts-snapshots/*inline-edit*
# Local run (starts storybook + playwright via the repo script):
pnpm e2e:local:design-system
# To (re)generate local baselines in the CI-identical container instead:
pnpm e2e:docker:update:design-system
```

Non-screenshot assertions must pass locally. Canonical baselines come from CI via the `[update-screenshots]` trigger in the commit message (Step 4) — local docker baselines are optional.

- [ ] **Step 4: Commit with the screenshot trigger**

```bash
git add -A
git commit -m "test(inline-edit): migrate e2e to standalone InlineEdit suite with seam regression coverage [update-screenshots] (WDS-143)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 11: Final verification sweep

**Files:** none new — verification + fixes only.

- [ ] **Step 1: Success-criteria greps (spec §Success Criteria)**

```bash
cd /Users/ilyapashkov/Projects/wallarm/wallarm-design-system
grep -rn "AttributeEdit\|attribute-edit\|useAttributeEdit" packages/design-system/src --include="*.ts" --include="*.tsx"
grep -rn -- "--edit-preview\|--edit-input\|--edit-error\|--edit-control\|'edit-input'\|'edit-preview'" packages/design-system/src
```

Expected: no output from either.

- [ ] **Step 2: Metrics checklist**

Walk `docs/metrics/new-component-checklist.md` item by item for InlineEdit (incl. the three editors); confirm: rest-prop forwarding tests exist per editor, the Gallery story demonstrates `data-analytics-id`, `ANALYTICS_GAPS.md` has the NumberInput + Date + Time entries, no analytics-named props anywhere.

- [ ] **Step 3: Full quality gate**

```bash
pnpm lint && pnpm typecheck && pnpm -C packages/design-system exec vitest run
```

Expected: all PASS, zero lint errors.

- [ ] **Step 4: Commit any sweep fixes**

```bash
git add -A
git commit -m "chore(inline-edit): final extraction sweep — grep-clean names, metrics checklist (WDS-143)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

(Skip the commit if the sweep found nothing to fix.)
