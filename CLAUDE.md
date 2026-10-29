# CLAUDE.md - AI Assistant Instructions for Wallarm Monorepo

## 🎯 Project Overview

You are an expert AI assistant for the Wallarm monorepo project. This is a modern TypeScript monorepo using Turborepo, pnpm workspaces, and React, built with Rslib/Rsbuild (Rspack-based — not Vite), with unit tests on Rstest (also Rspack-based). The project consists of a UI component library and a web application with comprehensive testing and CI/CD pipelines.

**For detailed information about the project structure and commands, see [README.md](./README.md)**.

## 🏗️ Architecture & Tech Stack

- **Framework**: React 19+ with TypeScript
- **Build Tool**: Rslib
- **React Compiler**: enabled everywhere (library build, Storybook, playground, Rstest) via Rspack's native SWC compiler — `pluginReact({ reactCompiler: true })` in `packages/configs/rsbuild-config` and `packages/design-system/rslib.config.ts`, plus `tools.swc` in `packages/configs/rstest-config/src/react.ts`. Published output imports `react/compiler-runtime` (React 19 peer). Audit bailouts with `pnpm --filter @wallarm-org/design-system compiler:audit`
- **Styling**: Tailwind CSS
- **Testing**: Rstest (unit), Playwright (E2E)
- **Documentation**: Storybook 10+
- **Package Manager**: pnpm 10.33.2
- **Monorepo Tool**: Turborepo
- **CI/CD**: GitHub Actions with sharded testing
- **Containerization**: Docker with multi-stage builds — for manual/local use only (`packages/design-system/Dockerfile`, `apps/playground/Dockerfile`, `docker-compose.local.yml`); CI never builds or pushes these images
- **Deployment**: after each stable release, `deploy-site.yml` builds the docs site and Storybook from the release tag and deploys both to GitHub Pages (docs at `/design-system/`, Storybook at `/design-system/storybook/`) — there is no container registry in the pipeline

## 📋 Development Guidelines

### Testing Strategy

1. **Unit Tests**: Required for all logic and utilities
2. **Component Tests**: Required for all UI components
3. **E2E Tests**: Required for critical user flows
4. **Visual Tests**: Screenshot tests for UI components

### Commit Conventions

