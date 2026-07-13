import { type FC, type KeyboardEvent, type Ref, useEffect, useState } from 'react';
import { Presence as ArkUiPresence } from '@ark-ui/react/presence';
import { Portal as ArkUiPortal } from '@ark-ui/react/portal';
import { X } from '../../icons';
import type { TestableProps } from '../../utils/testId';
import { Button } from '../Button';
import { ToggleButton } from '../ToggleButton';
import { feedbackPulseVariants } from './classes';

const DEFAULT_QUESTION = 'How easy was it to use this feature?';
const DEFAULT_LABELS: readonly [string, string] = ['Very difficult', 'Very easy'];
const DEFAULT_CONFIRMATION = 'Thanks a lot! — Wallarm Team';
const DEFAULT_DISMISS_MS = 5000;
const SCORES = [1, 2, 3, 4, 5] as const;

export type FeedbackPulseCloseReason = 'submit' | 'dismiss';

export interface FeedbackPulseProps extends TestableProps {
  open: boolean;
  onOpenChange: (open: boolean, reason?: FeedbackPulseCloseReason) => void;
  onSubmit: (result: { score: number; comment?: string }) => void;
  question?: string;
  scaleLabels?: readonly [string, string];
  showComment?: boolean;
  dismissDuration?: number;
  confirmationText?: string;
  ref?: Ref<HTMLDivElement>;
}

type Phase = 'rating' | 'feedback' | 'submitted';

export const FeedbackPulse: FC<FeedbackPulseProps> = ({
  open,
  onOpenChange,
  onSubmit,
  question = DEFAULT_QUESTION,
  scaleLabels = DEFAULT_LABELS,
  showComment = true,
  dismissDuration = DEFAULT_DISMISS_MS,
  confirmationText = DEFAULT_CONFIRMATION,
  'data-testid': testId,
  ref,
}) => {
  const [phase, setPhase] = useState<Phase>('rating');
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (open) {
      setPhase('rating');
      setScore(null);
      setComment('');
      setPaused(false);
    }
  }, [open]);

  const tid = (slot: string) => (testId ? `${testId}--${slot}` : undefined);

  const handleSelect = (value: number) => {
    setScore(value);
    setPhase('feedback');
  };

  const handleRootKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && phase !== 'submitted') {
      e.stopPropagation();
      onOpenChange(false, 'dismiss');
    }
  };

  return (
    <ArkUiPortal>
      <ArkUiPresence present={open} asChild>
        <div
          ref={ref}
          data-slot='feedback-pulse'
          data-testid={testId}
          role='dialog'
          aria-label={question}
          className={feedbackPulseVariants()}
          onKeyDown={handleRootKeyDown}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className='flex items-start justify-between gap-8'>
            <span className='flex-1 text-sm font-medium text-text-primary'>{question}</span>
            <Button
              variant='ghost'
              color='neutral'
              size='small'
              aria-label='Close'
              data-testid={tid('close')}
              onClick={() => onOpenChange(false, 'dismiss')}
            >
              <X />
            </Button>
          </div>

          <div className='flex flex-col gap-4'>
            <div role='radiogroup' aria-label={question} data-testid={tid('scale')} className='flex gap-8'>
              {SCORES.map((n) => (
                <ToggleButton
                  key={n}
                  variant='outline'
                  color='neutral'
                  size='small'
                  fullWidth
                  active={score === n}
                  role='radio'
                  aria-checked={score === n}
                  aria-label={String(n)}
                  data-score={n}
                  data-testid={tid(`score-${n}`)}
                  onToggle={() => handleSelect(n)}
                >
                  {n}
                </ToggleButton>
              ))}
            </div>
            <div className='flex justify-between'>
              <span className='text-sm font-normal text-text-secondary'>{scaleLabels[0]}</span>
              <span className='text-sm font-normal text-text-secondary'>{scaleLabels[1]}</span>
            </div>
          </div>
        </div>
      </ArkUiPresence>
    </ArkUiPortal>
  );
};

FeedbackPulse.displayName = 'FeedbackPulse';
