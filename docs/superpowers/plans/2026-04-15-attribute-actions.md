# AttributeActions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the `AttributeValueMenu` from `my/` app into the design system as a generic, domain-free compound component named `AttributeActions`.

**Architecture:** Compound component living alongside existing Attribute primitives. Four sub-components (`AttributeActions`, `AttributeActionsTarget`, `AttributeActionsContent`, `AttributeActionsItem`) thinly wrap `DropdownMenu` / `DropdownMenuTrigger` / `DropdownMenuContent` / `DropdownMenuItem`. The Target adds the interactive highlight styling (hover background, cursor pointer, expanded hit area). The Item is a convenience shortcut that accepts an `icon` prop + text children. No toast/clipboard/filter logic ships in the DS — consumers pass `onSelect` handlers.

**Tech Stack:** React 19, TypeScript strict, Tailwind v4, CVA, Ark UI Menu (via DropdownMenu), Vitest (none — DS uses E2E), Playwright E2E, Storybook 10, Biome.

---

## File Structure

**Create:**
- `packages/design-system/src/components/Attribute/AttributeActions.tsx` — root, wraps `DropdownMenu`
- `packages/design-system/src/components/Attribute/AttributeActionsTarget.tsx` — clickable highlight area, wraps `DropdownMenuTrigger`
- `packages/design-system/src/components/Attribute/AttributeActionsContent.tsx` — menu content, wraps `DropdownMenuContent`
- `packages/design-system/src/components/Attribute/AttributeActionsItem.tsx` — menu item with icon shortcut, wraps `DropdownMenuItem`
- `packages/design-system/src/components/Attribute/Attribute.e2e.ts` — new E2E file for the Attribute group (includes AttributeActions interaction tests)

**Modify:**
- `packages/design-system/src/components/Attribute/index.ts` — add AttributeActions exports
- `packages/design-system/src/components/Attribute/Attribute.stories.tsx` — add `WithActions` story
- `packages/design-system/src/index.ts` — re-export AttributeActions from root

**Migrate (in `my/` repo):**
- `my/src/pages/attacks-new/ui/attacks-table/attack-preview-content/attribute-value-menu.tsx` — rewrite to use `AttributeActions` from DS (keep app-specific `useCellFilterability`, `useCellFilterActions`, toast, `CopyToClipboard` in this file)

---

## Public API

```tsx
<AttributeActions>
  <AttributeActionsTarget>
    <Text size='sm'>142.198.167.52</Text>
  </AttributeActionsTarget>
  <AttributeActionsContent>
    <AttributeActionsItem icon={<Filter />} onSelect={onInvestigate}>
      Investigate by this value
    </AttributeActionsItem>
    <AttributeActionsItem icon={<Copy />} onSelect={onCopy}>
      Copy value
    </AttributeActionsItem>
  </AttributeActionsContent>
</AttributeActions>
```

**Props:**
- `AttributeActions` — forwards all `DropdownMenu` props (open, defaultOpen, onOpenChange, modal, positioning, etc.) + `data-testid`
- `AttributeActionsTarget` — accepts `children: ReactNode`, forwards `HTMLAttributes<HTMLDivElement>`, forwards ref. Adds hover highlight + cursor.
- `AttributeActionsContent` — same props as `DropdownMenuContent`
- `AttributeActionsItem` — `icon?: ReactNode` + `children: ReactNode` (rendered as text) + all `DropdownMenuItem` props (onSelect, disabled, value, etc.)

**testId cascade:**
- Root: `data-testid` passed through to DropdownMenu's TestIdProvider
- Target: `{root}--target`
- Content: `{root}--content` (provided by DropdownMenuContent)
- Item: `{root}--item` (provided by DropdownMenuItem)

---

## Task 1: Create AttributeActions root

**Files:**
- Create: `packages/design-system/src/components/Attribute/AttributeActions.tsx`

- [ ] **Step 1: Write the component**

```tsx
import type { ComponentProps, FC } from 'react';
import { DropdownMenu } from '../DropdownMenu';

export type AttributeActionsProps = ComponentProps<typeof DropdownMenu>;

export const AttributeActions: FC<AttributeActionsProps> = props => <DropdownMenu {...props} />;

AttributeActions.displayName = 'AttributeActions';
```

- [ ] **Step 2: Format**

Run: `npx biome check --write packages/design-system/src/components/Attribute/AttributeActions.tsx`
Expected: "Checked 1 file. No fixes applied." (or reports fixes)

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter design-system typecheck`
Expected: Exit code 0, no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/design-system/src/components/Attribute/AttributeActions.tsx
git commit -m "feat(attribute): add AttributeActions root component"
```

