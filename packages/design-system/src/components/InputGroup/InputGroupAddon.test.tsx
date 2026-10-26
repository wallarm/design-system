import { expect, it } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Input } from '../Input';
import { InputGroup } from './InputGroup';
import { InputGroupAddon } from './InputGroupAddon';

it('delegates decoration clicks to the input without adding a tab stop or stealing button focus', async () => {
  const user = userEvent.setup();
  render(
    <InputGroup>
      <InputGroupAddon>
        <span>Search icon</span>
      </InputGroupAddon>
      <Input aria-label='Search' />
      <InputGroupAddon>
        <button type='button'>Clear search</button>
      </InputGroupAddon>
    </InputGroup>,
  );
  const input = screen.getByRole('textbox', { name: 'Search' });
  const clear = screen.getByRole('button', { name: 'Clear search' });
  await user.tab();
  expect(input).toHaveFocus();
  await user.tab();
  expect(clear).toHaveFocus();
  await user.click(screen.getByText('Search icon'));
  expect(input).toHaveFocus();
  await user.click(clear);
  expect(clear).toHaveFocus();
});
