import { describe, expect, it } from '@rstest/core';
import fs from 'node:fs';
import path from 'node:path';
import { migrateSource } from '../../lib/runner';
import { migrations } from '../index';

// jscodeshift-style: __fixtures__/<migration-id>/<case>.input.tsx -> <case>.output.tsx
const root = path.resolve(__dirname, '../__fixtures__');

for (const id of fs.readdirSync(root)) {
  describe(id, () => {
    const migration = migrations.find(m => m.id === id);
    it('is a registered migration', () => expect(migration).toBeDefined());
    if (!migration) return;
    const cases = fs
      .readdirSync(path.join(root, id))
      .filter(f => f.endsWith('.input.tsx'))
      .map(f => f.replace('.input.tsx', ''));

    for (const name of cases) {
      it(name, () => {
        const read = (kind: string) =>
          fs.readFileSync(path.join(root, id, `${name}.${kind}.tsx`), 'utf8');
        const output = read('output');
        const run = (text: string) =>
          migrateSource({ text, fileName: `${name}.tsx`, migrations: [migration] }).code;
        expect(run(read('input'))).toBe(output);
        expect(run(output)).toBe(output);
      });
    }
  });
}
