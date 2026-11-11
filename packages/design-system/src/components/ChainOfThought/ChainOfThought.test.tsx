import { describe, expect, it, rs } from '@rstest/core';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Brain } from '../../icons';
import { TestIdProvider } from '../../utils/testId';
import { ChainOfThought } from './ChainOfThought';
import { ChainOfThoughtStep } from './ChainOfThoughtStep';
import {
  chainOfThoughtIconVariants,
  chainOfThoughtLabelVariants,
  chainOfThoughtLineVariants,
  chainOfThoughtStepVariants,
} from './classes';

const connector = () => screen.queryByTestId('cot--step--connector');

describe('ChainOfThought', () => {
  it('renders an ordered list with data-slot and test id', () => {
    render(
      <ChainOfThought data-testid='cot'>
        <ChainOfThoughtStep label='One' />
      </ChainOfThought>,
    );
    const list = screen.getByTestId('cot');
    expect(list.tagName).toBe('OL');
    expect(list).toHaveAttribute('data-slot', 'chain-of-thought');
    expect(screen.getByRole('list')).toBe(list);
  });

  it('renders a static step as a div row with no button and a connector', () => {
    render(
      <ChainOfThought data-testid='cot'>
        <ChainOfThoughtStep label='Searched for ABC' />
      </ChainOfThought>,
    );
    const row = screen.getByTestId('cot--step');
    expect(row.tagName).toBe('DIV');
    expect(row).toHaveAttribute('data-slot', 'chain-of-thought-step-row');
    expect(screen.queryByRole('button')).toBeNull();
    expect(connector()).toBeTruthy();
    expect(row.querySelector('svg')).toBeTruthy();
  });

  it('makes a leaf action keyboard accessible without submitting its surrounding form', async () => {
    const user = userEvent.setup();
    const onClick = rs.fn();
    const onOpenChange = rs.fn();
    const onSubmit = rs.fn(event => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <ChainOfThought>
          <ChainOfThoughtStep label='Show source' onClick={onClick} onOpenChange={onOpenChange} />
        </ChainOfThought>
      </form>,
    );
    const action = screen.getByRole('button', { name: 'Show source' });
    await user.tab();
    expect(action).toHaveFocus();
    await user.keyboard('{Enter} ');
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(action).not.toHaveAttribute('aria-expanded');
    expect(action).not.toHaveAttribute('aria-controls');
  });

  it('renders a collapsible step as a button wired to its content', () => {
    render(
      <ChainOfThought data-testid='cot'>
        <ChainOfThoughtStep label='Thought' icon={<Brain />}>
          <p>Nested</p>
        </ChainOfThoughtStep>
      </ChainOfThought>,
    );
    const row = screen.getByTestId('cot--step');
    expect(row.tagName).toBe('BUTTON');
    expect(row).toHaveAttribute('type', 'button');
    expect(row).toHaveAttribute('aria-expanded', 'false');
    const content = document.getElementById(row.getAttribute('aria-controls') ?? '');
    expect(content).toHaveAttribute('data-slot', 'chain-of-thought-step-content');
    expect(content?.firstElementChild).toHaveAttribute('inert');
  });

  it('toggles uncontrolled and drops the connector while open', async () => {
    const onOpenChange = rs.fn();
    render(
      <ChainOfThought data-testid='cot'>
        <ChainOfThoughtStep label='Thought' onOpenChange={onOpenChange}>
          <p>Nested</p>
        </ChainOfThoughtStep>
      </ChainOfThought>,
    );
    const row = screen.getByTestId('cot--step');
    expect(connector()).toBeTruthy();
    await userEvent.click(row);
    expect(row).toHaveAttribute('aria-expanded', 'true');
    expect(row.closest('li')).toHaveAttribute('data-state', 'open');
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(connector()).toBeFalsy();
    await userEvent.click(row);
    expect(row).toHaveAttribute('aria-expanded', 'false');
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('honours defaultOpen', () => {
    render(
      <ChainOfThought data-testid='cot'>
        <ChainOfThoughtStep label='Thought' defaultOpen>
          <p>Nested</p>
        </ChainOfThoughtStep>
      </ChainOfThought>,
    );
    const row = screen.getByTestId('cot--step');
    expect(row).toHaveAttribute('aria-expanded', 'true');
    const content = document.getElementById(row.getAttribute('aria-controls') ?? '');
    expect(content?.firstElementChild).not.toHaveAttribute('inert');
  });

  it('is controlled by open and reports changes via onOpenChange', async () => {
    const onOpenChange = rs.fn();
    const { rerender } = render(
      <ChainOfThought data-testid='cot'>
        <ChainOfThoughtStep label='Thought' open={false} onOpenChange={onOpenChange}>
          <p>Nested</p>
        </ChainOfThoughtStep>
      </ChainOfThought>,
    );
    const row = screen.getByTestId('cot--step');
    await userEvent.click(row);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(row).toHaveAttribute('aria-expanded', 'false');
    rerender(
      <ChainOfThought data-testid='cot'>
        <ChainOfThoughtStep label='Thought' open onOpenChange={onOpenChange}>
          <p>Nested</p>
        </ChainOfThoughtStep>
      </ChainOfThought>,
    );
    expect(row).toHaveAttribute('aria-expanded', 'true');
  });

  it('lets a consumer preventDefault stop the toggle', async () => {
    const onOpenChange = rs.fn();
    render(
      <ChainOfThought data-testid='cot'>
        <ChainOfThoughtStep
          label='Thought'
          onClick={e => e.preventDefault()}
          onOpenChange={onOpenChange}
        >
          <p>Nested</p>
        </ChainOfThoughtStep>
      </ChainOfThought>,
    );
    const row = screen.getByTestId('cot--step');
    await userEvent.click(row);
    expect(row).toHaveAttribute('aria-expanded', 'false');
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('renders no icon cell and no connector when icon is null', () => {
    render(
      <ChainOfThought data-testid='cot'>
        <ChainOfThoughtStep icon={null} label='Simple' metric='42' />
      </ChainOfThought>,
    );
    const row = screen.getByTestId('cot--step');
    expect(row.querySelector('svg')).toBeNull();
    expect(connector()).toBeFalsy();
    expect(row).toHaveTextContent('Simple42');
    expect(screen.getByText('42')).toHaveClass('font-mono');
  });

  it('keeps a chevron on a collapsible step with icon null', () => {
    render(
      <ChainOfThought data-testid='cot'>
        <ChainOfThoughtStep icon={null} label='Simple'>
          <p>Nested</p>
        </ChainOfThoughtStep>
      </ChainOfThought>,
    );
    expect(screen.getByTestId('cot--step').querySelectorAll('svg')).toHaveLength(1);
  });

  it('marks running steps with data-status and the shimmer class', () => {
    render(
      <ChainOfThought data-testid='cot'>
        <ChainOfThoughtStep label='Working...' status='running' />
      </ChainOfThought>,
    );
    const row = screen.getByTestId('cot--step');
    expect(row.closest('li')).toHaveAttribute('data-status', 'running');
    expect(screen.getByText('Working...')).toHaveClass('shimmer-text');
  });

  it('marks error steps with data-status and the danger classes', () => {
    render(
      <ChainOfThought data-testid='cot'>
        <ChainOfThoughtStep icon={<Brain />} label='Failed' status='error' />
      </ChainOfThought>,
    );
    const row = screen.getByTestId('cot--step');
    expect(row.closest('li')).toHaveAttribute('data-status', 'error');
    expect(screen.getByText('Failed')).toHaveClass('text-text-danger');
    const iconCell = screen.getByTestId('cot--step--icon');
    expect(iconCell).toHaveClass('text-icon-danger');
    expect(iconCell).not.toHaveClass('text-icon-secondary');
    expect(row).toHaveTextContent('Error: Failed');
  });

  it('tints the chevron cell danger on a collapsible error step, closed and open', async () => {
    render(
      <ChainOfThought data-testid='cot'>
        <ChainOfThoughtStep icon={<Brain />} label='Failed' status='error'>
          <p>Detail</p>
        </ChainOfThoughtStep>
      </ChainOfThought>,
    );
    expect(screen.getByTestId('cot--step--icon')).toHaveClass('text-icon-danger');
    await userEvent.click(screen.getByTestId('cot--step'));
    expect(screen.getByTestId('cot--step--icon')).toHaveClass('text-icon-danger');
  });

  it('marks non-error steps without the hidden error prefix', () => {
    render(
      <ChainOfThought data-testid='cot'>
        <ChainOfThoughtStep label='Done' />
      </ChainOfThought>,
    );
    expect(screen.getByTestId('cot--step')).toHaveTextContent(/^Done$/);
  });

  it('keeps the no-argument icon classes unchanged', () => {
    expect(chainOfThoughtIconVariants()).toBe(
      'flex size-16 shrink-0 items-center justify-center text-icon-secondary [&_svg]:icon-md',
    );
  });

  it('cascades test ids through nested chains and lets consumers override', () => {
    render(
      <ChainOfThought data-testid='cot'>
        <ChainOfThoughtStep label='Outer' defaultOpen>
          <ChainOfThought>
            <ChainOfThoughtStep label='Inner' />
            <ChainOfThoughtStep label='Custom' data-testid='custom' />
          </ChainOfThought>
        </ChainOfThoughtStep>
      </ChainOfThought>,
    );
    expect(screen.getByTestId('cot--step--chain-of-thought')).toBeInTheDocument();
    expect(screen.getByTestId('cot--step--chain-of-thought--step')).toHaveTextContent('Inner');
    expect(screen.getByTestId('custom')).toHaveTextContent('Custom');
  });

  it('leaves the DOM clean without a test id', () => {
    const { container } = render(
      <ChainOfThought>
        <ChainOfThoughtStep label='One' />
      </ChainOfThought>,
    );
    expect(container.querySelector('[data-testid]')).toBeNull();
  });

  it('derives chain-of-thought test id inside a parent cascade', () => {
    render(
      <TestIdProvider value='msg'>
        <ChainOfThought>
          <ChainOfThoughtStep label='One' />
        </ChainOfThought>
      </TestIdProvider>,
    );
    expect(screen.getByTestId('msg--chain-of-thought--step')).toBeInTheDocument();
  });

  describe('enter transitions', () => {
    const li = () => screen.getByTestId('cot--step').closest('li') as HTMLElement;
    const label = () => screen.getByText(/ABC/);
    const steps = (status: 'running' | 'done') => (
      <ChainOfThought data-testid='cot'>
        <ChainOfThoughtStep label='Searched for ABC' status={status} />
      </ChainOfThought>
    );

    it('marks a step that mounts as running and keeps the mark after it finishes', () => {
      const { rerender } = render(steps('running'));
      expect(li()).toHaveAttribute('data-entered', 'true');
      expect(li().className).toContain('motion-safe:starting:opacity-0');
      expect(connector()?.className).toContain('motion-safe:starting:scale-y-0');
      expect(label().className).toContain('[-webkit-text-fill-color:transparent]');

      rerender(steps('done'));
      expect(li()).toHaveAttribute('data-entered', 'true');
      expect(label()).toHaveClass('shimmer-text', '[animation-play-state:paused]');
      expect(label().className).toContain('[-webkit-text-fill-color:var(--color-text-secondary)]');

      // After the fill fade the label drops to the static classes, so colored children keep theirs.
      fireEvent.transitionEnd(label(), { propertyName: '-webkit-text-fill-color' });
      expect(label().className).toBe(chainOfThoughtLabelVariants());
      expect(li()).toHaveAttribute('data-entered', 'true');
    });

    it('renders a step mounted as done (history) with the unchanged static classes', () => {
      const { rerender } = render(steps('done'));
      expect(li()).not.toHaveAttribute('data-entered');
      expect(li().className).toBe(chainOfThoughtStepVariants());
      expect(connector()?.className).toBe(`${chainOfThoughtLineVariants()} h-20`);
      expect(label().className).toBe(chainOfThoughtLabelVariants());

      // Turning running later does not retro-animate it.
      rerender(steps('running'));
      expect(li()).not.toHaveAttribute('data-entered');
    });

    it('keeps the no-argument class output free of transition classes', () => {
      expect(chainOfThoughtStepVariants()).not.toContain('starting:');
      expect(chainOfThoughtLineVariants()).not.toContain('starting:');
      expect(chainOfThoughtLabelVariants({ status: 'running' })).toBe(
        'min-w-0 flex-1 shimmer-text',
      );
    });
  });
});
