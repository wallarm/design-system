import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { ArrowDown, ArrowUp, CornerDownLeft } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Kbd } from '../Kbd';
import { Text } from '../Text';
import { searchModalFooterVariants } from './classes';

export interface SearchModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const SearchModalFooter: FC<SearchModalFooterProps> = ({
  ref,
  children,
  className,
  ...props
}) => {
  const testId = useTestId('footer');

  return (
    <div
      {...props}
      ref={ref}
      data-slot='search-modal-footer'
      data-testid={testId}
      className={cn(searchModalFooterVariants(), className)}
    >
      {children ?? (
        <>
          <span className='inline-flex items-center gap-4'>
            <Kbd size='xsmall'>
              <ArrowUp className='!icon-xs' />
            </Kbd>
            <Kbd size='xsmall'>
              <ArrowDown className='!icon-xs' />
            </Kbd>
            <Text size='xs' color='secondary'>
              to navigate
            </Text>
          </span>
          <span className='inline-flex items-center gap-4'>
            <Kbd size='xsmall'>
              <CornerDownLeft className='!icon-xs' />
            </Kbd>
            <Text size='xs' color='secondary'>
              to select
            </Text>
          </span>
        </>
      )}
    </div>
  );
};

SearchModalFooter.displayName = 'SearchModalFooter';
