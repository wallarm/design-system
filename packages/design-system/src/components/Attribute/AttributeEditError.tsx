import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { OctagonAlert } from '../../icons';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { Text } from '../Text';
import { useAttributeEdit } from './AttributeEditContext';

export interface AttributeEditErrorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const AttributeEditError: FC<AttributeEditErrorProps> = ({
  ref,
  children,
  className,
  ...props
}) => {
  const testId = useTestId('edit-error');
  const { invalid, error } = useAttributeEdit();
  const message = children ?? error;

  if (!invalid || !message) return null;

  return (
    <div
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='attribute-edit-error'
      className={cn('flex items-center gap-4 pt-4', className)}
    >
      <OctagonAlert size='md' className='shrink-0 text-icon-danger' />
      <Text size='sm' color='danger'>
        {message}
      </Text>
    </div>
  );
};

AttributeEditError.displayName = 'AttributeEditError';
