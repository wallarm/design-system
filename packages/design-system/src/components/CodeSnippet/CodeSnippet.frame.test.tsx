import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { copyText } from '../../utils/copyText';
import { CodeSnippetActions } from './CodeSnippetActions';
import { CodeSnippetCode } from './CodeSnippetCode';
import { CodeSnippetContent } from './CodeSnippetContent';
import { CodeSnippetCopyButton } from './CodeSnippetCopyButton';
import { CodeSnippetRoot } from './CodeSnippetRoot';
import { CodeSnippetShowMoreButton } from './CodeSnippetShowMoreButton';
import { useCodeSnippetFrame } from './hooks';

rs.mock('../../utils/copyText', () => ({
  copyText: rs.fn(() => Promise.resolve()),
}));

const makeCode = (lineCount: number) =>
  Array.from({ length: lineCount }, (_, index) => `line ${index + 1}`).join('\n');

const FrameProbe = () => {
  const frame = useCodeSnippetFrame();
  return (
    <output data-testid='probe'>
      {JSON.stringify({
        code: frame.getCode(),
        size: frame.size,
        maxLines: frame.maxLines,
        hiddenLineCount: frame.hiddenLineCount,
        isExpanded: frame.isExpanded,
        wrapLines: frame.wrapLines,
        isFullscreen: frame.isFullscreen,
      })}
    </output>
  );
};

afterEach(() => {
  rs.mocked(copyText).mockClear();
});

describe('CodeSnippet frame context', () => {
  it('useCodeSnippetFrame throws outside a provider', () => {
    const consoleError = rs.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => render(<FrameProbe />)).toThrow(
      'useCodeSnippetFrame must be used within CodeSnippetRoot or CodeEditorRoot',
    );

    consoleError.mockRestore();
  });

  it('exposes frame state from CodeSnippetRoot', () => {
    render(
      <CodeSnippetRoot code={makeCode(10)} size='md' maxLines={4} wrapLines>
        <FrameProbe />
      </CodeSnippetRoot>,
    );

    expect(JSON.parse(screen.getByTestId('probe').textContent ?? '')).toEqual({
      code: makeCode(10),
      size: 'md',
      maxLines: 4,
      hiddenLineCount: 6,
      isExpanded: false,
      wrapLines: true,
      isFullscreen: false,
    });
  });

  it('keeps hiddenLineCount independent of isExpanded', async () => {
    render(
      <CodeSnippetRoot code={makeCode(10)} maxLines={4}>
        <FrameProbe />
        <CodeSnippetShowMoreButton data-testid='show-more-btn' />
      </CodeSnippetRoot>,
    );

    await userEvent.click(screen.getByTestId('show-more-btn'));

    const state = JSON.parse(screen.getByTestId('probe').textContent ?? '');
    expect(state.isExpanded).toBe(true);
    expect(state.hiddenLineCount).toBe(6);
  });

  it('reports hiddenLineCount 0 when maxLines is disabled', () => {
    render(
      <CodeSnippetRoot code={makeCode(10)}>
        <FrameProbe />
      </CodeSnippetRoot>,
    );

    expect(JSON.parse(screen.getByTestId('probe').textContent ?? '').hiddenLineCount).toBe(0);
  });
});

describe('CodeSnippetCopyButton onCopy', () => {
  it('fires onCopy with the code after the copy button is clicked', async () => {
    const onCopy = rs.fn();

    render(
      <CodeSnippetRoot code='const a = 1;' onCopy={onCopy}>
        <CodeSnippetActions>
          <CodeSnippetCopyButton data-testid='copy-btn' />
        </CodeSnippetActions>
      </CodeSnippetRoot>,
    );

    await userEvent.click(screen.getByTestId('copy-btn'));

    expect(copyText).toHaveBeenCalledWith('const a = 1;');
    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(onCopy).toHaveBeenCalledWith('const a = 1;');
  });

  it('copies the latest code after the code prop changes', async () => {
    const onCopy = rs.fn();
    const { rerender } = render(
      <CodeSnippetRoot code='first' onCopy={onCopy}>
        <CodeSnippetActions>
          <CodeSnippetCopyButton data-testid='copy-btn' />
        </CodeSnippetActions>
      </CodeSnippetRoot>,
    );

    rerender(
      <CodeSnippetRoot code='second' onCopy={onCopy}>
        <CodeSnippetActions>
          <CodeSnippetCopyButton data-testid='copy-btn' />
        </CodeSnippetActions>
      </CodeSnippetRoot>,
    );

    await userEvent.click(screen.getByTestId('copy-btn'));

    expect(copyText).toHaveBeenCalledWith('second');
    expect(onCopy).toHaveBeenCalledWith('second');
  });

  it('still composes a consumer onClick on the copy button', async () => {
    const onClick = rs.fn();
    const onCopy = rs.fn();

    render(
      <CodeSnippetRoot code='x' onCopy={onCopy}>
        <CodeSnippetActions>
          <CodeSnippetCopyButton data-testid='copy-btn' onClick={onClick} />
        </CodeSnippetActions>
      </CodeSnippetRoot>,
    );

    await userEvent.click(screen.getByTestId('copy-btn'));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onCopy).toHaveBeenCalledTimes(1);
  });
});

describe('CodeSnippetShowMoreButton', () => {
  it('derives its test id from the root cascade', () => {
    render(
      <CodeSnippetRoot code={makeCode(10)} maxLines={4} data-testid='snippet'>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>,
    );

    const button = screen.getByTestId('snippet--show-more-button');
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveTextContent('Show more (6 lines)');
  });

  it('lets a consumer data-testid override the derived one', () => {
    render(
      <CodeSnippetRoot code={makeCode(10)} maxLines={4} data-testid='snippet'>
        <CodeSnippetShowMoreButton data-testid='custom-show-more' />
      </CodeSnippetRoot>,
    );

    expect(screen.getByTestId('custom-show-more')).toBeInTheDocument();
    expect(screen.queryByTestId('snippet--show-more-button')).not.toBeInTheDocument();
  });

  it('toggles between Show more and Show less and keeps the hidden count', async () => {
    render(
      <CodeSnippetRoot code={makeCode(10)} maxLines={4} data-testid='snippet'>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>,
    );

    const button = screen.getByTestId('snippet--show-more-button');
    await userEvent.click(button);
    expect(button).toHaveTextContent('Show less');

    await userEvent.click(button);
    expect(button).toHaveTextContent('Show more (6 lines)');
  });

  it('renders nothing when fewer than 3 lines would be hidden', () => {
    render(
      <CodeSnippetRoot code={makeCode(6)} maxLines={4} data-testid='snippet'>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>,
    );

    expect(screen.queryByTestId('snippet--show-more-button')).not.toBeInTheDocument();
  });

  it('omits data-testid on the show-more button when the root has none', () => {
    render(
      <CodeSnippetRoot code={makeCode(10)} maxLines={4}>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>,
    );

    expect(screen.getByRole('button', { name: /show more/i })).not.toHaveAttribute('data-testid');
  });
});
