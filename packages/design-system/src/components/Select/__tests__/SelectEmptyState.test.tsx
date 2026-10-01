import { describe, expect, it } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { SelectEmptyState } from '../SelectEmptyState';

describe('SelectEmptyState', () => {
  it('renders the default "No results" description', () => {
    render(<SelectEmptyState />);
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('renders a custom description override', () => {
    render(<SelectEmptyState description='No results for "rust"' />);
    expect(screen.getByText('No results for "rust"')).toBeInTheDocument();
    expect(screen.queryByText('No results')).not.toBeInTheDocument();
  });
});
