import { closeSearchPanel, openSearchPanel, searchPanelOpen } from '@codemirror/search';
import { Compartment, EditorState } from '@codemirror/state';
import { EditorView, runScopeHandlers } from '@codemirror/view';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { PortalOutlet } from '../lib/PortalOutlet';
import { createPortalRegistry } from '../lib/portalRegistry';
import { searchExtension } from './search';

const views: EditorView[] = [];

interface SetupOptions {
  doc?: string;
  readOnly?: boolean;
  /** Defaults to 'editor'; pass `undefined` explicitly for "no test id". */
  testId?: string | undefined;
}

const setup = (options: SetupOptions = {}) => {
  const { doc = 'foo bar foo\nbaz foo', readOnly = false } = options;
  const testId = 'testId' in options ? options.testId : 'editor';
  const portals = createPortalRegistry();
  const { container } = render(<PortalOutlet registry={portals} />);
  const searchSlot = new Compartment();
  const readOnlySlot = new Compartment();
  let view: EditorView | undefined;
  act(() => {
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [
          readOnlySlot.of(EditorState.readOnly.of(readOnly)),
          searchSlot.of(searchExtension({ portals, readOnly, testId })),
        ],
      }),
      parent: container,
    });
  });
  if (!view) throw new Error('view not created');
  const created = view;
  views.push(created);
  const open = () =>
    act(() => {
      openSearchPanel(created);
    });
  const setReadOnly = (next: boolean) =>
    act(() =>
      created.dispatch({
        effects: [
          readOnlySlot.reconfigure(EditorState.readOnly.of(next)),
          searchSlot.reconfigure(searchExtension({ portals, readOnly: next, testId })),
        ],
      }),
    );
  return { view: created, portals, open, setReadOnly };
};

afterEach(() => {
  for (const view of views.splice(0)) act(() => view.destroy());
});

