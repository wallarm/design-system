# The shared Overview frame

Read this only when the **frame** needs changing. A normal documentation run
writes prose and touches none of it.

Everything lives in `packages/design-system/.storybook/`:

| File | Role |
|---|---|
| `docs/DocsPage.tsx` | The page composition every component inherits |
| `docs/DocsHeaderLinks.tsx` | The links row under the H1 |
| `docs/DocsFeedback.tsx` | The closing Feedback section |
| `docs/DocsSection.tsx` | A titled section with an anchor id |
| `docs/sourceUrl.ts` | Derives the GitHub URLs |
| `docs/toc.ts` | Table-of-contents behaviour |
| `docs/styles.ts` | The one link treatment |
| `preview.css` | Pins the frame's colours in dark mode |

The page reads: title → links row → component description → `Examples` (one
heading, sentence and canvas per story) → `Component API` → `Feedback`.

## Traps

These all cost real debugging time. They are not obvious from the code.

**The spacing scale is 1px per step.** `theme/spacing.css` sets `--spacing: 1px`,
so `gap-2` is **two pixels**, not eight. Every Tailwind spacing utility in this
repo is a literal pixel count. Reach for `gap-8`, `mb-16`, `mt-48`.

**`text-text-link` doesn't exist.** The real tokens are `text-text-link-default`
and `text-text-link-hover` (plus `-alt` for on-dark surfaces), as
`Link/classes.ts` uses. A wrong utility name fails silently — the links only
*looked* right because they were inheriting Storybook's own anchor colour.

**Storybook's docs typography beats Tailwind on font-size.** `sb-unstyled` on a
container is the sanctioned opt-out, and it's what makes the 14px links row
possible. It also drops Storybook's anchor colour, so colour must then be set
explicitly.

**Docs pages render on Storybook's own light surface in both themes.** Only the
story canvas follows `data-theme`. Any frame element using theme-flipping
semantic tokens goes pale-on-white in dark mode, so `preview.css` pins
`.docs-frame-link`, `.docs-frame-muted` and `.docs-frame-rule` to their light
values under `[data-theme='dark']`. **Give any new coloured frame element one of
those marker classes.**

**`docs.defaultName` belongs in `main.ts`, not `preview.tsx`.** Setting it as a
preview parameter silently does nothing. It also needs a Storybook restart.

**Storybook's built-in table of contents never scrolled.** Its handler cancels
the link and asks the manager to navigate, which doesn't move the docs page — its
own story entries were broken too, and the highlight makes it look like it
worked. `docs/toc.ts` overrides the click via `unsafeTocbotOptions`.

**Stories render lazily, so the page grows mid-jump** and an anchor undershoots.
`docs/toc.ts` re-aligns every 50ms until `documentElement.scrollHeight` stops
changing.

**Headings need explicit `id`s** to become table-of-contents targets. Storybook
only supplies them for story headings; `DocsSection` slugifies its title to match.

**`includePrimary` matters.** The default autodocs page renders the first story
through `Primary`, which drops its description — so `Basic` would silently lose
its sentence. `<Stories includePrimary title={<span />} />` keeps every story in
one list. The `title` must be an *element* to suppress the block's own heading; a
fragment there trips Biome's `noUselessFragments`.

## Verifying a frame change

A dev-server check is not enough when the change touches anything environment-
dependent — `showToolbar` was gated on `NODE_ENV`, which is exactly what differs
between local and deployed.

To check a production build, build it and serve it under the deployed path,
because `assetPrefix` is `/design-system/` in production and serving from the
root breaks every asset:

```bash
pnpm --filter=@wallarm-org/design-system build-storybook
# symlink storybook-static as design-system/ inside a scratch dir, serve that dir,
# then load http://localhost:PORT/design-system/?path=/docs/...
```

Add the static server as a temporary `.claude/launch.json` entry and restore the
file afterwards. `runtimeExecutable` needs an **absolute** binary path or the
server silently never binds.

## The annotation label style

`.sb-annotation` in `preview.css` styles the labels inside a story canvas. Two
things to know if you touch it:

- **Caveat is loaded from Google Fonts** via an `@import` at the top of
  `preview.css`. Everything else in the repo self-hosts (see `theme/fonts/`), so
  if offline dev or CDN independence ever matters, self-hosting it in
  `.storybook/assets/` is the consistent move — `staticDirs` already serves that
  folder.
- **The lowercasing is CSS, not source.** The story still reads `Neutral Alt` and
  renders `neutral alt`, which keeps the source legible and makes the style
  removable — but it does mean the rendered label and the "Show code" snippet
  differ in case.

## MDX pages are untouched

`src/docs/*.mdx` (Getting Started, Installation, Release, Adding Components)
define their own content and get no frame. That's deliberate — a links row makes
no sense on a guide page.
