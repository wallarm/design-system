import { createElement } from 'react';
import { Compartment, EditorState, type Extension } from '@codemirror/state';
import { EditorView, gutter } from '@codemirror/view';
import { afterEach, describe, expect, it } from '@rstest/core';
import type { LineConfig } from '../../CodeSnippet/CodeSnippetContext';
import { createPortalRegistry, type PortalRegistry } from '../lib/portalRegistry';
import { guttersExtension, PREFIX_GUTTER_CLASS, STICK_GUTTER_CLASS } from './gutters';

interface Options {
  lines?: Record<number, LineConfig>;
  startingLineNumber?: number;
  lineNumbers?: boolean;
  foldGutter?: Extension | null;
  portals?: PortalRegistry;
}

let view: EditorView | null = null;
afterEach(() => {
  view?.destroy();
  view = null;
});

const extensionFor = (options: Options, portals: PortalRegistry): Extension =>
  guttersExtension({
    lines: options.lines ?? {},
    startingLineNumber: options.startingLineNumber ?? 1,
    lineNumbers: options.lineNumbers ?? false,
    foldGutter: options.foldGutter ?? null,
    portals,
    testId: undefined,
  });

const mount = (doc: string, options: Options, compartment?: Compartment): EditorView => {
  const portals = options.portals ?? createPortalRegistry();
  const extension = extensionFor(options, portals);
  view = new EditorView({
    state: EditorState.create({
      doc,
      extensions: compartment ? compartment.of(extension) : extension,
    }),
    parent: document.body,
  });
  return view;
};

/** Gutter cells without CM's hidden width spacer. */
const cells = (editor: EditorView, gutterClass: string): HTMLElement[] =>
  Array.from(
    editor.dom.querySelectorAll<HTMLElement>(`.cm-gutter.${gutterClass} > .cm-gutterElement`),
  ).filter(cell => cell.style.visibility !== 'hidden');

