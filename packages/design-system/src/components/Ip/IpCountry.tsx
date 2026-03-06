import type { FC } from 'react';
import { Country, type CountryCode, CountryFlag } from '../Country';

export interface IpCountryProps {
  code: CountryCode;
}

export const IpCountry: FC<IpCountryProps> = ({ code }) => (
  <Country code={code} size='medium'>
    <CountryFlag />
  </Country>
);

IpCountry.displayName = 'IpCountry';
