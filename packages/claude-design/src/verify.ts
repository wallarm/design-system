import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { buildProject } from './build';
import { CLAUDE_DESIGN } from './config';

const manifestPath = join(dirname(CLAUDE_DESIGN.outDir), 'file-hashes.json');
const readHashes = async () =>
  JSON.parse(await readFile(manifestPath, 'utf8')) as Record<string, string>;

await buildProject();
const first = await readHashes();
await buildProject();
const second = await readHashes();
const paths = [...new Set([...Object.keys(first), ...Object.keys(second)])].sort();
const changed = paths.filter(path => first[path] !== second[path]);
if (changed.length) {
  throw new Error(`Consecutive Claude Design builds differ:\n${changed.join('\n')}`);
}
process.stdout.write(`Verified ${paths.length} byte-identical files across two builds.\n`);
