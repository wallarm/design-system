import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StepperFixture } from '../../testUtils/StepperFixture';
import { TestIdProvider } from '../../utils/testId';
import { Button } from '../Button';
import { Stepper, StepperContent, StepperNextTrigger, StepperPrevTrigger } from '.';

describe('Stepper — test ids', () => {
  it('cascades {id}--list, --item-{index}, --content-{index}, --prev/next-trigger and the item parts', () => {
    render(
      <StepperFixture
        withContent
        withNav
        steps={[
          { title: 'General', description: 'Optional' },
          { title: 'Rules' },
          { title: 'Review' },
        ]}
      />,
    );
    const slots: [string, string][] = [
      ['ps', 'stepper'],
      ['ps--list', 'stepper-list'],
      ['ps--item-0--trigger', 'stepper-trigger'],
      ['ps--item-0--indicator', 'stepper-indicator'],
      ['ps--item-0--title', 'stepper-title'],
      ['ps--item-0--description', 'stepper-description'],
      ['ps--item-0--separator', 'stepper-separator'],
      ['ps--prev-trigger', 'stepper-prev-trigger'],
      ['ps--next-trigger', 'stepper-next-trigger'],
    ];
    for (const index of [0, 1, 2]) {
      slots.push(
        [`ps--item-${index}`, 'stepper-item'],
        [`ps--content-${index}`, 'stepper-content'],
      );
    }
    for (const [testId, slot] of slots) {
      expect(screen.getByTestId(testId)).toHaveAttribute('data-slot', slot);
    }
  });

  it('makes an item override the base for its own parts', () => {
    render(
      <StepperFixture
        steps={[{ title: 'General', item: { 'data-testid': 'step-general' } }, { title: 'Review' }]}
      />,
    );
    expect(screen.getByTestId('step-general')).toHaveAttribute('data-slot', 'stepper-item');
    for (const part of ['trigger', 'title', 'indicator', 'separator']) {
      expect(screen.getByTestId(`step-general--${part}`)).toBeInTheDocument();
    }
    expect(screen.queryByTestId('ps--item-0')).toBeNull();
    expect(screen.getByTestId('ps--item-1--trigger')).toBeInTheDocument();
  });

  it('lets a part override only its own id', () => {
    render(
      <StepperFixture
        steps={[{ title: 'General', trigger: { 'data-testid': 'general-button' } }]}
      />,
    );
    expect(screen.getByTestId('general-button')).toHaveAttribute('data-slot', 'stepper-trigger');
    expect(screen.getByTestId('ps--item-0--title')).toBeInTheDocument();
  });

  it('lets Content, Prev and Next override their own ids, plain or asChild', () => {
    render(
      <Stepper data-testid='ps' count={2} defaultStep={1}>
        <StepperContent index={0} data-testid='body'>
          Body
        </StepperContent>
        <StepperPrevTrigger data-testid='back'>Back</StepperPrevTrigger>
        <StepperNextTrigger asChild data-testid='next'>
          <Button>Next</Button>
        </StepperNextTrigger>
      </Stepper>,
    );
    const overrides: [string, string, string][] = [
      ['body', 'stepper-content', 'ps--content-0'],
      ['back', 'stepper-prev-trigger', 'ps--prev-trigger'],
      ['next', 'stepper-next-trigger', 'ps--next-trigger'],
    ];
    for (const [testId, slot, derived] of overrides) {
      expect(screen.getByTestId(testId)).toHaveAttribute('data-slot', slot);
      expect(screen.queryByTestId(derived)).toBeNull();
    }
    expect(screen.getByTestId('next').tagName).toBe('BUTTON');
  });

  it('honours an item override without a root id', () => {
    render(
      <StepperFixture
        data-testid={undefined}
        steps={[{ title: 'General', item: { 'data-testid': 'step-general' } }]}
      />,
    );
    expect(screen.getByTestId('step-general--title')).toBeInTheDocument();
  });

  it('keeps the DOM clean without a data-testid', () => {
    const { container } = render(
      <StepperFixture
        data-testid={undefined}
        withContent
        withNav
        steps={[{ title: 'General', description: 'Optional' }, { title: 'Review' }]}
      />,
    );
    expect(container.querySelector('[data-testid]')).toBeNull();
  });

  it('never inherits the parent cascade base as its own id', () => {
    const { container } = render(
      <TestIdProvider value='drawer'>
        <StepperFixture data-testid={undefined} steps={[{ title: 'General' }]} />
      </TestIdProvider>,
    );
    expect(container.querySelector('[data-testid="drawer"]')).toBeNull();
    expect(container.querySelector('[data-testid]')).toBeNull();
  });
});
