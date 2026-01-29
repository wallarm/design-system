import type { ElementType, FC, Ref } from 'react';

import { Slot } from '@radix-ui/react-slot';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '../../utils/cn';
import { hasNonTextEnd } from '../../utils/hasNonTextEnd';
import { isIconOnly } from '../../utils/isIconOnly';
import { Loader } from '../Loader';
import type { PolymorphicComponentProps } from '../Polymorphic';

import { buttonBaseVariants } from './classes';

type ButtonBaseVariantProps = Omit<
  VariantProps<typeof buttonBaseVariants>,
  'iconOnly' | 'hasNonTextEnd'
>;

type ButtonBaseBaseProps = {
  asChild?: boolean;
  loading?: boolean;
  ref?: Ref<HTMLElement>;
};

export type ButtonBaseProps<C extends ElementType = 'button'> =
  PolymorphicComponentProps<C, ButtonBaseVariantProps & ButtonBaseBaseProps>;

export const ButtonBase: FC<
  PolymorphicComponentProps<
    ElementType,
    ButtonBaseVariantProps & ButtonBaseBaseProps
  >
> = ({
  as = 'button',
  size = 'large',
  loading = false,
  disabled = false,
  asChild = false,
  fullWidth = false,
  children,
  className,
  ref,
  ...props
}) => {
  const Comp = asChild ? Slot : as;

  const isDisabled = loading || disabled || false;

  return (
    <Comp
      className={cn(
        buttonBaseVariants({
          size,
          iconOnly: isIconOnly(children),
          hasNonTextEnd: hasNonTextEnd(children),
          fullWidth,
          loading,
        }),
        className,
      )}
      ref={ref}
      disabled={isDisabled}
      data-loading={loading ? 'true' : undefined}
      {...props}
    >
      {loading ? (
        <>
          <span className="items-center justify-center opacity-0">
            {children}
          </span>

          <span className="flex items-center justify-center w-full h-full absolute top-0 right-0 bottom-0 left-0">
            <Loader size="md" />
          </span>
        </>
      ) : (
        children
      )}
    </Comp>
  );
};

ButtonBase.displayName = 'ButtonBase';
