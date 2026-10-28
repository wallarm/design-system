import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { UsageError } from './types';

export const SOURCE_EXTENSIONS = ['ts', 'tsx', 'js', 'jsx', 'mts', 'cts'] as const;

const isSource = (f: string) => SOURCE_EXTENSIONS.some(e => f.endsWith(`.${e}`));

function walk(abs: string, out: string[]) {
  const stat = fs.statSync(abs, { throwIfNoEntry: false });
  if (!stat) throw new UsageError(`path not found: ${abs}`);
  if (stat.isFile()) {
    if (isSource(abs)) out.push(abs);
    return;
  }
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    walk(path.join(abs, entry.name), out);
  }
}

/** Explicit paths → recursive expansion; otherwise tracked files from git. Returns absolute paths. */
export function listCandidateFiles(cwd: string, paths: string[]): string[] {
  const out: string[] = [];
  if (paths.length > 0) {
    for (const p of paths) walk(path.resolve(cwd, p), out);
    return out;
  }
  try {
    const stdout = execFileSync(
      'git',
      ['ls-files', '-z', '--', ...SOURCE_EXTENSIONS.map(e => `*.${e}`)],
      { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 256 * 1024 * 1024 },
    );
    return stdout
      .split('\0')
      .filter(Boolean)
      .map(f => path.resolve(cwd, f));
  } catch {
    throw new UsageError(
      'not a git repository: pass explicit paths (e.g. `migrator --from X src`)',
    );
  }
}
