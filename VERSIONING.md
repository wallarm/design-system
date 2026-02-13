# Versioning Strategy

This project follows [Semantic Versioning 2.0.0](https://semver.org/) (SemVer) for all published packages and uses [Conventional Commits](https://www.conventionalcommits.org/) for standardized commit messages.

## Overview

- **Production releases**: Published from the `main` branch with stable version tags
- **Alpha releases**: Published from `dev`, `alpha/*`, `beta/*`, or `rc/*` branches with pre-release tags
- **Version management**: Handled automatically by [Changesets](https://github.com/changesets/changesets)

## Package Publishing

### NPM Package

The `@wallarm-org/design-system` package is published to NPM registry and follows this versioning scheme:

- **Major version (X.0.0)**: Breaking changes
- **Minor version (0.X.0)**: New features, backward compatible
- **Patch version (0.0.X)**: Bug fixes, backward compatible

## Commit Conventions

This project enforces [Conventional Commits](https://www.conventionalcommits.org/) specification for all commit messages. This leads to:

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

### Production Releases

1. Create a changeset for your changes:

   ```bash
   pnpm changeset
   ```

2. Select the appropriate version bump:
   - `patch`: Bug fixes and small changes
   - `minor`: New features that are backward compatible
   - `major`: Breaking changes

3. Push your changes to a feature branch and create a PR

4. When merged to `main`, the CI will:
   - Create a "Version Packages" PR automatically
   - When merged, publish to NPM with the new version
   - Create a GitHub release with changelog

### Alpha/Pre-release Versions

Alpha versions are published automatically when pushing to specific branches:

- `dev` branch: For development releases
- `alpha/*` branches: For alpha testing
- `beta/*` branches: For beta testing
- `rc/*` branches: For release candidates

#### Manual Alpha Release

You can also trigger an alpha release manually:

1. Go to Actions → "Release Alpha" workflow
2. Click "Run workflow"
3. Select the branch to release from

Alpha versions follow this format: `X.Y.Z-alpha.{timestamp}.{commit}`

Example: `0.1.0-alpha.20240129120000.abc1234`

## Changeset Workflow

### Adding a Changeset

When making changes that should trigger a version bump:

```bash
# Add a changeset
pnpm changeset

# Follow the prompts to:
# 1. Select packages to version
# 2. Choose version bump type
# 3. Write a changelog message
```

### Changeset Files

Changesets are stored in `.changeset/` directory as markdown files. They contain:

- Packages affected
- Version bump type
- Change description

### Version Update Process

1. **Automated PR Creation**: When changesets are pushed to `main`, the CI creates a PR that:
   - Updates package versions
   - Updates CHANGELOG.md files
   - Removes processed changeset files

2. **Review and Merge**: Review the version PR and merge when ready

3. **Automatic Publishing**: Upon merging the version PR:
   - Packages are built and published to NPM
   - GitHub releases are created with changelogs
   - Git tags are created for each release

## Version Commands

```bash
# Create a conventional commit (interactive)
pnpm commit

# Add a changeset
pnpm changeset

# Update versions based on changesets
pnpm version

# Create alpha version
pnpm version:alpha

# Publish to NPM (CI only)
pnpm release

# Publish alpha version (CI only)
pnpm release:alpha
```

## Commit Commands

```bash
# Interactive commit creation
pnpm commit
# or
git cz

# Standard git commit (will be validated)
git commit -m "feat: add new feature"

# Bypass hooks (NOT recommended)
git commit -m "message" --no-verify
```

## CI/CD Integration

### Required Secrets

- `NPM_TOKEN`: NPM automation token for publishing
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

### Workflows

1. **release.yml**: Production releases from `main` branch
2. **release-alpha.yml**: Pre-release versions from development branches

## Best Practices

1. **Always use changesets** for changes that affect the public API
2. **Write clear changeset messages** that explain the change to users
3. **Use conventional commits** for better changelog generation
4. **Test alpha versions** before promoting to production
5. **Follow SemVer strictly** to avoid breaking consumer applications

## Version Lifecycle Example

1. Feature development on `feature/new-button` branch
2. Add changeset with `pnpm changeset`
3. PR to `dev` branch → Alpha version published automatically
4. Testing in alpha: `npm install @wallarm-org/design-system@alpha`
5. PR to `main` branch → Version PR created
6. Merge version PR → Production release published
7. Users update: `npm install @wallarm-org/design-system@latest`

## Troubleshooting

### No Version Bump

If changes don't trigger a version bump:

- Ensure a changeset was added
- Check `.changeset/config.json` configuration
- Verify the package isn't in the `ignore` list

### Publishing Failures

If publishing fails:

- Verify NPM_TOKEN is valid
- Check npm registry status
- Ensure package.json has correct `publishConfig`
- Review GitHub Actions logs for detailed errors

## Additional Resources

- [Changesets Documentation](https://github.com/changesets/changesets)
- [Semantic Versioning Spec](https://semver.org/)
- [NPM Publishing Docs](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