describe('searchExtension — panel', () => {
  it('renders the DS panel with derived test ids when opened and focuses the find input', () => {
    const { open } = setup();
    expect(screen.queryByTestId('editor--search')).not.toBeInTheDocument();

    open();

    expect(screen.getByTestId('editor--search')).toHaveAttribute('role', 'search');
    const input = screen.getByTestId('editor--search-input');
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('main-field', 'true');
    for (const slot of [
      'search-previous',
      'search-next',
      'search-case',
      'search-whole-word',
      'search-regexp',
      'search-close',
      'replace-input',
      'replace-next',
      'replace-all',
    ]) {
      expect(screen.getByTestId(`editor--${slot}`)).toBeInTheDocument();
    }
  });

  it('removes the panel from the portal registry when closed', () => {
    const { view, portals, open } = setup();
    open();
    expect(portals.getSnapshot()).toHaveLength(1);

    act(() => {
      closeSearchPanel(view);
    });

    expect(portals.getSnapshot()).toHaveLength(0);
    expect(screen.queryByTestId('editor--search')).not.toBeInTheDocument();
  });

  it('typing a query and pressing Enter selects the next match; Shift-Enter goes back', async () => {
    const user = userEvent.setup();
    const { view, open } = setup();
    open();

    await user.type(screen.getByTestId('editor--search-input'), 'foo');
    expect(screen.getByTestId('editor--search-input')).toHaveValue('foo');
    expect(screen.getByTestId('editor--search-count')).toHaveTextContent('3 matches');

    await user.keyboard('{Enter}');
    expect(view.state.selection.main).toMatchObject({ from: 0, to: 3 });

    await user.keyboard('{Enter}');
    expect(view.state.selection.main).toMatchObject({ from: 8, to: 11 });

    await user.keyboard('{Shift>}{Enter}{/Shift}');
    expect(view.state.selection.main).toMatchObject({ from: 0, to: 3 });
  });

  it('the next / previous buttons move between matches', async () => {
    const user = userEvent.setup();
    const { view, open } = setup();
    open();
    await user.type(screen.getByTestId('editor--search-input'), 'foo');

    await user.click(screen.getByTestId('editor--search-next'));
    await user.click(screen.getByTestId('editor--search-next'));
    expect(view.state.selection.main).toMatchObject({ from: 8, to: 11 });

    await user.click(screen.getByTestId('editor--search-previous'));
    expect(view.state.selection.main).toMatchObject({ from: 0, to: 3 });
  });

  it('toggles set the query flags and expose aria-pressed', async () => {
    const user = userEvent.setup();
    const { open } = setup({ doc: 'Foo foo food' });
    open();
    await user.type(screen.getByTestId('editor--search-input'), 'foo');
    expect(screen.getByTestId('editor--search-count')).toHaveTextContent('3 matches');

    await user.click(screen.getByTestId('editor--search-case'));
    expect(screen.getByTestId('editor--search-case')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('editor--search-count')).toHaveTextContent('2 matches');

    await user.click(screen.getByTestId('editor--search-whole-word'));
    expect(screen.getByTestId('editor--search-count')).toHaveTextContent('1 match');
  });

  it('replace all replaces every match', async () => {
    const user = userEvent.setup();
    const { view, open } = setup();
    open();
    await user.type(screen.getByTestId('editor--search-input'), 'foo');
    await user.type(screen.getByTestId('editor--replace-input'), 'qux');

    await user.click(screen.getByTestId('editor--replace-all'));

    expect(view.state.doc.toString()).toBe('qux bar qux\nbaz qux');
    expect(screen.getByTestId('editor--search-count')).toHaveTextContent('No matches');
  });

  it('replace replaces the selected match and moves to the next one', async () => {
    const user = userEvent.setup();
    const { view, open } = setup();
    open();
    await user.type(screen.getByTestId('editor--search-input'), 'foo');
    await user.type(screen.getByTestId('editor--replace-input'), 'qux');
    await user.click(screen.getByTestId('editor--search-next'));

    await user.click(screen.getByTestId('editor--replace-next'));

    expect(view.state.doc.toString()).toBe('qux bar foo\nbaz foo');
    expect(view.state.selection.main).toMatchObject({ from: 8, to: 11 });
  });

  it('hides the replace row when readOnly, and shows it again when readOnly turns off', () => {
    const { open, setReadOnly } = setup({ readOnly: true });
    open();
    expect(screen.getByTestId('editor--search-input')).toBeInTheDocument();
    expect(screen.queryByTestId('editor--replace-input')).not.toBeInTheDocument();
    expect(screen.queryByTestId('editor--replace-all')).not.toBeInTheDocument();

    setReadOnly(false);

    expect(screen.getByTestId('editor--replace-input')).toBeInTheDocument();
  });

  it('Escape closes the panel and is default-prevented (an enclosing fullscreen stays open)', async () => {
    const user = userEvent.setup();
    const { view, open } = setup();
    open();
    const seen: boolean[] = [];
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') seen.push(event.defaultPrevented);
    };
    document.addEventListener('keydown', onKeyDown);

    try {
      await user.keyboard('{Escape}');
    } finally {
      document.removeEventListener('keydown', onKeyDown);
    }

    expect(seen).toEqual([true]);
    expect(searchPanelOpen(view.state)).toBe(false);
    expect(screen.queryByTestId('editor--search')).not.toBeInTheDocument();
    expect(view.hasFocus).toBe(true);
  });

  it('the close button closes the panel', async () => {
    const user = userEvent.setup();
    const { view, open } = setup();
    open();

    await user.click(screen.getByTestId('editor--search-close'));

    expect(searchPanelOpen(view.state)).toBe(false);
  });

  it('announces the match count to screen readers while typing', async () => {
    const user = userEvent.setup();
    const { view, open } = setup();
    open();

    await user.type(screen.getByTestId('editor--search-input'), 'foo');

    expect(view.dom.querySelector('.cm-announced')).toHaveTextContent('3 matches');
  });

  it('announces "Invalid regular expression" instead of "No matches" for a bad regexp', async () => {
    const user = userEvent.setup();
    const { view, open } = setup();
    open();

    await user.click(screen.getByTestId('editor--search-regexp'));
    await user.type(screen.getByTestId('editor--search-input'), '[[');

    expect(view.dom.querySelector('.cm-announced')).toHaveTextContent('Invalid regular expression');
    expect(view.dom.querySelector('.cm-announced')).not.toHaveTextContent('No matches');
  });

  it('ignores Enter while an IME composition is in progress', () => {
    const { view, open } = setup();
    open();
    const input = screen.getByTestId('editor--search-input');
    act(() => {
      fireEvent.change(input, { target: { value: 'foo' } });
    });
    const before = view.state.selection.main;

    act(() => {
      fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
      fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 });
    });
    expect(view.state.selection.main).toEqual(before);

    act(() => {
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    expect(view.state.selection.main).toMatchObject({ from: 0, to: 3 });
  });

  it("does not bind Mod-Alt-g to CodeMirror's unthemed go-to-line dialog", () => {
    const { view } = setup();
    act(() => view.focus());

    const handled = runScopeHandlers(
      view,
      new KeyboardEvent('keydown', { key: 'g', ctrlKey: true, altKey: true }),
      'editor',
    );

    expect(handled).toBe(false);
    expect(view.dom.querySelector('.cm-panel:not(.cm-search)')).toBeNull();
    expect(view.dom.querySelector('.cm-goto-line, [name="line"]')).toBeNull();
  });

  it('keeps the DOM free of test ids when no testId is given', () => {
    const { open } = setup({ testId: undefined });
    open();
    const panel = screen.getByRole('search', { name: 'Find and replace' });
    expect(panel).not.toHaveAttribute('data-testid');
    expect(panel.querySelector('[data-testid]')).toBeNull();
  });
});
