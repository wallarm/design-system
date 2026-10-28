import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

import { describe, expect, it } from '@rstest/core';
import { designSystemMetadataSchema } from '@wallarm-org/mcp-core';

import { describeSource, loadMetadata } from '../metadata';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = path.join(__dirname, 'fixtures/components.json');

describe('metadata validation', () => {
  const raw = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf-8'));

  it('validates fixture against Zod schema', () => {
    const result = designSystemMetadataSchema.safeParse(raw);
    expect(result.success).toBe(true);
  });

  it('rejects invalid metadata', () => {
    const invalid = { ...raw, components: 'not-an-array' };
    const result = designSystemMetadataSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects missing version', () => {
    const { version, ...noVersion } = raw;
    const result = designSystemMetadataSchema.safeParse(noVersion);
    expect(result.success).toBe(false);
  });
});

describe('loadMetadata resolution', () => {
  const noInstalled = async () => undefined;
  const placeAt = (root: string, ...segments: string[]) => {
    const dir = path.join(root, ...segments, '@wallarm-org/design-system/dist/metadata');
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(FIXTURE_PATH, path.join(dir, 'components.json'));
    return path.join(dir, 'components.json');
  };

  it('finds the design system in apps/*/node_modules', async () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-ws-'));
    const expected = placeAt(cwd, 'apps', 'web', 'node_modules');
    const { metadataPath, source } = await loadMetadata(['node'], {
      cwd,
      bundledPath: '/nonexistent',
      resolveInstalled: noInstalled,
    });
    expect(metadataPath).toBe(expected);
    expect(source.kind).toBe('installed');
    fs.rmSync(cwd, { recursive: true });
  });

  it('falls back to the bundled snapshot and says so', async () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-empty-'));
    const { metadata, source } = await loadMetadata(['node'], {
      cwd,
      bundledPath: FIXTURE_PATH,
      resolveInstalled: noInstalled,
    });
    expect(source.kind).toBe('bundled');
    expect(describeSource(source, metadata.version)).toContain('bundled snapshot v0.2.1');
    fs.rmSync(cwd, { recursive: true });
  });

  it('fails when nothing is found', async () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-none-'));
    await expect(
      loadMetadata(['node'], { cwd, bundledPath: '/nonexistent', resolveInstalled: noInstalled }),
    ).rejects.toThrow('Could not find');
    fs.rmSync(cwd, { recursive: true });
  });
});
