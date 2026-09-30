# FileUpload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the `FileUpload` compound component: a drop Area or Button picker, an inline rejection error, and file rows with Replace, Delete, Download and Loading. It is built on Ark UI and covers WDS-185 and WDS-186.

**Architecture:** The root `FileUpload` calls Ark's `useFileUpload` and renders `FileUpload.RootProvider` plus the hidden input. It publishes a DS context that holds:
- the Ark `api`;
- the resolved `disabled`, `readOnly` and `invalid`;
- `single`, the loading-lock counter;
- the visible rejections;
- the limits.

Picker parts (`FileUploadDropzone`, `FileUploadTrigger`) wrap Ark parts. Row parts (`FileUploadItemGroup`, `FileUploadItem`, and the item triggers) are DS-owned presentational parts. They read the DS context, which may be null, so a row can also render outside a root.

**Tech Stack:** React 19, TypeScript strict, `@ark-ui/react/file-upload` 5.38.0, Tailwind v4 (1 spacing unit = 1px), CVA, Vitest with jsdom and Testing Library, Playwright, and Storybook 10 (`storybook-react-rsbuild`).

**Spec:** `docs/superpowers/specs/2026-09-30-file-upload-design.md`

## Global Constraints

- All paths are relative to `packages/design-system/` unless shown otherwise. Component folder: `src/components/FileUpload/`.
- Rules from `.claude/rules/component-development.md`:
  - CVA lives in `classes.ts`; merge classes with `cn()`; no template-literal class names.
  - Every part has `data-slot='file-upload-…'` and a `displayName`.
  - Pass `ref` as a prop (no `forwardRef`); named exports only; no `any`; no inline styles in components; no hardcoded colors.
- `data-testid` cascade:
  - The root's `data-testid` feeds `TestIdProvider`, and parts call `useTestId('<slot>')`.
  - Slots are: `dropzone`, `trigger`, `error`, `hidden-input`, `item-group`, `item`, `item-name`, `item-description`, `item-delete-trigger`, `item-replace-trigger`, `item-action`.
- Metrics contract (`docs/metrics/contract.md`):
  - `{...rest}` lands on the real DOM node.
  - Internal click behaviour runs after the consumer's `onClick` and is skipped if `event.preventDefault()` was called.
  - No `stopPropagation`, no analytics props.
- Default copy, verbatim:
  - Dropzone text: `Drag and drop files or click to select`
  - Trigger text: `Select file`
  - Delete label: `Delete {name}`, and `Cancel upload` while loading
  - Replace label: `Replace {name}`
  - Messages, in the form `{name} — {message}`:
    - `Not a {accept joined " / "} file`
    - `Too large: {size}; the limit is {max}`
    - `Too small: {size}; the minimum is {min}`
    - `Too many files; the limit is {maxFiles}`
    - `Already added`
- Sizes use binary units (B, KB, MB, GB, TB), at most one decimal, with a trailing `.0` dropped.
- `maxFiles` defaults to `1`. In single mode, re-picking an identical file (`FILE_EXISTS`) is silently ignored.
- Ark caveats, all verified in the spike:
  - In jsdom, Ark reacts to the **`input`** event on the hidden input, not `change`. Unit tests drive picks with `fireEvent.input(input, { target: { files } })`.
  - Drop cannot be simulated in jsdom. Test it in Playwright.
  - Ark's `useFileUpload` spreads props **over** the Field defaults, so passing `required: undefined` erases Field's value. Always pass fully resolved values.
- Verification commands, run from `packages/design-system/`:
  - Unit tests: `pnpm vitest run src/components/FileUpload`
  - Lint: `pnpm lint`
  - Real typecheck: `npx tsc --build tsconfig.app.json --noEmit --force`
  - Stories typecheck: `npx tsc -p tsconfig.storybook.json --noEmit`
  - Do not use `pnpm typecheck`: it is a no-op.
- Commits follow Conventional Commits: `feat(file-upload): …`, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Do **not** stage `.mcp.json` at the repo root. It carries an unrelated local modification.

## Review Focus

1. **Controlled `value` inside a React Hook Form `Controller`, where the parent re-renders with a new array of the same files.** Ark's `isEqual` compares name, size and type, so there should be no loop and no spurious `onValueChange`. Pinned by a test in Task 2.
2. **Invalid replacement in multiple-file mode.** The original file must stay, and the error must name the new file. `setFiles` alone would drop the original. Pinned in Task 5 (the original stays) and Task 6 (the message).
3. **`Field` with no `FieldLabel`.** The Dropzone's `aria-labelledby` must still resolve to its own visible text, so it is never unnamed and never the literal string `dropzone`. Pinned in Task 3.
4. **Deleting a file while a rejection is showing.** The error must clear. Ark does not clear rejections on delete. Pinned in Task 6.
5. **Unmounting a loading row** (the consumer removes it after an upload finishes or fails). The lock must be released and the picker re-enabled. Pinned in Task 4.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/components/FileUpload/lib/formatFileSize.ts` | bytes → `32 MB` |
| `src/components/FileUpload/lib/accept.ts` | `toAcceptList`, `toAcceptString` (`string \| string[]` → list / Ark string) |
| `src/components/FileUpload/lib/formatRejection.ts` | code + limits → default message |
| `src/components/FileUpload/lib/checkFile.ts` | DS-side validation for the multi-mode Replace (type, size, custom) |
| `src/components/FileUpload/lib/index.ts` | barrel |
| `src/components/FileUpload/types.ts` | `FileUploadErrorCode`, `FileUploadRejection`, `FileUploadItemFile`, `FileUploadLimits` |
| `src/components/FileUpload/classes.ts` | CVA for the root, dropzone and item, plus class constants |
| `src/components/FileUpload/FileUploadContext.tsx` | root DS context and its hooks |
| `src/components/FileUpload/FileUploadItemContext.tsx` | per-row context (`file`, `loading`) |
| `src/components/FileUpload/FileUpload.tsx` | root |
| `src/components/FileUpload/FileUploadDropzone.tsx` | Area picker |
| `src/components/FileUpload/FileUploadTrigger.tsx` | Button picker |
| `src/components/FileUpload/FileUploadError.tsx` | inline rejection error |
| `src/components/FileUpload/FileUploadItemGroup.tsx` | `ul`, a render-prop over the accepted files |
| `src/components/FileUpload/FileUploadItem.tsx` | row |
| `src/components/FileUpload/FileUploadItemDeleteTrigger.tsx` | X / Cancel |
| `src/components/FileUpload/FileUploadItemReplaceTrigger.tsx` | RefreshCcw |
| `src/components/FileUpload/FileUploadItemAction.tsx` | generic icon action (Download) |
| `src/components/FileUpload/index.ts` | public exports |
| `src/components/FileUpload/FileUpload.test.tsx` | component unit tests |
| `src/components/FileUpload/FileUpload.stories.tsx` | stories |
| `src/components/FileUpload/FileUpload.e2e.ts` | Playwright |
| `src/components/FileUpload/FileUpload.figma.tsx` | Code Connect |
| `src/components/FileUpload/ANALYTICS_GAPS.md` | wrapper-level analytics decisions |
| `src/index.ts` (modify) | package exports |
| `../../docs/storybook-docs-coverage.md` (modify) | coverage row |
| `../../docs/superpowers/specs/2026-09-30-file-upload-design.md` (modify) | record the multi-Replace pre-validation |

Shared test helpers live at the top of `FileUpload.test.tsx`, and every task appends its `describe` blocks to that file. **The file grows with the tasks:**

- Task 2 creates it with `makeFile`, `hiddenInput`, `pick`, `byTestId` and `queryByTestId`.
- Task 4 adds `Uploader`, with default children of Dropzone plus ItemGroup/Item, without actions.
- Task 5 adds `<FileUploadItemReplaceTrigger />` and `<FileUploadItemDeleteTrigger />` to those default children.
- Task 6 adds `<FileUploadError />` after the Dropzone.

Each task imports only what already exists. The **final** shape, after Task 6, is:

```tsx
import { type ComponentProps, useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Field, FieldLabel } from '../Field';
import { FileUpload } from './FileUpload';
import { FileUploadDropzone } from './FileUploadDropzone';
import { FileUploadError } from './FileUploadError';
import { FileUploadItem } from './FileUploadItem';
import { FileUploadItemAction } from './FileUploadItemAction';
import { FileUploadItemDeleteTrigger } from './FileUploadItemDeleteTrigger';
import { FileUploadItemGroup } from './FileUploadItemGroup';
import { FileUploadItemReplaceTrigger } from './FileUploadItemReplaceTrigger';
import { FileUploadTrigger } from './FileUploadTrigger';

const makeFile = (name = 'policy.wasm', size = 3, type = 'application/wasm') =>
  new File(['x'.repeat(size)], name, { type });

const hiddenInput = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>('[data-slot="file-upload-hidden-input"]') as HTMLInputElement;

// Ark listens to `input` (not `change`) on the hidden input — verified under jsdom.
const pick = (container: HTMLElement, ...files: File[]) =>
  fireEvent.input(hiddenInput(container), { target: { files } });

const byTestId = (id: string) => screen.getByTestId(id);
const queryByTestId = (id: string) => screen.queryByTestId(id);

/** Full composition used by most tests. */
const Uploader = ({
  children,
  ...props
}: Partial<ComponentProps<typeof FileUpload>> & { children?: ComponentProps<typeof FileUpload>['children'] }) => (
  <FileUpload data-testid='fu' name='artifact' {...props}>
    {children ?? (
      <>
        <FileUploadDropzone />
        <FileUploadError />
        <FileUploadItemGroup>
          {file => (
            <FileUploadItem file={file}>
              <FileUploadItemReplaceTrigger />
              <FileUploadItemDeleteTrigger />
            </FileUploadItem>
          )}
        </FileUploadItemGroup>
      </>
    )}
  </FileUpload>
);
```

Biome flags unused imports, so add each import in the task that first uses it.

---

### Task 1: Pure helpers and types (`lib/`, `types.ts`)

**Files:**
- Create: `src/components/FileUpload/types.ts`
- Create: `src/components/FileUpload/lib/formatFileSize.ts`, `lib/accept.ts`, `lib/formatRejection.ts`, `lib/checkFile.ts`, `lib/index.ts`
- Test: `src/components/FileUpload/lib/lib.test.ts`

**Interfaces:**
- Produces:
  - `type FileUploadErrorCode = 'FILE_INVALID_TYPE' | 'FILE_TOO_LARGE' | 'FILE_TOO_SMALL' | 'TOO_MANY_FILES' | 'FILE_EXISTS' | (string & {})`
  - `interface FileUploadRejection { file: File; errors: FileUploadErrorCode[] }`
  - `type FileUploadItemFile = File | { name: string; size?: number }`
  - `interface FileUploadLimits { acceptList: string[]; maxFiles: number; maxFileSize?: number; minFileSize?: number }`
  - `formatFileSize(bytes: number): string`
  - `toAcceptList(accept?: string | string[]): string[]`
  - `toAcceptString(accept?: string | string[]): string | undefined`
  - `formatRejection(fileName: string, code: FileUploadErrorCode, limits: FileUploadLimits, fileSize?: number): string`
  - `checkFile(file: File, rules: FileCheckRules): FileUploadErrorCode[]`, where `interface FileCheckRules { acceptList: string[]; maxFileSize?: number; minFileSize?: number; validate?: (file: File) => string[] | null }`

- [ ] **Step 1: Write the failing tests**

`src/components/FileUpload/lib/lib.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { checkFile, formatFileSize, formatRejection, toAcceptList, toAcceptString } from './index';

const LIMITS = { acceptList: ['.so', '.dylib'], maxFiles: 1, maxFileSize: 32 * 1024 ** 2, minFileSize: 10 };

describe('formatFileSize', () => {
  it.each([
    [0, '0 B'],
    [512, '512 B'],
    [1024, '1 KB'],
    [1536, '1.5 KB'],
    [32 * 1024 ** 2, '32 MB'],
    [40.5 * 1024 ** 2, '40.5 MB'],
    [1024 ** 2 - 1, '1 MB'], // rounds up across the unit boundary instead of "1024 KB"
    [3 * 1024 ** 3, '3 GB'],
  ])('%d bytes → %s', (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected);
  });
});

describe('accept helpers', () => {
  it('splits comma strings and trims', () => {
    expect(toAcceptList('.so, .dylib')).toEqual(['.so', '.dylib']);
  });
  it('flattens arrays of comma strings and drops empties', () => {
    expect(toAcceptList(['.lua', 'image/png,image/jpeg', ''])).toEqual(['.lua', 'image/png', 'image/jpeg']);
  });
  it('returns [] / undefined for no accept', () => {
    expect(toAcceptList(undefined)).toEqual([]);
    expect(toAcceptString(undefined)).toBeUndefined();
    expect(toAcceptString([])).toBeUndefined();
  });
  it('joins into an Ark/native accept string', () => {
    expect(toAcceptString(['.so', '.dylib'])).toBe('.so,.dylib');
  });
});

describe('formatRejection', () => {
  it('names the file and the accepted types', () => {
    expect(formatRejection('policy.txt', 'FILE_INVALID_TYPE', LIMITS)).toBe('policy.txt — Not a .so / .dylib file');
  });
  it('states size and limit for FILE_TOO_LARGE', () => {
    expect(formatRejection('big.so', 'FILE_TOO_LARGE', LIMITS, 40 * 1024 ** 2)).toBe(
      'big.so — Too large: 40 MB; the limit is 32 MB',
    );
  });
  it('states size and minimum for FILE_TOO_SMALL', () => {
    expect(formatRejection('tiny.so', 'FILE_TOO_SMALL', LIMITS, 2)).toBe('tiny.so — Too small: 2 B; the minimum is 10 B');
  });
  it('states the file limit for TOO_MANY_FILES', () => {
    expect(formatRejection('c.so', 'TOO_MANY_FILES', { ...LIMITS, maxFiles: 2 })).toBe(
      'c.so — Too many files; the limit is 2',
    );
  });
  it('reports duplicates', () => {
    expect(formatRejection('a.so', 'FILE_EXISTS', LIMITS)).toBe('a.so — Already added');
  });
  it('shows custom validate() strings verbatim', () => {
    expect(formatRejection('a.so', 'Missing spe_init export', LIMITS)).toBe('a.so — Missing spe_init export');
  });
});

