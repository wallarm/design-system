Generated from wallarm/design-system — change it in code and run /claude-design-sync there.

# Wallarm Design System

Wallarm's product UI system uses the real library components, semantic tokens and Geist fonts. Build with components first, style with semantic tokens second, and reach for primitives last. The generated canvas bundle uses the page's React 18 runtime.

## Content

- Use sentence case for buttons, labels, titles, menu items and column headers.
- Label actions with a verb and object: `Delete rule` still reads out of context.
- Keep field labels short. Reword long labels and table headers instead of truncating them.
- Use one primary button per view. Reserve destructive actions for changes that are hard to undo.
- Pair status colour with an icon or a word.

## Color

- Use semantic families: `color-text-*`, `color-icon-*`, `color-bg-*`, `color-border-*`, `color-states-*` and `color-component-*`. Their values switch between light and dark themes.
- Wallarm orange marks the primary action and brand moments. Use `color-*-ai` for assistant content and AI-generated results.
- Use `text-text-primary` for readable body text and `text-text-secondary` for supporting copy. Hint and tertiary colours are not suitable for essential information.
- Start with `bg-bg-page-bg`, then layer surfaces with `bg-bg-surface-1` through `bg-bg-surface-5`.
- Soft status fills use `color-bg-<status>`, solid fills use `color-bg-fill-<status>`. The `-alt` families are for inverted surfaces; `-fixed` values stay the same in both themes.
- Interaction state tokens describe overlays on resting fills. Focus tokens supply visible rings.
- Keep syntax token mappings unchanged. Use badge palettes through `Badge`, `Tag` and `NumericBadge`.
- Check contrast in the actual design, especially orange, success green and muted text at small sizes.

## Type

- Geist Variable is the UI font; Geist Mono is for code and identifiers. Geist Pixel is reserved for display moments and splash art.
- Never write raw `h1`–`h6`, `p`, `ul`, `ol` or `li` for content: the bundle's reset leaves them with no size, margin or list style. Use `WallarmDS.Heading` and `WallarmDS.Text` (or `List` where one fits), and `Code` for code.
- Prefer `Text`, `Heading` and `Code` over raw typography classes. Use the size and weight choices documented on their cards.
- The UI weight scale is normal 400, medium 450, semibold 600 and bold 700.
- Use paired size and line-height tokens. Token typography classes use `body-*`, `heading-*`, `display-*` and `code-*`. The `text-<size>` utilities (`text-xs`, `text-sm`, `text-md`, `text-base`, `text-lg`…) use this system's type tokens, not Tailwind's defaults, and `text-<colour>` takes a semantic token such as `text-text-secondary`.

## Spacing, radius, elevation

- **Every numeric utility means N px** — spacing *and* sizing: `p-`, `m-`, `gap-`, `space-x/y-`, `w-`, `h-`, `size-`, `min-/max-w-`, `inset-`, `top-`/`right-`/`bottom-`/`left-`. `p-16` is 16px, `w-256` is 256px. Tailwind's 4px habit is four times too small here.
- Stay on the spacing scale: 0, 1, 2, 4, 6, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 80, 96, 112, 128, 144.
- The CSS is precompiled: only the classes listed in [`components/UTILITIES.md`](components/UTILITIES.md) exist. There is no JIT and no arbitrary values (`p-[13px]`, `w-[420px]`), and a missing class silently renders nothing. For any other value use an inline style with a token: `style="gap: var(--spacing-16)"`.

| Tailwind habit | Here |
| --- | --- |
| `p-1` / `p-2` / `p-3` / `p-4` | `p-4` / `p-8` / `p-12` / `p-16` |
| `p-6` / `p-8` / `p-12` | `p-24` / `p-32` / `p-48` |
| `gap-2` / `gap-4` / `gap-6` / `gap-8` | `gap-8` / `gap-16` / `gap-24` / `gap-32` |
| `space-y-4` / `mt-6` | `space-y-16` / `mt-24` |
| `w-64` / `w-80` / `w-96` | `w-256` / `w-320` / `style="width: 384px"` (`w-384` is not compiled) |
| `h-10` / `size-8` | `h-40` / `size-32` |
| `rounded-md` / `rounded-lg` / `rounded-xl` | `rounded-6` / `rounded-8` / `rounded-12` |
| `text-gray-500` / `bg-white` / `border-gray-200` | `text-text-secondary` / `bg-bg-surface-1` / `border-border-primary-light` |
- Follow the component's radius: compact items typically use `rounded-6`, controls and cards `rounded-8`, overlays `rounded-12`, and pills `rounded-full`.
- Use the shadow scale for elevation. Let overlay components handle their layering.
- Components supply motion; respect `prefers-reduced-motion`.

## Layout on a canvas

- Build page structure with components, not raw `div`s: `AppShell` for the frame, `Page` → `PageHeader` (with `PageTitle`, `PageActions`) → `PageContent` for a screen, `Card` → `CardHeader` / `CardContent` / `CardFooter` for grouped content. They carry the system's real paddings and gaps.
- Lay out everything else with `Stack`, `HStack`, `VStack` or `Flex` and their `gap` prop (`gap="{{16}}"`, values on the spacing scale) instead of margins.
- When a raw grid is unavoidable, use the layout kit: `grid grid-cols-4 gap-16`, `md:grid-cols-2`, `col-span-2`, `w-1/3`, `max-w-7xl`, `space-y-16`, `divide-y divide-border-primary-light`, `first:`/`last:` padding and border resets. Give flex and grid children `min-w-0` so they can shrink.
- Responsive variants (`sm:`, `md:`, `lg:`, `xl:`) follow the viewport, not the artboard.
- Check the console: in development the canvas warns once for each class that has no CSS.

## Iconography

- Use the supplied icon library. Missing icons should be added in Figma and synced through the repository.
- Icons use `currentColor`: apply `text-icon-primary`, `text-icon-secondary` or a status icon token. Sizes are `icon-xs`, `icon-sm`, `icon-md`, `icon-lg`, `icon-xl` and `icon-2xl`; `icon-md` is 16px.
- Third-party brand icons retain their brand colours. Exported single-ink SVG assets use slate ink; see `assets/Icons/README.md`.

## Logo

- Use `Logo` with `type="full"`, `"icon"` or `"wordmark"`. Its `default` colour follows the theme; `white` keeps the orange mark, and `full-white` makes the whole logo white.
- Never stretch the logo, rebuild its wordmark from text or invent a mark colour. Static versions live under `assets/Logos/`.

## Accessibility

- Prefer semantic elements and the supplied composite controls for keyboard and ARIA behaviour.
- Label every form control. Place `FieldLabel` with its `Field` and use explicit accessible names on icon-only actions.
- Keep visible focus and verify keyboard navigation. Put analytics and test attributes on the actual interactive component.
