import type { FC, ReactNode } from 'react';
import { useTourContext } from '@ark-ui/react';
import { cva } from 'class-variance-authority';
import { useTestId } from '../../utils/testId';

const tourBodyVariants = cva('flex flex-col gap-2 py-12 outline-none', {
  variants: {
    type: {
      dialog: 'w-full px-24',
      tooltip: 'pl-16 pr-48',
    },
  },
});

interface TourBodyProps {
  children: ReactNode;
}

export const TourBody: FC<TourBodyProps> = ({ children }) => {
  const { step } = useTourContext();
  const testId = useTestId('body');

  const type = step?.type === 'dialog' ? 'dialog' : 'tooltip';

  return (
    <div data-testid={testId} className={tourBodyVariants({ type })}>
      {children}
    </div>
  );
};

TourBody.displayName = 'TourBody';
