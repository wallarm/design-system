import * as z from 'zod';
import { Card, CardContent } from '@wallarm-org/design-system/Card';
import { defineComponent } from '../core/define';

export const CardComponent = defineComponent({
  name: 'Card',
  description: 'A bordered surface that groups related content.',
  props: z.object({}),
  hasChildren: true,
  View: ({ children }) => (
    <Card className='h-full'>
      <CardContent>{children}</CardContent>
    </Card>
  ),
});
