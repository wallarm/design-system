import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { Skeleton } from '../Skeleton';
import {
  type AttributeOrientation,
  AttributeOrientationProvider,
} from './AttributeOrientationContext';

export interface AttributeProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Show skeleton placeholders instead of children */
  loading?: boolean;
  /**
   * Layout direction of the label and value.
   * - `vertical` (default): label above value
   * - `horizontal`: label on the left, value on the right
   */
  orientation?: AttributeOrientation;
  children?: ReactNode;
}

export const Attribute: FC<AttributeProps> = ({
  ref,
  loading = false,
  orientation = 'vertical',
  children,
  className,
  'data-testid': testId,
  ...props
}) => {
  const isHorizontal = orientation === 'horizontal';

  return (
    <TestIdProvider value={testId}>
      <AttributeOrientationProvider value={orientation}>
        <div
          {...props}
          ref={ref}
          data-testid={testId}
          data-slot='attribute'
          data-orientation={orientation}
          className={cn(
            isHorizontal ? 'flex flex-row items-start gap-4' : 'flex flex-col',
            loading && !isHorizontal && 'gap-4 py-2',
            loading && isHorizontal && 'py-2',
            className,
          )}
        >
          {loading ? (
            isHorizontal ? (
              <>
                <Skeleton width='100px' height='16px' rounded={6} />
                <Skeleton width='100%' height='16px' rounded={6} />
              </>
            ) : (
              <>
                <Skeleton width='82px' height='16px' rounded={6} />
                <Skeleton width='100%' height='24px' rounded={6} />
              </>
            )
          ) : (
            children
          )}
        </div>
      </AttributeOrientationProvider>
    </TestIdProvider>
  );
};

Attribute.displayName = 'Attribute';