describe('guttersExtension', () => {
  it('renders no gutters when nothing needs one', () => {
    const editor = mount('a\nb', { lines: { 1: { className: 'x' } } });
    expect(editor.dom.querySelector('.cm-gutters')).toBeNull();
  });

  it('renders no colour stick when no line has a colour', () => {
    const editor = mount('a\nb', { lineNumbers: true });
    expect(editor.dom.querySelector(`.${STICK_GUTTER_CLASS}`)).toBeNull();
    expect(editor.dom.querySelector('.cm-lineNumbers')).not.toBeNull();
  });

  it('orders gutters: colour stick, line numbers, fold, prefix', () => {
    const editor = mount('a\nb\nc', {
      lines: { 1: { color: 'danger' }, 2: { prefix: '+' } },
      lineNumbers: true,
      foldGutter: gutter({ class: 'test-fold-gutter' }),
    });
    const order = Array.from(editor.dom.querySelectorAll('.cm-gutters > .cm-gutter')).map(element =>
      [STICK_GUTTER_CLASS, 'cm-lineNumbers', 'test-fold-gutter', PREFIX_GUTTER_CLASS].find(cls =>
        element.classList.contains(cls),
      ),
    );
    expect(order).toEqual([
      STICK_GUTTER_CLASS,
      'cm-lineNumbers',
      'test-fold-gutter',
      PREFIX_GUTTER_CLASS,
    ]);
  });

  it('formats line numbers with the startingLineNumber offset', () => {
    const editor = mount('a\nb\nc', { lineNumbers: true, startingLineNumber: 10 });
    expect(cells(editor, 'cm-lineNumbers').map(cell => cell.textContent)).toEqual([
      '10',
      '11',
      '12',
    ]);
  });

  it('draws the colour stick with the line border colour and transparent elsewhere', () => {
    const editor = mount('a\nb\nc', { lines: { 11: { color: 'danger' } }, startingLineNumber: 10 });
    const [first, second] = cells(editor, STICK_GUTTER_CLASS);
    expect(first?.className).toContain('border-l-2');
    expect(first?.className).toContain('pl-12');
    expect(first?.className).toContain('border-transparent');
    expect(second?.className).toContain('border-syntax-highlight-error-indicator');
    expect(second?.className).toContain('bg-syntax-highlight-error-highlight');
  });

  it('applies the line colour background to every gutter cell and text colour to its number', () => {
    const editor = mount('a\nb', {
      lines: { 2: { color: 'info' } },
      lineNumbers: true,
      foldGutter: gutter({ class: 'test-fold-gutter' }),
    });
    const numbers = cells(editor, 'cm-lineNumbers');
    expect(numbers[0]?.className).not.toContain('bg-syntax-highlight-info-highlight');
    expect(numbers[1]?.className).toContain('bg-syntax-highlight-info-highlight');
    expect(numbers[1]?.className).toContain('text-syntax-highlight-info-code');
    expect(cells(editor, 'test-fold-gutter')[0]?.className).toContain(
      'bg-syntax-highlight-info-highlight',
    );
  });

  it('keeps gutter colours on the absolute line after an edit', () => {
    const editor = mount('a\nb', { lines: { 2: { color: 'info' } }, lineNumbers: true });
    editor.dispatch({ changes: { from: 0, insert: 'x\n' } });
    const numbers = cells(editor, 'cm-lineNumbers');
    expect(numbers[1]?.className).toContain('bg-syntax-highlight-info-highlight');
    expect(numbers[2]?.className).not.toContain('bg-syntax-highlight-info-highlight');
  });

  it('renders string prefixes as text without portals', () => {
    const portals = createPortalRegistry();
    const editor = mount('a\nb', { lines: { 2: { prefix: '+', color: 'success' } }, portals });
    const prefixCells = cells(editor, PREFIX_GUTTER_CLASS);
    expect(prefixCells).toHaveLength(1);
    expect(prefixCells[0]?.textContent).toBe('+');
    expect(prefixCells[0]?.className).toContain('px-8');
    expect(prefixCells[0]?.className).toContain('text-center');
    expect(prefixCells[0]?.className).toContain('text-syntax-highlight-success-code');
    expect(portals.getSnapshot()).toHaveLength(0);
  });

  it('registers ReactNode prefixes in the portal registry and unregisters on destroy', () => {
    const portals = createPortalRegistry();
    const node = createElement('strong', null, '!');
    const editor = mount('a\nb', { lines: { 1: { prefix: node } }, portals });

    const entries = portals.getSnapshot();
    expect(entries).toHaveLength(1);
    expect(entries[0]?.node).toBe(node);
    expect(cells(editor, PREFIX_GUTTER_CLASS)[0]?.contains(entries[0]?.host ?? null)).toBe(true);

    editor.destroy();
    view = null;
    expect(portals.getSnapshot()).toHaveLength(0);
  });

  it('unregisters ReactNode prefixes when the gutters are reconfigured away', () => {
    const portals = createPortalRegistry();
    const compartment = new Compartment();
    const editor = mount(
      'a\nb',
      { lines: { 1: { prefix: createElement('em', null, '*') } }, portals },
      compartment,
    );
    expect(portals.getSnapshot()).toHaveLength(1);

    editor.dispatch({
      effects: compartment.reconfigure(extensionFor({ lineNumbers: true }, portals)),
    });
    expect(portals.getSnapshot()).toHaveLength(0);
  });

  it('does not re-register a ReactNode prefix on unrelated updates', () => {
    const portals = createPortalRegistry();
    const editor = mount('a\nb', {
      lines: { 1: { prefix: createElement('em', null, '*') } },
      portals,
    });
    const [before] = portals.getSnapshot();
    editor.dispatch({ changes: { from: 3, insert: 'c' } });
    const after = portals.getSnapshot();
    expect(after).toHaveLength(1);
    expect(after[0]?.id).toBe(before?.id);
  });

  it('leaves no portal entries after destroying an editor with 1000 ReactNode prefixes', () => {
    const portals = createPortalRegistry();
    const doc = Array.from({ length: 1000 }, (_, index) => `line ${index}`).join('\n');
    const lines: Record<number, LineConfig> = {};
    for (let line = 1; line <= 1000; line++) {
      lines[line] = { prefix: createElement('i', null, '+') };
    }
    const editor = mount(doc, { lines, portals });
    expect(portals.getSnapshot().length).toBeGreaterThan(0);

    editor.destroy();
    view = null;
    expect(portals.getSnapshot()).toHaveLength(0);
  });
});
