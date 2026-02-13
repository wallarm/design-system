# Release Process

## Overview

The release process is fully automated and runs after successful CI/CD pipeline completion.

## Release Types

### Stable Releases (main branch)

- Automatic on push to `main` branch after E2E tests pass
- **Automatic version bumping** based on conventional commits:
  - `feat:` commits → minor version bump
  - `fix:` commits → patch version bump
  - `feat!:` or `BREAKING CHANGE:` → major version bump
  - If no changesets: auto-generates changeset from commit messages
- Creates Release PR with changesets (if manual changesets exist)
- Direct publish if no manual changesets (uses auto-generated changeset)
- Publishes to npm with `latest` tag

### Prereleases (dev branches)

- **dev branch**: Publishes with `dev` tag
- **alpha/\* branches**: Publishes with `alpha` tag
- **beta/\* branches**: Publishes with `beta` tag
- **rc/\* branches**: Publishes with `rc` tag
- Version format: `x.y.z-{type}-{commit-sha}`

## Workflow

### Automatic Releases

1. **Trigger**: Automatic on push after E2E tests pass
2. **Execution**: Runs in parallel with Storybook deployment (main branch only)
3. **Process**: Uses Changesets for stable releases, snapshot versions for prereleases

### Manual Releases

1. Go to Actions tab in GitHub repository
2. Select "CI/CD Pipeline" workflow
3. Click "Run workflow"
4. Choose:
   - **Branch**: Select which branch to release from
   - **Release type**:
     - `skip` - Run CI/CD without releasing
     - `stable` - Create stable release (Release PR or publish)
     - `prerelease` - Create prerelease with specific tag
   - **Prerelease tag**: (only for prerelease) dev/alpha/beta/rc
5. Click "Run workflow"

## Prerequisites

### Required GitHub Secret

**NPM_TOKEN**: Required for publishing packages to npm registry

To configure:

1. Go to Settings → Secrets and variables → Actions in your GitHub repository
2. Add a new secret named `NPM_TOKEN`
3. Set the value to your npm authentication token with publish permissions

## How It Works

### Stable Release Flow (main branch)

1. **Option A - Manual changesets** (for controlled version bumps):

   ```bash
   pnpm changeset
   ```

   - Developers create changesets during development
   - Changesets creates a Release PR with specified versions
   - After merging Release PR, packages are published

2. **Option B - Automatic versioning** (default behavior):
   - No changesets needed!
   - CI analyzes commit messages since last release
   - Auto-generates changeset based on conventional commits
   - Directly publishes with appropriate version bump

3. When PR is merged to main:
   - CI/CD runs quality checks, builds, and E2E tests
   - After successful E2E, release job runs automatically
   - If changesets exist: Creates/updates Release PR
   - If no changesets: Auto-generates and publishes immediately

4. Manual trigger option:
   - Can be triggered from any branch via GitHub Actions UI
   - Select "stable" release type
   - Same auto-versioning logic applies

### Prerelease Flow (dev branches)

1. Automatic on push to dev/alpha/beta/rc branch:
   - CI/CD runs quality checks, builds, and E2E tests
   - Automatically publishes snapshot version with appropriate tag
   - No Release PR needed - direct publish

2. Manual trigger option:
   - Can be triggered from any branch via GitHub Actions UI
   - Select "prerelease" type and choose tag (dev/alpha/beta/rc)
   - Publishes snapshot version immediately

### Release Job Behavior

**Stable (main branch)**:

- **With manual changesets**: Creates/updates a "Release" PR with version bumps
- **Without changesets**:
  - Analyzes commits for version bump type
  - Auto-generates changeset
  - Publishes immediately
- **After merging Release PR**: Publishes packages to npm with `latest` tag
- **Creates GitHub releases**: Documents each release with changelog

**Prereleases (dev branches)**:

- Automatically generates snapshot version
- Publishes immediately with branch-specific tag
- No git tags or GitHub releases created

### Version Bump Logic (Auto Mode)

When no changesets are present, versions are bumped based on commit messages:

| Commit Type                    | Version Bump  | Example           |
| ------------------------------ | ------------- | ----------------- |
| `feat!:` or `BREAKING CHANGE:` | Major (x.0.0) | `1.2.3` → `2.0.0` |
| `feat:`                        | Minor (x.Y.0) | `1.2.3` → `1.3.0` |
| `fix:`                         | Patch (x.y.Z) | `1.2.3` → `1.2.4` |
| Other conventional commits     | Patch         | `1.2.3` → `1.2.4` |

### Manual Commands (Local Development)

```bash
# Add a changeset
pnpm changeset

# Version packages locally (don't commit)
pnpm version

# Build and publish stable release (CI does this automatically)
pnpm release

# Create and publish alpha version locally
pnpm version:alpha
pnpm release:alpha
```

### Installing Prerelease Versions

```bash
# Install latest stable
npm install @wallarm-org/design-system

# Install dev prerelease
npm install @wallarm-org/design-system@dev

# Install alpha prerelease
npm install @wallarm-org/design-system@alpha

# Install beta prerelease
npm install @wallarm-org/design-system@beta

# Install rc prerelease
npm install @wallarm-org/design-system@rc
```

## Package Configuration

The release process is configured in:

- `.changeset/config.json` - Changesets configuration
- `package.json` - Release scripts
- `.github/workflows/main.yml` - CI/CD pipeline

## Excluded from Release

The following packages are not published:

- `@wallarm-org/playground` - Internal testing application

## Troubleshooting

### Release job fails with authentication error

- Ensure `NPM_TOKEN` secret is configured in GitHub repository
- Verify token has publish permissions for the packages

### No release created after merge

- Check if changesets were added to the PR
- Verify the Release PR was merged (not just code changes)

### Package not published

- Check if package is listed in `.changeset/config.json` ignore list
- Ensure package.json has `"private": false` or no private field
