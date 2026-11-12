import * as z from 'zod';
import { Heading } from '@wallarm-org/design-system/Heading';
import { VStack } from '@wallarm-org/design-system/Stack';
import { Text } from '@wallarm-org/design-system/Text';
import { defineComponent } from '../core/define';

export const SectionComponent = defineComponent({
  name: 'Section',
  description:
    'A titled block of a page or dashboard: a heading, an optional one-line subtitle, then its children. Use one per topic (Traffic, Threats, Endpoints).',
  props: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
  }),
  hasChildren: true,
  View: ({ props, children }) => (
    <VStack gap={12} align='stretch' fullWidth>
      <VStack gap={2} align='start'>
        <Heading size='lg' weight='medium'>
          {props.title}
        </Heading>
        {props.subtitle && <Text color='secondary'>{props.subtitle}</Text>}
      </VStack>
      {children}
    </VStack>
  ),
});
