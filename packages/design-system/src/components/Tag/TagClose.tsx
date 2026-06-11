import type { ButtonHTMLAttributes, FC, ReactNode, Ref } from 'react';
import { X } from '../../icons';
import { cn } from '../../utils/cn';
import { type TestableProps, useTestId } from '../../utils/testId';

export interface TagCloseProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'color'>,
    TestableProps {
  children?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

export const TagClose: FC<TagCloseProps> = ({
  children,
  className,
  'data-testid': testIdProp,
  ref,
  ...rest
}) => {
  const testId = useTestId('close', testIdProp);

  return (
    <button
      type='button'
      aria-label='Remove tag'
      {...rest}
      ref={ref}
      data-slot='tag-close'
      data-testid={testId}
      className={cn('inline-flex items-center cursor-pointer focus:outline-none', className)}
    >
      {children ?? <X size='sm' />}
    </button>
  );
};

TagClose.displayName = 'TagClose';
