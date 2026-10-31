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
```

### Claude Code and Codex

Both clients share `CLAUDE.md`, `.claude/skills`, specialist roles and hooks.
`AGENTS.md` files are relative links to the corresponding `CLAUDE.md`.
`pnpm install` generates `.codex/config.toml` from the canonical `.mcp.json`;
run `pnpm agents:sync` after changing MCP servers, then restart Codex.
Run `pnpm test:harness` to check the adapter and shared PR hook.
See [agent harness](docs/agent-harness.md) for configuration, hook trust and Figma access.

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
design-system/
├── apps/
│   └── playground/          # Playground application (Rsbuild + React)
├── packages/
│   ├── design-system/       # Core design system library
│   ├── mcp/                 # MCP server for AI assistants
│   ├── mcp-core/            # Shared MCP metadata types and schemas
│   ├── migrator/            # Migration CLI for consumer upgrades
│   └── configs/             # Shared configurations
│       ├── biome-config/    # Biome lint/format configuration
│       ├── playwright-config/ # Playwright test configuration
│       ├── publishing/      # Shared semantic-release configuration
│       ├── rsbuild-config/  # Rsbuild bundler configuration
│       ├── tailwind-config/ # Tailwind CSS configuration
│       ├── typescript-config/ # TypeScript configuration
│       └── rstest-config/   # Rstest test configuration
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
- `@wallarm-org/mcp` - MCP server that gives AI assistants component metadata, props, variants, and design tokens
- `@wallarm-org/mcp-core` - Shared types and Zod schemas for MCP metadata (bundled into `@wallarm-org/mcp`, not published)
- `@wallarm-org/migrator` - Codemod CLI that migrates consumer apps across design-system breaking changes
- `@wallarm-org/biome-config` - Shared Biome lint/format configuration
- `@wallarm-org/publish-scripts` - Shared semantic-release configuration
- `@wallarm-org/typescript-config` - Shared TypeScript configurations
- `@wallarm-org/playwright-config` - Shared Playwright test configurations
- `@wallarm-org/rstest-config` - Shared Rstest test configurations
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
- **Rstest** - Rspack-based unit testing framework
- **Playwright** - Cross-browser E2E testing
- **Biome** - Linting and formatting
- **Husky** - Git hooks for code quality
- **Figma Code Connect** - Design-to-code synchronization

### CI/CD

- **GitHub Actions** - Automated CI/CD pipelines
- **Docker** - `Dockerfile`s and `docker-compose.local.yml` for manual/local use (not built or published by CI)
- **GitHub Pages** - Static hosting for the docs site and Storybook

## 🤖 AI Automation

Specialized agents and slash-command skills are described in [CLAUDE.md → Agent System](./CLAUDE.md#-agent-system).

### Commit triggers

```bash
# Update screenshots via commit
git commit -m "fix: button styles [update-screenshots]"

# Skip E2E tests via commit
git commit -m "docs: update readme [skip-e2e]"
```

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - AI assistant instructions and agent routing (`AGENTS.md` is a symlink to it)
- **[.claude/agents/](./.claude/agents/)** - Specialized AI agents
- **[RELEASE.md](./RELEASE.md)** - Release process (stable, RC, screenshots)
- **[VERSIONING.md](./VERSIONING.md)** - SemVer and commit format

## 🔧 Useful Commands

### Development

```bash
pnpm dev              # Start all applications
pnpm storybook        # Design system Storybook
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
pnpm lint             # Biome check
pnpm lint:fix         # Biome check --fix
pnpm format           # Biome format
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
branch strategy (RC versions on `feature/*`/`feat/*`/`fix/*`, production releases on
`main`).

## 🐳 Docker

### Local Development

Docker E2E runs against Storybook on the host (`host.docker.internal:6006`), so start `pnpm storybook` first.

```bash
# E2E tests in Docker
pnpm e2e:docker

# Screenshot updates
pnpm e2e:docker:update
```

### Docker images (manual, not used by CI)

`docker-compose.local.yml` services are all behind profiles and are started by the `e2e:docker` scripts above. The `Dockerfile`s are not maintained and are out of date with the workspace (e.g. they still copy the removed `eslint-config` package), so these builds currently fail:

```bash
# Build individual images
docker build -f packages/design-system/Dockerfile -t wallarm-design-system .
docker build -f apps/playground/Dockerfile -t wallarm-playground .
```

## 🚦 CI/CD Pipeline

GitHub Actions runs lint, typecheck, unit tests, build, and sharded E2E on every push; each stable release on `main` deploys the [docs site](https://wallarm.github.io/design-system/) and [Storybook](https://wallarm.github.io/design-system/storybook/) to GitHub Pages via `deploy-site.yml`. semantic-release publishes to npm (stable from `main`, RCs from `feature/*`/`feat/*`/`fix/*`). Jobs and triggers: [CLAUDE.md → Pipeline Jobs](./CLAUDE.md#pipeline-jobs); secrets: [RELEASE.md → Requirements](./RELEASE.md#requirements).

## 🤝 Contributing

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Create feature branch: `git checkout -b feature/amazing-feature`
4. Follow code conventions (Biome: `pnpm lint`)
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
