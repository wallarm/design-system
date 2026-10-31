# Shared Claude Code and Codex harness

This repository follows the core-frontend approach: edit one canonical source,
and expose it to each client through aliases or small format adapters.

| Content | Canonical source | Codex entry point |
| --- | --- | --- |
| Root and scoped instructions | `CLAUDE.md` in each scope | Adjacent `AGENTS.md` → `CLAUDE.md` |
| Skills | `.claude/skills/` | `.codex/skills` → `../.claude/skills` |
| Coding conventions | `.claude/rules/` | Matching-rule links in root `CLAUDE.md` |
| Specialist role bodies | `.claude/agents/*.md` | `.codex/agents/*.toml` |
| Hooks | `.claude/settings.json`, `.claude/hooks/` | `.codex/hooks.json` → `../.claude/settings.json` |
| MCP server definitions | `.mcp.json` | Generated, gitignored `.codex/config.toml` |

Keep new scoped instructions paired with a relative `AGENTS.md` symlink.
Add skills under `.claude/skills`; do not copy their bodies into `.codex`.
Role adapters provide selection metadata and a reference to the canonical body.
They inherit Codex model and permission settings; Claude-specific role frontmatter
does not configure Codex. In Codex use `/skills` or `$skill-name`; the slash commands
in `CLAUDE.md` refer to the same shared workflows.

## Setup and MCP

```bash
pnpm install           # Dependencies, Git hooks and local Codex MCP config
pnpm agents:sync       # Refresh config after editing .mcp.json
codex mcp list         # Check that Codex loads the server definitions
pnpm test:harness     # MCP adapter and PR-hook regression tests
pnpm lint:harness     # Agent tooling lint/format checks
```

Restart Codex after configuration changes. Project `.codex/config.toml` is loaded
only for trusted projects; see [MCP configuration](https://learn.chatgpt.com/docs/extend/mcp?surface=cli).
The generator supports the stdio and HTTP definitions used here, retaining server
names, commands, arguments, env and HTTP headers. It replaces its entire output;
put personal settings and credentials in user-level Codex configuration. Do not
put credentials in `.mcp.json` or edit the generated file.

Automatic setup skips MCP generation when `.mcp.json` is absent, as in the
manifest-only dependency stages of the local Docker builds. Explicit
`pnpm agents:sync` still requires the canonical file. Invalid field types and
unresolved `${...}` interpolation fail before replacing the previous config.

User and project settings merge. If a server with the same name exists globally,
its transport must agree with the project definition; a global `url` cannot be
combined with a project `command`. The sync command never changes global settings
or performs OAuth login. Listing servers verifies configuration, not availability
or authenticated access.

### Figma

`.mcp.json` defines both `figma-web` (`https://mcp.figma.com/mcp`) and
`figma-desktop` (`http://127.0.0.1:3845/mcp`). After sync and restart, use the web
server for file URLs. If it requests authentication, run `codex mcp login figma-web`
in the same Codex account/environment as the session and complete the browser login.
Desktop access requires the Figma application and its Desktop MCP server running.
Generating the config does not start Figma or enable its server.

## Hooks and permissions

The shared PreToolUse hook requires `/vestige-audit` before a command beginning
with `gh pr create` (including after a shell separator). The audit marker is
resolved through `git rev-parse --git-path` and must match the current HEAD.
This is a command-pattern guard, not a complete shell parser; the instruction to
run the audit applies regardless of how the PR is created. The Stop hook reminds
users about quality checks when design-system source files were modified;
it returns nonblocking JSON accepted by both clients.

Codex exposes shell hook calls as `Bash` with `tool_input.command`, compatible
with the existing guard. Hook commands locate scripts through the current Git
root, so a package cwd does not require `CLAUDE_PROJECT_DIR`.
Review project hooks through `/hooks` before enabling them; project trust and
hook trust are separate. See [Codex hooks](https://learn.chatgpt.com/docs/hooks).
Claude's `permissions` remain Claude-specific; the alias does not replace Codex's
own permissions or turn those deny rules into Codex enforcement.

With linked worktrees, Codex CLI 0.166.0 loads project hook definitions from the
primary checkout. The primary checkout must also contain this harness before
those definitions are discoverable in linked worktrees. Commands still resolve
scripts from the active worktree. Adding this branch alone does not activate hooks
in the current session or change the primary checkout.

## Verification

The CI quality matrix runs `pnpm test:harness`; `pnpm lint` includes harness lint.
Tests exercise MCP conversion, repeatable refresh, rejection of invalid input,
and the configured PR hook with Claude and Codex payloads from a package cwd.
Native discovery was verified with Codex CLI 0.166.0: `skills/list` resolves all
six skills to their canonical `.claude/skills` files, and `codex mcp list` loads
all six MCP definitions. These checks do not invoke a model or verify a remote
server connection. Use `/skills`, `/hooks`, and `codex mcp list` to inspect a
new session. The current [skills documentation](https://learn.chatgpt.com/docs/build-skills)
also documents `.agents/skills`; this repo retains core-frontend's verified
`.codex/skills` entry point.
Role adapters follow the [custom-agent format](https://learn.chatgpt.com/docs/agent-configuration/subagents).
