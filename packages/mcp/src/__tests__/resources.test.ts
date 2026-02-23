import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';
import type { DesignSystemMetadata } from '@wallarm-org/mcp-core';
import { getComponentListContent } from '../resources/components';
import { getTokensContent } from '../resources/tokens';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_PATH = path.join(__dirname, 'fixtures/components.json');
const metadata: DesignSystemMetadata = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf-8'));

describe('getComponentListContent', () => {
  const content = getComponentListContent(metadata);

  it('includes version', () => {
    expect(content).toContain('v0.2.1');
  });

  it('includes component count', () => {
    expect(content).toContain('Total: 3 components');
  });

  it('lists all components', () => {
    expect(content).toContain('Button');
    expect(content).toContain('Alert');
    expect(content).toContain('Badge');
  });

  it('includes import paths', () => {
    expect(content).toContain('@wallarm-org/design-system/Button');
  });
});

describe('getTokensContent', () => {
  const content = getTokensContent(metadata);

  it('includes version', () => {
    expect(content).toContain('v0.2.1');
  });

  it('includes token categories', () => {
    expect(content).toContain('## colors-primary');
    expect(content).toContain('## spacing');
  });

  it('includes token values', () => {
    expect(content).toContain('--color-slate-50');
    expect(content).toContain('#f8fafc');
    expect(content).toContain('--spacing-8');
    expect(content).toContain('8px');
  });
});
