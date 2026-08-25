import { useRef } from 'react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Info } from '../../icons';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Checkbox, CheckboxIndicator, CheckboxLabel } from '../Checkbox';
import { Field, FieldLabel, FieldSet } from '../Field';
import { Input } from '../Input';
import { Kbd, KbdGroup } from '../Kbd';
import { HStack, VStack } from '../Stack';
import { beaconStepEffect, waitForStepEvent } from './lib';
import { Tour } from './Tour';
import type { TourStepDetails } from './types';
import { useTour } from './useTour';

const DESCRIPTION = [
  'A guided walk through the interface, for a feature the reader would not find on their own — configured with `useTour({ steps })` and one rendered `Tour`.',
  "It owns how a step looks, not when the tour runs: deciding who sees it and how often is the application's job.",
].join(' ');

const meta = {
  title: 'Overlay/Tour',
  component: Tour,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
} satisfies Meta<typeof Tour>;

export default meta;

/**
 * A full tour end to end. Keep it short — every step is one the reader did not choose to take.
 */
export const Basic: StoryFn<typeof meta> = () => {
  const firstRef = useRef<HTMLButtonElement>(null);
  const secondRef = useRef<HTMLButtonElement>(null);
  const thirdRef = useRef<HTMLButtonElement>(null);
  const fourthRef = useRef<SVGSVGElement>(null);

  const steps: TourStepDetails[] = [
    {
      id: 'intro',
      type: 'dialog',
      title: 'Welcome on a board!',
      description: 'Here is the start dialog window',
    },
    {
      id: 'firstStep',
      type: 'tooltip',
      target: () => firstRef.current,
      title: 'Common use case',
      description: 'Tour step with title, descriptions and progress info.',
    },
    {
      id: 'secondStep',
      type: 'tooltip',
      target: () => secondRef.current,
      title: 'Add an image, GIF, or video',
      description:
        'Tour step with an optional media slot displayed above the text content. Media is defined per step via the meta.mediaSrc field and automatically shows or hides based on the current step.',
      placement: 'top',
      meta: {
        mediaSrc: './tour-cat.jpg',
        mediaAlt: 'Image alt',
      },
    },
    {
      id: 'thirdStep',
      type: 'tooltip',
      target: () => thirdRef.current,
      title: 'A variant where the target element is highlighted without overlay',
      description:
        "The rest of the interface remains fully visible and interactive. Best suited for subtle, non-blocking hints that guide without interrupting the user's workflow.",
      backdrop: false,
    },
    {
      id: 'fourthStep',
      type: 'tooltip',
      target: () => fourthRef.current as HTMLElement | null,
      title: 'An alternative spotlight shape',
      description:
        'Ideal for highlighting compact or icon-sized elements where a rectangular highlight would feel oversized.',
      backdrop: false,
      meta: { shape: 'circle' },
    },
    {
      id: 'finish',
      type: 'dialog',
      title: 'Done!',
      description:
        "You've completed the tour and can enjoy that doggo on the final dialog box of the tour!",
      actions: [
        { label: 'Back', action: 'prev' },
        { label: 'Finish', action: 'dismiss' },
      ],
      meta: {
        mediaSrc: './tour-dog.gif',
        mediaAlt: 'Completion',
      },
    },
  ];

  const tour = useTour({ closeOnInteractOutside: false, steps });

  return (
    <div className='w-600 p-32'>
      <VStack gap={24} align='stretch'>
        <VStack gap={4} align='stretch'>
          <span className='sb-annotation'>keyboard</span>
          <HStack gap={8}>
            <KbdGroup>
              <Kbd>&larr;</Kbd>
              <Kbd>&rarr;</Kbd>
            </KbdGroup>
            <span className='sb-annotation'>move</span>
          </HStack>
          <HStack gap={8}>
            <Kbd>Esc</Kbd>
            <span className='sb-annotation'>dismiss</span>
          </HStack>
          <HStack gap={8}>
            <Kbd>Tab</Kbd>
            <span className='sb-annotation'>focus</span>
          </HStack>
        </VStack>

        <HStack gap={8}>
          <Button ref={firstRef} variant='outline' color='neutral' size='large'>
            First step
          </Button>

          <Button ref={secondRef} variant='outline' color='neutral' size='large'>
            Second step
          </Button>

          <Button ref={thirdRef} variant='outline' color='neutral' size='large'>
            Third step
          </Button>

          <Badge variant='dotted' color='green' size='medium'>
            Last step
          </Badge>

          <Info ref={fourthRef} />
        </HStack>

        <Button
          data-testid='tour-start'
          variant='secondary'
          color='neutral'
          size='large'
          onClick={() => tour.start()}
        >
          Start tour
        </Button>
      </VStack>

      <Tour tour={tour} />
    </div>
  );
};

