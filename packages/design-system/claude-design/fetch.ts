// Downloads the released Claude Design project into .claude-design/ (replacing project/ and
// clearing remote/ and publish/).
// Usage: tsx claude-design/fetch.ts [vX.Y.Z]  (default: the latest stable v* release)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, renameSync, rmSync } from 'node:fs';
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

const root = dirname(CLAUDE_DESIGN.outDir);
mkdirSync(root, { recursive: true });
const download = mkdtempSync(join(tmpdir(), 'claude-design-'));
// Same filesystem as root, so the final renames are atomic.
const unpacked = mkdtempSync(join(root, 'fetch-'));
try {
  run('gh', ['release', 'download', tag, '-p', 'claude-design-*.tgz', '-D', download]);
  const archives = readdirSync(download);
  if (archives.length !== 1)
    throw new Error(
      `${tag} must have exactly one claude-design-*.tgz asset, found ${archives.length}`,
    );
  const [archive] = archives as [string];
  run('tar', ['-xzf', join(download, archive), '-C', unpacked]);
  for (const required of ['project/design-system.json', 'file-hashes.json'])
    if (!existsSync(join(unpacked, required)))
      throw new Error(`${archive} has no ${required}; local state left unchanged`);
  // The manifest drives stale-path removal, so it must never outlive its project; saved remote
  // reads, upload results and the old plan describe the previous sync, so they go too.
  for (const name of ['remote', 'publish'])
    rmSync(join(root, name), { recursive: true, force: true });
  for (const name of ['project', 'file-hashes.json', 'summary.json']) {
    rmSync(join(root, name), { recursive: true, force: true });
    if (existsSync(join(unpacked, name))) renameSync(join(unpacked, name), join(root, name));
  }
  process.stdout.write(`Unpacked ${archive} (${tag}) into ${root}\n`);
} finally {
  rmSync(download, { recursive: true, force: true });
  rmSync(unpacked, { recursive: true, force: true });
}
