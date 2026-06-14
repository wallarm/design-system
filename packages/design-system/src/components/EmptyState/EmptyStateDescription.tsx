import type { FC, HTMLAttributes, ReactNode, Ref } from 'react';
import { useTestId } from '../../utils/testId';
import { Text } from '../Text';

export interface EmptyStateDescriptionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

export const EmptyStateDescription: FC<EmptyStateDescriptionProps> = ({
  ref,
  children,
  ...props
}) => {
  const testId = useTestId('description');

  return (
    <Text
      {...props}
      ref={ref}
      data-testid={testId}
      data-slot='empty-state-description'
      size='xs'
      color='secondary'
      align='center'
    >
      {children}
    </Text>
  );
};

EmptyStateDescription.displayName = 'EmptyStateDescription';
