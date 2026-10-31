import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

function tomlString(value, field) {
  if (typeof value !== 'string' || value.includes('${')) {
    throw new Error(
      `Use literal strings and user-level MCP credentials instead of interpolation: ${field}`,
    );
  }
  return JSON.stringify(value);
}

// Adapted from core-frontend: .mcp.json stays the sole server-definition source.
// The ignored TOML file is reproducible local setup, not another config to edit.
export function syncCodex(root) {
  const { mcpServers } = JSON.parse(readFileSync(join(root, '.mcp.json'), 'utf8'));
  const lines = [
    '# Generated from .mcp.json by pnpm agents:sync. Do not edit.',
    '# Hooks and role instructions are shared with .claude; see docs/agent-harness.md.',
    '',
  ];
  for (const [name, server] of Object.entries(mcpServers)) {
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      throw new Error(
        `Use a shared MCP name with letters, digits, hyphens or underscores: ${name}`,
      );
    }
    lines.push(`[mcp_servers.${JSON.stringify(name)}]`);
    if (server.command) {
      lines.push(`command = ${tomlString(server.command, `${name}.command`)}`);
      const args = server.args === undefined ? [] : server.args;
      if (!Array.isArray(args))
        throw new Error(`MCP args must be an array of strings: ${name}.args`);
      lines.push(`args = [${args.map(value => tomlString(value, `${name}.args`)).join(', ')}]`);
    } else if (server.type === 'http' && server.url) {
      lines.push(`url = ${tomlString(server.url, `${name}.url`)}`);
    } else {
      throw new Error(`Unsupported MCP transport: ${name}`);
    }
    for (const [source, target] of [
      ['env', 'env'],
      ['headers', 'http_headers'],
    ]) {
      if (!server[source] || !Object.keys(server[source]).length) continue;
      lines.push(`[mcp_servers.${JSON.stringify(name)}.${target}]`);
      for (const [key, value] of Object.entries(server[source])) {
        lines.push(`${JSON.stringify(key)} = ${tomlString(value, `${name}.${key}`)}`);
      }
    }
    lines.push('');
  }
  const output = join(root, '.codex', 'config.toml');
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, `${lines.join('\n')}\n`, { mode: 0o600 });
  return Object.keys(mcpServers).length;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  process.stdout.write(
    `Synced ${syncCodex(root)} MCP servers from .mcp.json into local Codex config.\n`,
  );
}
