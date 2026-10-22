import { describe, expect, it } from '@rstest/core';
import fs from 'node:fs';
import path from 'node:path';
import versions from '../../../versions.json';
import { migrations } from '../index';

const dir = path.resolve(__dirname, '..');
const files = fs
  .readdirSync(dir)
  .filter(f => f.endsWith('.ts') && f !== 'index.ts')
  .map(f => f.replace(/\.ts$/, ''));

describe('registry', () => {
  const ids = migrations.map(m => m.id);

  it('has unique ids', () => {
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('matches migration file basenames', () => {
    expect([...ids].sort()).toEqual([...files].sort());
  });

  it('registers every versions.json key', () => {
    for (const key of Object.keys(versions.migrations)) expect(ids).toContain(key);
  });
});
