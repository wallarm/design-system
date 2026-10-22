# Release

`@wallarm-org/design-system` is released automatically by `semantic-release` from [Conventional Commits](https://www.conventionalcommits.org/) and follows [SemVer](https://semver.org/).

## Stable versions

Every merge to `main` with a `feat`, `fix`, `perf`, `revert` or breaking-change commit publishes a new version under the `latest` tag:

```bash
npm install @wallarm-org/design-system@latest
```

Release notes: [CHANGELOG.md](https://github.com/wallarm/design-system/blob/main/packages/design-system/CHANGELOG.md) and [GitHub Releases](https://github.com/wallarm/design-system/releases). Breaking (major) releases ship a migration for [`@wallarm-org/migrator`](https://github.com/wallarm/design-system/blob/main/packages/migrator/README.md).

## Release candidates

Pushes to `feature/*`, `feat/*` and `fix/*` branches publish RC versions like `1.1.0-rc-feature-button.1` (the branch name with `/` and `_` replaced by `-`). Install them by exact version:

```bash
npm view @wallarm-org/design-system versions --json | tail
npm install @wallarm-org/design-system@1.1.0-rc-feature-button.1
```

## More

- [RELEASE.md](https://github.com/wallarm/design-system/blob/main/RELEASE.md) — full release process, RC format, CI requirements
- [VERSIONING.md](https://github.com/wallarm/design-system/blob/main/VERSIONING.md) — SemVer policy and commit format
