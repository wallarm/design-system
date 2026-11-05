# Wallarm Design System for Claude Design

Install [Wallarm Design System](https://github.com/wallarm/design-system) in Claude Design from
one prompt. Paste the prompt from the [Claude Design guide](https://wallarm.github.io/design-system/ai/claude-design)
into a Claude Design chat; Claude runs:

```bash
npx -y @wallarm-org/claude-design@latest export
```

The command writes `wallarm-design-system/` and never prompts:

| Path | Contents |
| --- | --- |
| `project/` | The system to publish as a Design System artifact: runtime bundle, tokens, CSS, fonts, component guides and previews. Icons are inside the bundle (`WallarmDS.Icons.*`), so there are no asset uploads |
| `SETUP.md` | Claude's steps: publish the system, install it on a canvas, add and check the sampler, update |
| `wallarm-sampler.dc.html` | The sampler artboard, linked to the canvas's `ds/wallarm-design-system/` copy |
| `files.json` | Each written file with its sha256 |
| `removed.json` | With `--existing`: the paths an update drops |

Options: `--dir <folder>` (default `wallarm-design-system`), `--overwrite` (required when the
folder has files), `--existing <file>` (a JSON array of the artifact's current paths; writes
`removed.json`), `--json` (prints `{ ok, exitCode, data | error }`). Exit codes: `0` done,
`1` error, `2` usage, `3` done with a manual step (remove the paths in `removed.json`).

The package version is the design-system version it was built from.

## Maintainers

This package also builds the export. It reads the design-system sources, `scripts/metadata/`
and `dist/` from `../design-system` (`DESIGN_SYSTEM_DIR` in `src/config.ts`); the
`@wallarm-org/design-system` package is not affected. Each stable release publishes this package
from `deploy-site.yml` (job `claude-design`): it runs `export`, sets the version to the tag and
runs `pnpm publish`, whose `prepack` (`src/pack.ts`) packs `.claude-design/` into `dist/` with
the rendered `content/SETUP.md` and the canvas sampler. Wallarm's own artifact is synced by hand
with the [`claude-design-sync`](../../.claude/skills/claude-design-sync/SKILL.md) skill; the
designer guide is `apps/website/docs/ai/claude-design.mdx`. What Storybook does not show, and
so Claude Design cannot learn: [CLAUDE_DESIGN_GAP.md](./CLAUDE_DESIGN_GAP.md).

### Folders

All under `src/`. Outside it: `bin/claude-design.js` (the npm CLI, plain Node ESM) and `content/SETUP.md` (the guide template).

| Folder | Does |
| --- | --- |
| `bundle/` | Rslib IIFE bundle (`WallarmDS` namespace, SWC React Compiler targeting React 18) |
| `css/` | Tailwind CSS for the canvas: the author layout kit (`safelist.ts`), wrapper-tolerant structural selectors (`wrapper-css.ts`) and the generated `components/UTILITIES.md` class list |
| `tokens/` | Design tokens |
| `docs/` | Component guides, prop types and the project README (embeds `design-system/src/guidelines/rules.md`) |
| `previews/` | Story previews |
| `sampler/` | The canonical screen `sampler.dc.html`, checked against the built CSS, tokens and exports, and shipped at the project root |
| `assets/` | Icons, fonts and the cover |
| `harness/` | React 18 tests that mount the built bundle and previews |
| `config.ts` | Artifact identity, namespace, budgets |
| `pack.ts` | `prepack`: `.claude-design/` → `dist/` for npm (no SVG assets, rendered `SETUP.md`, canvas sampler) |
| `build.ts`, `verify.ts` | Builder and repeatability check |

### Commands

`export`, `bundle`, `verify` and `test:export` need a built design system. Through turbo it is built first:
run them from the repo root as `pnpm turbo run <script> --filter=@wallarm-org/claude-design`.
After a `pnpm build`, `pnpm --filter @wallarm-org/claude-design run <script>` (or `pnpm run
<script>` in this folder) runs the script alone.

- `export` writes `.claude-design/project/`, `file-hashes.json` and `summary.json` (git-ignored). Fails over budget.
- `prepack` (also run by `pnpm pack` / `pnpm publish`) packs the export into `dist/`; run `export` first. Smoke test: `pnpm pack`, then `npx -y --package=<tgz> claude-design export --dir <tmp>`.
- `test:export` runs the producer unit tests and the React 18 harness (through turbo it runs `export` first).
- `verify` builds twice and compares every output file.
- `bundle` runs `rslib build` on `rslib.config.ts`: only `bundle.js`, unwrapped, into `.claude-design/rslib/`, for inspecting it (`RSDOCTOR=true` works). `export` builds through the same config.
- `typecheck` type-checks the exporter.
- `plan`, `check`, `fetch` build the publish diff against the remote artifact. Call `fetch` as `pnpm run fetch`: plain `pnpm fetch` is a pnpm built-in.

The export is not part of the root `pnpm build`.

### Which tests need a build

The harness tests (`src/harness/*.harness.test.ts`) and `src/build.test.ts` read the built
project: run `export` first. The other `*.test.ts` files test the producers against the
design-system sources and `dist/`.

### Budgets

Set in `src/config.ts`, enforced by `src/build.ts`: bundle `bundleBudgetBytes` (5.7 MB), CSS
`cssCapBytes` (2 MB), whole project 256 MiB.