---

## Task 2: Create AttributeActionsTarget with highlight styling

**Files:**
- Create: `packages/design-system/src/components/Attribute/AttributeActionsTarget.tsx`

- [ ] **Step 1: Write the component**

```tsx
import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { DropdownMenuTrigger } from '../DropdownMenu';

export interface AttributeActionsTargetProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}

export const AttributeActionsTarget: FC<AttributeActionsTargetProps> = ({
  ref,
  children,
  className,
  ...props
}) => {
  const testId = useTestId('target');

  return (
    <DropdownMenuTrigger asChild>
      <div
        {...props}
        ref={ref}
        data-testid={testId}
        data-slot='attribute-actions-target'
        className={cn(
          '-mx-4 -my-6 block w-full cursor-pointer rounded-8 px-6 py-4 transition-colors',
          'hover:bg-states-primary-hover active:bg-states-primary-pressed',
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-focus-primary',
          className,
        )}
      >
        {children}
      </div>
    </DropdownMenuTrigger>
  );
};

AttributeActionsTarget.displayName = 'AttributeActionsTarget';
```

Note: `-mx-4 -my-6` reproduces the hit-area expansion from the original (compensates for the `px-6 py-4` inner padding so outer layout stays unchanged).

- [ ] **Step 2: Format**

Run: `npx biome check --write packages/design-system/src/components/Attribute/AttributeActionsTarget.tsx`
Expected: formatted.

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter design-system typecheck`
Expected: Exit code 0.

- [ ] **Step 4: Commit**

```bash
git add packages/design-system/src/components/Attribute/AttributeActionsTarget.tsx
git commit -m "feat(attribute): add AttributeActionsTarget with hover highlight"
```

---

## Task 3: Create AttributeActionsContent

**Files:**
- Create: `packages/design-system/src/components/Attribute/AttributeActionsContent.tsx`

- [ ] **Step 1: Write the component**

```tsx
import type { ComponentProps, FC } from 'react';
import { DropdownMenuContent } from '../DropdownMenu';

export type AttributeActionsContentProps = ComponentProps<typeof DropdownMenuContent>;

export const AttributeActionsContent: FC<AttributeActionsContentProps> = props => (
  <DropdownMenuContent {...props} />
);

AttributeActionsContent.displayName = 'AttributeActionsContent';
```

- [ ] **Step 2: Format**

Run: `npx biome check --write packages/design-system/src/components/Attribute/AttributeActionsContent.tsx`
Expected: formatted.

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter design-system typecheck`
Expected: Exit code 0.

- [ ] **Step 4: Commit**

```bash
git add packages/design-system/src/components/Attribute/AttributeActionsContent.tsx
git commit -m "feat(attribute): add AttributeActionsContent wrapper"
```

---

## Task 4: Create AttributeActionsItem with icon shortcut

**Files:**
- Create: `packages/design-system/src/components/Attribute/AttributeActionsItem.tsx`

- [ ] **Step 1: Write the component**

```tsx
import type { ComponentProps, FC, ReactNode } from 'react';
import {
  DropdownMenuItem,
  DropdownMenuItemIcon,
  DropdownMenuItemText,
} from '../DropdownMenu';

export interface AttributeActionsItemProps extends ComponentProps<typeof DropdownMenuItem> {
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Item label text. */
  children: ReactNode;
}

export const AttributeActionsItem: FC<AttributeActionsItemProps> = ({
  icon,
  children,
  ...props
}) => (
  <DropdownMenuItem {...props}>
    {icon && <DropdownMenuItemIcon>{icon}</DropdownMenuItemIcon>}
    <DropdownMenuItemText>{children}</DropdownMenuItemText>
  </DropdownMenuItem>
);

AttributeActionsItem.displayName = 'AttributeActionsItem';
```

- [ ] **Step 2: Format**

