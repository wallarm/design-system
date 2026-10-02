import { createRef, type FC, type Ref, useState } from 'react';
import { describe, expect, it } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CodeSnippetActions } from './CodeSnippetActions';
import { CodeSnippetCode } from './CodeSnippetCode';
import { CodeSnippetContent } from './CodeSnippetContent';
import { CodeSnippetFullscreenButton } from './CodeSnippetFullscreenButton';
import { CodeSnippetRoot } from './CodeSnippetRoot';

const Counter: FC = () => {
  const [count, setCount] = useState(0);
  return (
    <button type='button' data-testid='counter' onClick={() => setCount(c => c + 1)}>
      {count}
    </button>
  );
};

const renderSnippet = (ref?: Ref<HTMLDivElement>) =>
  render(
    <div data-testid='parent'>
      <CodeSnippetRoot
        ref={ref}
        code='const a = 1;'
        id='snippet-id'
        data-testid='snippet'
        data-analytics-id='DOCS_SNIPPET'
        className='consumer-class'
      >
        <CodeSnippetActions>
          <Counter />
          <CodeSnippetFullscreenButton />
        </CodeSnippetActions>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>
    </div>,
  );

const enterFullscreen = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByTestId('snippet--fullscreen-button'));
  expect(screen.getByTestId('snippet--fullscreen-button')).toHaveAccessibleName('Exit full screen');
};

describe('CodeSnippet fullscreen', () => {
  it('does not remount children when entering and leaving fullscreen', async () => {
    const user = userEvent.setup();
    renderSnippet();

    await user.click(screen.getByTestId('counter'));
    expect(screen.getByTestId('counter')).toHaveTextContent('1');

    await enterFullscreen(user);
    expect(screen.getByTestId('parent')).not.toContainElement(screen.getByTestId('snippet'));
    expect(screen.getByTestId('counter')).toHaveTextContent('1');

    await user.click(screen.getByTestId('snippet--fullscreen-button'));
    expect(screen.getByTestId('parent')).toContainElement(screen.getByTestId('snippet'));
    expect(screen.getByTestId('counter')).toHaveTextContent('1');
  });

  it('replaces consumer sizing classes in fullscreen so the frame fills the viewport', async () => {
    const user = userEvent.setup();
    render(
      <CodeSnippetRoot
        code='const a = 1;'
        data-testid='snippet'
        className='consumer-class h-[240px] max-w-[600px] w-320 mx-auto'
      >
        <CodeSnippetActions>
          <CodeSnippetFullscreenButton />
        </CodeSnippetActions>
        <CodeSnippetContent>
          <CodeSnippetCode />
        </CodeSnippetContent>
      </CodeSnippetRoot>,
    );
    const root = screen.getByTestId('snippet');
    expect(root).toHaveClass('h-[240px]', 'max-w-[600px]', 'w-320', 'mx-auto');

    await enterFullscreen(user);

    expect(root).toHaveClass('consumer-class', 'fixed', 'inset-16', 'z-50', 'h-auto', 'w-auto');
    expect(root).toHaveClass('max-w-[none]', 'max-h-[none]', 'min-w-0', 'min-h-0', 'm-0');
    expect(root).not.toHaveClass('h-[240px]');
    expect(root).not.toHaveClass('max-w-[600px]');
    expect(root).not.toHaveClass('max-w-none');
    expect(root).not.toHaveClass('max-h-none');
    expect(root).not.toHaveClass('w-320');
    expect(root).not.toHaveClass('mx-auto');

    await user.click(screen.getByTestId('snippet--fullscreen-button'));
    expect(root).toHaveClass('h-[240px]', 'max-w-[600px]', 'w-320', 'mx-auto');
  });

  it('keeps consumer id, data-* attributes, className and ref in fullscreen', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLDivElement>();
    renderSnippet(ref);

    await enterFullscreen(user);

    const root = screen.getByTestId('snippet');
    expect(root).toHaveAttribute('id', 'snippet-id');
    expect(root).toHaveAttribute('data-analytics-id', 'DOCS_SNIPPET');
    expect(root).toHaveClass('consumer-class', 'fixed', 'inset-16', 'z-50');
    expect(ref.current).toBe(root);
  });

  it('exits fullscreen on Escape', async () => {
    const user = userEvent.setup();
    renderSnippet();
    await enterFullscreen(user);

    await user.keyboard('{Escape}');

    expect(screen.getByTestId('snippet--fullscreen-button')).toHaveAccessibleName(
      'Enter full screen',
    );
    expect(screen.getByTestId('snippet')).not.toHaveClass('fixed');
  });

  it('stays in fullscreen when Escape was defaultPrevented by an inner handler', async () => {
    const user = userEvent.setup();
    renderSnippet();
    await enterFullscreen(user);

    const target = screen.getByTestId('counter');
    const preventEscape = (event: KeyboardEvent) => event.preventDefault();
    target.addEventListener('keydown', preventEscape, { capture: true });
    fireEvent.keyDown(target, { key: 'Escape' });
    target.removeEventListener('keydown', preventEscape, { capture: true });

    expect(screen.getByTestId('snippet')).toHaveClass('fixed');
    expect(screen.getByTestId('snippet--fullscreen-button')).toHaveAccessibleName(
      'Exit full screen',
    );
  });

  it('exits fullscreen on backdrop click', async () => {
    const user = userEvent.setup();
    renderSnippet();
    await enterFullscreen(user);

    await user.click(screen.getByTestId('snippet--backdrop'));

    expect(screen.getByTestId('snippet')).not.toHaveClass('fixed');
    expect(screen.queryByTestId('snippet--backdrop')).not.toBeInTheDocument();
  });
});
