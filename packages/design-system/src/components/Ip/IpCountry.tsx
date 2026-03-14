import type { FC } from 'react';
import { useTestId } from '../../utils/testId';
import { Country, type CountryCode, CountryFlag } from '../Country';

export interface IpCountryProps {
  code: CountryCode;
}

export const IpCountry: FC<IpCountryProps> = ({ code }) => {
  const testId = useTestId('country');

  return (
    <Country code={code} size='medium' data-testid={testId}>
      <CountryFlag />
    </Country>
  );
};

IpCountry.displayName = 'IpCountry';
