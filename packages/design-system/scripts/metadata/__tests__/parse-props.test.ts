import path from 'path';
import { fileURLToPath } from 'url';

import { describe, expect, it } from '@rstest/core';
import { Project } from 'ts-morph';

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

  it('classifies an aliased Props export (CodeEditorRootProps as CodeEditorProps) as the main props', () => {
    const { mainProps, subComponents } = parseComponentProps(
      project,
      path.join(COMPONENTS_DIR, 'CodeEditor'),
      'CodeEditor',
    );

    const mainNames = mainProps.map(p => p.name);
    expect(mainNames).toEqual(expect.arrayContaining(['value', 'language', 'readOnly']));

    const subNames = subComponents.map(s => s.name);
    expect(subNames).toContain('CodeEditorContent');
    expect(subNames.filter(name => name === 'CodeEditorRoot').length).toBeLessThanOrEqual(1);
  });

  it('keeps self-declared on* props and skips Props types without a component export', () => {
    const { mainProps, subComponents } = parseComponentProps(
      project,
      path.join(COMPONENTS_DIR, 'WallyAssistant'),
      'WallyAssistant',
    );

    const onSubmit = mainProps.find(p => p.name === 'onSubmit');
    expect(onSubmit?.required).toBe(true);
    expect(mainProps.map(p => p.name)).not.toContain('onClick');

    const subNames = subComponents.map(s => s.name);
    expect(subNames).toContain('ChatViewProvider');
    expect(subNames).not.toContain('ChatMarkdown');

    // Defaults are read from nested sub-component files (WallyAssistant/views/).
    const provider = subComponents.find(s => s.name === 'ChatViewProvider');
    expect(provider?.props.find(p => p.name === 'status')?.defaultValue).toBe('ready');
  });

  it('Input props exclude attributes declared only in @types/react', () => {
    const { mainProps } = parseComponentProps(project, path.join(COMPONENTS_DIR, 'Input'), 'Input');
    const names = mainProps.map(p => p.name);
    expect(names).not.toContain('onCopy');
    expect(names).not.toContain('autoCapitalize');
    expect(names).not.toContain('accessKey');
    expect(names).toContain('placeholder');
  });

  it('falls back to the first call-signature parameter when <Name>Props is not exported', () => {
    const { mainProps } = parseComponentProps(project, path.join(COMPONENTS_DIR, 'Kbd'), 'Kbd');
    expect(mainProps.map(p => p.name)).toContain('size');
  });

  it('detects sub-components that export no *Props type', () => {
    const sub = (name: string) =>
      parseComponentProps(project, path.join(COMPONENTS_DIR, name), name).subComponents.map(
        s => s.name,
      );
    expect(sub('Dialog')).toEqual(
      expect.arrayContaining(['DialogContent', 'DialogHeader', 'DialogFooter']),
    );
    expect(sub('Table')).toEqual(expect.arrayContaining(['TableActionBar', 'TableEmptyState']));
    expect(sub('Toast')).toEqual(expect.arrayContaining(['Toaster', 'ToastActions']));
    expect(sub('Toast')).not.toContain('toast');
  });

  it('keeps wrapped-element attributes and own props that share a DOM name', () => {
    const link = parseComponentProps(project, path.join(COMPONENTS_DIR, 'Link'), 'Link');
    expect(link.mainProps.map(p => p.name)).toContain('download');
    const avatar = parseComponentProps(project, path.join(COMPONENTS_DIR, 'Avatar'), 'Avatar');
    expect(avatar.mainProps.map(p => p.name)).toEqual(expect.arrayContaining(['size']));
  });

  it('keeps an inherited-only prop that has a destructured default', () => {
    const dir = path.join(COMPONENTS_DIR, 'ZzDefaulted');
    project.createSourceFile(
      `${dir}/index.ts`,
      "export { ZzDefaulted, type ZzDefaultedProps } from './ZzDefaulted';",
      { overwrite: true },
    );
    project.createSourceFile(
      `${dir}/ZzDefaulted.tsx`,
      `import type { ComponentProps, FC } from 'react';
export type ZzDefaultedProps = ComponentProps<'div'>;
export const ZzDefaulted: FC<ZzDefaultedProps> = ({ draggable = true, accessKey }) => null;`,
      { overwrite: true },
    );
    const names = parseComponentProps(project, dir, 'ZzDefaulted').mainProps.map(p => p.name);
    expect(names).toContain('draggable');
    expect(names).not.toContain('accessKey');
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
