import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from '@rstest/core';
import { prepare, stampVersions } from '@wallarm-org/publish-scripts/stamp-migrations.mjs';

const versions = { latest: '3.0.0', migrations: { a: '2.0.0', b: '3.0.0' } };
const ids = ['a', 'b', 'new'];

describe('stampVersions', () => {
  it('stamps pending ids and latest on a major', () => {
    expect(
      stampVersions({ versions, ids, nextRelease: { type: 'major', version: '4.0.0' } }),
    ).toEqual({
      latest: '4.0.0',
      migrations: { a: '2.0.0', b: '3.0.0', new: '4.0.0' },
    });
  });

  it('bumps latest on a major with no new ids', () => {
    expect(
      stampVersions({
        versions,
        ids: ['a', 'b'],
        nextRelease: { type: 'major', version: '4.0.0' },
      }),
    ).toEqual({ latest: '4.0.0', migrations: versions.migrations });
  });

  it.each(['minor', 'patch'])('changes nothing on a %s', type => {
    expect(stampVersions({ versions, ids, nextRelease: { type, version: '3.1.0' } })).toEqual(
      versions,
    );
  });
});

describe('prepare', () => {
  it('writes versions.json from the migrations folder on a major', async () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'migrator-stamp-'));
    const pkg = path.join(cwd, 'packages/migrator');
    fs.mkdirSync(path.join(pkg, 'src/migrations/__tests__'), { recursive: true });
    for (const f of ['index.ts', 'a.ts', 'new.ts', '__tests__/a.test.ts']) {
      fs.writeFileSync(path.join(pkg, 'src/migrations', f), '');
    }
    fs.writeFileSync(
      path.join(pkg, 'versions.json'),
      JSON.stringify({ latest: '3.0.0', migrations: { a: '3.0.0' } }),
    );
    const logs: string[] = [];
    const logger = { log: (m: string) => logs.push(m), warn: (m: string) => logs.push(m) };

    await prepare({}, { nextRelease: { type: 'major', version: '4.0.0' }, logger, cwd });

    expect(fs.readFileSync(path.join(pkg, 'versions.json'), 'utf8')).toBe(
      `${JSON.stringify({ latest: '4.0.0', migrations: { a: '3.0.0', new: '4.0.0' } }, null, 2)}\n`,
    );
  });
});
