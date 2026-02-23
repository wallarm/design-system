import path from 'path';
import { Project } from 'ts-morph';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';
import { parseVariantsForComponent } from '../parse-variants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const COMPONENTS_DIR = path.join(ROOT, 'src/components');

const project = new Project({
  tsConfigFilePath: path.join(ROOT, 'tsconfig.app.json'),
});

describe('parseVariantsForComponent', () => {
  it('extracts Alert variants with defaults', () => {
    const variants = parseVariantsForComponent(
      project,
      path.join(COMPONENTS_DIR, 'Alert'),
      'Alert',
    );

    const colorVariant = variants.find(v => v.name === 'color');
    expect(colorVariant).toBeDefined();
    expect(colorVariant!.options).toContain('primary');
    expect(colorVariant!.options).toContain('destructive');
    expect(colorVariant!.options).toContain('info');
    expect(colorVariant!.options).toContain('warning');
    expect(colorVariant!.options).toContain('success');
    expect(colorVariant!.defaultValue).toBe('primary');
  });

  it('extracts Button variants from both files', () => {
    const variants = parseVariantsForComponent(
      project,
      path.join(COMPONENTS_DIR, 'Button'),
      'Button',
    );

    // From Button.tsx
    const variantProp = variants.find(v => v.name === 'variant');
    expect(variantProp).toBeDefined();
    expect(variantProp!.options).toContain('primary');
    expect(variantProp!.options).toContain('ghost');

    const colorProp = variants.find(v => v.name === 'color');
    expect(colorProp).toBeDefined();
    expect(colorProp!.options).toContain('brand');
    expect(colorProp!.options).toContain('destructive');
  });

  it('extracts ButtonBase variants from classes.ts', () => {
    const variants = parseVariantsForComponent(
      project,
      path.join(COMPONENTS_DIR, 'ButtonBase'),
      'ButtonBase',
    );

    const sizeVariant = variants.find(v => v.name === 'size');
    expect(sizeVariant).toBeDefined();
    expect(sizeVariant!.options).toContain('small');
    expect(sizeVariant!.options).toContain('medium');
    expect(sizeVariant!.options).toContain('large');
  });

  it('handles Badge dynamic color variant gracefully', () => {
    const variants = parseVariantsForComponent(
      project,
      path.join(COMPONENTS_DIR, 'Badge'),
      'Badge',
    );

    const colorVariant = variants.find(v => v.name === 'color');
    expect(colorVariant).toBeDefined();
    // Dynamic variant — options array will be empty since it's generated via Object.values().reduce()
    expect(colorVariant!.options).toEqual([]);
  });

  it('returns empty array for components without CVA', () => {
    const variants = parseVariantsForComponent(
      project,
      path.join(COMPONENTS_DIR, 'ThemeProvider'),
      'ThemeProvider',
    );
    expect(variants).toEqual([]);
  });
});
