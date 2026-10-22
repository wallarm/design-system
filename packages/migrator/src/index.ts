import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { main } from './cli';
import type { VersionsFile } from './lib/types';

// Resolved via path (not `new URL`/import) so the bundler cannot inline them: read at runtime from the package root.
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (f: string) => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const versions: VersionsFile = readJson('versions.json');
process.exitCode = await main(
  process.argv.slice(2),
  process.cwd(),
  versions,
  readJson('package.json').version,
);
