import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { AttributeEmptyProvider } from './AttributeEmptyContext';
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
   * When true, `AttributeValue` renders the em-dash placeholder instead of its
   * children, and any `AttributeEmptyDescription` inside the tree becomes
   * visible. Ignored while `loading` is true (skeleton wins).
   */
  isEmpty?: boolean;
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
  isEmpty = false,
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
        <AttributeEmptyProvider value={isEmpty}>
          <div
            {...props}
            ref={ref}
            data-testid={testId}
            data-slot='attribute'
            data-orientation={orientation}
            data-empty={!loading && isEmpty ? '' : undefined}
            className={cn(
              isHorizontal ? 'flex flex-row items-start gap-4' : 'flex flex-col',
              className,
            )}
          >
            {loading ? <AttributeLoading /> : children}
          </div>
        </AttributeEmptyProvider>
      </AttributeOrientationProvider>
    </TestIdProvider>
  );
};

Attribute.displayName = 'Attribute';
