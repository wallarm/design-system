import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { syncCodex } from './sync-codex.mjs';

function fixture(t, servers) {
  const root = mkdtempSync(join(tmpdir(), 'codex-mcp-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(join(root, '.mcp.json'), JSON.stringify({ mcpServers: servers }));
  return root;
}

test('converts stdio and HTTP servers with quoted env and header values', t => {
  const root = fixture(t, {
    context7: {
      command: 'npx',
      args: ['@upstash/context7-mcp'],
      env: { LABEL: 'a "quoted" value\nnext line' },
    },
    'figma-web': {
      type: 'http',
      url: 'https://mcp.figma.com/mcp',
      headers: { 'X-Test': 'quoted "header"' },
    },
    defaults: { command: 'node' },
  });
  assert.equal(syncCodex(root), 3);
  const output = readFileSync(join(root, '.codex/config.toml'), 'utf8');
  assert.ok(output.includes('[mcp_servers."context7"]\ncommand = "npx"'));
  assert.ok(output.includes('args = ["@upstash/context7-mcp"]'));
  assert.ok(output.includes('"LABEL" = "a \\"quoted\\" value\\nnext line"'));
  assert.ok(output.includes('[mcp_servers."figma-web"]\nurl = "https://mcp.figma.com/mcp"'));
  assert.ok(
    output.includes('[mcp_servers."figma-web".http_headers]\n"X-Test" = "quoted \\"header\\""'),
  );
  assert.ok(output.includes('[mcp_servers."defaults"]\ncommand = "node"\nargs = []'));
  assert.equal(statSync(join(root, '.codex/config.toml')).mode & 0o777, 0o600);
});

test('sync replaces stale servers and is reproducible', t => {
  const root = fixture(t, { stale: { command: 'old' } });
  syncCodex(root);
  writeFileSync(
    join(root, '.mcp.json'),
    JSON.stringify({ mcpServers: { current: { command: 'node' } } }),
  );
  assert.equal(syncCodex(root), 1);
  const output = readFileSync(join(root, '.codex/config.toml'), 'utf8');
  assert.ok(!output.includes('stale'));
  assert.ok(output.includes('[mcp_servers."current"]'));
  syncCodex(root);
  assert.equal(readFileSync(join(root, '.codex/config.toml'), 'utf8'), output);
});

test('invalid names and transports fail without replacing the last working config', t => {
  const root = fixture(t, { valid: { command: 'node' } });
  syncCodex(root);
  const output = readFileSync(join(root, '.codex/config.toml'), 'utf8');
  for (const [servers, message] of [
    [{ 'a/b': { command: 'node' } }, /shared MCP name/],
    [{ remote: { type: 'sse', url: 'https://example.com' } }, /Unsupported MCP transport/],
    [{ invalid: { command: 'node', args: 'server.mjs' } }, /args/],
    [{ invalid: { command: 'node', args: [123] } }, /args/],
    [{ invalid: { command: 123 } }, /command/],
    [{ invalid: { type: 'http', url: 123 } }, /url/],
  ]) {
    writeFileSync(join(root, '.mcp.json'), JSON.stringify({ mcpServers: servers }));
    assert.throws(() => syncCodex(root), message);
    assert.equal(readFileSync(join(root, '.codex/config.toml'), 'utf8'), output);
  }
});

test('rejects unresolved Claude interpolation and non-string env/header values', t => {
  for (const field of ['env', 'headers']) {
    for (const value of ['${TOKEN}', 123]) {
      const root = fixture(t, {
        remote: { type: 'http', url: 'https://example.com', [field]: { TOKEN: value } },
      });
      assert.throws(() => syncCodex(root), /user-level MCP credentials/);
    }
  }
});
