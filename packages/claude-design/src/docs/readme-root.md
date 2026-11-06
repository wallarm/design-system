Generated from wallarm/design-system — change it in code and run /claude-design-sync there.

# Wallarm Design System

Wallarm's product UI system uses the real library components, semantic tokens and Geist fonts. Build with components first, style with semantic tokens second, and reach for primitives last. The generated canvas bundle uses the page's React 18 runtime.

## Start here

On a Design canvas, every screen lives inside the app skeleton: [`app-skeleton.dc.html`](app-skeleton.dc.html), the console frame with the header, the product rail, a product menu (`RemoteShell` from a `NavConfig`) and an empty `Page`. Set it up before the first screen:

1. If the canvas has `project/wallarm-app.dc.html`, that is the person's skeleton: use it and never replace it. Otherwise copy this system's `app-skeleton.dc.html` to `project/wallarm-app.dc.html`. On a canvas this system is installed in `project/ds/<folder>/`, the folder this README is in; boards sit directly in `project/`. If that folder has no `app-skeleton.dc.html`, read `project/app-skeleton.dc.html` from the design system artifact the canvas was installed from. In the copy, replace the three link lines in `<head>` with these four, `<folder>` being that folder's name, and change nothing else:

   ```html
   <script src="./support.js"></script>
   <link rel="stylesheet" href="ds/<folder>/tokens.css">
   <link rel="stylesheet" href="ds/<folder>/components/bundle.css">
   <script src="ds/<folder>/components/bundle.js"></script>
   ```

   Add it as the first board: merge `"wallarm-app.dc.html": {"x": 0, "y": 0, "w": 1440, "h": 900, "title": "Wallarm app", "expand": "fill"}` into `boards` in `project/canvas.json` (right of the other boards if there are any: `x` is their largest `x + w` plus 80) and append `"wallarm-app.dc.html"` to `order`.
2. Set up the shell only through its `APP` object, the block that starts with `var APP = {` at the top of its script, from the person's request: the product's name and path, its menu (`link`, `group` and `section-header` nodes; `drill` only if asked; ids and paths in kebab-case with punctuation dropped, `Detect & Respond` → `detect-respond`), the rail's products and `start`, the first link's path. Give every top-level link and group an `icon` (a `WallarmDS.Icons` name), or give none. When you rebuild the menu, drop the sample's `action` and `dividerAfter` unless the person names them. The comment above the object describes each field. With no product named, keep the sample. Leave the header, rails and product menu markup as it is.
3. Design each requested screen inside the skeleton's `Page`, following its pattern guide. Set `start` to the path of the screen's menu link; if the screen has no link, add one to `APP.nav.items`, in kebab-case like the others, and set `start` to it. The link's label is the page title and its `action` the primary button. Keep `PageHeader`; add `PageDescription` in its `PageHeaderGroup` and a `PageToolbar` (search, tabs, filters) between `PageHeader` and `PageContent`; on a page that lists rows, set `fixed-height="{{yes}}"` on `Page`. Replace the `EmptyState` in `PageContent` with the screen. The screen's own data (table rows, counts) goes in `renderVals()`, outside `APP`. For several screens, make one board per screen: a copy of the skeleton under a new file name, with its own `start`.

Skip the skeleton only when the person asks for a standalone component or a screen without the app frame. The console must show no `[WallarmDS]` warning, and clicking a menu item moves the highlight, the breadcrumb and the page title.

## Rules

These are the design system's own rules (`src/guidelines/rules.md`), embedded at build time. On the canvas, read `get_guideline` as "the pattern guide": they ship in the npm package under `dist/guidelines/` (`rules.md`, `foundations/`, `patterns/`, `templates/`) and through the MCP server's `get_guideline` tool.

<!-- rules.md -->

## Screen sampler

[`sampler.dc.html`](sampler.dc.html) is one canonical 1440-wide screen built only from this system through `x-import`: `AppShell`, a resource list `Page` with `PageHeader` and its create action, a `PageToolbar` with search and status tabs, an entity `Table` with a status `Badge` column and the row menu in the master cell (`meta.renderMenuAction`), a no-results `EmptyState`, and a detail `Drawer` opened by `open` with an empty nested table. It follows the `resource-list-page`, `entity-table` and `detail-drawer` pattern guides. Start a screen from it rather than from raw `div`s; the export checks that every class it uses exists in `components/bundle.css`.

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
- The bundle's reset leaves raw `h1`–`h6`, `p`, `ul`, `ol` and `li` with no size, margin or list style; use `List` where one fits, and `Code` for code.
- Prefer `Text`, `Heading` and `Code` over raw typography classes. Use the size and weight choices documented on their cards.
- Use paired size and line-height tokens. `body-*`, `heading-*`, `display-*` and `code-*` are type-style names in the token document, not CSS classes — `class="body-sm"` renders nothing. Use `Text`, `Heading` or `Code`, or the `text-<size>` utility named in each style's usage ("Tailwind: text-sm font-sans-display"). The `text-<size>` utilities (`text-xs`, `text-sm`, `text-md`, `text-base`, `text-lg`…) use this system's type tokens, not Tailwind's defaults, and `text-<colour>` takes a semantic token such as `text-text-secondary`.

## Spacing, radius, elevation

- The 1px base covers sizing too: `w-`, `h-`, `size-`, `min-/max-w-`, `inset-`, `top-`/`right-`/`bottom-`/`left-`. The full scale: 0, 1, 2, 4, 6, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 80, 96, 112, 128, 144.
- The CSS is precompiled: only the classes listed in [`components/UTILITIES.md`](components/UTILITIES.md) exist. There is no JIT and no arbitrary values (`p-[13px]`, `w-[420px]`), and a missing class silently renders nothing. For any other value use an inline style with a token: `style="gap: var(--spacing-16)"`.

| Tailwind habit | Here |
| --- | --- |
| `p-1` / `p-2` / `p-3` / `p-4` | `p-4` / `p-8` / `p-12` / `p-16` |
| `p-6` / `p-8` / `p-12` | `p-24` / `p-32` / `p-48` |
| `gap-2` / `gap-4` / `gap-6` / `gap-8` | `gap-8` / `gap-16` / `gap-24` / `gap-32` |
| `mt-6` | `mt-24` |
| `w-64` / `w-80` / `w-96` | `w-256` / `w-320` / `style="width: 384px"` (`w-384` is not compiled) |
| `h-10` / `size-8` | `h-40` / `size-32` |
| `rounded-md` | `rounded-6` (compact items; pills `rounded-full`) |
- Use the shadow scale for elevation on your own elements.
- Components supply motion; respect `prefers-reduced-motion`.

## Layout on a canvas

- Start inside the [app skeleton](#start-here); the [screen sampler](#screen-sampler) shows a finished screen. `AppShell` is the frame; `Card` → `CardHeader` / `CardContent` / `CardFooter` groups content.
- A number prop such as `gap` is a `{{hole}}` from `renderVals()`: `gap="{{rowGap}}"` with `rowGap: 6`.
- When a raw grid is unavoidable, use the layout kit: `grid grid-cols-4 gap-16`, `md:grid-cols-2`, `col-span-2`, `w-1/3`, `max-w-7xl`, `divide-y divide-border-primary-light`, `first:`/`last:` padding and border resets. Give flex and grid children `min-w-0` so they can shrink.
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
