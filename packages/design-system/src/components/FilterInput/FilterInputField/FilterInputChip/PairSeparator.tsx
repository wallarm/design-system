import type { FC } from 'react';
import { useTestId } from '../../../../utils/testId';
import { segmentContainer, segmentTextVariants } from './classes';
import { PAIR_SEPARATOR_SLOT } from './segmentVariant';

/** Decorative ";" between the two triplets of a paired chip. Non-interactive. */
export const PairSeparator: FC = () => {
  const testId = useTestId('separator');
  return (
    <div
      className={`${segmentContainer} shrink-0`}
      data-slot={PAIR_SEPARATOR_SLOT}
      data-testid={testId}
      aria-hidden
    >
      <p className={segmentTextVariants({ variant: 'operator' })}>;</p>
    </div>
  );
};

PairSeparator.displayName = 'PairSeparator';
