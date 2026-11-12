import * as z from 'zod';
import { Heading, type HeadingProps } from '@wallarm-org/design-system/Heading';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { defineComponent, subsetOf, type Values } from '../core/define';

export const HeadingComponent = defineComponent({
  name: 'Heading',
  description: 'A page or block title. For a titled group of content, prefer Section.',
  props: z.object({
    text: z.string(),
    size: z.enum(subsetOf<Values<HeadingProps['size']>>()(['md', 'lg', 'xl', '2xl'])).optional(),
  }),
  Skeleton: () => <Skeleton width='40%' height='24px' transparent={false} />,
  View: ({ props }) => (
    <Heading size={props.size ?? 'lg'} weight='medium'>
      {props.text}
    </Heading>
  ),
});
