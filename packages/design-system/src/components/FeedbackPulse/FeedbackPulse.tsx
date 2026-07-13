import { type FC, type KeyboardEvent, type Ref, useEffect, useRef, useState } from 'react';
import { Portal as ArkUiPortal } from '@ark-ui/react/portal';
import { Presence as ArkUiPresence } from '@ark-ui/react/presence';
import { CircleCheck, X } from '../../icons';
import type { TestableProps } from '../../utils/testId';
import { Button } from '../Button';
import { Textarea } from '../Textarea';
import { ToggleButton } from '../ToggleButton';
import { feedbackPulseVariants } from './classes';
import { FeedbackPulseProgress } from './FeedbackPulseProgress';

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
  const scaleRef = useRef<HTMLDivElement>(null);
  const submittedCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      setPhase('rating');
      setScore(null);
      setComment('');
      setPaused(false);
    }
  }, [open]);

  useEffect(() => {
    if (phase === 'submitted') {
      submittedCloseRef.current?.focus();
    }
  }, [phase]);

  const tid = (slot: string) => (testId ? `${testId}--${slot}` : undefined);

  const handleSelect = (value: number) => {
    setScore(value);
    setPhase('feedback');
  };

  const handleScaleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = score ?? 1;
    let next: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(current + 1, 5);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(current - 1, 1);
    if (next != null) {
      e.preventDefault();
      handleSelect(next);
      scaleRef.current?.querySelector<HTMLButtonElement>(`[data-score="${next}"]`)?.focus();
    }
  };

  const handleSend = () => {
    if (score == null) return;
    const trimmed = comment.trim();
    onSubmit({ score, comment: trimmed ? trimmed : undefined });
    setPhase('submitted');
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
          {phase === 'submitted' ? (
            <>
              <FeedbackPulseProgress
                duration={dismissDuration}
                paused={paused}
                onComplete={() => onOpenChange(false, 'submit')}
                data-testid={tid('progress')}
              />
              <div className='relative z-10 flex items-center gap-8' aria-live='polite'>
                <CircleCheck size='md' className='shrink-0 text-icon-success' />
                <span className='flex-1 text-sm font-medium text-text-primary'>
                  {confirmationText}
                </span>
                <Button
                  ref={submittedCloseRef}
                  variant='ghost'
                  color='neutral'
                  size='small'
                  aria-label='Close'
                  data-testid={tid('close')}
                  onClick={() => onOpenChange(false, 'submit')}
                >
                  <X />
                </Button>
              </div>
            </>
          ) : (
            <>
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
                <div
                  ref={scaleRef}
                  role='radiogroup'
                  aria-label={question}
                  data-testid={tid('scale')}
                  className='flex gap-8'
                  onKeyDown={handleScaleKeyDown}
                >
                  {SCORES.map(n => (
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
                      tabIndex={score === n || (score == null && n === 1) ? 0 : -1}
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

              {phase === 'feedback' && (
                <>
                  {showComment && (
                    <Textarea
                      placeholder='Tell us why? (optional)'
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      data-testid={tid('comment')}
                    />
                  )}
                  <div className='flex justify-end'>
                    <Button
                      variant='primary'
                      color='brand'
                      size='medium'
                      data-testid={tid('send')}
                      onClick={handleSend}
                    >
                      Send
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </ArkUiPresence>
    </ArkUiPortal>
  );
};

FeedbackPulse.displayName = 'FeedbackPulse';
