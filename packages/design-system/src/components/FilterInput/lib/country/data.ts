import { countries } from '../../../Country/countries';
import type { FieldValueOption } from '../../types';

/**
 * ISO 3166-1 alpha-2 country options, derived from the shared `countries` map
 * so the country filter does not depend on the backend shipping the full list.
 * `value` is the alpha-2 code, `label` the name as stored in `countries`.
 * Sorted by label.
 */
export const COUNTRY_OPTIONS: FieldValueOption[] = Object.entries(countries)
  .map(([code, { name }]) => ({ value: code, label: name }))
  .sort((a, b) => a.label.localeCompare(b.label, 'en'));
