# Wallarm Design System

A comprehensive design system and component library built with React, TypeScript, and modern web technologies. This monorepo includes a UI component library with Storybook documentation and a playground application for testing and demonstration.

## 🚀 Quick Start

### Install Dependencies

```bash
pnpm install
```

### Development

```bash
# Start all applications
pnpm dev

# Start Storybook
pnpm storybook

# Start Design System dev server
pnpm design-system:dev
```

### Build

```bash
# Build all packages and applications
pnpm build

# Build specific package
pnpm build --filter=@wallarm-org/design-system
```

### Testing

```bash
# Run all tests
pnpm test

# E2E testing
pnpm e2e

# E2E testing special component
pnpm e2e -- packages/design-system/src/components/Example/Example.e2e.ts

# E2E in Docker (cross-platform)
pnpm e2e:docker

# E2E in Docker special component
pnpm e2e:docker -- packages/design-system/src/components/Example/Example.e2e.ts

# E2E in Docker update screenshots
pnpm e2e:docker:update

# E2E in Docker update screenshots for special component
pnpm e2e:docker:update -- packages/design-system/src/components/Example/Example.e2e.ts
```

## 📁 Project Structure

```
wallarm-design-system/
├── apps/
│   └── playground/          # Playground application (Rsbuild + React)
├── packages/
│   ├── design-system/       # Core design system library
│   └── configs/             # Shared configurations
│       ├── eslint-config/   # ESLint configuration
│       ├── playwright-config/ # Playwright test configuration
│       ├── rsbuild-config/  # Rsbuild bundler configuration
│       ├── tailwind-config/ # Tailwind CSS configuration
│       ├── typescript-config/ # TypeScript configuration
│       └── vitest-config/   # Vitest test configuration
├── .github/                 # GitHub configuration
│   ├── workflows/           # CI/CD pipelines
│   └── PULL_REQUEST_TEMPLATE.md
├── scripts/                 # Build and automation scripts
└── .claude/                 # AI agents and automation
```

### Applications and Packages

**Apps:**

- `@wallarm-org/playground` - Playground application for testing and demonstrating components (Rsbuild + React + TypeScript)

**Packages:**

- `@wallarm-org/design-system` - Core design system library with React components and Storybook documentation
- `@wallarm-org/eslint-config` - Shared ESLint configurations
- `@wallarm-org/typescript-config` - Shared TypeScript configurations
- `@wallarm-org/playwright-config` - Shared Playwright test configurations
- `@wallarm-org/vitest-config` - Shared Vitest test configurations
- `@wallarm-org/rsbuild-config` - Shared Rsbuild bundler configurations
- `@wallarm-org/tailwind-config` - Shared Tailwind CSS configurations

## 🛠 Tech Stack

### Frontend

- **React 19** - UI library
- **TypeScript** - Type safety with strict mode
- **Rsbuild** - Modern build tool based on Rspack
- **Tailwind CSS v4** - Utility-first CSS framework
- **Ark UI** - Headless component primitives
- **DnD Kit** for drag and drop behavior
- **TanStack Table** for table layouts
- **TanStack Virtual** for virtualization

### Development

- **Turborepo** - High-performance monorepo build system
- **pnpm** - Fast, disk space efficient package manager
- **Storybook v10** - Component documentation and development
- **Vitest** - Fast unit testing framework
- **Playwright** - Cross-browser E2E testing
- **ESLint + Prettier** - Code quality and formatting
- **Husky** - Git hooks for code quality
- **Figma Code Connect** - Design-to-code synchronization

### CI/CD

- **GitHub Actions** - Automated CI/CD pipelines
- **Docker** - Multi-stage `Dockerfile`s for manual/local builds and Docker Compose dev setup (not built or published by CI)
- **Docker Compose** - Local development environment
- **GitHub Pages** - Static hosting for Storybook documentation

## 🤖 AI Automation

The project features an advanced AI agent system for development automation:

### Commands

```bash
# Update screenshots via commit
git commit -m "fix: button styles [update-screenshots]"

# Skip E2E tests via commit
git commit -m "docs: update readme [skip-e2e]"

# AI assistants available via triggers:
/design-system component Card    # Design System component
/test e2e checkout               # E2E tests
/ci workflow deploy              # CI/CD workflow
```

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - AI assistant instructions
- **[AGENTS.md](./AGENTS.md)** - Agent system and routing
- **[.claude/agents/](./.claude/agents/)** - Specialized AI agents
- **[CI_PLAN.md](./CI_PLAN.md)** - CI/CD infrastructure plan
- **[VERSIONING.md](./VERSIONING.md)** - Versioning strategy and release process

