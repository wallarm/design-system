import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { captureAnalyticsClicks } from '../../testUtils/captureAnalyticsClicks';
import { StepperFixture } from '../../testUtils/StepperFixture';
import { Button } from '../Button';
import { Stepper, StepperContent, StepperNextTrigger, StepperPrevTrigger } from '.';

const PROPS = '{"flow": "create policy", "step": "Правила — rules", "n": 2}';

const trigger = (index: number) => screen.getByTestId(`ps--item-${index}--trigger`);

describe('Stepper — analytics (docs/metrics/contract.md)', () => {
  it('lands data-analytics-id on the real step button', () => {
    render(
      <StepperFixture
        steps={[{ title: 'General', trigger: { 'data-analytics-id': 'POLICY_STEP_GENERAL' } }]}
      />,
    );
    const button = trigger(0);
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('data-analytics-id', 'POLICY_STEP_GENERAL');
    expect(screen.getByTestId('ps--item-0')).not.toHaveAttribute('data-analytics-id');
    expect(screen.getByTestId('ps')).not.toHaveAttribute('data-analytics-id');
  });

  it('forwards data-analytics-props byte-for-byte', () => {
    render(
      <StepperFixture
        steps={[
          {
            title: 'Rules',
            trigger: { 'data-analytics-id': 'POLICY_STEP', 'data-analytics-props': PROPS },
          },
        ]}
      />,
    );
    expect(trigger(0).getAttribute('data-analytics-props')).toBe(PROPS);
  });

  it('forwards arbitrary data-*, aria-* and id to the button', () => {
    render(
      <StepperFixture
        steps={[
          {
            title: 'Rules',
            trigger: { id: 'rules-step', 'aria-describedby': 'hint', 'data-foo': 'bar' },
          },
        ]}
      />,
    );
    const button = trigger(0);
    expect(button).toHaveAttribute('id', 'rules-step');
    expect(button).toHaveAttribute('data-foo', 'bar');
    expect(button).toHaveAttribute('aria-describedby', 'hint');
  });

  it('forwards arbitrary attributes on the root and the content', () => {
    render(
      <Stepper data-testid='ps' count={1} data-analytics-id='POLICY_STEPPER' data-foo='bar'>
        <StepperContent index={0} data-analytics-id='POLICY_STEP_BODY' id='body'>
          Body
        </StepperContent>
      </Stepper>,
    );
    expect(screen.getByTestId('ps')).toHaveAttribute('data-analytics-id', 'POLICY_STEPPER');
    expect(screen.getByTestId('ps')).toHaveAttribute('data-foo', 'bar');
    expect(screen.getByTestId('ps--content-0')).toHaveAttribute(
      'data-analytics-id',
      'POLICY_STEP_BODY',
    );
    expect(screen.getByTestId('ps--content-0')).toHaveAttribute('id', 'body');
  });

  it.each([
    ['Prev plain, Next asChild', false],
    ['Prev asChild, Next plain', true],
  ] as const)('lands analytics on the Prev / Next button: %s', (_, prevAsChild) => {
    render(
      <Stepper data-testid='ps' count={3} defaultStep={1}>
        {prevAsChild ? (
          <StepperPrevTrigger asChild data-analytics-id='POLICY_BACK' data-analytics-props={PROPS}>
            <Button variant='outline' color='neutral'>
              Back
            </Button>
          </StepperPrevTrigger>
        ) : (
          <StepperPrevTrigger data-analytics-id='POLICY_BACK' data-analytics-props={PROPS}>
            Back
          </StepperPrevTrigger>
        )}
        {prevAsChild ? (
          <StepperNextTrigger data-analytics-id='POLICY_NEXT' data-analytics-props={PROPS}>
            Next
          </StepperNextTrigger>
        ) : (
          <StepperNextTrigger asChild data-analytics-id='POLICY_NEXT' data-analytics-props={PROPS}>
            <Button>Next</Button>
          </StepperNextTrigger>
        )}
      </Stepper>,
    );
    for (const [testId, id] of [
      ['ps--prev-trigger', 'POLICY_BACK'],
      ['ps--next-trigger', 'POLICY_NEXT'],
    ] as const) {
      const button = screen.getByTestId(testId);
      expect(button.tagName).toBe('BUTTON');
      expect(button).toHaveAttribute('data-analytics-id', id);
      expect(button.getAttribute('data-analytics-props')).toBe(PROPS);
    }
  });

  it('keeps the attributes through a step change', async () => {
    const Controlled = () => {
      const [step, setStep] = useState(0);
      return (
        <StepperFixture
          step={step}
          onStepChange={details => setStep(details.step)}
          steps={[
            {
              title: 'General',
              trigger: { 'data-analytics-id': 'STEP_0', 'data-analytics-props': PROPS },
            },
            { title: 'Rules', trigger: { 'data-analytics-id': 'STEP_1' } },
          ]}
        />
      );
    };
    render(<Controlled />);
    await userEvent.click(trigger(1));
    expect(trigger(1)).toHaveAttribute('aria-current', 'step');
    expect(trigger(0)).toHaveAttribute('data-analytics-id', 'STEP_0');
    expect(trigger(0).getAttribute('data-analytics-props')).toBe(PROPS);
    expect(trigger(1)).toHaveAttribute('data-analytics-id', 'STEP_1');
  });

  it('lets a document-level listener see the click (no stopPropagation)', async () => {
    const captured = captureAnalyticsClicks();
    render(
      <StepperFixture
        withNav
        steps={[
          { title: 'General' },
          { title: 'Rules', trigger: { 'data-analytics-id': 'POLICY_STEP_RULES' } },
        ]}
      />,
    );
    // Click the inner title span: resolution walks up to the button via closest().
    await userEvent.click(screen.getByTestId('ps--item-1--title'));
    expect(captured).toHaveBeenCalledWith('POLICY_STEP_RULES');
  });

  it('lets a document-level listener see a Next click', async () => {
    const captured = captureAnalyticsClicks();
    render(
      <Stepper data-testid='ps' count={2}>
        <StepperNextTrigger data-analytics-id='POLICY_NEXT'>Next</StepperNextTrigger>
      </Stepper>,
    );
    await userEvent.click(screen.getByTestId('ps--next-trigger'));
    expect(captured).toHaveBeenCalledWith('POLICY_NEXT');
  });
});
