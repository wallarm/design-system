---
name: vestige-audit
description: Before opening a PR, find and remove what the branch made obsolete — docs, comments, configs, scripts and links that still describe removed or changed code. Required by the `gh pr create` hook in `.claude/settings.json`; also use when the user asks to clean up leftovers ("рудименты", stale docs, dead links) on a branch.
---

# Vestige Audit

Remove the leftovers ("рудименты") of the current branch before it becomes a PR: anything that still describes code, files, scripts, props or behaviour the branch removed, renamed or changed.

## Usage

```
/vestige-audit
```

Scope is the branch diff: `git diff $(git merge-base origin/main HEAD)...HEAD` plus uncommitted changes. Don't audit the whole repo — fix only what this branch made stale (and anything it touched that was already stale).

## Instructions

### 1. List what changed

From the diff, write down every **removed or renamed**: file and directory, export / component / sub-component, prop / variant value / default, CSS token, `package.json` script / dependency / `exports` subpath, CI job / env var / secret, command or CLI flag. Also note **behaviour changes** (defaults, tooling swaps like Vitest → Rstest).

### 2. Find the references

For each item, `git grep -n` the old name/path across the repo (skip `CHANGELOG.md` and `*-snapshots/`):

- Markdown and MDX: `README.md`, `CLAUDE.md` (`AGENTS.md` is a symlink to it), `RELEASE.md`, `VERSIONING.md`, `docs/**`, `packages/*/README.md`, `packages/*/CLAUDE.md`, component-folder docs (`TABLE_DESIGN.md`, `ANALYTICS_GAPS.md`, `SimpleCharts/**`).
- Claude config: `.claude/agents/*`, `.claude/rules/*`, `.claude/skills/**`, `.claude/settings.json`, `.mcp.json`.
- Story descriptions (`parameters.docs.description`), JSDoc and code comments that cite plans/specs/files.
- Configs and scripts: root and package `package.json`, `turbo.json`, `pnpm-workspace.yaml`, `.gitignore`, `scripts/**`, `.github/workflows/*`, `packages/configs/**`.

Also check every relative link and backticked repo path in the Markdown files the branch touched: each target must exist.

### 3. Decide per hit

- **Update** a statement that is now false — verify the new fact in the code before writing it.
- **Delete** a file whose whole purpose is gone: a completed implementation plan under `docs/superpowers/plans/`, a migration/redirect stub, a doc for a removed component, a script nothing invokes. Before deleting, `git grep` the filename — fix or remove every reference in the same change.
- **Leave** historical records that say they are historical (finished specs others link to, `CHANGELOG.md`), and anything you can't prove stale — list it in the report instead.

Never delete code, tests or stories here, and never change public API — that is a `refactor!:` with a migration (`/new-migration`). Docker files are kept on purpose (manual/local use).

### 4. Commit and mark

1. If anything changed: commit it as `docs: remove vestiges of <what the branch did>` (or `chore:` when only configs/scripts changed). Run `pnpm lint` first if code comments or configs were touched.
2. Record the audited HEAD so the PR hook lets `gh pr create` through:
   ```bash
   git rev-parse HEAD > "$(git rev-parse --git-path vestige-audit-ok)"
   ```
   Any new commit invalidates it — re-run the audit after further changes.
3. Report what you updated, deleted and left (with reason) in 5-10 lines.
