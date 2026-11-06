# Avatar — design spec

- **Figma:**
  - Platform → Profile → `user-avatar` instance
  - Platform → Profile → avatar upload/edit examples
  - The library master is `user-avatar` (component set key `3c8ef35992934b2704efe50c848715e03a1820ea`) in **WADS Components** (`VKb5gW46uSGw0rqrhZsbXT`).
- **Base:** `@ark-ui/react/avatar` (Ark 5.38.0). Chakra UI v3's Avatar is built on the same primitive.
- **API reference:** [Chakra UI Avatar](https://chakra-ui.com/docs/components/avatar), adapted to DS naming (flat `AvatarImage` rather than `Avatar.Image`).
- **Related:** `FileUpload` ([spec](./2026-09-30-file-upload-design.md), #329). This spec changes `FileUploadTrigger` and adds one hook to it.

## 1. Goal

Replace the one-off avatar plate in `NavRailItem` with a reusable **Avatar** that:

- shows a user photo, with a fallback of initials or an icon;
- shows the fallback while the photo loads and when it fails, with no consumer state;
- lets you change the avatar by clicking it (Figma 2159:1577), by composing with `FileUpload`.

## 2. Decisions

| # | Decision |
|---|---|
| D1 | Compound component on Ark UI: `Avatar`, `AvatarImage`, `AvatarFallback`, `AvatarOverlay`. There is no flat-props shortcut. |
| D2 | v1 scope matches Figma, plus initials from `name` (Chakra behaviour). Out of scope: `AvatarGroup`/`+N`, status badge, `shape`, `variant`, colour palette or colour-by-name. |
| D3 | Sizes are only the ones in Figma: `xs` (24) and `sm` (32). The default is `sm`. **Superseded 2026-10-20 (WDS-191, §12):** `sm` (20), `md` (24), `lg` (32), default `lg`. |
| D4 | The shape is always a rounded square (Figma), never a circle. |
| D5 | Click-to-upload works through a new headless `FileUploadTrigger asChild` mode. No Avatar-specific upload component. |
| D6 | Add a `useFilePreviewUrl(file)` hook to FileUpload, so consumers don't each hand-roll `createObjectURL`/`revokeObjectURL`. |
| D7 | The crop dialog ("Upload avatar": pan, zoom slider, rule-of-thirds grid) is **out of scope**. It needs a crop dependency decision and an output-format decision, so it gets its own ticket. |
| D8 | `NavRailItem` migrates to `Avatar` in the same PR. NavRail and AppShell screenshots must not change. |
| D10 | The interactive avatar is `<Avatar as='button'>` — no hand-written `<button>` inside `Avatar asChild` (user decision 2026-09-30). The DOM keeps a real `<button>` for focus, keyboard, `disabled` and the metrics contract; only the JSX layer goes. `asChild` stays for custom roots. |
| D9 | New semantic token `--color-component-avatar-overlay` for the hover wash. Figma's raw `rgba(255,255,255,.8)` would be wrong in dark mode. |

## 3. Anatomy

```
Avatar (root, Ark Avatar.Root, <span>; as='button' → <button type='button'>; asChild → consumer element)
├── AvatarImage      Ark Avatar.Image  <img>   visible once loaded
├── AvatarFallback   Ark Avatar.Fallback <span> visible while loading / on error / without src
│                    content: children → initials(name) → icon (default UserRound)
└── AvatarOverlay    <span> edit affordance, shown on hover / focus-visible (default icon RefreshCcw)
```

All parts share one grid cell (`*:col-start-1 *:row-start-1`), the same as the current NavRail plate. Nothing is absolutely positioned, so the root's own hover or active tints still show through.

### Usage

```tsx
// Display
<Avatar>
  <AvatarImage src={user.photoUrl} />
  <AvatarFallback name={user.name} />
</Avatar>

// Click to upload
const [file, setFile] = useState<File>();
const preview = useFilePreviewUrl(file);

<FileUpload
  accept='image/png,image/jpeg,image/webp'
  maxFileSize={512 * 1024}
  onValueChange={files => setFile(files[0])}
>
  <FileUploadTrigger asChild>
    <Avatar as='button' aria-label='Change avatar'>
      <AvatarImage src={preview ?? user.photoUrl} />
      <AvatarFallback name={user.name} />
      <AvatarOverlay />
    </Avatar>
  </FileUploadTrigger>
  <FileUploadError />
</FileUpload>
```

## 4. API

Every part follows the DS rules: native attributes for its element, `{...rest}` and `ref` on the real node, `data-slot`, `displayName`, and a `useTestId` cascade. Consumer handlers compose with internal ones.

### `Avatar` (root)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `size` | `'xs' \| 'sm'` | `'sm'` | See §6. |
| `as` | `'span' \| 'button'` | `'span'` | The root tag. `'button'` renders `<button type='button'>` (consumer `type` wins) — the interactive avatar, e.g. inside `FileUploadTrigger asChild`. Decision D10. |
| `asChild` | `boolean` | `false` | Ark `asChild`: the single child element becomes the root (e.g. a router link). Takes precedence over `as`. |
| `onStatusChange` | `(details: { status: 'loading' \| 'loaded' \| 'error' }) => void` | — | Passed through from Ark. |
| `className`, `children`, `ref`, `data-testid` | | | Renders a `<span>` (Ark's default `div` is invalid inside a `<button>`). `data-slot='avatar'` is set **before** `{...rest}`, so an incoming `data-slot` wins (`file-upload-trigger` from the trigger, `nav-rail-item-avatar` from NavRail). Avatar's own CSS therefore keys off the `group/avatar` class, never `[data-slot=avatar]`. `onClick` flows through `rest`; the button attributes (`disabled`, `type`, `name`, `value`, `form`) are typed only for `as='button'` or `asChild` and dropped on a span root. A consumer `id` becomes Ark's `ids.root`, so it lands on the DOM node verbatim (Ark would otherwise render `avatar:${id}`). `AvatarImage` takes no `id` — Ark finds the image by its own id. The whole root is wrapped in `TestIdProvider`, so parts get `{testId}--image` etc. even under `asChild`. |

The root also carries `group/avatar`, so the other parts can react to hover, focus and image state.

### Parts

| Part | Element / base | Props (beyond native) | Behaviour |
|---|---|---|---|
| `AvatarImage` | `img` (Ark `Image`) | `src`, `alt` (default `''`) | `size-full object-cover`. Always render it. **Never render it conditionally** (`src && …`), because Ark tracks `src` changes on the mounted element. An `undefined` src means "no photo", and the fallback stays visible. Slot `image`. |
| `AvatarFallback` | `span` (Ark `Fallback`) | `name?: string`, `icon?: ComponentType<SvgIconProps>` (default `UserRound`), `children?` | What it shows, in order: `children`, then `getInitials(name)` when `name` gives at least one letter, then `<Icon size='md' />`. Ark hides it (`data-state=hidden`) once the image loads. Slot `fallback`. |
| `AvatarOverlay` | `span` | `children?` (default `<RefreshCcw size='md' />`), `visible?: boolean` | Hidden by default. It appears when the root is hovered or has `focus-visible`, and always when `visible` is set (for example to show a `Loader` during upload). Hidden when the root is `disabled`. Over a loaded photo it paints `bg-component-avatar-overlay`. Over the fallback it has no wash and hides the fallback content instead, so the icon swaps (Figma 2159:1698). Slot `overlay`. Use it only with an interactive root. |

### Utility: `getInitials(name: string): string`

It lives in `src/utils/getInitials.ts`. It is internal and not exported from the package.

- It trims the name, splits on `/\s+/`, and takes the first letter grapheme (`\p{L}`) of the first and of the last word that has a letter. Leading non-letters are skipped and words without a letter are ignored. With a single such word it takes one letter.
- Graphemes are split with `Intl.Segmenter`, so a letter with a combining mark stays whole. Emoji are not letters and never become initials.
- The result is uppercased with `toLocaleUpperCase()`. It returns `''` for a name with no letter (empty, whitespace-only, `'42'`), and the fallback then shows the icon.
- Examples: `'Ada Lovelace' → 'AL'`, `'  ada  ' → 'A'`, `'Иван Петров' → 'ИП'`, `'Jean-Luc Picard' → 'JP'`, `'"Ada" Lovelace' → 'AL'`, `'42' → ''`, `'' → ''`.

### FileUpload changes

**`FileUploadTrigger asChild`**

- The props type becomes `ButtonProps & { asChild?: boolean }`. `ButtonProps` already has `asChild`, which today only reaches `ButtonBase`, so the public type barely changes. Its meaning changes to "don't render a Button".
- When `asChild` is set, it renders `<ArkFileUpload.Trigger asChild>{children}</ArkFileUpload.Trigger>` with no `Button`. It must be one child element.
- `data-slot='file-upload-trigger'`, `data-testid`, the combined `aria-describedby` and `disabled={disabled || ctx.pickerBlocked}` are passed to that child through the same Slot merge.
- Button-only props (`variant`, `color`, `size`) are ignored.
- `pickerHidden` (read-only) still renders `null`.
- With no `asChild`, the behaviour and DOM are the same as today.

**`useFilePreviewUrl(file?: File | null): string | undefined`**

- It is exported from `components/FileUpload`.
- It creates an object URL for `file` and revokes it when `file` changes or the component unmounts.
- Its `useEffect` is justified because it manages an external resource (blob URL lifetime), not derived state.
- It returns `undefined` for no file.

## 5. Behaviour

> **Amended 2026-10-20 (WDS-191):** item 2 (Border) no longer uses the `has-[…]:border-0` trick — see §12.

1. **Loading and error.** Ark runs the image load state machine. The fallback shows while loading, on error, and without `src`. The image shows only once loaded. There is no `useState`/`onError` in DS code. Ark toggles visibility with the HTML `hidden` attribute, and any Tailwind display utility (`flex`, `grid`, `inline-flex`) overrides it. So `AvatarImage` and `AvatarFallback` both carry `data-[state=hidden]:hidden`.
2. **Border.** The 1px `border-border-primary` shows only while no photo is visible. The root uses `has-[>img[data-state=visible]]:border-0`, so the border is CSS-only with no JS status. The box is fixed-size and `border-box`, so nothing moves, and the photo then fills the full 24/32px like Figma `Photo=On`. A transparent border would leave a 1px ring of the plate tint around the photo.
3. **Changing `src`** (for example stored URL → blob preview → new server URL) re-runs loading. The fallback shows between images only if the new one is still loading.
4. **Interactive root.** When the root is a `button`:
   - `cursor-pointer`;
   - the DS focus-visible ring, the same one `ButtonBase` uses;
   - `disabled` shows `cursor-not-allowed`, and there is no overlay.
5. **Remove.** The consumer owns this. The `WithActions` story shows it: Trash2 clears both the stored URL and the FileUpload value (controlled `value={[]}`), so the fallback returns.
6. **Upload in flight.** The consumer passes `disabled` to `FileUploadTrigger` and renders `<AvatarOverlay visible><Loader /></AvatarOverlay>`. The DS doesn't upload (FileUpload D-rules).
7. **Drag and drop onto the avatar** is not supported in v1. The FileUpload root already refuses drops outside a Dropzone.

## 6. Visual spec (Figma → tokens)

> **Amended 2026-10-20 (WDS-191):** sizes, plate structure and branded initials changed — see §12. The table below is the original v1 spec.

| | `xs` | `sm` |
|---|---|---|
| Box | `size-24` | `size-32` |
| Radius | `rounded-8` | `rounded-12` |
| Fallback icon | `size='md'` (16) | `size='md'` (16) |
| Initials | `text-2xs font-medium` (10/12) | `text-xs font-medium` (12/16) |
| Overlay icon | 16 | 16 |

- **Plate:** `inline-grid place-items-center shrink-0 overflow-hidden border border-border-primary bg-states-primary-hover text-icon-primary`. Initials use `text-text-primary`.
- **Branded frame** (from NavRail): `branded:bg-states-brand-hover branded:text-icon-brand branded:border-border-brand`.
- **Photo:** `size-full object-cover`, clipped by the root radius, with no border.
- **Overlay wash:** a new token `--color-component-avatar-overlay`, placed next to `--color-component-dialog-overlay` in `semantic.css`:
  - light: `--alpha(var(--color-white) / 80%)`;
  - dark: `--alpha(var(--color-slate-950) / 80%)`.

  The overlay icon is `text-icon-primary`.
- The overlay shows or hides instantly, with no transition. This matches Figma, which has no motion spec.

## 7. Accessibility

- **Decorative by default.** `AvatarImage alt=''`. Fallback initials and the icon are `aria-hidden`, so a screen reader doesn't read "A L".
- **Meaningful avatar** (standalone, no adjacent name): pass `aria-label` to `Avatar`. The root then gets `role='img'`.
- **Interactive avatar:** the consumer's `<button>` needs an `aria-label` (stories use `Change avatar` / `Upload avatar`). `FileUploadError` is linked through `aria-describedby` by the trigger (§4).
- `Avatar.a11y.test.tsx` asserts these rules with testing-library ARIA queries (the repo has no axe).

## 8. NavRail migration

> **Amended 2026-10-20 (WDS-191):** `size='xs'` is now `size='md'` — see §12.

`NavRailItem` renders:

```tsx
<Avatar size='xs' className='-m-4'>
  <AvatarImage src={avatarSrc} />
  <AvatarFallback icon={Icon} />
</Avatar>
```

This replaces the hand-rolled plate, its `failedSrc` state, and the `onError` handler.

- Nothing else about the item changes: the `-m-4` overhang, the item's hover and active tint, and `data-slot='nav-rail-item-avatar'`, which is kept for any CSS hooks by passing it to the root.
- Its unit tests and the AppShell screenshots guard the icon-plate path (AppShell stories have no `avatarSrc`). The photo path is the same `Avatar` code, covered by the Avatar `xs` screenshots.
- NavRail used to show the icon *under* the photo while loading, and Ark hides the fallback once the photo loads. The result looks the same because the photo is opaque and fills the box.

## 9. Stories (`Data Display/Avatar`)

- `Basic`
- `Sizes`
- `Fallback`: icon, initials, broken `src` → initials, broken `src` without `name` → icon
- `CustomIcon`
- `Branded`
- Patterns (Figma 2159:1577):
  - `ClickToUpload`: empty → pick → preview. Hover overlay on both states. PNG/JPEG/WebP, 512 KB, `FileUploadError` under the row.
  - `WithActions`: an "Avatar" label row with a "PNG, JPEG, or WebP · up to 512 KB" description, Trash2 and RefreshCcw `ghost/neutral/small` buttons, and the avatar (Figma 2188:26617).
  - `Uploading`: `AvatarOverlay visible` with `Loader`, and the trigger disabled.
- No separate `analytics` story (repo convention): `ClickToUpload` shows the placement — `data-analytics-id='AVATAR_CHANGE'` on its `FileUploadTrigger asChild`, which lands on the `<button>`.
- The Overview docs follow the `storybook-docs` skill.

## 10. Files

```
components/Avatar/
  Avatar.tsx  AvatarImage.tsx  AvatarFallback.tsx  AvatarOverlay.tsx
  classes.ts  index.ts
  Avatar.stories.tsx  Avatar.figma.tsx
  Avatar.test.tsx  Avatar.a11y.test.tsx  Avatar.testid.test.tsx  Avatar.analytics.test.tsx
  Avatar.e2e.ts
utils/getInitials.ts  utils/getInitials.test.ts
components/FileUpload/FileUploadTrigger.tsx          (asChild)
components/FileUpload/useFilePreviewUrl.ts (+ test)  (new hook, exported)
components/NavRail/NavRailItem.tsx                   (migration)
theme/semantic.css                                   (overlay token, light + dark)
src/index.ts                                         (export Avatar)
```

> **Amended 2026-10-20 (WDS-191):** Figma now has `Size` and `Type` props, both mapped — see §12.

`Avatar.figma.tsx` binds the WADS Components `user-avatar` set, node `12336:5504` in `VKb5gW46uSGw0rqrhZsbXT`: `Photo=On` → `AvatarImage` + `AvatarFallback`, `Photo=Off` → `AvatarFallback`. Figma has no size prop, so `size` is not mapped.

## 11. Testing

- **Unit:**
  - `getInitials`: the cases in §4.
  - Fallback content order.
  - Border hidden once the image is visible (mock `Image` load).
  - Status on `src` change.
  - `useFilePreviewUrl`: creates the URL, revokes it on change and unmount.
- **FileUpload:**
  - `FileUploadTrigger asChild` opens the picker, renders no `Button`, and passes through `disabled`/`pickerBlocked`, `aria-describedby`, `data-testid` and `data-slot`.
  - `readOnly` → `null`.
  - The existing tests stay green.
- **testid:** `{id}--image`, `{id}--fallback`, `{id}--overlay`.
- **a11y:** testing-library ARIA assertions (no axe in the repo). `role='img'` only with an `aria-label`, without `asChild`, and not `as='button'`; the fallback is `aria-hidden`; the interactive trigger is named and linked to the error.
- **analytics:** `data-analytics-*` and `onClick` land on the consumer's `<button>` through both Slot layers. No `stopPropagation`.
- **E2E (CI, `[update-screenshots]`):**
  - screenshots: sizes × fallback kinds × branded, and hover and focus overlay over photo and over fallback;
  - interaction: pick a file → preview shown, and an oversized file → error;
  - NavRail and AppShell screenshots stay unchanged.

## 12. Amendment 2026-10-20 — WDS-191: user item and compact sizes

Figma: `user-avatar` 12336:5504 (props `Size` Small | Medium, `Type` Photo | Nuetral | Branded) and `user-item` 12557:5856 (prop `Size`).

**Sizes (breaking rename).** Old `xs` → `md`, old `sm` → `lg`. `NavRailItem` now uses `md`.

| | `sm` | `md` | `lg` (default) |
|---|---|---|---|
| Plate | `size-20` | `size-24` | `size-32` |
| Radius | `rounded-8` | `rounded-8` | `rounded-12` |
| Fallback icon | 16 | 16 | 16 |
| Initials | `text-xs font-medium` | `text-xs font-medium` (was `text-2xs`) | `text-xs font-medium` |
| Name / description | `text-sm` / `text-xs` | `text-sm` / `text-xs` | `text-sm` / `text-xs` |

**New parts.** `AvatarContent` (`<span>`, `flex-col min-w-0`, slot `content`) holding `AvatarName` (`text-sm text-text-primary`, regular, slot `name`) and an optional `AvatarDescription` (`text-xs text-text-secondary`, slot `description` — the email line of the AppShell account menu). Both lines are single-line and truncate with an ellipsis; a truncated line shows its full text in an `OverflowTooltip` (same pattern as `StepperDescription`). Their text size comes from the root `size` through context, one CVA entry per size.

```tsx
<Avatar size='sm'>
  <AvatarImage src={url} />
  <AvatarFallback name='Artem Miskevich' />
  <AvatarContent>
    <AvatarName>Artem Miskevich</AvatarName>
    <AvatarDescription>admin@wallarm.com</AvatarDescription>
  </AvatarContent>
</Avatar>
```

**Structure.** The root is now the row: `inline-grid items-center gap-x-6`, plus `max-w-full` only when it has `AvatarContent` (so the text can truncate while a bare plate keeps its exact size, e.g. NavRail's `-m-4` plate in a 16px box). The plate layers (`AvatarImage`, `AvatarFallback`, `AvatarOverlay`) share cell column 1 / row 1 and each carries the plate box (`size-*`, `rounded-*`, `overflow-hidden`); `AvatarContent` sits in column 2. Without `AvatarContent` the grid has a single track, so the root is exactly the plate (no gap). The root keeps the plate radius, so the focus ring follows the plate when there is no content and wraps the whole row (plate + text) when `AvatarContent` is present.

- `AvatarImage` keeps the plate tint (`bg-states-primary-hover`, Figma `Type=Photo`) under transparent photos.
- At `sm` (20px) the fallback shows one initial (first word), as in Figma; two letters overflow the 18px content box. `md` and `lg` keep two.
- `aria-label` makes the root `role='img'` only for a standalone plate; with `AvatarContent` the root gets no role, so the visible name stays readable.

- The plate tint and 1px stroke live on `AvatarFallback`. Ark hides the fallback once the photo is visible, so a photo has no stroke without the old `has-[>img[data-state=visible]]:border-0` rule; the photo is clipped by its own radius.
- The hover/focus overlay swap now hides the fallback's *content* (`text-transparent` for initials, `*:invisible` for an icon or custom children), not the whole fallback, so the plate stays visible under the edit icon.

**Branded initials.** Initials take `branded:text-text-brand` (Figma Branded); this replaces §6's "initials keep `text-text-primary`". The icon takes `branded:text-icon-brand`, the plate `branded:bg-states-brand-hover branded:border-border-brand`.

**Code Connect.** `Size` Small → `sm`, Medium → `md`; `Type` Photo → image + fallback, Nuetral and Branded → fallback (branding comes from the frame). `user-item` maps to `Avatar` + `AvatarContent` + `AvatarName`.

Out of scope: migrating the AppShell account menu, Table and Attribute to `AvatarContent`.
