import { useEffect, useRef } from 'react';
import { type TourStepDetails, useTour } from '@ark-ui/react';
import type { Meta, StoryFn } from 'storybook-react-rsbuild';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Kbd, KbdGroup } from '../Kbd';
import { HStack, VStack } from '../Stack';
import { Text } from '../Text';
import { beaconStepEffect, waitForStepEvent } from './lib';
import { Tour } from './Tour';
import { TourDescription } from './TourDescription';
import { TourFooter } from './TourFooter';
import { TourTitle } from './TourTitle';

const meta = {
  title: 'Overlay/Tour',
  component: Tour,
  subcomponents: {
    TourTitle,
    TourDescription,
    TourFooter,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Step-by-step guided experience that highlights interface elements with contextual popovers to help users discover new features or navigate unfamiliar workflows. Built on top of Ark UI Tour with custom styling.',
      },
    },
  },
} satisfies Meta<typeof Tour>;

export default meta;

export const Overview: StoryFn<typeof meta> = () => {
  const firstRef = useRef<HTMLButtonElement>(null);
  const secondRef = useRef<HTMLButtonElement>(null);
  const thirdRef = useRef<HTMLButtonElement>(null);
  const fourthRef = useRef<HTMLDivElement>(null);

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
        mediaSrc: '/tour-cat.jpg',
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
      target: () => fourthRef.current,
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
        mediaSrc: '/tour-dog.gif',
        mediaAlt: 'Completion',
      },
    },
  ];

  const tour = useTour({ closeOnInteractOutside: false, steps });

  return (
    <div className='w-600 p-32'>
      <VStack spacing={24} align='stretch'>
        <Text size='sm' color='secondary'>
          Step-by-step guided experience that highlights interface elements with contextual popovers
          to help users discover new features or navigate unfamiliar workflows.
          <br />
          Supports full keyboard navigation: arrow keys to move between steps, Escape to dismiss,
          Tab to focus the close button.
        </Text>

        <VStack spacing={4} align='stretch'>
          <Text size='xs' weight='medium' color='secondary'>
            Keyboard navigation
          </Text>
          <HStack spacing={8}>
            <KbdGroup>
              <Kbd>&larr;</Kbd>
              <Kbd>&rarr;</Kbd>
            </KbdGroup>
            <Text size='xs' color='secondary'>
              Navigate between steps
            </Text>
          </HStack>
          <HStack spacing={8}>
            <Kbd>Esc</Kbd>
            <Text size='xs' color='secondary'>
              Dismiss tour
            </Text>
          </HStack>
          <HStack spacing={8}>
            <Kbd>Tab</Kbd>
            <Text size='xs' color='secondary'>
              Focus buttons
            </Text>
          </HStack>
        </VStack>

        <HStack spacing={8}>
          <Button ref={firstRef} variant='outline' color='neutral' size='large'>
            First step
          </Button>
          <Button ref={secondRef} variant='outline' color='neutral' size='large'>
            Second step
          </Button>
          <Button ref={thirdRef} variant='outline' color='neutral' size='large'>
            Third step
          </Button>
          <div className='py-8 px-12'>
            <div className='flex items-center gap-16'>
              <Badge variant='dotted' color='green' size='medium'>
                Last step
              </Badge>
              <div ref={fourthRef} className='size-16 rounded-full bg-feedback-success-secondary' />
            </div>
          </div>
        </HStack>

        <Button
          data-testid='tour-start'
          variant='primary'
          color='brand'
          size='large'
          onClick={() => tour.start()}
        >
          Start tour
        </Button>
      </VStack>

      <Tour tour={tour}>
        <TourTitle />
        <TourDescription />
        <TourFooter showProgress />
      </Tour>
    </div>
  );
};

Overview.parameters = {
  docs: {
    description: {
      story:
        'Demonstrates dialog steps, tooltip steps with media, backdrop-less highlights, and circle spotlight shapes. Supports full keyboard navigation.',
    },
  },
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
      <VStack spacing={24} align='stretch'>
        <Text size='sm' color='secondary'>
          The tour popover supports placement in any direction relative to the target element.
          Placement is set per step and auto-flips when the popover would overflow the viewport,
          ensuring content stays visible regardless of the target's position on screen.
        </Text>

        <div className='grid grid-cols-3 gap-8 max-w-[50vw] mx-auto'>
          {PLACEMENTS.map(p => (
            <Button key={p} ref={refs[p]} variant='outline' color='neutral' size='medium'>
              {p}
            </Button>
          ))}
        </div>

        <Button
          data-testid='tour-start'
          variant='primary'
          color='brand'
          size='large'
          onClick={() => tour.start()}
        >
          Explore placement options
        </Button>
      </VStack>

      <Tour tour={tour}>
        <TourTitle />
        <TourDescription />
        <TourFooter showProgress />
      </Tour>
    </div>
  );
};

