import path from 'path';
import { Project } from 'ts-morph';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';
import { parseExamples } from '../parse-examples.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');
const tsconfigPath = path.join(ROOT, 'tsconfig.app.json');
const project = new Project({ tsConfigFilePath: tsconfigPath });
const componentsDir = path.join(ROOT, 'src/components');

describe('parseExamples', () => {
  describe('Button (StoryFn pattern)', () => {
    const examples = parseExamples(project, path.join(componentsDir, 'Button'), 'Button');

    it('extracts all stories', () => {
      expect(examples.length).toBe(10);
      const names = examples.map(e => e.name);
      expect(names).toEqual([
        'Basic',
        'Variants',
        'Sizes',
        'Disabled',
        'Loading',
        'Icons',
        'Badge',
        'IconOnly',
        'LinkAsButton',
        'FullWidth',
      ]);
    });

    it('Basic contains JSX with <Button', () => {
      const basic = examples.find(e => e.name === 'Basic')!;
      expect(basic.code).toContain('<Button');
    });

    it('code does not contain StoryFn type annotation', () => {
      const basic = examples.find(e => e.name === 'Basic')!;
      expect(basic.code).not.toContain('StoryFn');
    });
  });

  describe('Badge (all stories including showcase)', () => {
    const examples = parseExamples(project, path.join(componentsDir, 'Badge'), 'Badge');

    it('includes ColorVariants, MutedVariants, ContentVariants', () => {
      const names = examples.map(e => e.name);
      expect(names).toContain('ColorVariants');
      expect(names).toContain('MutedVariants');
      expect(names).toContain('ContentVariants');
    });

    it('extracts all Badge stories', () => {
      expect(examples.length).toBeGreaterThanOrEqual(11);
    });
  });

  describe('Dialog (JSDoc descriptions)', () => {
    const examples = parseExamples(project, path.join(componentsDir, 'Dialog'), 'Dialog');

    it('Controlled contains useState', () => {
      const controlled = examples.find(e => e.name === 'Controlled')!;
      expect(controlled).toBeDefined();
      expect(controlled.code).toContain('useState');
    });

    it('Basic has description from JSDoc', () => {
      const basic = examples.find(e => e.name === 'Basic')!;
      expect(basic.description).toBe('Basic uncontrolled dialog');
    });

    it('Scrollable is included', () => {
      const scrollable = examples.find(e => e.name === 'Scrollable');
      expect(scrollable).toBeDefined();
    });

    it('WithFooterLeftActions has description from JSDoc (priority over .parameters)', () => {
      const story = examples.find(e => e.name === 'WithFooterLeftActions')!;
      expect(story.description).toBe('With footer left actions');
    });
  });

  describe('Alert (WithCloseButton uses useState)', () => {
    const examples = parseExamples(project, path.join(componentsDir, 'Alert'), 'Alert');

    it('WithCloseButton contains useState', () => {
      const story = examples.find(e => e.name === 'WithCloseButton')!;
      expect(story).toBeDefined();
      expect(story.code).toContain('useState');
    });
  });

  describe('Input (StoryObj pattern)', () => {
    const examples = parseExamples(project, path.join(componentsDir, 'Input'), 'Input');

    it('extracts stories', () => {
      expect(examples.length).toBeGreaterThan(0);
    });

    it('Disabled reconstructs JSX with disabled prop', () => {
      const disabled = examples.find(e => e.name === 'Disabled')!;
      expect(disabled).toBeDefined();
      expect(disabled.code).toContain('<Input');
      expect(disabled.code).toContain('disabled');
    });
  });

  describe('ThemeProvider (no stories)', () => {
    it('returns empty array', () => {
      const examples = parseExamples(
        project,
        path.join(componentsDir, 'ThemeProvider'),
        'ThemeProvider',
      );
      expect(examples).toEqual([]);
    });
  });
});
