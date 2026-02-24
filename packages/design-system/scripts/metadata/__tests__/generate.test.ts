import fs from 'fs';
import path from 'path';
import { Project } from 'ts-morph';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';
import type { ComponentMetadata, DesignSystemMetadata } from '@wallarm-org/mcp-core';
import { designSystemMetadataSchema } from '@wallarm-org/mcp-core';
import { parseExamples } from '../parse-examples.js';
import { parseComponentProps } from '../parse-props.js';
import { parseTokens } from '../parse-tokens.js';
import { parseVariantsForComponent } from '../parse-variants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');

describe('metadata generation (integration)', () => {
  const tsconfigPath = path.join(ROOT, 'tsconfig.app.json');
  const project = new Project({ tsConfigFilePath: tsconfigPath });
  const componentsDir = path.join(ROOT, 'src/components');
  const themeDir = path.join(ROOT, 'src/theme');

  const componentDirs = fs
    .readdirSync(componentsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const components: ComponentMetadata[] = componentDirs.map(name => {
    const dir = path.join(componentsDir, name);
    const { mainProps, subComponents } = parseComponentProps(project, dir, name);
    const variants = parseVariantsForComponent(project, dir, name);
    const examples = parseExamples(project, dir, name);
    return {
      name,
      importPath: `@wallarm-org/design-system/${name}`,
      props: mainProps,
      variants,
      subComponents: subComponents.map(sc => ({ name: sc.name, props: sc.props })),
      examples,
    };
  });

  const tokens = parseTokens({ themeDir });

  const metadata: DesignSystemMetadata = {
    version: '0.2.1',
    generatedAt: new Date().toISOString(),
    components,
    tokens,
  };

  it('generates valid metadata that passes Zod schema', () => {
    const result = designSystemMetadataSchema.safeParse(metadata);
    if (!result.success) {
      console.error(result.error.format());
    }
    expect(result.success).toBe(true);
  });

  it('contains all component directories', () => {
    expect(components.length).toBe(componentDirs.length);
    expect(components.length).toBeGreaterThanOrEqual(40);
  });

  it('Button component has props and variants', () => {
    const button = components.find(c => c.name === 'Button');
    expect(button).toBeDefined();
    expect(button!.props.length).toBeGreaterThan(0);
    expect(button!.variants.length).toBeGreaterThan(0);
  });

  it('Alert component has sub-components', () => {
    const alert = components.find(c => c.name === 'Alert');
    expect(alert).toBeDefined();
    expect(alert!.subComponents.length).toBeGreaterThan(0);
  });

  it('Button component has examples', () => {
    const button = components.find(c => c.name === 'Button');
    expect(button).toBeDefined();
    expect(button!.examples.length).toBeGreaterThan(0);
    expect(button!.examples[0]?.name).toBe('Basic');
  });

  it('all components have examples array', () => {
    for (const component of components) {
      expect(Array.isArray(component.examples)).toBe(true);
    }
  });

  it('tokens include all expected categories', () => {
    const names = tokens.map(t => t.name);
    expect(names).toContain('colors-primary');
    expect(names).toContain('spacing');
    expect(names).toContain('typography');
    expect(names).toContain('semantic');
    expect(names).toContain('semantic-dark');
  });
});
