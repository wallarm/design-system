import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { main } from './cli';
import type { VersionsFile } from './lib/types';

// Resolved via path (not `new URL`) so the bundler cannot inline it: read at runtime from the package root.
const versionsPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'versions.json');
const versions: VersionsFile = JSON.parse(fs.readFileSync(versionsPath, 'utf8'));
process.exitCode = await main(process.argv.slice(2), process.cwd(), versions);
