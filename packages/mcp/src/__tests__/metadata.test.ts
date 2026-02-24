import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';
import { designSystemMetadataSchema } from '@wallarm-org/mcp-core';

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