const PLACEMENTS = [
  'top-start',
  'top',
  'top-end',
  'left-start',
  'left',
  'left-end',
  'right-start',
  'right',
  'right-end',
  'bottom-start',
  'bottom',
  'bottom-end',
] as const;

/**
 * Where a step sits relative to its target. Choose the side that leaves the target visible,
 * since the target is the point.
 */
export const Placement: StoryFn<typeof meta> = () => {
  const topStartRef = useRef<HTMLButtonElement>(null);
  const topRef = useRef<HTMLButtonElement>(null);
  const topEndRef = useRef<HTMLButtonElement>(null);
  const leftStartRef = useRef<HTMLButtonElement>(null);
  const leftRef = useRef<HTMLButtonElement>(null);
  const leftEndRef = useRef<HTMLButtonElement>(null);
  const rightStartRef = useRef<HTMLButtonElement>(null);
  const rightRef = useRef<HTMLButtonElement>(null);
  const rightEndRef = useRef<HTMLButtonElement>(null);
  const bottomStartRef = useRef<HTMLButtonElement>(null);
  const bottomRef = useRef<HTMLButtonElement>(null);
  const bottomEndRef = useRef<HTMLButtonElement>(null);

  const refs: Record<(typeof PLACEMENTS)[number], typeof topRef> = {
    'top-start': topStartRef,
    top: topRef,
    'top-end': topEndRef,
    'left-start': leftStartRef,
    left: leftRef,
    'left-end': leftEndRef,
    'right-start': rightStartRef,
    right: rightRef,
    'right-end': rightEndRef,
    'bottom-start': bottomStartRef,
    bottom: bottomRef,
    'bottom-end': bottomEndRef,
  };

  const steps: TourStepDetails[] = PLACEMENTS.map(p => ({
    id: p,
    type: 'tooltip' as const,
    target: () => refs[p].current,
    title: p,
    description: `Tooltip placed at "${p}". Auto-flips when it would overflow the viewport.`,
    placement: p,
  }));

  const tour = useTour({ closeOnInteractOutside: false, steps });

  return (
    <div className='w-600 p-32'>
      <VStack gap={24} align='stretch'>
        <div className='grid grid-cols-3 gap-8 max-w-[50vw] mx-auto'>
          {PLACEMENTS.map(p => (
            <Button key={p} ref={refs[p]} variant='outline' color='neutral' size='medium'>
              {p}
            </Button>
          ))}
        </div>

        <Button
          data-testid='tour-start'
          variant='secondary'
          color='neutral'
          size='large'
          onClick={() => tour.start()}
        >
          Explore placement options
        </Button>
      </VStack>

      <Tour tour={tour} />
    </div>
  );
};

/**
 * A beacon the reader opens themselves, which turns the tour from an interruption into an
 * offer.
 */
export const BeaconTriggered: StoryFn<typeof meta> = () => {
  const targetRef = useRef<HTMLButtonElement>(null);

  const steps: TourStepDetails[] = [
    {
      id: 'beacon',
      type: 'tooltip',
      target: () => targetRef.current,
      title: 'Quick tip',
      description:
        'When there is only one step, the footer shows a single "Got it" dismiss button instead of navigation controls. No progress indicator is displayed.',
      backdrop: false,
      effect: beaconStepEffect(),
    },
  ];

  const tour = useTour({ closeOnInteractOutside: false, steps, autoStart: true });

  return (
    <div className='w-600 p-32'>
      <VStack gap={24} align='stretch'>
        <HStack gap={8}>
          <Button ref={targetRef} variant='outline' color='neutral' size='large'>
            Quick tip
          </Button>
        </HStack>
      </VStack>

      <Tour tour={tour} />
    </div>
  );
};

/**
 * A step that waits for the reader to act before advancing, for teaching by doing rather than
 * by reading.
 */
