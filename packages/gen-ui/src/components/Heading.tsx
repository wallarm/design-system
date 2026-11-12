import { z } from 'zod';
import { Heading, type HeadingProps } from '@wallarm-org/design-system/Heading';
import { defineComponent, subsetOf, type Values } from '../define';

export const HeadingComponent = defineComponent({
  name: 'Heading',
  description: 'A page or block title. For a titled group of content, prefer Section.',
  props: z.object({
    text: z.string(),
    size: z.enum(subsetOf<Values<HeadingProps['size']>>()(['md', 'lg', 'xl', '2xl'])).optional(),
  }),
  View: ({ props }) => (
    <Heading size={props.size ?? 'lg'} weight='medium'>
      {props.text}
    </Heading>
  ),
});
