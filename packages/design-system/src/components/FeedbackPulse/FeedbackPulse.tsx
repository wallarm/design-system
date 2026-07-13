import {
  type FC,
  type KeyboardEvent,
  type Ref,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Portal as ArkUiPortal } from '@ark-ui/react/portal';
import { Presence as ArkUiPresence } from '@ark-ui/react/presence';
import { Check, X } from '../../icons';
import { cn } from '../../utils/cn';
import type { TestableProps } from '../../utils/testId';
import { Button } from '../Button';
import { Textarea } from '../Textarea';
import { ToggleButton } from '../ToggleButton';
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip';
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
  // Once the reveal grow settles, drop overflow clipping so the comment's focus ring isn't cut.
  const [revealDone, setRevealDone] = useState(false);
  const scaleRef = useRef<HTMLDivElement>(null);
  const submittedCloseRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const morphFromRef = useRef<number | null>(null);

  const setCardRef = useCallback(
    (node: HTMLDivElement | null) => {
      cardRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
    },
    [ref],
  );

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

  useEffect(() => {
    if (phase !== 'feedback') {
      setRevealDone(false);
      return;
    }
    // Drop overflow clipping once the ~200ms reveal grow has settled, so the comment's focus
    // ring paints in full instead of being clipped by the reveal container. Timer (not
    // transitionend) because grid-template-rows transitionend is unreliable across browsers.
    const timer = setTimeout(() => setRevealDone(true), 250);
    return () => clearTimeout(timer);
  }, [phase]);

  // Feedback → Submitted: FLIP the card height from the (tall) form down to the (short)
  // confirmation so it collapses smoothly, mirroring the Rating → Feedback grow.
  useLayoutEffect(() => {
    const el = cardRef.current;
    const from = morphFromRef.current;
    morphFromRef.current = null;
    if (!el || phase !== 'submitted' || from == null) return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const to = el.getBoundingClientRect().height;
    if (prefersReduced || Math.abs(from - to) < 1) return;
    el.style.height = `${from}px`;
    const ac = new AbortController();
    const raf = requestAnimationFrame(() => {
      el.style.transition = 'height 200ms ease-out';
      el.style.height = `${to}px`;
    });
    let failsafe = 0;
    const reset = () => {
      cancelAnimationFrame(raf);
      clearTimeout(failsafe);
      ac.abort();
      el.style.height = '';
      el.style.transition = '';
    };
    // Failsafe: if the frame/transition never runs (e.g. a backgrounded tab throttles rAF),
    // drop the inline height so the card can't get stuck at the pre-collapse height.
    failsafe = window.setTimeout(reset, 400);
    el.addEventListener(
      'transitionend',
      e => {
        if (e.propertyName === 'height') reset();
      },
      { signal: ac.signal },
    );
    return reset;
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
    // Capture the expanded height so the layout effect can FLIP-collapse to the confirmation.
    morphFromRef.current = cardRef.current?.getBoundingClientRect().height ?? null;
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
          ref={setCardRef}
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
                <Check size='md' className='shrink-0 text-icon-success' />
                <span className='flex-1 text-sm font-medium text-text-primary'>
                  {confirmationText}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
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
                  </TooltipTrigger>
                  <TooltipContent>Close</TooltipContent>
                </Tooltip>
              </div>
            </>
          ) : (
            <>
              <div className='flex items-start justify-between gap-8'>
                <span className='flex-1 text-sm font-medium text-text-primary'>{question}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
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
                  </TooltipTrigger>
                  <TooltipContent>Close</TooltipContent>
                </Tooltip>
              </div>

              {/* Plain block wrapper (not flex) so the grid-rows reveal below resolves 1fr to
                  content height — as a flex item the fr track collapses to 0. */}
              <div>
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
                    <span className='text-sm font-normal text-text-secondary'>
                      {scaleLabels[0]}
                    </span>
                    <span className='text-sm font-normal text-text-secondary'>
                      {scaleLabels[1]}
                    </span>
                  </div>
                </div>

                {/* Rating→Feedback: smoothly grow the card to reveal comment + Send (spec §7 height ease). */}
                <div
                  inert={phase !== 'feedback'}
                  className={cn(
                    'grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none',
                    phase === 'feedback' ? 'mt-8 grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                >
                  <div
                    className={cn(
                      'flex flex-col gap-8',
                      revealDone ? 'overflow-visible' : 'overflow-hidden',
                    )}
                  >
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
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </ArkUiPresence>
    </ArkUiPortal>
  );
};

FeedbackPulse.displayName = 'FeedbackPulse';
