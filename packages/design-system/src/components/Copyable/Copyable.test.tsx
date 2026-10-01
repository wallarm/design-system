import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { copyText } from '../../utils/copyText';
import { Copyable } from './Copyable';

rs.mock('../../utils/copyText', () => ({
  copyText: rs.fn(() => Promise.resolve()),
}));

afterEach(() => {
  rs.mocked(copyText).mockClear();
});

describe('Copyable', () => {
  it('copies a string text', async () => {
    const onCopied = rs.fn();

    render(
      <Copyable text='static value' onCopied={onCopied}>
        <button type='button' data-testid='copy-trigger'>
          Copy
        </button>
      </Copyable>,
    );

    await userEvent.click(screen.getByTestId('copy-trigger'));

    expect(copyText).toHaveBeenCalledWith('static value');
    expect(onCopied).toHaveBeenCalledTimes(1);
  });

  it('calls a function text lazily at click time and copies its result', async () => {
    let current = 'initial';
    const getText = rs.fn(() => current);

    render(
      <Copyable text={getText}>
        <button type='button' data-testid='copy-trigger'>
          Copy
        </button>
      </Copyable>,
    );

    expect(getText).not.toHaveBeenCalled();

    current = 'updated at click';
    await userEvent.click(screen.getByTestId('copy-trigger'));

    expect(getText).toHaveBeenCalledTimes(1);
    expect(copyText).toHaveBeenCalledWith('updated at click');
  });

  it('supports a function text together with a tooltip', async () => {
    render(
      <Copyable text={() => 'from fn'} tooltip>
        <button type='button' data-testid='copy-trigger'>
          Copy
        </button>
      </Copyable>,
    );

    await userEvent.click(screen.getByTestId('copy-trigger'));

    expect(copyText).toHaveBeenCalledWith('from fn');
  });
});
