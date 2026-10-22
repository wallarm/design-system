# Versioning Strategy

This project follows [Semantic Versioning 2.0.0](https://semver.org/) (SemVer) for all published packages and uses [Conventional Commits](https://www.conventionalcommits.org/) for commit messages. Versions are bumped automatically by [semantic-release](https://semantic-release.gitbook.io/) — there is no manual version-bump step and no changelog file to hand-edit.

**The release process — branch strategy, RC versions, commit-type → release mapping, CI requirements — is documented in [RELEASE.md](./RELEASE.md).**

## Published Packages

`@wallarm-org/design-system`, `@wallarm-org/mcp` and `@wallarm-org/migrator` are published to npm and follow SemVer:

- **Major version (X.0.0)**: Breaking changes
- **Minor version (0.X.0)**: New features, backward compatible
- **Patch version (0.0.X)**: Bug fixes, backward compatible

## Commit Message Format

All commit messages are validated by commitlint (`.commitlintrc.json`, run by the Husky `commit-msg` hook):

```
<type>(<scope>): <subject>

<body>

<footer>
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. Which of them trigger a release is listed in [RELEASE.md → Automatic Versioning](./RELEASE.md#automatic-versioning).

### Breaking Changes

- Add `!` after the type/scope: `feat!: new API`
- Or add `BREAKING CHANGE:` in the commit body

Either triggers a Major bump and requires a migration in `packages/migrator/src/migrations/`.

### Examples

```bash
feat(button): add size variant prop
fix: resolve tooltip positioning issue
docs: update installation guide

feat!: redesign component API

BREAKING CHANGE: The `color` prop has been renamed to `variant`
```

### Interactive Commit Creation

```bash
pnpm commit
```
