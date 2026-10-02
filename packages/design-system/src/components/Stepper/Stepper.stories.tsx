import { type FormEvent, useCallback, useRef, useState } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Lock } from '../../icons';
import { Button } from '../Button';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerFooterControls,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../Drawer';
import { HStack, VStack } from '../Stack';
import { Text } from '../Text';
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  type StepperItemStatus,
  StepperList,
  StepperNextTrigger,
  StepperPrevTrigger,
  type StepperProps,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '.';

const DESCRIPTION = [
  'A horizontal row of numbered steps for a flow that is split into a few screens, such as a create drawer — it shows where the reader is and lets them jump to any step.',
  'It is compound, like Ark UI Steps: `count` on the root and `index` on every `StepperItem` and `StepperContent` are explicit. `StepperContent` shows the current step’s body, and `StepperPrevTrigger` / `StepperNextTrigger` move between steps; Next stops at the last step, where the page renders its own submit button.',
  'It never blocks a step: the page owns each step’s `status` (`completed`, `danger`, `upcoming`), and the current step always renders as active.',
  'Reach for `Timeline` for a history of events, `Tour` for guided onboarding, `Progress` for how far along a task is, and `Tabs` for sections that have no order.',
].join(' ');

const meta = {
  title: 'Navigation/Stepper',
  component: Stepper,
  subcomponents: {
    StepperList,
    StepperItem,
    StepperTrigger,
    StepperIndicator,
    StepperTitle,
    StepperDescription,
    StepperSeparator,
    StepperContent,
    StepperPrevTrigger,
    StepperNextTrigger,
  },
  parameters: {
    layout: 'padded',
    docs: { description: { component: DESCRIPTION } },
  },
  argTypes: {
    count: {
      control: { type: 'number', min: 1, max: 6 },
      description: 'Number of steps, 1–6. Required. In Basic it also sets how many steps render.',
    },
    step: { control: 'number', description: 'Controlled current step, 0-based.' },
    defaultStep: { control: 'number', description: 'Uncontrolled initial step. Default 0.' },
    statusLabels: {
      control: 'object',
      description: 'Screen-reader-only suffixes for completed and danger steps.',
    },
  },
} satisfies Meta<typeof Stepper>;

export default meta;

const POLICY_STEPS = ['General', 'Rules', 'Scope', 'Review'] as const;

// Titles for `count` steps: the policy steps, then generic ones up to six.
const basicTitles = (count: number) =>
  Array.from({ length: count }, (_, i) => POLICY_STEPS[i] ?? `Step ${i + 1}`);

/** Four steps, uncontrolled: click any step to make it current. The `count` control adds or removes steps. */
export const Basic: StoryFn<StepperProps> = ({ count, ...args }) => (
  <Stepper data-testid='stepper' defaultStep={0} {...args} count={count}>
    <StepperList aria-label='Create policy steps'>
      {basicTitles(count).map((title, i) => (
        <StepperItem key={title} index={i}>
          <StepperTrigger>
            <StepperIndicator />
            <StepperTitle>{title}</StepperTitle>
          </StepperTrigger>
          <StepperSeparator />
        </StepperItem>
      ))}
    </StepperList>
  </Stepper>
);
Basic.args = { count: POLICY_STEPS.length };

const TYPED_STEPS: { title: string; status?: StepperItemStatus }[] = [
  { title: 'General', status: 'completed' },
  { title: 'Rules', status: 'danger' },
  { title: 'Scope', status: 'danger' },
  { title: 'Review', status: 'upcoming' },
];

const STEP_TYPES = [
  { type: 'completed', status: 'completed' },
  { type: 'danger', status: 'danger' },
  { type: 'active', status: undefined },
  { type: 'upcoming', status: 'upcoming' },
] as const;

const SINGLE_STEP_CLASSES = 'p-0';

/**
 * The four step types: the page sets `completed`, `danger` or `upcoming`, and the current step is
 * always active — a current `danger` step (Scope) shows as active too, since active is the only
 * step in brand.
 */
