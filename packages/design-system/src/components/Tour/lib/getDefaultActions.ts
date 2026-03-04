import type { TourStepAction } from '../types';

export const getDefaultActions = (
  firstStep: boolean,
  lastStep: boolean,
  totalSteps: number,
): TourStepAction[] => {
  if (totalSteps === 1) {
    return [{ label: 'Got it', action: 'dismiss' }];
  }

  if (firstStep) {
    return [
      { label: 'Skip', action: 'dismiss' },
      { label: 'Start', action: 'next' },
    ];
  }

  if (lastStep) {
    return [
      { label: 'Back', action: 'prev' },
      { label: 'Finish', action: 'dismiss' },
    ];
  }

  return [
    { label: 'Back', action: 'prev' },
    { label: 'Next', action: 'next' },
  ];
};
