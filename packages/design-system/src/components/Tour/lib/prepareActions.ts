import type { TourStepAction } from '../types';
import { getDefaultActions } from './getDefaultActions';

interface PrepareActionsOptions {
  actions: TourStepAction[];
  firstStep: boolean;
  lastStep: boolean;
  totalSteps: number;
}

export const prepareActions = ({
  actions,
  firstStep,
  lastStep,
  totalSteps,
}: PrepareActionsOptions): TourStepAction[] => {
  if (!actions.length) {
    return getDefaultActions(firstStep, lastStep, totalSteps);
  }

  return actions;
};
