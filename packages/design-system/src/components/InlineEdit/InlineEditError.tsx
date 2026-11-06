import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { OctagonAlert } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Text } from '../Text';
import { useInlineEdit } from './InlineEditContext';

export interface InlineEditErrorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const InlineEditError: FC<InlineEditErrorProps> = ({
  ref,
  children,
  className,
  ...props
}) => {
  const testId = useTestId('error');
  const { invalid, error } = useInlineEdit();
  const message = children ?? error;

  if (!invalid || !message) return null;

  return (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='inline-edit-error'
      className={cn('flex items-center gap-4 pt-4', className)}
    >
      <OctagonAlert size='md' className='shrink-0 text-icon-danger' />
      <Text size='sm' color='danger'>
        {message}
      </Text>
    </div>
  );
};

InlineEditError.displayName = 'InlineEditError';
