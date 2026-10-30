import { createRef } from 'react';
import { describe, expect, it } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { WallySkeleton } from '.';

describe('WallySkeleton', () => {
  it('exposes one named loading status without interactive chat controls', () => {
    const { container } = render(<WallySkeleton />);

    expect(screen.getByRole('status', { name: 'Loading Wally' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(screen.queryByRole('region')).toBeNull();
    expect(screen.queryByRole('log')).toBeNull();
    expect(
      container.querySelector('button, input, textarea, select, a[href], [tabindex]'),
    ).toBeNull();
    expect(container.querySelector('[data-testid]')).toBeNull();
  });

  it('forwards the ref and native attributes to the loading surface', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <WallySkeleton
        ref={ref}
        data-testid='loading'
        id='assistant-loading'
        className='rounded-16'
        aria-label='Loading assistant'
        data-analytics-id='assistant-loading'
      />,
    );

    const root = screen.getByRole('status', { name: 'Loading assistant' });
    expect(ref.current).toBe(root);
    expect(screen.getByTestId('loading')).toBe(root);
    expect(root).toHaveAttribute('id', 'assistant-loading');
    expect(root).toHaveAttribute('data-analytics-id', 'assistant-loading');
    expect(root).toHaveClass('rounded-16');
    expect(screen.getByTestId('loading--chat')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('loading--chat--header')).toBeInTheDocument();
    expect(screen.getByTestId('loading--chat--body')).toBeInTheDocument();
    expect(screen.getByTestId('loading--chat--footer')).toBeInTheDocument();
  });
});
