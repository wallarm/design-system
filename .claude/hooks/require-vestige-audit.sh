#!/bin/sh
# PreToolUse(Bash): block `gh pr create` until /vestige-audit has run on the current HEAD.
# The skill writes HEAD's SHA to the marker after it commits its fixes.
# Match `gh pr create` only where it starts a command (not inside quotes/echo).
cat | grep -qE '"command": *"([^"]*[;&|] *)?gh pr create' || exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
marker=$(git rev-parse --git-path vestige-audit-ok 2>/dev/null) || exit 0
head=$(git rev-parse HEAD 2>/dev/null) || exit 0

[ "$(cat "$marker" 2>/dev/null)" = "$head" ] && exit 0

echo "Before opening a PR, run /vestige-audit: it removes docs, configs and scripts this branch made obsolete, commits the fixes and records HEAD ($head) as audited. Then retry gh pr create." >&2
exit 2
