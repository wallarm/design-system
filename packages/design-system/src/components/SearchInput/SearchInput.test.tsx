import { describe, expect, it, rs } from '@rstest/core';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { SearchInput } from './SearchInput';

const input = () => within(screen.getByTestId('search')).getByRole('textbox');

describe('SearchInput', () => {
  it('renders without value or onChange and keeps what the user types', async () => {
    render(<SearchInput data-testid='search' />);
    expect(input()).toHaveValue('');
    await userEvent.type(input(), 'rules');
    expect(input()).toHaveValue('rules');
  });

  it('clears an uncontrolled value and reports it', async () => {
    const onChange = rs.fn();
    render(<SearchInput data-testid='search' defaultValue='api' onChange={onChange} />);
    expect(input()).toHaveValue('api');
    await userEvent.click(
      within(screen.getByTestId('search')).getByRole('button', { name: 'Clear' }),
    );
    expect(input()).toHaveValue('');
    expect(onChange).toHaveBeenLastCalledWith('');
  });

  it('stays controlled when value is given', async () => {
    const onChange = rs.fn();
    render(<SearchInput data-testid='search' value='fixed' onChange={onChange} />);
    await userEvent.type(input(), 'x');
    expect(onChange).toHaveBeenLastCalledWith('fixedx');
    expect(input()).toHaveValue('fixed');
  });
});
