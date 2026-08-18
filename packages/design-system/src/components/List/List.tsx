import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { type TestableProps, TestIdProvider } from '../../utils/testId';
import { listVariants } from './classes';

type ListVariant = 'ordered' | 'unordered';
type ListSpacing = 0 | 2 | 4 | 8 | 12 | 16 | 24;
type ListMarker = 'none' | 'disc' | 'decimal';

export interface ListProps extends HTMLAttributes<HTMLElement>, TestableProps {
  ref?: Ref<HTMLElement>;
  children: ReactNode;
  variant?: ListVariant;
  spacing?: ListSpacing;
  marker?: ListMarker;
}

export const List: FC<ListProps> = ({
  ref,
  className,
  children,
  variant = 'unordered',
  spacing,
  marker,
  'data-testid': testId,
  ...props
}) => {
  const Comp = variant === 'ordered' ? 'ol' : 'ul';

  return (
    <Comp
      {...props}
      ref={ref as Ref<HTMLOListElement & HTMLUListElement>}
      data-slot='list'
      data-testid={testId}
      role='list'
      className={cn(listVariants({ spacing, marker }), className)}
    >
      <TestIdProvider value={testId}>{children}</TestIdProvider>
    </Comp>
  );
};

List.displayName = 'List';
