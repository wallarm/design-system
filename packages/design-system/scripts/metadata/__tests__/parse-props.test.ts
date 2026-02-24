import path from 'path';
import { Project } from 'ts-morph';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';
import { parseComponentProps } from '../parse-props.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const COMPONENTS_DIR = path.join(ROOT, 'src/components');

const project = new Project({
  tsConfigFilePath: path.join(ROOT, 'tsconfig.app.json'),
});

describe('parseComponentProps', () => {
  it('extracts Button props with defaults', () => {
    const { mainProps } = parseComponentProps(
      project,
      path.join(COMPONENTS_DIR, 'Button'),
      'Button',
    );

    const variant = mainProps.find(p => p.name === 'variant');
    expect(variant).toBeDefined();
    expect(variant!.defaultValue).toBe('primary');

    const color = mainProps.find(p => p.name === 'color');
    expect(color).toBeDefined();
    expect(color!.defaultValue).toBe('brand');

    const size = mainProps.find(p => p.name === 'size');
    expect(size).toBeDefined();
    expect(size!.defaultValue).toBe('large');
  });

  it('extracts Alert props with JSDoc descriptions', () => {
    const { mainProps } = parseComponentProps(project, path.join(COMPONENTS_DIR, 'Alert'), 'Alert');

    const color = mainProps.find(p => p.name === 'color');
    expect(color).toBeDefined();
    expect(color!.description).toBe('Color variant of the alert');
    expect(color!.defaultValue).toBe('primary');

    const minWidth = mainProps.find(p => p.name === 'minWidth');
    expect(minWidth).toBeDefined();
    expect(minWidth!.description).toContain('Minimum width');
  });

  it('extracts Alert sub-components', () => {
    const { subComponents } = parseComponentProps(
      project,
      path.join(COMPONENTS_DIR, 'Alert'),
      'Alert',
    );

    const subNames = subComponents.map(s => s.name);
    expect(subNames).toContain('AlertClose');
    expect(subNames).toContain('AlertIcon');
    expect(subNames).toContain('AlertTitle');
  });

  it('returns empty for non-existent component', () => {
    const { mainProps, subComponents } = parseComponentProps(
      project,
      path.join(COMPONENTS_DIR, 'NonExistent'),
      'NonExistent',
    );
    expect(mainProps).toEqual([]);
    expect(subComponents).toEqual([]);
  });
});