export const StepTypes: StoryFn<StepperProps> = () => (
  <VStack gap={24}>
    <Stepper data-testid='stepper' count={TYPED_STEPS.length} step={2}>
      <StepperList aria-label='Create policy steps'>
        {TYPED_STEPS.map(({ title, status }, i) => (
          <StepperItem key={title} index={i} status={status}>
            <StepperTrigger>
              <StepperIndicator />
              <StepperTitle>{title}</StepperTitle>
            </StepperTrigger>
            <StepperSeparator />
          </StepperItem>
        ))}
      </StepperList>
    </Stepper>
    <HStack gap={32} align='center'>
      {STEP_TYPES.map(({ type, status }) => (
        <VStack key={type} gap={4} align='start'>
          {/* A lone step is always current, so the non-active types sit at index 1 of 2. */}
          <Stepper data-testid={`stepper-type-${type}`} count={type === 'active' ? 1 : 2} step={0}>
            <StepperList className={SINGLE_STEP_CLASSES} aria-label={`${type} step`}>
              <StepperItem index={type === 'active' ? 0 : 1} status={status}>
                <StepperTrigger>
                  <StepperIndicator />
                  <StepperTitle>Step</StepperTitle>
                </StepperTrigger>
                <StepperSeparator />
              </StepperItem>
            </StepperList>
          </Stepper>
          <span className='sb-annotation'>{type}</span>
        </VStack>
      ))}
    </HStack>
  </VStack>
);

const DESCRIBED_STEPS: { title: string; description?: string; status?: StepperItemStatus }[] = [
  { title: 'General', status: 'completed' },
  { title: 'Rules', description: 'Request · Lua · HMAC auth' },
  { title: 'Scope', description: 'Optional' },
  { title: 'Review' },
];

/** An optional second line under the title; the separator stays on the first row. */
export const WithDescription: StoryFn<StepperProps> = () => (
  <Stepper data-testid='stepper' count={DESCRIBED_STEPS.length} defaultStep={1}>
    <StepperList aria-label='Create policy steps'>
      {DESCRIBED_STEPS.map(({ title, description, status }, i) => (
        <StepperItem key={title} index={i} status={status}>
          <StepperTrigger>
            <StepperIndicator />
            <StepperTitle>{title}</StepperTitle>
            {description && <StepperDescription>{description}</StepperDescription>}
          </StepperTrigger>
          <StepperSeparator />
        </StepperItem>
      ))}
    </StepperList>
  </Stepper>
);

/** Controlled with `step` and `onStepChange`; every step is clickable, back and forward. */
export const Navigation: StoryFn<StepperProps> = () => {
  const [step, setStep] = useState(0);
  return (
    <VStack gap={16}>
      <Stepper
        data-testid='stepper'
        count={POLICY_STEPS.length}
        step={step}
        onStepChange={details => setStep(details.step)}
      >
        <StepperList aria-label='Create policy steps'>
          {POLICY_STEPS.map((title, i) => (
            <StepperItem key={title} index={i}>
              <StepperTrigger>
                <StepperIndicator />
                <StepperTitle>{title}</StepperTitle>
              </StepperTrigger>
              <StepperSeparator />
            </StepperItem>
          ))}
        </StepperList>
      </Stepper>
      <span className='sb-annotation' data-testid='stepper-readout'>
        Current step: {POLICY_STEPS[step]}
      </span>
    </VStack>
  );
};

const usePolicyFlow = () => {
  const [step, setStep] = useState(0);
  const [statuses, setStatuses] = useState<StepperItemStatus[]>(POLICY_STEPS.map(() => 'upcoming'));
  // The page owns the status: mark the step being left, here as completed (Rules as danger).
  const goTo = (next: number) => {
    setStatuses(prev => prev.map((s, i) => (i === step ? (i === 1 ? 'danger' : 'completed') : s)));
    setStep(next);
  };
  return { step, statuses, goTo };
};

/**
 * Back is hidden on the first step and Next gives way to the submit button on the last, so the
 * footer button a keyboard user just pressed can unmount and drop focus to `<body>`. Keep focus
 * on the footer instead: Back hands it to Next before it goes, and the submit button takes it
 * when it replaces Next.
 */
