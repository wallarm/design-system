#!/bin/sh
# Nonblocking Stop reminder shared by Claude Code and Codex (JSON output).
root=$(git rev-parse --show-toplevel 2>/dev/null) || { printf '%s\n' '{}'; exit 0; }

if git -C "$root" diff --name-only --diff-filter=M 2>/dev/null | grep -q '^packages/design-system/src/'; then
  printf '%s\n' '{"systemMessage":"Design system files were modified. Run quality checks before committing: pnpm typecheck, pnpm lint and pnpm test:run in parallel."}'
else
  printf '%s\n' '{}'
fi
