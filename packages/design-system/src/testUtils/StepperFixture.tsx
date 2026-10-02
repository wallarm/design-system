import type { FC, HTMLAttributes, ReactNode } from 'react';
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
  type StepperTriggerProps,
} from '../components/Stepper';

// Test-only fixture shared by the Stepper unit test files: the full compound anatomy from data.

type DataAttributes = { [key: `data-${string}`]: string | undefined };

export interface FixtureStep {
  title: string;
  description?: string;
  status?: StepperItemStatus;
  statusLabel?: string;
  indicator?: ReactNode;
  item?: HTMLAttributes<HTMLLIElement> & DataAttributes;
  trigger?: Omit<StepperTriggerProps, 'children'> & DataAttributes;
}

export const FIGMA_STEPS: FixtureStep[] = [
  { title: 'General', status: 'completed' },
  { title: 'Rules', status: 'danger' },
  { title: 'Scope' },
  { title: 'Review' },
];

export const POLICY = ['General', 'Rules', 'Scope', 'Review'];

export interface StepperFixtureProps extends Partial<Omit<StepperProps, 'children'>> {
  steps?: FixtureStep[];
  listLabel?: string;
  /** Render a `StepperContent` per step. */
  withContent?: boolean;
  /** Render `StepperPrevTrigger` / `StepperNextTrigger`. */
  withNav?: boolean;
}

export const StepperFixture: FC<StepperFixtureProps> = ({
  steps = FIGMA_STEPS,
  listLabel = 'Create policy steps',
  withContent = false,
  withNav = false,
  ...props
}) => (
  <Stepper data-testid='ps' count={steps.length} {...props}>
    <StepperList aria-label={listLabel}>
      {steps.map((s, i) => (
        <StepperItem
          key={s.title}
          index={i}
          status={s.status}
          statusLabel={s.statusLabel}
          {...s.item}
        >
          <StepperTrigger {...s.trigger}>
            <StepperIndicator>{s.indicator}</StepperIndicator>
            <StepperTitle>{s.title}</StepperTitle>
            {s.description && <StepperDescription>{s.description}</StepperDescription>}
          </StepperTrigger>
          <StepperSeparator />
        </StepperItem>
      ))}
    </StepperList>
    {withContent &&
      steps.map((s, i) => (
        <StepperContent key={s.title} index={i}>
          <label>
            {s.title} name
            <input />
          </label>
        </StepperContent>
      ))}
    {withNav && (
      <>
        <StepperPrevTrigger>Back</StepperPrevTrigger>
        <StepperNextTrigger>Next</StepperNextTrigger>
      </>
    )}
  </Stepper>
);
