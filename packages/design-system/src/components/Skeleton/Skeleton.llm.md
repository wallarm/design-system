# Skeleton — usage

> A content-shaped **placeholder** for a region whose layout is known but whose data is
> loading — it makes the wait feel shorter and **prevents layout shift**. Either **wrap**
> real content (auto-shapes to it + a `loading` toggle) or set a **standalone**
> `width` / `height`. The "the page is coming" member of the loading family
> (`Progress` / `Loader` / `Skeleton`).

## Reach for it when
A **page / list / card / table** (more than one element) is loading content into a
**known layout** — render skeletons in the real content's shape so the wait feels
shorter and nothing jumps when the data arrives. Best for first / full loads up to ~10s.

## Don't use it for — the loading family
- **A short (<~1s) wait** → nothing; the skeleton just flashes.
- **A single in-context / inline wait** (a button, one chart, an alert) → `Loader`. Don't scatter many tiny skeletons where one spinner fits, and **don't combine a skeleton and a spinner in the same region** — pick one.
- **A measurable / long operation** → `Progress`.
- **Content revealed on interaction** (inside a toast / dropdown / modal) → it should already be loaded; no skeleton.
- **An unknown layout** — you can only skeleton a shape you can predict.

## Composition — build the shapes yourself
`Skeleton` is **one primitive** (no prebuilt "body-text" / "avatar" parts) — compose it:
- **Wrap mode** (the clean default): `<Skeleton loading={isLoading}>{realContent}</Skeleton>` — reserves the content's exact box (no layout shift) and renders the real thing once `loading` is `false`.
- **Standalone**: `<Skeleton width="256px" height="20px" />` — a sized box; stack several for text lines, a `rounded="full"` one for an avatar, blocks for cards / rows. **Match the real layout + line count** — a mismatch jumps on swap-in.

## Locked — don't override
- **`rounded` matches the real element's shape** (default `6`; `full` for an avatar / dot).
- **`transparent` (default) animates over invisible content; `transparent={false}` is a filled `surface-1` box.** A single restrained pulse — don't add flashy shimmer; honor `prefers-reduced-motion`.
- Root is **`aria-hidden`** (it's decorative) — the loading **announcement** must come from a separate live region (`role="status"`), which is the consumer's job. (Loading-a11y is a foundations gap — see the design-judgment backlog.)

## Pairs with
- `Loader` (single / inline) and `Progress` (measurable / long) — the other two; the **"which loading indicator?" decision** lives in the design-judgment backlog (loading-feedback ladder).
- Wraps any real component (`Card`, a `Table` row, `Attribute`, `Text`) to hold its space while it loads.
