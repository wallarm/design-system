# Claude Design export

A separate build that turns the design system into a Claude Design project: a runtime
bundle, guides, previews, tokens, CSS, fonts and icons. The npm package is not affected.
Maintainers publish it manually with the [`claude-design-sync`](../../../.claude/skills/claude-design-sync/SKILL.md)
skill; the designer guide is `apps/docs/docs/ai/claude-design.mdx`. What Storybook does not
show, and so Claude Design cannot learn: [CLAUDE_DESIGN_GAP.md](./CLAUDE_DESIGN_GAP.md).

## Folders

| Folder | Does |
| --- | --- |
| `bundle/` | Rslib IIFE bundle (`WallarmDS` namespace, SWC React Compiler targeting React 18) |
| `css/` | Tailwind CSS for the canvas |
| `tokens/` | Design tokens |
| `docs/` | Component guides, prop types and the project README |
| `previews/` | Story previews |
| `assets/` | Icons, fonts and the cover |
| `harness/` | React 18 tests that mount the built bundle and previews |
| `config.ts` | Artifact identity, namespace, budgets |
| `build.ts`, `verify.ts` | Builder and repeatability check |

## Commands

Run from the repo root as `pnpm --filter @wallarm-org/design-system <script>`.

- `build:claude-design` builds the package, then writes `.claude-design/project/`, `file-hashes.json` and `summary.json` (git-ignored). Fails over budget.
- `test:claude-design` runs the producer unit tests and the React 18 harness.
- `claude-design:verify` builds twice and compares every output file.
- `claude-design:plan`, `claude-design:check`, `claude-design:fetch` build the publish diff against the remote artifact.

## Which tests need a build

The harness tests (`harness/*.harness.test.ts`) read the built bundle: run
`build:claude-design` first. The other `*.test.ts` files test the producers and need no build.

## Budgets

Set in `config.ts`, enforced by `build.ts`: bundle `bundleBudgetBytes` (5.7 MB), CSS
`cssCapBytes` (2 MB), whole project 256 MiB.
