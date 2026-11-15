import * as z from 'zod';
import { Heading } from '@wallarm-org/design-system/Heading';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { defineComponent } from '../core/define';
import { FieldList, recordField, VALUE_TYPES_HELP } from '../render/cells';

export const KeyValueListComponent = defineComponent({
  name: 'KeyValueList',
  description: `Label–value lines describing ONE record: an attack, a host, a rule. For several records side by side use Table. fields lists the lines in order, each reading record[key]; record is usually bound to the app data. Field ${VALUE_TYPES_HELP} A field the record lacks shows a dash.`,
  props: z.object({
    title: z.string().optional(),
    fields: z.array(recordField),
    record: z.looseObject({}).describe('The object the fields read, e.g. bound to the app data'),
  }),
  Skeleton: () => (
    <div className='flex flex-col gap-6'>
      <Skeleton width='50%' height='20px' transparent={false} />
      <Skeleton width='70%' height='20px' transparent={false} />
      <Skeleton width='60%' height='20px' transparent={false} />
    </div>
  ),
  View: ({ props }) => (
    <div className='flex min-w-0 flex-col gap-8'>
      {props.title && (
        <Heading size='md' weight='medium'>
          {props.title}
        </Heading>
      )}
      <FieldList fields={props.fields} record={props.record} />
    </div>
  ),
});