const useFooterFocus = (step: number) => {
  const nextRef = useRef<HTMLButtonElement>(null);
  const focusSubmit = useRef(false);
  const submitRef = useCallback((node: HTMLButtonElement | null) => {
    if (node && focusSubmit.current) {
      focusSubmit.current = false;
      node.focus();
    }
  }, []);
  return {
    nextRef,
    submitRef,
    onBackClick: () => {
      if (step === 1) nextRef.current?.focus();
    },
    onNextClick: () => {
      focusSubmit.current = step === POLICY_STEPS.length - 2;
    },
  };
};

const BodyPlaceholder = ({ label }: { label: string }) => (
  <div className='flex h-200 w-full items-center justify-center rounded-12 bg-bg-surface-5'>
    <Text size='sm' color='secondary'>
      {label}
    </Text>
  </div>
);

/**
 * Inside a create drawer: the step list sits under the header, `StepperContent` shows the current
 * step's body (every body stays mounted, so fields keep their values) and the footer moves with
 * Back / Next. Steps never submit the form; only the last step's own submit button does. Focus
 * stays on the footer when Back or Next unmounts. The list sits directly below the header,
 * with 24px side insets, 12px bottom padding and no divider. Drawer parts inside the `Stepper`
 * root take its test ids (`stepper--body`, `stepper--footer`), not the Drawer's.
 */
