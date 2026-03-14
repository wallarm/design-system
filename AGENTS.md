# Agent System

This project uses specialized Claude Code agents for domain-specific tasks. Agents are defined in `.claude/agents/` and are automatically routed based on the task.

## Available Agents

### Design System Agent (`design-system`)

**Trigger:** Component creation, modification, styling, Storybook stories, design tokens.

**Capabilities:**
- Scaffold new components with proper file structure
- Add variants and sub-components
- Write Storybook stories
- Apply design tokens and Tailwind CSS styling
- Ensure accessibility compliance

**Agent file:** [`.claude/agents/design-system.md`](.claude/agents/design-system.md)

### Test Agent (`test`)

**Trigger:** Writing or updating unit tests, component tests, E2E tests.

**Capabilities:**
- Write Vitest unit and component tests
- Write Playwright E2E tests (visual, interaction, accessibility)
- Follow strict E2E naming conventions from `docs/e2e-test-rules.md`
- Screenshot testing with Docker

**Agent file:** [`.claude/agents/test.md`](.claude/agents/test.md)

### Component Architect (`component-architect`)

**Trigger:** Designing new compound components, planning component API, choosing composition patterns.

**Capabilities:**
- Analyze requirements and choose the right compound pattern
- Design sub-component tree, props interfaces, context shape
- Select appropriate Ark UI / Radix primitives
- Define accessibility model and keyboard interactions
- Produce a design specification for implementation

**Workflow:** `component-architect` → `design-system` → `test`
(Design first, then implement, then test)

**Agent file:** [`.claude/agents/component-architect.md`](.claude/agents/component-architect.md)

### CI/CD Agent (`ci`)

**Trigger:** Pipeline debugging, build optimization, deployment issues, Docker configuration.

**Capabilities:**
- Debug GitHub Actions workflow failures
- Optimize build and test times
- Manage Docker builds and health checks
- Configure semantic-release and deployment
- Handle sharded E2E testing

**Agent file:** [`.claude/agents/ci.md`](.claude/agents/ci.md)

## Skills (Slash Commands)

| Command | Description |
|---------|-------------|
| `/new-component` | Scaffold a new design system component |
| `/review-pr` | Review a pull request for quality and compliance |
| `/filter-field-design` | Filter System design reference |

## Ralph (Autonomous Agent Loop)

Ralph is a separate autonomous loop for multi-iteration PR completion. See [`scripts/ralph/`](scripts/ralph/) for details.

```bash
# Run with Claude Code
./scripts/ralph/ralph.sh --tool claude [max_iterations]
```
