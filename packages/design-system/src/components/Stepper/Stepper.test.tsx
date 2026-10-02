import { createRef, type FC, type ReactNode, useState } from 'react';
import { useStepsContext } from '@ark-ui/react/steps';
import { act, render, renderHook, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { POLICY, StepperFixture, type StepperFixtureProps } from '../../testUtils/StepperFixture';
import { Button } from '../Button';
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperNextTrigger,
  StepperPrevTrigger,
  type StepperProps,
  StepperRootProvider,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
  type UseStepperContextReturn,
  useStepper,
  useStepperContext,
  useStepperItemContext,
} from '.';

afterEach(() => vi.restoreAllMocks());

const FigmaExample: FC<StepperFixtureProps> = props => <StepperFixture {...props} />;

const trigger = (index: number) => screen.getByTestId(`ps--item-${index}--trigger`);
const content = (index: number) => screen.getByTestId(`ps--content-${index}`);
const prev = () => screen.getByTestId('ps--prev-trigger');
const next = () => screen.getByTestId('ps--next-trigger');
const currentSteps = () => document.querySelectorAll('[aria-current="step"]');

describe('Stepper', () => {
  it('renders one button per StepperItem, from the explicit count and index', () => {
    render(<FigmaExample />);
    expect(screen.getAllByRole('button')).toHaveLength(4);
    expect(screen.getByTestId('ps--item-3--indicator')).toHaveTextContent('4');
  });

  it('calls onStepChange forward and back', async () => {
    const onStepChange = vi.fn();
    render(<FigmaExample defaultStep={1} onStepChange={onStepChange} />);
    await userEvent.click(trigger(3));
    expect(onStepChange).toHaveBeenLastCalledWith({ step: 3 });
    await userEvent.click(trigger(0));
    expect(onStepChange).toHaveBeenLastCalledWith({ step: 0 });
    expect(onStepChange).toHaveBeenCalledTimes(2);
  });

  it('moves aria-current to the clicked step when uncontrolled', async () => {
    render(<FigmaExample />);
    expect(trigger(0)).toHaveAttribute('aria-current', 'step');
    await userEvent.click(trigger(2));
    expect(trigger(2)).toHaveAttribute('aria-current', 'step');
    expect(trigger(0)).not.toHaveAttribute('aria-current');
    expect(currentSteps()).toHaveLength(1);
  });

  it('does not move when controlled until the parent updates step', async () => {
    const onStepChange = vi.fn();
    const { rerender } = render(<FigmaExample step={0} onStepChange={onStepChange} />);
    await userEvent.click(trigger(2));
    expect(onStepChange).toHaveBeenCalledWith({ step: 2 });
    expect(trigger(0)).toHaveAttribute('aria-current', 'step');
    rerender(<FigmaExample step={2} onStepChange={onStepChange} />);
    expect(trigger(2)).toHaveAttribute('aria-current', 'step');
    expect(currentSteps()).toHaveLength(1);
  });

  it('follows the parent in a controlled round trip', async () => {
    const Controlled = () => {
      const [step, setStep] = useState(0);
      return <FigmaExample step={step} onStepChange={({ step }) => setStep(step)} />;
    };
    render(<Controlled />);
    await userEvent.click(trigger(3));
    expect(trigger(3)).toHaveAttribute('aria-current', 'step');
    await userEvent.click(trigger(1));
    expect(trigger(1)).toHaveAttribute('aria-current', 'step');
  });

  it('resolves data-status like the Figma example, on the item and every item part', () => {
    render(
      <FigmaExample
        step={2}
        steps={POLICY.map((title, i) => ({
          title,
          description: 'Optional',
          status: (['completed', 'danger', 'danger', 'upcoming'] as const)[i],
        }))}
      />,
    );
    const expected = ['completed', 'danger', 'active', 'upcoming'];
    for (const part of ['', '--trigger', '--indicator', '--title', '--description']) {
      expect(
        [0, 1, 2, 3].map(i => screen.getByTestId(`ps--item-${i}${part}`).dataset.status),
      ).toEqual(expected);
    }
    expect(
      [0, 1, 2].map(i => screen.getByTestId(`ps--item-${i}--separator`).dataset.status),
    ).toEqual(expected.slice(0, 3));
  });

  it('shows the current danger step as active, and danger again after leaving it', async () => {
    render(<FigmaExample defaultStep={1} />);
    expect(trigger(1)).toHaveAttribute('data-status', 'active');
    expect(screen.getByTestId('ps--item-1--title')).toHaveAttribute('data-status', 'active');
    const indicator = screen.getByTestId('ps--item-1--indicator');
    expect(indicator).toHaveAttribute('data-status', 'active');
    expect(indicator).toHaveTextContent('2');
    expect(screen.getByTestId('ps--item-1--separator')).toHaveAttribute('data-status', 'active');
    await userEvent.click(trigger(2));
    expect(trigger(1)).toHaveAttribute('data-status', 'danger');
    expect(screen.getByTestId('ps--item-1--indicator')).toHaveTextContent('!');
  });

  it('renders the indicator content by status', () => {
    render(<FigmaExample step={2} />);
    expect(screen.getByTestId('ps--item-0--indicator').querySelector('svg')).not.toBeNull();
    expect(screen.getByTestId('ps--item-1--indicator')).toHaveTextContent('!');
    expect(screen.getByTestId('ps--item-2--indicator')).toHaveTextContent('3');
    expect(screen.getByTestId('ps--item-3--indicator')).toHaveTextContent('4');
  });

  it('maps step status to shared NumericBadge variants without adding interactive indicators', () => {
    render(<FigmaExample step={2} />);
    const variants = [
      ['secondary', 'neutral'],
      ['secondary', 'danger'],
      ['secondary', 'brand'],
      ['outline', 'neutral'],
    ];
    for (const [index, [type, color]] of variants.entries()) {
      const indicator = screen.getByTestId(`ps--item-${index}--indicator`);
      expect(indicator).toHaveAttribute('data-type', type);
      expect(indicator).toHaveAttribute('data-color', color);
      expect(indicator).toHaveAttribute('aria-hidden', 'true');
      expect(indicator).not.toHaveAttribute('tabindex');
    }
    expect(screen.getAllByRole('button')).toHaveLength(4);
  });

  it('lets StepperIndicator children replace the default content', () => {
    render(
      <FigmaExample
        steps={[
          { title: 'General', status: 'completed', indicator: 'A' },
          { title: 'Rules', indicator: <svg data-testid='lock' /> },
          { title: 'Review' },
        ]}
      />,
    );
    expect(screen.getByTestId('ps--item-0--indicator')).toHaveTextContent(/^A$/);
    expect(screen.getByTestId('ps--item-0--indicator').querySelector('svg')).toBeNull();
    expect(within(screen.getByTestId('ps--item-1--indicator')).getByTestId('lock')).toBeTruthy();
    expect(screen.getByTestId('ps--item-2--indicator')).toHaveTextContent('3');
  });

  it('renders count - 1 separators: StepperSeparator renders nothing on the last item', () => {
    render(<FigmaExample />);
    for (const i of [0, 1, 2]) {
      expect(screen.getByTestId(`ps--item-${i}--separator`)).toBeInTheDocument();
    }
    expect(screen.queryByTestId('ps--item-3--separator')).toBeNull();
    expect(document.querySelectorAll('[data-slot="stepper-separator"]')).toHaveLength(3);
  });

  it('gives every indicator status its own padding, the upcoming one net of its border', () => {
    render(<FigmaExample step={2} />);
    // Completed: 2px + 12px check + 2px keeps the badge 16px wide, as in Figma.
    const completed = screen.getByTestId('ps--item-0--indicator');
    expect(completed).toHaveClass('px-2', 'py-2');
    expect(completed).not.toHaveClass('px-4');
    for (const i of [1, 2]) {
      const indicator = screen.getByTestId(`ps--item-${i}--indicator`);
      expect(indicator).toHaveClass('px-4', 'py-2');
      expect(indicator).not.toHaveClass('px-3', 'py-1');
    }
    const upcoming = screen.getByTestId('ps--item-3--indicator');
    expect(upcoming).toHaveClass('border-1', 'px-3', 'py-1');
    expect(upcoming).not.toHaveClass('px-4');
    expect(upcoming).not.toHaveClass('py-2');
  });

  it('lays the trigger out as a grid: indicator over two rows, title row 1, description row 2', () => {
    render(
      <FigmaExample steps={[{ title: 'General', description: 'Optional' }, { title: 'Review' }]} />,
    );
    expect(trigger(0)).toHaveClass(
      'grid',
      'grid-cols-[auto_minmax(0,1fr)]',
      'grid-rows-[20px]',
      'gap-x-4',
    );
    expect(screen.getByTestId('ps--item-0--indicator')).toHaveClass('row-span-2', 'col-start-1');
    expect(screen.getByTestId('ps--item-0--title')).toHaveClass('col-start-2', 'row-start-1');
    expect(screen.getByTestId('ps--item-0--title')).not.toHaveClass('-mb-2');
    expect(screen.getByTestId('ps--item-0--description')).toHaveClass(
      'col-start-2',
      'row-start-2',
      '-mt-2',
    );
    for (const part of ['title', 'description']) {
      expect(screen.getByTestId(`ps--item-0--${part}`)).toHaveClass(
        'max-w-320',
        'truncate',
        'block',
      );
    }
  });

  it('puts the bar styles on the list and keeps the root a plain container', () => {
    render(<FigmaExample />);
    expect(screen.getByTestId('ps--list')).toHaveClass(
      'border-b-1',
      'border-border-primary-light',
      'px-24',
      'py-8',
      'flex',
      'items-start',
      'list-none',
    );
    expect(screen.getByTestId('ps')).not.toHaveClass('border-b-1');
    expect(screen.getByTestId('ps')).not.toHaveClass('px-24');
  });

  it('renders type="button" and never submits a surrounding form', async () => {
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <FigmaExample withNav />
      </form>,
    );
    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveAttribute('type', 'button');
    }
    await userEvent.click(trigger(2));
    await userEvent.click(next());
    await userEvent.click(prev());
    expect(onSubmit).not.toHaveBeenCalled();
    expect(trigger(2)).toHaveAttribute('aria-current', 'step');
  });

  it('runs a consumer onClick, and preventDefault in it cancels navigation', async () => {
    const onClick = vi.fn();
    const onBlocked = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    const onStepChange = vi.fn();
    render(
      <FigmaExample
        onStepChange={onStepChange}
        steps={[
          { title: 'General' },
          { title: 'Rules', trigger: { onClick } },
          { title: 'Review', trigger: { onClick: onBlocked } },
        ]}
      />,
    );
    await userEvent.click(trigger(1));
    expect(onClick).toHaveBeenCalledOnce();
    expect(trigger(1)).toHaveAttribute('aria-current', 'step');
    await userEvent.click(trigger(2));
    expect(onBlocked).toHaveBeenCalledOnce();
    expect(trigger(1)).toHaveAttribute('aria-current', 'step');
    expect(onStepChange).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['step', { step: 4 }, 3],
    ['step', { step: -1 }, 0],
    ['defaultStep', { defaultStep: 99 }, 3],
  ] as const)('clamps an out-of-range %s and warns', (_, props, expected) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<FigmaExample {...props} />);
    expect(trigger(expected)).toHaveAttribute('aria-current', 'step');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('out of range'));
  });

  it('keeps the last step current when an uncontrolled count shrinks below the step, and warns', async () => {
    const Items: FC<{ count: number }> = ({ count }) => (
      <FigmaExample steps={POLICY.slice(0, count).map(title => ({ title }))} />
    );
    const { rerender } = render(<Items count={4} />);
    await userEvent.click(trigger(3));
    expect(trigger(3)).toHaveAttribute('aria-current', 'step');

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    rerender(<Items count={2} />);
    expect(currentSteps()).toHaveLength(1);
    expect(trigger(1)).toHaveAttribute('aria-current', 'step');
    expect(trigger(1)).toHaveAttribute('data-status', 'active');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('out of range'));

    // An earlier step still navigates normally.
    await userEvent.click(trigger(0));
    expect(trigger(0)).toHaveAttribute('aria-current', 'step');
    expect(currentSteps()).toHaveLength(1);
  });

  it('does not fire onStepChange for a click on the current step', async () => {
    const onStepChange = vi.fn();
    render(<FigmaExample defaultStep={1} onStepChange={onStepChange} />);
    await userEvent.click(trigger(1));
    expect(onStepChange).not.toHaveBeenCalled();
  });

  it('does not warn for an in-range step', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<FigmaExample step={3} />);
    expect(warn).not.toHaveBeenCalled();
  });

  it('warns for more than six steps', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<FigmaExample steps={['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(title => ({ title }))} />);
    expect(screen.getAllByRole('button')).toHaveLength(7);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('7 steps'));
  });

  it('works when items sit inside a wrapper component, since index is explicit', async () => {
    const Steps = () => (
      <>
        {['General', 'Rules', 'Review'].map((title, i) => (
          <StepperItem key={title} index={i}>
            <StepperTrigger>
              <StepperIndicator />
              <StepperTitle>{title}</StepperTitle>
            </StepperTrigger>
            <StepperSeparator />
          </StepperItem>
        ))}
      </>
    );
    render(
      <Stepper data-testid='ps' count={3}>
        <StepperList>
          <Steps />
        </StepperList>
      </Stepper>,
    );
    expect(screen.getByTestId('ps--item-2--indicator')).toHaveTextContent('3');
    expect(screen.queryByTestId('ps--item-2--separator')).toBeNull();
    await userEvent.click(trigger(2));
    expect(trigger(2)).toHaveAttribute('aria-current', 'step');
  });

  it('changes step when the title span inside the tooltip trigger is clicked', async () => {
    render(<FigmaExample />);
    await userEvent.click(screen.getByTestId('ps--item-3--title'));
    expect(trigger(3)).toHaveAttribute('aria-current', 'step');
  });

  it('merges className and forwards refs to the real node of every part', () => {
    const refs = {
      root: createRef<HTMLDivElement>(),
      list: createRef<HTMLOListElement>(),
      item: createRef<HTMLLIElement>(),
      trigger: createRef<HTMLButtonElement>(),
      indicator: createRef<HTMLSpanElement>(),
      title: createRef<HTMLSpanElement>(),
      description: createRef<HTMLSpanElement>(),
      separator: createRef<HTMLSpanElement>(),
      content: createRef<HTMLDivElement>(),
      prev: createRef<HTMLButtonElement>(),
      next: createRef<HTMLButtonElement>(),
    };
    render(
      <Stepper data-testid='ps' count={2} ref={refs.root} className='c-root'>
        <StepperList ref={refs.list} className='c-list'>
          <StepperItem index={0} ref={refs.item} className='c-item'>
            <StepperTrigger ref={refs.trigger} className='c-trigger'>
              <StepperIndicator ref={refs.indicator} className='c-indicator' />
              <StepperTitle ref={refs.title} className='c-title'>
                General
              </StepperTitle>
              <StepperDescription ref={refs.description} className='c-description'>
                Optional
              </StepperDescription>
            </StepperTrigger>
            <StepperSeparator ref={refs.separator} className='c-separator' />
          </StepperItem>
        </StepperList>
        <StepperContent index={0} ref={refs.content} className='c-content'>
          Body
        </StepperContent>
        <StepperPrevTrigger ref={refs.prev} className='c-prev'>
          Back
        </StepperPrevTrigger>
        <StepperNextTrigger ref={refs.next} className='c-next'>
          Next
        </StepperNextTrigger>
      </Stepper>,
    );
    const nodes: [keyof typeof refs, string, string][] = [
      ['root', 'ps', 'DIV'],
      ['list', 'ps--list', 'OL'],
      ['item', 'ps--item-0', 'LI'],
      ['trigger', 'ps--item-0--trigger', 'BUTTON'],
      ['indicator', 'ps--item-0--indicator', 'SPAN'],
      ['title', 'ps--item-0--title', 'SPAN'],
      ['description', 'ps--item-0--description', 'SPAN'],
      ['separator', 'ps--item-0--separator', 'SPAN'],
      ['content', 'ps--content-0', 'DIV'],
      ['prev', 'ps--prev-trigger', 'BUTTON'],
      ['next', 'ps--next-trigger', 'BUTTON'],
    ];
    for (const [key, testId, tag] of nodes) {
      const node = screen.getByTestId(testId);
      expect(refs[key].current).toBe(node);
      expect(node.tagName).toBe(tag);
      expect(node).toHaveClass(`c-${key}`);
    }
    expect(trigger(0)).toHaveClass('cursor-pointer');
  });

  it('sets data-slot on every part', () => {
    render(
      <FigmaExample
        withContent
        withNav
        steps={[{ title: 'General', description: 'Optional' }, { title: 'Review' }]}
      />,
    );
    const root = screen.getByTestId('ps');
    expect(root).toHaveAttribute('data-slot', 'stepper');
    for (const slot of [
      'stepper-list',
      'stepper-item',
      'stepper-trigger',
      'stepper-indicator',
      'stepper-title',
      'stepper-description',
      'stepper-separator',
      'stepper-content',
      'stepper-prev-trigger',
      'stepper-next-trigger',
    ]) {
      expect(root.querySelector(`[data-slot="${slot}"]`)).not.toBeNull();
    }
    expect(within(root).getByTestId('ps--item-0--description')).toHaveTextContent('Optional');
  });
});

