import { createRef } from 'react';

import { describe, expect, it } from '@rstest/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { ChainOfThought } from './ChainOfThought';
import { ChainOfThoughtStep } from './ChainOfThoughtStep';

const PROPS = '{"type":"thinking","depth":1}';

describe('ChainOfThought — analytics pass-through (docs/metrics/contract.md)', () => {
  it('lands data-analytics-* on the collapsible row button, not the <li>', async () => {
    const spy = captureAnalyticsClicks();
    render(
      <ChainOfThought data-testid='cot'>
        <ChainOfThoughtStep
          label='Thought'
          data-analytics-id='COT_TOGGLE'
          data-analytics-props={PROPS}
        >
          <p>Nested</p>
        </ChainOfThoughtStep>
      </ChainOfThought>,
    );
    const row = screen.getByTestId('cot--step');
    expect(row.tagName).toBe('BUTTON');
    expect(row.getAttribute('data-analytics-props')).toBe(PROPS);
    expect(row.closest('li')).not.toHaveAttribute('data-analytics-id');
    await userEvent.click(row.querySelector('span') as HTMLElement);
    expect(spy).toHaveBeenCalledWith('COT_TOGGLE');
  });

  it('keeps the id on the button across open/close', async () => {
    render(
      <ChainOfThought data-testid='cot'>
        <ChainOfThoughtStep label='Thought' data-analytics-id='COT_TOGGLE'>
          <p>Nested</p>
        </ChainOfThoughtStep>
      </ChainOfThought>,
    );
    const row = screen.getByTestId('cot--step');
    await userEvent.click(row);
    expect(screen.getByTestId('cot--step')).toHaveAttribute('data-analytics-id', 'COT_TOGGLE');
    await userEvent.click(row);
    expect(screen.getByTestId('cot--step')).toHaveAttribute('data-analytics-id', 'COT_TOGGLE');
  });

  it('forwards ref, aria-* and id to the row on both button and div rows', () => {
    const buttonRef = createRef<HTMLElement>();
    const divRef = createRef<HTMLElement>();
    render(
      <ChainOfThought>
        <ChainOfThoughtStep ref={buttonRef} id='btn' aria-describedby='x' label='A'>
          <p>Nested</p>
        </ChainOfThoughtStep>
        <ChainOfThoughtStep ref={divRef} id='static' data-analytics-id='COT_STATIC' label='B' />
      </ChainOfThought>,
    );
    expect(buttonRef.current?.tagName).toBe('BUTTON');
    expect(buttonRef.current).toHaveAttribute('id', 'btn');
    expect(buttonRef.current).toHaveAttribute('aria-describedby', 'x');
    expect(divRef.current?.tagName).toBe('DIV');
    expect(divRef.current).toHaveAttribute('data-analytics-id', 'COT_STATIC');
  });
});
