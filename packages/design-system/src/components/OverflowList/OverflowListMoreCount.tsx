import type { FC, HTMLAttributes, Ref } from 'react';
import { type TestableProps, useTestId } from '../../utils/testId';
import { useOverflowListMore } from './useOverflowListMore';

export interface OverflowListMoreCountProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'>,
    TestableProps {
  /** `hidden` — items folded into the overflow; `total` — every item. */
  of?: 'hidden' | 'total';
  ref?: Ref<HTMLSpanElement>;
}

export const OverflowListMoreCount: FC<OverflowListMoreCountProps> = ({
  of = 'hidden',
  'data-testid': testIdProp,
  ...props
}) => {
  const testId = useTestId('count', testIdProp);
  const { hiddenCount, totalCount } = useOverflowListMore();

  return (
    <span {...props} data-slot='overflow-list-more-count' data-testid={testId}>
      {of === 'total' ? totalCount : hiddenCount}
    </span>
  );
};

OverflowListMoreCount.displayName = 'OverflowListMoreCount';
