# FileUpload — design spec (WDS-185 + WDS-186)

- **Tickets:** [WDS-185 File upload](https://wallarm.atlassian.net/browse/WDS-185), [WDS-186 File upload item](https://wallarm.atlassian.net/browse/WDS-186) — shipped together in one branch/PR.
- **Figma:** [WADS-Components → File upload](https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12395-8543)
- **Base:** `@ark-ui/react/file-upload` (Ark 5.38.0 / `@zag-js/file-upload` 1.43.0)
- **First consumer:** flow-management-frontend `PolicyFileField` (WASM / Plugin / Lua artifact, one file per policy)

## 1. Goal

Give forms a drop zone and a file picker that do the following:

- Validate type and size before anything is sent.
- Hold the chosen file(s) until the form is saved. **Picking never uploads.**
- Show each file as a row with actions: Replace, Delete, Download.

The consumer owns the network: upload, download, and detaching a stored file. The DS owns selection, validation, display, and states.

## 2. Decisions

| # | Decision |
|---|---|
| D1 | Build a compound component on top of Ark UI (approach A). No monolithic props component and no preset for now. |
| D2 | Item rows (WDS-186) ship in the same PR. |
| D3 | Rejections show inline via `FileUploadError`, not as a toast. `onFileReject` is still exposed for consumers that also want a toast. |
| D4 | Multiple files are supported through `maxFiles`. The default is `1`, and in that mode the picker stays visible once a file is chosen. A new pick replaces the file, and the chosen file appears below the picker. |
| D5 | Auto-lock: any `FileUploadItem loading` locks the picker (Dropzone and Trigger) through root context. Delete stays enabled because it acts as Cancel. |
| D6 | `FileUploadItem` is a DS-owned presentational row. It accepts `File` **or** `{ name, size? }`, so stored server files use the same row. It works inside and outside `FileUpload`. |
| D7 | Out of scope (YAGNI): a DS upload helper or progress percentage; whole-window drop overlay; image previews; re-exporting Ark's raw `useFileUploadContext`. |

## 3. Anatomy (maps to Figma)

```
FileUpload (root, Ark FileUpload.Root, renders HiddenInput itself)
├── FileUploadDropzone          Figma "file-upload-area"   (Type=Area)
│   or FileUploadTrigger        Figma Button "Select file" (Type=Button)
├── FileUploadError             inline rejection message (not in Figma — see §9)
└── FileUploadItemGroup         Figma slot "Items"
    └── FileUploadItem          Figma "file-upload-item"
        ├── FileUploadItemReplaceTrigger   RefreshCcw
        ├── FileUploadItemAction           e.g. Download (consumer-composed)
        └── FileUploadItemDeleteTrigger    X  (acts as Cancel while loading)
```

Label, description, and required marker come from the existing `Field`, `FieldLabel`, `FieldIndicator`, and `FieldDescription`. There is no FileUpload-specific label part.

### Usage

```tsx
<Field required>
  <FieldLabel>WASM module<FieldIndicator /></FieldLabel>
  <FieldDescription>Exports memory, spe_alloc, spe_free, spe_init, spe_on_phase · up to 32 MB</FieldDescription>
  <FileUpload name='artifact' accept='.wasm' maxFileSize={32 * 1024 ** 2} value={files} onValueChange={setFiles}>
    <FileUploadDropzone />
    <FileUploadError />
    <FileUploadItemGroup>
      {file => (
        <FileUploadItem file={file} description='uploads when you save'>
          <FileUploadItemReplaceTrigger />
          <FileUploadItemDeleteTrigger />
        </FileUploadItem>
      )}
    </FileUploadItemGroup>
  </FileUpload>
</Field>
```

A stored file with Download and Detach, both handled by the consumer:

```tsx
<FileUploadItemGroup>
  <FileUploadItem file={{ name: stored.fileName, size: stored.size }}>
    <FileUploadItemAction aria-label={`Download ${stored.fileName}`} onClick={download}><Download /></FileUploadItemAction>
    <FileUploadItemDeleteTrigger aria-label='Detach artifact' onClick={detach} />
  </FileUploadItem>
</FileUploadItemGroup>
```

React Hook Form, single file:

```tsx
<Controller name='file' control={control} render={({ field }) => (
  <FileUpload name={field.name} value={field.value ? [field.value] : []} onValueChange={v => field.onChange(v[0] ?? null)}>…</FileUpload>
)} />
```

## 4. API

### `FileUpload` (root)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `File[]` | — | Controlled. Maps to Ark `acceptedFiles`. |
| `defaultValue` | `File[]` | `[]` | Uncontrolled. Maps to Ark `defaultAcceptedFiles`. |
| `onValueChange` | `(files: File[]) => void` | — | Fires on every accepted-list change, including delete and clear (with `[]`). Unwrapped from Ark `onFileAccept`. |
| `onFileReject` | `(rejections: FileUploadRejection[]) => void` | — | Unwrapped from Ark `onFileReject`. |
| `accept` | `string \| string[]` | — | Takes extensions and/or MIME types: `'.so,.dylib'`, `'image/png'`, `['.lua']`. The DS normalizes them to what Ark expects. |
| `maxFiles` | `number` | `1` | |
| `maxFileSize` / `minFileSize` | `number` (bytes) | `Infinity` / `0` | |
| `validate` | `(file: File) => string[] \| null` | — | Custom rules. The returned strings are shown verbatim as messages. |
| `name` | `string` | — | Name of the hidden input, used for native form submission. |
| `required`, `disabled`, `readOnly` | `boolean` | from `Field` | `readOnly` is resolved as `readOnly ?? field?.readOnly` and passed explicitly (Ark does not read it from Field). |
| `error` | `boolean` | from `Field.invalid` | DS convention: `error` maps to Ark `invalid`. |
| `allowDrop` | `boolean` | `true` | |
| `className`, `children`, `ref`, `data-testid` | | | The root is a `div` with `data-slot='file-upload'`, laid out `flex flex-col gap-8`. |

Everything else Ark offers stays internal: `directory`, `capture`, `transformFiles`, `translations`, `ids`, `locale`, `preventDocumentDrop`. They are not exposed until someone needs them.

Root-level DS context is memoized and holds:

- the resolved `disabled`, `readOnly`, and `invalid` flags
- `single` (`maxFiles === 1`)
- `locked`, meaning some item is loading, tracked with a registered counter
- `hasRejections`
- the error element id, used for `aria-describedby`

### Parts

Every part follows the same rules:

- Its props type is based on its element's native attributes.
- `{...rest}` lands on the real DOM node.
- It has `data-slot`, a `useTestId(slot)` cascade, `ref`, and `displayName`.
- Internal handlers compose with consumer handlers, and a consumer can skip the internal behaviour with `event.preventDefault()`.

| Part | Element / base | Props (beyond native) | Behaviour |
|---|---|---|---|
| `FileUploadDropzone` | `div` (Ark `Dropzone`) | `children?` (default: `Share` icon + "Drag and drop files or click to select") | Click, Enter/Space, or drop opens or accepts files. Stays visible once a file is chosen; hidden only when `readOnly`. It looks disabled when `disabled`, `locked`, or when the maximum number of files is reached. In that case click and drop are disabled: `disableClick` plus DS guards and root `allowDrop` go false. Slot `dropzone`. |
| `FileUploadTrigger` | DS `Button` via Ark `Trigger asChild` | All `ButtonProps`. Default `variant='primary' color='brand' size='large'`. Default children: `<Share />Select file` | Stays visible once a file is chosen; hidden only when `readOnly`. Disabled when `disabled`, `locked`, or the maximum is reached. Slot `trigger`. |
| `FileUploadError` | `div role='alert'` | `children?: (rejection: FileUploadRejection, error: FileUploadErrorCode) => ReactNode` | Renders nothing when there are no rejections. Otherwise it renders one line per (file, error) pair in `FieldError` style. Slot `error`. |
| `FileUploadItemGroup` | `ul` | `children: ReactNode \| ((file: File, index: number) => ReactNode)` | With a function child, it maps over the accepted files. Renders nothing when the list is empty. Layout: `flex flex-col gap-8`. Slot `item-group`. |
| `FileUploadItem` | `li` | `file: File \| { name: string; size?: number }` (required), `description?: ReactNode`, `loading?: boolean`, `icon?: ReactNode` (default `File`), `children` = actions | Provides the item context (`file`, `loading`). While `loading`, it registers the lock with the root. Slot `item`; the name, description, and actions parts get `item-name`, `item-description`, `item-actions`. |
| `FileUploadItemDeleteTrigger` | DS `Button` ghost/neutral/small, icon `X` | `ButtonProps`, `children?` (default `<X />`) | If the item's `file` is a `File` inside a root, it calls Ark `deleteFile(file)`. Otherwise it only runs the consumer's `onClick`. Default `aria-label`: `Delete {name}`, or `Cancel upload` while loading. Hidden when `readOnly`. Slot `item-delete-trigger`. |
| `FileUploadItemReplaceTrigger` | DS `Button` ghost/neutral/small, icon `RefreshCcw` | `ButtonProps`, `children?` | In `single` mode it calls `openFilePicker()`, and the new file replaces the old one. With multiple files it opens a DS-owned per-item hidden `<input type=file accept=…>` (see below). Default `aria-label`: `Replace {name}`. Hidden when `readOnly` or the item is loading. Slot `item-replace-trigger`. Multiple mode pre-validates the replacement with `lib/checkFile` (type, size, custom) before `setFiles`, because `setFiles` re-validates the whole list and would drop the original on failure; its rejections are held in DS state and cleared on the next accept or delete. |
| `FileUploadItemAction` | DS `Button` ghost/neutral/small | `ButtonProps` | Generic icon action such as Download. It has no built-in behaviour. It is disabled when the root is `disabled`, and stays enabled when the root is `readOnly`. Slot `item-action`. |

Delete, Replace, and Action each show a tooltip with the short action label (Figma): `Delete` (`Cancel upload` while loading), `Replace`, and the Action's string `aria-label` (no tooltip when it has none). A disabled action shows none.

How the multi-file per-item replace input behaves:

- On `change`, it first validates the picked file with `lib/checkFile` (type, size, custom).
- If valid, it calls `setFiles(accepted.map(f => f === target ? picked : f))`.
- If invalid, it reports the rejection to DS state and never calls `setFiles`, so the original file stays in the list. `setFiles` re-validates the whole list and would drop the original on failure.

Exported types:

- `FileUploadProps` and every `*Props`.
- `FileUploadRejection = { file: File; errors: FileUploadErrorCode[] }`.
- `FileUploadErrorCode = 'FILE_INVALID_TYPE' | 'FILE_TOO_LARGE' | 'FILE_TOO_SMALL' | 'TOO_MANY_FILES' | 'FILE_EXISTS' | (string & {})`.
- `FileUploadItemFile = File | { name: string; size?: number }`.

## 5. Behaviour

1. **Nothing uploads.** Ark's `syncInputElement` writes the accepted files into the hidden input's `files` (via `DataTransfer`) and dispatches a bubbling `change`. A native `<form>` or `FormData` carries them under `name`.
2. **Validation** runs the same way for pick, drop, and replace: `accept`, then size, then `validate`. That is Ark's `getEventFiles`.
3. **Single mode:**
   - A valid new file replaces the old one. The picker stays visible after a pick, with the chosen file shown below it.
   - An invalid file keeps the old one and sets the rejections.
   - Re-picking an identical file (same name, size, and type) is silently ignored: the DS filters out `FILE_EXISTS` when `single`.
4. **Multiple mode:**
   - New files are appended.
   - Duplicates produce `Already added`.
   - A batch over the limit rejects with `TOO_MANY_FILES`.
5. **Rejection lifetime.** Rejections clear on the next successful accept, on delete, and on clear. While there are rejections, the Dropzone carries `data-invalid` (styled with a danger dashed border) and `aria-describedby` points to `FileUploadError`.
6. **Auto-lock.** Each `FileUploadItem loading` increments a counter in root context: register on mount or when `loading` turns on, unregister on cleanup. That is a real side effect, not derived state, so the effect is appropriate. When `locked`:
   - the Dropzone and Trigger are disabled;
   - Delete (Cancel) stays active;
   - Replace is hidden on the loading row;
   - the hidden input's `click` is cancelled, so a `Field` label (its `htmlFor` points to the hidden input) and single-mode Replace cannot open the picker either. The same holds for `disabled` and multiple mode at `maxFiles`.

   **Drop guards.** Ark `allowDrop` is passed as `allowDrop && !locked && !atMaxFiles`, so zag never enters `dragging` or accepts a drop while the Area is off. Because zag's `preventDocumentDrop` reads `allowDrop` only once at start, the DS sets it to `false` and runs its own document guard, which re-evaluates while `allowDrop && !disabled`. The root also cancels any `dragover`/`drop` inside the component that the Area did not take, such as a drop on the dimmed Area or on a row. It shows a "no drop" cursor, and the browser never opens the file and navigates away from the form.

   Root `disabled` is **not** used for this. It would disable Delete and remove the hidden input from `FormData`.
7. **`readOnly`:**
   - The picker, Delete, and Replace are hidden. `FileUploadItemAction` (Download) remains.
   - Known Ark behaviour: the hidden input is `disabled` in read-only mode, so files are not submitted. That is acceptable, because a read-only field has nothing to submit.
8. **`disabled`:** everything is inert and styled disabled, and the Field label dims (existing behaviour).

## 6. Default messages (`FileUploadError`)

The format is `{file.name} — {message}`.

| Code | Message |
|---|---|
| `FILE_INVALID_TYPE` | `Not a {accept joined with " / "} file`, e.g. `Not a .so / .dylib file` |
| `FILE_TOO_LARGE` | `Too large: {size}; the limit is {maxFileSize}` |
| `FILE_TOO_SMALL` | `Too small: {size}; the minimum is {minFileSize}` |
| `TOO_MANY_FILES` | `Too many files; the limit is {maxFiles}` |
| `FILE_EXISTS` | `Already added` (multiple mode only) |
| custom (`validate`) | the string itself |

Sizes use binary units (B, KB, MB, GB with 1024 steps), with at most one decimal and a trailing `.0` dropped (`32 MB`, `40.5 MB`). This lives in the internal `lib/formatFileSize.ts`. Consumers override any message through the `FileUploadError` render-prop.

## 7. Visual spec (Figma → tokens)

**Dropzone.** It fills its container: `w-full min-w-300 h-96 rounded-12 border-1 border-dashed`. Its content is a centered column with `gap-8`: a 16px icon above `text-sm` text.

| State | Classes |
|---|---|
| default | `bg-states-primary-default-alt border-border-primary text-text-primary` |
| hover / drag-over (`data-dragging`) — same look | `bg-states-brand-hover border-border-brand text-text-brand` |
| disabled / locked | `text-text-disable-primary cursor-not-allowed`, no hover |
| invalid | `border-border-strong-danger` (**pending designer confirmation**) |
| focus-visible | `outline-none ring-3 ring-focus-primary` |

**Item.** Layout `bg-bg-primary rounded-12 pl-10 pr-6 py-6` (height 36, or 52 with a description), then:

- icon `File`, `size='md'`, `text-icon-secondary`, with a `gap-8` to the text;
- the name, `text-sm text-text-primary`, truncated inside `OverflowTooltip`;
- the description, `text-xs text-text-secondary`, aligned under the name;
- the actions, `gap-4`, as ghost neutral small icon Buttons (24px).

When loading, the name and icon switch to `text-text-disable-primary` and a `Loader type='sonner' size='md'` appears after the actions.

**Layout.** `Field` already puts 4px under the label. The root puts 8px between the picker, the error, and the item group, and the item group puts 8px between items. That matches Figma: "4px under the label · 8px before the first file and between files".

## 8. Accessibility

- **Dropzone:** `role=button`, `tabIndex=0`, and Enter/Space open the picker (Ark). Its accessible name comes from `aria-labelledby` = [Field label id, own text id], which replaces Ark's default `"dropzone"`. It gets `aria-disabled` when disabled or locked, and `aria-describedby` points to the error when there are rejections.
- **Trigger:** a native button with visible text. It gets `aria-describedby` to the error when there are rejections.
- **Icon actions:** have default `aria-label`s (§4), which the consumer can override. Row actions show a tooltip with the short verb; the accessible name stays the full `aria-label`.
- **Truncated names:** the full name appears in a tooltip, and the `li` stays readable in full by screen readers.
- **FileUploadError:** `role=alert`, so new rejections are announced.

## 9. Open items to confirm with design

- The invalid Dropzone look (danger dashed border). It is not in Figma.
- Deviation from Figma: pickers stay visible after a pick (product decision 2026-09-30). Figma still shows the picker hiding for a single file; ask design to update.
- `Loader` size (`sonner`, `md` 16px vs Figma's `sm` 12px). The spec uses `md` to match the 16px file icon.

## 10. Files

Under `packages/design-system/src/components/FileUpload/`:

- `FileUpload.tsx`, `FileUploadDropzone.tsx`, `FileUploadTrigger.tsx`, `FileUploadError.tsx`
- `FileUploadItemGroup.tsx`, `FileUploadItem.tsx`, `FileUploadItemDeleteTrigger.tsx`, `FileUploadItemReplaceTrigger.tsx`, `FileUploadItemAction.tsx`
- `FileUploadContext.tsx` (root DS context), `FileUploadItemContext.tsx`
- `classes.ts` (CVA), `types.ts`, `lib/{normalizeAccept,formatFileSize,formatRejection}.ts` (+ `*.test.ts`)
- `index.ts`, `FileUpload.stories.tsx`, `FileUpload.test.tsx`, `FileUpload.e2e.ts`
- `FileUpload.figma.tsx` (Code Connect), `ANALYTICS_GAPS.md`

Also update:

- `packages/design-system/src/index.ts` — export block, alphabetical, between FeedbackPulse and Field
- `docs/storybook-docs-coverage.md` — add a row

## 11. Testing

**Unit tests (Vitest + Testing Library).** Files are driven by `fireEvent.change` on the hidden input and by drop events.

- Rendering and slots.
- `accept` / `maxFileSize` / `minFileSize` / `validate` rejections, with their messages.
- Single-mode replace, and ignoring a re-pick of the same file.
- Multi-mode append, `TOO_MANY_FILES`, and `Already added`.
- Replace and Delete in multi mode.
- Auto-lock.
- `readOnly` and `disabled` visibility and behaviour.
- `Field` integration (`disabled`, `readOnly`, `invalid`, `required`, label naming).
- The `data-testid` cascade.
- Hidden input `name` and the `files` sync.
- Metrics:
  - the id lands on the real node (checked via `tagName`);
  - `data-analytics-props` is carried verbatim;
  - `captureAnalyticsClicks` on the Dropzone;
  - negative check: nothing lands on the hidden input;
  - the attribute survives a file being added;
  - handlers compose and `preventDefault` opts out.
- `lib/*` pure functions.

**E2E (Playwright, `docs/e2e-test-rules.md`).** Story helper `inputs-fileupload`.

- *Visual:*
  - Dropzone: default, hover, disabled;
  - Trigger;
  - in `Field` (required + description);
  - with files;
  - item with a description;
  - loading (locked);
  - rejected;
  - single mode filled (picker stays above the file);
  - read-only with Download;
  - long name with its tooltip.
- *Interactions:* pick via `setInputFiles`, reject by type and by size, delete, replace, cancel while loading.
- *Accessibility:* Tab to the Dropzone, then Enter opens the `filechooser`, and the same for the Trigger. Item actions are reachable by keyboard.

Baselines are generated in CI with `[update-screenshots]`.

**Storybook.** `Inputs/FileUpload`, written with the `storybook-docs` skill: a component description and a one-sentence JSDoc on each story. Stories carry `data-testid`, and an analytics example shows where `data-analytics-id` lands.
