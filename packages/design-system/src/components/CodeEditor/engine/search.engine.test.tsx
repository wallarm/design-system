import { searchPanelOpen } from '@codemirror/search';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { engineOptions } from '../../../testUtils/codeEditorEngine';
import { PortalOutlet } from '../lib/PortalOutlet';
import { createPortalRegistry } from '../lib/portalRegistry';
import { createEditor } from './index';
import type { EditorHandle, EngineOptions } from './types';

const handles: EditorHandle[] = [];

const mountWithPortals = (overrides: Partial<EngineOptions> = {}) => {
  const portals = createPortalRegistry();
  const { container } = render(<PortalOutlet registry={portals} />);
  let options = engineOptions({ value: 'foo bar foo', testId: 'editor', ...overrides });
  let handle: EditorHandle | undefined;
  act(() => {
    handle = createEditor(container, options, {
      onChange: vi.fn(),
      onDiagnosticsChange: vi.fn(),
      onVisibleRowCountChange: vi.fn(),
      portals,
    });
  });
  if (!handle) throw new Error('editor not created');
  const created = handle;
  handles.push(created);
  const rerender = (next: Partial<EngineOptions>) => {
    options = { ...options, ...next };
    act(() => created.update(options));
  };
  return { handle: created, rerender };
};

afterEach(() => {
  for (const handle of handles.splice(0)) act(() => handle.destroy());
});

describe('createEditor — search wiring', () => {
  it('api.openSearch renders the DS search panel', () => {
    const { handle } = mountWithPortals();

    act(() => handle.api.openSearch());

    expect(screen.getByTestId('editor--search')).toBeInTheDocument();
    expect(screen.getByTestId('editor--search-input')).toHaveFocus();
    expect(searchPanelOpen(handle.view.state)).toBe(true);
  });

  it('Mod-F in the editor opens the panel (searchKeymap)', async () => {
    const user = userEvent.setup();
    const { handle } = mountWithPortals();
    act(() => handle.api.focus());

    await user.keyboard('{Control>}f{/Control}');

    expect(screen.getByTestId('editor--search')).toBeInTheDocument();
  });

  it('a readOnly change reconfigures the open panel without closing it', () => {
    const { handle, rerender } = mountWithPortals();
    act(() => handle.api.openSearch());
    expect(screen.getByTestId('editor--replace-input')).toBeInTheDocument();

    rerender({ readOnly: true });

    expect(searchPanelOpen(handle.view.state)).toBe(true);
    expect(screen.getByTestId('editor--search-input')).toBeInTheDocument();
    expect(screen.queryByTestId('editor--replace-input')).not.toBeInTheDocument();
  });

  it.each(['button', 'Escape'] as const)(
    'does not focus readOnly content when search closes via %s',
    async method => {
      const user = userEvent.setup();
      const { handle } = mountWithPortals({ readOnly: true });
      act(() => handle.api.openSearch());

      if (method === 'button') {
        await user.click(screen.getByTestId('editor--search-close'));
      } else {
        await user.keyboard('{Escape}');
      }

      expect(searchPanelOpen(handle.view.state)).toBe(false);
      expect(document.activeElement).not.toBe(handle.view.contentDOM);
    },
  );

  it('a testId change re-derives the panel test ids', () => {
    const { handle, rerender } = mountWithPortals();
    act(() => handle.api.openSearch());

    rerender({ testId: 'other' });

    expect(screen.getByTestId('other--search')).toBeInTheDocument();
    expect(screen.queryByTestId('editor--search')).not.toBeInTheDocument();
  });
});
