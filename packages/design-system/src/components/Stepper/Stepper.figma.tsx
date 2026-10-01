import figma from '@figma/code-connect';
import { Stepper } from './Stepper';
import { StepperDescription } from './StepperDescription';
import { StepperIndicator } from './StepperIndicator';
import { StepperItem } from './StepperItem';
import { StepperList } from './StepperList';
import { StepperSeparator } from './StepperSeparator';
import { StepperTitle } from './StepperTitle';
import { StepperTrigger } from './StepperTrigger';

// WADS Components → Stepper page.
const STEPPER_URL =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12463-208988';
const STEPPER_ITEM_URL =
  'https://www.figma.com/design/VKb5gW46uSGw0rqrhZsbXT/WADS-Components?node-id=12463-208896';

figma.connect(Stepper, STEPPER_URL, {
  props: {
    // Only the step items: the Figma slot also holds `separator` instances, which map to
    // `StepperSeparator` inside each item.
    children: figma.children('stepper-item'),
  },
  // `count` and each item's `index` are explicit, like Ark Steps: set `count` to the number of
  // items (4 is a placeholder) and give each item its own `index`, 0..count-1 — Code Connect
  // cannot read a child's position. The active step comes from the root `step` prop, not from an
  // item's `Type=Active`.
  example: ({ children }) => (
    <Stepper count={4} step={0} onStepChange={() => undefined}>
      <StepperList aria-label='Steps'>{children}</StepperList>
    </Stepper>
  ),
});

// stepper-item: `Type` (VARIANT), `description` (BOOLEAN), `descriptionText` and `step` (TEXT).
// Active is not a prop: it is the current step, set on the root with `step`.
figma.connect(StepperItem, STEPPER_ITEM_URL, {
  props: {
    status: figma.enum('Type', {
      Completed: 'completed',
      Danger: 'danger',
      Upcoming: 'upcoming',
      Active: undefined,
    }),
    title: figma.string('step'),
    description: figma.boolean('description', {
      true: figma.string('descriptionText'),
      false: undefined,
    }),
  },
  example: ({ status, title, description }) => (
    <StepperItem index={/* this step's position, 0..count-1 */ 0} status={status}>
      <StepperTrigger>
        <StepperIndicator />
        <StepperTitle>{title}</StepperTitle>
        {description && <StepperDescription>{description}</StepperDescription>}
      </StepperTrigger>
      <StepperSeparator />
    </StepperItem>
  ),
});
