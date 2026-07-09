# Release Process

> This file previously described a Changesets-based, manually-triggerable release
> flow (`pnpm changeset`, a `workflow_dispatch` "release type" input, dev/alpha/beta/rc
> branch tags, `.changeset/config.json`). None of that exists in this repo — it was
> never implemented, or was replaced without this doc being updated. The real process
> is documented once, at the monorepo root, to avoid this drifting again:

- **[../../../RELEASE.md](../../../RELEASE.md)** — full release workflow, branch strategy, RC versions, screenshot updates
- **[../../../VERSIONING.md](../../../VERSIONING.md)** — SemVer policy, Conventional Commits, commit-type-to-bump mapping
- **[../../../CI_PLAN.md](../../../CI_PLAN.md)** — the CI/CD pipeline that runs the release

## Quick summary (design-system specifics)

`@wallarm-org/design-system` is released by `semantic-release`, driven entirely by
Conventional Commits — there is no manual changeset or version-bump step:

- Push to a `feature/*` or `fix/*` branch → an RC version is published automatically,
  e.g. `1.0.0-rc.my-branch.1` under the npm dist-tag `rc-my-branch`
- Merge to `main` → the `release` job in `.github/workflows/main.yml` runs
  `semantic-release`, which determines the version bump from commit types and
  publishes to npm with the `latest` tag, plus a GitHub release

Required secret: `NPM_TOKEN` (see [RELEASE.md](../../../RELEASE.md) for setup).

`@wallarm-org/playground` (the app under `apps/playground`) is `"private": true` and
is never published.
