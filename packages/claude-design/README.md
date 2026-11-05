# Claude Design export

`@wallarm-org/claude-design` (private, never published) turns `@wallarm-org/design-system`
into a Claude Design project: a runtime bundle, guides, previews, tokens, CSS, fonts and icons.
It reads the design-system sources, `scripts/metadata/` and `dist/` from `../design-system`
(`DESIGN_SYSTEM_DIR` in `src/config.ts`); the npm package is not affected.
Maintainers publish it manually with the [`claude-design-sync`](../../.claude/skills/claude-design-sync/SKILL.md)
skill; the designer guide is `apps/website/docs/ai/claude-design.mdx`. What Storybook does not
show, and so Claude Design cannot learn: [CLAUDE_DESIGN_GAP.md](./CLAUDE_DESIGN_GAP.md).

## Folders

All under `src/`.

| Folder | Does |
| --- | --- |
| `bundle/` | Rslib IIFE bundle (`WallarmDS` namespace, SWC React Compiler targeting React 18) |
| `css/` | Tailwind CSS for the canvas: the author layout kit (`safelist.ts`), wrapper-tolerant structural selectors (`wrapper-css.ts`) and the generated `components/UTILITIES.md` class list |
| `tokens/` | Design tokens |
| `docs/` | Component guides, prop types and the project README |
| `previews/` | Story previews |
| `assets/` | Icons, fonts and the cover |
| `harness/` | React 18 tests that mount the built bundle and previews |
| `config.ts` | Artifact identity, namespace, budgets |
| `build.ts`, `verify.ts` | Builder and repeatability check |

## Commands

`export`, `bundle`, `verify` and `test:export` need a built design system. Through turbo it is built first:
run them from the repo root as `pnpm turbo run <script> --filter=@wallarm-org/claude-design`.
After a `pnpm build`, `pnpm --filter @wallarm-org/claude-design run <script>` (or `pnpm run
<script>` in this folder) runs the script alone.

- `export` writes `.claude-design/project/`, `file-hashes.json` and `summary.json` (git-ignored). Fails over budget.
- `test:export` runs the producer unit tests and the React 18 harness (through turbo it runs `export` first).
- `verify` builds twice and compares every output file.
- `bundle` runs `rslib build` on `rslib.config.ts`: only `bundle.js`, unwrapped, into `.claude-design/rslib/`, for inspecting it (`RSDOCTOR=true` works). `export` builds through the same config.
- `typecheck` type-checks the exporter.
- `plan`, `check`, `fetch` build the publish diff against the remote artifact. Call `fetch` as `pnpm run fetch`: plain `pnpm fetch` is a pnpm built-in.

The export is not part of the root `pnpm build`.

## Which tests need a build

The harness tests (`src/harness/*.harness.test.ts`) and `src/build.test.ts` read the built
project: run `export` first. The other `*.test.ts` files test the producers against the
design-system sources and `dist/`.

## Budgets

Set in `src/config.ts`, enforced by `src/build.ts`: bundle `bundleBudgetBytes` (5.7 MB), CSS
`cssCapBytes` (2 MB), whole project 256 MiB.