export const WaitForInteraction: StoryFn<typeof meta> = () => {
  const firstRef = useRef<HTMLButtonElement>(null);
  const secondRef = useRef<HTMLButtonElement>(null);

  const steps: TourStepDetails[] = [
    {
      id: 'intro',
      type: 'dialog',
      title: 'New feature available!',
      description:
        'This tour will guide you through actions. You must complete each step to proceed.',
      actions: [{ label: 'Start', action: 'next' }],
    },
    {
      id: 'firstButton',
      type: 'tooltip',
      title: 'Click the Add button',
      description: 'Click the "Add Item" button to continue.',
      target: () => firstRef.current,
      effect: args => waitForStepEvent('click', args),
    },
    {
      id: 'secondButton',
      type: 'tooltip',
      title: 'Click the Change button',
      description: 'Click the "Change Item" button to continue.',
      target: () => secondRef.current,
      effect: args => waitForStepEvent('click', args),
    },
    {
      id: 'done',
      type: 'dialog',
      title: 'Great!',
      description: 'Let`s move on',
    },
  ];

  const tour = useTour({ closeOnInteractOutside: false, steps });

  return (
    <div className='w-600 p-32'>
      <VStack gap={24} align='stretch'>
        <HStack gap={8}>
          <Button ref={firstRef} variant='outline' color='neutral' size='large'>
            Add Item
          </Button>
          <Button ref={secondRef} variant='outline' color='neutral' size='large'>
            Change Item
          </Button>
        </HStack>

        <Button
          data-testid='tour-start'
          variant='secondary'
          color='neutral'
          size='large'
          onClick={() => tour.start()}
        >
          Interactive tour with buttons
        </Button>
      </VStack>

      <Tour tour={tour} />
    </div>
  );
};

/**
 * The same, gated on input rather than a click — for a step where the reader has to type
 * something real to continue.
 */
export const WaitForInput: StoryFn<typeof meta> = () => {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLLabelElement>(null);

  const steps: TourStepDetails[] = [
    {
      id: 'enter-name',
      type: 'tooltip',
      title: 'Enter Your Name',
      description: 'Type your name in the input field to continue (at least 2 characters).',
      target: () => nameRef.current,
      placement: 'bottom-start',
      effect: args =>
        waitForStepEvent('input', args, {
          predicate: el => (el as HTMLInputElement).value.trim().length >= 2,
          delay: 1500,
        }),
    },
    {
      id: 'enter-email',
      type: 'tooltip',
      title: 'Enter Your Email',
      description: 'Now enter a valid email address.',
      target: () => emailRef.current,
      placement: 'bottom-start',
      effect: args =>
        waitForStepEvent('input', args, {
          predicate: el => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test((el as HTMLInputElement).value);
          },
          delay: 1500,
        }),
    },
    {
      id: 'check-terms',
      type: 'tooltip',
      title: 'Accept Terms',
      description: 'Check the checkbox to accept the terms.',
      target: () => termsRef.current,
      placement: 'bottom-start',
      effect: args =>
        waitForStepEvent(
          'change',
          {
            ...args,
            target: () => termsRef.current?.querySelector<HTMLInputElement>('input') ?? null,
          },
          {
            predicate: el => el.checked,
          },
        ),
    },
    {
      id: 'complete',
      type: 'dialog',
      title: 'Form Complete!',
      description: 'You have successfully filled out the form',
      meta: {
        mediaSrc: './tour-cat.jpg',
        mediaAlt: 'Completion',
      },
    },
  ];

  const tour = useTour({ closeOnInteractOutside: false, steps });

  return (
    <div className='w-600 p-32'>
      <VStack gap={24} align='stretch'>
        <FieldSet>
          <Field>
            <FieldLabel>Name</FieldLabel>
            <Input ref={nameRef} placeholder='Enter your name' />
          </Field>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input ref={emailRef} type='email' placeholder='Enter your email' />
          </Field>

          <Checkbox ref={termsRef}>
            <CheckboxIndicator />
            <CheckboxLabel>I accept the terms and conditions</CheckboxLabel>
          </Checkbox>
        </FieldSet>

        <Button
          data-testid='tour-start'
          variant='secondary'
          color='neutral'
          size='large'
          onClick={() => tour.start()}
        >
          Interactive tour with inputs
        </Button>
      </VStack>

      <Tour tour={tour} />
    </div>
  );
};
