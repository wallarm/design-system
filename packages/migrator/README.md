# @wallarm-org/migrator

Codemod CLI that migrates consumer apps across `@wallarm-org/design-system` breaking changes. Renovate runs it after a design-system upgrade; it can also be run by hand.

## Usage

```bash
migrator --from <version> [--to <version>] [--dry-run] [paths...]
```

- `--from` (required): the design-system version you are migrating from.
- `--to`: target version (default: the installed `@wallarm-org/design-system`).
- `--dry-run`: print changes, write nothing.
- `--help`, `--version`.

Without paths, tracked files of the current git repository are scanned. Exit code is `0` for completed runs (even with manual items) and `1` for usage/version errors. When something needs a manual change, or a file could not be parsed, `wds-migration.md` is written.

## Consumer setup

Renovate repository config (or a shared preset in the GitLab Renovate runner repo):

```json
{
  "packageRules": [
    {
      "matchPackageNames": ["@wallarm-org/design-system"],
      "minimumReleaseAge": "1 hour",
      "postUpgradeTasks": {
        "commands": ["npx --yes @wallarm-org/migrator@latest --from {{{currentVersion}}} --to {{{newVersion}}}"],
        "fileFilters": ["**/*.{ts,tsx,js,jsx,mts,cts}", "wds-migration.md"],
        "installTools": { "node": {} }
      }
    }
  ]
}
```

- `currentVersion` is the **locked** version when a lockfile exists (Renovate has no separate `lockedVersion` template). Consumers must commit their lockfile.
- `installTools.node` is needed on the default slim Renovate image (`binarySource=install`), where `npx` isn't on PATH. The `-full` image already has it. With `binarySource=global` the runner image has to provide node/npm.
- Self-hosted runner admin config: `allowedCommands: ["^npx --yes @wallarm-org/migrator@latest --from \\d+\\.\\d+\\.\\d+\\S* --to \\d+\\.\\d+\\.\\d+\\S*$"]`.
- Consumer CI: one job `test ! -f wds-migration.md`, so a PR with manual items cannot merge until they are handled and the report is deleted.
- Manual run after an upgrade: `pnpm dlx @wallarm-org/migrator --from 2.9.0` (or `yarn dlx` / `npx`).

## Adding a migration

Every breaking-change PR to the design-system must add a migration (enforced by `require-migration` in `.github/workflows/pr-title.yml`). A breaking change that needs nothing from consumers ships a report-only migration.

1. Create `src/migrations/<id>.ts` exporting `migration: Migration` (`{ id, title, transform(file, ctx) }`). Use `ctx.report(node, message)` for cases that need a manual change, and the JSX helpers in `src/lib/jsx.ts`.
2. Register it in `src/migrations/index.ts`.
3. Add tests in `src/migrations/__tests__/` using `apply()` from `harness.ts`: before/after, aliased/subpath/namespace imports, a same-named non-DS component (must not change), every reported case, and idempotence.
4. Never edit `versions.json` by hand: it is stamped automatically when the design-system releases a major version.
