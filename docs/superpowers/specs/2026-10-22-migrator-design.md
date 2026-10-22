# Migrator — design spec

- **Package:** `packages/migrator` → `@wallarm-org/migrator`, bin `migrator`.
- **Related:** `packages/mcp` (same packaging/release shape), `packages/configs/publishing/releaserc.mjs`, `.github/workflows/main.yml` (`release` job), `.github/workflows/pr-title.yml`.

## 1. Goal

Consumer apps (React + TypeScript, Yarn or pnpm, in the corporate GitLab) should get a design-system major as **one MR that already compiles and looks the same**: version bump + lockfile (Renovate) + source rewrites for every breaking change between the old and the new version (`migrator`).

`size="sm"` on `Avatar` is the motivating case: it type-checks before and after 3.0.0 but means 32px before and 20px after. Typecheck can't catch it; only a codemod that knows the *old* version can. The same example shows why a **wrong `from` is destructive**: running the Avatar migration on code already on 3.x turns a correct new `sm` (20px) into `lg` (32px). Every decision below that touches versions is about getting `from` and the migration's version exactly right.

## 2. Callers

1. **Renovate** (primary). A self-hosted Renovate in GitLab bumps `@wallarm-org/design-system` and runs `migrator` as a `postUpgradeTasks` command; changed files land in the same MR.
2. **A developer, by hand** — `pnpm dlx @wallarm-org/migrator …`, `yarn dlx @wallarm-org/migrator …`, `npx @wallarm-org/migrator …`, or as a devDependency (`pnpm migrator …`).

Both run the same non-interactive CLI. No prompts, ever.

## 3. Decisions

