import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { TestIdProvider, useTestId } from '../../utils/testId';
import { listItemVariants } from './classes';

export interface ListItemProps extends HTMLAttributes<HTMLLIElement> {
  ref?: Ref<HTMLLIElement>;
  children: ReactNode;
}

export const ListItem: FC<ListItemProps> = ({ ref, className, children, ...props }) => {
  const testId = useTestId('item');

  return (
    <li
      {...props}
      ref={ref}
      data-slot='list-item'
      data-testid={testId}
      className={cn(listItemVariants(), className)}
    >
      <TestIdProvider value={testId}>{children}</TestIdProvider>
    </li>
  );
};

ListItem.displayName = 'ListItem';
