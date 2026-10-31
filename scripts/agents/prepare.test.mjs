import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../../', import.meta.url));
const { prepare } = JSON.parse(readFileSync(join(source, 'package.json'), 'utf8')).scripts;

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'codex-prepare-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(
    join(root, 'package.json'),
    JSON.stringify({ private: true, scripts: { prepare } }),
  );
  return root;
}

function run(root) {
  return spawnSync('sh', ['-c', prepare], {
    cwd: root,
    env: {
      ...process.env,
      HUSKY: '0',
      PATH: `${join(source, 'node_modules/.bin')}${delimiter}${process.env.PATH}`,
    },
    encoding: 'utf8',
  });
}

test('prepare succeeds in manifest-only Docker stages without agent source files', t => {
  const root = fixture(t);
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(existsSync(join(root, '.codex')), false);
});

test('prepare generates config in a full checkout and propagates invalid MCP input', t => {
  const root = fixture(t);
  mkdirSync(join(root, 'scripts/agents'), { recursive: true });
  copyFileSync(
    join(source, 'scripts/agents/sync-codex.mjs'),
    join(root, 'scripts/agents/sync-codex.mjs'),
  );
  writeFileSync(
    join(root, '.mcp.json'),
    JSON.stringify({ mcpServers: { test: { command: 'node' } } }),
  );
  const valid = run(root);
  assert.equal(valid.status, 0, valid.stderr);
  assert.ok(
    readFileSync(join(root, '.codex/config.toml'), 'utf8').includes('[mcp_servers."test"]'),
  );
  writeFileSync(join(root, '.mcp.json'), 'invalid JSON');
  const invalid = run(root);
  assert.notEqual(invalid.status, 0);
  assert.match(invalid.stderr, /SyntaxError/);
});
