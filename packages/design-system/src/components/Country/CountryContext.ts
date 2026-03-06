import { createContext, useContext } from 'react';
import type { CountryCode, countries } from './countries';
import type { Size } from './types';

export interface CountryContextValue {
  code: CountryCode;
  size: Size;
  countryData: (typeof countries)[CountryCode] | undefined;
}

export const CountryContext = createContext<CountryContextValue | null>(null);

export function useCountryContext(): CountryContextValue {
  const ctx = useContext(CountryContext);
  if (!ctx) {
    throw new Error('useCountryContext must be used within a Country component');
  }
  return ctx;
}
