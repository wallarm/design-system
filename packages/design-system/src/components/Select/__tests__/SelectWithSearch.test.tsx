import { describe, expect, it } from '@rstest/core';
import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { composeStories } from 'storybook-react-rsbuild';
import * as stories from '../Select.stories';

const { WithSearch } = composeStories(stories);

const TEST_ID = 'select-with-search';
const trigger = () => screen.getByTestId(`${TEST_ID}--button`);
const options = () => screen.queryAllByTestId(`${TEST_ID}--content--option`);
const search = async () =>
  within(await screen.findByTestId(`${TEST_ID}--search-input`)).getByRole('textbox');
const highlighted = () => options().find(option => option.hasAttribute('data-highlighted'));

describe('Select WithSearch story (documented useSelectSearch pattern)', () => {
  it('keyboard highlight stays on options the search left visible', async () => {
    const user = userEvent.setup();
    render(<WithSearch />);

    await user.click(trigger());
    await user.type(await search(), 'java');
    await waitFor(() => expect(options()).toHaveLength(2));

    await user.keyboard('{ArrowDown}');

    await waitFor(() => expect(highlighted()).toHaveTextContent('Java'));
  });

  it('keeps a selected value in the trigger while the search hides it', async () => {
    const user = userEvent.setup();
    render(<WithSearch />);

    await user.click(trigger());
    await user.click(
      await screen.findByText('React', {
        selector: `[data-testid='${TEST_ID}--content--option-text']`,
      }),
    );
    await user.click(trigger());
    await user.type(await search(), 'java');

    await waitFor(() => expect(options()).toHaveLength(2));
    expect(trigger()).toHaveTextContent('React');
  });
});
