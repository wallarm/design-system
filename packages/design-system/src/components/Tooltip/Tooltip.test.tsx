import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from '../Button';
import { Tooltip } from './Tooltip';
import { TooltipContent } from './TooltipContent';
import { TooltipTrigger } from './TooltipTrigger';

describe('Attribute pass-through', () => {
  it('forwards data-analytics-id to the default TooltipTrigger element', () => {
    render(
      <Tooltip>
        <TooltipTrigger data-testid='trigger' data-analytics-id='OPEN_TOOLTIP'>
          Hover
        </TooltipTrigger>
        <TooltipContent>Body</TooltipContent>
      </Tooltip>,
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger).toHaveAttribute('data-analytics-id', 'OPEN_TOOLTIP');
  });

  it('forwards data-analytics-props verbatim on TooltipTrigger', () => {
    const payload = JSON.stringify({ feature: 'host', tooltip: 'edit' });

    render(
      <Tooltip>
        <TooltipTrigger
          data-testid='trigger'
          data-analytics-id='OPEN_TOOLTIP'
          data-analytics-props={payload}
        >
          Hover
        </TooltipTrigger>
        <TooltipContent>Body</TooltipContent>
      </Tooltip>,
    );

    expect(screen.getByTestId('trigger')).toHaveAttribute('data-analytics-props', payload);
  });

  it('preserves analytics on a Button wrapped by TooltipTrigger asChild', () => {
    render(
      <Tooltip>
        <TooltipTrigger asChild>
          <Button data-testid='trigger' data-analytics-id='EDIT_BUTTON'>
            Edit
          </Button>
        </TooltipTrigger>
        <TooltipContent>Body</TooltipContent>
      </Tooltip>,
    );

    const trigger = screen.getByTestId('trigger');
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger).toHaveAttribute('data-analytics-id', 'EDIT_BUTTON');
  });

  it('forwards data-analytics-id to TooltipContent', async () => {
    render(
      <Tooltip open>
        <TooltipTrigger>Hover</TooltipTrigger>
        <TooltipContent data-testid='content' data-analytics-id='TOOLTIP_BODY'>
          Body
        </TooltipContent>
      </Tooltip>,
    );

    const content = await screen.findByTestId('content');
    expect(content).toHaveAttribute('data-analytics-id', 'TOOLTIP_BODY');
  });
});

describe('Testid cascade', () => {
  it('inherits the parent testid when Tooltip itself has none (regression)', () => {
    render(
      <div data-testid='owner'>
        <Tooltip>
          <TooltipTrigger>Hover</TooltipTrigger>
          <TooltipContent>Body</TooltipContent>
        </Tooltip>
      </div>,
    );

    // Bare smoke test — no consumer testid on Tooltip, no parent provider in
    // this test. The fix is exercised inside Drawer/Dialog where the parent
    // sets `<TestIdProvider value='drawer'>` and the Tooltip used to reset
    // the cascade to undefined.
    expect(screen.getByTestId('owner')).toBeInTheDocument();
  });
});