## 🔧 Useful Commands

### Development

```bash
pnpm dev              # Start all applications
pnpm storybook        # Design system Storybook
pnpm design-system:dev # Design system dev server
```

### Testing

```bash
pnpm test             # Unit tests
pnpm test:coverage    # With coverage
pnpm e2e              # E2E locally
pnpm e2e:docker       # E2E in Docker
pnpm e2e:ui           # E2E with UI
```

### Build

```bash
pnpm build            # Build all packages
pnpm build:configs    # Build configuration packages
pnpm storybook        # Run Storybook development server
```

### Code Quality

```bash
pnpm lint             # ESLint check
pnpm lint:fix         # ESLint auto-fix
pnpm format           # Prettier formatting
pnpm typecheck        # TypeScript type checking
```

### Versioning & Release

```bash
pnpm commit                    # Create a conventional commit (interactive)
pnpm semantic-release          # Publish packages to NPM (CI only)
pnpm semantic-release:dry-run  # Preview the next release without publishing
```

Versions are determined automatically from Conventional Commits by
[semantic-release](https://semantic-release.gitbook.io/) — there is no manual
version-bump or changeset step. See [RELEASE.md](./RELEASE.md) for the full
branch strategy (RC versions on `feature/*`/`fix/*`, production releases on
`main`).

## 🐳 Docker

### Local Development

```bash
# E2E tests in Docker
pnpm e2e:docker

# Screenshot updates
pnpm e2e:docker:update
```

### Production

```bash
# Using docker-compose for local development
docker-compose -f docker-compose.local.yml up

# Build individual images
docker build -f packages/design-system/Dockerfile -t wallarm-design-system .
docker build -f apps/playground/Dockerfile -t wallarm-playground .
```

## 🚦 CI/CD Pipeline

Comprehensive GitHub Actions pipeline with multiple stages:

### Pipeline Jobs

`check-pr-title` runs in a separate workflow ([`pr-title.yml`](./.github/workflows/pr-title.yml)), triggered on pull request open/edit. Everything else runs in [`main.yml`](./.github/workflows/main.yml), triggered on push to any branch:

1. **setup** - Node.js/pnpm setup, dependency caching, screenshot update detection
2. **quality** - Parallel lint, typecheck, and unit tests
3. **build** - Builds all packages and Storybook static output, uploads as GitHub Actions artifacts (no Docker image is built or pushed)
4. **e2e** - Cross-browser testing (Chromium), sharded 3-way, run inside the public `mcr.microsoft.com/playwright` container
5. **unit-test-report** / **e2e-report** - Publish JUnit test results
6. **e2e-update-screenshots** - Sharded visual baseline regeneration, triggered by `[update-screenshots]` or manual dispatch
7. **commit-screenshots** - Commits updated screenshots back to the branch
8. **deploy-storybook** - Deploys the Storybook static artifact to GitHub Pages
9. **release** - Runs `semantic-release` for `@wallarm-org/design-system` and (conditionally) `@wallarm-org/mcp`, publishing to npm

### Features

- **Parallel Execution** - Quality checks and E2E tests run in parallel
- **Sharded Testing** - E2E tests split into 3 shards for faster execution
- **Smart Caching** - Dependencies cached across all workflow runs
- **Auto Screenshot Updates** - Commit with `[update-screenshots]` to update visual snapshots
- **E2E Skip Trigger** - Commit with `[skip-e2e]` to skip E2E tests when needed
- **E2E Optimization** - Skips E2E tests for bot screenshot commits
- **Deployment**: Storybook documentation published to GitHub Pages at `https://wallarm.github.io/wallarm-design-system/`. There is no Docker image build/push step in CI today — the `Dockerfile`s under `packages/design-system/` and `apps/playground/` are for manual/local use only (see [🐳 Docker](#-docker) below).

### Environment

- **Node.js**: v24+
- **pnpm**: v10.33.2
- **Playwright**: v1.61.1

## 🤝 Contributing

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Create feature branch: `git checkout -b feature/amazing-feature`
4. Follow code conventions (ESLint + Prettier)
5. Add tests for new functionality
6. Create Pull Request

### Commit Conventions

```bash
feat: add new feature
fix: fix bug
docs: update documentation
test: add tests
refactor: refactor code
```
