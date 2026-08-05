#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const BARREL = path.resolve('packages/design-system/src/icons/index.ts');
const NEW_NAMES = process.argv.slice(2);

if (NEW_NAMES.length === 0) {
  throw new Error('Pass at least one new export name as a CLI arg');
}

const barrel = fs.readFileSync(BARREL, 'utf8');
const lines = barrel.split('\n').filter(Boolean);

for (const name of NEW_NAMES) {
  const line = `export { ${name} } from './${name}';`;
  if (lines.includes(line)) {
    throw new Error(`Line already present: ${line}`);
  }
  lines.push(line);
}

function sortKey(line) {
  const m = line.match(/^export \{ (?:type )?(\w+)/);
  if (!m) throw new Error(`Could not parse export name from line: ${line}`);
  return m[1];
}

lines.sort((a, b) => {
  const ka = sortKey(a);
  const kb = sortKey(b);
  return ka < kb ? -1 : ka > kb ? 1 : 0;
});

fs.writeFileSync(BARREL, `${lines.join('\n')}\n`);
console.log(`Barrel now has ${lines.length} export lines (added ${NEW_NAMES.length}).`);
