# CLAUDE.md - AI Assistant Instructions for Wallarm Monorepo

## 🎯 Project Overview

You are an expert AI assistant for the Wallarm monorepo project. This is a modern TypeScript monorepo using Turborepo, pnpm workspaces, React, and Vite. The project consists of a UI component library and a web application with comprehensive testing and CI/CD pipelines.

**For detailed information about the project structure and commands, see [README.md](./README.md)**.

## 🏗️ Architecture & Tech Stack

- **Framework**: React 19+ with TypeScript
- **Build Tool**: Rslib
- **Styling**: Tailwind CSS
- **Testing**: Vitest (unit), Playwright (E2E)
- **Documentation**: Storybook 10+
- **Package Manager**: pnpm 10.29.3
- **Monorepo Tool**: Turborepo
- **CI/CD**: GitHub Actions with sharded testing
- **Containerization**: Docker with multi-stage builds
- **Registry**: GitHub Container Registry (ghcr.io) for Storybook, GitHub Pages for deployment

## 📋 Development Guidelines

### Testing Strategy

1. **Unit Tests**: Required for all logic and utilities
2. **Component Tests**: Required for all UI components
3. **E2E Tests**: Required for critical user flows
4. **Visual Tests**: Screenshot tests for UI components
5. **Coverage**: Maintain >80% code coverage

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

**Interactive commits**: Use `pnpm commit` for guided commit creation

**Validation**: All commits are validated by commitlint. Invalid commits will be rejected.

Special triggers:

- `[update-screenshots]` - Triggers automatic screenshot updates in CI/CD pipeline on main branch
- `[skip-e2e]` - Skips E2E tests execution when included in commit message

## 🤖 Agent System

For complex domain-specific tasks, use specialized agents through routing in [AGENTS.md](./AGENTS.md):

- **Design System Agent** (`/design-system`) - Component development, Storybook
- **Test Agent** (`/test`) - Testing strategies, coverage
- **CI/CD Agent** (`/ci`) - Pipeline optimization, deployment

**Detailed agent instructions are in [.claude/agents/](./.claude/agents/) directory.**

## 🔧 Key Configuration Files

- `turbo.json` - Turborepo pipeline configuration
- `pnpm-workspace.yaml` - Workspace packages
- `.github/workflows/main.yml` - Main CI/CD pipeline
- `.github/pr-title-checker-config.json` - PR title validation config
- `docker-compose.local.yml` - Local Docker setup
- `packages/*/Dockerfile` - Service Docker configurations
- `mcp.json` - MCP agent configuration

### Environment Variables

- Never commit `.env` files
- Use GitHub Secrets for CI/CD
- Document all required variables

### CI/CD Environment

- **Node.js**: v24
- **pnpm**: v10.22.0
- **Playwright**: v1.58.0-noble
- **Runners**: Ubuntu latest
- **Container Registry**: ghcr.io/wallarm/

## 🎯 Best Practices

### Performance

1. Use code splitting and lazy loading
2. Optimize bundle sizes
3. Implement proper caching strategies
4. Use React.memo for expensive components
5. Virtualize long lists

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

### Always Do

1. ✅ Run tests before committing
2. ✅ Follow TypeScript strict mode
3. ✅ Use conventional commits (required for PR titles)
4. ✅ Update documentation with code changes
5. ✅ Review CI/CD status before merging (all checks must pass)
6. ✅ Use TodoWrite for task tracking
7. ✅ Wait for Docker health checks in CI/CD
8. ✅ Run quality checks (lint, typecheck, test) in parallel

## 📈 Performance & Quality Goals

### Performance Metrics

- Bundle size < 200KB gzipped
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Test execution < 5 minutes
- CI/CD pipeline < 10 minutes

### Code Quality Metrics

- TypeScript coverage: 100%
- Test coverage: >80%
- Zero ESLint errors
- Zero TypeScript errors
- Accessibility score: >90

## 📚 Documentation References

- **[README.md](./README.md)** - Project overview and quick start
- **[CI_PLAN.md](./CI_PLAN.md)** - CI/CD pipeline documentation
- **[.github/workflows/main.yml](./.github/workflows/main.yml)** - CI/CD pipeline implementation

## 🚦 CI/CD Pipeline Structure

### Pipeline Jobs

1. **check-pr-title** - Validates PR titles follow conventional commits
2. **setup** - Manages dependencies, caching, and screenshot update detection
3. **quality** - Parallel lint, typecheck, and unit test execution
4. **build** - Docker image building for Storybook and pushing to ghcr.io
5. **e2e** - Sharded testing (3 shards) for Storybook components
6. **e2e-update-screenshots** - Auto-updates visual snapshots on main branch
7. **deploy-storybook** - Production deployment to GitHub Pages

### CI/CD Features

- **Sharded Testing**: 3 parallel E2E test shards for faster execution
- **Smart Caching**: Dependencies cached with `pnpm-lock.yaml` hash
- **Docker Integration**: Storybook runs in container for consistent E2E tests
- **Health Checks**: Proper service readiness verification
- **Artifact Upload**: Test results and reports preserved
- **Concurrency Control**: Cancel in-progress runs on new pushes
- **E2E Skip Optimization**: Skips E2E for bot screenshot commits
- **E2E Skip Trigger**: Manual E2E skip with `[skip-e2e]` commit message trigger
- **GitHub Pages Deployment**: Automatic Storybook deployment on main branch

## 🎉 Success Criteria

You are successful when:

1. Code quality is maintained or improved
2. All CI/CD checks pass (PR title, quality, build, E2E)
3. Documentation is up-to-date
4. CI/CD pipelines complete within 10 minutes
5. User requirements are met accurately
6. Best practices are followed consistently
7. Docker image successfully built and Storybook deployed to GitHub Pages
