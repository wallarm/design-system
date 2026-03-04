import { type FC, type KeyboardEvent, type ReactNode, useCallback, useEffect, useRef } from 'react';
import { Tour as ArkUiTour, useTourContext } from '@ark-ui/react';
import { cva } from 'class-variance-authority';

const contentVariants = cva(
  'relative z-50 flex flex-col overflow-clip focus-visible:outline-none',
  {
    variants: {
      type: {
        dialog: [
          'w-[400px]',
          'items-center',
          'bg-bg-surface-2 text-text-primary',
          'border border-border-primary-light rounded-12 shadow-xl',
        ],
        tooltip: [
          'min-w-[256px] max-w-[400px]',
          'items-start',
          'bg-slate-800 text-white',
          'rounded-16 shadow-md',
        ],
      },
    },
  },
);

const UNAVAILABLE_DURING_EFFECT = 'ArrowRight';

interface TourContentProps {
  children: ReactNode;
}

export const TourContent: FC<TourContentProps> = ({ children }) => {
  const { step } = useTourContext();

  const contentRef = useRef<HTMLDivElement>(null);
  const type = step?.type === 'dialog' ? 'dialog' : 'tooltip';
  const hasEffect = !!step?.effect;
  const stepId = step?.id;

  useEffect(() => {
    if (hasEffect) return;

    const el = contentRef.current;
    if (!el) return;
    const actions = el.querySelectorAll<HTMLElement>('[data-part="action-trigger"]');
    const target = actions[actions.length - 1];

    /**
     * @experimental "focusVisible" is experimental option to force focus behavior
     */
    // @ts-ignore
    target?.focus({ focusVisible: true });
  }, [hasEffect, stepId]);

  const handleKeyDownCapture = useCallback(
    (e: KeyboardEvent) => {
      if (hasEffect && e.key === UNAVAILABLE_DURING_EFFECT) {
        e.preventDefault();
      }
    },
    [hasEffect],
  );

  return (
    <ArkUiTour.Content
      ref={contentRef}
      onKeyDownCapture={handleKeyDownCapture}
      className={contentVariants({ type })}
    >
      {children}
    </ArkUiTour.Content>
  );
};

TourContent.displayName = 'TourContent';
