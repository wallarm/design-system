import { Steps as ArkSteps } from '@ark-ui/react/steps';
import { describe, expect, it, rs } from '@rstest/core';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StepperFixture, type StepperFixtureProps } from '../../testUtils/StepperFixture';
import { Stepper, StepperContent, StepperItem, StepperList, StepperTitle, StepperTrigger } from '.';
import { ARK_CONTENT_ARIA_RESET, ARK_TAB_ARIA_RESET } from './constants';

const STEPS: StepperFixtureProps['steps'] = [
  { title: 'General', status: 'completed' },
  { title: 'Rules', status: 'danger', description: 'Optional' },
  { title: 'Scope' },
  { title: 'Review' },
];

const renderStepper = (props: StepperFixtureProps = {}) =>
  render(<StepperFixture defaultStep={2} steps={STEPS} {...props} />);

const trigger = (index: number) => screen.getByTestId(`ps--item-${index}--trigger`);

describe('Stepper — accessibility', () => {
  it('is a list of list items holding buttons', () => {
    renderStepper();
    const list = screen.getByRole('list', { name: 'Create policy steps' });
    expect(list.tagName).toBe('OL');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(4);
    for (const item of items) {
      expect(within(item).getByRole('button')).toBeInTheDocument();
    }
  });

  it('carries none of the tab ARIA Ark emits', () => {
    const { container } = renderStepper({ withContent: true });
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.queryByRole('tab')).toBeNull();
    expect(screen.queryByRole('tabpanel', { hidden: true })).toBeNull();
    for (const attribute of ['aria-selected', 'aria-owns', 'aria-controls', 'aria-orientation']) {
      expect(container.querySelector(`[${attribute}]`)).toBeNull();
    }
  });

  // Pins Zag's mergeProps rule the resets rely on: Ark still emits the tab ARIA, and `null` removes
  // it. If an Ark/Zag upgrade changes either, this fails loudly.
  it('relies on Zag mergeProps removing an attribute set to null', () => {
    render(
      <ArkSteps.Root count={1}>
        <ArkSteps.List>
          <ArkSteps.Item index={0}>
            <ArkSteps.Trigger data-testid='bare'>Bare</ArkSteps.Trigger>
          </ArkSteps.Item>
          <ArkSteps.Item index={0}>
            <ArkSteps.Trigger {...ARK_TAB_ARIA_RESET} data-testid='reset'>
              Reset
            </ArkSteps.Trigger>
          </ArkSteps.Item>
        </ArkSteps.List>
        <ArkSteps.Content index={0} data-testid='bare-content' />
        <ArkSteps.Content index={0} {...ARK_CONTENT_ARIA_RESET} data-testid='reset-content' />
      </ArkSteps.Root>,
    );
    const bare = screen.getByTestId('bare');
    expect(bare).toHaveAttribute('role', 'tab');
    expect(bare).toHaveAttribute('aria-selected');
    expect(bare).toHaveAttribute('aria-controls');
    const reset = screen.getByTestId('reset');
    expect(reset).not.toHaveAttribute('role');
    expect(reset).not.toHaveAttribute('aria-selected');
    expect(reset).not.toHaveAttribute('aria-controls');
    expect(screen.getByTestId('bare-content')).toHaveAttribute('role', 'tabpanel');
    expect(screen.getByTestId('bare-content')).toHaveAttribute('tabindex', '0');
    expect(screen.getByTestId('reset-content')).not.toHaveAttribute('tabindex');
  });

  it('keeps a consumer aria-controls and role on the button', () => {
    renderStepper({
      steps: [
        { title: 'General', trigger: { 'aria-controls': 'panel' } },
        { title: 'Review', trigger: { role: 'link' } },
      ],
    });
    expect(trigger(0)).toHaveAttribute('aria-controls', 'panel');
    expect(trigger(1)).toHaveAttribute('role', 'link');
  });

  it('puts aria-current="step" on the button, never on the list item', () => {
    renderStepper();
    expect(trigger(2)).toHaveAttribute('aria-current', 'step');
    for (const item of screen.getAllByRole('listitem')) {
      expect(item).not.toHaveAttribute('aria-current');
    }
    expect(document.querySelectorAll('[aria-current]')).toHaveLength(1);
  });

  it('takes aria-label and aria-labelledby on StepperList, not the root', () => {
    render(
      <>
        <h2 id='steps-title'>Create policy</h2>
        <Stepper data-testid='ps' count={1}>
          <StepperList aria-labelledby='steps-title'>
            <StepperItem index={0}>
              <StepperTrigger>
                <StepperTitle>General</StepperTitle>
              </StepperTrigger>
            </StepperItem>
          </StepperList>
        </Stepper>
      </>,
    );
    expect(screen.getByTestId('ps--list')).toHaveAttribute('aria-labelledby', 'steps-title');
    expect(screen.getByRole('list', { name: 'Create policy' })).toBe(
      screen.getByTestId('ps--list'),
    );
    expect(screen.getByTestId('ps')).not.toHaveAttribute('aria-labelledby');
  });

  it('hides the indicator and separator from assistive tech', () => {
    renderStepper();
    expect(screen.getByTestId('ps--item-0--indicator')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('ps--item-0--separator')).toHaveAttribute('aria-hidden', 'true');
  });

  it('names each button by title, description and status suffix', () => {
    renderStepper();
    expect(screen.getByRole('button', { name: 'General, Completed' })).toBe(trigger(0));
    // jsdom has no layout, so it joins the stacked title and description without a space;
    // browsers separate them because grid children are blockified.
    expect(screen.getByRole('button', { name: /^Rules\s?Optional, Has errors$/ })).toBe(trigger(1));
    expect(screen.getByRole('button', { name: 'Scope' })).toBe(trigger(2));
    expect(screen.getByRole('button', { name: 'Review' })).toBe(trigger(3));
  });

  it('puts the status suffix last inside the trigger, as a screen-reader-only span', () => {
    renderStepper();
    const last = trigger(0).lastElementChild;
    expect(last).toHaveClass('sr-only');
    expect(last).toHaveTextContent(', Completed');
  });

  it('adds no suffix to active and upcoming steps', () => {
    renderStepper();
    expect(trigger(2)).not.toHaveAccessibleName(/Completed|Has errors/);
    expect(trigger(3)).not.toHaveAccessibleName(/Completed|Has errors/);
  });

  it('overrides the suffix with statusLabels and a per-item statusLabel', () => {
    renderStepper({
      step: 2,
      statusLabels: { completed: 'Terminé', danger: 'Erreurs' },
      steps: [
        { title: 'General', status: 'completed' },
        { title: 'Rules', status: 'danger', statusLabel: 'Fix the rules' },
        { title: 'Review' },
      ],
    });
    expect(trigger(0)).toHaveAccessibleName('General, Terminé');
    expect(trigger(1)).toHaveAccessibleName('Rules, Fix the rules');
  });

  it('reaches every step with Tab, in order', async () => {
    renderStepper();
    const buttons = screen.getAllByRole('button');
    for (const button of buttons) {
      expect(button).toHaveAttribute('tabindex', '0');
    }
    for (const button of buttons) {
      await userEvent.tab();
      expect(button).toHaveFocus();
    }
  });

  it.each(['{Enter}', ' '])('activates a focused step with %s', async key => {
    renderStepper();
    const target = trigger(3);
    target.focus();
    await userEvent.keyboard(key);
    expect(target).toHaveAttribute('aria-current', 'step');
  });
});

