import type { ButtonHTMLAttributes, FC, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils/cn';
import { linkVariants } from '../Link';

type FieldActionNativeProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'color' | 'disabled'
>;

interface FieldActionBaseProps {
  asChild?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

type FieldActionProps = FieldActionNativeProps & FieldActionBaseProps;

export const FieldAction: FC<FieldActionProps> = ({ asChild = false, ...props }) => {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      {...props}
      className={cn(
        linkVariants({ type: 'default', weight: 'medium', size: 'sm' }),
        'ml-auto hover:decoration-transparent active:decoration-transparent',
      )}
    />
  );
};

FieldAction.displayName = 'FieldAction';
