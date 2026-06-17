import type { ComponentPropsWithoutRef, FC, ReactNode, Ref } from 'react';
import { type TestableProps, useTestId } from '../../utils/testId';
import { Text } from '../Text';

type TextOwnProps = Pick<ComponentPropsWithoutRef<typeof Text>, 'size' | 'color' | 'weight'>;

export interface BulkBarSummaryCountProps
  extends Omit<ComponentPropsWithoutRef<'p'>, 'children' | 'color'>,
    TextOwnProps,
    TestableProps {
  /** Renders the default "{count} selected" label. */
  count?: number;
  /** Override the entire content (e.g. "5 hosts" instead of "5 selected"). */
  children?: ReactNode;
  ref?: Ref<HTMLParagraphElement>;
}

export const BulkBarSummaryCount: FC<BulkBarSummaryCountProps> = ({
  count,
  children,
  size = 'sm',
  color = 'primary-alt',
  weight = 'medium',
  'data-testid': testIdProp,
  ...rest
}) => {
  const testId = useTestId('count', testIdProp);

  return (
    <Text
      {...rest}
      data-slot='bulk-bar-summary-count'
      data-testid={testId}
      size={size}
      color={color}
      weight={weight}
      truncate
    >
      {children ?? `${count ?? 0} selected`}
    </Text>
  );
};

BulkBarSummaryCount.displayName = 'BulkBarSummaryCount';
