# Versioning Strategy

This project follows [Semantic Versioning 2.0.0](https://semver.org/) (SemVer) for all published packages and uses [Conventional Commits](https://www.conventionalcommits.org/) for standardized commit messages.

## Overview

- **Production releases**: Published from the `main` branch with stable version tags
- **RC (release candidate) releases**: Published automatically from `feature/*` and `fix/*` branches, tagged per-branch (e.g. `rc-button`)
- **Version management**: Fully automated by [semantic-release](https://semantic-release.gitbook.io/) — there is no manual version-bump step and no changelog file to hand-edit. See [RELEASE.md](./RELEASE.md) for the full branch strategy and worked examples.

## Package Publishing

### NPM Packages

`@wallarm-org/design-system` and `@wallarm-org/mcp` are published to the NPM registry and follow this versioning scheme:

- **Major version (X.0.0)**: Breaking changes
- **Minor version (0.X.0)**: New features, backward compatible
- **Patch version (0.0.X)**: Bug fixes, backward compatible

## Commit Conventions

This project enforces [Conventional Commits](https://www.conventionalcommits.org/) specification for all commit messages (validated by commitlint via a Husky hook). This leads to:

- Automated version bumps based on commit types
- Organized and readable changelogs
- Clear communication of changes

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types

| Type       | Description                           | Version Bump  |
| ---------- | ------------------------------------- | ------------- |
| `feat`     | New feature                           | Minor (0.X.0) |
| `fix`      | Bug fix                               | Patch (0.0.X) |
| `docs`     | Documentation only changes            | No bump       |
| `style`    | Code style changes (formatting, etc.) | No bump       |
| `refactor` | Code refactoring without feature/fix  | No bump       |
| `perf`     | Performance improvements              | Patch (0.0.X) |
| `test`     | Adding or updating tests              | No bump       |
| `build`    | Build system or dependency changes    | No bump       |
| `ci`       | CI/CD configuration changes           | No bump       |
| `chore`    | Other changes (maintenance)           | No bump       |
| `revert`   | Reverts a previous commit             | Varies        |

### Breaking Changes

To indicate a breaking change:

- Add `!` after the type/scope: `feat!: new API`
- Or add `BREAKING CHANGE:` in the commit body
- This will trigger a Major version bump (X.0.0)

### Examples

```bash
# Feature with scope
feat(button): add size variant prop

# Bug fix
fix: resolve tooltip positioning issue

# Breaking change
feat!: redesign component API

BREAKING CHANGE: The `color` prop has been renamed to `variant`

# Documentation update
docs: update installation guide
```

### Interactive Commit Creation

Use the interactive commit tool:

```bash
pnpm commit
# or
git cz
```

This will guide you through creating a properly formatted commit message.

## Release Process

Releases are driven entirely by `semantic-release` reading the commit history — there is no manual "create a changeset" or "bump the version" step.

### Production Releases

1. Develop on a `feature/*` or `fix/*` branch using Conventional Commits
2. Open a PR to `main` (PR title must also be a valid conventional commit — checked by `pr-title.yml`)
3. When merged, the `release` job in `.github/workflows/main.yml` runs `semantic-release`, which:
   - Analyzes every commit since the last release
   - Determines the version bump (`patch`/`minor`/`major`) from commit types
   - Publishes `@wallarm-org/design-system` (and, when its files changed, `@wallarm-org/mcp`) to npm with the `latest` tag
   - Creates a GitHub release with an auto-generated changelog
   - Creates a git tag for the release

### RC (Release Candidate) Versions

RC versions are published automatically on every push to a `feature/*` or `fix/*` branch — no manual trigger needed:

1. Push to `feature/my-branch` or `fix/my-branch`
2. CI runs quality checks and builds
3. `semantic-release` publishes a prerelease version tagged with the branch name, e.g. `1.0.0-rc.my-branch.1`, under the npm dist-tag `rc-my-branch`
4. Install and test it: `npm install @wallarm-org/design-system@rc-my-branch`

See [RELEASE.md](./RELEASE.md) for the full workflow, branch naming conventions, and troubleshooting.

## Commands

```bash
# Interactive conventional commit
pnpm commit
# or
git cz

# Standard git commit (validated by commitlint)
git commit -m "feat: add new feature"

# Preview the next release without publishing (useful for debugging)
pnpm semantic-release:dry-run

# Publish a release (CI only — requires NPM_TOKEN)
pnpm semantic-release
```

## CI/CD Integration

### Required Secrets

- `NPM_TOKEN`: NPM automation token, used by the `release` job to publish
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

### Workflow

Everything — quality checks, build, E2E, screenshot updates, Storybook deployment, and the release itself — runs as jobs inside the single [`main.yml`](./.github/workflows/main.yml) workflow, triggered on push to any branch. PR title validation is a separate workflow, [`pr-title.yml`](./.github/workflows/pr-title.yml). See [CI_PLAN.md](./CI_PLAN.md) for the full job list.

## Best Practices

1. **Use Conventional Commits** for every commit — this is what drives version bumps and changelog generation, with no separate step required
2. **Write clear commit subjects** that explain the change from a user's perspective — they end up in the changelog verbatim
3. **Test RC versions** before merging to `main`
4. **Follow SemVer strictly** to avoid breaking consumer applications
5. **Use `pnpm semantic-release:dry-run`** locally if you need to sanity-check what the next release would look like

## Version Lifecycle Example

1. Feature development on `feature/new-button` branch, using conventional commits (`feat: ...`, `fix: ...`)
2. Push → RC version published automatically: `1.0.0-rc.new-button.1`
3. Testing in RC: `npm install @wallarm-org/design-system@rc-new-button`
4. PR to `main`, reviewed and merged
5. `release` job runs `semantic-release` → production release published (e.g. `1.1.0`, since `feat:` commits trigger a minor bump)
6. Users update: `npm install @wallarm-org/design-system@latest`

## Troubleshooting

### No Version Bump

If a merge to `main` doesn't trigger a version bump:

- Confirm the merged commits actually contain a `feat:`/`fix:`/`perf:` (or breaking-change) commit — `docs:`/`chore:`/`refactor:`/etc. never trigger a release on their own
- Run `pnpm semantic-release:dry-run` to see what semantic-release thinks the next version would be, and why
- Check the `release` job logs in the relevant GitHub Actions run

### Publishing Failures

If publishing fails:

- Verify `NPM_TOKEN` is valid and has publish rights for `@wallarm-org/design-system` / `@wallarm-org/mcp`
- Check npm registry status
- Ensure `package.json` has correct `publishConfig`
- Review the `release` job's logs in GitHub Actions for the detailed semantic-release error

## Additional Resources

- [semantic-release Documentation](https://semantic-release.gitbook.io/)
- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Semantic Versioning Spec](https://semver.org/)
- [NPM Publishing Docs](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [RELEASE.md](./RELEASE.md) — full branch strategy, worked examples, and troubleshooting
