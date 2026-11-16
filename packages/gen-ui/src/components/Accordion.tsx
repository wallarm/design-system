import { Children } from 'react';
import * as z from 'zod';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  type AccordionVariant,
} from '@wallarm-org/design-system/Accordion';
import { Skeleton } from '@wallarm-org/design-system/Skeleton';
import { VStack } from '@wallarm-org/design-system/Stack';
import { allOf, defineComponent } from '../core/define';

export const AccordionComponent = defineComponent({
  name: 'Accordion',
  description:
    'Collapsible sections for long details the user expands on demand (a per-rule or per-attack breakdown). labels[i] is the header of the i-th child; give one child per label.',
  props: z.object({
    labels: z.array(z.string()).min(1),
    multiple: z.boolean().optional().describe('Several sections open at once.'),
    openFirst: z.boolean().optional().describe('Start with the first section open.'),
    variant: z
      .enum(allOf<AccordionVariant>()(['primary', 'secondary', 'section']))
      .optional()
      .describe('section: bordered panels; secondary: compact, for nested groups.'),
  }),
  hasChildren: true,
  Skeleton: () => (
    <VStack gap={8} align='stretch' fullWidth>
      <Skeleton width='100%' height='40px' transparent={false} />
      <Skeleton width='100%' height='40px' transparent={false} />
    </VStack>
  ),
  View: ({ props, children }) => {
    const panels = Children.toArray(children);
    return (
      // defaultValue is read once, on mount: an openFirst that streams in later remounts it.
      <Accordion
        key={String(props.openFirst ?? false)}
        variant={props.variant}
        multiple={props.multiple}
        defaultValue={props.openFirst ? ['0'] : []}
      >
        {props.labels.map((label, i) => (
          <AccordionItem key={String(i)} value={String(i)}>
            <AccordionTrigger>{label}</AccordionTrigger>
            <AccordionContent>{panels[i]}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  },
});
