import { describe, expect, it } from '@rstest/core';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

// WDS-198: a glyph-only import loads no bake, worker, queue or animation code (06 §9).
const resolve = (from: string, spec: string) => {
  const base = path.resolve(path.dirname(from), spec);
  return [`${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts')].find(existsSync);
};
const graph = (entry: string) => {
  const seen = new Set<string>();
  const walk = (file: string) => {
    if (seen.has(file)) return;
    seen.add(file);
    for (const m of readFileSync(file, 'utf8').matchAll(
      /(?:(?:import|export)(?:[^'"]*?from)?\s*|import\(\s*)'(\.[^']+)'/g,
    )) {
      const next = resolve(file, m[1] as string);
      if (next) walk(next);
    }
  };
  walk(entry);
  return [...seen].map(f => path.relative(path.resolve(__dirname, '../..'), f));
};

describe('AgentGlyph import graph', () => {
  it('reaches the glyph core but no bake, worker or queue', () => {
    const files = graph(path.resolve(__dirname, 'index.ts'));
    expect(files).toContain('lib/agent-characters/glyph.ts');
    expect(files.filter(f => /agent-characters\/(bake|worker|queue)\.ts$/.test(f))).toEqual([]);
  });

  it('is exported with the look types and the default look', async () => {
    const mod = await import('./index');
    expect(typeof mod.defaultLook).toBe('function');
    expect(mod.defaultLook('x').v).toBe(1);
  });
});
