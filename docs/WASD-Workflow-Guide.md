# WASD LLM Excellence: Workflow Guide

## How to work with the repository and move the plan forward

**For:** Artem Miskevich, Head of Design & DS Manager
**Context:** Corporate GitHub account with access to `wallarm/design-system`

---

## Core Principle

All work is done through feature branches. One branch = one logical unit: one skill, one group of `.llm.md` files, one guideline. No massive PRs with 50 files. Small, clear, reviewable chunks.

90% of your work consists of **new files** (`.llm.md`, guidelines, skills, rules), not edits to existing code. This means virtually zero merge conflicts and the ability to run multiple branches in parallel.

---

## Daily Workflow

**Step 1 — Sync:**

```bash
git checkout main
git pull origin main
```

Always start from the latest `main`. If the frontend team merges component changes in the meantime, you want to be documenting their current state.

**Step 2 — Create a branch:**

```bash
git checkout -b feat/llm-button-alert-llm-md
```

Branch naming conventions:
- `feat/llm-*` — for new skills, agents, infrastructure
- `docs/llm-*` — for `.llm.md` files and guidelines
- `chore/llm-*` — for `.cursorrules`, `CLAUDE.md` updates, and other config

**Step 3 — Do the work:**

Create files, write content. Use whatever tool suits the task: Claude Code, Cowork, VS Code, Cursor.

**Step 4 — Commit:**

The repo has commitlint configured for conventional commits. Message format:

```bash
# Component documentation
git add packages/design-system/src/components/Button/Button.llm.md
git commit -m "docs: add Button .llm.md knowledge file"

# New skill
git add .claude/skills/describe-component/
git commit -m "feat: add /describe-component skill for .llm.md generation"

# Guideline
git add guidelines/ux-copywriting.md
git commit -m "docs: add UX copywriting guidelines"

# Configuration
git add .cursorrules
git commit -m "chore: add .cursorrules for Cursor AI integration"
```

Commit frequently, in logical chunks. Don't accumulate 20 files into a single commit.

**Step 5 — Push and PR:**

```bash
git push -u origin feat/llm-button-alert-llm-md
```

Then create a Pull Request on GitHub. Describe the what and the why in the PR description — your frontend team colleagues will review.

**Step 6 — Review and Merge:**

After approval, merge into `main`. Move on to the next task.

---

## Recommended PR Sequence

Order matters — each subsequent PR builds on the foundation of previous ones.

### PR #1 — Skeleton and Infrastructure

**Branch:** `chore/llm-foundation`

What's included:
- Create the `guidelines/` directory with a `README.md` (explaining what will live here)
- Add `.cursorrules` to the repo root
- Update `CLAUDE.md` — add references to `guidelines/`, explain the `.llm.md` file structure
- Update `AGENTS.md` if needed

This is the "skeleton" — it breaks nothing but lays the groundwork for everything else.

### PR #2 — The `/describe-component` Skill

**Branch:** `feat/llm-describe-component-skill`

What's included:
- `.claude/skills/describe-component/` — the complete skill
- A `.llm.md` file template (as a reference)

This is the main tool. After this PR merges, you can begin mass-producing `.llm.md` files.

### PR #3–N — Batches of `.llm.md` Files by Group

Recommended grouping:

