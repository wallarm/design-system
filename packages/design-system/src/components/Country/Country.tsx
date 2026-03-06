import type { ComponentProps, FC, ReactNode, Ref } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { CountryContext } from './CountryContext';
import { type CountryCode, countries } from './countries';

export const countryVariants = cva('inline-flex items-center gap-6 w-fit', {
  variants: {
    size: {
      small: '',
      medium: '',
    },
  },
});

type CountryVariantsProps = VariantProps<typeof countryVariants>;

type CountryNativeProps = Omit<ComponentProps<'div'>, 'children'>;

interface CountryBaseProps {
  ref?: Ref<HTMLDivElement>;
  asChild?: boolean;
  code: CountryCode;
  children?: ReactNode;
}

export type CountryProps = CountryNativeProps & CountryVariantsProps & CountryBaseProps;

export const Country: FC<CountryProps> = ({
  ref,
  asChild = false,
  code,
  size = 'medium',
  className,
  children,
  ...props
}) => {
  const countryData = countries[code];

  const Comp = asChild ? Slot : 'div';

  return (
    <CountryContext.Provider value={{ code, size: size ?? 'medium', countryData }}>
      <Comp
        {...props}
        ref={ref}
        data-slot='country'
        className={cn(countryVariants({ size }), className)}
      >
        {children}
      </Comp>
    </CountryContext.Provider>
  );
};

Country.displayName = 'Country';
