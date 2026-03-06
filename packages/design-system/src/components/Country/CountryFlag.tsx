import type { ComponentProps, FC } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { useCountryContext } from './CountryContext';

export const countryFlagVariants = cva('shrink-0 rounded-full object-cover', {
  variants: {
    size: {
      small: 'size-16',
      medium: 'size-20',
    },
  },
});

export type CountryFlagProps = Omit<ComponentProps<'img'>, 'src' | 'alt'>;

export const CountryFlag: FC<CountryFlagProps> = ({ className, ...props }) => {
  const { code, size, countryData } = useCountryContext();

  if (!countryData?.flag) return null;

  return (
    <img
      {...props}
      src={countryData.flag}
      alt={countryData.name ?? code}
      data-slot='country-flag'
      className={cn(countryFlagVariants({ size }), className)}
    />
  );
};
