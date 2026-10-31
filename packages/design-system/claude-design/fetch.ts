// Downloads the released Claude Design project into .claude-design/ (replacing project/).
// Usage: tsx claude-design/fetch.ts [vX.Y.Z]  (default: the latest stable v* release)
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { CLAUDE_DESIGN } from './config';

const run = (command: string, args: string[]) =>
  execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });

const tag =
  process.argv[2] ??
  (
    JSON.parse(
      run('gh', [
        'release',
        'list',
        '--exclude-pre-releases',
        '--limit',
        '50',
        '--json',
        'tagName',
      ]),
    ) as { tagName: string }[]
  ).find(release => /^v\d/.test(release.tagName))?.tagName;
if (!tag) throw new Error('No stable v* release found');

const download = mkdtempSync(join(tmpdir(), 'claude-design-'));
try {
  run('gh', ['release', 'download', tag, '-p', 'claude-design-*.tgz', '-D', download]);
  const [archive] = readdirSync(download);
  if (!archive) throw new Error(`${tag} has no claude-design-*.tgz asset`);
  const root = dirname(CLAUDE_DESIGN.outDir);
  mkdirSync(root, { recursive: true });
  rmSync(CLAUDE_DESIGN.outDir, { recursive: true, force: true });
  run('tar', ['-xzf', join(download, archive), '-C', root]);
  process.stdout.write(`Unpacked ${archive} (${tag}) into ${root}\n`);
} finally {
  rmSync(download, { recursive: true, force: true });
}
