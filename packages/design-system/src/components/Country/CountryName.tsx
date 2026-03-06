import type { ComponentProps, FC } from 'react';
import {
  OverflowTooltip,
  OverflowTooltipContent,
  OverflowTooltipTrigger,
} from '../OverflowTooltip';
import { Text } from '../Text';
import { useCountryContext } from './CountryContext';

export type CountryNameProps = ComponentProps<'span'>;

export const CountryName: FC<CountryNameProps> = ({ className, ...props }) => {
  const { code, size, countryData } = useCountryContext();

  return (
    <OverflowTooltip>
      <OverflowTooltipTrigger asChild>
        <Text size={size === 'small' ? 'xs' : 'sm'} data-slot='country-name' lineClamp={1} truncate>
          {countryData?.name ?? code}
        </Text>
      </OverflowTooltipTrigger>
      <OverflowTooltipContent>{countryData?.name ?? code}</OverflowTooltipContent>
    </OverflowTooltip>
  );
};

CountryName.displayName = 'CountryName';