This project **enforces** [Conventional Commits](https://www.conventionalcommits.org/):

**Required format**: `type(scope): subject`

**Commit types**:

- `feat:` New features (triggers minor version bump)
- `fix:` Bug fixes (triggers patch version bump)
- `docs:` Documentation changes
- `style:` Code style changes (formatting, missing semicolons, etc.)
- `refactor:` Code refactoring (no feature change)
- `perf:` Performance improvements
- `test:` Test updates
- `build:` Build system or dependency changes
- `ci:` CI/CD changes
- `chore:` Maintenance tasks
- `revert:` Reverts a previous commit

**Breaking changes**: Add `!` after type (`feat!:`) or include `BREAKING CHANGE:` in body (triggers major version bump)

**Breaking changes must ship a migration** in `packages/migrator/src/migrations/` — write it with `/new-migration` (enforced by the `require-migration` job in `pr-title.yml`). Changes that need nothing from consumers still ship a report-only migration.

**Interactive commits**: Use `pnpm commit` for guided commit creation

**Validation**: All commits are validated by commitlint. Invalid commits will be rejected.

Special triggers:

- `[update-screenshots]` - Regenerates visual baselines in CI and commits them back to the branch (works on any branch)
- `[skip-e2e]` - Skips E2E tests execution when included in commit message

## 🤖 Agent System

> `AGENTS.md` is a symlink to this file — edit `CLAUDE.md` only.

For complex domain-specific tasks, use the specialized agents defined in [`.claude/agents/`](./.claude/agents/):

| Agent | Use for | File |
|-------|---------|------|
| `component-architect` | Designing a new compound component: API, sub-component tree, context, primitives, a11y model | [`component-architect.md`](./.claude/agents/component-architect.md) |
| `design-system` | Creating/modifying components, variants, Storybook stories, Tailwind/CVA styling, tokens | [`design-system.md`](./.claude/agents/design-system.md) |
| `test` | Rstest unit/component tests and Playwright E2E (visual, interaction, a11y) per `docs/e2e-test-rules.md` | [`test.md`](./.claude/agents/test.md) |
| `ci` | GitHub Actions failures, build/test time, semantic-release, sharded E2E, deployment | [`ci.md`](./.claude/agents/ci.md) |

New compound component workflow: `component-architect` → `design-system` → `test`.

### Skills (Slash Commands)

| Command | Description |
|---------|-------------|
| `/new-component` | Scaffold a new design system component |
| `/review-pr` | Review a pull request for quality and compliance |
| `/new-migration` | Write the `@wallarm-org/migrator` migration for a breaking change |
| `/metrics-audit` | Audit a component against the analytics-readiness contract |
| `/storybook-docs` | Write or level up a component's Storybook Overview page |
| `/claude-design-sync` | Build and manually sync the released design system to Claude Design |
| `/vestige-audit` | Remove docs/configs/scripts the branch made obsolete — required before `gh pr create` (enforced by a hook in `.claude/settings.json`) |

## 🔧 Key Configuration Files

- `turbo.json` - Turborepo pipeline configuration
- `pnpm-workspace.yaml` - Workspace packages
- `.github/workflows/main.yml` - Main CI/CD pipeline
- `.github/pr-title-checker-config.json` - PR title validation config
- `docker-compose.local.yml` - Local Docker setup
- `packages/design-system/Dockerfile`, `apps/playground/Dockerfile` - Docker images for manual/local use (not built by CI)
- `.mcp.json` - MCP server configuration

### Environment Variables

- Never commit `.env` files
- Use GitHub Secrets for CI/CD
- Document all required variables

### CI/CD Environment

- **Node.js**: v24
- **pnpm**: v10.33.2
- **Playwright**: v1.63.0-noble
- **Runners**: Ubuntu latest

## 🎯 Best Practices

### Performance

1. Use code splitting and lazy loading
2. Optimize bundle sizes
3. Implement proper caching strategies
4. Virtualize long lists
5. Don't hand-memoize (`React.memo`, `useMemo`, `useCallback`) — React Compiler does it

### Security

1. Never expose secrets or API keys
2. Validate all user inputs
3. Use HTTPS everywhere
4. Implement CSP headers
5. Regular dependency updates

### Accessibility

1. Semantic HTML elements
2. ARIA labels where needed
3. Keyboard navigation support
4. Screen reader compatibility
5. Color contrast compliance

## 📚 Documentation

### Required Documentation

1. **Component Documentation**: Props, usage examples in Storybook
2. **API Documentation**: Endpoint descriptions, request/response formats
3. **Test Documentation**: Test scenarios and coverage goals
4. **Deployment Documentation**: Environment setup, secrets management

## 🚨 Important Rules

### Never Do

1. ❌ Modify `.env` files directly
2. ❌ Commit secrets or credentials
3. ❌ Use `any` type in TypeScript
4. ❌ Skip tests before committing
5. ❌ Force push to main branch
6. ❌ Delete files without confirmation
7. ❌ Overwrite syntax highlight token mappings (`--color-syntax-*`) in `semantic.css` to match Figma — these are code-managed, not Figma-sourced. The underlying palette hex values (e.g. `--color-blue-700`) may be updated from Figma, but the semantic mapping (e.g. `keyword → blue-700`) must not change without explicit developer approval

### Always Do

1. ✅ Run tests before committing
2. ✅ Follow TypeScript strict mode
3. ✅ Use conventional commits (required for PR titles)
4. ✅ Update documentation with code changes
5. ✅ Review CI/CD status before merging (all checks must pass)
6. ✅ Use TodoWrite for task tracking
7. ✅ Wait for the E2E job's Storybook readiness check (an HTTP polling loop, not a Docker `services:` health check) before assuming the container is ready
8. ✅ Run quality checks (lint, typecheck, test) in parallel

## 📚 Documentation References

- **[README.md](./README.md)** - Project overview and quick start
- **[.github/workflows/main.yml](./.github/workflows/main.yml)** - CI/CD pipeline implementation

## 🚦 CI/CD Pipeline

### Pipeline Jobs

`check-pr-title` (Conventional Commits) and `require-migration` (a `!` title or `BREAKING CHANGE:` body must add a file under `packages/migrator/src/migrations/`) live in a **separate** workflow ([`pr-title.yml`](./.github/workflows/pr-title.yml), triggered on `pull_request`). The GitHub Pages deploy is a third workflow, [`deploy-site.yml`](./.github/workflows/deploy-site.yml), dispatched by `release` (see item 8). Everything else is a job inside [`main.yml`](./.github/workflows/main.yml), triggered on `push` to any branch (plus manual `workflow_dispatch`):

1. **setup** - Detects triggers only (no install): `[update-screenshots]`, `[skip-e2e]` / no `E2E_PATHS` change (branch vs `main` merge-base, or `HEAD~1` on `main`), whether to release MCP, and the Playwright container tag
2. **quality** - Lint (Biome), typecheck and Rstest unit tests (3 shards) in parallel
3. **build** - Builds all packages except `@wallarm-org/docs` (`--filter='!@wallarm-org/docs'`) and the Storybook static site as GitHub Actions artifacts (`built-packages`, `storybook-static`) — no Docker image is built or pushed
4. **e2e** - 4 shards inside the public `mcr.microsoft.com/playwright` container; Storybook is served by `http-server` and a `curl` loop waits up to 60s for `/design-system/storybook/iframe.html`
5. **unit-test-report** / **e2e-report** - Publish JUnit results
6. **e2e-update-screenshots** - On any branch whose head commit has `[update-screenshots]` (sharded); `workflow_dispatch` never updates screenshots
7. **commit-screenshots** - Commits the new baselines back to the branch (on `main` via `DEPLOY_KEY`); the bot commit then gets a full verification `e2e` run
8. **deploy-site.yml** (separate workflow) - After a stable design-system release on `main`, `release` dispatches it with the `vX.Y.Z` tag; it builds the docs site and Storybook from that tag and deploys both to GitHub Pages (docs: https://wallarm.github.io/design-system/, Storybook: https://wallarm.github.io/design-system/storybook/). Redeploy or roll back with `gh workflow run deploy-site.yml --ref main -f tag=vX.Y.Z`
9. **release** - `semantic-release` for `@wallarm-org/design-system`, and when needed `@wallarm-org/mcp` / `@wallarm-org/migrator` — stable on `main`, RC on `feature/*` / `feat/*` / `fix/*` (see [RELEASE.md](./RELEASE.md))
10. **publish-code-connect** - In parallel with `release`, on `main` only when a stable release is due: publishes Figma Code Connect templates (`pnpm code-connect:publish`, needs `FIGMA_ACCESS_TOKEN`)

Secrets and branch rules: [RELEASE.md → Requirements](./RELEASE.md#requirements).

### Commit triggers

- `[update-screenshots]` in the head commit message regenerates baselines and commits them back to the branch.
- `[skip-e2e]` in the commit message skips E2E. E2E is also skipped automatically when no path in `E2E_PATHS` (`main.yml`) changed.

## 🎉 Success Criteria

You are successful when:

1. Code quality is maintained or improved
2. All CI/CD checks pass (PR title, quality, build, E2E)
3. Documentation is up-to-date
4. User requirements are met accurately
5. Best practices are followed consistently
6. Docs site and Storybook successfully built and deployed to GitHub Pages
