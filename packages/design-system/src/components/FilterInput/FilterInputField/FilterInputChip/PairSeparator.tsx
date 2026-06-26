import type { FC } from 'react';
import { segmentContainer, segmentTextVariants } from './classes';
import { PAIR_SEPARATOR_SLOT } from './segmentVariant';

/** Decorative ";" between the two triplets of a paired chip. Non-interactive. */
export const PairSeparator: FC = () => (
  <div className={`${segmentContainer} shrink-0`} data-slot={PAIR_SEPARATOR_SLOT} aria-hidden>
    <p className={segmentTextVariants({ variant: 'operator' })}>;</p>
  </div>
);

PairSeparator.displayName = 'PairSeparator';
