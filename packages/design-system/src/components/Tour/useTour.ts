import { useCallback, useEffect, useRef } from 'react';
import { useTour as useArkTour } from '@ark-ui/react';
import { TOUR_SPOTLIGHT_OFFSET, TOUR_SPOTLIGHT_RADIUS } from './const';
import type {
  TourStatusChangeDetails,
  TourStepChangeDetails,
  TourStepChangeDetailsExtended,
  TourStepDetails,
} from './types';

export interface UseTourOptions {
  /** The steps of the tour. */
  steps?: TourStepDetails[];
  /** The id of the initially highlighted step. */
  stepId?: string | null;
  /** Whether to close the tour when the user clicks outside. @default true */
  closeOnInteractOutside?: boolean;
  /** Callback when the highlighted step changes. */
  onStepChange?: (details: TourStepChangeDetailsExtended) => void;
  /** Callback when the tour status changes. */
  onStatusChange?: (details: TourStatusChangeDetails) => void;
  /** Start the tour automatically on mount. */
  autoStart?: boolean;
  /** Called when advancing to the next step. */
  onNext?: (details: TourStepChangeDetails) => void;
  /** Called when going back to the previous step. */
  onPrev?: (details: TourStepChangeDetails) => void;
  /** Called when the tour completes (last step finished). */
  onFinish?: () => void;
  /** Called when the tour is skipped. */
  onSkip?: () => void;
  /** Called when the tour is dismissed (close button / outside click / Escape). */
  onDismiss?: () => void;
}

export function useTour({
  autoStart = false,
  onNext,
  onPrev,
  onFinish,
  onSkip,
  onDismiss,
  onStatusChange,
  onStepChange,
  steps,
  stepId,
  closeOnInteractOutside,
}: UseTourOptions = {}) {
  const prevStepIndexRef = useRef(-1);
  const didAutoStartRef = useRef(false);

  const handleStatusChange = useCallback(
    (details: TourStatusChangeDetails) => {
      onStatusChange?.(details);
      if (details.status === 'completed') onFinish?.();
      else if (details.status === 'skipped') onSkip?.();
      else if (details.status === 'dismissed') onDismiss?.();
    },
    [onFinish, onSkip, onDismiss, onStatusChange],
  );

  const handleStepChange = useCallback(
    (details: TourStepChangeDetailsExtended) => {
      onStepChange?.(details);
      const prev = prevStepIndexRef.current;
      const { stepIndex, stepId } = details;
      if (prev !== -1) {
        if (stepIndex > prev) onNext?.({ stepIndex, stepId });
        else if (stepIndex < prev) onPrev?.({ stepIndex, stepId });
      }
      prevStepIndexRef.current = stepIndex;
    },
    [onNext, onPrev, onStepChange],
  );

  const tour = useArkTour({
    steps,
    stepId,
    closeOnInteractOutside,
    spotlightOffset: TOUR_SPOTLIGHT_OFFSET,
    spotlightRadius: TOUR_SPOTLIGHT_RADIUS,
    onStatusChange: handleStatusChange,
    onStepChange: handleStepChange,
  });

  // `tour.start` is a new function reference on every render (zag-js's
  // `connect()` rebuilds the returned API object each render), so it must
  // not be a dependency here: including it re-runs this effect — and calls
  // `tour.start()` again — on every re-render while `autoStart` is true.
  // That includes the re-render triggered by a dismiss, which immediately
  // reopens the tour before its exit transition/unmount can complete. Guard
  // with a ref so this only ever fires once, matching the documented
  // "start automatically on mount" behavior.
  // biome-ignore lint/correctness/useExhaustiveDependencies: tour.start intentionally excluded, see comment above
  useEffect(() => {
    if (autoStart && !didAutoStartRef.current) {
      didAutoStartRef.current = true;
      tour.start();
    }
  }, [autoStart]);

  // Reset tracking when tour closes
  useEffect(() => {
    if (!tour.open) prevStepIndexRef.current = -1;
  }, [tour.open]);

  return tour;
}
