import type { FC, KeyboardEvent, PropsWithChildren } from 'react';
import { useEffect, useRef } from 'react';
import { Tour as ArkUiTour, Portal, useTourContext } from '@ark-ui/react';
import { cn } from '../../utils/cn';
import { TOUR_CONTENT_MAX_WIDTH, TOUR_CONTENT_MIN_WIDTH, TOUR_Z_INDEX } from './const';
import { _tourNextRef } from './lib';
import { TourClose } from './TourClose';
import { TourMedia } from './TourMedia';
import { TourOverlay } from './TourOverlay';

const UNAVAILABLE_DURING_EFFECT = 'ArrowRight';
const FOCUS_DELAY = 100;

export const TourContent: FC<PropsWithChildren> = ({ children }) => {
  const { step, next } = useTourContext();
  _tourNextRef.current = next;

  const contentRef = useRef<HTMLDivElement>(null);
  const isDialog = step?.type === 'dialog';
  const hasEffect = !!step?.effect;

  // Move initial focus to the last action button (e.g. "Next" / "Finish")
  // instead of the close icon. The built-in focus trap always picks the first
  // tabbable element (the close button) as initial focus. We wait for both
  // trap activations to settle (target.scrolling → tour.active) and then
  // programmatically shift focus to a more useful target.
  useEffect(() => {
    if (hasEffect) return;
    const timer = setTimeout(() => {
      const el = contentRef.current;
      if (!el) return;
      const actions = el.querySelectorAll<HTMLElement>('[data-part="action-trigger"]');
      const target = actions[actions.length - 1];
      target?.focus();
    }, FOCUS_DELAY);
    return () => clearTimeout(timer);
  }, [step?.id, hasEffect]);

  const handleKeyDownCapture = hasEffect
    ? (e: KeyboardEvent) => {
        if (e.key === UNAVAILABLE_DURING_EFFECT) e.preventDefault();
      }
    : undefined;

  return (
    <Portal>
      <TourOverlay />

      <ArkUiTour.Positioner
        className={isDialog ? 'fixed inset-0 flex items-center justify-center' : undefined}
        style={isDialog ? { zIndex: TOUR_Z_INDEX + 1 } : undefined}
      >
        <ArkUiTour.Content
          ref={contentRef}
          onKeyDownCapture={handleKeyDownCapture}
          className={cn(
            'relative flex flex-col overflow-clip',
            isDialog
              ? 'bg-bg-surface-2 text-text-primary items-center border border-border-primary-light rounded-12 shadow-xl'
              : 'bg-slate-800 text-white items-start rounded-16 shadow-md',
          )}
          style={
            isDialog
              ? { zIndex: TOUR_Z_INDEX + 1, width: TOUR_CONTENT_MAX_WIDTH }
              : {
                  zIndex: TOUR_Z_INDEX + 1,
                  minWidth: TOUR_CONTENT_MIN_WIDTH,
                  maxWidth: TOUR_CONTENT_MAX_WIDTH,
                }
          }
        >
          <TourClose />
          <TourMedia />

          <div
            className={cn(
              'flex flex-col gap-2',
              isDialog ? 'w-full px-24 pt-20 pb-16' : 'pl-16 pr-48 py-12',
            )}
          >
            {children}
          </div>
        </ArkUiTour.Content>
      </ArkUiTour.Positioner>
    </Portal>
  );
};
