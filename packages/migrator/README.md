# @wallarm-org/migrator

Codemod CLI that migrates consumer apps across `@wallarm-org/design-system` breaking changes. Renovate runs it after a design-system upgrade; it can also be run by hand.

## How an upgrade reaches your app

1. The design-system releases a new version. Breaking changes always come in a major, and every breaking change ships a migration.
2. Renovate opens one MR in your repo with the version bump, the lockfile, and the source rewrites made by the migrator. It applies every migration between the version you were on and the new one, so skipping several majors is fine.
3. Whatever the migrator can rewrite safely is already done in the MR. Whatever it can't — a value computed at runtime, a spread that may override the prop — it leaves for you, marked in the code and listed in `wds-migration.md`. It never guesses: after the MR your app renders the same as before the upgrade.
4. Your CI fails while any manual step is left, so the MR can't be merged half-migrated.

## Fixing manual steps

Each spot that needs you gets a marker right after the component name, saying which migration left it and what to do:

```tsx
// In the MR
<Avatar /* @wds-migration(avatar-size-rename): Avatar size was renamed (xs -> md, sm -> lg; new sm is 20px): non-static value, review manually */ size={big ? 'sm' : 'xs'} />

// After you fix it (old sm is the new lg, old xs is the new md)
<Avatar size={big ? 'lg' : 'md'} />
```

`wds-migration.md` (one per package in a monorepo) lists the same spots with file and line, plus files that could not be parsed. Fix every marker, delete the comment and the report, push — CI goes green.

## Usage

```bash
migrator --from <version> [--to <version>] [--dry-run] [paths...]
```

- `--from` (required): the exact stable design-system version you are migrating from. A prerelease `--from` is rejected: pass the stable version your code matches.
- `--to`: target version (default: the installed `@wallarm-org/design-system`).
- `--dry-run`: print changes, write nothing.
- `--help`, `--version`.

Without paths, tracked files under the current directory are scanned. Exit code is `0` for completed runs (even with manual items) and `1` for usage/version errors. When something needs a manual change, or a file could not be parsed, `wds-migration.md` is written (its heading contains `@wds-migration`), and each manual spot also gets an in-code marker right after the tag name: `<Avatar /* @wds-migration(avatar-size-rename): … */ size={s} />`.

## Consumer setup

Renovate repository config (or a shared preset in the GitLab Renovate runner repo):

```json
{
  "packageRules": [
    {
      "matchPackageNames": ["@wallarm-org/design-system"],
      "minimumReleaseAge": "1 hour",
      "prBodyNotes": ["⚠️ The design-system migrator may have left manual steps: search this MR for `wds-migration` comments and the `wds-migration.md` report, fix them, then delete the report."],
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
- `currentVersion` is the **locked** version when a lockfile exists (Renovate has no separate `lockedVersion` template). Consumers must commit their lockfile.
- `installTools.node` is needed on the default slim Renovate image (`binarySource=install`), where `npx` isn't on PATH. The `-full` image already has it. With `binarySource=global` the runner image has to provide node/npm.
- Self-hosted runner admin config: `allowedCommands: ["^npx --yes @wallarm-org/migrator@latest --from \\d+\\.\\d+\\.\\d+\\S* --to \\d+\\.\\d+\\.\\d+\\S*$"]`.
- `prBodyNotes` deliberately avoids the literal `@wds-migration`: the tracked Renovate config would otherwise trip the CI gate below.
- Consumer CI: one job

  ```sh
  if git grep -n '@wds-migration'; then echo 'Design-system migration left manual steps: fix the @wds-migration markers and delete wds-migration.md'; exit 1; fi
  ```

  Both the in-code markers and the report heading contain `@wds-migration`, so it fails (and prints the hits) until every marker is fixed and `wds-migration.md` is deleted; it works under `set -e`.
- Manual run after an upgrade: `pnpm dlx @wallarm-org/migrator --from 2.9.0` (or `yarn dlx` / `npx`).

## Adding a migration

In Claude Code, run `/new-migration`: it walks through finding the breaking changes, deriving the mapping and writing the tests.

Every breaking-change PR to the design-system must add a migration (enforced by `require-migration` in `.github/workflows/pr-title.yml`). A breaking change that needs nothing from consumers ships a report-only migration.

1. Create `src/migrations/<id>.ts` exporting `migration: Migration` (`{ id, title, transform(file, ctx) }`). Use `ctx.report(node, message)` for cases that need a manual change, and the JSX helpers in `src/lib/jsx.ts`.
2. Register it in `src/migrations/index.ts`.
3. Add before/after fixtures in `src/migrations/__fixtures__/<id>/<case>.input.tsx` + `<case>.output.tsx` (outputs include the `@wds-migration` markers; `__tests__/fixtures.test.ts` also checks idempotence). Assert report counts/messages, aliased/subpath/namespace imports and a same-named non-DS component (must not change) in `src/migrations/__tests__/` using `apply()` from `harness.ts`.
4. Never edit `versions.json` by hand: it is stamped automatically when the design-system releases a major version.
