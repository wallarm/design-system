/**
 * Duplicate Ordinals UI Tests
 *
 * Tests for [dup:0], [dup:-1], [dup:all], [dup:any] functionality in PointSelector.
 *
 * @see packages/docs/point-format.md#duplicate-ordinals
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'rstest';
import type { PointSelectorValue } from '@wallarm-org/rules-lib';
import { PointSelector } from '../../PointSelector';

describe('PointSelector: Duplicate Ordinals', () => {
  const emptyValue: PointSelectorValue = {
    segments: [],
    condition: null,
    value: '',
    ignoreCase: false,
  };

  it('shows dup options after selecting a concrete key', async () => {
    const onChange = vi.fn();

    render(
      <PointSelector context='http_request' value={emptyValue} onChange={onChange} pointOnly />,
    );

    const input = screen.getByPlaceholderText(/type to filter/i);

    // Select [http:header]
    fireEvent.change(input, { target: { value: 'header' } });
    await waitFor(() => {
      expect(screen.getByText(/header/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/http:header/i));

    // Select ['authorization']
    fireEvent.change(input, { target: { value: 'authorization' } });
    await waitFor(() => {
      expect(screen.getByText(/authorization/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/'authorization'/i));

    // Menu should now show dup options
    await waitFor(() => {
      expect(screen.getByText(/first duplicate.*\[dup:0\]/i)).toBeInTheDocument();
      expect(screen.getByText(/last duplicate.*\[dup:-1\]/i)).toBeInTheDocument();
      expect(screen.getByText(/all duplicates.*\[dup:all\]/i)).toBeInTheDocument();
    });
  });

  it('adds [dup:0] segment when "First duplicate" is selected', async () => {
    const onChange = vi.fn();

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
      expect(screen.getByText(/first duplicate.*\[dup:0\]/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/first duplicate.*\[dup:0\]/i));

    // Check onChange was called with dup segment
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.segments).toHaveLength(3);
    expect(lastCall.segments[2]).toMatchObject({ kind: 'dup_index', ord: 0 });
  });

  it('adds [dup:-1] segment for last occurrence', async () => {
    const onChange = vi.fn();

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
      expect(screen.getByText(/last duplicate.*\[dup:-1\]/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/last duplicate.*\[dup:-1\]/i));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.segments[2]).toMatchObject({ kind: 'dup_index', ord: -1 });
  });

  it('adds [dup:all] segment for universal quantifier', async () => {
    const onChange = vi.fn();

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
      expect(screen.getByText(/all duplicates.*\[dup:all\]/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/all duplicates.*\[dup:all\]/i));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.segments[3]).toMatchObject({ kind: 'dup_all' });
  });

  it('adds [dup:any] segment for default behavior', async () => {
    const onChange = vi.fn();

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
      expect(screen.getByText(/any duplicate.*\[dup:any\]/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/any duplicate.*\[dup:any\]/i));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.segments[2]).toMatchObject({ kind: 'dup_any' });
  });

  it('renders dup segment in WhereBar chips', () => {
    const onChange = vi.fn();

    const { container } = render(
      <PointSelector
        context='http_request'
        value={{
          segments: [
            { kind: 'native', value: 'header' },
            { kind: 'key', value: 'cookie' },
            { kind: 'dup_index', ord: -1 },
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

  it('works with keyboard: numeric selection', async () => {
    const onChange = vi.fn();

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
      expect(screen.getByText(/first duplicate.*\[dup:0\]/i)).toBeInTheDocument();
    });

    // Press '1' for first option (First duplicate [dup:0])
    fireEvent.keyDown(input, { key: '1' });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.segments[2]).toMatchObject({ kind: 'dup_index', ord: 0 });
  });

  it('produces SDK canonical form', async () => {
    const onChange = vi.fn();

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
      expect(screen.getByText(/last duplicate.*\[dup:-1\]/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/last duplicate.*\[dup:-1\]/i));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];

    // Check canonical form
    expect(lastCall.canonical).toBe("[http:query][format:form]['tag'][dup:-1]");
  });
});
