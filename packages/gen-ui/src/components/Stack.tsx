import { z } from 'zod';
import { Stack, type StackProps } from '@wallarm-org/design-system/Stack';
import { defineComponent } from '../core/define';

/** The gaps the catalog offers, each mapped to a DS gap: a gap the DS drops fails typecheck. */
export const GAPS = ['4', '8', '12', '16', '24'] as const;
export const GAP: Record<(typeof GAPS)[number], NonNullable<StackProps['gap']>> = {
  '4': 4,
  '8': 8,
  '12': 12,
  '16': 16,
  '24': 24,
};

export const StackComponent = defineComponent({
  name: 'Stack',
  description: 'Lays children out in a row or a column. Use a row for side-by-side metrics.',
  props: z.object({
    direction: z.enum(['row', 'column']).optional().describe('Default column'),
    gap: z.enum(GAPS).optional().describe('Space between children, px. Default 12'),
  }),
  hasChildren: true,
  View: ({ props, children }) => {
    const direction = props.direction ?? 'column';
    // A row wraps onto the next line when narrow. A column never wraps: squeezed by a fixed-height
    // parent (a chat message) it would move the rest of its children into a new column beside it.
    return (
      <Stack
        direction={direction}
        gap={GAP[props.gap ?? '12']}
        wrap={direction === 'row' ? 'wrap' : 'nowrap'}
        fullWidth
      >
        {children}
      </Stack>
    );
  },
});