export const InDrawer: StoryFn<StepperProps> = () => {
  const { step, statuses, goTo } = usePolicyFlow();
  const { nextRef, submitRef, onBackClick, onNextClick } = useFooterFocus(step);
  const [submitted, setSubmitted] = useState(0);
  const last = step === POLICY_STEPS.length - 1;
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(n => n + 1);
  };
  return (
    <Drawer data-testid='drawer' width={640}>
      <DrawerTrigger asChild>
        <Button variant='outline' color='neutral' data-testid='drawer-open'>
          Create policy
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create policy</DrawerTitle>
        </DrawerHeader>
        <form onSubmit={onSubmit} className='flex min-h-0 flex-1 flex-col'>
          <Stepper
            data-testid='stepper'
            count={POLICY_STEPS.length}
            step={step}
            onStepChange={details => goTo(details.step)}
            className='flex min-h-0 flex-1 flex-col'
          >
            <StepperList aria-label='Create policy steps'>
              {POLICY_STEPS.map((title, i) => (
                <StepperItem key={title} index={i} status={statuses[i]}>
                  <StepperTrigger>
                    <StepperIndicator />
                    <StepperTitle>{title}</StepperTitle>
                  </StepperTrigger>
                  <StepperSeparator />
                </StepperItem>
              ))}
            </StepperList>
            <DrawerBody>
              {POLICY_STEPS.map((title, i) => (
                <StepperContent key={title} index={i} className='py-16'>
                  <BodyPlaceholder label={`${title} fields`} />
                </StepperContent>
              ))}
              <span className='sb-annotation' data-testid='stepper-submitted'>
                Submitted: {submitted}
              </span>
            </DrawerBody>
            <DrawerFooter>
              {step > 0 && (
                <DrawerFooterControls placement='left'>
                  <StepperPrevTrigger asChild onClick={onBackClick}>
                    <Button variant='outline' color='neutral' size='large'>
                      Back
                    </Button>
                  </StepperPrevTrigger>
                </DrawerFooterControls>
              )}
              <DrawerFooterControls placement='right'>
                {last ? (
                  <Button
                    ref={submitRef}
                    type='submit'
                    variant='primary'
                    color='brand'
                    size='large'
                  >
                    Create policy
                  </Button>
                ) : (
                  <StepperNextTrigger asChild onClick={onNextClick}>
                    <Button ref={nextRef} variant='primary' color='brand' size='large'>
                      Next: {POLICY_STEPS[step + 1]}
                    </Button>
                  </StepperNextTrigger>
                )}
              </DrawerFooterControls>
            </DrawerFooter>
          </Stepper>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

/** A title over 320px ellipsizes, with the full text in a tooltip on hover; so does a long description. */
export const LongLabel: StoryFn<StepperProps> = () => (
  <Stepper data-testid='stepper' count={3} defaultStep={0}>
    <StepperList aria-label='Create policy steps'>
      <StepperItem index={0}>
        <StepperTrigger>
          <StepperIndicator />
          <StepperTitle>General</StepperTitle>
        </StepperTrigger>
        <StepperSeparator />
      </StepperItem>
      <StepperItem index={1} data-testid='stepper-long'>
        <StepperTrigger>
          <StepperIndicator />
          <StepperTitle>
            Rules applied to every request that matches the selected application and path
          </StepperTitle>
          <StepperDescription>
            Request · Lua · HMAC auth · Response headers · Rate limit · Custom blocking page
          </StepperDescription>
        </StepperTrigger>
        <StepperSeparator />
      </StepperItem>
      <StepperItem index={2}>
        <StepperTrigger>
          <StepperIndicator />
          <StepperTitle>Review</StepperTitle>
        </StepperTrigger>
        <StepperSeparator />
      </StepperItem>
    </StepperList>
  </Stepper>
);

const SIX_STEPS = ['General', 'Conditions', 'Actions', 'Notifications', 'Schedule', 'Review'];

const SixStepStepper = ({ testId }: { testId: string }) => (
  <Stepper data-testid={testId} count={SIX_STEPS.length} defaultStep={2}>
    <StepperList aria-label='Create trigger steps'>
      {SIX_STEPS.map((title, i) => (
        <StepperItem key={title} index={i} status={i < 2 ? 'completed' : 'upcoming'}>
          <StepperTrigger>
            <StepperIndicator />
            <StepperTitle>{title}</StepperTitle>
          </StepperTrigger>
          <StepperSeparator />
        </StepperItem>
      ))}
    </StepperList>
  </Stepper>
);

/** Six steps, the most the design supports — at full width, then in a 640px drawer where titles truncate earlier. */
export const SixSteps: StoryFn<StepperProps> = () => (
  <VStack gap={24}>
    <SixStepStepper testId='stepper' />
    <div className='w-640'>
      <SixStepStepper testId='stepper-narrow' />
    </div>
  </VStack>
);

/**
 * The footer recipe: `StepperPrevTrigger` on the left (hidden on the first step) and
 * `StepperNextTrigger` as `Next: <destination>` on the right, both `asChild` with a `Button`. On
 * the last step the page renders its own submit button instead: Next is disabled there. When
 * Back or Next unmounts under the keyboard, the page moves focus to the right-hand footer button
 * (`useFooterFocus` here), so it never falls to `<body>`.
 */
export const WithFooter: StoryFn<StepperProps> = () => {
  const { step, statuses, goTo } = usePolicyFlow();
  const { nextRef, submitRef, onBackClick, onNextClick } = useFooterFocus(step);
  const last = step === POLICY_STEPS.length - 1;
  return (
    <form
      onSubmit={event => event.preventDefault()}
      className='flex w-640 flex-col overflow-hidden rounded-12 border-1 border-border-primary-light'
    >
      <Stepper
        data-testid='stepper'
        count={POLICY_STEPS.length}
        step={step}
        onStepChange={details => goTo(details.step)}
      >
        <StepperList aria-label='Create policy steps'>
          {POLICY_STEPS.map((title, i) => (
            <StepperItem key={title} index={i} status={statuses[i]}>
              <StepperTrigger>
                <StepperIndicator />
                <StepperTitle>{title}</StepperTitle>
              </StepperTrigger>
              <StepperSeparator />
            </StepperItem>
          ))}
        </StepperList>
        {POLICY_STEPS.map((title, i) => (
          <StepperContent key={title} index={i} className='px-24 py-16'>
            <BodyPlaceholder label={`${title} fields`} />
          </StepperContent>
        ))}
        <DrawerFooter>
          {step > 0 && (
            <DrawerFooterControls placement='left'>
              <StepperPrevTrigger asChild data-testid='stepper-back' onClick={onBackClick}>
                <Button variant='outline' color='neutral' size='large'>
                  Back
                </Button>
              </StepperPrevTrigger>
            </DrawerFooterControls>
          )}
          <DrawerFooterControls placement='right'>
            {last ? (
              <Button
                ref={submitRef}
                type='submit'
                variant='primary'
                color='brand'
                size='large'
                data-testid='stepper-submit'
              >
                Create policy
              </Button>
            ) : (
              <StepperNextTrigger asChild data-testid='stepper-next' onClick={onNextClick}>
                <Button ref={nextRef} variant='primary' color='brand' size='large'>
                  Next: {POLICY_STEPS[step + 1]}
                </Button>
              </StepperNextTrigger>
            )}
          </DrawerFooterControls>
        </DrawerFooter>
      </Stepper>
    </form>
  );
};

/** `children` on `StepperIndicator` replaces the number, `!` or check, here with an icon on a locked step. */
export const CustomIndicator: StoryFn<StepperProps> = () => (
  <Stepper data-testid='stepper' count={3} defaultStep={0}>
    <StepperList aria-label='Create policy steps'>
      {['General', 'Rules', 'Billing'].map((title, i) => (
        <StepperItem key={title} index={i}>
          <StepperTrigger>
            <StepperIndicator>{i === 2 ? <Lock size='sm' /> : undefined}</StepperIndicator>
            <StepperTitle>{title}</StepperTitle>
          </StepperTrigger>
          <StepperSeparator />
        </StepperItem>
      ))}
    </StepperList>
  </Stepper>
);

// The same values feed the triggers and the readout, so the readout shows what each button carries.
const ANALYTICS_STEPS = POLICY_STEPS.map((title, i) => ({
  title,
  analyticsId: `POLICY_STEP_${title.toUpperCase()}`,
  analyticsProps: JSON.stringify({ flow: 'create-policy', step: i }),
  testId: i === 3 ? 'step-review' : `stepper--item-${i}--trigger`,
}));

/**
 * `data-analytics-id` and `data-analytics-props` land on each step's button and on the Back / Next
 * buttons, and `data-testid` cascades from the root (`{id}--item-{index}--trigger`) unless a part
 * sets its own.
 */
export const AnalyticsAndTestIds: StoryFn<StepperProps> = () => (
  <VStack gap={16}>
    <Stepper data-testid='stepper' count={POLICY_STEPS.length} defaultStep={1}>
      <StepperList aria-label='Create policy steps'>
        {ANALYTICS_STEPS.map(({ title, analyticsId, analyticsProps, testId }, i) => (
          <StepperItem key={title} index={i}>
            <StepperTrigger
              data-analytics-id={analyticsId}
              data-analytics-props={analyticsProps}
              {...(testId === 'step-review' && { 'data-testid': testId })}
            >
              <StepperIndicator />
              <StepperTitle>{title}</StepperTitle>
            </StepperTrigger>
            <StepperSeparator />
          </StepperItem>
        ))}
      </StepperList>
      <HStack gap={8} className='px-24 py-16'>
        <StepperPrevTrigger asChild data-analytics-id='POLICY_STEP_BACK'>
          <Button variant='outline' color='neutral'>
            Back
          </Button>
        </StepperPrevTrigger>
        <StepperNextTrigger asChild data-analytics-id='POLICY_STEP_NEXT'>
          <Button>Next</Button>
        </StepperNextTrigger>
      </HStack>
    </Stepper>
    <VStack gap={4} align='start'>
      <span className='sb-annotation'>
        {'<div> data-testid="stepper" · <ol> data-testid="stepper--list"'}
      </span>
      {ANALYTICS_STEPS.map(({ title, analyticsId, analyticsProps, testId }) => (
        <span key={title} className='sb-annotation'>
          {`<button> data-testid="${testId}" data-analytics-id="${analyticsId}" data-analytics-props='${analyticsProps}'`}
        </span>
      ))}
      <span className='sb-annotation'>
        {
          '<button> data-testid="stepper--prev-trigger" data-analytics-id="POLICY_STEP_BACK" · <button> data-testid="stepper--next-trigger" data-analytics-id="POLICY_STEP_NEXT"'
        }
      </span>
    </VStack>
  </VStack>
);
