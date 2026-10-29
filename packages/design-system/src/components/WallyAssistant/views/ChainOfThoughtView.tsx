import { type FC, useState } from 'react';

import { Activity, Brain } from '../../../icons';
import { useTestId } from '../../../utils/testId';
import {
  ChainOfThought,
  type ChainOfThoughtProps,
  ChainOfThoughtStep,
  type ChainOfThoughtStepProps,
} from '../../ChainOfThought';
import { useRenderEveryTime } from '../../Table/lib/useRenderEveryTime';
import { isLiveStep, isLiveStepStatus } from '../model/deriveChatState';
import type { ChatChainOfThoughtPart, ChatId, ChatMessage, ChatStep } from '../model/model';
import { MarkdownView, useChatView } from './ChatViewContext';
import { resolveStepIcon, stepVisualStatus } from './stepIcons';

/** `...rest` lands on the root `ol`. The DOM `part` attribute is dropped: `part` is the data here. */
export interface ChainOfThoughtViewProps extends Omit<ChainOfThoughtProps, 'children' | 'part'> {
  part: ChatChainOfThoughtPart;
  message: ChatMessage;
  /** The run is still producing this message: the block stays flat and never folds. */
  active?: boolean;
  /** Append the synthetic "Working..." row: the run is busy but no step is live. */
  working?: boolean;
}

type Toggles = ReadonlyMap<ChatId, boolean>;

interface StepViewProps {
  step: ChatStep;
  message: ChatMessage;
  slot: string;
  toggles: Toggles;
  onToggle: (id: ChatId, open: boolean) => void;
}

const StepList: FC<Omit<StepViewProps, 'step' | 'slot'> & { steps: readonly ChatStep[] }> = ({
  steps,
  ...props
}) => steps.map((step, j) => <StepView key={step.id} {...props} step={step} slot={`step-${j}`} />);

/** One data-driven row; its body goes through `renderStepContent` (§7.3). */
const StepView: FC<StepViewProps> = ({ step, message, slot, toggles, onToggle }) => {
  const { icons, renderStepContent } = useChatView();
  const testId = useTestId(slot);
  const ownLive = isLiveStepStatus(step.status);

  const body = step.content ? (
    <MarkdownView
      text={step.content}
      streaming={ownLive}
      variant='chain-of-thought'
      messageId={message.id}
      partId={step.id}
    />
  ) : null;
  const nested = step.steps?.length ? (
    <ChainOfThought>
      <StepList steps={step.steps} message={message} toggles={toggles} onToggle={onToggle} />
    </ChainOfThought>
  ) : null;
  const defaultNode =
    body || nested ? (
      <>
        {body}
        {nested}
      </>
    ) : null;

  const custom = useRenderEveryTime(() =>
    renderStepContent?.(step, { message, defaultRender: () => defaultNode }),
  );
  const content = custom === undefined ? defaultNode : custom;

  return (
    <ChainOfThoughtStep
      data-testid={testId}
      label={step.label}
      icon={resolveStepIcon(step, icons)}
      metric={step.metric || undefined}
      status={stepVisualStatus(step.status)}
      open={toggles.get(step.id) ?? (step.kind === 'reasoning' && ownLive)}
      onOpenChange={open => onToggle(step.id, open)}
    >
      {content}
    </ChainOfThoughtStep>
  );
};

/** A synthetic row (summary, Working) that reads its id from the chain's cascade. */
const SlotStep: FC<ChainOfThoughtStepProps & { slot: string }> = ({ slot, ...props }) => (
  <ChainOfThoughtStep {...props} data-testid={useTestId(slot)} />
);

/**
 * One `chain-of-thought` part as a `ChainOfThought`. Flat while the run is active (plus a
 * "Working..." row when `working`); folds under its `summary` once the run is over. A reasoning
 * step is open while live and closes when done; a manual toggle always wins and survives the fold.
 */
export const ChainOfThoughtView: FC<ChainOfThoughtViewProps> = ({
  part,
  message,
  active = false,
  working = false,
  ...props
}) => {
  const { labels } = useChatView();
  const [toggles, setToggles] = useState<Toggles>(() => new Map());
  const onToggle = (id: ChatId, open: boolean) => setToggles(prev => new Map(prev).set(id, open));
  // Own state, not the step map: a step id may equal the part id.
  const [summaryOpen, setSummaryOpen] = useState(false);

  const folded = !!part.summary && !active && !part.steps.some(isLiveStep);
  const steps = (
    <StepList steps={part.steps} message={message} toggles={toggles} onToggle={onToggle} />
  );

  if (folded) {
    const reasoningOnly = part.steps.every(s => s.kind === 'reasoning');
    return (
      <ChainOfThought {...props}>
        <SlotStep
          slot='step-summary'
          icon={reasoningOnly ? <Brain /> : <Activity />}
          label={part.summary}
          open={summaryOpen}
          onOpenChange={setSummaryOpen}
        >
          <ChainOfThought>{steps}</ChainOfThought>
        </SlotStep>
      </ChainOfThought>
    );
  }

  return (
    <ChainOfThought {...props}>
      {steps}
      {working && <SlotStep slot='step-working' status='running' label={labels.working} />}
    </ChainOfThought>
  );
};

ChainOfThoughtView.displayName = 'ChainOfThoughtView';
