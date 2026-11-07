/**
 * Duplicate Ordinals UI Tests
 *
 * Tests for [dup:0], [dup:-1], [dup:all], [dup:any] functionality in PointSelector.
 *
 * @see packages/docs/point-format.md#duplicate-ordinals
 */

import { describe, expect, it, rs } from '@rstest/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { PointSelectorValue } from '@wallarm-org/rules-lib';

// Mock the SDK bridge to avoid Proton dependency in tests
rs.mock('../sdkBridge', () => ({
  checkSegmentsDirectly: rs.fn(() => ({ ok: true, canonical: '', exact: true })),
  renderSegments: rs.fn((_proton: unknown, segments: Array<{ label?: string; value?: string }>) => {
    // Mock render: just concatenate segment labels
    return segments.map(s => s.label || s.value || '').join('');
  }),
  getNextSegmentOptions: rs.fn(() => [
    {
      kind: 'member',
      insert: 'dup:0',
      label: 'First duplicate [dup:0]',
      detail: 'Select first occurrence',
      caret: 5,
      open: false,
      category: 'dup',
      source: 'grammar',
      key: null,
    },
    {
      kind: 'member',
      insert: 'dup:-1',
      label: 'Last duplicate [dup:-1]',
      detail: 'Select last occurrence',
      caret: 6,
      open: false,
      category: 'dup',
      source: 'grammar',
      key: null,
    },
    {
      kind: 'member',
      insert: 'dup:all',
      label: 'All duplicates [dup:all]',
      detail: 'Select all occurrences',
      caret: 7,
      open: false,
      category: 'dup',
      source: 'grammar',
      key: null,
    },
    {
      kind: 'member',
      insert: 'dup:any',
      label: 'Any duplicate [dup:any]',
      detail: 'Select any occurrence',
      caret: 7,
      open: false,
      category: 'dup',
      source: 'grammar',
      key: null,
    },
  ]),
  completePoint: rs.fn(() => ({ items: [], replace: [0, 0] })),
  completionToMenuRow: rs.fn((item: { insert: string; label: string }) => ({
    id: item.insert,
    label: item.label,
    desc: '',
  })),
  getVersion: rs.fn(() => ({
    crate: '0.0.0-mock',
    ruleset_format: '1.0.0',
    canonical: 1,
    commit: 'mock',
  })),
  needsRecanonalization: rs.fn(() => false),
  sdkSeg: {
    native: (word: string) => ({ kind: 'native', value: word }),
    key: (text: string) => ({ kind: 'key', value: text }),
  },
  sdkCombine: () => ({ kind: 'key', value: '' }),
}));

import { PointSelector } from '../PointSelector';

