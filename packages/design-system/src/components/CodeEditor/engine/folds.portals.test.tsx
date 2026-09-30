import { Compartment, EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { FoldRegion } from '../../CodeSnippet/lib/foldUtils';
import { PortalOutlet } from '../lib/PortalOutlet';
import { createPortalRegistry } from '../lib/portalRegistry';
import { foldsExtension, getCollapsedFoldIds } from './folds';

const views: EditorView[] = [];

const CODE = ['function test() {', '  return true;', '}'].join('\n');

const setup = (folds: FoldRegion[]) => {
  const portals = createPortalRegistry();
  const { container } = render(<PortalOutlet registry={portals} />);
  const { extension, gutter } = foldsExtension({
    folds,
    startingLineNumber: 1,
    portals,
    testId: 'editor',
  });
  let view: EditorView | undefined;
  act(() => {
    view = new EditorView({
      state: EditorState.create({ doc: CODE, extensions: [extension, gutter ?? []] }),
      parent: container,
    });
  });
  if (!view) throw new Error('view not created');
  views.push(view);
  return { view, portals };
};

afterEach(() => {
  for (const view of views.splice(0)) act(() => view.destroy());
});

describe('folds — portal-rendered toggle and summary', () => {
  it('renders the DS fold toggle with a derived test id and aria-label', async () => {
    const { view } = setup([{ id: 'body', startLine: 1, endLine: 3, label: 'Body' }]);

    const toggle = screen.getByTestId('editor--fold-toggle');
    expect(toggle.tagName).toBe('BUTTON');
    expect(toggle).toHaveAttribute('aria-label', 'Collapse Body');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(toggle);

    expect(getCollapsedFoldIds(view.state).has('body')).toBe(true);
    expect(screen.getByTestId('editor--fold-toggle')).toHaveAttribute('aria-label', 'Expand Body');
    expect(screen.getByTestId('editor--fold-summary')).toHaveTextContent('Body');
  });

  it('expands a collapsed region when its summary is clicked', async () => {
    const { view } = setup([
      { id: 'body', startLine: 1, endLine: 3, label: 'Body', defaultCollapsed: true },
    ]);

    const summary = screen.getByTestId('editor--fold-summary');
    expect(summary).toHaveAttribute('aria-label', 'Collapsed region: Body, 3 lines');

    await userEvent.click(summary);

    expect(getCollapsedFoldIds(view.state).size).toBe(0);
    expect(screen.queryByTestId('editor--fold-summary')).not.toBeInTheDocument();
  });

  it('forwards toggleProps to the real toggle button and composes onClick', async () => {
    const onClick = vi.fn();
    const payload = '{"feature":"code","target":"fold-toggle"}';
    const { view } = setup([
      {
        id: 'body',
        startLine: 1,
        endLine: 3,
        toggleProps: {
          'data-testid': 'consumer-toggle',
          'data-analytics-id': 'FOLD_TOGGLE',
          'data-analytics-props': payload,
          onClick,
        },
      },
    ]);

    const toggle = screen.getByTestId('consumer-toggle');
    expect(toggle.tagName).toBe('BUTTON');
    expect(toggle).toHaveAttribute('data-analytics-id', 'FOLD_TOGGLE');
    expect(toggle).toHaveAttribute('data-analytics-props', payload);

    await userEvent.click(toggle);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(getCollapsedFoldIds(view.state).has('body')).toBe(true);
  });

  it('forwards summaryProps to the real summary button and composes onClick', async () => {
    const onClick = vi.fn();
    const payload = '{"feature":"code","target":"fold-summary"}';
    const { view } = setup([
      {
        id: 'body',
        startLine: 1,
        endLine: 3,
        defaultCollapsed: true,
        summaryProps: {
          'data-testid': 'consumer-summary',
          'data-analytics-id': 'FOLD_SUMMARY',
          'data-analytics-props': payload,
          onClick,
        },
      },
    ]);

    const summary = screen.getByTestId('consumer-summary');
    expect(summary.tagName).toBe('BUTTON');
    expect(summary).toHaveAttribute('data-analytics-id', 'FOLD_SUMMARY');
    expect(summary).toHaveAttribute('data-analytics-props', payload);

    await userEvent.click(summary);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(getCollapsedFoldIds(view.state).size).toBe(0);
  });

  it('keeps keyboard focus on the toggle when Enter toggles it', async () => {
    const user = userEvent.setup();
    const { view } = setup([{ id: 'body', startLine: 1, endLine: 3, label: 'Body' }]);
    const toggle = screen.getByTestId('editor--fold-toggle');

    act(() => toggle.focus());
    expect(document.activeElement).toBe(toggle);

    await user.keyboard('{Enter}');

    expect(getCollapsedFoldIds(view.state).has('body')).toBe(true);
    expect(document.activeElement).toBe(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-label', 'Expand Body');

    await user.keyboard('{Enter}');

    expect(getCollapsedFoldIds(view.state).size).toBe(0);
    expect(document.activeElement).toBe(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('keeps the same toggle DOM node across two toggles', async () => {
    const { view } = setup([{ id: 'body', startLine: 1, endLine: 3, label: 'Body' }]);
    const toggle = screen.getByTestId('editor--fold-toggle');

    await userEvent.click(toggle);
    expect(screen.getByTestId('editor--fold-toggle')).toBe(toggle);
    await userEvent.click(toggle);
    expect(screen.getByTestId('editor--fold-toggle')).toBe(toggle);
    expect(getCollapsedFoldIds(view.state).size).toBe(0);
  });

  it('updates the toggle in place when the region label or toggleProps change', () => {
    const portals = createPortalRegistry();
    const { container } = render(<PortalOutlet registry={portals} />);
    const compartment = new Compartment();
    const build = (folds: FoldRegion[]) =>
      foldsExtension({ folds, startingLineNumber: 1, portals, testId: 'editor' });
    const first = build([{ id: 'body', startLine: 1, endLine: 3, label: 'Body' }]);
    let view: EditorView | undefined;
    act(() => {
      view = new EditorView({
        state: EditorState.create({
          doc: CODE,
          extensions: [compartment.of([first.extension, first.gutter ?? []])],
        }),
        parent: container,
      });
    });
    if (!view) throw new Error('view not created');
    views.push(view);
    const toggle = screen.getByTestId('editor--fold-toggle');

    const next = build([
      { id: 'body', startLine: 1, endLine: 3, label: 'Payload', toggleProps: { title: 'x' } },
    ]);
    act(() => {
      view?.dispatch({ effects: compartment.reconfigure([next.extension, next.gutter ?? []]) });
    });

    const updated = screen.getByTestId('editor--fold-toggle');
    expect(updated).toBe(toggle);
    expect(updated).toHaveAttribute('aria-label', 'Collapse Payload');
    expect(updated).toHaveAttribute('title', 'x');
  });

  it('unregisters portal hosts when the view is destroyed', () => {
    const { view, portals } = setup([
      { id: 'body', startLine: 1, endLine: 3, defaultCollapsed: true },
    ]);
    expect(portals.getSnapshot().length).toBeGreaterThan(0);

    act(() => view.destroy());
    views.splice(views.indexOf(view), 1);

    expect(portals.getSnapshot()).toHaveLength(0);
  });
});
