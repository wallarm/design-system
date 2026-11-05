import type { SampleValue } from '@wallarm-org/rules-lib';
import { takesValue } from '@wallarm-org/rules-lib/ui';
import type { PointSelectorValue } from './types';

/** What stands at the value's place in a sample request: the value the
 *  condition looks for, read the way the condition reads it; nothing (a
 *  placeholder) until a condition is chosen. */
export const sampleValueOf = (v: PointSelectorValue): SampleValue | undefined => {
  const text = v.value;
  if (!v.condition || (takesValue(v.condition) && text === '')) return undefined;
  switch (v.condition) {
    case 'equal':
      return { text };
    case 'contains':
      return { text: `…${text}…` };
    case 'startswith':
      return { text: `${text}…` };
    case 'endswith':
      return { text: `…${text}` };
    case 'nequal':
      return { text: `anything but "${text}"`, placeholder: true };
    case 'regexp':
      return { text: `matches /${text}/`, placeholder: true };
    case 'nregexp':
      return { text: `does not match /${text}/`, placeholder: true };
    case 'exists':
      return { text: 'any value', placeholder: true };
    case 'absent':
      return { text: 'not sent', placeholder: true };
    default:
      return undefined;
  }
};
