import type { FC } from 'react';
import { Tour as ArkUiTour, useTourContext } from '@ark-ui/react';
import { cva } from 'class-variance-authority';
import { Button } from '../Button';
import { HStack } from '../Stack';
import { prepareActions } from './lib';

export interface TourFooterProps {
  showProgress?: boolean;
}

const controlVariants = cva('flex items-center', {
  variants: {
    type: {
      dialog: 'w-full px-24 py-16',
      tooltip: 'w-full px-16 pb-16',
    },
    alignment: {
      between: 'justify-between',
      end: 'justify-end',
    },
  },
});

const progressVariants = cva('font-sans font-regular text-sm leading-sm', {
  variants: {
    type: {
      dialog: 'text-text-secondary',
      tooltip: 'text-white/60',
    },
  },
});

export const TourFooter: FC<TourFooterProps> = () => {
  const { step, firstStep, lastStep, totalSteps } = useTourContext();

  const type = step?.type === 'dialog' ? 'dialog' : 'tooltip';
  const hideActions = !!step?.effect;
  const showProgressText = totalSteps > 1;

  return (
    <ArkUiTour.Control
      className={controlVariants({
        type,
        alignment: showProgressText ? 'between' : 'end',
      })}
    >
      {showProgressText && <ArkUiTour.ProgressText className={progressVariants({ type })} />}

      {!hideActions && (
        <ArkUiTour.Actions>
          {actions => {
            const preparedActions = prepareActions({ actions, totalSteps, firstStep, lastStep });

            return (
              <HStack align='center' gap={8}>
                {preparedActions.map((action, index) => {
                  const isLast = index === preparedActions.length - 1;

                  return (
                    <ArkUiTour.ActionTrigger key={action.label} action={action} asChild>
                      <Button
                        variant={isLast ? 'primary' : 'ghost'}
                        color={isLast ? 'brand' : type === 'dialog' ? 'neutral' : 'neutral-alt'}
                        size={type === 'dialog' ? 'large' : 'small'}
                      >
                        {action.label}
                      </Button>
                    </ArkUiTour.ActionTrigger>
                  );
                })}
              </HStack>
            );
          }}
        </ArkUiTour.Actions>
      )}
    </ArkUiTour.Control>
  );
};

TourFooter.displayName = 'TourFooter';
