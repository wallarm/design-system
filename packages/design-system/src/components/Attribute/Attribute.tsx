import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { Skeleton } from '../Skeleton';

export interface AttributeProps extends HTMLAttributes<HTMLDivElement>, TestableProps {
  ref?: Ref<HTMLDivElement>;
  /** Show skeleton placeholders instead of children */
  loading?: boolean;
  children?: ReactNode;
}

export const Attribute: FC<AttributeProps> = ({
  ref,
  loading = false,
  children,
  className,
  'data-testid': testId,
  ...props
}) => {
  return (
    <TestIdProvider value={testId}>
      <div
        {...props}
        ref={ref}
        data-testid={testId}
        data-slot='attribute'
        className={cn('flex flex-col', className)}
      >
        {loading ? (
          <>
            <Skeleton width='82px' height='16px' rounded={6} />
            <div className='pt-4'>
              <Skeleton width='100%' height='24px' rounded={6} />
            </div>
          </>
        ) : (
          children
        )}
      </div>
    </TestIdProvider>
  );
};

Attribute.displayName = 'Attribute';
