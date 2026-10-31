import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../../', import.meta.url));
const settings = JSON.parse(readFileSync(join(source, '.claude/settings.json'), 'utf8'));
const hookCommand = settings.hooks.PreToolUse[0].hooks[0].command;
const stopCommand = settings.hooks.Stop[0].hooks[0].command;

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'vestige-hook-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, '.claude/hooks'), { recursive: true });
  mkdirSync(join(root, 'packages/example'), { recursive: true });
  for (const file of readdirSync(join(source, '.claude/hooks'))) {
    if (file.endsWith('.sh'))
      copyFileSync(join(source, '.claude/hooks', file), join(root, '.claude/hooks', file));
  }
  const git = (...args) =>
    execFileSync('git', args, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  git('init');
  git(
    '-c',
    'user.name=Test',
    '-c',
    'user.email=test@example.com',
    '-c',
    'commit.gpgsign=false',
    'commit',
    '--allow-empty',
    '-m',
    'chore(test): fixture',
  );
  return { root, git };
}

function run(root, command, claude = false, hook = hookCommand) {
  const env = { ...process.env };
  delete env.CLAUDE_PROJECT_DIR;
  if (claude) env.CLAUDE_PROJECT_DIR = root;
  return spawnSync('sh', ['-c', hook], {
    cwd: join(root, 'packages/example'),
    env,
    input: JSON.stringify(
      hook === stopCommand
        ? { hook_event_name: 'Stop', stop_hook_active: false }
        : {
            hook_event_name: 'PreToolUse',
            tool_name: 'Bash',
            tool_input: { command },
          },
    ),
    encoding: 'utf8',
  });
}

for (const claude of [false, true]) {
  test(`PR creation requires the current HEAD audit from a nested ${claude ? 'Claude' : 'Codex'} cwd`, t => {
    const { root, git } = fixture(t);
    const blocked = run(root, 'gh pr create --draft', claude);
    assert.equal(blocked.status, 2, blocked.stderr);
    assert.match(blocked.stderr, /vestige-audit/);
    const marker = join(root, git('rev-parse', '--git-path', 'vestige-audit-ok'));
    writeFileSync(marker, 'stale-head\n');
    assert.equal(run(root, 'gh pr create --draft', claude).status, 2);
    writeFileSync(marker, `${git('rev-parse', 'HEAD')}\n`);
    assert.equal(run(root, 'gh pr create --draft', claude).status, 0);
  });
}

test('ordinary commands and a quoted mention of PR creation pass without an audit', t => {
  const { root } = fixture(t);
  for (const command of ['git status --short', 'echo "gh pr create"']) {
    const result = run(root, command);
    assert.equal(result.status, 0, result.stderr);
  }
});

test('a primary-checkout audit does not authorize the linked worktree even at the same HEAD', t => {
  const { root, git } = fixture(t);
  const worktree = join(root, 'linked');
  git('worktree', 'add', '--detach', worktree);
  mkdirSync(join(worktree, '.claude/hooks'), { recursive: true });
  mkdirSync(join(worktree, 'packages/example'), { recursive: true });
  copyFileSync(
    join(source, '.claude/hooks/require-vestige-audit.sh'),
    join(worktree, '.claude/hooks/require-vestige-audit.sh'),
  );
  const head = git('rev-parse', 'HEAD');
  writeFileSync(resolve(root, git('rev-parse', '--git-path', 'vestige-audit-ok')), `${head}\n`);
  const blocked = run(worktree, 'git status && gh pr create --draft');
  assert.equal(blocked.status, 2, blocked.stderr);
  const marker = execFileSync('git', ['rev-parse', '--git-path', 'vestige-audit-ok'], {
    cwd: worktree,
    encoding: 'utf8',
  }).trim();
  writeFileSync(resolve(worktree, marker), `${head}\n`);
  const allowed = run(worktree, 'git status && gh pr create --draft');
  assert.equal(allowed.status, 0, allowed.stderr);
});

test('Stop emits valid empty JSON when no design-system source changed', t => {
  const { root } = fixture(t);
  const result = run(root, '', false, stopCommand);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {});
});

test('Stop emits a nonblocking JSON quality reminder after a design-system edit', t => {
  const { root, git } = fixture(t);
  const file = join(root, 'packages/design-system/src/example.ts');
  mkdirSync(join(root, 'packages/design-system/src'), { recursive: true });
  writeFileSync(file, 'export const example = 1;\n');
  git('add', 'packages/design-system/src/example.ts');
  git(
    '-c',
    'user.name=Test',
    '-c',
    'user.email=test@example.com',
    '-c',
    'commit.gpgsign=false',
    'commit',
    '-m',
    'chore(test): source fixture',
  );
  writeFileSync(file, 'export const example = 2;\n');
  const result = run(root, '', false, stopCommand);
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.match(output.systemMessage, /pnpm typecheck/);
  assert.match(output.systemMessage, /pnpm lint/);
  assert.match(output.systemMessage, /pnpm test:run/);
  assert.equal(output.decision, undefined);
});
