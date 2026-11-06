# Icon Rules

Icons in `packages/design-system/src/icons/` are generated from the WADS-Iconography Figma page by `pnpm icons:sync`. Full usage: [`packages/design-system/README.md`](../../packages/design-system/README.md) → "Icons from Figma".

## When an icon is missing

1. Check `src/icons/index.ts` — it may exist under another name.
2. Run `pnpm --filter @wallarm-org/design-system icons:sync --dry-run` — it lists icons that are in Figma but not in the repo.
3. If it's there, run `icons:sync --category '<gallery category>'` (categories live in `src/icons/module/const.ts`) and commit with `[update-screenshots]`.
4. If it's not in Figma, stop and ask the user — the designers add it to Figma first.

`icons:sync` needs `FIGMA_ACCESS_TOKEN` in the repo-root `.env.local` (template: `.env.example`). If it's missing, ask the user to add it — never write it yourself.

## Never

- ❌ Hand-write or hand-edit icon files, `index.ts` exports, or `module/Icons.figma.batch.*`
- ❌ Inline an SVG in a component, or pull in an icon library (lucide, etc.) instead of a missing icon
- ❌ Fix a wrong name or a duplicate in the icon file — map the Figma node in `scripts/icons/manifest.json` and re-run the sync
