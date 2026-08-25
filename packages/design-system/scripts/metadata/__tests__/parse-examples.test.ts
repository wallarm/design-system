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

    it('Basic takes its description from the JSDoc above the export', () => {
      const basic = examples.find(e => e.name === 'Basic')!;
      // Deliberately not asserting the sentence itself — see the fixture block
      // below. This only proves the JSDoc reaches `description` for a real
      // component, which is what the parser is responsible for.
      expect(typeof basic.description).toBe('string');
      expect(basic.description).not.toBe('');
      expect(basic.description).not.toBe(basic.name);
    });

    it('Scrollable is included', () => {
      const scrollable = examples.find(e => e.name === 'Scrollable');
      expect(scrollable).toBeDefined();
    });
  });

  /**
   * Description resolution is tested against a fixture, not a shipped story file.
   *
   * These cases used to assert the exact prose of two `Dialog` stories, which
   * coupled a parser test to editorial copy: every documentation edit broke the
   * suite, and one of the two assertions was pinned to a JSDoc line that merely
   * restated its own story name. The fixture also keeps the precedence case
   * meaningful — no story file in the library uses the `.parameters` form any
   * more, so nothing real can exercise "JSDoc wins" any longer.
   */
  describe('description sources (fixture)', () => {
    const FIXTURE = `
import type { Meta, StoryFn } from 'storybook-react-rsbuild';

const meta = {} satisfies Meta<unknown>;
export default meta;

/** Documented with JSDoc. */
export const FromJsDoc: StoryFn = () => null;

export const FromParameters: StoryFn = () => null;
FromParameters.parameters = { docs: { description: { story: 'Documented with parameters.' } } };

/** JSDoc wins. */
export const HasBoth: StoryFn = () => null;
HasBoth.parameters = { docs: { description: { story: 'Parameters lose.' } } };

export const HasNeither: StoryFn = () => null;
`;

    const fixtureProject = new Project({ useInMemoryFileSystem: true });
    fixtureProject.createSourceFile('/fixture/Fixture.stories.tsx', FIXTURE);
    const examples = parseExamples(fixtureProject, '/fixture', 'Fixture');
    const byName = (name: string) => examples.find(e => e.name === name)!;

    it('extracts every exported story', () => {
      expect(examples.map(e => e.name)).toEqual([
        'FromJsDoc',
        'FromParameters',
        'HasBoth',
        'HasNeither',
      ]);
    });

    it('reads a description from JSDoc', () => {
      expect(byName('FromJsDoc').description).toBe('Documented with JSDoc.');
    });

    it('reads a description from a .parameters assignment', () => {
      expect(byName('FromParameters').description).toBe('Documented with parameters.');
    });

    it('prefers JSDoc when a story carries both', () => {
      expect(byName('HasBoth').description).toBe('JSDoc wins.');
    });

    it('leaves description unset when a story carries neither', () => {
      expect(byName('HasNeither').description).toBeUndefined();
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
