import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { InlineCodeSnippet } from './InlineCodeSnippet';

describe('Attribute pass-through', () => {
  it('forwards data-analytics-id to the default <code>', () => {
    render(
      <InlineCodeSnippet
        code='npm install'
        data-testid='inline-code'
        data-analytics-id='COPY_INLINE'
      />,
    );

    const code = screen.getByTestId('inline-code');
    expect(code.tagName).toBe('CODE');
    expect(code).toHaveAttribute('data-analytics-id', 'COPY_INLINE');
  });

  it('forwards data-analytics-props JSON payload verbatim', () => {
    const payload = JSON.stringify({ feature: 'docs', cmd: 'install' });

    render(
      <InlineCodeSnippet
        code='npm install'
        data-testid='inline-code'
        data-analytics-id='COPY_INLINE'
        data-analytics-props={payload}
      />,
    );

    expect(screen.getByTestId('inline-code')).toHaveAttribute('data-analytics-props', payload);
  });

  it('renders the consumer element via asChild with the code prop as content', () => {
    render(
      <InlineCodeSnippet code='npm install' asChild>
        <kbd data-testid='inline-kbd' data-analytics-id='COPY_KBD' />
      </InlineCodeSnippet>,
    );

    const el = screen.getByTestId('inline-kbd');
    expect(el.tagName).toBe('KBD');
    expect(el).toHaveAttribute('data-analytics-id', 'COPY_KBD');
    expect(el).toHaveTextContent('npm install');
  });

  it('click resolves to the data-analytics-id element via closest()', async () => {
    const captured = captureAnalyticsClicks();

    render(
      <InlineCodeSnippet
        code='npm install'
        data-testid='inline-code'
        data-analytics-id='COPY_INLINE'
      />,
    );

    await userEvent.click(screen.getByTestId('inline-code'));

    expect(captured).toHaveBeenCalledWith('COPY_INLINE');
  });

  it('asChild target captures its own data-analytics-id via closest()', async () => {
    const captured = captureAnalyticsClicks();

    render(
      <InlineCodeSnippet code='npm install' asChild>
        <kbd data-testid='inline-kbd' data-analytics-id='COPY_KBD' />
      </InlineCodeSnippet>,
    );

    await userEvent.click(screen.getByTestId('inline-kbd'));

    expect(captured).toHaveBeenCalledWith('COPY_KBD');
  });

  it('composes consumer onClick alongside the internal copy handler', async () => {
    const onClick = vi.fn();

    render(
      <InlineCodeSnippet
        code='npm install'
        data-testid='inline-code'
        data-analytics-id='COPY_INLINE'
        onClick={onClick}
      />,
    );

    await userEvent.click(screen.getByTestId('inline-code'));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not attach click behaviour when copyable=false', async () => {
    const captured = captureAnalyticsClicks();
    const onClick = vi.fn();

    render(
      <InlineCodeSnippet
        code='npm install'
        copyable={false}
        data-testid='inline-code'
        data-analytics-id='COPY_INLINE'
        onClick={onClick}
      />,
    );

    await userEvent.click(screen.getByTestId('inline-code'));

    // analytics still resolves (no stopPropagation), and consumer's onClick still runs
    expect(captured).toHaveBeenCalledWith('COPY_INLINE');
    expect(onClick).toHaveBeenCalledOnce();
  });
});
