import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { AttributeLoading } from './AttributeLoading';
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
            className,
          )}
        >
          {loading ? <AttributeLoading /> : children}
        </div>
      </AttributeOrientationProvider>
    </TestIdProvider>
  );
};

Attribute.displayName = 'Attribute';
