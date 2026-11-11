import { describe, expect, it } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { Composer } from './ChatInput.test.helpers';
import type { ChatInputSubmitProps } from './ChatInputSubmit';
import type { ChatInputTextareaProps } from './ChatInputTextarea';

const PROPS = '{"surface":"wally","mode":"chat"}';
// Object literals don't get JSX's `data-*` exemption, so type the attribute bags explicitly.
type DataAttrs = { [key: `data-${string}`]: string };
const promptAttrs: ChatInputTextareaProps & DataAttrs = {
  'data-analytics-id': 'WALLY_PROMPT',
  'data-analytics-props': PROPS,
};
const sendAttrs: ChatInputSubmitProps & DataAttrs = {
  'data-analytics-id': 'WALLY_SEND',
  'data-analytics-props': PROPS,
};
const sendIdAttrs: ChatInputSubmitProps & DataAttrs = { 'data-analytics-id': 'WALLY_SEND' };

describe('ChatInput — analytics pass-through (docs/metrics/contract.md)', () => {
  it('lands data-analytics-* on the real <textarea>, verbatim', () => {
    render(<Composer data-testid='ci' textareaProps={promptAttrs} />);
    const el = screen.getByTestId('ci--textarea');
    expect(el.tagName).toBe('TEXTAREA');
    expect(el).toHaveAttribute('data-analytics-id', 'WALLY_PROMPT');
    expect(el.getAttribute('data-analytics-props')).toBe(PROPS);
  });

  it('lands data-analytics-* on the real submit <button> and resolves clicks', async () => {
    const captured = captureAnalyticsClicks();
    render(<Composer data-testid='ci' initialValue='hi' submitProps={sendAttrs} />);
    const button = screen.getByTestId('ci--submit');
    expect(button.tagName).toBe('BUTTON');
    expect(button.getAttribute('data-analytics-props')).toBe(PROPS);
    await userEvent.click(button);
    expect(captured).toHaveBeenCalledWith('WALLY_SEND');
  });

  it('keeps the submit analytics id across the send → stop swap', () => {
    const { rerender } = render(<Composer data-testid='ci' submitProps={sendIdAttrs} />);
    rerender(<Composer data-testid='ci' isRunning submitProps={sendIdAttrs} />);
    expect(screen.getByTestId('ci--submit')).toHaveAttribute('data-analytics-id', 'WALLY_SEND');
  });

  it('forwards attributes and ref on the root <form>', () => {
    let node: HTMLFormElement | null = null;
    render(
      <Composer
        data-testid='ci'
        data-analytics-id='WALLY_COMPOSER'
        ref={el => {
          node = el;
        }}
      />,
    );
    const form = screen.getByTestId('ci');
    expect(form).toHaveAttribute('data-analytics-id', 'WALLY_COMPOSER');
    expect(node).toBe(form);
  });
});