describe('Stepper — content', () => {
  it('keeps every StepperContent mounted and shows only the current one', async () => {
    render(<FigmaExample withContent />);
    expect(content(0)).toBeVisible();
    for (const i of [1, 2, 3]) {
      expect(content(i)).toBeInTheDocument();
      expect(content(i)).not.toBeVisible();
      expect(content(i)).toHaveAttribute('hidden');
      expect(content(i)).toHaveAttribute('data-state', 'closed');
    }
    await userEvent.click(trigger(2));
    expect(content(2)).toBeVisible();
    expect(content(2)).toHaveAttribute('data-state', 'open');
    expect(content(0)).not.toBeVisible();
  });

  it('keeps field values when moving between steps', async () => {
    render(<FigmaExample withContent />);
    const input = within(content(0)).getByRole('textbox');
    await userEvent.type(input, 'Policy A');
    await userEvent.click(trigger(1));
    await userEvent.click(trigger(0));
    expect(within(content(0)).getByRole('textbox')).toHaveValue('Policy A');
  });

  it('follows a controlled step', () => {
    const { rerender } = render(<FigmaExample withContent step={1} />);
    expect(content(1)).toBeVisible();
    rerender(<FigmaExample withContent step={3} />);
    expect(content(3)).toBeVisible();
    expect(content(1)).not.toBeVisible();
  });
});

