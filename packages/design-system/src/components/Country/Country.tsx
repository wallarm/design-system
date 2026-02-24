import type { ComponentProps, FC } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { type CountryCode, countries } from './countries';

const countryVariants = cva('inline-flex items-center gap-6 w-fit', {
  variants: {
    size: {
      small: '',
      medium: '',
    },
  },
});

const flagVariants = cva('shrink-0 rounded-full object-cover', {
  variants: {
    size: {
      small: 'size-16',
      medium: 'size-20',
    },
  },
});

const nameVariants = cva('font-sans-display truncate', {
  variants: {
    size: {
      small: 'text-xs',
      medium: 'text-sm',
    },
  },
});

type CountryVariantsProps = VariantProps<typeof countryVariants>;

type CountryNativeProps = Omit<ComponentProps<'div'>, 'children'>;

interface CountryBaseProps {
  code: string;
  flag?: boolean;
  name?: boolean;
}

export type CountryProps = CountryNativeProps & CountryVariantsProps & CountryBaseProps;

export const Country: FC<CountryProps> = ({
  code,
  flag = true,
  name = true,
  size = 'medium',
  className,
  ...props
}) => {
  const normalizedCode = code.toUpperCase() as CountryCode;
  const countryData = countries[normalizedCode];

  if (!flag && !name) return code;

  return (
    <div {...props} data-slot='country' className={cn(countryVariants({ size }), className)}>
      {flag && countryData?.flag && (
        <img
          src={countryData.flag}
          alt={countryData.name ?? code}
          className={flagVariants({ size })}
        />
      )}
      {name && <span className={nameVariants({ size })}>{countryData?.name ?? code}</span>}
    </div>
  );
};
