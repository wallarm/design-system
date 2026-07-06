import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { InlineEdit } from './InlineEdit';
import { InlineEditControl } from './InlineEditControl';
import { InlineEditInput } from './InlineEditInput';
import { InlineEditNumber } from './InlineEditNumber';
import { InlineEditTextarea } from './InlineEditTextarea';

describe('InlineEditInput', () => {
  it('binds the draft value and updates it on typing', async () => {
    const onChange = vi.fn();
    render(
      <InlineEdit defaultEdit defaultValue='ab' onValueChange={onChange} data-testid='attr'>
        <InlineEditControl>
          <InlineEditInput />
        </InlineEditControl>
      </InlineEdit>,
    );
    const input = screen.getByTestId('attr--input') as HTMLInputElement;
    expect(input.value).toBe('ab');
    await userEvent.type(input, 'c');
    expect(onChange).toHaveBeenLastCalledWith('abc');
  });

  it('forwards arbitrary data-* to the real input node (metrics)', () => {
    render(
      <InlineEdit defaultEdit defaultValue='ab' data-testid='attr'>
        <InlineEditControl>
          <InlineEditInput data-analytics-id='ATTR_INPUT' />
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--input')).toHaveAttribute('data-analytics-id', 'ATTR_INPUT');
  });

  it('marks the input invalid when the edit is in error', () => {
    render(
      <InlineEdit defaultEdit defaultValue='ab' status='error' data-testid='attr'>
        <InlineEditControl>
          <InlineEditInput />
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--input')).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('InlineEditTextarea', () => {
  it('forwards arbitrary data-* to the real textarea node (metrics)', () => {
    render(
      <InlineEdit defaultEdit defaultValue='ab' data-testid='attr'>
        <InlineEditControl>
          <InlineEditTextarea data-analytics-id='ATTR_TEXTAREA' />
        </InlineEditControl>
      </InlineEdit>,
    );
    const node = screen.getByTestId('attr--input');
    expect(node.tagName).toBe('TEXTAREA');
    expect(node).toHaveAttribute('data-analytics-id', 'ATTR_TEXTAREA');
  });
});

describe('InlineEditNumber', () => {
  // Documented closed-target gap: NumberInput forwards consumer props to its
  // Ark `Root` wrapper, not the inner `<input>`. Click analytics still resolve
  // via `closest('[data-analytics-id]')`, but the attribute is not on the real
  // focusable node. See ANALYTICS_GAPS.md — the durable fix lives in NumberInput.
  it('forwards arbitrary data-* (currently to the NumberInput wrapper)', () => {
    render(
      <InlineEdit defaultEdit defaultValue='8443' data-testid='attr'>
        <InlineEditControl>
          <InlineEditNumber data-analytics-id='ATTR_NUMBER' />
        </InlineEditControl>
      </InlineEdit>,
    );
    expect(screen.getByTestId('attr--input')).toHaveAttribute('data-analytics-id', 'ATTR_NUMBER');
  });
});