| PR | Branch | Components | Notes |
|----|--------|-----------|-------|
| #3 | `docs/llm-md-actions` | Button, Link, ToggleButton, ButtonBase | Most used — start here |
| #4 | `docs/llm-md-messaging` | Alert, Toast, Dialog, Drawer | Often confused with each other — describe clearly |
| #5 | `docs/llm-md-inputs-basic` | Input, Textarea, NumberInput, Select | Basic inputs |
| #6 | `docs/llm-md-inputs-advanced` | Checkbox, Radio, Switch, DateInput, DateRangeInput, TimeInput | Specialized inputs |
| #7 | `docs/llm-md-data-display` | Table, Badge, NumericBadge, Tag, Code, CodeSnippet | Data display |
| #8 | `docs/llm-md-layout` | Flex, Stack, Card, Separator, ScrollArea | Layout primitives |
| #9 | `docs/llm-md-navigation` | Tabs, SegmentedTabs, SegmentedControl, Breadcrumbs | Navigation |
| #10 | `docs/llm-md-overlays` | Popover, Tooltip, OverflowTooltip, DropdownMenu, Tour | Overlays |
| #11 | `docs/llm-md-forms-loading` | Field, InputGroup, Skeleton, Loader, Overlay | Forms and loading |
| #12 | `docs/llm-md-remaining` | Calendar, Country, DateTime, Heading, Text, Ip, Kbd, QueryBar, Polymorphic, ThemeProvider, Checkmark, TemporalCore | Everything else |

### Parallel PRs — Guidelines

Guidelines can be written in parallel with `.llm.md` files:

| PR | Branch | File |
|----|--------|------|
| — | `docs/guideline-ux-copywriting` | `guidelines/ux-copywriting.md` |
| — | `docs/guideline-data-display` | `guidelines/data-display.md` |
| — | `docs/guideline-forms` | `guidelines/forms.md` |
| — | `docs/guideline-page-layouts` | `guidelines/page-layouts.md` |
| — | `docs/guideline-states` | `guidelines/states.md` |
| — | `docs/guideline-accessibility` | `guidelines/accessibility.md` |
| — | `docs/guideline-iconography` | `guidelines/iconography.md` |
| — | `docs/guideline-navigation` | `guidelines/navigation.md` |
| — | `docs/guideline-wallarm-platform` | `guidelines/wallarm-platform.md` |

### PRs from the Frontend Team

You create these as GitHub Issues and the frontend team picks them up in their sprint:

| Issue | Branch (theirs) | What's Needed |
|-------|----------------|---------------|
| Extend MCP schema | `feat/mcp-schema-llm-fields` | Add `whenToUse`, `composition`, `accessibility`, `tags`, `category` to `ComponentMetadata` |
| `.llm.md` parser | `feat/mcp-parse-llm-md` | Update the metadata generator to read `.llm.md` files |
| New MCP tool `suggest_component` | `feat/mcp-suggest-component` | Implement a tool that suggests components based on use case description |
| New MCP tool `get_pattern` | `feat/mcp-get-pattern` | Implement a tool for retrieving UI patterns |
| New MCP tool `get_guideline` | `feat/mcp-get-guideline` | Implement a tool for accessing guidelines |

---

## Which Tool for Which Task

| Task | Best Tool | Why |
|------|-----------|-----|
| Creating `.llm.md` via `/describe-component` | **Claude Code** in the cloned repo | The skill needs access to component files + Figma MCP + interactive interview |
| Writing guidelines | **Cowork** or **any editor** | Mostly text work, doesn't require code access |
| Creating skills | **Claude Code** | Skills are code + prompts, convenient to test immediately |
| Reviewing PRs | **GitHub** (web or CLI) | Standard flow |
| Creating issues for the frontend team | **GitHub Issues** | They pick up from the backlog |

---

## What to Do When a Branch Gets Stale

If you've been working on a batch of `.llm.md` files for a while and `main` has moved forward:

```bash
git checkout main
git pull origin main
git checkout feat/llm-md-actions
git rebase main
```

Since you're working with new files, rebase will go cleanly almost every time.

---

## Quick Start: Day One

If you want to begin right now, here's the minimum plan of action:

```bash
# 1. Make sure you're on the latest main
cd design-system
git checkout main
git pull origin main

# 2. Create a branch for infrastructure
git checkout -b chore/llm-foundation

# 3. Create the guidelines directory
mkdir -p guidelines

# 4. Create .cursorrules (even a basic one helps immediately)
# 5. Update CLAUDE.md
# 6. Commit, push, create PR
```

After PR #1 merges, move on to building the `/describe-component` skill — that unblocks all the rest of the work.
