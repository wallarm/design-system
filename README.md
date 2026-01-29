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

# Start Playground application (optional, not included in CI/CD)
pnpm web:dev
```

### Build

```bash
# Build all packages and applications
pnpm build

# Build specific package
pnpm build --filter=@wallarm/design-system
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

- `@wallarm/playground` - Playground application for testing and demonstrating components (Rsbuild + React + TypeScript)

**Packages:**

- `@wallarm/design-system` - Core design system library with React components and Storybook documentation
- `@wallarm/eslint-config` - Shared ESLint configurations
- `@wallarm/typescript-config` - Shared TypeScript configurations
- `@wallarm/playwright-config` - Shared Playwright test configurations
- `@wallarm/vitest-config` - Shared Vitest test configurations
- `@wallarm/rsbuild-config` - Shared Rsbuild bundler configurations
- `@wallarm/tailwind-config` - Shared Tailwind CSS configurations

## 🛠 Tech Stack

### Frontend

- **React 19** - UI library
- **TypeScript** - Type safety with strict mode
- **Rsbuild** - Modern build tool based on Rspack
- **Tailwind CSS v4** - Utility-first CSS framework
- **Ark UI** - Headless component primitives
- **Radix UI** - Accessible component primitives

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
- **Docker** - Containerization with multi-stage builds
- **Docker Compose** - Local development environment
- **GitHub Container Registry** - Docker image storage
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
/ui component Card    # UI component
/web feature auth     # Web feature
/test e2e checkout    # E2E tests
/ci workflow deploy   # CI/CD workflow
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
pnpm web:dev          # Playground application (not in CI/CD)
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
pnpm commit           # Create a conventional commit (interactive)
pnpm changeset        # Create a changeset for version bump
pnpm version          # Update package versions
pnpm release          # Publish packages to NPM (CI only)
```

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

1. **PR Title Check** - Validates PR titles follow conventional commits
2. **Setup & Dependencies** - Node.js setup, dependency caching, screenshot update detection
3. **Quality Checks** - Parallel execution of lint, typecheck, and unit tests
4. **Build** - Docker image building for Storybook
5. **E2E Tests** - Cross-browser testing (Chromium) for Storybook components
6. **Screenshot Updates** - Automated screenshot updates on main branch with `[update-screenshots]` commit flag
7. **Deploy** - Production deployment:
   - **deploy-storybook** - Deploys Storybook documentation to GitHub Pages

### Features

- **Parallel Execution** - Quality checks and E2E tests run in parallel
- **Sharded Testing** - E2E tests split into 3 shards for faster execution
- **Smart Caching** - Dependencies cached across all workflow runs
- **Docker Integration** - Storybook runs in container for consistent E2E testing
- **Auto Screenshot Updates** - Commit with `[update-screenshots]` to update visual snapshots
- **E2E Skip Trigger** - Commit with `[skip-e2e]` to skip E2E tests when needed
- **E2E Optimization** - Skips E2E tests for bot screenshot commits
- **Container Registry**:
  - Build stage: `ghcr.io/wallarm/design-system`
  - Storybook Documentation: GitHub Pages at `https://wallarm.github.io/wallarm-design-system/`

### Environment

- **Node.js**: v24+
- **pnpm**: v10.22.0
- **Playwright**: v1.58.0

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

## 📄 License

MIT License - see [LICENSE](./LICENSE) file.
