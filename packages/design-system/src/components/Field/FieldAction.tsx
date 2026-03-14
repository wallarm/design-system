import type { ButtonHTMLAttributes, FC, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils/cn';
import { useTestId } from '../../utils/testId';
import { linkVariants } from '../Link';

type FieldActionNativeProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'color' | 'disabled'
>;

export interface FieldActionBaseProps {
  asChild?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

type FieldActionProps = FieldActionNativeProps & FieldActionBaseProps;

export const FieldAction: FC<FieldActionProps> = ({ asChild = false, ...props }) => {
  const testId = useTestId('action');
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      {...props}
      data-testid={testId}
      className={cn(
        linkVariants({ type: 'default', weight: 'medium', size: 'sm' }),
        'ml-auto hover:decoration-transparent active:decoration-transparent',
      )}
    />
  );
};

FieldAction.displayName = 'FieldAction';
