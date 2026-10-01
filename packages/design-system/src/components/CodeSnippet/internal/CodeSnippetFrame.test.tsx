import { createRef, type FC, type Ref, StrictMode, useState } from 'react';
import { describe, expect, it } from '@rstest/core';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { TestIdProvider } from '../../../utils/testId';
import { CodeSnippetFrame } from './CodeSnippetFrame';

const Counter: FC = () => {
  const [count, setCount] = useState(0);
  return (
    <button type='button' data-testid='counter' onClick={() => setCount(c => c + 1)}>
      {count}
    </button>
  );
};

interface HarnessProps {
  initialFullscreen?: boolean;
  frameRef?: Ref<HTMLDivElement>;
}

const Harness: FC<HarnessProps> = ({ initialFullscreen = false, frameRef }) => {
  const [isFullscreen, setIsFullscreen] = useState(initialFullscreen);
  return (
    <div data-testid='parent'>
      <button type='button' data-testid='toggle' onClick={() => setIsFullscreen(v => !v)}>
        toggle
      </button>
      <TestIdProvider value='frame'>
        <CodeSnippetFrame
          ref={frameRef}
          id='consumer-id'
          data-testid='frame'
          data-analytics-id='SNIPPET'
          aria-label='Example'
          className='consumer-class'
          isFullscreen={isFullscreen}
          setIsFullscreen={setIsFullscreen}
        >
          <Counter />
        </CodeSnippetFrame>
      </TestIdProvider>
    </div>
  );
};

describe('CodeSnippetFrame', () => {
  it('renders the root inline inside the parent when not fullscreen', () => {
    render(<Harness />);

    const frame = screen.getByTestId('frame');
    expect(screen.getByTestId('parent')).toContainElement(frame);
    expect(frame).toHaveClass('consumer-class');
    expect(frame).not.toHaveClass('fixed');
    expect(screen.queryByTestId('frame--backdrop')).not.toBeInTheDocument();
  });

  it('moves the root to document.body in fullscreen without remounting children', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByTestId('counter'));
    await user.click(screen.getByTestId('counter'));
    expect(screen.getByTestId('counter')).toHaveTextContent('2');

    await user.click(screen.getByTestId('toggle'));
    const frame = screen.getByTestId('frame');
    expect(screen.getByTestId('parent')).not.toContainElement(frame);
    expect(frame).toHaveClass('fixed', 'inset-16', 'z-50');
    expect(screen.getByTestId('counter')).toHaveTextContent('2');

    await user.click(screen.getByTestId('counter'));
    expect(screen.getByTestId('counter')).toHaveTextContent('3');

    await user.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('parent')).toContainElement(screen.getByTestId('frame'));
    expect(screen.getByTestId('frame')).not.toHaveClass('fixed');
    expect(screen.getByTestId('counter')).toHaveTextContent('3');
  });

  it('keeps consumer id, data-*, aria-*, className and ref in fullscreen', () => {
    const frameRef = createRef<HTMLDivElement>();
    render(<Harness initialFullscreen frameRef={frameRef} />);

    const frame = screen.getByTestId('frame');
    expect(frame).toHaveAttribute('id', 'consumer-id');
    expect(frame).toHaveAttribute('data-analytics-id', 'SNIPPET');
    expect(frame).toHaveAttribute('aria-label', 'Example');
    expect(frame).toHaveClass('consumer-class', 'fixed', 'inset-16', 'z-50');
    expect(frameRef.current).toBe(frame);
  });

  it('keeps the same DOM node for the ref across fullscreen toggles', async () => {
    const user = userEvent.setup();
    const frameRef = createRef<HTMLDivElement>();
    render(<Harness frameRef={frameRef} />);

    const inlineNode = frameRef.current;
    await user.click(screen.getByTestId('toggle'));
    expect(frameRef.current).toBe(inlineNode);
    await user.click(screen.getByTestId('toggle'));
    expect(frameRef.current).toBe(inlineNode);
  });

  it('exits fullscreen on Escape', () => {
    render(<Harness initialFullscreen />);
    expect(screen.getByTestId('frame')).toHaveClass('fixed');

    fireEvent.keyDown(screen.getByTestId('counter'), { key: 'Escape' });

    expect(screen.getByTestId('frame')).not.toHaveClass('fixed');
  });

  it('does not exit fullscreen when Escape was already handled (defaultPrevented)', () => {
    render(<Harness initialFullscreen />);
    const target = screen.getByTestId('counter');
    const preventEscape = (event: KeyboardEvent) => event.preventDefault();
    target.addEventListener('keydown', preventEscape, { capture: true });

    fireEvent.keyDown(target, { key: 'Escape' });

    expect(screen.getByTestId('frame')).toHaveClass('fixed');
    target.removeEventListener('keydown', preventEscape, { capture: true });
  });

  it('ignores keys other than Escape in fullscreen', () => {
    render(<Harness initialFullscreen />);

    fireEvent.keyDown(screen.getByTestId('counter'), { key: 'Enter' });
    expect(screen.getByTestId('frame')).toHaveClass('fixed');
  });

  it('exits fullscreen on backdrop click', async () => {
    const user = userEvent.setup();
    render(<Harness initialFullscreen />);

    await user.click(screen.getByTestId('frame--backdrop'));

    expect(screen.getByTestId('frame')).not.toHaveClass('fixed');
    expect(screen.queryByTestId('frame--backdrop')).not.toBeInTheDocument();
  });

  it('keeps focus on the focused descendant when the host moves', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const counter = screen.getByTestId('counter');
    counter.focus();

    const toggle = screen.getByTestId('toggle');
    // HTMLElement.click() does not move focus, so focus stays inside the frame
    act(() => {
      toggle.click();
    });
    expect(counter).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(screen.getByTestId('frame')).not.toHaveClass('fixed');
    expect(counter).toHaveFocus();
  });

  it('keeps the root attached and state intact under StrictMode', async () => {
    const user = userEvent.setup();
    render(
      <StrictMode>
        <Harness />
      </StrictMode>,
    );

    expect(screen.getByTestId('parent')).toContainElement(screen.getByTestId('frame'));
    await user.click(screen.getByTestId('counter'));
    await user.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('parent')).not.toContainElement(screen.getByTestId('frame'));
    expect(screen.getByTestId('counter')).toHaveTextContent('1');
    await user.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('parent')).toContainElement(screen.getByTestId('frame'));
    expect(screen.getByTestId('counter')).toHaveTextContent('1');
  });

  it('removes the host from the DOM on unmount', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Harness />);
    await user.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('frame')).toBeInTheDocument();

    unmount();

    expect(screen.queryByTestId('frame')).not.toBeInTheDocument();
    expect(screen.queryByTestId('frame--backdrop')).not.toBeInTheDocument();
  });
});