| # | Decision |
|---|---|
| D1 | One new workspace package `packages/migrator`, published to public npm as `@wallarm-org/migrator`, ESM, Node ≥ 20. Built with Rslib like `packages/mcp`: single `dist/index.js` with a `#!/usr/bin/env node` banner, **`ts-morph` as a runtime `dependency`** (Rslib auto-externalizes it, exactly like mcp's `@modelcontextprotocol/sdk`). Bundling ts-morph was tried and fails at runtime (`__filename` in TypeScript's CJS, dynamic requires). |
| D2 | Migrations live **inside the migrator package** (`src/migrations/<id>.ts`, one migration per file, nothing else in that folder except `index.ts`; shared helpers go to `src/lib/`). The design-system package does not change shape. |
| D3 | AST engine: **ts-morph 28** (already used by `packages/design-system/scripts/metadata`). Syntactic only — no type checker, no tsconfig resolution; `.js/.jsx` parsed with `allowJs` + `jsx: preserve` in an in-memory `Project`. Edits replace the smallest node (an attribute initializer's literal text), so consumer formatting and quote style survive. No formatter is run. |
| D4 | Migrations exist **only for breaking changes**, so every migration belongs to a major (`X.0.0`). A migration ships **in the same PR as its breaking change** (D12) — never later, never on its own. |
| D5 | Migration → version mapping lives in **`packages/migrator/versions.json`**: `{ "latest": "3.0.0", "migrations": { "numeric-badge-type-color": "2.0.0", "avatar-size-rename": "3.0.0" } }`. Seeded by hand for history (those two values exactly). From then on it's written only by the release stamp (§7). `latest` = the newest design-system **major** the migrator knows about. |
| D6 | Version range: `--from` is **required** — the exact version before the upgrade. `--to` defaults to the version installed in `node_modules/@wallarm-org/design-system/package.json` (walk up from cwd, like `packages/mcp/src/metadata.ts`). Renovate passes both (§9). |
| D7 | No journal of applied migrations. Renovate always re-applies onto a fresh branch from base, so `from` always describes the code being migrated. Transforms are idempotent for one `from→to` run (a rename map is applied in one pass, never chained) — Renovate's `executionMode: update` may run the task once per `package.json` in a consumer monorepo. **Scoping rule:** the migrator only touches files under its cwd; Renovate must run it per package file dir (`workingDirTemplate: "{{{packageFileDir}}}"`, §9), so each package is migrated with its own `--from`. |
| D8 | Anything the migrator can't rewrite safely goes to a **report file `wds-migration.md`** at the cwd root (and stdout). The consumer CI blocks merge while any such file exists (`! git ls-files --others --cached --exclude-standard -- '*wds-migration.md' | grep -q .`); the team fixes the listed spots and deletes the file in the MR. No file is written when nothing needs a human; an existing file is overwritten. |
| D9 | Files to scan: `git ls-files` for `*.{ts,tsx,js,jsx,mts,cts}` from cwd (respects `.gitignore`, works in monorepos), pre-filtered to files whose text contains `@wallarm-org/design-system`. Positional path args override the list. Not a git repo and no paths → exit 1. A file that fails to parse is skipped with a warning and listed in the report. |
| D10 | Supported floor: `--from ≥ 1.0.0`. Lower → exit 1 with "upgrade to 1.x manually first". |
| D11 | First two migrations, from real history: `avatar-size-rename` (3.0.0) and `numeric-badge-type-color` (2.0.0) — §6. |
| D12 | Policy: every breaking-change PR to the design-system ships a migration (a codemod, or a report-only migration with instructions) in the same PR. Enforced on the PR (§8). |

## 4. CLI

```
migrator --from <version> [--to <version>] [--dry-run] [paths...]
```

| Flag | Meaning |
|---|---|
| `--from` | Required. Exact semver the project was on before the upgrade. A range (`^2.9.0`) → exit 1. |
| `--to` | Target version. Default: installed design-system version (D6). |
| `--dry-run` | Print what would change (file, line, before → after) and the manual items; write nothing, including the report file. |
| `paths...` | Explicit files/dirs instead of `git ls-files`. |
| `--help`, `--version` | Standard. |

Steps: validate versions → select migrations whose version is in `(from, to]`, ordered by version then id → for each candidate file, run every selected migration's transform in that order on the in-memory source → write changed files → write the report if there are manual items → print a summary (`N files changed, M manual items`).

Exit codes:

- `0` — ran, with or without manual items. Manual items must not fail the run: Renovate has to open the MR so the team sees it; D8's CI check does the blocking.
- `1` — bad args, `from` not exact, `from > to`, `from < 1.0.0`, or **migrator too old**: `to` is a stable release with `major(to) > major(latest)` → "design-system X is newer than this migrator knows; retry later or update @wallarm-org/migrator". Prerelease `to` skips the "too old" check.

What Renovate does with exit 1 (verified in Renovate source): it records an artifact error. For a release younger than 2 hours with no existing branch it creates nothing and retries next run; after that it opens the MR with a red `renovate/artifacts` check and the stderr in a comment. Either way nothing unmigrated gets merged silently.

## 5. Migration shape

```ts
// src/migrations/avatar-size-rename.ts
export const migration: Migration = {
  id: 'avatar-size-rename',          // = file name; key in versions.json
  title: 'Avatar: xs → md, sm → lg',
  transform(file, ctx) { … },        // ts-morph SourceFile; ctx.report(node, message) for manual items
};
```

- `src/migrations/index.ts` lists all migrations explicitly (the CLI does no fs scanning of its own code). A unit test asserts the `index.ts` list equals the folder contents and equals the keys of `versions.json` plus any pending ids.
- `src/lib/` helper: **find JSX usages of a design-system component** — resolves `import { Avatar }`, `import { Avatar as A }`, from `@wallarm-org/design-system` and `@wallarm-org/design-system/Avatar` (the `./*` subpath export), and namespace imports (`import * as DS` → `<DS.Avatar>`). Local re-exports and wrapper components are out of reach (§6 lists what gets reported).
- A **report-only** migration's transform only calls `ctx.report` for each usage (behaviour changes with no mechanical fix).
- A **pending** migration (id not yet in `versions.json`) is selected only when `--to` is a prerelease above `from` — that's how RC builds from feature branches get exercised. Otherwise it's ignored.

## 6. The first two migrations

**`avatar-size-rename`** (3.0.0, commit `eee46ba1`). On `Avatar` only:

| Old `size` | New `size` |
|---|---|
| `"xs"` (24px) | `"md"` |
| `"sm"` (32px) | `"lg"` |
| absent | absent (old default `sm` = 32px, new default `lg` = 32px) |

String literal, `{'xs'}` and `` {`xs`} `` are rewritten. Reported: any other expression (`size={size}`, ternaries), and a spread on an `Avatar` with no explicit `size` (`<Avatar {...p} />` — `p.size` may be old).

**`numeric-badge-type-color`** (2.0.0, commit `b63f6419`). On `NumericBadge` only, `type` splits into `type` + `color` (mapping derived from the old/new CVA classes):

| Old `type` | New `type` | New `color` |
|---|---|---|
| `primary` | `secondary` | `neutral` |
| `primary-alt` | `secondary` | `neutral-alt` |
| `brand` | `solid` | `brand` |
| `destructive` | `solid` | `danger` |
| `outline` | `outline` | `neutral` |
| `info` | `secondary` | `info` |
| absent | absent | absent (old default `primary` ≡ new default `secondary` + `neutral`) |

A literal `type` is replaced and a `color` attribute is inserted right after it. Reported: non-literal `type`, an existing `color` attribute on the element (before 2.0.0 it was the HTML attribute), and a spread with no explicit `type`.

Visual-only changes that came with these majors (e.g. the Avatar plate restyling) are not migrations.

## 7. Release & versions.json

The design-system and mcp already release in one `release` job (`main.yml`), design-system first. The migrator joins after the design-system.

1. **Stamp.** A local semantic-release plugin, `packages/configs/publishing/stamp-migrations.mjs` (no new dependency), with a `prepare(pluginConfig, { nextRelease, logger })` step. It runs **on `main` only** and **only when `nextRelease.type === 'major'`**: every top-level `packages/migrator/src/migrations/*.ts` except `index.ts` whose id is missing from `versions.json.migrations` gets `nextRelease.version`; `latest` becomes `nextRelease.version`. On a non-major release it changes nothing (and logs a warning if pending ids exist — D12 makes that unreachable in practice).
   - `defineConfig` (`releaserc.mjs`) gets a new param `extraPrepare = []`, spliced in inside the `isMainBranch` block **right before `@semantic-release/git`** (prepare steps run in array order). Only the root `.releaserc.mjs` passes the stamp, and adds `packages/migrator/versions.json` to its `gitAssets`, so it lands in the `chore(release): vX` commit.
2. **Publish.** New step "Release migrator" right after "Release design-system": `working-directory: packages/migrator`, `pnpm semantic-release`, same env as the mcp step. `packages/migrator/.releaserc.mjs` mirrors mcp's with `tagFormat: 'migrator-v${version}'`. The step runs when either
   - `packages/migrator/versions.json` changed in this job (save `HEAD` before "Release design-system", then `git diff --quiet $SAVED HEAD -- packages/migrator/versions.json`), or
   - `git diff --name-only <last stable migrator-v tag>..HEAD -- packages/migrator` is non-empty (no tag yet → run).

   Don't reuse `check-mcp`'s `HEAD~1..HEAD` commit-message check: it misses PRs whose run was cancelled by `cancel-in-progress`, and the release that follows an `[update-screenshots]` bot commit. A DS major always means a breaking commit since the last migrator tag, so semantic-release does publish the migrator in that case. First publish starts at 1.0.0.
3. **Runtime read.** Published `files`: `dist`, `versions.json`. The CLI reads `versions.json` at runtime (`new URL('../versions.json', import.meta.url)`), because `dist` comes from the `build` job, before the stamp exists.
4. **RC tag recovery** (`release` job, "Clean stale RC tags"): add `@wallarm-org/migrator` to the loop **and** switch the prefix logic to `case $PKG in @wallarm-org/mcp) P=mcp-v;; @wallarm-org/migrator) P=migrator-v;; *) P=v;; esac`. Just adding it to the list would create `v…` tags, which belong to the design-system.

The migrator's own version is driven by all repo commits, like mcp, so it takes a major whenever the design-system does. Callers use `@latest`.

## 8. Enforcing D12

A new job in **`.github/workflows/pr-title.yml`** (`pull_request` event). On `main.yml` it would only run after merge, where a failure blocks the release but the next push releases anyway. The job works off what semantic-release actually sees after a squash merge:

- breaking = PR title matches `^[a-z]+(\(.+\))?!:` or the PR body has a line starting `BREAKING CHANGE:` / `BREAKING CHANGES:` (mirrors `releaserc`'s `{ breaking: true }`: any type);
- if breaking and `git diff --name-only --diff-filter=A base.sha...head.sha -- ':(glob)packages/migrator/src/migrations/*.ts' ':!packages/migrator/src/migrations/index.ts'` is empty → fail, linking this spec.

Breaking changes that need nothing from consumers (e.g. a dropped Node version) still ship a **report-only** migration whose message explains it. That keeps the rule mechanical. The same rule goes into `CLAUDE.md` → Commit Conventions and `.claude/agents/design-system.md`.

## 9. Consumer setup (documented in `packages/migrator/README.md`, not built here)

Renovate repository config (or a shared preset in the GitLab Renovate runner repo):

```json
{
  "packageRules": [
    {
      "matchPackageNames": ["@wallarm-org/design-system"],
      "minimumReleaseAge": "1 hour",
      "postUpgradeTasks": {
        "commands": ["npx --yes @wallarm-org/migrator@latest --from {{{currentVersion}}} --to {{{newVersion}}}"],
        "fileFilters": ["**/*.{ts,tsx,js,jsx,mts,cts}", "**/wds-migration.md"],
        "workingDirTemplate": "{{{packageFileDir}}}",
        "installTools": { "node": {} }
      }
    }
  ]
}
```

- `workingDirTemplate` runs the migrator from each upgraded `package.json`'s directory, so each package's tasks run with its own `--from` and only touch files under it. From the repo root, one package's `--from` would rewrite every package (e.g. turn an already-migrated `sm` into `lg`). In a monorepo each package gets its own `wds-migration.md`, hence the recursive filter and CI check.
- `currentVersion` is the **locked** version when a lockfile exists (Renovate has no separate `lockedVersion` template). Consumers must commit their lockfile, which they already do with Yarn/pnpm.
- `installTools.node` is needed on the default slim Renovate image (`binarySource=install`), where `npx` isn't on PATH. The `-full` image already has it. With `binarySource=global` the runner image has to provide node/npm.
- Self-hosted runner admin config: `allowedCommands: ["^npx --yes @wallarm-org/migrator@latest --from \\d+\\.\\d+\\.\\d+\\S* --to \\d+\\.\\d+\\.\\d+\\S*$"]`.
- Consumer CI: one job `! git ls-files --others --cached --exclude-standard -- '*wds-migration.md' | grep -q .` (fails while any `wds-migration.md` exists in the repo).
- Manual run after an upgrade: `pnpm dlx @wallarm-org/migrator --from 2.9.0` (or `yarn dlx` / `npx`).

## 10. Testing

- **Per migration** (Rstest, `src/migrations/__tests__/`): before → after fixtures as inline strings, including aliased imports, subpath import, namespace import, `{'xs'}`, a `.jsx` file, a same-named non-DS `Avatar` (must not change), and every reported case (asserts the report and that nothing was edited).
- **Idempotence:** running a migration on its own output changes nothing.
- **Range selection:** unit tests over a fake `versions.json` — `(from, to]` bounds, ordering, pending migrations with prerelease `to`, "too old", `from < 1.0.0`, range-shaped `from`.
- **Registry consistency:** `index.ts` ⇔ folder ⇔ `versions.json` (§5).
- **CLI end-to-end:** temp dir, `git init`, a few files, run the built CLI: changed files, report file presence/absence, exit codes, `--dry-run` writes nothing.
- **Stamp plugin:** unit tests on a temp dir — major stamps pending ids and `latest`; minor/patch changes nothing.

## 11. Non-goals

- Running/hosting Renovate in GitLab (ops; §9 is only the snippet).
- Auto-detecting `--from` from git history/lockfiles (Yarn classic, Yarn Berry and pnpm lockfiles all differ). Add if manual runs ask for it.
- Migrations for majors before 2.0.0, for non-design-system packages, for CSS/theme token renames, or for minor/patch releases.
- Running the consumer's formatter or linter.
- An interactive mode.

## 12. Left to the builder

- Internal module layout under `src/lib/`, helper names, CLI arg parsing (`node:util` `parseArgs` is enough), summary/report wording.
