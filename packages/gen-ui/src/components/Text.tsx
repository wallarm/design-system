import { z } from 'zod';
import { Text, type TextProps } from '@wallarm-org/design-system/Text';
import { defineComponent, subsetOf, type Values } from '../define';

export const TextComponent = defineComponent({
  name: 'Text',
  description: 'A paragraph of plain text (no markdown).',
  props: z.object({
    text: z.string(),
    tone: z
      .enum(subsetOf<Values<TextProps['color']>>()(['primary', 'secondary', 'danger']))
      .optional(),
  }),
  View: ({ props }) => <Text color={props.tone ?? 'primary'}>{props.text}</Text>,
});
