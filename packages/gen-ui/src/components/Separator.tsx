import * as z from 'zod';
import { Separator } from '@wallarm-org/design-system/Separator';
import { defineComponent } from '../core/define';

export const SeparatorComponent = defineComponent({
  name: 'Separator',
  description:
    'A thin line between two groups of content inside one Card, Section or Drawer. Never between Sections or as decoration.',
  props: z.object({}),
  Skeleton: () => <Separator spacing={4} />,
  View: () => <Separator decorative={false} spacing={4} />,
});