Placement.parameters = {
  docs: {
    description: {
      story:
        'Supports placement in any direction relative to the target element. Auto-flips when the popover would overflow the viewport.',
    },
  },
};

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
      effect: beaconStepEffect,
    },
  ];

  const tour = useTour({ closeOnInteractOutside: false, steps });

  // Auto-start: beacon appears immediately on page load
  useEffect(() => {
    tour.start();
  }, []);

  return (
    <div className='w-600 p-32'>
      <VStack spacing={24} align='stretch'>
        <Text size='sm' color='secondary'>
          A passive discovery pattern where a pulsing beacon highlights a new feature without
          blocking the UI. No popover is shown initially — the tour step appears only after the user
          clicks the highlighted element.
        </Text>

        <HStack spacing={8}>
          <Button ref={targetRef} variant='outline' color='neutral' size='large'>
            Quick tip
          </Button>
        </HStack>
      </VStack>

      <Tour tour={tour}>
        <TourTitle />
        <TourDescription />
        <TourFooter showProgress />
      </Tour>
    </div>
  );
};

BeaconTriggered.parameters = {
  docs: {
    description: {
      story:
        'A passive discovery pattern where a pulsing beacon highlights a new feature without blocking the UI. The popover appears only after the user clicks the highlighted element.',
    },
  },
};

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
      <VStack spacing={24} align='stretch'>
        <Text size='sm' color='secondary'>
          A tour step that pauses and waits for the user to interact with a highlighted element
          before proceeding to the next step.
          <br />
          The wait step uses <code>type: "tooltip"</code> with an effect callback{' '}
          <code>waitForStepEvent</code> that attaches an event listener to the target element and
          calls <code>next()</code> method when the user interacts with it.
        </Text>

        <HStack spacing={8}>
          <Button ref={firstRef} variant='outline' color='neutral' size='large'>
            Add Item
          </Button>
          <Button ref={secondRef} variant='outline' color='neutral' size='large'>
            Change Item
          </Button>
        </HStack>

        <Button
          data-testid='tour-start'
          variant='primary'
          color='brand'
          size='large'
          onClick={() => tour.start()}
        >
          Interactive tour with buttons
        </Button>
      </VStack>

      <Tour tour={tour}>
        <TourTitle />
        <TourDescription />
        <TourFooter showProgress />
      </Tour>
    </div>
  );
};

WaitForInteraction.parameters = {
  docs: {
    description: {
      story:
        'Uses `waitForStepEvent` effect callback that attaches an event listener to the target element and calls `next()` when the user interacts with it.',
    },
  },
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const WaitForInput: StoryFn<typeof meta> = () => {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLDivElement>(null);

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
          predicate: el => emailRegex.test((el as HTMLInputElement).value),
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
        mediaSrc: '/tour-cat.jpg',
        mediaAlt: 'Completion',
      },
    },
  ];

  const tour = useTour({ closeOnInteractOutside: false, steps });

  return (
    <div className='w-600 p-32'>
      <VStack spacing={24} align='stretch'>
        <Text size='sm' color='secondary'>
          To continue a step, user has to complete the highlighted action. Once the action is
          performed, the tour will automatically move forward.
        </Text>

        <VStack spacing={12} align='stretch'>
          <VStack spacing={4} align='stretch'>
            <Text size='xs' weight='medium'>
              Name
            </Text>
            <input
              ref={nameRef}
              type='text'
              placeholder='Enter your name'
              className='h-40 rounded-8 border border-border-primary-light bg-bg-surface-2 px-12 font-sans text-sm text-text-primary outline-none focus:border-border-brand'
            />
          </VStack>
          <VStack spacing={4} align='stretch'>
            <Text size='xs' weight='medium'>
              Email
            </Text>
            <input
              ref={emailRef}
              type='email'
              placeholder='Enter your email'
              className='h-40 rounded-8 border border-border-primary-light bg-bg-surface-2 px-12 font-sans text-sm text-text-primary outline-none focus:border-border-brand'
            />
          </VStack>
          <HStack spacing={8} ref={termsRef}>
            <input type='checkbox' id='tour-terms' className='size-16' />
            <Text size='xs' asChild>
              <label htmlFor='tour-terms'>I accept the terms and conditions</label>
            </Text>
          </HStack>
        </VStack>

        <Button
          data-testid='tour-start'
          variant='primary'
          color='brand'
          size='large'
          onClick={() => tour.start()}
        >
          Interactive tour with inputs
        </Button>
      </VStack>

      <Tour tour={tour}>
        <TourTitle />
        <TourDescription />
        <TourFooter showProgress />
      </Tour>
    </div>
  );
};

WaitForInput.parameters = {
  docs: {
    description: {
      story:
        'Tour steps wait for form input validation before proceeding. Uses `waitForStepEvent` with a predicate function to validate user input.',
    },
  },
};