describe('checkFile', () => {
  const file = (name: string, size = 20, type = '') => new File(['x'.repeat(size)], name, { type });

  it('accepts by extension, case-insensitive', () => {
    expect(checkFile(file('LIB.SO'), { acceptList: ['.so'] })).toEqual([]);
  });
  it('accepts exact and wildcard MIME types', () => {
    expect(checkFile(file('a.png', 20, 'image/png'), { acceptList: ['image/png'] })).toEqual([]);
    expect(checkFile(file('a.webp', 20, 'image/webp'), { acceptList: ['image/*'] })).toEqual([]);
  });
  it('rejects the wrong type', () => {
    expect(checkFile(file('a.txt'), { acceptList: ['.so'] })).toEqual(['FILE_INVALID_TYPE']);
  });
  it('accepts everything when acceptList is empty', () => {
    expect(checkFile(file('a.anything'), { acceptList: [] })).toEqual([]);
  });
  it('reports size limits and custom errors together', () => {
    expect(
      checkFile(file('a.so', 100), { acceptList: ['.so'], maxFileSize: 50, validate: () => ['Bad header'] }),
    ).toEqual(['FILE_TOO_LARGE', 'Bad header']);
    expect(checkFile(file('a.so', 1), { acceptList: [], minFileSize: 5 })).toEqual(['FILE_TOO_SMALL']);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run src/components/FileUpload/lib`
Expected: FAIL. The module `./index` cannot be resolved.

- [ ] **Step 3: Implement**

`src/components/FileUpload/types.ts`:

```ts
/**
 * Why a file was rejected. The first five are Ark/zag codes; any other string is a
 * message returned by the consumer's `validate()` and is shown verbatim.
 */
export type FileUploadErrorCode =
  | 'FILE_INVALID_TYPE'
  | 'FILE_TOO_LARGE'
  | 'FILE_TOO_SMALL'
  | 'TOO_MANY_FILES'
  | 'FILE_EXISTS'
  | (string & {});

export interface FileUploadRejection {
  file: File;
  errors: FileUploadErrorCode[];
}

/** A picked `File`, or a stored server file described by name (and optional size). */
export type FileUploadItemFile = File | { name: string; size?: number };

/** The limits the default rejection messages quote. */
export interface FileUploadLimits {
  acceptList: string[];
  maxFiles: number;
  maxFileSize?: number;
  minFileSize?: number;
}
```

`src/components/FileUpload/lib/formatFileSize.ts`:

```ts
const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

/** Binary units, at most one decimal, trailing `.0` dropped: `32 MB`, `40.5 MB`, `512 B`. */
export const formatFileSize = (bytes: number): string => {
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  let rounded = unit === 0 ? value : Math.round(value * 10) / 10;
  // 1023.96 KB rounds to 1024 KB — promote to the next unit instead.
  if (rounded >= 1024 && unit < UNITS.length - 1) {
    rounded = Math.round((rounded / 1024) * 10) / 10;
    unit += 1;
  }
  return `${rounded} ${UNITS[unit]}`;
};
```

(Template literals produce `40.5` or `32` naturally: `Math.round(x * 10) / 10` never leaves a `.0`.)

`src/components/FileUpload/lib/accept.ts`:

```ts
/** `'.so, .dylib'` / `['.lua', 'image/png,image/jpeg']` → `['.so', '.dylib']` / `['.lua', 'image/png', 'image/jpeg']`. */
export const toAcceptList = (accept?: string | string[]): string[] => {
  if (accept === undefined) return [];
  const parts = Array.isArray(accept) ? accept : [accept];
  return parts
    .flatMap(part => part.split(','))
    .map(part => part.trim())
    .filter(Boolean);
};

/** The native / Ark `accept` string, or `undefined` when nothing is restricted. */
export const toAcceptString = (accept?: string | string[]): string | undefined => {
  const list = toAcceptList(accept);
  return list.length ? list.join(',') : undefined;
};
```

`src/components/FileUpload/lib/formatRejection.ts`:

```ts
import type { FileUploadErrorCode, FileUploadLimits } from '../types';
import { formatFileSize } from './formatFileSize';

const describe = (code: FileUploadErrorCode, limits: FileUploadLimits, fileSize?: number): string => {
  switch (code) {
    case 'FILE_INVALID_TYPE':
      return `Not a ${limits.acceptList.join(' / ')} file`;
    case 'FILE_TOO_LARGE':
      return `Too large: ${formatFileSize(fileSize ?? 0)}; the limit is ${formatFileSize(limits.maxFileSize ?? 0)}`;
    case 'FILE_TOO_SMALL':
      return `Too small: ${formatFileSize(fileSize ?? 0)}; the minimum is ${formatFileSize(limits.minFileSize ?? 0)}`;
    case 'TOO_MANY_FILES':
      return `Too many files; the limit is ${limits.maxFiles}`;
    case 'FILE_EXISTS':
      return 'Already added';
    default:
      return code;
  }
};

/** Default message for one (file, error) pair: `{name} — {message}`. */
export const formatRejection = (
  fileName: string,
  code: FileUploadErrorCode,
  limits: FileUploadLimits,
  fileSize?: number,
): string => `${fileName} — ${describe(code, limits, fileSize)}`;
```

`src/components/FileUpload/lib/checkFile.ts`:

```ts
import type { FileUploadErrorCode } from '../types';

export interface FileCheckRules {
  acceptList: string[];
  maxFileSize?: number;
  minFileSize?: number;
  validate?: (file: File) => string[] | null;
}

const matchesAccept = (file: File, acceptList: string[]): boolean => {
  if (acceptList.length === 0) return true;
  const name = file.name.toLowerCase();
  const mime = file.type.toLowerCase();
  return acceptList.some(entry => {
    const type = entry.toLowerCase();
    if (type.startsWith('.')) return name.endsWith(type);
    if (type.endsWith('/*')) return mime.split('/')[0] === type.slice(0, -2);
    return mime === type;
  });
};

/**
 * The same rules Ark applies on pick/drop (type → size → custom), for the one path Ark
 * cannot validate without side effects: replacing a single file in multiple-file mode
 * (`api.setFiles` re-validates the whole list and would drop the original on failure).
 */
export const checkFile = (file: File, rules: FileCheckRules): FileUploadErrorCode[] => {
  const errors: FileUploadErrorCode[] = [];
  if (!matchesAccept(file, rules.acceptList)) errors.push('FILE_INVALID_TYPE');
  if (rules.maxFileSize !== undefined && file.size > rules.maxFileSize) errors.push('FILE_TOO_LARGE');
  if (rules.minFileSize !== undefined && file.size < rules.minFileSize) errors.push('FILE_TOO_SMALL');
  const custom = rules.validate?.(file);
  if (custom) errors.push(...custom);
  return errors;
};
```

`src/components/FileUpload/lib/index.ts`:

```ts
export { toAcceptList, toAcceptString } from './accept';
export { checkFile, type FileCheckRules } from './checkFile';
export { formatFileSize } from './formatFileSize';
export { formatRejection } from './formatRejection';
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm vitest run src/components/FileUpload/lib`
Expected: PASS, all tests green.

- [ ] **Step 5: Commit**

```bash
git add src/components/FileUpload/types.ts src/components/FileUpload/lib
git commit -m "feat(file-upload): add size, accept and rejection helpers

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Root `FileUpload`, context and classes

**Files:**
- Create: `src/components/FileUpload/classes.ts`, `FileUploadContext.tsx`, `FileUploadItemContext.tsx`, `FileUpload.tsx`, `index.ts`
- Test: `src/components/FileUpload/FileUpload.test.tsx` (create it with the shared helpers; for now import only what this task uses)

**Interfaces:**
- Consumes: Task 1 (`toAcceptList`, `toAcceptString`, `FileUploadRejection`, `FileUploadLimits`).
- Produces:
  - `FileUploadProps` (see the code below).
  - `interface FileUploadRootContextValue { api: UseFileUploadReturn; single: boolean; disabled: boolean; readOnly: boolean; invalid: boolean; locked: boolean; pickerHidden: boolean; pickerBlocked: boolean; accept: string | undefined; limits: FileUploadLimits; validate?: (file: File) => string[] | null; rejections: FileUploadRejection[]; reportRejections: (rejections: FileUploadRejection[]) => void; clearRejections: () => void; registerLoading: () => () => void; errorId: string }`
  - `useFileUploadRootContext(): FileUploadRootContextValue | null`
  - `useRequiredFileUploadRootContext(part: string): FileUploadRootContextValue`
  - `interface FileUploadItemContextValue { file: FileUploadItemFile; loading: boolean }`, `FileUploadItemContextProvider`, `useRequiredFileUploadItemContext(part: string)`
  - From `classes.ts`: `fileUploadVariants`, `fileUploadDropzoneVariants`, `fileUploadItemVariants`, `fileUploadErrorClassNames`, `fileUploadItemIconClassNames`, `fileUploadItemNameClassNames`, `fileUploadItemDescriptionClassNames`, `fileUploadItemActionsClassNames`

- [ ] **Step 1: Write the failing tests**

Create `FileUpload.test.tsx` with the shared helpers. For now, import only `FileUpload`, `Field` and the testing tools. Then add:

```tsx
describe('FileUpload — root', () => {
  it('renders a div root with slot + testid and a named hidden file input', () => {
    const { container } = render(<FileUpload data-testid='fu' name='artifact' accept='.wasm' />);
    const root = byTestId('fu');
    expect(root.tagName).toBe('DIV');
    expect(root).toHaveAttribute('data-slot', 'file-upload');
    const input = hiddenInput(container);
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('name', 'artifact');
    expect(input).toHaveAttribute('accept', '.wasm');
    expect(input).toHaveAttribute('data-testid', 'fu--hidden-input');
    expect(input).not.toHaveAttribute('multiple');
  });

  it('sets `multiple` on the hidden input when maxFiles > 1', () => {
    const { container } = render(<FileUpload maxFiles={3} />);
    expect(hiddenInput(container)).toHaveAttribute('multiple');
  });

  it('holds a picked file in the hidden input (nothing is uploaded) and reports it', () => {
    const onValueChange = vi.fn();
    const { container } = render(<FileUpload name='artifact' onValueChange={onValueChange} />);
    const file = makeFile();
    pick(container, file);
    expect(onValueChange).toHaveBeenLastCalledWith([file]);
    expect(hiddenInput(container).files?.[0]?.name).toBe('policy.wasm');
  });

  it('works controlled, and a re-render with an equal new array does not re-fire onValueChange', () => {
    const onValueChange = vi.fn();
    const file = makeFile();
    const { rerender } = render(<FileUpload value={[file]} onValueChange={onValueChange} />);
    rerender(<FileUpload value={[makeFile()]} onValueChange={onValueChange} />);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('forwards consumer attributes and ref to the root div', () => {
    const ref = vi.fn();
    render(<FileUpload data-testid='fu' id='x' aria-label='Artifact' ref={ref} />);
    expect(byTestId('fu')).toHaveAttribute('id', 'x');
    expect(byTestId('fu')).toHaveAttribute('aria-label', 'Artifact');
    expect(ref).toHaveBeenCalledWith(byTestId('fu'));
  });

  it('reads required / disabled from Field', () => {
    const { container } = render(
      <Field required disabled>
        <FileUpload name='a' />
      </Field>,
    );
    expect(hiddenInput(container)).toBeRequired();
    expect(hiddenInput(container)).toBeDisabled();
  });

  it('inherits the Field test-id cascade when it has no data-testid of its own', () => {
    const { container } = render(
      <Field data-testid='field'>
        <FileUpload name='a' />
      </Field>,
    );
    expect(hiddenInput(container)).toHaveAttribute('data-testid', 'field--hidden-input');
    // no duplicate: only the Field root carries `field`
    expect(container.querySelectorAll('[data-testid="field"]')).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run src/components/FileUpload/FileUpload.test.tsx`
Expected: FAIL. `./FileUpload` cannot be resolved.

- [ ] **Step 3: Implement `classes.ts`**

```ts
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';

/**
 * Root: vertical stack — picker, error, then the item list, 8px apart (Figma:
 * "8px before the first file and between files"; the 4px under the label is Field's gap).
 */
export const fileUploadVariants = cva('flex w-full min-w-0 flex-col gap-8');

/**
 * Dashed drop Area (Figma `file-upload-area`): fixed 96px tall, fills its container,
 * min 300px. Hover and drag-over share one brand look. `data-disabled` is set by the DS
 * for disabled / locked (uploading) / max-files-reached; `data-invalid` for Field errors
 * and rejections.
 */
export const fileUploadDropzoneVariants = cva(
  cn(
    'flex h-96 w-full min-w-300 cursor-pointer flex-col items-center justify-center gap-8 px-16 text-center',
    'rounded-12 border-1 border-dashed border-border-primary bg-states-primary-default-alt',
    'text-sm text-text-primary transition-colors outline-none',
    'focus-visible:ring-3 focus-visible:ring-focus-primary',
    'not-data-disabled:hover:border-border-brand not-data-disabled:hover:bg-states-brand-hover not-data-disabled:hover:text-text-brand',
    'data-dragging:border-border-brand data-dragging:bg-states-brand-hover data-dragging:text-text-brand',
    'data-invalid:border-border-strong-danger',
    'data-disabled:cursor-not-allowed data-disabled:text-text-disable-primary',
  ),
);

/**
 * One file row (Figma `file-upload-item`): 36px, or 52px with a description line.
 * Padding mirrors Figma's absolute offsets (details at 10/8, actions at right 6 / top 6).
 */
export const fileUploadItemVariants = cva(
  'group/item flex w-full min-w-0 items-start gap-8 rounded-12 bg-bg-primary py-8 pr-6 pl-10',
);

export const fileUploadItemIconClassNames = cn(
  'mt-2 flex shrink-0 text-icon-secondary group-data-loading/item:text-icon-primary-disable',
);

export const fileUploadItemNameClassNames = cn(
  'block truncate text-sm text-text-primary group-data-loading/item:text-text-disable-primary',
);

export const fileUploadItemDescriptionClassNames = cn('block truncate text-xs text-text-secondary');

/** Actions sit on the 24px button line: -2px pulls them to Figma's top-6 inside the py-8 row. */
export const fileUploadItemActionsClassNames = cn('-my-2 flex shrink-0 items-center gap-4');

export const fileUploadErrorClassNames = cn('flex flex-col gap-4 text-text-danger');
```

- [ ] **Step 4: Implement the contexts**

`FileUploadContext.tsx`:

```tsx
import { createContext, useContext } from 'react';
import type { UseFileUploadReturn } from '@ark-ui/react/file-upload';
import type { FileUploadLimits, FileUploadRejection } from './types';

export interface FileUploadRootContextValue {
  /** The Ark/zag API (accepted files, deleteFile, setFiles, openFilePicker, …). */
  api: UseFileUploadReturn;
  /** `maxFiles === 1`: a new pick replaces the file and the picker hides while one is chosen. */
  single: boolean;
  disabled: boolean;
  readOnly: boolean;
  /** Own `error` or Field `invalid` (rejections are tracked separately in `rejections`). */
  invalid: boolean;
  /** Some `FileUploadItem loading` is mounted — the picker is locked until it finishes. */
  locked: boolean;
  /** Pickers render nothing: read-only, or single mode with a file chosen. */
  pickerHidden: boolean;
  /** Pickers render but are inert: disabled, locked, or multiple mode at `maxFiles`. */
  pickerBlocked: boolean;
  /** Native / Ark accept string. */
  accept: string | undefined;
  limits: FileUploadLimits;
  validate?: (file: File) => string[] | null;
  /** Rejections to display (Ark's, minus single-mode FILE_EXISTS, plus multi-mode Replace ones). */
  rejections: FileUploadRejection[];
  /** Used by the multi-mode Replace, which validates outside Ark. */
  reportRejections: (rejections: FileUploadRejection[]) => void;
  /** Clears Ark's and the DS's rejections (on delete). */
  clearRejections: () => void;
  /** Registers one loading row; returns the unregister cleanup. */
  registerLoading: () => () => void;
  /** Id of `FileUploadError`, for `aria-describedby` on the pickers. */
  errorId: string;
}

const FileUploadRootContext = createContext<FileUploadRootContextValue | null>(null);

export const FileUploadRootContextProvider = FileUploadRootContext.Provider;

/** Nullable — rows (`FileUploadItem*`) may render outside a `FileUpload` (stored-file lists). */
export const useFileUploadRootContext = (): FileUploadRootContextValue | null =>
  useContext(FileUploadRootContext);

export const useRequiredFileUploadRootContext = (part: string): FileUploadRootContextValue => {
  const context = useContext(FileUploadRootContext);
  if (!context) throw new Error(`${part} must be rendered inside <FileUpload>.`);
  return context;
};
```

`FileUploadItemContext.tsx`:

```tsx
import { createContext, useContext } from 'react';
import type { FileUploadItemFile } from './types';

export interface FileUploadItemContextValue {
  file: FileUploadItemFile;
  loading: boolean;
}

const FileUploadItemContext = createContext<FileUploadItemContextValue | null>(null);

export const FileUploadItemContextProvider = FileUploadItemContext.Provider;

export const useRequiredFileUploadItemContext = (part: string): FileUploadItemContextValue => {
  const context = useContext(FileUploadItemContext);
  if (!context) throw new Error(`${part} must be rendered inside <FileUploadItem>.`);
  return context;
};
```

- [ ] **Step 5: Implement `FileUpload.tsx`**

```tsx
import {
  type ComponentPropsWithoutRef,
  type FC,
  type ReactNode,
  type Ref,
  useCallback,
  useId,
  useMemo,
  useState,
} from 'react';
import { useFieldContext } from '@ark-ui/react/field';
import {
  FileUpload as ArkFileUpload,
  type FileUploadFileAcceptDetails,
  type FileUploadFileRejectDetails,
  useFileUpload,
} from '@ark-ui/react/file-upload';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider, useTestId } from '../../utils/testId';
import { fileUploadVariants } from './classes';
import { FileUploadRootContextProvider, type FileUploadRootContextValue } from './FileUploadContext';
import { toAcceptList, toAcceptString } from './lib';
import type { FileUploadRejection } from './types';

export interface FileUploadProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'defaultValue' | 'children'>,
    TestableProps {
  /** Controlled accepted files. */
  value?: File[];
  /** Uncontrolled initial files. */
  defaultValue?: File[];
  /** Every change to the accepted list — pick, drop, replace, delete (then `[]`). */
  onValueChange?: (files: File[]) => void;
  /** Files that failed validation (for consumers that also want a toast). */
  onFileReject?: (rejections: FileUploadRejection[]) => void;
  /** Extensions and/or MIME types: `'.so,.dylib'`, `'image/png'`, `['.lua']`. */
  accept?: string | string[];
  /** Default `1`: a new pick replaces the file, and the picker hides while one is chosen. */
  maxFiles?: number;
  /** Bytes. Checked on pick, drop and replace. */
  maxFileSize?: number;
  /** Bytes. */
  minFileSize?: number;
  /** Custom rules; returned strings are shown verbatim as rejection messages. */
  validate?: (file: File) => string[] | null;
  /** Hidden input name — the files submit with a native form under it. */
  name?: string;
  required?: boolean;
  disabled?: boolean;
  /** Hides the picker, Delete and Replace; `FileUploadItemAction` (e.g. Download) stays. */
  readOnly?: boolean;
  /** Error state (maps to Ark `invalid`); also read from a wrapping `Field`. */
  error?: boolean;
  /** Default `true`. */
  allowDrop?: boolean;
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

/**
 * FileUpload — attach files to a form: pick with a drop Area (`FileUploadDropzone`) or a
 * button (`FileUploadTrigger`), check type and size before anything is sent, and list the
 * chosen files as `FileUploadItem` rows. Built on `@ark-ui/react/file-upload`.
 *
 * Picking never uploads: files are held in `value` and in the hidden input (`name`) and go
 * with the form on save. The consumer owns the network — mark a row `loading` while it
 * uploads (that locks the picker) and compose `FileUploadItemAction` for Download.
 * Reads `Field` context (label, required, disabled, read-only, invalid).
 */
export const FileUpload: FC<FileUploadProps> = ({
  value,
  defaultValue,
  onValueChange,
  onFileReject,
  accept,
  maxFiles = 1,
  maxFileSize,
  minFileSize,
  validate,
  name,
  required,
  disabled,
  readOnly,
  error = false,
  allowDrop = true,
  className,
  children,
  ref,
  'data-testid': testIdProp,
  ...rest
}) => {
  const field = useFieldContext();
  // No own test id → keep the parent's (e.g. Field's) cascade instead of cutting it off.
  const inheritedTestId = useTestId();
  const testId = testIdProp ?? inheritedTestId;

  // Ark spreads our props OVER its Field defaults, so pass fully resolved values.
  const isDisabled = disabled ?? field?.disabled ?? false;
  const isReadOnly = readOnly ?? field?.readOnly ?? false;
  const isRequired = required ?? field?.required ?? false;
  const invalid = error || Boolean(field?.invalid);
  const single = maxFiles <= 1;

  const [loadingCount, setLoadingCount] = useState(0);
  const registerLoading = useCallback(() => {
    setLoadingCount(count => count + 1);
    return () => setLoadingCount(count => count - 1);
  }, []);
  const locked = loadingCount > 0;

  // Rejections from the multi-mode Replace, which validates outside Ark.
  const [replaceRejections, setReplaceRejections] = useState<FileUploadRejection[]>([]);

  const acceptString = toAcceptString(accept);
  const acceptList = useMemo(() => toAcceptList(accept), [accept]);

  // Single mode: re-picking the identical file is a no-op, not an error.
  const visible = useCallback(
    (rejections: FileUploadRejection[]) =>
      rejections
        .map(r => ({ file: r.file, errors: single ? r.errors.filter(e => e !== 'FILE_EXISTS') : r.errors }))
        .filter(r => r.errors.length > 0),
    [single],
  );

  const handleAccept = useCallback(
    (details: FileUploadFileAcceptDetails) => {
      setReplaceRejections([]);
      onValueChange?.(details.files);
    },
    [onValueChange],
  );

  const handleReject = useCallback(
    (details: FileUploadFileRejectDetails) => {
      const shown = visible(details.files);
      if (shown.length) onFileReject?.(shown);
    },
    [visible, onFileReject],
  );

  const api = useFileUpload({
    name,
    accept: acceptString,
    maxFiles,
    maxFileSize,
    minFileSize,
    validate: validate ? file => validate(file) : undefined,
    required: isRequired,
    disabled: isDisabled,
    readOnly: isReadOnly,
    invalid,
    allowDrop: allowDrop && !locked,
    acceptedFiles: value,
    defaultAcceptedFiles: defaultValue,
    onFileAccept: handleAccept,
    onFileReject: handleReject,
  });

  const reportRejections = useCallback(
    (rejections: FileUploadRejection[]) => {
      setReplaceRejections(rejections);
      if (rejections.length) onFileReject?.(rejections);
    },
    [onFileReject],
  );

  const clearRejections = useCallback(() => {
    api.clearRejectedFiles();
    setReplaceRejections([]);
  }, [api]);

  const errorId = useId();
  const hasFiles = api.acceptedFiles.length > 0;
  const rejections = useMemo(
    () => [...visible(api.rejectedFiles), ...replaceRejections],
    [visible, api.rejectedFiles, replaceRejections],
  );

  const contextValue = useMemo<FileUploadRootContextValue>(
    () => ({
      api,
      single,
      disabled: isDisabled,
      readOnly: isReadOnly,
      invalid,
      locked,
      pickerHidden: isReadOnly || (single && hasFiles),
      pickerBlocked: isDisabled || locked || (!single && api.maxFilesReached),
      accept: acceptString,
      limits: { acceptList, maxFiles, maxFileSize, minFileSize },
      validate,
      rejections,
      reportRejections,
      clearRejections,
      registerLoading,
      errorId,
    }),
    [
      api,
      single,
      isDisabled,
      isReadOnly,
      invalid,
      locked,
      hasFiles,
      acceptString,
      acceptList,
      maxFiles,
      maxFileSize,
      minFileSize,
      validate,
      rejections,
      reportRejections,
      clearRejections,
      registerLoading,
      errorId,
    ],
  );

  return (
    <ArkFileUpload.RootProvider
      {...rest}
      value={api}
      ref={ref}
      data-slot='file-upload'
      // Only an OWN test id goes on the root — an inherited (Field) one would duplicate the Field's.
      data-testid={testIdProp}
      className={cn(fileUploadVariants(), className)}
    >
      <FileUploadRootContextProvider value={contextValue}>
        <TestIdProvider value={testId}>{children}</TestIdProvider>
      </FileUploadRootContextProvider>
      {/* Always mounted: Replace and form submission need it even while the picker is hidden. */}
      <ArkFileUpload.HiddenInput
        data-slot='file-upload-hidden-input'
        data-testid={testId ? `${testId}--hidden-input` : undefined}
      />
    </ArkFileUpload.RootProvider>
  );
};

FileUpload.displayName = 'FileUpload';
```

`index.ts`, the initial version. Later tasks add lines to it:

```ts
export {
  fileUploadDropzoneVariants,
  fileUploadItemVariants,
  fileUploadVariants,
} from './classes';
export { FileUpload, type FileUploadProps } from './FileUpload';
export type {
  FileUploadErrorCode,
  FileUploadItemFile,
  FileUploadRejection,
} from './types';
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `pnpm vitest run src/components/FileUpload`
Expected: PASS.

If `useFileUpload`'s `validate` signature complains, type the wrapper as `(file: File) => validate(file)`. Ark's `FileError` includes `AnyString`, so `string[]` is assignable.

If the "equal new array" test fails because `onValueChange` fires, do not work around it in the DS. Report it: it means Ark's `isEqual` is not being applied. Check that `acceptedFiles` is passed through unchanged.

- [ ] **Step 7: Typecheck and lint**

Run: `npx tsc --build tsconfig.app.json --noEmit --force && pnpm lint`
Expected: no errors in `src/components/FileUpload`.

- [ ] **Step 8: Commit**

```bash
git add src/components/FileUpload
git commit -m "feat(file-upload): add FileUpload root on Ark file-upload

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Pickers — `FileUploadDropzone` and `FileUploadTrigger`

**Files:**
- Create: `src/components/FileUpload/FileUploadDropzone.tsx`, `FileUploadTrigger.tsx`
- Modify: `src/components/FileUpload/index.ts`
- Test: `src/components/FileUpload/FileUpload.test.tsx` (append)

**Interfaces:**
- Consumes: `useRequiredFileUploadRootContext`, `fileUploadDropzoneVariants`, `ButtonProps` (from `../Button`).
- Produces:
  - `FileUploadDropzoneProps extends ComponentPropsWithoutRef<'div'> { icon?: ReactNode; ref?: Ref<HTMLDivElement> }`. Here `children` replaces the text.
  - `FileUploadTriggerProps = ButtonProps`

- [ ] **Step 1: Write the failing tests**

```tsx
describe('FileUpload — pickers', () => {
  it('renders the default Area with a role=button named by its text', () => {
    render(
      <FileUpload data-testid='fu'>
        <FileUploadDropzone />
      </FileUpload>,
    );
    const dz = byTestId('fu--dropzone');
    expect(dz).toHaveAttribute('data-slot', 'file-upload-dropzone');
    expect(dz).toHaveAttribute('role', 'button');
    expect(dz).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('button', { name: 'Drag and drop files or click to select' })).toBe(dz);
  });

  it('is named by the Field label plus its text', () => {
    render(
      <Field>
        <FieldLabel>WASM module</FieldLabel>
        <FileUpload>
          <FileUploadDropzone />
        </FileUpload>
      </Field>,
    );
    expect(
      screen.getByRole('button', { name: 'WASM module Drag and drop files or click to select' }),
    ).toBeInTheDocument();
  });

  it('opens the native picker on click and on Enter', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click');
    render(
      <FileUpload data-testid='fu'>
        <FileUploadDropzone />
      </FileUpload>,
    );
    await userEvent.click(byTestId('fu--dropzone'));
    await waitFor(() => expect(click).toHaveBeenCalledTimes(1));
    byTestId('fu--dropzone').focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(click).toHaveBeenCalledTimes(2));
    click.mockRestore();
  });

  it('renders the Button trigger with default content and opens the picker', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click');
    render(
      <FileUpload data-testid='fu'>
        <FileUploadTrigger />
      </FileUpload>,
    );
    const trigger = screen.getByRole('button', { name: 'Select file' });
    expect(trigger).toHaveAttribute('data-testid', 'fu--trigger');
    await userEvent.click(trigger);
    await waitFor(() => expect(click).toHaveBeenCalled());
    click.mockRestore();
  });

  it('hides the pickers in single mode once a file is chosen', () => {
    const { container } = render(
      <FileUpload data-testid='fu'>
        <FileUploadDropzone />
        <FileUploadTrigger />
      </FileUpload>,
    );
    pick(container, makeFile());
    expect(queryByTestId('fu--dropzone')).toBeNull();
    expect(queryByTestId('fu--trigger')).toBeNull();
    expect(hiddenInput(container)).toBeInTheDocument();
  });

  it('keeps the Area in multiple mode and blocks it at maxFiles', () => {
    const { container } = render(
      <FileUpload data-testid='fu' maxFiles={2}>
        <FileUploadDropzone />
      </FileUpload>,
    );
    pick(container, makeFile('a.wasm'));
    expect(byTestId('fu--dropzone')).not.toHaveAttribute('data-disabled');
    pick(container, makeFile('b.wasm'));
    expect(byTestId('fu--dropzone')).toHaveAttribute('data-disabled');
    expect(byTestId('fu--dropzone')).toHaveAttribute('aria-disabled', 'true');
  });

  it('is inert when disabled and hidden when read-only (also via Field)', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click');
    const { unmount } = render(
      <Field disabled>
        <FileUpload data-testid='fu'>
          <FileUploadDropzone />
          <FileUploadTrigger />
        </FileUpload>
      </Field>,
    );
    expect(byTestId('fu--dropzone')).toHaveAttribute('data-disabled');
    expect(byTestId('fu--trigger')).toBeDisabled();
    await userEvent.click(byTestId('fu--dropzone'));
    expect(click).not.toHaveBeenCalled();
    unmount();
    render(
      <Field readOnly>
        <FileUpload data-testid='fu'>
          <FileUploadDropzone />
          <FileUploadTrigger />
        </FileUpload>
      </Field>,
    );
    expect(queryByTestId('fu--dropzone')).toBeNull();
    expect(queryByTestId('fu--trigger')).toBeNull();
    click.mockRestore();
  });

  it('marks the Area invalid from Field', () => {
    render(
      <Field invalid>
        <FileUpload data-testid='fu'>
          <FileUploadDropzone />
        </FileUpload>
      </Field>,
    );
    expect(byTestId('fu--dropzone')).toHaveAttribute('data-invalid');
  });

  it('accepts custom text and icon', () => {
    render(
      <FileUpload data-testid='fu'>
        <FileUploadDropzone icon={<span data-testid='icon' />}>Choose a .wasm module or drop it here</FileUploadDropzone>
      </FileUpload>,
    );
    expect(screen.getByRole('button', { name: 'Choose a .wasm module or drop it here' })).toBeInTheDocument();
    expect(byTestId('icon')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run src/components/FileUpload/FileUpload.test.tsx -t pickers`
Expected: FAIL. `./FileUploadDropzone` cannot be resolved.

- [ ] **Step 3: Implement `FileUploadDropzone.tsx`**

```tsx
import { type ComponentPropsWithoutRef, type FC, type ReactNode, type Ref, useId } from 'react';
import { useFieldContext } from '@ark-ui/react/field';
import { FileUpload as ArkFileUpload } from '@ark-ui/react/file-upload';
import { Share } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { fileUploadDropzoneVariants } from './classes';
import { useRequiredFileUploadRootContext } from './FileUploadContext';

export interface FileUploadDropzoneProps extends ComponentPropsWithoutRef<'div'> {
  /** Replaces the default upload icon. */
  icon?: ReactNode;
  /** Replaces the default text ("Drag and drop files or click to select"). */
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

const DEFAULT_TEXT = 'Drag and drop files or click to select';

/**
 * Dashed drop Area — drop files on it, or click / Enter / Space to open the picker.
 * Hidden in single mode once a file is chosen and when read-only; inert while disabled,
 * while a row is uploading, and at `maxFiles`.
 */
export const FileUploadDropzone: FC<FileUploadDropzoneProps> = ({
  icon,
  children,
  className,
  ref,
  ...props
}) => {
  const ctx = useRequiredFileUploadRootContext('FileUploadDropzone');
  const field = useFieldContext();
  const testId = useTestId('dropzone');
  const textId = useId();

  if (ctx.pickerHidden) return null;

  const blocked = ctx.pickerBlocked;
  const hasRejections = ctx.rejections.length > 0;
  // Ark names the zone "dropzone"; name it by the Field label + the visible text instead.
  const labelledBy = [field?.ids.label, textId].filter(Boolean).join(' ');

  return (
    <ArkFileUpload.Dropzone
      aria-labelledby={labelledBy}
      aria-describedby={hasRejections ? ctx.errorId : undefined}
      {...props}
      ref={ref}
      disableClick={blocked}
      // Keep the button role while blocked (Ark switches to "application" with disableClick).
      role='button'
      aria-disabled={blocked || undefined}
      data-disabled={blocked ? '' : undefined}
      data-invalid={ctx.invalid || hasRejections ? '' : undefined}
      data-slot='file-upload-dropzone'
      data-testid={testId}
      className={cn(fileUploadDropzoneVariants(), className)}
    >
      {icon ?? <Share size='md' />}
      <span id={textId}>{children ?? DEFAULT_TEXT}</span>
    </ArkFileUpload.Dropzone>
  );
};

FileUploadDropzone.displayName = 'FileUploadDropzone';
```

- [ ] **Step 4: Implement `FileUploadTrigger.tsx`**

```tsx
import type { FC } from 'react';
import { FileUpload as ArkFileUpload } from '@ark-ui/react/file-upload';
import { Share } from '../../icons';
import { useTestId } from '../../utils/testId';
import { Button, type ButtonProps } from '../Button';
import { useRequiredFileUploadRootContext } from './FileUploadContext';

export type FileUploadTriggerProps = ButtonProps;

/**
 * "Select file" button — the compact picker for when space is tight. Takes every
 * `Button` prop (defaults: primary / brand / large). Hidden and blocked like the Area.
 */
export const FileUploadTrigger: FC<FileUploadTriggerProps> = ({
  children,
  disabled,
  'data-testid': testIdProp,
  ...props
}) => {
  const ctx = useRequiredFileUploadRootContext('FileUploadTrigger');
  const testId = useTestId('trigger', testIdProp);

  if (ctx.pickerHidden) return null;

  return (
    <ArkFileUpload.Trigger asChild>
      <Button
        variant='primary'
        color='brand'
        size='large'
        aria-describedby={ctx.rejections.length ? ctx.errorId : undefined}
        {...props}
        data-slot='file-upload-trigger'
        data-testid={testId}
        disabled={disabled || ctx.pickerBlocked}
      >
        {children ?? (
          <>
            <Share />
            Select file
          </>
        )}
      </Button>
    </ArkFileUpload.Trigger>
  );
};

FileUploadTrigger.displayName = 'FileUploadTrigger';
```

Add to `index.ts`:

```ts
export { FileUploadDropzone, type FileUploadDropzoneProps } from './FileUploadDropzone';
export { FileUploadTrigger, type FileUploadTriggerProps } from './FileUploadTrigger';
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm vitest run src/components/FileUpload`
Expected: PASS.

If the Enter test fails because focus lands on the hidden input or elsewhere, confirm that `tabindex="0"` is on the dropzone and that `aria-disabled` is not set. Do **not** add a manual `onKeyDown`: Ark handles Enter and Space.

- [ ] **Step 6: Typecheck, lint, commit**

```bash
npx tsc --build tsconfig.app.json --noEmit --force && pnpm lint
git add src/components/FileUpload
git commit -m "feat(file-upload): add Dropzone and Trigger pickers

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Rows — `FileUploadItemGroup` and `FileUploadItem` (with auto-lock)

**Files:**
- Create: `src/components/FileUpload/FileUploadItemGroup.tsx`, `FileUploadItem.tsx`
- Modify: `src/components/FileUpload/index.ts`
- Test: `src/components/FileUpload/FileUpload.test.tsx` (append)

**Interfaces:**
- Consumes: `useFileUploadRootContext`, `FileUploadItemContextProvider`, the item classes, `OverflowTooltip*`, `Loader`, the `File` icon.
- Produces:
  - `FileUploadItemGroupProps extends Omit<ComponentPropsWithoutRef<'ul'>, 'children'> { children?: ReactNode | ((file: File, index: number) => ReactNode); ref?: Ref<HTMLUListElement> }`
  - `FileUploadItemProps extends ComponentPropsWithoutRef<'li'> { file: FileUploadItemFile; description?: ReactNode; loading?: boolean; icon?: ReactNode; ref?: Ref<HTMLLIElement> }`

- [ ] **Step 1: Add the `Uploader` helper and write the failing tests**

Add this helper under the other helpers. Task 5 adds the triggers to it and Task 6 adds the error:

```tsx
const Uploader = ({
  children,
  ...props
}: Partial<ComponentProps<typeof FileUpload>> & { children?: ComponentProps<typeof FileUpload>['children'] }) => (
  <FileUpload data-testid='fu' name='artifact' {...props}>
    {children ?? (
      <>
        <FileUploadDropzone />
        <FileUploadItemGroup>{file => <FileUploadItem file={file} />}</FileUploadItemGroup>
      </>
    )}
  </FileUpload>
);
```

Then append:

```tsx
describe('FileUpload — rows', () => {
  it('lists accepted files as rows with name, testids and slots', () => {
    const { container } = render(<Uploader maxFiles={3} />);
    pick(container, makeFile('a.wasm'), makeFile('b.wasm'));
    const group = byTestId('fu--item-group');
    expect(group.tagName).toBe('UL');
    const rows = screen.getAllByTestId('fu--item');
    expect(rows).toHaveLength(2);
    expect(rows[0]?.tagName).toBe('LI');
    expect(screen.getAllByTestId('fu--item-name').map(n => n.textContent)).toEqual(['a.wasm', 'b.wasm']);
  });

  it('renders nothing for an empty list', () => {
    render(<Uploader />);
    expect(queryByTestId('fu--item-group')).toBeNull();
  });

  it('shows an optional description line', () => {
    render(
      <FileUpload data-testid='fu'>
        <FileUploadItemGroup>
          <FileUploadItem file={{ name: 'stored.wasm', size: 10 }} description='32 KB · uploads when you save' />
        </FileUploadItemGroup>
      </FileUpload>,
    );
    expect(byTestId('fu--item-description')).toHaveTextContent('32 KB · uploads when you save');
  });

  it('renders outside FileUpload for stored-file lists', () => {
    render(
      <FileUploadItemGroup data-testid='list'>
        <FileUploadItem data-testid='row' file={{ name: 'stored.so' }} />
      </FileUploadItemGroup>,
    );
    expect(byTestId('row')).toHaveTextContent('stored.so');
  });

  it('a loading row dims, shows a spinner, is aria-busy and locks the pickers', () => {
    const { rerender } = render(
      <FileUpload data-testid='fu' maxFiles={3}>
        <FileUploadDropzone />
        <FileUploadTrigger />
        <FileUploadItemGroup>
          <FileUploadItem file={{ name: 'up.wasm' }} loading />
        </FileUploadItemGroup>
      </FileUpload>,
    );
    const row = byTestId('fu--item');
    expect(row).toHaveAttribute('data-loading');
    expect(row).toHaveAttribute('aria-busy', 'true');
    expect(row.querySelector('[data-role="spinner"]')).not.toBeNull();
    expect(byTestId('fu--dropzone')).toHaveAttribute('aria-disabled', 'true');
    expect(byTestId('fu--trigger')).toBeDisabled();

    // Review focus #5: unmounting the loading row releases the lock.
    rerender(
      <FileUpload data-testid='fu' maxFiles={3}>
        <FileUploadDropzone />
        <FileUploadTrigger />
      </FileUpload>,
    );
    expect(byTestId('fu--dropzone')).not.toHaveAttribute('aria-disabled');
    expect(byTestId('fu--trigger')).toBeEnabled();
  });

  it('forwards consumer attributes and ref to the row li', () => {
    const ref = vi.fn();
    render(<FileUploadItem file={{ name: 'a' }} data-testid='row' data-analytics-id='FILE_ROW' ref={ref} />);
    expect(byTestId('row')).toHaveAttribute('data-analytics-id', 'FILE_ROW');
    expect(ref).toHaveBeenCalledWith(byTestId('row'));
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run src/components/FileUpload/FileUpload.test.tsx -t rows`
Expected: FAIL. Imports cannot be resolved.

- [ ] **Step 3: Implement `FileUploadItemGroup.tsx`**

```tsx
import { type ComponentPropsWithoutRef, type FC, Fragment, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { useFileUploadRootContext } from './FileUploadContext';

export interface FileUploadItemGroupProps extends Omit<ComponentPropsWithoutRef<'ul'>, 'children'> {
  /** A function maps over the accepted files; plain children render as-is (stored files). */
  children?: ReactNode | ((file: File, index: number) => ReactNode);
  ref?: Ref<HTMLUListElement>;
}

/** The list of chosen files (Figma slot "Items"), 8px apart. Renders nothing when empty. */
export const FileUploadItemGroup: FC<FileUploadItemGroupProps> = ({ children, className, ref, ...props }) => {
  const root = useFileUploadRootContext();
  const testId = useTestId('item-group');

  const files = root?.api.acceptedFiles ?? [];
  const content =
    typeof children === 'function'
      ? files.map((file, index) => (
          <Fragment key={`${file.name}-${file.size}-${file.lastModified}-${index}`}>{children(file, index)}</Fragment>
        ))
      : children;

  const isEmpty = content == null || content === false || (Array.isArray(content) && content.length === 0);
  if (isEmpty) return null;

  return (
    <ul
      {...props}
      ref={ref}
      data-slot='file-upload-item-group'
      data-testid={testId}
      className={cn('flex w-full min-w-0 flex-col gap-8', className)}
    >
      {content}
    </ul>
  );
};

FileUploadItemGroup.displayName = 'FileUploadItemGroup';
```

- [ ] **Step 4: Implement `FileUploadItem.tsx`**

```tsx
import { type ComponentPropsWithoutRef, type FC, type ReactNode, type Ref, useEffect, useMemo } from 'react';
import { File as FileIcon } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Loader } from '../Loader';
import { OverflowTooltip, OverflowTooltipContent, OverflowTooltipTrigger } from '../OverflowTooltip';
import {
  fileUploadItemActionsClassNames,
  fileUploadItemDescriptionClassNames,
  fileUploadItemIconClassNames,
  fileUploadItemNameClassNames,
  fileUploadItemVariants,
} from './classes';
import { useFileUploadRootContext } from './FileUploadContext';
import { FileUploadItemContextProvider } from './FileUploadItemContext';
import type { FileUploadItemFile } from './types';

export interface FileUploadItemProps extends ComponentPropsWithoutRef<'li'> {
  /** A picked `File`, or a stored file described by `{ name, size? }`. */
  file: FileUploadItemFile;
  /** Second line, e.g. "32 KB · uploads when you save". */
  description?: ReactNode;
  /** Uploading: dims the row, shows a spinner and locks the picker until it clears. */
  loading?: boolean;
  /** Replaces the default file icon. */
  icon?: ReactNode;
  /** Actions: `FileUploadItemReplaceTrigger`, `FileUploadItemAction`, `FileUploadItemDeleteTrigger`. */
  children?: ReactNode;
  ref?: Ref<HTMLLIElement>;
}

/**
 * One file: icon, name (truncates — full name in a tooltip), optional description and a
 * slot of small ghost icon actions. Works inside `FileUpload` or on its own (stored files).
 */
export const FileUploadItem: FC<FileUploadItemProps> = ({
  file,
  description,
  loading = false,
  icon,
  children,
  className,
  ref,
  ...props
}) => {
  const root = useFileUploadRootContext();
  const testId = useTestId('item');
  const nameTestId = useTestId('item-name');
  const descriptionTestId = useTestId('item-description');
  const registerLoading = root?.registerLoading;

  // A real side effect (not derived state): hold the root's upload lock while mounted + loading.
  useEffect(() => {
    if (!loading || !registerLoading) return;
    return registerLoading();
  }, [loading, registerLoading]);

  const itemContext = useMemo(() => ({ file, loading }), [file, loading]);
  const hasActions = Boolean(children) || loading;

  return (
    <li
      {...props}
      ref={ref}
      aria-busy={loading || undefined}
      data-loading={loading ? '' : undefined}
      data-slot='file-upload-item'
      data-testid={testId}
      className={cn(fileUploadItemVariants(), className)}
    >
      <span className={fileUploadItemIconClassNames}>{icon ?? <FileIcon size='md' />}</span>
      <div className='flex min-w-0 flex-1 flex-col'>
        <OverflowTooltip>
          <OverflowTooltipTrigger asChild>
            <span data-slot='file-upload-item-name' data-testid={nameTestId} className={fileUploadItemNameClassNames}>
              {file.name}
            </span>
          </OverflowTooltipTrigger>
          <OverflowTooltipContent>{file.name}</OverflowTooltipContent>
        </OverflowTooltip>
        {description ? (
          <span
            data-slot='file-upload-item-description'
            data-testid={descriptionTestId}
            className={fileUploadItemDescriptionClassNames}
          >
            {description}
          </span>
        ) : null}
      </div>
      {hasActions ? (
        <div data-slot='file-upload-item-actions' className={fileUploadItemActionsClassNames}>
          <FileUploadItemContextProvider value={itemContext}>{children}</FileUploadItemContextProvider>
          {loading ? <Loader type='sonner' size='md' color='primary' /> : null}
        </div>
      ) : null}
    </li>
  );
};

FileUploadItem.displayName = 'FileUploadItem';
```

Add to `index.ts`:

```ts
export { FileUploadItem, type FileUploadItemProps } from './FileUploadItem';
export { FileUploadItemGroup, type FileUploadItemGroupProps } from './FileUploadItemGroup';
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm vitest run src/components/FileUpload`
Expected: PASS for the rows and rejections tests. The rejection tests that use `fu--item` now pass too.

Before this passes, check two tokens: `grep -n "icon-primary-disable\|text-disable-primary" src/theme/semantic.css` must list both.

- [ ] **Step 6: Typecheck, lint, commit**

```bash
npx tsc --build tsconfig.app.json --noEmit --force && pnpm lint
git add src/components/FileUpload
git commit -m "feat(file-upload): add item rows with loading lock (WDS-186)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Row actions — Delete, Replace, Action

**Files:**
- Create: `src/components/FileUpload/FileUploadItemDeleteTrigger.tsx`, `FileUploadItemReplaceTrigger.tsx`, `FileUploadItemAction.tsx`
- Modify: `src/components/FileUpload/index.ts`
- Test: `src/components/FileUpload/FileUpload.test.tsx` (append)

**Interfaces:**
- Consumes: `useFileUploadRootContext`, `useRequiredFileUploadRootContext`, `useRequiredFileUploadItemContext`, `checkFile`, `Button`/`ButtonProps`.
- Produces: `FileUploadItemDeleteTriggerProps = ButtonProps`, `FileUploadItemReplaceTriggerProps = ButtonProps`, `FileUploadItemActionProps = ButtonProps`.

- [ ] **Step 1: Extend `Uploader` and write the failing tests**

In the `Uploader` helper, change the row to:

```tsx
<FileUploadItem file={file}>
  <FileUploadItemReplaceTrigger />
  <FileUploadItemDeleteTrigger />
</FileUploadItem>
```

Then append:

```tsx
describe('FileUpload — row actions', () => {
  it('Delete removes a picked file, with a default aria-label', async () => {
    const onValueChange = vi.fn();
    const { container } = render(<Uploader maxFiles={3} onValueChange={onValueChange} />);
    pick(container, makeFile('a.wasm'), makeFile('b.wasm'));
    await userEvent.click(screen.getByRole('button', { name: 'Delete a.wasm' }));
    expect(screen.getAllByTestId('fu--item-name').map(n => n.textContent)).toEqual(['b.wasm']);
    expect(onValueChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: 'b.wasm' })]);
  });

  it('Delete composes the consumer onClick and honours preventDefault', async () => {
    const onClick = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    const { container } = render(
      <Uploader>
        <FileUploadItemGroup>
          {file => (
            <FileUploadItem file={file}>
              <FileUploadItemDeleteTrigger onClick={onClick} />
            </FileUploadItem>
          )}
        </FileUploadItemGroup>
      </Uploader>,
    );
    pick(container, makeFile('keep.wasm'));
    await userEvent.click(byTestId('fu--item-delete-trigger'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(byTestId('fu--item-name')).toHaveTextContent('keep.wasm');
  });

  it('Delete on a loading row is "Cancel upload" and stays enabled while the picker is locked', async () => {
    const onCancel = vi.fn();
    render(
      <FileUpload data-testid='fu'>
        <FileUploadItemGroup>
          <FileUploadItem file={{ name: 'up.wasm' }} loading>
            <FileUploadItemReplaceTrigger />
            <FileUploadItemDeleteTrigger onClick={onCancel} />
          </FileUploadItem>
        </FileUploadItemGroup>
      </FileUpload>,
    );
    const cancel = screen.getByRole('button', { name: 'Cancel upload' });
    expect(cancel).toBeEnabled();
    expect(queryByTestId('fu--item-replace-trigger')).toBeNull();
    await userEvent.click(cancel);
    expect(onCancel).toHaveBeenCalled();
  });

  it('Delete for a stored file only runs the consumer handler', async () => {
    const onDetach = vi.fn();
    render(
      <FileUploadItem file={{ name: 'stored.so' }}>
        <FileUploadItemDeleteTrigger aria-label='Detach artifact' onClick={onDetach} />
      </FileUploadItem>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Detach artifact' }));
    expect(onDetach).toHaveBeenCalled();
  });

  it('Replace in single mode opens the picker and the new file replaces the old one', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click');
    const { container } = render(<Uploader />);
    pick(container, makeFile('old.wasm'));
    await userEvent.click(screen.getByRole('button', { name: 'Replace old.wasm' }));
    await waitFor(() => expect(click).toHaveBeenCalled());
    pick(container, makeFile('new.wasm'));
    expect(screen.getAllByTestId('fu--item-name').map(n => n.textContent)).toEqual(['new.wasm']);
    click.mockRestore();
  });

  it('Replace in multiple mode swaps only that file, in place', () => {
    const { container } = render(<Uploader maxFiles={3} accept='.wasm' />);
    pick(container, makeFile('a.wasm'), makeFile('b.wasm'));
    const replaceInputs = container.querySelectorAll<HTMLInputElement>('[data-slot="file-upload-item-replace-input"]');
    fireEvent.change(replaceInputs[0] as HTMLInputElement, { target: { files: [makeFile('c.wasm')] } });
    expect(screen.getAllByTestId('fu--item-name').map(n => n.textContent)).toEqual(['c.wasm', 'b.wasm']);
  });

  it('an invalid multi-mode replacement keeps the original (review focus #2)', () => {
    const onFileReject = vi.fn();
    const { container } = render(<Uploader maxFiles={3} accept='.wasm' onFileReject={onFileReject} />);
    pick(container, makeFile('a.wasm'), makeFile('b.wasm'));
    const replaceInputs = container.querySelectorAll<HTMLInputElement>('[data-slot="file-upload-item-replace-input"]');
    fireEvent.change(replaceInputs[0] as HTMLInputElement, { target: { files: [makeFile('evil.txt')] } });
    expect(screen.getAllByTestId('fu--item-name').map(n => n.textContent)).toEqual(['a.wasm', 'b.wasm']);
    expect(onFileReject).toHaveBeenLastCalledWith([expect.objectContaining({ errors: ['FILE_INVALID_TYPE'] })]);
  });

  it('read-only hides Delete and Replace but keeps FileUploadItemAction (Download)', async () => {
    const onDownload = vi.fn();
    render(
      <FileUpload data-testid='fu' readOnly defaultValue={[makeFile('a.wasm')]}>
        <FileUploadItemGroup>
          {file => (
            <FileUploadItem file={file}>
              <FileUploadItemReplaceTrigger />
              <FileUploadItemAction aria-label='Download a.wasm' onClick={onDownload}>
                <span />
              </FileUploadItemAction>
              <FileUploadItemDeleteTrigger />
            </FileUploadItem>
          )}
        </FileUploadItemGroup>
      </FileUpload>,
    );
    expect(queryByTestId('fu--item-delete-trigger')).toBeNull();
    expect(queryByTestId('fu--item-replace-trigger')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Download a.wasm' }));
    expect(onDownload).toHaveBeenCalled();
  });

  it('disabled disables every row action', () => {
    render(
      <FileUpload data-testid='fu' disabled defaultValue={[makeFile('a.wasm')]}>
        <FileUploadItemGroup>
          {file => (
            <FileUploadItem file={file}>
              <FileUploadItemReplaceTrigger />
              <FileUploadItemAction aria-label='Download'>
                <span />
              </FileUploadItemAction>
              <FileUploadItemDeleteTrigger />
            </FileUploadItem>
          )}
        </FileUploadItemGroup>
      </FileUpload>,
    );
    expect(byTestId('fu--item-delete-trigger')).toBeDisabled();
    expect(byTestId('fu--item-replace-trigger')).toBeDisabled();
    expect(byTestId('fu--item-action')).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run src/components/FileUpload/FileUpload.test.tsx -t "row actions"`
Expected: FAIL. Imports cannot be resolved.

- [ ] **Step 3: Implement `FileUploadItemDeleteTrigger.tsx`**

```tsx
import type { FC, MouseEvent } from 'react';
import { X } from '../../icons';
import { useTestId } from '../../utils/testId';
import { Button, type ButtonProps } from '../Button';
import { useFileUploadRootContext } from './FileUploadContext';
import { useRequiredFileUploadItemContext } from './FileUploadItemContext';

export type FileUploadItemDeleteTriggerProps = ButtonProps;

/**
 * X — removes a picked file (and clears any showing rejection). While the row is loading
 * it is the Cancel: your `onClick` aborts the request. For a stored `{ name }` file only
 * your `onClick` runs (e.g. detach). Call `event.preventDefault()` to skip the removal.
 */
export const FileUploadItemDeleteTrigger: FC<FileUploadItemDeleteTriggerProps> = ({
  children,
  onClick,
  disabled,
  'aria-label': ariaLabel,
  'data-testid': testIdProp,
  ...props
}) => {
  const root = useFileUploadRootContext();
  const item = useRequiredFileUploadItemContext('FileUploadItemDeleteTrigger');
  const testId = useTestId('item-delete-trigger', testIdProp);

  if (root?.readOnly) return null;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (root && item.file instanceof File) {
      root.api.deleteFile(item.file);
      root.clearRejections();
    }
  };

  return (
    <Button
      variant='ghost'
      color='neutral'
      size='small'
      aria-label={ariaLabel ?? (item.loading ? 'Cancel upload' : `Delete ${item.file.name}`)}
      {...props}
      data-slot='file-upload-item-delete-trigger'
      data-testid={testId}
      disabled={disabled || root?.disabled}
      onClick={handleClick}
    >
      {children ?? <X />}
    </Button>
  );
};

FileUploadItemDeleteTrigger.displayName = 'FileUploadItemDeleteTrigger';
```

- [ ] **Step 4: Implement `FileUploadItemReplaceTrigger.tsx`**

```tsx
import { type ChangeEvent, type FC, type MouseEvent, useRef } from 'react';
import { RefreshCcw } from '../../icons';
import { useTestId } from '../../utils/testId';
import { Button, type ButtonProps } from '../Button';
import { useRequiredFileUploadRootContext } from './FileUploadContext';
import { useRequiredFileUploadItemContext } from './FileUploadItemContext';
import { checkFile } from './lib';

export type FileUploadItemReplaceTriggerProps = ButtonProps;

/**
 * Refresh — swap this file for another. Single mode reopens the picker (the new file
 * replaces the old). Multiple mode replaces just this row, in place; an invalid
 * replacement keeps the original and shows the rejection. Hidden while read-only or
 * while the row is loading.
 */
export const FileUploadItemReplaceTrigger: FC<FileUploadItemReplaceTriggerProps> = ({
  children,
  onClick,
  disabled,
  'aria-label': ariaLabel,
  'data-testid': testIdProp,
  ...props
}) => {
  const root = useRequiredFileUploadRootContext('FileUploadItemReplaceTrigger');
  const item = useRequiredFileUploadItemContext('FileUploadItemReplaceTrigger');
  const inputRef = useRef<HTMLInputElement>(null);
  const testId = useTestId('item-replace-trigger', testIdProp);

  if (root.readOnly || item.loading) return null;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (root.single) root.api.openFilePicker();
    else inputRef.current?.click();
  };

  // Multiple mode: validate first — `setFiles` re-validates the whole list and would drop
  // the original if the replacement failed.
  const handleReplace = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!picked) return;
    const errors = checkFile(picked, {
      acceptList: root.limits.acceptList,
      maxFileSize: root.limits.maxFileSize,
      minFileSize: root.limits.minFileSize,
      validate: root.validate,
    });
    if (errors.length) {
      root.reportRejections([{ file: picked, errors }]);
      return;
    }
    root.api.setFiles(root.api.acceptedFiles.map(file => (file === item.file ? picked : file)));
  };

  return (
    <>
      <Button
        variant='ghost'
        color='neutral'
        size='small'
        aria-label={ariaLabel ?? `Replace ${item.file.name}`}
        {...props}
        data-slot='file-upload-item-replace-trigger'
        data-testid={testId}
        disabled={disabled || root.disabled}
        onClick={handleClick}
      >
        {children ?? <RefreshCcw />}
      </Button>
      {root.single ? null : (
        <input
          ref={inputRef}
          type='file'
          accept={root.accept}
          hidden
          tabIndex={-1}
          aria-hidden
          data-slot='file-upload-item-replace-input'
          onChange={handleReplace}
        />
      )}
    </>
  );
};

FileUploadItemReplaceTrigger.displayName = 'FileUploadItemReplaceTrigger';
```

- [ ] **Step 5: Implement `FileUploadItemAction.tsx`**

```tsx
import type { FC } from 'react';
import { useTestId } from '../../utils/testId';
import { Button, type ButtonProps } from '../Button';
import { useFileUploadRootContext } from './FileUploadContext';

export type FileUploadItemActionProps = ButtonProps;

/**
 * A small ghost icon action for a row with no built-in behaviour — e.g. Download
 * (`<FileUploadItemAction aria-label='Download policy.wasm' onClick={download}><Download /></FileUploadItemAction>`).
 * Disabled with the root; stays available when read-only.
 */
export const FileUploadItemAction: FC<FileUploadItemActionProps> = ({
  disabled,
  'data-testid': testIdProp,
  ...props
}) => {
  const root = useFileUploadRootContext();
  const testId = useTestId('item-action', testIdProp);

  return (
    <Button
      variant='ghost'
      color='neutral'
      size='small'
      {...props}
      data-slot='file-upload-item-action'
      data-testid={testId}
      disabled={disabled || root?.disabled}
    />
  );
};

FileUploadItemAction.displayName = 'FileUploadItemAction';
```

Add to `index.ts`:

```ts
export { FileUploadItemAction, type FileUploadItemActionProps } from './FileUploadItemAction';
export {
  FileUploadItemDeleteTrigger,
  type FileUploadItemDeleteTriggerProps,
} from './FileUploadItemDeleteTrigger';
export {
  FileUploadItemReplaceTrigger,
  type FileUploadItemReplaceTriggerProps,
} from './FileUploadItemReplaceTrigger';
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `pnpm vitest run src/components/FileUpload`
Expected: PASS, all tests.

If `ButtonProps`' `onClick` is typed polymorphically and `handleClick` does not fit, type the destructured `onClick` as `MouseEventHandler<HTMLButtonElement> | undefined`. Do not cast to `any`.

- [ ] **Step 7: Typecheck, lint, commit**

```bash
npx tsc --build tsconfig.app.json --noEmit --force && pnpm lint
git add src/components/FileUpload
git commit -m "feat(file-upload): add Delete, Replace and Action row triggers

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: `FileUploadError` — inline rejections

**Files:**
- Create: `src/components/FileUpload/FileUploadError.tsx`
- Modify: `src/components/FileUpload/index.ts`
- Test: `src/components/FileUpload/FileUpload.test.tsx` (append)

**Interfaces:**
- Consumes: `ctx.rejections`, `ctx.limits`, `ctx.errorId`, `formatRejection`, `fileUploadErrorClassNames`.
- Produces: `FileUploadErrorProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> { children?: (rejection: FileUploadRejection, code: FileUploadErrorCode) => ReactNode; ref?: Ref<HTMLDivElement> }`

- [ ] **Step 1: Write the failing tests**

```tsx
describe('FileUpload — rejections', () => {
  const Rejecting = (props: Partial<ComponentProps<typeof FileUpload>>) => (
    <Uploader accept='.so,.dylib' maxFileSize={32 * 1024 ** 2} {...props} />
  );

  it('renders nothing until a file is rejected', () => {
    render(<Rejecting />);
    expect(queryByTestId('fu--error')).toBeNull();
  });

  it('names the file and the type rule, marks the Area invalid, and describes it', () => {
    const onFileReject = vi.fn();
    const { container } = render(<Rejecting onFileReject={onFileReject} />);
    pick(container, makeFile('policy.txt', 3, 'text/plain'));
    const error = byTestId('fu--error');
    expect(error).toHaveAttribute('role', 'alert');
    expect(error).toHaveTextContent('policy.txt — Not a .so / .dylib file');
    expect(byTestId('fu--dropzone')).toHaveAttribute('data-invalid');
    expect(byTestId('fu--dropzone')).toHaveAttribute('aria-describedby', error.id);
    expect(onFileReject).toHaveBeenCalledWith([expect.objectContaining({ errors: ['FILE_INVALID_TYPE'] })]);
  });

  it('states size and limit for an oversized file', () => {
    const { container } = render(<Rejecting maxFileSize={10} />);
    pick(container, makeFile('big.so', 20));
    expect(byTestId('fu--error')).toHaveTextContent('big.so — Too large: 20 B; the limit is 10 B');
  });

  it('keeps the existing file when a replacement is rejected, and clears on the next good pick', () => {
    const { container } = render(<Rejecting />);
    pick(container, makeFile('good.so'));
    pick(container, makeFile('bad.txt'));
    expect(byTestId('fu--item')).toHaveTextContent('good.so');
    expect(byTestId('fu--error')).toBeInTheDocument();
    // single mode: the picker is hidden, but Replace (or a re-pick) still goes through the hidden input
    pick(container, makeFile('better.so'));
    expect(queryByTestId('fu--error')).toBeNull();
    expect(byTestId('fu--item')).toHaveTextContent('better.so');
  });

  it('ignores re-picking the identical file in single mode', () => {
    const onFileReject = vi.fn();
    const { container } = render(<Rejecting onFileReject={onFileReject} />);
    const file = makeFile('same.so');
    pick(container, file);
    pick(container, file);
    expect(queryByTestId('fu--error')).toBeNull();
    expect(onFileReject).not.toHaveBeenCalled();
  });

  it('reports duplicates and TOO_MANY_FILES in multiple mode', () => {
    const { container } = render(<Rejecting maxFiles={2} />);
    const file = makeFile('a.so');
    pick(container, file);
    pick(container, file);
    expect(byTestId('fu--error')).toHaveTextContent('a.so — Already added');
    pick(container, makeFile('b.so'), makeFile('c.so'));
    expect(byTestId('fu--error')).toHaveTextContent('Too many files; the limit is 2');
  });

  it('shows custom validate() messages verbatim and allows a message override', () => {
    const { container } = render(
      <Uploader validate={f => (f.name.startsWith('x') ? ['Missing spe_init export'] : null)}>
        <FileUploadDropzone />
        <FileUploadError>{(r, code) => `${code}: ${r.file.name}`}</FileUploadError>
      </Uploader>,
    );
    pick(container, makeFile('x.wasm'));
    expect(byTestId('fu--error')).toHaveTextContent('Missing spe_init export: x.wasm');
  });

  it('Delete clears a showing rejection (review focus #4)', async () => {
    const { container } = render(<Uploader accept='.wasm' maxFiles={3} />);
    pick(container, makeFile('a.wasm'));
    pick(container, makeFile('bad.txt'));
    expect(byTestId('fu--error')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Delete a.wasm' }));
    expect(queryByTestId('fu--error')).toBeNull();
  });

  it('an invalid multi-mode replacement names the new file inline (review focus #2)', () => {
    const { container } = render(<Uploader maxFiles={3} accept='.wasm' />);
    pick(container, makeFile('a.wasm'), makeFile('b.wasm'));
    const replaceInputs = container.querySelectorAll<HTMLInputElement>('[data-slot="file-upload-item-replace-input"]');
    fireEvent.change(replaceInputs[0] as HTMLInputElement, { target: { files: [makeFile('evil.txt')] } });
    expect(byTestId('fu--error')).toHaveTextContent('evil.txt — Not a .wasm file');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run src/components/FileUpload/FileUpload.test.tsx -t rejections`
Expected: FAIL. `./FileUploadError` cannot be resolved.

First, update the `Uploader` helper's default children to the final shape: add `<FileUploadError />` right after `<FileUploadDropzone />`, and import `FileUploadError`.


- [ ] **Step 3: Implement `FileUploadError.tsx`**

```tsx
import type { ComponentPropsWithoutRef, FC, ReactNode, Ref } from 'react';
import { OctagonAlert } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Text } from '../Text';
import { fileUploadErrorClassNames } from './classes';
import { useRequiredFileUploadRootContext } from './FileUploadContext';
import { formatRejection } from './lib';
import type { FileUploadErrorCode, FileUploadRejection } from './types';

export interface FileUploadErrorProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /** Override a message: called once per (file, error) pair. */
  children?: (rejection: FileUploadRejection, code: FileUploadErrorCode) => ReactNode;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Inline rejection message — names the file and the rule it broke ("policy.txt — Not a
 * .wasm file"). Renders nothing until a pick, drop or replace is rejected; clears on the
 * next accepted file or on delete. Styled like `FieldError`; use `FieldError` itself for
 * form-level errors (e.g. "required").
 */
export const FileUploadError: FC<FileUploadErrorProps> = ({ children, className, ref, ...props }) => {
  const ctx = useRequiredFileUploadRootContext('FileUploadError');
  const testId = useTestId('error');

  if (ctx.rejections.length === 0) return null;

  return (
    <div
      {...props}
      ref={ref}
      // Internal id: the pickers point `aria-describedby` at it.
      id={ctx.errorId}
      role='alert'
      data-slot='file-upload-error'
      data-testid={testId}
      className={cn(fileUploadErrorClassNames, className)}
    >
      {ctx.rejections.flatMap((rejection, i) =>
        rejection.errors.map(code => (
          <div key={`${i}-${code}`} className='flex gap-4'>
            <OctagonAlert size='md' className='my-2 shrink-0 self-start' />
            <Text size='sm' color='danger'>
              {children
                ? children(rejection, code)
                : formatRejection(rejection.file.name, code, ctx.limits, rejection.file.size)}
            </Text>
          </div>
        )),
      )}
    </div>
  );
};

FileUploadError.displayName = 'FileUploadError';
```

Add to `index.ts`: `export { FileUploadError, type FileUploadErrorProps } from './FileUploadError';`

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm vitest run src/components/FileUpload`
Expected: PASS, the whole file.

- [ ] **Step 5: Typecheck, lint, commit**

```bash
npx tsc --build tsconfig.app.json --noEmit --force && pnpm lint
git add src/components/FileUpload
git commit -m "feat(file-upload): add inline rejection error

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Analytics and test-id contract tests, `ANALYTICS_GAPS.md`

**Files:**
- Create: `src/components/FileUpload/ANALYTICS_GAPS.md`
- Test: `src/components/FileUpload/FileUpload.test.tsx` (append)

**Interfaces:** Consumes all parts. Produces no new code, unless a test exposes a gap. If one does, fix it in the offending part, following `docs/metrics/contract.md`.

- [ ] **Step 1: Write the tests**

```tsx
describe('FileUpload — analytics & test ids (docs/metrics/contract.md)', () => {
  const PROPS = '{"surface":"flow-policy","kind":"wasm"}';

  it('lands data-analytics-* on the real Dropzone node, verbatim, and captures clicks', async () => {
    const spy = captureAnalyticsClicks();
    render(
      <FileUpload data-testid='fu'>
        <FileUploadDropzone data-analytics-id='ARTIFACT_DROPZONE' data-analytics-props={PROPS} />
      </FileUpload>,
    );
    const dz = byTestId('fu--dropzone');
    expect(dz.tagName).toBe('DIV');
    expect(dz).toHaveAttribute('role', 'button');
    expect(dz.getAttribute('data-analytics-props')).toBe(PROPS);
    await userEvent.click(dz);
    expect(spy).toHaveBeenCalledWith('ARTIFACT_DROPZONE');
  });

  it('never puts the analytics id on the hidden input', () => {
    const { container } = render(
      <FileUpload>
        <FileUploadDropzone data-analytics-id='ARTIFACT_DROPZONE' />
        <FileUploadTrigger data-analytics-id='ARTIFACT_PICK' />
      </FileUpload>,
    );
    expect(hiddenInput(container)).not.toHaveAttribute('data-analytics-id');
  });

  it('lands data-analytics-* on the Trigger button and every row action button', () => {
    const { container } = render(
      <Uploader maxFiles={2}>
        <FileUploadTrigger data-analytics-id='ARTIFACT_PICK' />
        <FileUploadItemGroup>
          {file => (
            <FileUploadItem file={file}>
              <FileUploadItemReplaceTrigger data-analytics-id='ARTIFACT_REPLACE' />
              <FileUploadItemAction data-analytics-id='ARTIFACT_DOWNLOAD' aria-label='Download'>
                <span />
              </FileUploadItemAction>
              <FileUploadItemDeleteTrigger data-analytics-id='ARTIFACT_DELETE' data-analytics-props={PROPS} />
            </FileUploadItem>
          )}
        </FileUploadItemGroup>
      </Uploader>,
    );
    pick(container, makeFile());
    for (const id of ['ARTIFACT_PICK', 'ARTIFACT_REPLACE', 'ARTIFACT_DOWNLOAD', 'ARTIFACT_DELETE']) {
      const node = container.querySelector(`[data-analytics-id="${id}"]`);
      expect(node?.tagName).toBe('BUTTON');
    }
    expect(byTestId('fu--item-delete-trigger').getAttribute('data-analytics-props')).toBe(PROPS);
  });

  it('keeps the Dropzone analytics id after a file is added (multiple mode)', () => {
    const { container } = render(
      <FileUpload data-testid='fu' maxFiles={3}>
        <FileUploadDropzone data-analytics-id='ARTIFACT_DROPZONE' />
      </FileUpload>,
    );
    pick(container, makeFile());
    expect(byTestId('fu--dropzone')).toHaveAttribute('data-analytics-id', 'ARTIFACT_DROPZONE');
  });

  it('composes consumer handlers on the Dropzone and respects preventDefault', async () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click');
    const onClick = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <FileUpload data-testid='fu'>
        <FileUploadDropzone onClick={onClick} />
      </FileUpload>,
    );
    await userEvent.click(byTestId('fu--dropzone'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(click).not.toHaveBeenCalled();
    click.mockRestore();
  });

  it('a consumer data-testid on a part wins over the cascade', () => {
    render(
      <FileUpload data-testid='fu'>
        <FileUploadTrigger data-testid='artifact-pick' />
      </FileUpload>,
    );
    expect(byTestId('artifact-pick')).toHaveAttribute('data-slot', 'file-upload-trigger');
  });

  it('leaves the DOM free of data-testid when none is passed', () => {
    const { container } = render(<Uploader data-testid={undefined} />);
    expect(container.querySelector('[data-testid]')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests**

Run: `pnpm vitest run src/components/FileUpload`
Expected: PASS. If the "consumer handlers" test fails because the picker still opened, Ark's Dropzone `onClick` is running before the consumer's. In that case wrap the consumer handler so it runs first. Ark merges with `mergeProps`, and Ark's own handler checks `event.defaultPrevented`, so the order must be consumer first. Pass `onClick` explicitly **before** `{...props}` only if a failing test proves the order is wrong.

- [ ] **Step 3: Write `ANALYTICS_GAPS.md`**

```markdown
# FileUpload — analytics decisions

Follows `docs/metrics/contract.md`. Every interactive target is an exported part whose
`{...rest}` lands on the real DOM node:

| Target | Part | Node |
|---|---|---|
| Drop Area (click / Enter / Space / drop) | `FileUploadDropzone` | `div[role=button]` |
| "Select file" | `FileUploadTrigger` | `button` |
| Replace | `FileUploadItemReplaceTrigger` | `button` |
| Delete / Cancel | `FileUploadItemDeleteTrigger` | `button` |
| Download (and any other row action) | `FileUploadItemAction` | `button` |

## Known gaps (wrapper-level decisions)

- **Drag-and-drop is not a click.** Click-capture SDKs see the Area's click / Enter,
  not a drop. Consumers that need drop analytics listen for `drop` on the Area themselves
  (`onDrop` is forwarded and composed) or use `onValueChange` / `onFileReject`.
- **The native file input is not a target.** `input[type=file]` is hidden and
  `aria-hidden`; analytics never land on it (asserted in `FileUpload.test.tsx`). The
  multi-mode Replace uses its own internal hidden input, same rule.
- **`FileUploadError` owns its `id`.** The pickers reference it via `aria-describedby`,
  so a consumer `id` is overwritten. It is not interactive.

Owner: Design System team. Revisit when a consumer asks for drop-level events.
```

- [ ] **Step 4: Commit**

```bash
git add src/components/FileUpload
git commit -m "test(file-upload): cover analytics and test-id contracts

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Package exports and final `index.ts`

**Files:**
- Modify: `src/index.ts` (alphabetical block between the `FeedbackPulse` export, which ends around line 287, and `Field`)
- Modify: `src/components/FileUpload/index.ts` (check it matches below)

- [ ] **Step 1: Make sure `src/components/FileUpload/index.ts` reads exactly:**

```ts
export {
  fileUploadDropzoneVariants,
  fileUploadItemVariants,
  fileUploadVariants,
} from './classes';
export { FileUpload, type FileUploadProps } from './FileUpload';
export { FileUploadDropzone, type FileUploadDropzoneProps } from './FileUploadDropzone';
export { FileUploadError, type FileUploadErrorProps } from './FileUploadError';
export { FileUploadItem, type FileUploadItemProps } from './FileUploadItem';
export { FileUploadItemAction, type FileUploadItemActionProps } from './FileUploadItemAction';
export {
  FileUploadItemDeleteTrigger,
  type FileUploadItemDeleteTriggerProps,
} from './FileUploadItemDeleteTrigger';
export { FileUploadItemGroup, type FileUploadItemGroupProps } from './FileUploadItemGroup';
export {
  FileUploadItemReplaceTrigger,
  type FileUploadItemReplaceTriggerProps,
} from './FileUploadItemReplaceTrigger';
export { FileUploadTrigger, type FileUploadTriggerProps } from './FileUploadTrigger';
export type { FileUploadErrorCode, FileUploadItemFile, FileUploadRejection } from './types';
```

- [ ] **Step 2: Add the block to `src/index.ts`, right after the FeedbackPulse block:**

```ts
export {
  FileUpload,
  FileUploadDropzone,
  type FileUploadDropzoneProps,
  FileUploadError,
  type FileUploadErrorCode,
  type FileUploadErrorProps,
  FileUploadItem,
  FileUploadItemAction,
  type FileUploadItemActionProps,
  FileUploadItemDeleteTrigger,
  type FileUploadItemDeleteTriggerProps,
  type FileUploadItemFile,
  FileUploadItemGroup,
  type FileUploadItemGroupProps,
  type FileUploadItemProps,
  FileUploadItemReplaceTrigger,
  type FileUploadItemReplaceTriggerProps,
  type FileUploadProps,
  type FileUploadRejection,
  FileUploadTrigger,
  type FileUploadTriggerProps,
  fileUploadDropzoneVariants,
  fileUploadItemVariants,
  fileUploadVariants,
} from './components/FileUpload';
```

(If Biome reorders the specifiers, accept its order: `pnpm lint:fix`.)

- [ ] **Step 3: Verify**

Run: `npx tsc --build tsconfig.app.json --noEmit --force && pnpm lint && pnpm vitest run src/components/FileUpload`
Expected: no errors, all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/index.ts src/components/FileUpload/index.ts
git commit -m "feat(file-upload): export FileUpload from the package

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Storybook stories and docs

**Files:**
- Create: `src/components/FileUpload/FileUpload.stories.tsx`
- Modify: `../../docs/storybook-docs-coverage.md` (add a row next to the other `Inputs/*` rows)

**Interfaces:** The E2E task (Task 10) depends on the **exact story display names** listed here:
`Basic`, `Button Trigger`, `In Field`, `Multiple`, `Single File Chosen`, `With Description`, `Uploading`, `Validation`, `Disabled`, `Read Only`, `Stored File`, `Long File Name`, `Form Submission`.

- [ ] **Step 1: Write the stories**

```tsx
import { type FormEvent, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Download } from '../../icons';
import { Button } from '../Button';
import { Field, FieldDescription, FieldError, FieldIndicator, FieldLabel } from '../Field';
import { FileUpload, type FileUploadProps } from './FileUpload';
import { FileUploadDropzone } from './FileUploadDropzone';
import { FileUploadError } from './FileUploadError';
import { FileUploadItem } from './FileUploadItem';
import { FileUploadItemAction } from './FileUploadItemAction';
import { FileUploadItemDeleteTrigger } from './FileUploadItemDeleteTrigger';
import { FileUploadItemGroup } from './FileUploadItemGroup';
import { FileUploadItemReplaceTrigger } from './FileUploadItemReplaceTrigger';
import { FileUploadTrigger } from './FileUploadTrigger';
import { formatFileSize } from './lib';

const DESCRIPTION = [
  'Attaches files to a form: drop them on an Area or pick them with a button, and the type and size are checked before anything is sent.',
  'Picking never uploads — files are held until the form is saved, and the product marks a row `loading` while it sends it. Reach for `Input` instead when the value is a path or URL, not a file.',
].join(' ');

const MB = 1024 ** 2;
const sample = (name: string, size = 48 * 1024) => new File([new Uint8Array(size)], name);

const Rows = () => (
  <FileUploadItemGroup>
    {file => (
      <FileUploadItem file={file}>
        <FileUploadItemReplaceTrigger />
        <FileUploadItemDeleteTrigger />
      </FileUploadItem>
    )}
  </FileUploadItemGroup>
);

const meta = {
  title: 'Inputs/FileUpload',
  component: FileUpload,
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
  args: { maxFiles: 1, disabled: false, readOnly: false, error: false },
  argTypes: {
    value: { control: false },
    defaultValue: { control: false },
    onValueChange: { control: false },
    onFileReject: { control: false },
    validate: { control: false },
    ref: { control: false },
    maxFiles: { control: 'number' },
    maxFileSize: { control: 'number' },
    accept: { control: 'text' },
  },
  decorators: [
    Story => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FileUpload>;

export default meta;

/** The drop Area — the picker to use when attaching a file is the main task. Click anywhere or drop. */
export const Basic: StoryFn<FileUploadProps> = args => (
  <FileUpload data-testid='file-upload' {...args}>
    <FileUploadDropzone data-analytics-id='FILE_UPLOAD_DROPZONE' />
    <FileUploadError />
    <Rows />
  </FileUpload>
);

/** The compact picker for tight spaces — the same behaviour behind a "Select file" button. */
export const ButtonTrigger: StoryFn<FileUploadProps> = args => (
  <FileUpload data-testid='file-upload' {...args}>
    <FileUploadTrigger />
    <FileUploadError />
    <Rows />
  </FileUpload>
);

/** Inside `Field`: the label names the Area, and the description carries the format and the limit. */
export const InField: StoryFn<FileUploadProps> = args => (
  <Field required data-testid='field'>
    <FieldLabel>
      WASM module
      <FieldIndicator />
    </FieldLabel>
    <FieldDescription>Exports memory, spe_alloc, spe_free, spe_init, spe_on_phase · up to 32 MB</FieldDescription>
    <FileUpload data-testid='file-upload' accept='.wasm' maxFileSize={32 * MB} {...args}>
      <FileUploadDropzone>Choose a .wasm module or drop it here</FileUploadDropzone>
      <FileUploadError />
      <Rows />
    </FileUpload>
  </Field>
);

/** With `maxFiles` above one the picker stays, and each file stacks below it. */
export const Multiple: StoryFn<FileUploadProps> = args => (
  <FileUpload
    data-testid='file-upload'
    {...args}
    maxFiles={5}
    defaultValue={[sample('rules.lua'), sample('headers.lua')]}
  >
    <FileUploadDropzone />
    <FileUploadError />
    <Rows />
  </FileUpload>
);

/** One file allowed and chosen: the picker hides, and Replace in the row swaps the file. */
export const SingleFileChosen: StoryFn<FileUploadProps> = args => (
  <FileUpload data-testid='file-upload' {...args} defaultValue={[sample('policy.wasm')]}>
    <FileUploadDropzone />
    <FileUploadError />
    <Rows />
  </FileUpload>
);

/** A second line on the row for size and status — here, that the file goes with the form. */
export const WithDescription: StoryFn<FileUploadProps> = args => (
  <FileUpload data-testid='file-upload' {...args} defaultValue={[sample('policy.wasm')]}>
    <FileUploadDropzone />
    <FileUploadItemGroup>
      {file => (
        <FileUploadItem file={file} description={`${formatFileSize(file.size)} · uploads when you save`}>
          <FileUploadItemReplaceTrigger />
          <FileUploadItemDeleteTrigger />
        </FileUploadItem>
      )}
    </FileUploadItemGroup>
  </FileUpload>
);

/** A row marked `loading` dims and spins, and the picker locks until it finishes; X cancels. */
export const Uploading: StoryFn<FileUploadProps> = args => (
  <FileUpload data-testid='file-upload' {...args} maxFiles={5} defaultValue={[sample('rules.lua')]}>
    <FileUploadDropzone />
    <FileUploadItemGroup>
      {file => (
        <FileUploadItem file={file}>
          <FileUploadItemReplaceTrigger />
          <FileUploadItemDeleteTrigger />
        </FileUploadItem>
      )}
    </FileUploadItemGroup>
    <FileUploadItemGroup>
      <FileUploadItem file={{ name: 'headers.lua' }} loading>
        <FileUploadItemDeleteTrigger />
      </FileUploadItem>
    </FileUploadItemGroup>
  </FileUpload>
);

/** Only `.so` / `.dylib` up to 32 KB: anything else is refused inline, naming the file and the rule. */
export const Validation: StoryFn<FileUploadProps> = args => (
  <FileUpload data-testid='file-upload' {...args} accept='.so,.dylib' maxFileSize={32 * 1024}>
    <FileUploadDropzone />
    <FileUploadError />
    <Rows />
  </FileUpload>
);

/** Disabled: nothing responds, and the Area and the row actions dim. */
export const Disabled: StoryFn<FileUploadProps> = args => (
  <div className='flex flex-col gap-16'>
    <FileUpload data-testid='file-upload' {...args} disabled>
      <FileUploadDropzone />
    </FileUpload>
    <FileUpload {...args} disabled defaultValue={[sample('policy.wasm')]}>
      <Rows />
    </FileUpload>
  </div>
);

/** Read-only: the picker, Replace and Delete go away; a Download action stays. */
export const ReadOnly: StoryFn<FileUploadProps> = args => (
  <FileUpload data-testid='file-upload' {...args} readOnly defaultValue={[sample('policy.wasm')]}>
    <FileUploadDropzone />
    <FileUploadItemGroup>
      {file => (
        <FileUploadItem file={file}>
          <FileUploadItemReplaceTrigger />
          <FileUploadItemAction aria-label={`Download ${file.name}`}>
            <Download />
          </FileUploadItemAction>
          <FileUploadItemDeleteTrigger />
        </FileUploadItem>
      )}
    </FileUploadItemGroup>
  </FileUpload>
);

/** A file already on the server is a row too — described by name and size, with Download and Detach. */
export const StoredFile: StoryFn<FileUploadProps> = () => (
  <FileUploadItemGroup data-testid='stored'>
    <FileUploadItem file={{ name: 'policy.wasm', size: 48 * 1024 }} description='48 KB · attached'>
      <FileUploadItemAction aria-label='Download policy.wasm'>
        <Download />
      </FileUploadItemAction>
      <FileUploadItemDeleteTrigger aria-label='Detach artifact' />
    </FileUploadItem>
  </FileUploadItemGroup>
);

/** Long names truncate; hover shows the full name. */
export const LongFileName: StoryFn<FileUploadProps> = args => (
  <FileUpload
    data-testid='file-upload'
    {...args}
    defaultValue={[sample('flow-policy-artifact-for-the-production-edge-cluster-eu-central-1.wasm')]}
  >
    <Rows />
  </FileUpload>
);

/** Nothing uploads on pick: the file travels with the form's `FormData` under `name` when it is submitted. */
export const FormSubmission: StoryFn<FileUploadProps> = args => {
  const [submitted, setSubmitted] = useState<string>('');
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const file = new FormData(event.currentTarget).get('artifact');
    setSubmitted(file instanceof File && file.name ? `${file.name} (${formatFileSize(file.size)})` : 'nothing');
  };
  return (
    <form onSubmit={onSubmit} className='flex flex-col gap-12'>
      <Field required>
        <FieldLabel>
          Artifact
          <FieldIndicator />
        </FieldLabel>
        <FileUpload data-testid='file-upload' name='artifact' {...args}>
          <FileUploadTrigger />
          <Rows />
        </FileUpload>
        {submitted === 'nothing' ? <FieldError>Attach a file</FieldError> : null}
      </Field>
      <Button type='submit' variant='outline' color='neutral' data-testid='submit'>
        Save
      </Button>
      {submitted && submitted !== 'nothing' ? (
        <p className='sb-annotation' data-testid='submitted'>
          Submitted: {submitted}
        </p>
      ) : null}
    </form>
  );
};
```

- [ ] **Step 2: Typecheck the stories**

Run: `npx tsc -p tsconfig.storybook.json --noEmit 2>&1 | grep FileUpload`
Expected: no output.

- [ ] **Step 3: Check them visually**

Run `pnpm storybook`, open `Inputs/FileUpload`, and check each story against the Figma screenshots in the spec. Check that:
- hover over the Area turns it orange;
- the loading row shows a spinner and the Area goes dim;
- the long name truncates and shows a tooltip on hover.

Fix class mismatches in `classes.ts`, not in the stories.

- [ ] **Step 4: Documentation pass**

Invoke the `storybook-docs` skill for `FileUpload`. It may tighten `DESCRIPTION` and the per-story sentences; keep the story **names** above unchanged. Add the coverage row to `docs/storybook-docs-coverage.md`, following the other `Inputs/*` rows:

```markdown
| ✅ | Inputs/FileUpload | 13 | 13 | `components/FileUpload/FileUpload.stories.tsx` |
```

(Match the column meaning of neighbouring rows. If the header counts pages, bump it by one.)

- [ ] **Step 5: Commit**

```bash
git add src/components/FileUpload/FileUpload.stories.tsx ../../docs/storybook-docs-coverage.md
git commit -m "docs(file-upload): add FileUpload stories

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Playwright E2E

**Files:**
- Create: `src/components/FileUpload/FileUpload.e2e.ts`

**Interfaces:**
- Consumes the story names from Task 9.
- Test ids used:
  - `file-upload`, `file-upload--dropzone`, `file-upload--trigger`, `file-upload--hidden-input`, `file-upload--error`, `file-upload--item`, `file-upload--item-name`, `file-upload--item-delete-trigger`, `file-upload--item-replace-trigger`
  - `field` (the In Field story passes it to `Field`; FileUpload has its own `file-upload`)
  - `submit`, `submitted`

- [ ] **Step 1: Write the E2E file**

```ts
import { expect, type Page, test } from '@playwright/test';
import { createStoryHelper } from '@wallarm-org/playwright-config/storybook';

const fileUploadStory = createStoryHelper('inputs-fileupload', [
  'Basic',
  'Button Trigger',
  'In Field',
  'Multiple',
  'Single File Chosen',
  'With Description',
  'Uploading',
  'Validation',
  'Disabled',
  'Read Only',
  'Stored File',
  'Long File Name',
  'Form Submission',
] as const);

const file = (name: string, size = 16) => ({ name, mimeType: 'application/octet-stream', buffer: Buffer.alloc(size) });

const pick = (page: Page, ...files: ReturnType<typeof file>[]) =>
  page.getByTestId('file-upload--hidden-input').setInputFiles(files);

test.describe('Component: FileUpload', () => {
  test.describe('Visual', () => {
    test('Should render the drop area correctly', async ({ page }) => {
      await fileUploadStory.goto(page, 'Basic');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the drop area hover state correctly', async ({ page }) => {
      await fileUploadStory.goto(page, 'Basic');
      await page.getByTestId('file-upload--dropzone').hover();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the drag-over state correctly', async ({ page }) => {
      await fileUploadStory.goto(page, 'Basic');
      const dataTransfer = await page.evaluateHandle(() => {
        const dt = new DataTransfer();
        dt.items.add(new File(['x'], 'dragged.wasm'));
        return dt;
      });
      await page.getByTestId('file-upload--dropzone').dispatchEvent('dragover', { dataTransfer });
      await expect(page.getByTestId('file-upload--dropzone')).toHaveAttribute('data-dragging', '');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the button trigger correctly', async ({ page }) => {
      await fileUploadStory.goto(page, 'Button Trigger');
      await expect(page).toHaveScreenshot();
    });

    test('Should render inside a field with label and description correctly', async ({ page }) => {
      await fileUploadStory.goto(page, 'In Field');
      await expect(page).toHaveScreenshot();
    });

    test('Should render a list of files correctly', async ({ page }) => {
      await fileUploadStory.goto(page, 'Multiple');
      await expect(page).toHaveScreenshot();
    });

    test('Should render a chosen single file with the picker hidden correctly', async ({ page }) => {
      await fileUploadStory.goto(page, 'Single File Chosen');
      await expect(page.getByTestId('file-upload--dropzone')).toHaveCount(0);
      await expect(page).toHaveScreenshot();
    });

    test('Should render an item with a description correctly', async ({ page }) => {
      await fileUploadStory.goto(page, 'With Description');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the uploading state with a locked picker correctly', async ({ page }) => {
      await fileUploadStory.goto(page, 'Uploading');
      await expect(page.getByTestId('file-upload--dropzone')).toHaveAttribute('aria-disabled', 'true');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the rejected state correctly', async ({ page }) => {
      await fileUploadStory.goto(page, 'Validation');
      await pick(page, file('policy.txt'));
      await expect(page.getByTestId('file-upload--error')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });

    test('Should render the disabled state correctly', async ({ page }) => {
      await fileUploadStory.goto(page, 'Disabled');
      await expect(page).toHaveScreenshot();
    });

    test('Should render the read-only state correctly', async ({ page }) => {
      await fileUploadStory.goto(page, 'Read Only');
      await expect(page).toHaveScreenshot();
    });

    test('Should render a stored file row correctly', async ({ page }) => {
      await fileUploadStory.goto(page, 'Stored File');
      await expect(page).toHaveScreenshot();
    });

    test('Should render a truncated long file name with its tooltip correctly', async ({ page }) => {
      await fileUploadStory.goto(page, 'Long File Name');
      await page.getByTestId('file-upload--item-name').hover();
      await expect(page.getByRole('tooltip')).toBeVisible();
      await expect(page).toHaveScreenshot();
    });
  });

  test.describe('Interactions', () => {
    test('Should list a file when it is picked', async ({ page }) => {
      await fileUploadStory.goto(page, 'Basic');
      await pick(page, file('policy.wasm'));
      await expect(page.getByTestId('file-upload--item-name')).toHaveText('policy.wasm');
      await expect(page.getByTestId('file-upload--dropzone')).toHaveCount(0);
    });

    test('Should list a file when it is dropped', async ({ page }) => {
      await fileUploadStory.goto(page, 'Basic');
      const dataTransfer = await page.evaluateHandle(() => {
        const dt = new DataTransfer();
        dt.items.add(new File(['x'], 'dropped.wasm'));
        return dt;
      });
      await page.getByTestId('file-upload--dropzone').dispatchEvent('drop', { dataTransfer });
      await expect(page.getByTestId('file-upload--item-name')).toHaveText('dropped.wasm');
    });

    test('Should reject a file when its type is not accepted', async ({ page }) => {
      await fileUploadStory.goto(page, 'Validation');
      await pick(page, file('policy.txt'));
      await expect(page.getByTestId('file-upload--error')).toHaveText('policy.txt — Not a .so / .dylib file');
      await expect(page.getByTestId('file-upload--item')).toHaveCount(0);
    });

    test('Should reject a file when it is over the size limit', async ({ page }) => {
      await fileUploadStory.goto(page, 'Validation');
      await pick(page, file('big.so', 40 * 1024));
      await expect(page.getByTestId('file-upload--error')).toHaveText('big.so — Too large: 40 KB; the limit is 32 KB');
    });

    test('Should remove a file when delete is clicked', async ({ page }) => {
      await fileUploadStory.goto(page, 'Multiple');
      await page.getByTestId('file-upload--item-delete-trigger').first().click();
      await expect(page.getByTestId('file-upload--item')).toHaveCount(1);
      await expect(page.getByTestId('file-upload--item-name')).toHaveText('headers.lua');
    });

    test('Should swap the file when replace is used in single mode', async ({ page }) => {
      await fileUploadStory.goto(page, 'Single File Chosen');
      const chooser = page.waitForEvent('filechooser');
      await page.getByTestId('file-upload--item-replace-trigger').click();
      await (await chooser).setFiles(file('replacement.wasm'));
      await expect(page.getByTestId('file-upload--item-name')).toHaveText('replacement.wasm');
    });

    test('Should submit the held file with the form when saved', async ({ page }) => {
      await fileUploadStory.goto(page, 'Form Submission');
      await pick(page, file('artifact.so', 2048));
      await page.getByTestId('submit').click();
      await expect(page.getByTestId('submitted')).toHaveText('Submitted: artifact.so (2 KB)');
    });
  });

  test.describe('Accessibility', () => {
    test('Should be operable via keyboard on the drop area', async ({ page }) => {
      await fileUploadStory.goto(page, 'Basic');
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('file-upload--dropzone')).toBeFocused();
      const chooser = page.waitForEvent('filechooser');
      await page.keyboard.press('Enter');
      await chooser;
    });

    test('Should be named by the field label via aria-labelledby', async ({ page }) => {
      await fileUploadStory.goto(page, 'In Field');
      await expect(
        page.getByRole('button', { name: 'WASM module * Choose a .wasm module or drop it here' }),
      ).toBeVisible();
    });

    test('Should be reachable via keyboard for row actions', async ({ page }) => {
      await fileUploadStory.goto(page, 'Single File Chosen');
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('file-upload--item-replace-trigger')).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('file-upload--item-delete-trigger')).toBeFocused();
    });
  });
});
```

The accessible name in the In Field test includes the `*` from `FieldIndicator`. If Playwright computes it without the asterisk, use `{ name: /WASM module.*Choose a \.wasm module or drop it here/ }`.

- [ ] **Step 2: Typecheck**

Run: `npx tsc -p tsconfig.e2e.json --noEmit 2>&1 | grep FileUpload`
Expected: no output.

- [ ] **Step 3: Run the Interactions and Accessibility suites locally**

Start `pnpm storybook` (from `packages/design-system`, and keep it running). Then, from the repo root:

```bash
pnpm e2e:docker:design-system -- --grep "Component: FileUpload"
```

Expected:
- Interactions and Accessibility pass.
- Visual tests fail only with "missing snapshot". There are no baselines yet, which is expected.

If the script ignores `--grep`, run the whole design-system suite and filter the report for FileUpload.

- [ ] **Step 4: Commit and generate baselines in CI**

```bash
git add src/components/FileUpload/FileUpload.e2e.ts
git commit -m "test(file-upload): add Playwright visual, interaction and a11y tests [update-screenshots]

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Screenshot baselines come from CI through the `[update-screenshots]` trigger once the branch is pushed. Do not run `e2e:docker:update` locally. **Pushing is a separate step and needs the user's go-ahead.**

---

### Task 11: Figma Code Connect, spec sync and final verification

**Files:**
- Create: `src/components/FileUpload/FileUpload.figma.tsx`
- Modify: `../../docs/superpowers/specs/2026-09-30-file-upload-design.md` (§4 Replace note)

- [ ] **Step 1: Write Code Connect**

```tsx
import figma from '@figma/code-connect';
import { Download } from '../../icons';
import { Field, FieldLabel } from '../Field';
import { FileUpload } from './FileUpload';
import { FileUploadDropzone } from './FileUploadDropzone';
import { FileUploadItem } from './FileUploadItem';
import { FileUploadItemAction } from './FileUploadItemAction';
import { FileUploadItemDeleteTrigger } from './FileUploadItemDeleteTrigger';
import { FileUploadItemGroup } from './FileUploadItemGroup';
import { FileUploadItemReplaceTrigger } from './FileUploadItemReplaceTrigger';
import { FileUploadTrigger } from './FileUploadTrigger';

// WADS Components → File upload page.
const FILE_UPLOAD_URL =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12403-10372';
const AREA_URL = 'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12400-8762';
const ITEM_URL = 'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12403-10197';

figma.connect(FileUpload, FILE_UPLOAD_URL, {
  variant: { Type: 'Area' },
  example: () => (
    <Field>
      <FieldLabel>Label</FieldLabel>
      <FileUpload>
        <FileUploadDropzone />
        <FileUploadItemGroup>
          {file => (
            <FileUploadItem file={file}>
              <FileUploadItemReplaceTrigger />
              <FileUploadItemDeleteTrigger />
            </FileUploadItem>
          )}
        </FileUploadItemGroup>
      </FileUpload>
    </Field>
  ),
});

figma.connect(FileUpload, FILE_UPLOAD_URL, {
  variant: { Type: 'Button' },
  example: () => (
    <Field>
      <FieldLabel>Label</FieldLabel>
      <FileUpload>
        <FileUploadTrigger />
      </FileUpload>
    </Field>
  ),
});

figma.connect(FileUploadDropzone, AREA_URL, {
  example: () => <FileUploadDropzone />,
});

figma.connect(FileUploadItem, ITEM_URL, {
  props: {
    loading: figma.enum('State', { Loading: true, Default: false }),
    description: figma.boolean('Description', { true: 'description', false: undefined }),
  },
  example: ({ loading, description }) => (
    <FileUploadItem file={{ name: 'file-name.format' }} loading={loading} description={description}>
      <FileUploadItemAction aria-label='Download file-name.format'>
        <Download />
      </FileUploadItemAction>
      <FileUploadItemDeleteTrigger />
    </FileUploadItem>
  ),
});
```

Run `npx tsc -p tsconfig.app.json --noEmit 2>&1 | grep FileUpload.figma` (or the tsconfig that includes the existing `*.figma.tsx`; check `grep -l "figma.tsx" tsconfig*.json`).
Expected: no errors.

The Figma property names `State`, `Description` and `Type` come from the component-set variant names in Figma. If a property is absent there, drop that mapping; do not invent one.

- [ ] **Step 2: Sync the spec**

In §4 of the spec, change the `FileUploadItemReplaceTrigger` row to add: *"Multiple mode pre-validates the replacement with `lib/checkFile` (type, size, custom) before `setFiles`, because `setFiles` re-validates the whole list and would drop the original on failure. Its rejections are held in DS state and cleared on the next accept or delete."*

- [ ] **Step 3: Full verification (every command must be green)**

From `packages/design-system/`:

```bash
pnpm vitest run src/components/FileUpload
npx tsc --build tsconfig.app.json --noEmit --force
npx tsc -p tsconfig.storybook.json --noEmit 2>&1 | grep FileUpload || true
npx tsc -p tsconfig.e2e.json --noEmit 2>&1 | grep FileUpload || true
pnpm lint
pnpm test:run
```

Expected:
- FileUpload unit tests pass, and the full unit suite shows no new failures.
- tsc reports no FileUpload errors.
- Biome is clean.

Record the pass counts for the PR description.

- [ ] **Step 4: Commit**

```bash
git add src/components/FileUpload/FileUpload.figma.tsx ../../docs/superpowers/specs/2026-09-30-file-upload-design.md
git commit -m "feat(file-upload): add Figma Code Connect

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Afterwards, hand back to the user for the push, the CI `[update-screenshots]` run and the PR. The PR title is `feat(file-upload): File upload and File upload item (WDS-185, WDS-186)`. None of this is done without their go-ahead.
