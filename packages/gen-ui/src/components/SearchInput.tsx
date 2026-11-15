import * as z from 'zod';
import { SearchInput } from '@wallarm-org/design-system/SearchInput';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { defineComponent } from '../core/define';

export const SearchInputComponent = defineComponent({
  name: 'SearchInput',
  description:
    'A search box the user types a query into to filter or find something: hosts, rules, events. It has no visible label. Bind value two-way to a path; the Button that runs the search sends that path in its action context.',
  props: z.object({
    label: z.string().describe('Accessible name read by screen readers, not shown'),
    value: z.string().optional().describe('Bind two-way; a literal is the starting query'),
    placeholder: z.string().optional().describe('"Search" by default'),
  }),
  bindable: ['value'],
  Skeleton: () => <Skeleton width='100%' height='32px' transparent={false} />,
  View: ({ props, set }) => (
    <SearchInput
      aria-label={props.label}
      value={props.value ?? ''}
      placeholder={props.placeholder}
      autoComplete='off'
      onChange={next => set('value', next)}
    />
  ),
});
