import fs from 'node:fs';
import { main } from './cli';
import type { VersionsFile } from './lib/types';

const versions: VersionsFile = JSON.parse(
  fs.readFileSync(new URL('../versions.json', import.meta.url), 'utf8'),
);
process.exitCode = await main(process.argv.slice(2), process.cwd(), versions);