describe('Stepper — Prev / Next triggers', () => {
  it('moves back and forward and fires onStepChange', async () => {
    const onStepChange = vi.fn();
    render(<FigmaExample withNav withContent onStepChange={onStepChange} />);
    await userEvent.click(next());
    expect(onStepChange).toHaveBeenLastCalledWith({ step: 1 });
    expect(trigger(1)).toHaveAttribute('aria-current', 'step');
    expect(content(1)).toBeVisible();
    await userEvent.click(next());
    expect(trigger(2)).toHaveAttribute('aria-current', 'step');
    await userEvent.click(prev());
    expect(onStepChange).toHaveBeenLastCalledWith({ step: 1 });
    expect(trigger(1)).toHaveAttribute('aria-current', 'step');
  });

  it('disables Prev on the first step and Next on the last step', async () => {
    render(<FigmaExample withNav />);
    expect(prev()).toBeDisabled();
    expect(next()).toBeEnabled();
    await userEvent.click(trigger(3));
    expect(prev()).toBeEnabled();
    expect(next()).toBeDisabled();
  });

  it('never moves the step to count (Ark "completed"): there is always a current step', async () => {
    const onStepChange = vi.fn();
    render(<FigmaExample withNav withContent onStepChange={onStepChange} />);
    for (let i = 0; i < 6; i++) await userEvent.click(next());
    expect(onStepChange.mock.calls.map(([d]) => d.step)).toEqual([1, 2, 3]);
    expect(trigger(3)).toHaveAttribute('aria-current', 'step');
    expect(currentSteps()).toHaveLength(1);
    expect(content(3)).toBeVisible();
  });

  it('blocks a last-step Next even when an asChild child ignores disabled', async () => {
    const onStepChange = vi.fn();
    render(
      <Stepper data-testid='ps' count={2} defaultStep={1} onStepChange={onStepChange}>
        <StepperList>
          {['A', 'B'].map((title, i) => (
            <StepperItem key={title} index={i}>
              <StepperTrigger>
                <StepperTitle>{title}</StepperTitle>
              </StepperTrigger>
            </StepperItem>
          ))}
        </StepperList>
        <StepperNextTrigger asChild>
          {/* A <div> has no `disabled`, so only the guarded click stops it. */}
          <div data-testid='fake-next'>Next</div>
        </StepperNextTrigger>
      </Stepper>,
    );
    await userEvent.click(screen.getByTestId('fake-next'));
    expect(onStepChange).not.toHaveBeenCalled();
    expect(trigger(1)).toHaveAttribute('aria-current', 'step');
  });

  it('renders the asChild child as the trigger, keeping its own attributes', async () => {
    render(
      <Stepper data-testid='ps' count={2}>
        <StepperList>
          {['A', 'B'].map((title, i) => (
            <StepperItem key={title} index={i}>
              <StepperTrigger>
                <StepperTitle>{title}</StepperTitle>
              </StepperTrigger>
            </StepperItem>
          ))}
        </StepperList>
        <StepperNextTrigger asChild>
          <button type='button' className='child' data-foo='bar'>
            Next
          </button>
        </StepperNextTrigger>
      </Stepper>,
    );
    expect(next()).toHaveClass('child');
    expect(next()).toHaveAttribute('data-foo', 'bar');
    expect(next()).toHaveAttribute('data-slot', 'stepper-next-trigger');
    await userEvent.click(next());
    expect(trigger(1)).toHaveAttribute('aria-current', 'step');
  });

  it.each([
    ['Next on the last step', 1, 'next'],
    ['Prev on the first step', 0, 'prev'],
  ] as const)(
    'keeps %s disabled when an asChild child sets disabled={false}',
    async (_, defaultStep, which) => {
      const onStepChange = vi.fn();
      render(
        <Stepper data-testid='ps' count={2} defaultStep={defaultStep} onStepChange={onStepChange}>
          {which === 'next' ? (
            <StepperNextTrigger asChild>
              <Button disabled={false}>Next</Button>
            </StepperNextTrigger>
          ) : (
            <StepperPrevTrigger asChild>
              <Button disabled={false}>Back</Button>
            </StepperPrevTrigger>
          )}
        </Stepper>,
      );
      const button = which === 'next' ? next() : prev();
      expect(button).toBeDisabled();
      await userEvent.click(button);
      expect(onStepChange).not.toHaveBeenCalled();
    },
  );

  it('keeps an asChild child disabled={true} on an enabled step', () => {
    render(
      <Stepper data-testid='ps' count={3} defaultStep={1}>
        <StepperPrevTrigger asChild>
          <Button disabled>Back</Button>
        </StepperPrevTrigger>
        <StepperNextTrigger asChild>
          <Button disabled>Next</Button>
        </StepperNextTrigger>
      </Stepper>,
    );
    expect(prev()).toBeDisabled();
    expect(next()).toBeDisabled();
  });

  it.each([
    ['Next', 0, StepperNextTrigger, 'ps--next-trigger', 1],
    ['Prev', 2, StepperPrevTrigger, 'ps--prev-trigger', 1],
  ] as const)(
    'runs a consumer onClick on %s, plain and on an asChild Button',
    async (_, defaultStep, Trigger, testId, expected) => {
      const onClick = vi.fn();
      const childClick = vi.fn();
      const onStepChange = vi.fn();
      const { unmount } = render(
        <Stepper data-testid='ps' count={3} defaultStep={defaultStep} onStepChange={onStepChange}>
          <Trigger onClick={onClick}>Go</Trigger>
        </Stepper>,
      );
      await userEvent.click(screen.getByTestId(testId));
      expect(onClick).toHaveBeenCalledOnce();
      expect(onStepChange).toHaveBeenLastCalledWith({ step: expected });
      unmount();

      render(
        <Stepper data-testid='ps' count={3} defaultStep={defaultStep} onStepChange={onStepChange}>
          <Trigger asChild onClick={onClick}>
            <Button onClick={childClick}>Go</Button>
          </Trigger>
        </Stepper>,
      );
      await userEvent.click(screen.getByTestId(testId));
      expect(childClick).toHaveBeenCalledOnce();
      expect(onClick).toHaveBeenCalledTimes(2);
      expect(onStepChange).toHaveBeenCalledTimes(2);
      expect(onStepChange).toHaveBeenLastCalledWith({ step: expected });
    },
  );

  it.each([
    ['Next', 0, StepperNextTrigger, 'ps--next-trigger'],
    ['Prev', 2, StepperPrevTrigger, 'ps--prev-trigger'],
  ] as const)(
    'lets preventDefault in a consumer onClick on %s cancel navigation',
    async (_, defaultStep, Trigger, testId) => {
      const onStepChange = vi.fn();
      const childClick = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
      render(
        <Stepper data-testid='ps' count={3} defaultStep={defaultStep} onStepChange={onStepChange}>
          <Trigger asChild>
            <Button onClick={childClick}>Go</Button>
          </Trigger>
        </Stepper>,
      );
      await userEvent.click(screen.getByTestId(testId));
      expect(childClick).toHaveBeenCalledOnce();
      expect(onStepChange).not.toHaveBeenCalled();
    },
  );

  it('steps back from the shown step after an uncontrolled count shrinks', async () => {
    const Items: FC<{ count: number }> = ({ count }) => (
      <FigmaExample withNav steps={POLICY.slice(0, count).map(title => ({ title }))} />
    );
    const { rerender } = render(<Items count={4} />);
    await userEvent.click(trigger(3));
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    rerender(<Items count={2} />);
    expect(trigger(1)).toHaveAttribute('aria-current', 'step');
    expect(prev()).toBeEnabled();
    await userEvent.click(prev());
    expect(trigger(0)).toHaveAttribute('aria-current', 'step');
    expect(prev()).toBeDisabled();
  });

  it('never submits the form when Next swaps for the submit button on the last step', async () => {
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    const Recipe = () => {
      const [step, setStep] = useState(0);
      return (
        <form onSubmit={onSubmit}>
          <Stepper data-testid='ps' count={3} step={step} onStepChange={d => setStep(d.step)}>
            {step === 2 ? (
              <Button type='submit' data-testid='submit'>
                Create
              </Button>
            ) : (
              <StepperNextTrigger asChild>
                <Button>Next</Button>
              </StepperNextTrigger>
            )}
          </Stepper>
        </form>
      );
    };
    render(<Recipe />);
    await userEvent.click(next());
    await userEvent.click(next());
    expect(screen.getByTestId('submit')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.click(screen.getByTestId('submit'));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('keeps a consumer disabled on Next', () => {
    render(
      <Stepper data-testid='ps' count={2}>
        <StepperNextTrigger disabled>Next</StepperNextTrigger>
      </Stepper>,
    );
    expect(next()).toBeDisabled();
  });
});

describe('Stepper — hooks', () => {
  it('useStepperItemContext exposes index, current, last and status', async () => {
    const seen: Record<number, unknown> = {};
    const Probe = () => {
      const { index, current, last, status } = useStepperItemContext();
      seen[index] = { current, last, status };
      return null;
    };
    render(
      <Stepper data-testid='ps' count={3} defaultStep={1}>
        <StepperList>
          {(['completed', 'danger', undefined] as const).map((status, i) => (
            <StepperItem key={String(i)} index={i} status={status}>
              <StepperTrigger>
                <StepperTitle>{`Step ${i}`}</StepperTitle>
                <Probe />
              </StepperTrigger>
            </StepperItem>
          ))}
        </StepperList>
      </Stepper>,
    );
    expect(seen).toEqual({
      0: { current: false, last: false, status: 'completed' },
      1: { current: true, last: false, status: 'active' },
      2: { current: false, last: true, status: 'upcoming' },
    });
    await userEvent.click(trigger(0));
    expect(seen[1]).toEqual({ current: false, last: false, status: 'danger' });
  });

  it('useStepperItemContext throws outside a StepperItem', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const Probe = () => {
      useStepperItemContext();
      return null;
    };
    expect(() =>
      render(
        <Stepper count={1}>
          <Probe />
        </Stepper>,
      ),
    ).toThrow(/inside a StepperItem/);
  });

  it('useStepperContext never goes past the last step, unlike Ark', async () => {
    let api: UseStepperContextReturn | undefined;
    let ark: ReturnType<typeof useStepsContext> | undefined;
    const Probe = () => {
      api = useStepperContext();
      ark = useStepsContext();
      return null;
    };
    const onStepChange = vi.fn();
    render(<FigmaExampleWithProbe probe={<Probe />} defaultStep={3} onStepChange={onStepChange} />);
    expect(api?.value).toBe(3);
    expect(api?.hasNextStep).toBe(false);
    expect(api?.hasPrevStep).toBe(true);
    await act(async () => api?.goToNextStep());
    expect(api?.value).toBe(3);
    await act(async () => api?.setStep(99));
    expect(api?.value).toBe(3);
    expect(onStepChange).not.toHaveBeenCalled();
    // Ark itself would reach count: its hasNextStep is still true on the last step.
    expect(ark?.hasNextStep).toBe(true);
    await act(async () => api?.goToPrevStep());
    expect(api?.value).toBe(2);
    expect(onStepChange).toHaveBeenLastCalledWith({ step: 2 });
  });

  it('drops an onStepChange at count reached through the raw Ark API, and still shows a current step', async () => {
    let ark: ReturnType<typeof useStepsContext> | undefined;
    const Probe = () => {
      ark = useStepsContext();
      return null;
    };
    const onStepChange = vi.fn();
    render(<FigmaExampleWithProbe probe={<Probe />} defaultStep={3} onStepChange={onStepChange} />);
    await act(async () => ark?.goToNextStep());
    expect(ark?.value).toBe(4);
    expect(onStepChange).not.toHaveBeenCalled();
    expect(currentSteps()).toHaveLength(1);
    expect(trigger(3)).toHaveAttribute('aria-current', 'step');
    expect(content(3)).toBeVisible();
  });

  it('useStepper + StepperRootProvider drive the same parts with the same guards', async () => {
    const onStepChange = vi.fn();
    const External = () => {
      const stepper = useStepper({ count: 3, defaultStep: 7, onStepChange });
      return (
        <>
          <button type='button' data-testid='external-next' onClick={stepper.goToNextStep}>
            External next
          </button>
          <StepperRootProvider
            value={stepper}
            data-testid='ps'
            statusLabels={{ completed: 'Done' }}
          >
            <StepperList>
              {['A', 'B', 'C'].map((title, i) => (
                <StepperItem key={title} index={i} status='completed'>
                  <StepperTrigger>
                    <StepperTitle>{title}</StepperTitle>
                  </StepperTrigger>
                </StepperItem>
              ))}
            </StepperList>
            <StepperNextTrigger>Next</StepperNextTrigger>
          </StepperRootProvider>
        </>
      );
    };
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<External />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('out of range'));
    expect(screen.getByTestId('ps')).toHaveAttribute('data-slot', 'stepper');
    expect(trigger(2)).toHaveAttribute('aria-current', 'step');
    expect(next()).toBeDisabled();
    await userEvent.click(screen.getByTestId('external-next'));
    expect(onStepChange).not.toHaveBeenCalled();
    expect(trigger(0)).toHaveAccessibleName('A, Done');
    await userEvent.click(trigger(0));
    expect(onStepChange).toHaveBeenLastCalledWith({ step: 0 });
    await userEvent.click(screen.getByTestId('external-next'));
    expect(trigger(1)).toHaveAttribute('aria-current', 'step');
  });

  it('useStepper().setStep clamps, so the machine never reaches Ark "completed"', async () => {
    const onStepChange = vi.fn();
    const { result } = renderHook(() => useStepper({ count: 3, onStepChange }));
    await act(async () => result.current.setStep(3));
    expect(result.current.value).toBe(2);
    expect(result.current.isCompleted).toBe(false);
    expect(result.current.hasNextStep).toBe(false);
    expect(onStepChange).toHaveBeenLastCalledWith({ step: 2 });
    // One Back moves to count - 2, not to the step already shown.
    await act(async () => result.current.goToPrevStep());
    expect(result.current.value).toBe(1);
    expect(onStepChange).toHaveBeenLastCalledWith({ step: 1 });
    await act(async () => result.current.setStep(-1));
    expect(result.current.value).toBe(0);
    expect(result.current.hasPrevStep).toBe(false);
    await act(async () => result.current.goToNextStep());
    expect(result.current.value).toBe(1);
    expect(result.current.percent).toBe((1 / 3) * 100);
  });

  it.each([
    ['StepperList', () => <StepperList>{null}</StepperList>],
    [
      'StepperItem',
      () => (
        <StepperItem index={0}>
          <StepperTrigger>A</StepperTrigger>
        </StepperItem>
      ),
    ],
    ['StepperContent', () => <StepperContent index={0}>Body</StepperContent>],
    ['StepperPrevTrigger', () => <StepperPrevTrigger>Back</StepperPrevTrigger>],
    ['StepperNextTrigger', () => <StepperNextTrigger>Next</StepperNextTrigger>],
    [
      'useStepperContext',
      () => {
        const Probe = () => {
          useStepperContext();
          return null;
        };
        return <Probe />;
      },
    ],
  ] as const)('throws a [Stepper] error for %s outside a Stepper', (part, Part) => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Part />)).toThrow(
      `[Stepper] ${part} must be used inside a Stepper or StepperRootProvider.`,
    );
  });

  it('warns for a StepperItem outside a StepperList', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <Stepper count={1}>
        <StepperItem index={0}>
          <StepperTrigger>
            <StepperTitle>A</StepperTitle>
          </StepperTrigger>
        </StepperItem>
      </Stepper>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('inside a StepperList'));
  });
});

const FigmaExampleWithProbe: FC<Partial<StepperProps> & { probe: ReactNode }> = ({
  probe,
  ...props
}) => (
  <Stepper data-testid='ps' count={4} {...props}>
    {probe}
    <StepperList>
      {POLICY.map((title, i) => (
        <StepperItem key={title} index={i}>
          <StepperTrigger>
            <StepperTitle>{title}</StepperTitle>
          </StepperTrigger>
        </StepperItem>
      ))}
    </StepperList>
    {POLICY.map((title, i) => (
      <StepperContent key={title} index={i}>
        {title}
      </StepperContent>
    ))}
  </Stepper>
);