describe('Stepper — content accessibility', () => {
  it('renders the current body as a group named by its step trigger', () => {
    renderStepper({ withContent: true });
    const group = screen.getByRole('group', { name: 'Scope' });
    expect(group).toBe(screen.getByTestId('ps--content-2'));
    expect(group).toHaveAttribute('aria-labelledby', trigger(2).id);
    expect(trigger(2).id).not.toBe('');
  });

  it('hides the other bodies from assistive tech', () => {
    renderStepper({ withContent: true });
    expect(screen.getAllByRole('group')).toHaveLength(1);
    for (const i of [0, 1, 3]) {
      expect(screen.getByTestId(`ps--content-${i}`)).toHaveAttribute('hidden');
    }
  });

  it('adds no Tab stop on the body: Tab goes from the last step to the first field', async () => {
    renderStepper({ withContent: true });
    for (const i of [0, 1, 2, 3]) {
      expect(screen.getByTestId(`ps--content-${i}`)).not.toHaveAttribute('tabindex');
    }
    trigger(3).focus();
    await userEvent.tab();
    expect(within(screen.getByTestId('ps--content-2')).getByRole('textbox')).toHaveFocus();
  });

  it('warns when StepperTrigger gets its own id, which would leave the body unnamed', () => {
    const warn = rs.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <Stepper count={1} data-testid='ps'>
        <StepperList>
          <StepperItem index={0}>
            <StepperTrigger id='mine'>
              <StepperTitle>General</StepperTitle>
            </StepperTrigger>
          </StepperItem>
        </StepperList>
        <StepperContent index={0}>Body</StepperContent>
      </Stepper>,
    );
    // The id still lands on the button (metrics contract), and the dev warning points to `ids`.
    expect(trigger(0)).toHaveAttribute('id', 'mine');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('ids.triggerId'));
    warn.mockRestore();
  });

  it('takes deterministic ids from the root ids prop', () => {
    render(
      <Stepper
        count={1}
        ids={{ triggerId: i => `step-${i}`, contentId: i => `body-${i}` }}
        data-testid='ps'
      >
        <StepperList>
          <StepperItem index={0}>
            <StepperTrigger>
              <StepperTitle>General</StepperTitle>
            </StepperTrigger>
          </StepperItem>
        </StepperList>
        <StepperContent index={0}>Body</StepperContent>
      </Stepper>,
    );
    expect(trigger(0)).toHaveAttribute('id', 'step-0');
    expect(screen.getByTestId('ps--content-0')).toHaveAttribute('id', 'body-0');
    expect(screen.getByTestId('ps--content-0')).toHaveAttribute('aria-labelledby', 'step-0');
  });
});
