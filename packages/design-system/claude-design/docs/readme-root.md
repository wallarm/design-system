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
- Prefer `Text`, `Heading` and `Code` over raw typography classes. Use the size and weight choices documented on their cards.
- The UI weight scale is normal 400, medium 450, semibold 600 and bold 700.
- Use paired size and line-height tokens. Token typography classes use `body-*`, `heading-*`, `display-*` and `code-*`; Tailwind's `text-*` utilities retain their normal meaning.

## Spacing, radius, elevation

- Numeric spacing utilities use a 1px base. Stay on the scale: 1, 2, 4, 6, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 80, 96, 112, 128, 144.
- Use `gap-8`, `px-12`, `py-6` and the matching token utilities. Avoid hardcoded values when the system already names one.
- Follow the component's radius: compact items typically use `rounded-6`, controls and cards `rounded-8`, overlays `rounded-12`, and pills `rounded-full`.
- Use the shadow scale for elevation. Let overlay components handle their layering.
- Components supply motion; respect `prefers-reduced-motion`.

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
