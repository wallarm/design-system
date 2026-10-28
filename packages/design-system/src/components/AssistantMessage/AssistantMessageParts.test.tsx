import { createRef } from 'react';

import { describe, expect, it } from '@rstest/core';
import { render, screen } from '@testing-library/react';

import { TestIdProvider, useTestId } from '../../utils/testId';
import { AssistantMessage } from './AssistantMessage';
import { AssistantMessageError } from './AssistantMessageError';
import { AssistantMessageLoader } from './AssistantMessageLoader';

const Probe = () => <span data-testid={useTestId('retry')}>Retry</span>;

describe('AssistantMessageLoader', () => {
  it('renders a status with the default text, the shimmer and the --loader id', () => {
    render(
      <AssistantMessage data-testid='msg'>
        <AssistantMessageLoader />
      </AssistantMessage>,
    );
    const loader = screen.getByTestId('msg--loader');
    expect(loader).toBe(screen.getByRole('status'));
    expect(loader).toHaveAttribute('data-slot', 'assistant-message-loader');
    expect(loader).toHaveTextContent('Working...');
    expect(screen.getByText('Working...')).toHaveClass('shimmer-text');
  });

  it('renders custom text, merges className and forwards ref and attributes', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <AssistantMessageLoader ref={ref} data-testid='l' className='custom' aria-label='Busy'>
        Thinking...
      </AssistantMessageLoader>,
    );
    const loader = screen.getByTestId('l');
    expect(ref.current).toBe(loader);
    expect(loader).toHaveTextContent('Thinking...');
    expect(loader).toHaveClass('custom', 'text-xs');
    expect(loader).toHaveAttribute('aria-label', 'Busy');
  });
});

describe('AssistantMessageError', () => {
  it('renders an alert with the message, the action and the --error id', () => {
    render(
      <TestIdProvider value='chat'>
        <AssistantMessageError action={<Probe />}>Something went wrong.</AssistantMessageError>
      </TestIdProvider>,
    );
    const error = screen.getByTestId('chat--error');
    expect(error).toBe(screen.getByRole('alert'));
    expect(error).toHaveAttribute('data-slot', 'assistant-message-error');
    expect(error).toHaveTextContent('Something went wrong.');
    expect(error).toHaveClass('text-text-danger');
    expect(screen.getByTestId('chat--error--retry')).toHaveTextContent('Retry');
  });

  it('derives the action id from a consumer data-testid and forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <AssistantMessageError ref={ref} data-testid='err' className='custom' action={<Probe />}>
        Failed
      </AssistantMessageError>,
    );
    expect(ref.current).toBe(screen.getByTestId('err'));
    expect(screen.getByTestId('err')).toHaveClass('custom');
    expect(screen.getByTestId('err--retry')).toBeInTheDocument();
  });

  it('keeps the DOM clean without a data-testid', () => {
    const { container } = render(
      <AssistantMessageError action={<Probe />}>Failed</AssistantMessageError>,
    );
    expect(container.querySelector('[data-testid]')).toBeNull();
  });
});