Run: `npx biome check --write packages/design-system/src/components/Attribute/AttributeActionsItem.tsx`
Expected: formatted.

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter design-system typecheck`
Expected: Exit code 0.

- [ ] **Step 4: Commit**

```bash
git add packages/design-system/src/components/Attribute/AttributeActionsItem.tsx
git commit -m "feat(attribute): add AttributeActionsItem with icon shortcut"
```

---

## Task 5: Export from Attribute index and root index

**Files:**
- Modify: `packages/design-system/src/components/Attribute/index.ts`
- Modify: `packages/design-system/src/index.ts`

- [ ] **Step 1: Append exports to `components/Attribute/index.ts`**

Open `packages/design-system/src/components/Attribute/index.ts` and add the four new exports at the end (keep alphabetical order where existing file does). After Task 5 the file should read:

```ts
export { Attribute, type AttributeProps } from './Attribute';
export { AttributeActions, type AttributeActionsProps } from './AttributeActions';
export {
  AttributeActionsContent,
  type AttributeActionsContentProps,
} from './AttributeActionsContent';
export { AttributeActionsItem, type AttributeActionsItemProps } from './AttributeActionsItem';
export { AttributeActionsTarget, type AttributeActionsTargetProps } from './AttributeActionsTarget';
export { AttributeLabel, type AttributeLabelProps } from './AttributeLabel';
export {
  AttributeLabelDescription,
  type AttributeLabelDescriptionProps,
} from './AttributeLabelDescription';
export { AttributeLabelInfo, type AttributeLabelInfoProps } from './AttributeLabelInfo';
export { AttributeValue, type AttributeValueProps } from './AttributeValue';
```

- [ ] **Step 2: Update root `src/index.ts` Attribute block**

Locate the existing `export { Attribute, ... } from './components/Attribute';` block (around line 18-29) and replace it with:

```ts
export {
  Attribute,
  AttributeActions,
  type AttributeActionsContentProps,
  AttributeActionsContent,
  AttributeActionsItem,
  type AttributeActionsItemProps,
  type AttributeActionsProps,
  AttributeActionsTarget,
  type AttributeActionsTargetProps,
  AttributeLabel,
  AttributeLabelDescription,
  type AttributeLabelDescriptionProps,
  AttributeLabelInfo,
  type AttributeLabelInfoProps,
  type AttributeLabelProps,
  type AttributeProps,
  AttributeValue,
  type AttributeValueProps,
} from './components/Attribute';
```

- [ ] **Step 3: Run Biome auto-sort to finalize import/export order**

Run: `npx biome check --write packages/design-system/src/components/Attribute/index.ts packages/design-system/src/index.ts`
Expected: Biome sorts the members deterministically — do not hand-fight the output.

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter design-system typecheck`
Expected: Exit code 0.

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/components/Attribute/index.ts packages/design-system/src/index.ts
git commit -m "feat(attribute): export AttributeActions compound components"
```

---

## Task 6: Add `WithActions` story

**Files:**
- Modify: `packages/design-system/src/components/Attribute/Attribute.stories.tsx`

- [ ] **Step 1: Update imports**

At the top of `Attribute.stories.tsx`, add icon imports and the new components. After update the first lines should include:

```tsx
import { Copy, Filter } from '../../icons';
```

And add to the existing imports from `./Attribute*`:

```tsx
import { AttributeActions } from './AttributeActions';
import { AttributeActionsContent } from './AttributeActionsContent';
import { AttributeActionsItem } from './AttributeActionsItem';
import { AttributeActionsTarget } from './AttributeActionsTarget';
```

- [ ] **Step 2: Register sub-components in meta**

Update the `subcomponents` entry in the `meta` object:

```tsx
subcomponents: {
  AttributeLabel,
  AttributeLabelDescription,
  AttributeLabelInfo,
  AttributeValue,
  AttributeActions,
  AttributeActionsTarget,
  AttributeActionsContent,
  AttributeActionsItem,
},
```

- [ ] **Step 3: Append the `WithActions` story**

Append this at the end of the file (after `Composition`):

```tsx
export const WithActions: StoryFn<AttributeProps> = () => (
  <div className='w-[400px]'>
    <Attribute data-testid='attribute-with-actions'>
      <AttributeLabel>Source IP</AttributeLabel>
      <AttributeValue>
        <AttributeActions>
          <AttributeActionsTarget>
            <Text size='sm'>142.198.167.52</Text>
          </AttributeActionsTarget>
          <AttributeActionsContent>
            <AttributeActionsItem icon={<Filter />} onSelect={() => {}}>
              Investigate by this value
            </AttributeActionsItem>
            <AttributeActionsItem icon={<Copy />} onSelect={() => {}}>
              Copy value
            </AttributeActionsItem>
          </AttributeActionsContent>
        </AttributeActions>
      </AttributeValue>
    </Attribute>
  </div>
);
```

- [ ] **Step 4: Format**

Run: `npx biome check --write packages/design-system/src/components/Attribute/Attribute.stories.tsx`
Expected: formatted.

- [ ] **Step 5: Typecheck**

Run: `pnpm --filter design-system typecheck`
Expected: Exit code 0.

- [ ] **Step 6: Commit**

```bash
git add packages/design-system/src/components/Attribute/Attribute.stories.tsx
git commit -m "docs(attribute): add WithActions story for AttributeActions"
```

---

## Task 7: Add E2E tests for AttributeActions

**Files:**
- Create: `packages/design-system/src/components/Attribute/Attribute.e2e.ts`

- [ ] **Step 1: Create the E2E file**

```ts
import { expect, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const attributeStory = createStoryHelper('data-display-attribute', [
  'Default',
  'WithActions',
] as const);

test.describe('Component: Attribute', () => {
  test.describe('Visual', () => {
    test('Should render default attribute correctly', async ({ page }) => {
      await attributeStory.goto(page, 'Default');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render WithActions closed state correctly', async ({ page }) => {
      await attributeStory.goto(page, 'WithActions');
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });

    test('Should render WithActions open state correctly', async ({ page }) => {
      await attributeStory.goto(page, 'WithActions');
      await page.getByTestId('attribute-with-actions--target').click();
      await expect(
        page.locator('[data-scope="menu"][data-part="content"]'),
      ).toBeVisible();
      await expect(page).toHaveScreenshot({ animations: 'disabled' });
    });
  });

  test.describe('Interactions', () => {
    test('Should open menu when target is clicked', async ({ page }) => {
      await attributeStory.goto(page, 'WithActions');
      const target = page.getByTestId('attribute-with-actions--target');
      await expect(target).toBeVisible();
      await target.click();
      await expect(
        page.locator('[data-scope="menu"][data-part="content"]'),
      ).toBeVisible();
    });

    test('Should close menu after selecting an item', async ({ page }) => {
      await attributeStory.goto(page, 'WithActions');
      await page.getByTestId('attribute-with-actions--target').click();
      await page.getByRole('menuitem', { name: 'Copy value' }).click();
      await expect(
        page.locator('[data-scope="menu"][data-part="content"]'),
      ).toBeHidden();
    });
  });

  test.describe('Accessibility', () => {
    test('Target should be keyboard-operable', async ({ page }) => {
      await attributeStory.goto(page, 'WithActions');
      const target = page.getByTestId('attribute-with-actions--target');
      await target.focus();
      await expect(target).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(
        page.locator('[data-scope="menu"][data-part="content"]'),
      ).toBeVisible();
    });
  });
});
```

- [ ] **Step 2: Format**

Run: `npx biome check --write packages/design-system/src/components/Attribute/Attribute.e2e.ts`
Expected: formatted.

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter design-system typecheck`
Expected: Exit code 0.

- [ ] **Step 4: Commit**

```bash
git add packages/design-system/src/components/Attribute/Attribute.e2e.ts
git commit -m "test(attribute): add E2E tests for Attribute and AttributeActions"
```

- [ ] **Step 5: Trigger screenshot generation via CI**

After pushing, the Visual tests will fail because no baseline screenshots exist. The `[update-screenshots]` trigger must run on `main` after merge. Note in the PR description: "First run — baseline screenshots will be generated via `[update-screenshots]` after merge." Alternatively, add an empty commit before merge:

```bash
git commit --allow-empty -m "test: generate AttributeActions baseline screenshots [update-screenshots]"
```

---

## Task 8: Migrate `my/` app to use AttributeActions

**Files:**
- Modify: `/Users/klimovaoks/Projects/work/my/src/pages/attacks-new/ui/attacks-table/attack-preview-content/attribute-value-menu.tsx`

Before starting Task 8, publish the DS changes (merge to `main`, wait for release, bump version in `my/`). **Do NOT start this task until the DS version with AttributeActions is installed in `my/`.**

- [ ] **Step 1: Rewrite `attribute-value-menu.tsx` to use AttributeActions**

Replace the entire file contents with:

```tsx
import type { FC, ReactNode } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import {
    AttributeActions,
    AttributeActionsContent,
    AttributeActionsItem,
    AttributeActionsTarget,
} from '@wallarm-org/design-system/Attribute';
import { Copy, Filter } from '@wallarm-org/design-system/icons';
import { useCellFilterActions } from '../../../model/use-cell-filter-actions';
import { useCellFilterability } from '../../../model/use-cell-filterability';

export interface AttributeValueMenuProps {
    /** Select field name (e.g. `status`, `attack_types`, `ip_addresses`). */
    field: string;
    /** Raw filter values — single-element array for scalar fields. */
    rawValues: string[];
    /** Text written to the clipboard. */
    displayValue: string;
    /** Pass `true` for multi-value fields — uses IN operator instead of =. */
    multi?: boolean;
    /**
     * Called when user clicks "Investigate attacks by this value". Parent decides how
     * to apply the filter (typically: navigate to a drill-down Investigate view).
     * Falls back to local `showOnly` if not provided.
     */
    onInvestigate?: (field: string, rawValues: string[], multi: boolean) => void;
    children: ReactNode;
}

const handleCopyResult = (_text: string, success: boolean) => {
    if (success) {
        toast.success('Copied to clipboard', { toastId: 'attribute-value-menu-copied' });
    } else {
        toast.error('Could not copy to clipboard', {
            toastId: 'attribute-value-menu-copy-error',
        });
    }
};

export const AttributeValueMenu: FC<AttributeValueMenuProps> = ({
    field,
    rawValues,
    displayValue,
    multi = false,
    onInvestigate,
    children,
}) => {
    const { canShowOnly } = useCellFilterability(field, multi, rawValues.length);
    const { showOnly } = useCellFilterActions();
    const handleInvestigate = () => {
        if (onInvestigate) onInvestigate(field, rawValues, multi);
        else showOnly(field, rawValues, multi);
    };

    return (
        <AttributeActions data-testid='attribute-value-menu'>
            <AttributeActionsTarget>{children}</AttributeActionsTarget>
            <AttributeActionsContent>
                {canShowOnly && (
                    <AttributeActionsItem icon={<Filter />} onSelect={handleInvestigate}>
                        Investigate attacks by this value
                    </AttributeActionsItem>
                )}
                <CopyToClipboard text={displayValue} onCopy={handleCopyResult}>
                    <AttributeActionsItem icon={<Copy />}>Copy value</AttributeActionsItem>
                </CopyToClipboard>
            </AttributeActionsContent>
        </AttributeActions>
    );
};
```

Notes:
- Keep the `AttributeValueMenu` export name + `AttributeValueMenuProps` (app-level alias); no call sites change.
- The outer wrapper `<div data-testid='attribute-value-menu-target'>` is gone — its styling is now inside `AttributeActionsTarget`. Test IDs derive from the root: `attribute-value-menu--target`, `attribute-value-menu--item`. **Check every test that used the old `attribute-value-menu-target` / `attribute-value-menu-investigate` / `attribute-value-menu-copy` testIds and update them to the new derived IDs.**
- `onSelect` is not passed to the Copy item because `CopyToClipboard` intercepts the click; the item's default close-on-select still closes the menu.

- [ ] **Step 2: Grep old testIds and update consumers**

Run from `my/` repo root:

```bash
rg "attribute-value-menu-(target|investigate|copy)" --hidden -g '!node_modules'
```

For each hit, update to the new derived form:
- `attribute-value-menu-target` → `attribute-value-menu--target`
- `attribute-value-menu-investigate` → `attribute-value-menu--item` (or a more specific locator like role-based)
- `attribute-value-menu-copy` → `attribute-value-menu--item` (role-based locator preferred)

- [ ] **Step 3: Run app typecheck + tests**

From `my/` repo root:

```bash
pnpm typecheck
pnpm test --run
```

Expected: no TypeScript errors, tests pass (or only fail on screenshot drift — re-baseline separately).

- [ ] **Step 4: Commit in `my/`**

```bash
cd /Users/klimovaoks/Projects/work/my
git add src/pages/attacks-new/ui/attacks-table/attack-preview-content/attribute-value-menu.tsx
# plus any test files touched
git commit -m "refactor(attacks): use AttributeActions from DS"
```

---

## Self-Review Checklist (verified)

- **Spec coverage**: Move + rename + decouple from domain logic → all 4 sub-components + stories + E2E + app migration covered.
- **Placeholder scan**: every code block is complete; no "TODO" / "similar to Task N" / "add error handling" fluff.
- **Type consistency**: `AttributeActionsTargetProps` / `AttributeActionsContentProps` / `AttributeActionsItemProps` / `AttributeActionsProps` used identically in component + exports + stories. `ComponentProps<typeof DropdownMenu>` pattern is consistent for thin wrappers.
- **Testid cascade**: Root `data-testid="foo"` → target `foo--target`, item `foo--item`, content `foo--content` via DS's `TestIdProvider` / `useTestId`.
