import type { FC } from 'react';
import { Tour as ArkUiTour, useTourContext } from '@ark-ui/react';
import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { getDefaultActions } from './lib';

export interface TourFooterProps {
  showProgress?: boolean;
}

export const TourFooter: FC<TourFooterProps> = ({ showProgress = false }) => {
  const { step, firstStep, lastStep, totalSteps } = useTourContext();
  const isDialog = step?.type === 'dialog';
  const hideActions = !!step?.effect;
  const showProgressText = showProgress && totalSteps > 1;

  return (
    <ArkUiTour.Control
      className={cn(
        'flex items-center pt-12',
        showProgressText ? 'justify-between' : 'justify-end',
        isDialog ? '-mx-24 w-[calc(100%+48px)] px-24' : '-ml-16 -mr-48 w-[calc(100%+64px)] px-16',
      )}
    >
      {showProgressText && (
        <ArkUiTour.ProgressText
          className={cn(
            'font-sans font-regular text-sm leading-sm',
            isDialog ? 'text-text-secondary' : 'text-white/60',
          )}
        />
      )}
      {!hideActions && (
        <ArkUiTour.Actions>
          {stepActions => {
            const actions =
              stepActions.length > 0
                ? stepActions
                : getDefaultActions(firstStep, lastStep, totalSteps);

            return (
              <div className='flex items-center gap-8'>
                {actions.map((action, index) => (
                  <ArkUiTour.ActionTrigger key={action.label} action={action} asChild>
                    <Button
                      variant={index === actions.length - 1 ? 'primary' : 'ghost'}
                      color={
                        index === actions.length - 1
                          ? 'brand'
                          : isDialog
                            ? 'neutral'
                            : 'neutral-alt'
                      }
                      size={isDialog ? 'large' : 'small'}
                    >
                      {action.label}
                    </Button>
                  </ArkUiTour.ActionTrigger>
                ))}
              </div>
            );
          }}
        </ArkUiTour.Actions>
      )}
    </ArkUiTour.Control>
  );
};