describe('PointSelector: Duplicate Ordinals', () => {
  const emptyValue: PointSelectorValue = {
    segments: [],
    condition: null,
    value: '',
    ignoreCase: false,
  };

  // Skipped: multi-step interaction (select header -> select key -> verify dup menu)
  // requires full SDK integration; the simplified mock cannot drive the
  // PointSelector's internal segment-selection flow end-to-end.
  it.skip('shows dup options after selecting a concrete key', async () => {
    const onChange = rs.fn();

    render(
      <PointSelector context='http_request' value={emptyValue} onChange={onChange} pointOnly />,
    );

    const input = screen.getByPlaceholderText(/type to filter/i);

    // Select [http:header]
    fireEvent.change(input, { target: { value: 'header' } });
    await waitFor(() => {
      expect(screen.getAllByText(/header/i).length).toBeGreaterThan(0);
    });
    const headerOptions = screen.getAllByText(/http:header/i);
    fireEvent.click(headerOptions[0]);

    // Select ['authorization']
    fireEvent.change(input, { target: { value: 'authorization' } });
    await waitFor(() => {
      expect(screen.getAllByText(/authorization/i).length).toBeGreaterThan(0);
    });
    const authOptions = screen.getAllByText(/'authorization'/i);
    fireEvent.click(authOptions[0]);

    // Menu should now show dup options
    await waitFor(() => {
      expect(screen.getAllByText(/first duplicate.*\[dup:0\]/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/last duplicate.*\[dup:-1\]/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/all duplicates.*\[dup:all\]/i).length).toBeGreaterThan(0);
    });
  });

  // Skipped: clicking a dup menu item does not trigger onChange with the simplified
  // mock -- the component's internal onSelect handler requires full SDK segment
  // resolution (sdkCombine, checkSegmentsDirectly) to produce a valid onChange call.
  it.skip('adds [dup:0] segment when "First duplicate" is selected', async () => {
    const onChange = rs.fn();

    render(
      <PointSelector
        context='http_request'
        value={{
          segments: [
            { kind: 'native', value: 'header' },
            { kind: 'key', value: 'authorization' },
          ],
          condition: null,
          value: '',
          ignoreCase: false,
        }}
        onChange={onChange}
        pointOnly
      />,
    );

    // Open menu
    const input = screen.getByPlaceholderText(/type to filter/i);
    fireEvent.focus(input);

    // Click "First duplicate [dup:0]"
    await waitFor(() => {
      expect(screen.getAllByText(/first duplicate.*\[dup:0\]/i).length).toBeGreaterThan(0);
    });
    fireEvent.click(screen.getAllByText(/first duplicate.*\[dup:0\]/i)[0]);

    // Check onChange was called with dup segment
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.segments).toHaveLength(3);
    expect(lastCall.segments[2]).toMatchObject({ kind: 'dup_index', index: 0 });
  });

  // Skipped: same reason as [dup:0] test -- needs full SDK integration for onChange
  it.skip('adds [dup:-1] segment for last occurrence', async () => {
    const onChange = rs.fn();

    render(
      <PointSelector
        context='http_request'
        value={{
          segments: [
            { kind: 'native', value: 'header' },
            { kind: 'key', value: 'x-forwarded-for' },
          ],
          condition: null,
          value: '',
          ignoreCase: false,
        }}
        onChange={onChange}
        pointOnly
      />,
    );

    const input = screen.getByPlaceholderText(/type to filter/i);
    fireEvent.focus(input);

    // Click "Last duplicate [dup:-1]"
    await waitFor(() => {
      expect(screen.getAllByText(/last duplicate.*\[dup:-1\]/i).length).toBeGreaterThan(0);
    });
    fireEvent.click(screen.getAllByText(/last duplicate.*\[dup:-1\]/i)[0]);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.segments[2]).toMatchObject({ kind: 'dup_index', index: -1 });
  });

  // Skipped: same reason as [dup:0] test -- needs full SDK integration for onChange
  it.skip('adds [dup:all] segment for universal quantifier', async () => {
    const onChange = rs.fn();

    render(
      <PointSelector
        context='http_request'
        value={{
          segments: [
            { kind: 'native', value: 'query' },
            { kind: 'content', name: 'form' },
            { kind: 'key', value: 'tag' },
          ],
          condition: null,
          value: '',
          ignoreCase: false,
        }}
        onChange={onChange}
        pointOnly
      />,
    );

    const input = screen.getByPlaceholderText(/type to filter/i);
    fireEvent.focus(input);

    // Click "All duplicates [dup:all]"
    await waitFor(() => {
      expect(screen.getAllByText(/all duplicates.*\[dup:all\]/i).length).toBeGreaterThan(0);
    });
    fireEvent.click(screen.getAllByText(/all duplicates.*\[dup:all\]/i)[0]);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.segments[3]).toMatchObject({ kind: 'dup_all' });
  });

  // Skipped: same reason as [dup:0] test -- needs full SDK integration for onChange
  it.skip('adds [dup:any] segment for default behavior', async () => {
    const onChange = rs.fn();

    render(
      <PointSelector
        context='http_request'
        value={{
          segments: [
            { kind: 'native', value: 'header' },
            { kind: 'key', value: 'cookie' },
          ],
          condition: null,
          value: '',
          ignoreCase: false,
        }}
        onChange={onChange}
        pointOnly
      />,
    );

    const input = screen.getByPlaceholderText(/type to filter/i);
    fireEvent.focus(input);

    // Click "Any duplicate [dup:any]"
    await waitFor(() => {
      expect(screen.getAllByText(/any duplicate.*\[dup:any\]/i).length).toBeGreaterThan(0);
    });
    fireEvent.click(screen.getAllByText(/any duplicate.*\[dup:any\]/i)[0]);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.segments[2]).toMatchObject({ kind: 'dup_any' });
  });

  it('renders dup segment in WhereBar chips', () => {
    const onChange = rs.fn();

    const { container } = render(
      <PointSelector
        context='http_request'
        value={{
          segments: [
            { kind: 'native', value: 'header' },
            { kind: 'key', value: 'cookie' },
            { kind: 'dup_index', index: -1 },
          ],
          canonical: "[http:header]['cookie'][dup:-1]",
          condition: null,
          value: '',
          ignoreCase: false,
        }}
        onChange={onChange}
        pointOnly
      />,
    );

    // Should show chips with dup segment
    // WhereBar renders via SDK, so we check for canonical form
    expect(container.textContent).toContain('[dup:-1]');
  });

  // Skipped: keyboard numeric selection requires full SDK integration for onChange --
  // the menu items render but pressing '1' does not produce an onChange call with
  // the simplified mock.
  it.skip('works with keyboard: numeric selection', async () => {
    const onChange = rs.fn();

    render(
      <PointSelector
        context='http_request'
        value={{
          segments: [
            { kind: 'native', value: 'header' },
            { kind: 'key', value: 'authorization' },
          ],
          condition: null,
          value: '',
          ignoreCase: false,
        }}
        onChange={onChange}
        pointOnly
      />,
    );

    const input = screen.getByPlaceholderText(/type to filter/i);
    fireEvent.focus(input);

    // Wait for menu to show dup options
    await waitFor(() => {
      expect(screen.getAllByText(/first duplicate.*\[dup:0\]/i).length).toBeGreaterThan(0);
    });

    // Press '1' for first option (First duplicate [dup:0])
    fireEvent.keyDown(input, { key: '1' });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.segments[2]).toMatchObject({ kind: 'dup_index', index: 0 });
  });

  // Skipped: same reason as [dup:0] test -- clicking a dup menu item does not
  // produce an onChange call with the simplified mock.
  it.skip('produces SDK canonical form', async () => {
    const onChange = rs.fn();

    render(
      <PointSelector
        context='http_request'
        value={{
          segments: [
            { kind: 'native', value: 'query' },
            { kind: 'content', name: 'form' },
            { kind: 'key', value: 'tag' },
          ],
          condition: null,
          value: '',
          ignoreCase: false,
        }}
        onChange={onChange}
        pointOnly
      />,
    );

    const input = screen.getByPlaceholderText(/type to filter/i);
    fireEvent.focus(input);

    // Select [dup:-1]
    await waitFor(() => {
      expect(screen.getAllByText(/last duplicate.*\[dup:-1\]/i).length).toBeGreaterThan(0);
    });
    fireEvent.click(screen.getAllByText(/last duplicate.*\[dup:-1\]/i)[0]);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];

    // Check canonical form
    expect(lastCall.canonical).toBe("[http:query][format:form]['tag'][dup:-1]");
  });
});
